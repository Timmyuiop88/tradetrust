import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')
    
    // Check if the Favorite model exists in the schema
    try {
      if (sellerId) {
        // Check if specific seller is favorited
        const favorite = await prisma.favorite.findFirst({
          where: {
            userId: session.user.id,
            sellerId
          }
        })
        
        return NextResponse.json({ isFavorite: !!favorite })
      } else {
        // Get all user favorite sellers with their listings
        const favorites = await prisma.favorite.findMany({
          where: {
            userId: session.user.id
          },
          include: {
            seller: {
              select: {
                id: true,
                email: true,
                listings: {
                  where: { status: 'AVAILABLE' },
                  include: {
                    platform: true,
                    category: true
                  },
                  orderBy: { createdAt: 'desc' }
                }
              }
            }
          }
        })
        
        // Flatten the structure to return seller listings
        const favoriteListings = favorites.flatMap(favorite => 
          favorite.seller.listings.map(listing => ({
            ...listing,
            isFavoriteSeller: true
          }))
        )
        
        return NextResponse.json(favoriteListings)
      }
    } catch (modelError) {
      // If the model doesn't exist yet, return empty results
      console.error('Model error:', modelError)
      if (sellerId) {
        return NextResponse.json({ isFavorite: false })
      } else {
        return NextResponse.json([])
      }
    }
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { sellerId } = await request.json()
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 })
    }
    
    try {
      // Check if already favorited
      const existingFavorite = await prisma.favorite.findFirst({
        where: {
          userId: session.user.id,
          sellerId
        }
      })
      
      if (existingFavorite) {
        // Remove from favorites
        await prisma.favorite.delete({
          where: {
            id: existingFavorite.id
          }
        })
        
        return NextResponse.json({ isFavorite: false })
      } else {
        // Add to favorites
        await prisma.favorite.create({
          data: {
            userId: session.user.id,
            sellerId
          }
        })
        
        return NextResponse.json({ isFavorite: true })
      }
    } catch (modelError) {
      console.error('Model error:', modelError)
      return NextResponse.json({ error: 'Favorites feature not available yet' }, { status: 503 })
    }
  } catch (error) {
    console.error('Error updating favorites:', error)
    return NextResponse.json(
      { error: 'Failed to update favorites' },
      { status: 500 }
    )
  }
} 