import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { chatService } from '@/lib/services/chatService';

/**
 * POST /api/chat/send
 * Sends a new message
 * Body:
 * - content: string - The message content
 * - orderId: string - The ID of the order this message is related to
 * - disputeId: string - The ID of the dispute (if applicable)
 * - isModOnly: boolean - Whether the message is only visible to moderators
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { content, orderId, disputeId, isModOnly } = body;
    
    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Get the order to determine the recipient
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: {
            id: true
          }
        },
        listing: {
          include: {
            seller: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Determine if the sender is the buyer or seller
    const isBuyer = order.buyer.id === session.user.id;
    const isSeller = order.listing.seller.id === session.user.id;
   
    
    if (!isBuyer && !isSeller ) {
      return NextResponse.json({ 
        error: 'You are not authorized to send messages for this order' 
      }, { status: 403 });
    }
    
    // Determine the recipient based on the sender
    const recipientId = isBuyer ? order.listing.seller.id : order.buyer.id;
    
    try {
      // Use the chat service to send the message
      const message = await chatService.sendMessage({
        senderId: session.user.id,
        recipientId,
        content,
        orderId,
        disputeId,
        isModOnly: isModOnly || false
      });
      
      return NextResponse.json(message);
    } catch (serviceError) {
      console.error('Chat service error:', serviceError);
      return NextResponse.json({ 
        error: 'Failed to send message', 
        message: serviceError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ 
      error: 'Failed to send message', 
      message: error.message 
    }, { status: 500 });
  }
} 