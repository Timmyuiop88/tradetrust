import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma';

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

    // Get and await the params
    const { userId: otherUserId } = await Promise.resolve(context.params);
    const currentUserId = session.user.id;
    
    if (!otherUserId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the other user's details
    const otherUser = await prisma.user.findUnique({
      where: {
        id: otherUserId,
      },
      select: {
        id: true,
        email: true,
        updatedAt: true,
      },
    });

    if (!otherUser) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find all orders between these users
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          {
            AND: [
              { buyerId: currentUserId },
              { listing: { sellerId: otherUserId } }
            ]
          },
          {
            AND: [
              { buyerId: otherUserId },
              { sellerId: currentUserId }
            ]
          }
        ]
      },
      select: {
        id: true
      }
    });

    const orderIds = orders.map(order => order.id);

    // Get all messages from these orders
    const messages = await prisma.chatMessage.findMany({
      where: {
        orderId: {
          in: orderIds
        }
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

    // Mark messages as read
    const unreadMessages = messages.filter(
      msg => msg.senderId === otherUserId && !msg.content.includes('[READ]')
    );

    if (unreadMessages.length > 0) {
      await Promise.all(
        unreadMessages.map(msg =>
          prisma.chatMessage.update({
            where: { id: msg.id },
            data: { content: msg.content + ' [READ]' },
          })
        )
      );
    }

    // Calculate online status (active in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const isOnline = otherUser.updatedAt > fiveMinutesAgo;

    return new NextResponse(
      JSON.stringify({
        messages,
        otherUser: {
          id: otherUser.id,
          email: otherUser.email,
          lastSeen: otherUser.updatedAt,
          isOnline,
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