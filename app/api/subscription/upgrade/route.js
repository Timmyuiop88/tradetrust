import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { addMonths } from 'date-fns'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planTier, paymentMethod } = await request.json()

    // Get the plan
    const plan = await prisma.plan.findUnique({
      where: { tier: planTier }
    })

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check if user has enough balance
    const userBalance = await prisma.balance.findUnique({
      where: { userId: session.user.id }
    })

    const balance = paymentMethod === 'SELLING_BALANCE' 
      ? userBalance?.sellingBalance 
      : userBalance?.buyingBalance

    if (!userBalance || balance < plan.price) {
      return NextResponse.json({ 
        error: `Insufficient funds in your ${paymentMethod === 'SELLING_BALANCE' ? 'selling' : 'buying'} balance`,
        currentBalance: balance || 0,
        required: plan.price
      }, { status: 400 })
    }

    // Process the upgrade
    await prisma.$transaction(async (tx) => {
      // Update balance
      await tx.balance.update({
        where: { userId: session.user.id },
        data: paymentMethod === 'SELLING_BALANCE' 
          ? { sellingBalance: { decrement: plan.price } }
          : { buyingBalance: { decrement: plan.price } }
      })

      // Cancel current subscription if exists
      await tx.subscription.updateMany({
        where: { 
          userId: session.user.id,
          status: 'ACTIVE'
        },
        data: { 
          status: 'CANCELLED',
          cancelAtPeriodEnd: true
        }
      })

      // Create new subscription
      await tx.subscription.create({
        data: {
          userId: session.user.id,
          planId: plan.id,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: addMonths(new Date(), 1)
        }
      })

      // Record transaction
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          balanceId: userBalance.id,
          amount: -plan.price,
          type: 'SUBSCRIPTION',
          description: `Subscription upgrade to ${plan.name}`,
          status: 'COMPLETED'
        }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error upgrading subscription:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    )
  }
} 