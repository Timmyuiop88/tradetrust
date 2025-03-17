import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/chat/messages/[orderId]
 * Fetches all messages for a specific order
 * Query params:
 * - includeDisputes: boolean - Whether to include dispute messages
 */
export default async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { params } = context;
    const orderId = params.orderId;
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Check if the user is authorized to view this order's messages
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: { id: true }
        },
        listing: {
          select: {
            seller: {
              select: { id: true }
            }
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check if the user is either the buyer or seller of this order
    const isBuyer = order.buyer.id === session.user.id;
    const isSeller = order.listing.seller.id === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    
    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: 'You are not authorized to view these messages' }, { status: 403 });
    }
    
    // Get URL search params
    const searchParams = request.nextUrl.searchParams;
    const includeDisputes = searchParams.get('includeDisputes') === 'true';
    
    // Get chat messages for this order
    const chatMessages = await prisma.chatMessage.findMany({
      where: {
        orderId: orderId,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    let allMessages = [...chatMessages];
    
    // If includeDisputes is true, also fetch dispute messages
    if (includeDisputes) {
      // Find disputes related to this order
      const disputes = await prisma.dispute.findMany({
        where: {
          orderId: orderId
        },
        select: {
          id: true
        }
      });
      
      const disputeIds = disputes.map(dispute => dispute.id);
      
      if (disputeIds.length > 0) {
        // Get dispute messages
        const disputeMessages = await prisma.disputeMessage.findMany({
          where: {
            disputeId: {
              in: disputeIds
            },
            // Only include non-mod-only messages unless the user is an admin
            OR: [
              { isModOnly: false },
              { isModOnly: true, sender: { role: 'ADMIN' } },
              { isModOnly: true, sender: { id: session.user.id } }
            ]
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                role: true,
              }
            },
            dispute: {
              select: {
                id: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        });
        
        // Format dispute messages to match chat messages structure
        const formattedDisputeMessages = disputeMessages.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          sender: msg.sender,
          content: msg.content,
          createdAt: msg.createdAt,
          isRead: true, // Dispute messages don't have read status
          isDisputeMessage: true,
          disputeId: msg.dispute.id,
          orderId: orderId,
        }));
        
        // Combine chat messages and dispute messages
        allMessages = [...allMessages, ...formattedDisputeMessages];
        
        // Sort all messages by timestamp
        allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }
    }
    
    // Mark messages as read if the user is the recipient
    const unreadMessageIds = chatMessages
      .filter(msg => msg.recipientId === session.user.id && !msg.isRead)
      .map(msg => msg.id);
    
    if (unreadMessageIds.length > 0) {
      await prisma.chatMessage.updateMany({
        where: {
          id: {
            in: unreadMessageIds
          }
        },
        data: {
          isRead: true
        }
      });
    }
    
    return NextResponse.json({ 
      messages: allMessages,
      order: {
        id: order.id,
        status: order.status,
        buyerId: order.buyerId,
        sellerId: order.listing.seller.id,
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
} 