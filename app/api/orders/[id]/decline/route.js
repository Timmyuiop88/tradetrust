import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PushNotificationService } from '@/lib/services/pushNotificationService'
import { sendOrderCancellationEmail } from '@/lib/email/emailService'
import { sendOrderCancellation } from '@/lib/services/notificationService'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const orderId = params.id
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }
    
    // Get the order with listing and buyer info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: true,
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Check if user is the seller
    if (order.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'You do not have permission to decline this order' }, { status: 403 })
    }
    
    // Check if order is in a state that can be declined
    if (order.status !== 'WAITING_FOR_SELLER') {
      return NextResponse.json({ 
        error: 'This order cannot be declined. Only orders waiting for seller can be declined.' 
      }, { status: 400 })
    }
    
    // Check if credentials have been released
    if (order.credentials) {
      return NextResponse.json({ 
        error: 'This order cannot be declined because credentials have already been released.' 
      }, { status: 400 })
    }
    
    // Process the decline and refund in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update order status to CANCELLED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: session.user.id,
          cancelledReason: 'SELLER_DECLINED'
        }
      })
      
      // Get buyer's balance
      const buyerBalance = await tx.balance.findUnique({
        where: { userId: order.buyerId }
      })
      
      if (!buyerBalance) {
        throw new Error('Buyer balance not found')
      }
      
      // Refund the buyer's buying balance
      const updatedBuyerBalance = await tx.balance.update({
        where: { userId: order.buyerId },
        data: {
          buyingBalance: {
            increment: order.price
          }
        }
      })
      
      // Record the refund transaction
      const refundTransaction = await tx.transaction.create({
        data: {
          userId: order.buyerId,
          balanceId: buyerBalance.id,
          listingId: order.listingId,
          orderId: order.id,
          amount: order.price,
          type: 'REFUND',
          description: 'Refund for declined order',
          status: 'COMPLETED'
        }
      })
      
      // Reactivate the listing
      const updatedListing = await tx.listing.update({
        where: { id: order.listingId },
        data: { status: 'AVAILABLE' }
      })
      
      return { 
        order: updatedOrder, 
        buyerBalance: updatedBuyerBalance, 
        refundTransaction,
        listing: updatedListing
      }
    })
    
    // Send notifications
    try {
      // Send notification to buyer using the notification service
      await sendOrderCancellation(
        order.buyerId, 
        order.id, 
        'The seller has declined this order.'
      )
      
      // Send push notification about the order status change
      await PushNotificationService.notifyOrderUpdate(
        { ...result.order, listing: result.listing },
        'ORDER_CANCELLED'
      )
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError)
      // Don't fail the request if notifications fail
    }
    
    return NextResponse.json({
      success: true,
      message: 'Order declined successfully. The buyer has been refunded and the listing is available again.'
    })
  } catch (error) {
    console.error('Error declining order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to decline order' },
      { status: 500 }
    )
  }
} 