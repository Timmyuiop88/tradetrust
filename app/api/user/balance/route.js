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
    
    // Check if Balance model exists in the schema
    try {
      // Get or create user balance
      let balance = await prisma.balance.findUnique({
        where: { userId: session.user.id }
      })
      
      if (!balance) {
        // Create a new balance record if one doesn't exist
        balance = await prisma.balance.create({
          data: {
            userId: session.user.id,
            buyingBalance: 0,
            sellingBalance: 0
          }
        })
      }
      
      // Get recent transactions
      const recentTransactions = await prisma.transaction.findMany({
        where: { 
          userId: session.user.id 
        },
        orderBy: { 
          createdAt: 'desc' 
        },
        take: 10
      })
      
      return NextResponse.json({
        balance,
        recentTransactions
      })
    } catch (error) {
      // If the model doesn't exist yet, return a placeholder response
      console.error('Balance model error:', error)
      return NextResponse.json({
        balance: {
          buyingBalance: 0,
          sellingBalance: 0
        },
        recentTransactions: []
      })
    }
  } catch (error) {
    console.error('Error fetching balance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    )
  }
} 