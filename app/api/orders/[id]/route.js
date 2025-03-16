import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { decrypt } from '@/lib/encryption'
import crypto from 'crypto'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the orderId from params
    const { id: orderId } = await Promise.resolve(params)
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }
    
    // Check for If-None-Match header for ETag support
    const ifNoneMatch = request.headers.get('If-None-Match')
    
    // Parse the URL to get query parameters
    const url = new URL(request.url)
    const includeChatMessages = url.searchParams.get('includeChatMessages') === 'true'
    
    // Include platform in the query, but limit chatMessages to reduce payload size
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: {
          include: {
            platform: true,
            seller: {
              select: {
                id: true,
                email: true
              }
            }
          }
        },
        buyer: {
          select: {
            id: true,
            email: true
          }
        },
        dispute: true,
        // Only include chat messages if explicitly requested
        chatMessages: includeChatMessages ? {
          orderBy: { createdAt: 'desc' },
          take: 10, // Limit to the 10 most recent messages
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true
          }
        } : false
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
    
    // Add null checks before accessing nested properties
    const orderWithSafeAccess = {
      ...order,
      listing: {
        ...order.listing,
        platform: order.listing?.platform || { name: 'Unknown' }
      }
    }
    
    // Generate an ETag based on the order data and updatedAt timestamp
    const orderHash = crypto.createHash('md5')
      .update(JSON.stringify(orderWithSafeAccess) + order.updatedAt.getTime())
      .digest('hex')
    const etag = `"${orderHash}"`
    
    // If the ETag matches, return 304 Not Modified
    if (ifNoneMatch === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'private, max-age=5'
        }
      })
    }
    
    // Return the response with caching headers
    return new Response(JSON.stringify(orderWithSafeAccess), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'ETag': etag,
        'Cache-Control': 'private, max-age=5'
      }
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order details', message: error.message },
      { status: 500 }
    )
  }
} 