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

    const where = {
      status: 'AVAILABLE',
      ...(platform && platform !== 'All' ? {
        platform: { name: platform }
      } : {})
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        take: limit,
        skip: (page - 1) * limit,
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              kyc: true,
            }
          },
          platform: true,
          category: true
        },
        where,
        orderBy: { [sortBy]: order }
      }),
      prisma.listing.count({ where })
    ])
    
    return NextResponse.json({
      listings,
      hasMore: total > page * limit,
      nextPage: page + 1,
      total
    })
  } catch (error) {
    console.error('Listings GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Verify seller has completed KYC
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { kyc: true }
    })

    if (!user?.kyc?.verified) {
      return NextResponse.json(
        { error: 'KYC verification required' }, 
        { status: 403 }
      )
    }

    const listing = await prisma.listing.create({
      data: {
        ...data,
        sellerId: session.user.id,
        status: 'AVAILABLE'
      }
    })

    return NextResponse.json(listing)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
} 