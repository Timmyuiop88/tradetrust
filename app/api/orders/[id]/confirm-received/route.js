import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { SubscriptionService } from '@/lib/services/subscriptionService'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderId = params.id
    
    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: {
          include: {
            platform: true,
            seller: {
              include: {
                Subscription: {
                  include: {
                    plan: true
                  }
                }
              }
            }
          }
        }
      }
    })
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Verify the user is the buyer
    if (order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Check if order is in the right state
    if (order.status !== 'WAITING_FOR_BUYER') {
      return NextResponse.json({ 
        error: 'Order must be in DELIVERED status to confirm receipt' 
      }, { status: 400 })
    }
    
    // Get seller's balance
    const sellerBalance = await prisma.balance.findUnique({
      where: { userId: order.sellerId }
    })
    
    if (!sellerBalance) {
      return NextResponse.json({ error: 'Seller balance not found' }, { status: 500 })
    }
    
    // Get the purchase transaction first to update it later
    const purchaseTransaction = await prisma.transaction.findFirst({
      where: {
        userId: order.buyerId,
        orderId: order.id,
        type: 'PURCHASE'
      }
    });
    
    if (!purchaseTransaction) {
      return NextResponse.json({ error: 'Purchase transaction not found' }, { status: 500 })
    }
    
    // Get seller's commission rate from subscription
    const commissionRate = order.listing.seller?.subscription?.plan?.commissionRate || 0.1;
    
    // Execute transaction in a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })
      
      // Update listing status
      await tx.listing.update({
        where: { id: order.listingId },
        data: {
          status: 'SOLD'
        }
      })
      
      // Calculate fees based on seller's subscription plan
      const platformFee = Number(order.price * commissionRate)
      const sellerAmount = Number(order.price - platformFee)
      
      // Update seller balance
      const updatedBalance = await tx.balance.update({
        where: { id: sellerBalance.id },
        data: {
          sellingBalance: {
            increment: sellerAmount
          }
        }
      })
      
      // Record the seller's transaction
      await tx.transaction.create({
        data: {
          userId: order.sellerId,
          balanceId: sellerBalance.id,
          amount: sellerAmount,
          type: "SALE",
          status: "COMPLETED",
          description: `Sale of ${order.listing.platform?.name || 'account'} (after fees)`,
          orderId: order.id,
          fee: platformFee // Record the fee amount
        }
      })
      
      // Update the buyer's purchase transaction to include the fee
      // Use the transaction ID we retrieved earlier
      await tx.transaction.update({
        where: { 
          id: purchaseTransaction.id // Use the unique ID
        },
        data: {
          fee: platformFee
        }
      })
      
      return { updatedOrder, updatedBalance }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Receipt confirmed and payment released to seller'
    })
  } catch (error) {
    console.error('Error confirming receipt:', error)
    return NextResponse.json(
      { error: 'Failed to confirm receipt' },
      { status: 500 }
    )
  }
} 