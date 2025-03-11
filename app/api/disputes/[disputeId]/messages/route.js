import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma';

// GET - Fetch messages for a dispute
export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { disputeId } = await Promise.resolve(context.params);

    // Get the dispute to check permissions
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          select: {
            buyerId: true,
            listing: {
              select: {
                sellerId: true,
              },
            },
          },
        },
      },
    });

    if (!dispute) {
      return new NextResponse(
        JSON.stringify({ error: 'Dispute not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user is authorized to view messages
    const isBuyer = dispute.order.buyerId === session.user.id;
    const isSeller = dispute.order.listing.sellerId === session.user.id;
    const isModerator = session.user.role === 'ADMIN';
    const isAssignedMod = dispute.assignedModId === session.user.id;

    if (!isBuyer && !isSeller && !(isModerator || isAssignedMod)) {
      return new NextResponse(
        JSON.stringify({ error: 'You are not authorized to view these messages' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get messages
    let messages = await prisma.disputeMessage.findMany({
      where: { disputeId },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Filter out mod-only messages for non-moderators
    if (!isModerator && !isAssignedMod) {
      messages = messages.filter(msg => !msg.isModOnly);
    }

    return new NextResponse(
      JSON.stringify({ messages }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error fetching dispute messages:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch dispute messages: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST - Send a message in a dispute
export async function POST(request, context) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { disputeId } = await Promise.resolve(context.params);
    const body = await request.json();
    const { content, isModOnly = false, attachments = [] } = body;

    if (!content) {
      return new NextResponse(
        JSON.stringify({ error: 'Message content is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the dispute to check permissions
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          select: {
            buyerId: true,
            listing: {
              select: {
                sellerId: true,
              },
            },
          },
        },
      },
    });

    if (!dispute) {
      return new NextResponse(
        JSON.stringify({ error: 'Dispute not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user is authorized to send messages
    const isBuyer = dispute.order.buyerId === session.user.id;
    const isSeller = dispute.order.listing.sellerId === session.user.id;
    const isModerator = session.user.role === 'ADMIN';
    const isAssignedMod = dispute.assignedModId === session.user.id;

    if (!isBuyer && !isSeller && !(isModerator || isAssignedMod)) {
      return new NextResponse(
        JSON.stringify({ error: 'You are not authorized to send messages in this dispute' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Only moderators can send mod-only messages
    if (isModOnly && !(isModerator || isAssignedMod)) {
      return new NextResponse(
        JSON.stringify({ error: 'Only moderators can send moderator-only messages' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create the message
    const message = await prisma.disputeMessage.create({
      data: {
        dispute: {
          connect: { id: disputeId },
        },
        sender: {
          connect: { id: session.user.id },
        },
        content,
        isModOnly,
        attachments,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Update the dispute's updatedAt timestamp
    await prisma.dispute.update({
      where: { id: disputeId },
      data: { updatedAt: new Date() },
    });

    return new NextResponse(
      JSON.stringify({ message }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error sending dispute message:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to send dispute message: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 