import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Oxapay API configuration
const OXAPAY_MERCHANT_ID = process.env.OXAPAY_MERCHANT_ID
const OXAPAY_API_URL = 'https://api.oxapay.com/merchants'

export async function POST(request) {
  try {
    // Verify environment variables are set
    if (!OXAPAY_MERCHANT_ID) {
      console.error('OXAPAY_MERCHANT_ID environment variable is not set')
      return NextResponse.json(
        { error: 'Payment service configuration error', message: 'Missing API credentials' },
        { status: 500 }
      )
    }

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
    
    // Log the request payload for debugging
    const requestPayload = {
      merchant: OXAPAY_MERCHANT_ID,
      amount: amount,
      currency: currency,
      lifeTime: 60,
      feePaidByPayer: 0,
      underPaidCover: 1,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/oxapay/webhook`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/balance?payment=success`,
      description: `Deposit of $${amount} to account balance`,
      orderId: orderId,
      email: session.user.email || 'user@example.com'
    }
    
    console.log('Oxapay request payload:', JSON.stringify(requestPayload))
    
    // Create payment in Oxapay
    const response = await fetch(`${OXAPAY_API_URL}/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    })
    
    // Log the raw response for debugging
    const responseText = await response.text()
    console.log('Oxapay raw response:', responseText)
    
    // Parse the response as JSON
    let paymentData
    try {
      paymentData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse Oxapay response as JSON:', parseError)
      return NextResponse.json(
        { error: 'Invalid response from payment provider', message: 'Received non-JSON response' },
        { status: 500 }
      )
    }
    
    if (!response.ok) {
      console.error('Oxapay API error:', paymentData)
      return NextResponse.json(
        { error: 'Payment provider error', message: paymentData.message || 'Failed to create payment' },
        { status: 500 }
      )
    }
    
    console.log('Oxapay payment response:', JSON.stringify(paymentData))
    
    // Extract the payment ID from the response with more detailed logging
    const trackId = paymentData.trackId || paymentData.track_id || ''
    console.log('Extracted trackId:', trackId)
    
    if (!trackId) {
      console.error('No trackId found in Oxapay response. Full response:', JSON.stringify(paymentData))
      
      // Check if there's an error message in the response
      if (paymentData.message) {
        return NextResponse.json(
          { error: 'Payment provider error', message: paymentData.message },
          { status: 500 }
        )
      }
      
      // Check for other possible field names
      const possibleTrackIdFields = ['id', 'payment_id', 'paymentId', 'transaction_id', 'transactionId']
      for (const field of possibleTrackIdFields) {
        if (paymentData[field]) {
          console.log(`Found alternative trackId in field '${field}':`, paymentData[field])
          const alternativeTrackId = paymentData[field]
          
          // Continue with the alternative trackId
          return continueWithTrackId(alternativeTrackId, paymentData, session, amount, currency)
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to create payment', message: 'Could not find payment identifier in response' },
        { status: 500 }
      )
    }
    
    return continueWithTrackId(trackId, paymentData, session, amount, currency)
    
  } catch (error) {
    console.error('Error creating Oxapay payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment', message: error.message },
      { status: 500 }
    )
  }
}

// Helper function to continue processing with a valid trackId
async function continueWithTrackId(trackId, paymentData, session, amount, currency) {
  try {
    // Extract the payment link with more detailed logging
    const payLink = paymentData.payLink || paymentData.pay_link || paymentData.paymentLink || paymentData.payment_link || ''
    console.log('Extracted payLink:', payLink)
    
    if (!payLink) {
      console.error('No payment link found in Oxapay response. Full response:', JSON.stringify(paymentData))
      
      // Check for other possible field names
      const possibleLinkFields = ['url', 'payment_url', 'paymentUrl', 'redirect_url', 'redirectUrl']
      for (const field of possibleLinkFields) {
        if (paymentData[field]) {
          console.log(`Found alternative payment link in field '${field}':`, paymentData[field])
          const alternativeLink = paymentData[field]
          
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
              trackId: trackId,
              createdAt: new Date()
            }
          })
          
          // Store payment information in database
          await prisma.cryptoPayment.create({
            data: {
              userId: session.user.id,
              paymentId: trackId,
              paymentStatus: 'WAITING',
              amount: amount,
              cryptoAmount: amount,
              currency: currency,
              address: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              provider: 'OXAPAY',
              transactionId: transaction.id
            }
          })
          
          return NextResponse.json({
            success: true,
            paymentId: trackId,
            transactionId: transaction.id,
            paymentUrl: alternativeLink,
            amount: amount,
            currency: currency
          })
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to create payment', message: 'Could not find payment URL in response' },
        { status: 500 }
      )
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
        createdAt: new Date(),
        trackId: trackId
      }
    })
    
    // Store payment information in database
    await prisma.cryptoPayment.create({
      data: {
        userId: session.user.id,
        paymentId: trackId,
        paymentStatus: 'WAITING',
        amount: amount,
        cryptoAmount: amount,
        currency: currency,
        address: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: 'OXAPAY',
        transactionId: transaction.id
      }
    })
    
    // Return the payment link and trackId to the client
    return NextResponse.json({
      success: true,
      paymentId: trackId,
      transactionId: transaction.id,
      paymentUrl: payLink,
      amount: amount,
      currency: currency
    })
  } catch (error) {
    console.error('Error processing payment data:', error)
    return NextResponse.json(
      { error: 'Failed to process payment', message: error.message },
      { status: 500 }
    )
  }
} 