import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Calculate skip value
    const skip = (page - 1) * limit
    
    // Get recent transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        balance: {
          userId: session.user.id
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })
    
    // Get recent purchases
    const purchases = await prisma.order.findMany({
      where: {
        buyerId: session.user.id
      },
      include: {
        listing: {
          include: {
            platform: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })
    
    // Get recent sales
    const sales = await prisma.order.findMany({
      where: {
        sellerId: session.user.id
      },
      include: {
        listing: {
          include: {
            platform: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })
    
    // Get recent listings
    const listings = await prisma.listing.findMany({
      where: {
        sellerId: session.user.id
      },
      include: {
        platform: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })
    
    // Format transactions
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      title: getTransactionTitle(transaction.type),
      description: transaction.description,
      amount: transaction.amount,
      timestamp: transaction.createdAt,
      status: transaction.status || 'COMPLETED'
    }))
    
    // Format purchases
    const formattedPurchases = purchases.map(purchase => ({
      id: purchase.id,
      type: 'PURCHASE',
      title: `Purchased ${purchase.listing.platform.name} Account`,
      description: `Payment via escrow`,
      amount: -purchase.price,
      timestamp: purchase.createdAt,
      status: purchase.status,
      listingId: purchase.listingId
    }))
    
    // Format sales
    const formattedSales = sales.map(sale => ({
      id: sale.id,
      type: 'SALE',
      title: `Sold ${sale.listing.platform.name} Account`,
      description: `Payment via escrow`,
      amount: sale.price * 0.9, // 10% platform fee
      timestamp: sale.createdAt,
      status: sale.status,
      listingId: sale.listingId
    }))
    
    // Format listings
    const formattedListings = listings.map(listing => ({
      id: listing.id,
      type: 'LISTING_CREATED',
      title: `Created ${listing.platform.name} Listing`,
      description: `${listing.followers ? listing.followers.toLocaleString() : '0'} followers · ${listing.price.toLocaleString()} USD`,
      timestamp: listing.createdAt,
      status: listing.status,
      listingId: listing.id
    }))
    
    // Combine all activities and sort by timestamp
    const allActivities = [
      ...formattedTransactions,
      ...formattedPurchases,
      ...formattedSales,
      ...formattedListings
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    
    // Apply pagination to the combined activities
    const totalCount = allActivities.length
    const paginatedItems = allActivities.slice(skip, skip + limit)
    
    return NextResponse.json({
      items: paginatedItems,
      totalCount,
      page,
      limit,
      hasNextPage: skip + limit < totalCount
    })
  } catch (error) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}

// Helper function to get transaction titles
function getTransactionTitle(type) {
  switch (type) {
    case 'DEPOSIT':
      return 'Added Funds'
    case 'WITHDRAWAL':
      return 'Withdrew Funds'
    case 'PURCHASE':
      return 'Account Purchase'
    case 'SALE':
      return 'Account Sale'
    case 'REFUND':
      return 'Refund Processed'
    default:
      return 'Transaction'
  }
} 