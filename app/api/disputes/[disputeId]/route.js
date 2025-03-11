import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma';

// GET - Fetch a specific dispute
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

    // Get the dispute with related data
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
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
            createdAt: 'asc',
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
        },
      },
    });

    if (!dispute) {
      return new NextResponse(
        JSON.stringify({ error: 'Dispute not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user is authorized to view this dispute
    const isBuyer = dispute.order.buyerId === session.user.id;
    const isSeller = dispute.order.listing.sellerId === session.user.id;
    const isModerator = session.user.role === 'ADMIN';
    const isAssignedMod = dispute.assignedModId === session.user.id;

    if (!isBuyer && !isSeller && !(isModerator || isAssignedMod)) {
      return new NextResponse(
        JSON.stringify({ error: 'You are not authorized to view this dispute' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Filter out mod-only messages for non-moderators
    if (!isModerator && !isAssignedMod) {
      dispute.messages = dispute.messages.filter(msg => !msg.isModOnly);
    }

    return new NextResponse(
      JSON.stringify({ dispute }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error fetching dispute:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch dispute: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// PATCH - Update a dispute (status, assign moderator, etc.)
export async function PATCH(request, context) {
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
    const { status, resolution, assignedModId } = body;

    // Get the dispute
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
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
      },
    });

    if (!dispute) {
      return new NextResponse(
        JSON.stringify({ error: 'Dispute not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user is authorized to update this dispute
    const isModerator = session.user.role === 'ADMIN';
    const isAssignedMod = dispute.assignedModId === session.user.id;

    if (!(isModerator || isAssignedMod)) {
      return new NextResponse(
        JSON.stringify({ error: 'You are not authorized to update this dispute' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update the dispute
    const updateData = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (resolution) {
      updateData.resolution = resolution;
    }
    
    if (assignedModId) {
      // Only allow assigning moderators if the user is a moderator
      if (!isModerator) {
        return new NextResponse(
          JSON.stringify({ error: 'Only moderators can assign disputes' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if the assigned user is a moderator
      const assignedMod = await prisma.user.findUnique({
        where: { id: assignedModId },
        select: { role: true },
      });
      
      if (!assignedMod || assignedMod.role !== 'ADMIN') {
        return new NextResponse(
          JSON.stringify({ error: 'The assigned user must be a moderator' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      updateData.assignedModId = assignedModId;
    }

    // Update the dispute
    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: updateData,
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
      },
    });

    // Create a system message about the update
    let systemMessage = '';
    
    if (status) {
      systemMessage = `Dispute status updated to ${status} by ${session.user.email}`;
      
      if (resolution) {
        systemMessage += `. Resolution: ${resolution}`;
      }
      
      // If the dispute is resolved, update the order status accordingly
      if (status.startsWith('RESOLVED_')) {
        let orderStatus;
        
        if (status === 'RESOLVED_BUYER_FAVOR') {
          orderStatus = 'CANCELLED'; // Refund to buyer
        } else if (status === 'RESOLVED_SELLER_FAVOR') {
          orderStatus = 'COMPLETED'; // Release funds to seller
        } else {
          orderStatus = 'COMPLETED'; // Default to completed for compromise
        }
        
        await prisma.order.update({
          where: { id: dispute.orderId },
          data: { status: orderStatus },
        });
        
        systemMessage += `. Order status updated to ${orderStatus}.`;
      }
    } else if (assignedModId) {
      const assignedMod = await prisma.user.findUnique({
        where: { id: assignedModId },
        select: { email: true },
      });
      
      systemMessage = `Dispute assigned to moderator ${assignedMod.email} by ${session.user.email}`;
    }
    
    if (systemMessage) {
      await prisma.disputeMessage.create({
        data: {
          dispute: {
            connect: { id: disputeId },
          },
          sender: {
            connect: { id: session.user.id },
          },
          content: systemMessage,
          isModOnly: false, // Visible to all parties
        },
      });
    }

    return new NextResponse(
      JSON.stringify({ dispute: updatedDispute }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error updating dispute:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update dispute: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 