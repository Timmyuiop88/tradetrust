import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const platform = searchParams.get('platform') || 'All'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const search = searchParams.get('search') || ''
    
    const skip = (page - 1) * limit
    
    // Build the where clause
    const where = {
      status: 'AVAILABLE',
      ...(platform !== 'All' && { platformId: platform }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    }
    
    // Build the orderBy clause based on sortBy and order
    let orderBy = []
    
    // First, add the subscription tier-based ordering
    // We'll use a join to get the seller's subscription plan tier
    
    // Then add the user-selected sorting
    if (sortBy === 'price') {
      orderBy.push({ price: order })
    } else if (sortBy === 'createdAt') {
      orderBy.push({ createdAt: order })
    }
    
    // Get listings with proper includes for subscription data
    const listings = await prisma.listing.findMany({
      where,
      orderBy,
      skip,
      take: limit,
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
    })
    
    // Post-process the listings to apply subscription-based ranking
    const processedListings = listings.map(listing => {
      // Add a virtual field for featured status
      const isFeatured = listing.featured || false
      
      // Get the seller's plan tier (default to FREE if not found)
      const planTier = listing.seller?.subscription?.plan?.tier || 'FREE'
      
      // Add plan tier info to the listing
      return {
        ...listing,
        isFeatured,
        sellerPlanTier: planTier
      }
    })
    
    // Sort the processed listings based on subscription tier and featured status
    const sortedListings = processedListings.sort((a, b) => {
      // First, sort by featured status
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      
      // Then, sort by plan tier
      const tierRanking = {
        'PREMIUM': 3,
        'PRO': 2,
        'BASIC': 1,
        'FREE': 0
      }
      
      const aTierRank = tierRanking[a.sellerPlanTier] || 0
      const bTierRank = tierRanking[b.sellerPlanTier] || 0
      
      if (aTierRank !== bTierRank) {
        return bTierRank - aTierRank // Higher tier first
      }
      
      // If same tier and featured status, use the original sorting
      return 0
    })
    
    // Get total count for pagination
    const total = await prisma.listing.count({ where })
    
    return NextResponse.json({
      listings: sortedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Parse the request body
    const data = await request.json()
    
    // Validate required fields
    if (!data.platform || !data.category || !data.followers || !data.description || 
        !data.media || data.media.length === 0 || !data.price || !data.transferMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Create the listing
    const listing = await prisma.listing.create({
      data: {
        sellerId: session.user.id,
        platformId: data.platform,
        categoryId: data.category,
        username: data.username || 'Not provided',
        price: parseFloat(data.price),
        followers: parseInt(data.followers),
        engagement: parseFloat(data.engagement || 0),
        description: data.description,
        accountAge: data.accountAge || 0,
        posts: data.posts || 0,
        mediaProof: data.media.map(item => item.url),
        negotiable: data.negotiable || false,
        transferMethod: data.transferMethod,
      }
    })
    
    return NextResponse.json(listing)
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json({ error: error.message || 'Failed to create listing' }, { status: 500 })
  }
} 