import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET handler to fetch messages for a specific order
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in API route:', {
      exists: !!session,
      user: session?.user,
      userId: session?.user?.id
    });
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Verify the user is part of this order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        listing: {
          select: {
            sellerId: true,
            seller: {
              select: {
                id: true,
                email: true,
              }
            }
          }
        },
        buyer: {
          select: {
            id: true,
            email: true,
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check if the user is either the buyer or the seller
    const userId = session.user.id;
    const sellerId = order.listing.sellerId;
    
    if (userId !== order.buyerId && userId !== sellerId) {
      return NextResponse.json({ error: 'You do not have access to this conversation' }, { status: 403 });
    }
    
    // Fetch messages for this order
    const messages = await prisma.chatMessage.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    // Log the order details
    console.log('Order found:', {
      orderId,
      buyerId: order?.buyerId,
      sellerId: order?.listing?.sellerId,
      currentUserId: session?.user?.id,
      hasAccess: userId === order?.buyerId || userId === sellerId
    });
    
    // Log the messages before returning
    console.log('Messages found:', messages.length);
    if (messages.length > 0) {
      console.log('First message sample:', messages[0]);
    }
    
    // Create a simplified order object to return to the client
    const orderInfo = {
      id: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId || order.listing.sellerId,
      buyerEmail: order.buyer?.email,
      sellerEmail: order.listing.seller?.email
    };
    
    return NextResponse.json({ 
      messages,
      order: orderInfo
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to fetch messages',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// POST handler to create a new message
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { orderId, content, receiverId } = body;
    
    if (!orderId || !content) {
      return NextResponse.json({ error: 'Order ID and content are required' }, { status: 400 });
    }
    
    // Verify the user is part of this order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        buyerId: true,
        listing: {
          select: {
            sellerId: true
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check if the user is either the buyer or the seller
    const userId = session.user.id;
    const sellerId = order.listing.sellerId;
    
    if (userId !== order.buyerId && userId !== sellerId) {
      return NextResponse.json({ error: 'You do not have access to this conversation' }, { status: 403 });
    }
    
    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        orderId,
        senderId: userId,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    // Broadcast the new message to connected WebSocket clients
    // You'll need to implement a way to access the Socket.IO server from your API route
    // This could be through a global variable, a shared module, or a separate API call
    
    // Example (if you have access to the io instance):
    // io.to(`order-${orderId}`).emit('messageReceived', message);
    
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
} 