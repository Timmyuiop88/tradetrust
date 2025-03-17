import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/chat/[orderId]
 * Fetches messages for a specific order
 */
export async function GET(req, { params }) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const orderId = params.orderId;
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Get order with minimal data needed
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        buyerId: true,
        listing: {
          select: {
            id: true, 
            sellerId: true
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check authorization
    const isBuyer = order.buyerId === session.user.id;
    const isSeller = order.listing.sellerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    
    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get messages
    const messages = await prisma.chatMessage.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
        recipientId: true,
        isRead: true,
        sender: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    // Mark as read
    if (messages.length > 0) {
      await prisma.chatMessage.updateMany({
        where: {
          orderId,
          recipientId: session.user.id,
          isRead: false
        },
        data: { isRead: true }
      });
    }
    
    return NextResponse.json({ messages, order });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 