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
    
    // Get user balance
    let balance = await prisma.balance.findUnique({
      where: { userId: session.user.id }
    })
    
    if (!balance) {
      // Create balance if it doesn't exist
      balance = await prisma.balance.create({
        data: {
          userId: session.user.id,
          buyingBalance: 0,
          sellingBalance: 0
        }
      })
    }
    
    // Get recent transactions, including pending ones
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    return NextResponse.json({
      balance,
      recentTransactions
    })
  } catch (error) {
    console.error('Error fetching user balance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    )
  }
} 