import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const platform = searchParams.get('platform')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const search = searchParams.get('search')
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Build where clause
    const where = {}
    
    if (platform && platform !== 'All') {
      const platformRecord = await prisma.platform.findFirst({
        where: { name: platform }
      })
      
      if (platformRecord) {
        where.platformId = platformRecord.id
      }
    }
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Build order by
    let orderBy = {}
    if (sortBy && order) {
      orderBy[sortBy] = order.toLowerCase()
    } else {
      orderBy = { createdAt: 'desc' }
    }
    
    // Get listings
    const [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          platform: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          seller: {
            select: {
              id: true,
              email: true,
            },
          },
        }
      }),
      prisma.listing.count({ where })
    ])
    
    // Transform the data to include userId
    const transformedListings = listings.map(listing => ({
      ...listing,
      userId: listing.sellerId,
      userEmail: listing.seller.email,
      seller: undefined,
    }))
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const nextPage = hasNextPage ? page + 1 : null
    
    return NextResponse.json({
      listings: transformedListings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        nextPage
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