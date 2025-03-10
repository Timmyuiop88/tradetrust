import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '../../../lib/prisma';

export async function GET(request, context) {
  try {
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get orderId from the URL parameter
    const orderId = context.params.orderId;
    
    if (!orderId) {
      return new NextResponse(
        JSON.stringify({ error: 'Order ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Fetching messages for order: ${orderId}`);
    
    // Verify the order exists and the current user is a participant
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        listing: true,
      },
    });
    
    if (!order) {
      return new NextResponse(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the current user is the buyer or seller
    const currentUserId = session.user.id;
    const isBuyer = order.buyerId === currentUserId;
    const isSeller = order.sellerId === currentUserId;
    
    if (!isBuyer && !isSeller) {
      return new NextResponse(
        JSON.stringify({ error: 'You do not have permission to access this chat' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the other user's ID (the one who is not the current user)
    const otherUserId = isBuyer ? order.sellerId : order.buyerId;
    
    // Get the other user's details
    const otherUser = await prisma.user.findUnique({
      where: {
        id: otherUserId,
      },
      select: {
        id: true,
        email: true,
        updatedAt: true, // Use updatedAt as lastSeen
      },
    });
    
    // Get all messages for this order
    const messages = await prisma.chatMessage.findMany({
      where: {
        orderId: orderId,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    return new NextResponse(
      JSON.stringify({
        messages,
        otherUser: {
          id: otherUser.id,
          email: otherUser.email,
          lastSeen: otherUser.updatedAt,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch chat messages: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 