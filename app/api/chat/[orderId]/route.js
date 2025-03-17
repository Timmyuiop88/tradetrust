import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/chat/[orderId]
 * Fetches messages for a specific order
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Access the orderId directly from params
    const orderId = params.orderId;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Get the order to check authorization
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
          }
        },
        listing: {
          include: {
            seller: {
              select: {
                id: true,
                email: true,
              }
            }
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check if the user is authorized to view this order's messages
    const isBuyer = order.buyerId === session.user.id;
    const isSeller = order.listing.sellerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    
    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: 'You do not have access to this order' }, { status: 403 });
    }
    
    // Get all messages for this order
    const messages = await prisma.chatMessage.findMany({
      where: {
        orderId: orderId,
        OR: [
          { isModOnly: false },
          { isModOnly: true, senderId: session.user.id },
          { isModOnly: true, recipientId: session.user.id, sender: { role: { in: ['ADMIN', 'MODERATOR'] } } }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Check if there's an active dispute for this order
    const dispute = await prisma.dispute.findFirst({
      where: {
        orderId: orderId
      },
      select: {
        id: true,
        status: true,
        reason: true,
        createdAt: true,
        initiator: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    // Mark messages as read if the current user is the recipient
    await prisma.chatMessage.updateMany({
      where: {
        orderId: orderId,
        recipientId: session.user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });
    
    return NextResponse.json({
      messages,
      order,
      dispute
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
} 