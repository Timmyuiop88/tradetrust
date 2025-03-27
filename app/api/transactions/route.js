import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 })
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit
    
    // Get total count of transactions
    const total = await prisma.transaction.count({
      where: { userId: session.user.id }
    })
    
    // Get paginated transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
    
    return NextResponse.json({
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
} 