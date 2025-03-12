import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = session.user.id;
    const params = await context.params;
    const otherUserId = params.userId;

    if (!otherUserId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the other user
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        email: true,
      }
    });

    if (!otherUser) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find orders between the two users (most recent first)
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          {
            buyerId: session.user.id,
            listing: {
              sellerId: otherUserId
            }
          },
          {
            buyerId: otherUserId,
            listing: {
              sellerId: session.user.id
            }
          }
        ]
      },
      include: {
        listing: {
          select: {
            id: true,
            price: true,
            sellerId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get messages between the two users
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
          },
          {
            senderId: otherUserId,
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Mark messages as read - using content field since isRead doesn't exist
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
        otherUser,
        messages,
        orders,
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
    console.error('Error fetching messages:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch messages: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 