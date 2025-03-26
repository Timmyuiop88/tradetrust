import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    // Get the request body
    const body = await request.json()
    console.log('Oxapay webhook payload:', body)
    
    // Extract payment information - handle different possible field names
    const trackId = body.trackId || body.track_id || ''
    const status = body.status || ''
    
    if (!trackId) {
      console.error('No trackId found in webhook payload:', body)
      return NextResponse.json({ error: 'Missing trackId' }, { status: 400 })
    }
    
    // Find the payment in our database
    const payment = await prisma.cryptoPayment.findFirst({
      where: { 
        paymentId: trackId,
        provider: 'OXAPAY'
      },
      include: {
        transaction: true // Include the linked transaction
      }
    })
    
    if (!payment) {
      console.error(`Payment not found: ${trackId}`)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    
    // Map Oxapay status to our status
    let paymentStatus = 'WAITING'
    let transactionStatus = 'PENDING'
    
    switch (status.toLowerCase()) {
      case 'paid':
        paymentStatus = 'COMPLETED'
        transactionStatus = 'COMPLETED'
        break
      case 'confirming':
        paymentStatus = 'CONFIRMED'
        transactionStatus = 'PENDING'
        break
      case 'waiting':
      case 'new':
        paymentStatus = 'WAITING'
        transactionStatus = 'PENDING'
        break
      case 'expired':
      case 'failed':
      case 'canceled':
      case 'cancelled':
        paymentStatus = 'FAILED'
        transactionStatus = 'FAILED'
        break
      default:
        paymentStatus = 'WAITING'
        transactionStatus = 'PENDING'
    }
    
    // Update payment status in our database
    await prisma.cryptoPayment.update({
      where: { id: payment.id },
      data: {
        paymentStatus,
        updatedAt: new Date()
      }
    })
    
    // Update transaction status
    if (payment.transactionId) {
      await prisma.transaction.update({
        where: { id: payment.transactionId },
        data: {
          status: transactionStatus,
          description: paymentStatus === 'COMPLETED' 
            ? `Deposit via Oxapay (${payment.currency})` 
            : `Pending deposit via Oxapay (${payment.currency})`,
          completedAt: paymentStatus === 'COMPLETED' ? new Date() : null
        }
      })
    }
    
    // If payment is completed, add funds to user's balance
    if (paymentStatus === 'COMPLETED' && payment.paymentStatus !== 'COMPLETED') {
      await processCompletedPayment(payment)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing Oxapay webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook', message: error.message },
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