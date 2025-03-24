import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Create prisma client instance directly
const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    // Fix 1: Extract ID directly without destructuring
    const sellerId = params.id
    
    // Fix 2: Get session the standard way
    const session = await getServerSession(authOptions)
    
    // Allow access to public listings without authentication
    
    // Fix 3: Properly parse exclude ID
    const excludeId = request.nextUrl.searchParams.get('excludeId') || undefined
    
    // Fix 4: Use the prisma client directly
    const listings = await prisma.listing.findMany({
      where: {
        sellerId: sellerId,
        status: 'AVAILABLE',
        id: {
          not: excludeId
        }
      },
      select: {
        id: true,
        
        price: true,
        status: true,
        mediaProof: true,
        createdAt: true,
        platform: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 4
    })

    return NextResponse.json(listings)
  } catch (error) {
    console.error('Error fetching seller listings:', error)
    return NextResponse.json({ error: 'Failed to fetch seller listings' }, { status: 500 })
  }
} 