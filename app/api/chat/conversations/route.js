import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma';

export async function GET(request) {
  try {
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const currentUserId = session.user.id;

    // Find all orders where the current user is involved
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { buyerId: currentUserId },
          { sellerId: currentUserId }
        ]
      },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
          },
        },
        listing: {
          include: {
            seller: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        chatMessages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    // Transform the orders into conversations
    const conversationsMap = new Map();

    for (const order of orders) {
      // Determine the other user (buyer or seller)
      const otherUser = order.buyerId === currentUserId 
        ? { id: order.listing.sellerId, email: order.listing.seller.email }
        : { id: order.buyerId, email: order.buyer.email };
      
      // Skip if we've already processed this user
      if (conversationsMap.has(otherUser.id)) {
        // If we already have this user, check if this order has a more recent message
        const existingConversation = conversationsMap.get(otherUser.id);
        const existingLastMessageTime = existingConversation.lastMessageTime || 0;
        
        const currentLastMessage = order.chatMessages[0];
        const currentLastMessageTime = currentLastMessage ? new Date(currentLastMessage.createdAt).getTime() : 0;
        
        // Only update if this order has a more recent message
        if (currentLastMessageTime > existingLastMessageTime) {
          const lastMessage = currentLastMessage?.content || 'No messages yet';
          
          conversationsMap.set(otherUser.id, {
            ...existingConversation,
            lastMessage: lastMessage.replace('[READ]', '').trim(),
            lastMessageTime: currentLastMessageTime,
            orderId: order.id,
          });
        }
        
        continue;
      }
      
      // Get the last message for this order
      const lastMessage = order.chatMessages[0]?.content || 'No messages yet';
      const lastMessageTime = order.chatMessages[0] ? new Date(order.chatMessages[0].createdAt).getTime() : 0;
      
      // Count unread messages
      const unreadCount = await prisma.chatMessage.count({
        where: {
          orderId: order.id,
          senderId: otherUser.id,
          NOT: {
            content: {
              contains: '[READ]',
            },
          },
        },
      });
      
      // Add to conversations map
      conversationsMap.set(otherUser.id, {
        userId: otherUser.id,
        email: otherUser.email,
        lastMessage: lastMessage.replace('[READ]', '').trim(),
        lastMessageTime,
        unreadCount,
        orderId: order.id,
      });
    }

    // Convert map to array and sort by most recent message
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => b.lastMessageTime - a.lastMessageTime);

    return new NextResponse(
      JSON.stringify({ conversations }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch conversations: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 