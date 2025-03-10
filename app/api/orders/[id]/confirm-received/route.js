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
    
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: true
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
    
    // Process the confirmation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get seller's balance
      const sellerBalance = await tx.balance.findUnique({
        where: { userId: order.sellerId }
      })
      
      if (!sellerBalance) {
        throw new Error('Seller balance not found')
      }
      
      // Add funds to seller's selling balance
      await tx.balance.update({
        where: { id: sellerBalance.id },
        data: {
          sellingBalance: {
            increment: order.price
          }
        }
      })
      
      // Record the transaction
      await tx.transaction.create({
        data: {
          balanceId: sellerBalance.id,
          amount: order.price,
          type: 'SALE',
          description: `Sale of ${order.listing.title}`,
          reference: order.id
        }
      })
      
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          escrowReleased: true,
          updatedAt: new Date()
        }
      })
      
      return { success: true }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Receipt confirmed and payment released to seller.'
    })
  } catch (error) {
    console.error('Error confirming receipt:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to confirm receipt' },
      { status: 500 }
    )
  }
} 