import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * POST /api/chat/send
 * Sends a new message
 * Body:
 * - content: string - The message content
 * - orderId: string - The ID of the order this message is related to
 * - disputeId: string - The ID of the dispute (if applicable)
 */
export default async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { content, orderId, isDisputeMessage, disputeId, isModOnly } = body;
    
    if (!content || !orderId) {
      return NextResponse.json({ error: 'Content and orderId are required' }, { status: 400 });
    }
    
    // Get the order to determine the recipient
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        listing: {
          include: {
            seller: true
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Determine if the sender is the buyer or seller
    const isBuyer = order.buyerId === session.user.id;
    const isSeller = order.listing.sellerId === session.user.id;
    
    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: 'You are not authorized to send messages for this order' }, { status: 403 });
    }
    
    // Determine the recipient based on the sender
    const recipientId = isBuyer ? order.listing.sellerId : order.buyerId;
    
    // Check if there's an active dispute for this order
    const activeDispute = await prisma.dispute.findFirst({
      where: {
        orderId: orderId,
        status: 'OPEN'
      }
    });
    
    // Create the message - note that isDisputeMessage is not in the schema
    // so we don't include it in the data object
    const message = await prisma.chatMessage.create({
      data: {
        senderId: session.user.id,
        recipientId: recipientId,
        content: content,
        orderId: orderId,
        disputeId: disputeId || (activeDispute ? activeDispute.id : null),
        isModOnly: isModOnly || false
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
} 