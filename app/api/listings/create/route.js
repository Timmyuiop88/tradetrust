import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { SubscriptionService } from '@/lib/services/subscriptionService'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user can create more listings
    const canCreate = await SubscriptionService.canCreateListing(session.user.id)
    if (!canCreate) {
      return NextResponse.json({ 
        error: 'Listing limit reached for your subscription tier',
        upgrade: true
      }, { status: 403 })
    }

    const data = await request.json()
    
    // Get user's subscription for search ranking
    const subscription = await SubscriptionService.getUserSubscription(session.user.id)
    
    // Add subscription-based ranking
    const searchRanking = {
      FREE: 0,
      BASIC: 1,
      PRO: 2,
      PREMIUM: 3
    }[subscription.plan.tier]

    // Create listing with ranking
    const listing = await prisma.listing.create({
      data: {
        ...data,
        sellerId: session.user.id,
        searchRanking
      }
    })

    return NextResponse.json({ success: true, listing })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
} 