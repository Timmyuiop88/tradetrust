import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Oxapay API configuration
const OXAPAY_MERCHANT_API_KEY = process.env.OXAPAY_MERCHANT_ID
const OXAPAY_PAYOUT_API_KEY = process.env.OXAPAY_PAYOUT_API_KEY 

export async function POST(request) {
  try {
    // Get the raw request body for signature verification
    const rawBody = await request.text()
    let data = null
    
    try {
      data = JSON.parse(rawBody)
    } catch (error) {
      console.error('Invalid JSON data:', rawBody)
      return NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 })
    }
    
    console.log('Oxapay webhook payload:', data)
    
    // Check if API keys are configured
    if (!OXAPAY_MERCHANT_API_KEY) {
      console.warn('OXAPAY_API_KEY is not configured. Skipping signature verification.')
      // Continue processing without verification for development/testing
    } else {
      // Determine which API key to use based on the callback type
      const apiSecretKey = (data.type === 'payment') 
        ? OXAPAY_MERCHANT_API_KEY 
        : OXAPAY_PAYOUT_API_KEY
      
      // Get the HMAC signature from headers
      const hmacHeader = request.headers.get('hmac')
      
      if (!hmacHeader) {
        console.error('No HMAC signature in webhook request')
        return NextResponse.json({ error: 'Missing HMAC signature' }, { status: 400 })
      }
      
      // Calculate the expected HMAC signature
      const calculatedHmac = crypto
        .createHmac('sha512', apiSecretKey)
        .update(rawBody)
        .digest('hex')
      
      // Verify the HMAC signature
      if (calculatedHmac !== hmacHeader) {
        console.error('Invalid HMAC signature')
        console.error('Received:', hmacHeader)
        console.error('Calculated:', calculatedHmac)
        return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 400 })
      }
    }
    
    // HMAC signature is valid or skipped, process the callback data based on the type
    if (data.type === 'payment') {
      await handlePaymentCallback(data)
    } else if (data.type === 'payout') {
      await handlePayoutCallback(data)
    } else {
      console.warn('Unknown callback type:', data.type)
    }
    
    // Return HTTP Response 200 with content "OK" as required by Oxapay
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Error processing Oxapay webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook', message: error.message },
      { status: 500 }
    )
  }
}

async function handlePaymentCallback(data) {
  try {
    // Extract payment information
    const trackId = data.trackId || ''
    const status = data.status || ''
    const amount = data.amount || 0
    const currency = data.currency || ''
    
    if (!trackId) {
      console.error('No trackId found in webhook payload:', data)
      throw new Error('Missing trackId')
    }
    
    // Find the payment in our database
    const payment = await prisma.cryptoPayment.findFirst({
      where: { 
        paymentId: trackId,
        provider: 'OXAPAY'
      }
    })
    
    if (!payment) {
      console.error(`Payment not found: ${trackId}`)
      throw new Error('Payment not found')
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
    
    console.log(`Successfully processed payment callback for trackId: ${trackId}, status: ${status}`)
  } catch (error) {
    console.error('Error handling payment callback:', error)
    throw error
  }
}

async function handlePayoutCallback(data) {
  // Implement payout handling if needed
  console.log('Received payout callback:', data)
  // For now, just log it as we don't have payout implementation yet
}

async function processCompletedPayment(payment) {
  try {
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
    
    // Send deposit confirmation email and notifications
    try {
      // Import the notification service
      const { sendDepositConfirmation } = await import('@/lib/services/notificationService')
      const { PushNotificationService } = await import('@/lib/services/pushNotificationService')
      
      if (payment.transactionId) {
        // Get the transaction details for the notification
        const transaction = await prisma.transaction.findUnique({
          where: { id: payment.transactionId }
        })
        
        if (transaction) {
          // Send email notification
          await sendDepositConfirmation(payment.userId, payment.transactionId)
          
          // Send push notification using PushNotificationService
          await PushNotificationService.notifyTransactionUpdate(
            payment.userId,
            'DEPOSIT_COMPLETED',
            transaction
          )
          
          console.log(`Deposit notifications sent for payment ${payment.paymentId}`)
        }
      }
    } catch (notificationError) {
      // Don't fail the payment processing if notifications fail
      console.error('Error sending deposit notifications:', notificationError)
    }
    
    console.log(`Successfully processed payment ${payment.paymentId} for user ${payment.userId}`)
  } catch (error) {
    console.error('Error processing completed payment:', error)
    throw error
  }
} 