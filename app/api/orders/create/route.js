import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addMinutes } from 'date-fns'
import { SubscriptionService } from '@/lib/services/subscriptionService'
import { PushNotificationService } from '@/lib/services/pushNotificationService'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { listingId } = await request.json()
    
    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }
    
    // Get the listing with seller info and subscription
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { 
        seller: {
          include: {
            Subscription: {
              include: {
                plan: true
              }
            }
          }
        },
        platform: true
      }
    })
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    
    // Check if listing is available
    if (listing.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Listing is not available for purchase' }, { status: 400 })
    }
    
    // Prevent buying your own listing
    if (listing.sellerId === session.user.id) {
      return NextResponse.json({ error: 'You cannot purchase your own listing' }, { status: 400 })
    }
    
    // Check if user has enough funds
    const userBalance = await prisma.balance.findUnique({
      where: { userId: session.user.id }
    })
    
    if (!userBalance || userBalance.buyingBalance < listing.price) {
      return NextResponse.json({ 
        error: 'Insufficient funds in your buying balance',
        currentBalance: userBalance?.buyingBalance || 0,
        required: listing.price
      }, { status: 400 })
    }
    
    // Process the payment and create order in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Set deadlines for seller and buyer
      const sellerDeadline = addMinutes(new Date(), 20) // 20 minutes for seller to provide details
      
      // Create the order first so we have the orderId
      const order = await tx.order.create({
        data: {
          listingId,
          buyerId: session.user.id,
          sellerId: listing.sellerId,
          price: listing.price,
          isNegotiated: false,
          status: 'WAITING_FOR_SELLER',
          escrowAmount: listing.price,
          escrowReleased: false,
          sellerDeadline
        }
      })
      
      // Deduct from buyer's buying balance
      await tx.balance.update({
        where: { userId: session.user.id },
        data: {
          buyingBalance: {
            decrement: listing.price
          }
        }
      })
      
      // Record the purchase transaction with orderId
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          balanceId: userBalance.id,
          listingId: listingId,
          orderId: order.id, // Add the orderId reference
          amount: -listing.price,
          type: 'PURCHASE',
          description: `Purchase of ${listing.platform.name} account`,
          status: 'COMPLETED'
        }
      })
      
      // Update listing status to PENDING (not SOLD yet)
      await tx.listing.update({
        where: { id: listingId },
        data: { status: 'PENDING' }
      })
      
      return { order, listing }
    })
    
    await PushNotificationService.notifyOrderUpdate(
      { ...result.order, listing: result.listing },
      'ORDER_CREATED'
    )
    
    // After successfully creating the order, create a chat channel
    try {
      // Import the createOrderChatChannel function from middleware
      const { createOrderChatChannel } = await import('@/app/api/chat/stream/middleware');
      
      // Create a chat channel for this order
      await createOrderChatChannel({
        id: result.order.id,
        buyerId: result.order.userId,
        sellerId: result.order.sellerId,
        orderNumber: result.order.orderNumber
      });
      
      console.log(`Chat channel created for order ${result.order.id}`);
    } catch (chatError) {
      // Log the error but don't fail the order creation
      console.error('Error creating chat channel:', chatError);
    }
    
    return NextResponse.json({
      success: true,
      orderId: result.order.id,
      message: 'Order created successfully. Waiting for seller to provide account details.'
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
} 