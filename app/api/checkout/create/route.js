import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { listingId, paymentMethod } = await request.json()
    
    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }
    
    // Get the listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true }
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
    
    // If using balance payment, check if user has enough funds
    if (paymentMethod === 'BALANCE') {
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
      
      // Process the payment using balance
      await prisma.$transaction(async (tx) => {
        // Deduct from buyer's buying balance
        await tx.balance.update({
          where: { userId: session.user.id },
          data: {
            buyingBalance: {
              decrement: listing.price
            }
          }
        })
        
        // Record the purchase transaction
        await tx.transaction.create({
          data: {
            balanceId: userBalance.id,
            amount: -listing.price,
            type: 'PURCHASE',
            description: `Purchase of ${listing.platform.name} account`,
            reference: listingId
          }
        })
        
        // Get or create seller's balance
        let sellerBalance = await tx.balance.findUnique({
          where: { userId: listing.sellerId }
        })
        
        if (!sellerBalance) {
          sellerBalance = await tx.balance.create({
            data: {
              userId: listing.sellerId,
              buyingBalance: 0,
              sellingBalance: 0
            }
          })
        }
        
        // Calculate platform fee (10%)
        const platformFee = listing.price * 0.1
        const sellerAmount = listing.price - platformFee
        
        // Add to seller's selling balance (not available for buying)
        await tx.balance.update({
          where: { id: sellerBalance.id },
          data: {
            sellingBalance: {
              increment: sellerAmount
            }
          }
        })
        
        // Record the sale transaction for seller
        await tx.transaction.create({
          data: {
            balanceId: sellerBalance.id,
            amount: sellerAmount,
            type: 'SALE',
            description: `Sale of ${listing.platform.name} account (after fees)`,
            reference: listingId
          }
        })
        
        // Update listing status to PENDING
        await tx.listing.update({
          where: { id: listingId },
          data: { status: 'PENDING' }
        })
      })
    }
    
    // Create checkout session
    const checkout = await prisma.checkout.create({
      data: {
        buyerId: session.user.id,
        sellerId: listing.sellerId,
        listingId: listing.id,
        amount: listing.price,
        status: paymentMethod === 'BALANCE' ? 'PAID' : 'PENDING',
        paymentMethod: paymentMethod || 'EXTERNAL'
      }
    })
    
    return NextResponse.json({ checkoutId: checkout.id })
  } catch (error) {
    console.error('Error creating checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 