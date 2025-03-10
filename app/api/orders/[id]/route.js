import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { decrypt } from '@/lib/encryption'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const orderId = params.id
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }
    
    // Get the order with related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: {
          include: {
            platform: true
          }
        }
      }
    })
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Check if user is buyer or seller
    if (order.buyerId !== session.user.id && order.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'You do not have permission to view this order' }, { status: 403 })
    }
    
    // Decrypt credentials if they exist and user is buyer or seller
    if (order.credentials) {
      order.credentials = {
        email: decrypt(order.credentials.email),
        password: decrypt(order.credentials.password),
        additionalInfo: order.credentials.additionalInfo ? decrypt(order.credentials.additionalInfo) : null
      }
    }
    
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    )
  }
} 