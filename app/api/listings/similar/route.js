import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const platformId = searchParams.get('platformId')
    const categoryId = searchParams.get('categoryId')
    const excludeId = searchParams.get('excludeId')
    const limit = parseInt(searchParams.get('limit') || '3')
    
    if (!platformId || !categoryId || !excludeId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }
    
    const similarListings = await prisma.listing.findMany({
      where: {
        id: { not: excludeId },
        platformId,
        OR: [
          { categoryId },
          { followers: { gte: 1000 } } // Include listings with significant followers
        ],
        status: 'AVAILABLE'
      },
      include: {
        platform: true,
        category: true
      },
      orderBy: [
        { categoryId: categoryId ? 'asc' : 'desc' }, // Prioritize same category
        { createdAt: 'desc' } // Then newest first
      ],
      take: limit
    })
    
    return NextResponse.json(similarListings)
  } catch (error) {
    console.error('Error fetching similar listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch similar listings' },
      { status: 500 }
    )
  }
} 