import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Cryptomus API configuration
const CRYPTOMUS_MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID
const CRYPTOMUS_PAYMENT_KEY = process.env.CRYPTOMUS_PAYMENT_KEY

export async function POST(request) {
  try {
    // Get the raw request body for signature verification
    const rawBody = await request.text()
    const body = JSON.parse(rawBody)
    
    // Verify signature
    const sign = request.headers.get('sign')
    
    if (!sign) {
      console.error('Missing signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }
    
    const calculatedSign = crypto
      .createHash('md5')
      .update(Buffer.from(rawBody).toString('base64') + CRYPTOMUS_PAYMENT_KEY)
      .digest('hex')
    
    if (calculatedSign !== sign) {
      console.error('Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    // Extract payment information
    const {
      uuid,
      order_id,
      status,
      amount,
      currency,
      payment_amount,
      payment_currency
    } = body
    
    // Find the payment in our database
    const payment = await prisma.cryptoPayment.findFirst({
      where: { paymentId: uuid }
    })
    
    if (!payment) {
      console.error(`Payment not found: ${uuid}`)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    
    // Map Cryptomus status to our status
    let paymentStatus = 'WAITING'
    
    switch (status) {
      case 'paid':
        paymentStatus = 'COMPLETED'
        break
      case 'partially_paid':
        paymentStatus = 'CONFIRMED'
        break
      case 'confirm_check':
      case 'check':
        paymentStatus = 'WAITING'
        break
      case 'expired':
      case 'canceled':
        paymentStatus = 'FAILED'
        break
      default:
        paymentStatus = 'WAITING'
    }
    
    // Update payment status in our database
    await prisma.cryptoPayment.update({
      where: { id: payment.id },
      data: {
        paymentStatus,
        updatedAt: new Date()
      }
    })
    
    // Process completed payment
    if (paymentStatus === 'COMPLETED' && payment.paymentStatus !== 'COMPLETED') {
      // Handle payment completion (add funds to user balance)
      await processCompletedPayment(payment)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
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