import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/chat/conversations
 * Fetches all conversations (orders with messages) for the current user
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find all orders where the user is either buyer or seller
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { buyerId: session.user.id },
          { listing: { sellerId: session.user.id } }
        ]
      },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
          }
        },
        listing: {
          select: {
            id: true,
            price: true,
            seller: {
              select: {
                id: true,
                email: true,
              }
            }
          }
        },
        chatMessages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                email: true,
              }
            }
          }
        },
        _count: {
          select: {
            chatMessages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // Count unread messages for each order
    const conversationsWithUnreadCount = await Promise.all(
      orders.map(async (order) => {
        const unreadCount = await prisma.chatMessage.count({
          where: {
            orderId: order.id,
            recipientId: session.user.id,
            isRead: false
          }
        });
        
        // Determine the other user (not the current user)
        const otherUser = order.buyerId === session.user.id 
          ? order.listing.seller 
          : order.buyer;
        
        return {
          id: order.id,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          listing: {
            id: order.listing.id,
            title: order.listing.title,
            price: order.listing.price,
          },
          otherUser,
          lastMessage: order.chatMessages[0] || null,
          messageCount: order._count.chatMessages,
          unreadCount,
        };
      })
    );
    
    // Filter out orders with no messages
    const conversations = conversationsWithUnreadCount.filter(
      (conv) => conv.messageCount > 0
    );
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
} 