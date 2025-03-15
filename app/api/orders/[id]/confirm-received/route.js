import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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
    
    // Get the order with listing details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: {
          include: {
            platform: true
          }
        }
      }
    })
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Check if user is the buyer
    if (order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Only the buyer can confirm receipt' }, { status: 403 })
    }
    
    // Check if order is in the correct state
    if (order.status !== 'WAITING_FOR_BUYER') {
      return NextResponse.json({ 
        error: 'Cannot confirm receipt in the current order state' 
      }, { status: 400 })
    }
    
    // Get seller's balance
    const sellerBalance = await prisma.balance.findUnique({
      where: { userId: order.sellerId }
    })
    
    if (!sellerBalance) {
      return NextResponse.json({ error: 'Seller balance not found' }, { status: 404 })
    }
    
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
      
      // Calculate fees
      const platformFee = Number(order.price * 0.1) // 10% platform fee
      const sellerAmount = Number(order.price * 0.9)
      
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
          fee: 0 // Seller's transaction doesn't show the fee
        }
      })
      
      // Update the buyer's purchase transaction to include the fee
      await tx.transaction.update({
        where: {
          userId: order.buyerId,
          orderId: order.id,
          type: 'PURCHASE'
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
      { error: error.message || 'Failed to confirm receipt' },
      { status: 500 }
    )
  }
} 