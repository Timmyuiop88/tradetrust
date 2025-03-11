import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma';

// GET - Fetch all disputes for the current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role'); // 'initiator', 'moderator', or 'involved'

    let whereClause = {};

    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }

    // Filter by user role
    if (role === 'moderator' && session.user.role === 'ADMIN') {
      // For moderators, show assigned disputes or unassigned ones
      whereClause.OR = [
        { assignedModId: session.user.id },
        { assignedModId: null }
      ];
    } else if (role === 'initiator') {
      // Show disputes initiated by the user
      whereClause.initiatorId = session.user.id;
    } else {
      // Default: show all disputes where the user is involved (as buyer or seller)
      whereClause.OR = [
        { initiatorId: session.user.id },
        { order: { buyerId: session.user.id } },
        { order: { sellerId: session.user.id } }
      ];
    }

    const disputes = await prisma.dispute.findMany({
      where: whereClause,
      include: {
        order: {
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
          },
        },
        initiator: {
          select: {
            id: true,
            email: true,
          },
        },
        assignedMod: {
          select: {
            id: true,
            email: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return new NextResponse(
      JSON.stringify({ disputes }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch disputes: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST - Create a new dispute
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { orderId, reason, description, evidence = [] } = body;

    if (!orderId || !reason || !description) {
      return new NextResponse(
        JSON.stringify({ error: 'Order ID, reason, and description are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the order exists and the user is involved in it
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        listing: {
          include: {
            seller: true
          }
        },
        dispute: true
      }
    });

    if (!order) {
      return new NextResponse(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user is involved in the order
    const isBuyer = order.buyerId === session.user.id;
    const isSeller = order.listing.sellerId === session.user.id;

    if (!isBuyer && !isSeller) {
      return new NextResponse(
        JSON.stringify({ error: 'You are not authorized to create a dispute for this order' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if a dispute already exists for this order
    if (order.dispute) {
      return new NextResponse(
        JSON.stringify({ error: 'A dispute already exists for this order' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create the dispute
    const dispute = await prisma.dispute.create({
      data: {
        order: {
          connect: { id: orderId },
        },
        initiator: {
          connect: { id: session.user.id },
        },
        reason,
        description,
        evidence,
        status: 'OPEN',
      },
      include: {
        order: {
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
          },
        },
        initiator: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Create an initial system message
    await prisma.disputeMessage.create({
      data: {
        dispute: {
          connect: { id: dispute.id },
        },
        sender: {
          connect: { id: session.user.id },
        },
        content: `Dispute opened by ${session.user.email} for reason: ${reason}. ${description}`,
        isModOnly: false,
      },
    });

    // Update the order status to DISPUTED
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'DISPUTED' },
    });

    return new NextResponse(
      JSON.stringify({ dispute }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error creating dispute:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create dispute: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 