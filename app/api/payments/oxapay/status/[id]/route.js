import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Oxapay API configuration
const OXAPAY_MERCHANT_ID = process.env.OXAPAY_MERCHANT_ID
const OXAPAY_API_URL = 'https://api.oxapay.com/merchants'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const trackId = params.id
    
    if (!trackId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }
    
    // Check if payment exists in our database
    const payment = await prisma.cryptoPayment.findFirst({
      where: {
        paymentId: trackId,
        userId: session.user.id,
        provider: 'OXAPAY'
      },
      include: {
        transaction: true // Include the linked transaction
      }
    })
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    
    // If payment is already confirmed or completed in our database, return that status
    if (['CONFIRMED', 'COMPLETED'].includes(payment.paymentStatus)) {
      return NextResponse.json({ 
        status: payment.paymentStatus,
        transactionId: payment.transactionId
      })
    }
    
    // Check payment status from Oxapay API using the correct endpoint
    const response = await fetch(`${OXAPAY_API_URL}/inquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchant: OXAPAY_MERCHANT_ID,
        trackId: trackId // Use trackId for status check
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Oxapay API error:', errorData)
      throw new Error(errorData.message || 'Failed to check payment status')
    }
    
    const paymentData = await response.json()
    console.log('Oxapay inquiry response:', paymentData)
    
    // Check if the request was successful
    if (paymentData.result !== 100) {
      console.error('Oxapay API error:', paymentData)
      throw new Error(paymentData.message || 'Failed to check payment status')
    }
    
    // Map Oxapay status to our status
    let status = 'WAITING'
    let transactionStatus = 'PENDING'
    
    // Get status from the response
    const oxaStatus = paymentData.status || ''
    
    switch (oxaStatus.toLowerCase()) {
      case 'paid':
        status = 'COMPLETED'
        transactionStatus = 'COMPLETED'
        break
      case 'confirming':
        status = 'CONFIRMED'
        transactionStatus = 'PENDING'
        break
      case 'waiting':
      case 'new':
        status = 'WAITING'
        transactionStatus = 'PENDING'
        break
      case 'expired':
      case 'failed':
      case 'canceled':
      case 'cancelled':
        status = 'FAILED'
        transactionStatus = 'FAILED'
        break
      default:
        status = 'WAITING'
        transactionStatus = 'PENDING'
    }
    
    // Update payment status in our database
    await prisma.cryptoPayment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: status,
        updatedAt: new Date()
      }
    })
    
    // Update transaction status
    if (payment.transactionId) {
      await prisma.transaction.update({
        where: { id: payment.transactionId },
        data: {
          status: transactionStatus,
          description: status === 'COMPLETED' 
            ? `Deposit via Oxapay (${payment.currency})` 
            : `Pending deposit via Oxapay (${payment.currency})`,
          completedAt: status === 'COMPLETED' ? new Date() : null
        }
      })
    }
    
    // If payment is completed, add funds to user's balance
    if (status === 'COMPLETED' && payment.paymentStatus !== 'COMPLETED') {
      // Process the completed payment
      await processCompletedPayment(payment)
    }
    
    return NextResponse.json({ 
      status,
      transactionId: payment.transactionId
    })
  } catch (error) {
    console.error('Error checking Oxapay payment status:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status', message: error.message },
      { status: 500 }
    )
  }
}

async function processCompletedPayment(payment) {
  // Get user balance
  const balance = await prisma.balance.findUnique({
    where: { userId: payment.userId }
  })
  
  if (!balance) {
    // Create balance if it doesn't exist
    await prisma.balance.create({
      data: {
        userId: payment.userId,
        buyingBalance: payment.amount,
        sellingBalance: 0
      }
    })
  } else {
    // Update existing balance
    await prisma.balance.update({
      where: { id: balance.id },
      data: {
        buyingBalance: {
          increment: payment.amount
        }
      }
    })
  }
  
  // Send deposit confirmation email if available
  try {
    const { sendDepositConfirmation, notifyTransactionUpdate } = require('@/lib/services/notificationService')
    
    if (payment.transactionId) {
      await sendDepositConfirmation(payment.userId, payment.transactionId)
      await notifyTransactionUpdate(payment.userId, 'DEPOSIT_COMPLETED', { id: payment.transactionId })
    }
  } catch (error) {
    console.error('Error sending notifications:', error)
  }
} 