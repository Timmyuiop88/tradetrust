import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/chat/mark-read
 * Marks messages as read
 * Body:
 * - messageIds: string[] - Array of message IDs to mark as read
 */
export default async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageIds } = body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json({ error: 'Message IDs are required' }, { status: 400 });
    }

    // Verify that the user is the recipient of these messages
    const messages = await prisma.chatMessage.findMany({
      where: {
        id: {
          in: messageIds
        }
      },
      select: {
        id: true,
        recipientId: true
      }
    });

    // Filter out messages where the user is not the recipient
    const validMessageIds = messages
      .filter(msg => msg.recipientId === session.user.id)
      .map(msg => msg.id);

    if (validMessageIds.length === 0) {
      return NextResponse.json({ error: 'No valid messages to mark as read' }, { status: 400 });
    }

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        id: {
          in: validMessageIds
        }
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ 
      success: true,
      markedCount: validMessageIds.length
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ 
      error: 'Failed to mark messages as read', 
      details: error.message 
    }, { status: 500 });
  }
} 