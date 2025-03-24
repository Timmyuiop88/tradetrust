import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  try {
    const searchParams = new URL(request.url).searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const platform = searchParams.get("platform")
    const category = searchParams.get("category")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const order = searchParams.get("order") || "desc"
    const search = searchParams.get("search")
    
    // Skip calculation for pagination
    const skip = (page - 1) * limit
    
    // Build the where clause with filters
    let where = {
      status: "AVAILABLE"
    }
    
    // Add platform filter if provided
    if (platform) {
      where.platform = {
        name: platform
      }
    }
    
    // Add category filter if provided
    if (category) {
      where.category = {
        name: category
      }
    }
    
    // Add search functionality across multiple fields
    if (search) {
      where.OR = [
        // Search in description
        {
          description: {
            contains: search,
            mode: "insensitive"
          }
        },
        // Search in username (if available)
        {
          username: {
            contains: search,
            mode: "insensitive"
          }
        },
        // Search in platform name
        {
          platform: {
            name: {
              contains: search,
              mode: "insensitive"
            }
          }
        },
        // Search in category name
        {
          category: {
            name: {
              contains: search,
              mode: "insensitive"
            }
          }
        }
      ]
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
    } else if (sortBy === 'followers') {
      orderBy.push({ followers: order })
    }

    // First, count total matching records
    const totalListings = await prisma.listing.count({ where })
    
    // Get listings with proper includes for subscription data
    const listings = await prisma.listing.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
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
      // Get the seller's subscription
      const subscription = listing.seller?.Subscription?.[0]
      
      // Default subscription tier if not found
      const tierLevel = {
        "FREE": 0,
        "BASIC": 1,
        "PRO": 2,
        "PREMIUM": 3
      }
      
      // Add tier level to each listing for frontend usage
      const subscriptionTier = subscription?.plan?.tier || "FREE"
      
      // Add featured status
      const isFeatured = Boolean(subscription && subscriptionTier !== "FREE")
      
      return {
        ...listing,
        seller: {
          ...listing.seller,
          // Don't send subscription details to client
          Subscription: undefined
        },
        // Add metadata for frontend
        subscriptionTier,
        subscriptionLevel: tierLevel[subscriptionTier] || 0,
        isFeatured
      }
    })
    
    // Sort processedListings by subscription level if not already sorted by user
    if (!sortBy || sortBy === 'createdAt') {
      processedListings.sort((a, b) => {
        // First by subscription level
        if (b.subscriptionLevel !== a.subscriptionLevel) {
          return b.subscriptionLevel - a.subscriptionLevel
        }
        
        // Then by selected sort
        if (sortBy === 'createdAt') {
          const dateA = new Date(a.createdAt)
          const dateB = new Date(b.createdAt)
          return order === 'desc' ? dateB - dateA : dateA - dateB
        }
        
        return 0
      })
    }
    
    // Calculate total pages
    const totalPages = Math.ceil(totalListings / limit)
    
    // Return response with pagination info
    return NextResponse.json({
      listings: processedListings,
      pagination: {
        total: totalListings,
        currentPage: page,
        totalPages,
        limit
      }
    })
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()

    console.log('body', body)
    
    if (!body.platform || !body.category || !body.price || !body.description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Get user's subscription with plan details
    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      include: { plan: true }
    })
    
    // Check active listings count
    const activeListingsCount = await prisma.listing.count({
      where: { 
        sellerId: session.user.id,
        status: { in: ["AVAILABLE", "PENDING"] }
      }
    })
    
    // Get max listings from subscription plan or default to FREE tier limit
    const subscriptionTier = subscription?.plan?.tier || "FREE"
    const maxActiveListings = subscription?.plan?.maxListings || 4 // Default to FREE tier limit
    
    // Determine if this listing should be active or inactive based on limits
    const isActive = activeListingsCount < maxActiveListings
    const initialStatus = isActive ? "AVAILABLE" : "INACTIVE"
    
    // Create listing with appropriate status
    const listing = await prisma.listing.create({
      data: {
        platformId: body.platform,
        categoryId: body.category,
        price: parseFloat(body.price),
        description: body.description,
        username: body.username || null,
        followers: parseInt(body.followers) || 0,
        engagement: parseFloat(body.engagement) || 0,
        accountAge: parseInt(body.accountAge) || 0,
        posts: parseInt(body.posts) || 0,
        sellerId: session.user.id,
        verified: body.verified || false,
        previewLink: body.previewLink || null,
        transferMethod: body.transferMethod,
        accountCountry: body.accountCountry || null,
        negotiable: body.negotiable || false,
        mediaProof: body.mediaProof || [],
        credentials: body.credentials || null,
        status: initialStatus
      }
    })
    
    // Return appropriate response with status info
    return NextResponse.json({ 
      success: true, 
      listing,
      isActive,
      activeListingsCount: activeListingsCount + (isActive ? 1 : 0),
      maxActiveListings,
      message: isActive 
        ? "Listing created successfully" 
        : `Listing created but set to inactive. You've reached your limit of ${maxActiveListings} active listings.`
    })
  } catch (error) {
    console.error("Error creating listing:", error)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
} 