import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Cryptomus API configuration
const CRYPTOMUS_MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID
const CRYPTOMUS_PAYMENT_KEY = process.env.CRYPTOMUS_PAYMENT_KEY
const CRYPTOMUS_API_URL = 'https://api.cryptomus.com/v1'

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
    
    const orderId = `deposit_${session.user.id}_${Date.now()}`
    
    // Prepare payment data
    const paymentData = {
      amount: amount.toString(),
      currency: 'USD',
      order_id: orderId,
      payment_systems: [currency],
      url_callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/crypto/webhook`,
      url_return: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/balance?payment=success`,
      url_success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/balance?payment=success`,
      is_payment_multiple: false,
      lifetime: 3600, // 1 hour payment window
      to_currency: currency
    }
    
    // Create signature for Cryptomus
    const paymentDataString = JSON.stringify(paymentData)
    const sign = crypto
      .createHash('md5')
      .update(Buffer.from(paymentDataString).toString('base64') + CRYPTOMUS_PAYMENT_KEY)
      .digest('hex')
    
    // Create payment in Cryptomus
    const response = await fetch(`${CRYPTOMUS_API_URL}/payment`, {
      method: 'POST',
      headers: {
        'merchant': CRYPTOMUS_MERCHANT_ID,
        'sign': sign,
        'Content-Type': 'application/json'
      },
      body: paymentDataString
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Cryptomus API error:', errorData)
      throw new Error(errorData.message || 'Failed to create payment')
    }
    
    const responseData = await response.json()
    const paymentInfo = responseData.result
    
    // Store payment information in database
    await prisma.cryptoPayment.create({
      data: {
        userId: session.user.id,
        paymentId: paymentInfo.uuid,
        paymentStatus: 'WAITING',
        amount: amount,
        cryptoAmount: parseFloat(paymentInfo.amount_crypto || 0),
        currency: currency,
        address: paymentInfo.wallet.address,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({
      paymentId: paymentInfo.uuid,
      paymentUrl: paymentInfo.url,
      address: paymentInfo.wallet.address,
      amount: paymentInfo.amount_crypto,
      currency: currency,
      qrCode: paymentInfo.wallet.qr
    })
  } catch (error) {
    console.error('Error creating crypto payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment', message: error.message },
      { status: 500 }
    )
  }
} 