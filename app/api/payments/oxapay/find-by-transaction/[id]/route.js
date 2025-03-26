import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const transactionId = params.id
    
    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 })
    }
    
    // Find the payment by transaction ID
    const payment = await prisma.cryptoPayment.findFirst({
      where: {
        transactionId: transactionId,
        userId: session.user.id,
        provider: 'OXAPAY'
      }
    })
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      paymentId: payment.paymentId,
      status: payment.paymentStatus,
      amount: payment.amount,
      currency: payment.currency
    })
  } catch (error) {
    console.error('Error finding payment by transaction ID:', error)
    return NextResponse.json(
      { error: 'Failed to find payment', message: error.message },
      { status: 500 }
    )
  }
} 