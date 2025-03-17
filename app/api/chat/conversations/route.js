import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/chat/conversations
 * Fetches all conversations (orders with messages) for the current user
 */
export default async function GET(request) {
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
          include: {
            platform: true,
            seller: {
              select: {
                id: true,
                email: true,
              }
            }
          }
        },
        // Get the latest message to show a preview
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
    
    // Count unread messages for each conversation
    const conversationsWithUnread = await Promise.all(
      orders.map(async (order) => {
        const unreadCount = await prisma.chatMessage.count({
          where: {
            orderId: order.id,
            recipientId: session.user.id,
            isRead: false
          }
        });
        
        return {
          ...order,
          unreadCount
        };
      })
    );
    
    return NextResponse.json(conversationsWithUnread);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'An error occurred while fetching conversations' }, { status: 500 });
  }
}