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
    
    const url = new URL(request.url)
    const orderId = url.searchParams.get('orderId')
    
    // Build the query based on whether orderId is provided
    const query = {
      where: {
        recipientId: session.user.id,
        isRead: false,
        ...(orderId ? { orderId } : {})
      }
    }
    
    // Count unread messages
    const count = await prisma.chatMessage.count(query)
    
    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error getting unread message count:', error)
    return NextResponse.json(
      { error: 'Failed to get unread message count' },
      { status: 500 }
    )
  }
} 