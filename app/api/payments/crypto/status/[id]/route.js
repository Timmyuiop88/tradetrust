import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Cryptomus API configuration
const CRYPTOMUS_MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID
const CRYPTOMUS_PAYMENT_KEY = process.env.CRYPTOMUS_PAYMENT_KEY
const CRYPTOMUS_API_URL = 'https://api.cryptomus.com/v1'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const paymentId = params.id
    
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }
    
    // Check if payment exists in our database
    const payment = await prisma.cryptoPayment.findFirst({
      where: {
        paymentId: paymentId,
        userId: session.user.id
      }
    })
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    
    // If payment is already confirmed or completed in our database, return that status
    if (['CONFIRMED', 'COMPLETED'].includes(payment.paymentStatus)) {
      return NextResponse.json({ status: payment.paymentStatus })
    }
    
    // Prepare data for Cryptomus API
    const requestData = {
      uuid: paymentId
    }
    
    // Create signature
    const requestDataString = JSON.stringify(requestData)
    const sign = crypto
      .createHash('md5')
      .update(Buffer.from(requestDataString).toString('base64') + CRYPTOMUS_PAYMENT_KEY)
      .digest('hex')
    
    // Check payment status from Cryptomus API
    const response = await fetch(`${CRYPTOMUS_API_URL}/payment/info`, {
      method: 'POST',
      headers: {
        'merchant': CRYPTOMUS_MERCHANT_ID,
        'sign': sign,
        'Content-Type': 'application/json'
      },
      body: requestDataString
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Cryptomus API error:', errorData)
      throw new Error(errorData.message || 'Failed to check payment status')
    }
    
    const responseData = await response.json()
    const paymentInfo = responseData.result
    
    // Map Cryptomus status to our status
    let status = 'WAITING'
    
    switch (paymentInfo.status) {
      case 'paid':
        status = 'COMPLETED'
        break
      case 'partially_paid':
        status = 'CONFIRMED'
        break
      case 'confirm_check':
      case 'check':
        status = 'WAITING'
        break
      case 'expired':
      case 'canceled':
        status = 'FAILED'
        break
      default:
        status = 'WAITING'
    }
    
    // Update payment status in our database
    await prisma.cryptoPayment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: status,
        updatedAt: new Date()
      }
    })
    
    // Process completed payment
    if (status === 'COMPLETED' && payment.paymentStatus !== 'COMPLETED') {
      // Handle payment completion (add funds to user balance)
      await processCompletedPayment(payment)
    }
    
    return NextResponse.json({ status })
  } catch (error) {
    console.error('Error checking payment status:', error)
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
  
  // Create transaction record
  await prisma.transaction.create({
    data: {
      userId: payment.userId,
      balanceId: balance?.id,
      amount: payment.amount,
      type: 'DEPOSIT',
      description: `Deposit via ${payment.currency} (${payment.cryptoAmount} ${payment.currency})`,
      status: 'COMPLETED',
      createdAt: new Date()
    }
  })
} 