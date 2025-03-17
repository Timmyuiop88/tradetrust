import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/chat/[orderId]
 * Fetches messages for a specific order
 */
export default async function GET(req, { params }) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get orderId from params directly
    const orderId = params.orderId;
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Get order with complete data needed by the chat page
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          
          }
        },
        listing: {
          include: {
            seller: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                
              }
            }
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check authorization
    const isBuyer = order.buyer.id === session.user.id;
    const isSeller = order.listing.seller.id === session.user.id;
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    
    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized access to order' }, { status: 403 });
    }
    
    // Get messages
    const messages = await prisma.chatMessage.findMany({
      where: { 
        orderId,
        OR: [
          { isModOnly: false },
          { isModOnly: true, senderId: session.user.id },
          { isModOnly: true, recipientId: session.user.id }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });
    
    // Get dispute if it exists
    const dispute = await prisma.dispute.findFirst({
      where: { orderId },
      select: {
        id: true,
        status: true,
        reason: true
      }
    });
    
    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        orderId,
        recipientId: session.user.id,
        isRead: false
      },
      data: { isRead: true }
    });
    
    return NextResponse.json({
      messages,
      order,
      dispute
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 