import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Oxapay API configuration
const OXAPAY_MERCHANT_ID = process.env.OXAPAY_MERCHANT_ID
const OXAPAY_API_URL = 'https://api.oxapay.com/merchants'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { amount, currency = 'USDT' } = await request.json()
    
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }
    
    // Create a unique order ID
    const orderId = `deposit_${session.user.id}_${Date.now()}`
    
    // Create payment in Oxapay
    const response = await fetch(`${OXAPAY_API_URL}/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchant: OXAPAY_MERCHANT_ID,
        amount: amount,
        currency: currency,
        lifeTime: 60, // 60 minutes payment window
        feePaidByPayer: 0, // We cover the fee
        underPaidCover: 1, // Cover underpayments up to 1%
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/oxapay/webhook`,
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/balance?payment=success`,
        description: `Deposit of $${amount} to account balance`,
        orderId: orderId,
        email: session.user.email || 'user@example.com'
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Oxapay API error:', errorData)
      throw new Error(errorData.message || 'Failed to create payment')
    }
    
    const paymentData = await response.json()
    console.log('Oxapay payment response:', paymentData)
    
    // Extract the payment ID from the response
    const trackId = paymentData.trackId || paymentData.track_id || ''
    
    if (!trackId) {
      console.error('No trackId found in Oxapay response:', paymentData)
      throw new Error('Failed to get trackId from Oxapay')
    }
    
    // Extract the payment link - this is what the user wants to use
    const payLink = paymentData.payLink || paymentData.pay_link || paymentData.paymentLink || paymentData.payment_link || ''
    
    if (!payLink) {
      console.error('No payment link found in Oxapay response:', paymentData)
      throw new Error('Failed to get payment link from Oxapay')
    }
    
    // Get or create user balance
    let balance = await prisma.balance.findUnique({
      where: { userId: session.user.id }
    })
    
    if (!balance) {
      balance = await prisma.balance.create({
        data: {
          userId: session.user.id,
          buyingBalance: 0,
          sellingBalance: 0
        }
      })
    }
    
    // Create a transaction record with PENDING status
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        balanceId: balance.id,
        amount: amount,
        type: 'DEPOSIT',
        description: `Pending deposit via Oxapay (${currency})`,
        status: 'PENDING',
        createdAt: new Date()
      }
    })
    
    // Store payment information in database
    await prisma.cryptoPayment.create({
      data: {
        userId: session.user.id,
        paymentId: trackId, // Use trackId as the payment identifier
        paymentStatus: 'WAITING',
        amount: amount,
        cryptoAmount: amount, // We don't have the crypto amount yet
        currency: currency,
        address: '', // We're using payment link, not direct wallet address
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: 'OXAPAY',
        transactionId: transaction.id // Link to the transaction record
      }
    })
    
    // Return the payment link and trackId to the client
    return NextResponse.json({
      success: true,
      paymentId: trackId,
      transactionId: transaction.id,
      paymentUrl: payLink, // This is the payment link the user wants
      amount: amount,
      currency: currency
    })
  } catch (error) {
    console.error('Error creating Oxapay payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment', message: error.message },
      { status: 500 }
    )
  }
} 