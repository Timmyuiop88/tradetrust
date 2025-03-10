import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get counts of listings by status
    const listingCounts = await prisma.listing.groupBy({
      by: ['status'],
      where: {
        sellerId: session.user.id
      },
      _count: {
        id: true
      }
    })
    
    // Format the counts into a more usable structure
    const statusCounts = {
      AVAILABLE: 0,
      PENDING: 0,
      SOLD: 0,
      CANCELLED: 0
    }
    
    listingCounts.forEach(item => {
      statusCounts[item.status] = item._count.id
    })
    
    // Get total number of completed sales
    const totalSales = statusCounts.SOLD || 0
    
    // Get total revenue from completed sales
    const salesData = await prisma.listing.aggregate({
      where: {
        sellerId: session.user.id,
        status: 'SOLD'
      },
      _sum: {
        price: true
      }
    })
    
    // Calculate total revenue (with 10% platform fee deducted)
    const totalRevenue = salesData._sum.price ? salesData._sum.price * 0.9 : 0
    
    // Get average rating from reviews
    const reviewData = await prisma.review.aggregate({
      where: {
        listing: {
          sellerId: session.user.id
        }
      },
      _avg: {
        rating: true
      },
      _count: {
        id: true
      }
    })
    
    // Get recent sales (last 5)
    const recentSales = await prisma.listing.findMany({
      where: {
        sellerId: session.user.id,
        status: 'SOLD'
      },
      select: {
        id: true,
        platform: true,
        price: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    })
    
    return NextResponse.json({
      activeListings: statusCounts.AVAILABLE,
      pendingListings: statusCounts.PENDING,
      totalSales,
      totalRevenue,
      averageRating: reviewData._avg.rating || 0,
      reviewCount: reviewData._count.id,
      recentSales,
      statusCounts
    })
  } catch (error) {
    console.error('Error fetching listing stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listing statistics' },
      { status: 500 }
    )
  }
} 