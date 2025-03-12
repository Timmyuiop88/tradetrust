import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma';

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Properly handle the params object - await it
    const { params } = context;
    const otherUserId = await Promise.resolve(params.userId);
    
    if (!otherUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Find all orders between the current user and the other user
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          // Current user is buyer, other user is seller
          {
            buyerId: session.user.id,
            listing: {
              sellerId: otherUserId
            }
          },
          // Current user is seller, other user is buyer
          {
            buyerId: otherUserId,
            listing: {
              sellerId: session.user.id
            }
          }
        ]
      },
      select: {
        id: true
      }
    });
    
    const orderIds = orders.map(order => order.id);
    
    // Find all disputes related to these orders
    const disputes = await prisma.dispute.findMany({
      where: {
        orderId: {
          in: orderIds
        }
      },
      include: {
        order: {
          select: {
            id: true,
            buyerId: true,
            listing: {
              select: {
                id: true,
                sellerId: true
              }
            }
          }
        },
        initiator: {
          select: {
            id: true,
            email: true
          }
        },
        assignedMod: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Get all dispute messages from these disputes
    const disputeIds = disputes.map(dispute => dispute.id);
    
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
            role: true
          }
        },
        dispute: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Format messages to include disputeId
    const formattedMessages = disputeMessages.map(msg => ({
      ...msg,
      disputeId: msg.dispute.id
    }));
    
    return NextResponse.json({ 
      disputes,
      messages: formattedMessages
    });
  } catch (error) {
    console.error('Error fetching dispute messages:', error);
    return NextResponse.json({ error: 'Failed to fetch dispute messages' }, { status: 500 });
  }
} 