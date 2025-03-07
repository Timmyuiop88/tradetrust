import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Fetch orders where the user is either the buyer or the seller
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { listing: { sellerId: userId } }
        ]
      },
      include: {
        buyer: {
          select: {
            id: true,
            email: true
          }
        },
        listing: {
          select: {
            id: true,
            username: true,
            price: true,
            seller: {
              select: {
                id: true,
                email: true
              }
            }
          }
        },
        // Include the latest message for each order
        chatMessages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            senderId: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
} 