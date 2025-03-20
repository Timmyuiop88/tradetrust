import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch a specific dispute
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const disputeId = params.disputeId;
    
    if (!disputeId) {
      return NextResponse.json({ error: 'Dispute ID is required' }, { status: 400 });
    }
    
    // Get the dispute with related order and user details
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          include: {
            buyer: {
              select: {
                id: true,
                email: true,
              }
            },
            listing: {
              include: {
                seller: {
                  select: {
                    id: true,
                    email: true,
                  }
                }
              }
            }
          }
        },
        initiator: {
          select: {
            id: true,
            email: true,
          }
        }
      }
    });
    
    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }
    
    // Check if the user is authorized to view this dispute
    const isBuyer = dispute.order.buyerId === session.user.id;
    const isSeller = dispute.order.listing.sellerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    
    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: 'You do not have access to this dispute' }, { status: 403 });
    }
    
    // Format the response
    const formattedDispute = {
      id: dispute.id,
      orderId: dispute.orderId,
      reason: dispute.reason,
      status: dispute.status,
      resolution: dispute.resolution,
      createdAt: dispute.createdAt,
      updatedAt: dispute.updatedAt,
      createdBy: dispute.createdBy,
      order: {
        id: dispute.order.id,
        status: dispute.order.status,
        buyer: dispute.order.buyer,
        seller: dispute.order.listing.seller,
        listing: {
          id: dispute.order.listing.id,
          title: dispute.order.listing.title || 'Unnamed Listing',
          price: dispute.order.listing.price,
        }
      }
    };
    
    return NextResponse.json(formattedDispute);
  } catch (error) {
    console.error('Error fetching dispute:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dispute details' },
      { status: 500 }
    );
  }
}

// PATCH - Update a dispute (status, assign moderator, etc.)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const disputeId = params.disputeId;
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
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    // Check if the user is authorized to update this dispute
    const isModerator = session.user.role === 'ADMIN';
    const isAssignedMod = dispute.assignedModId === session.user.id;

    if (!(isModerator || isAssignedMod)) {
      return NextResponse.json({ error: 'You are not authorized to update this dispute' }, { status: 403 });
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
        return NextResponse.json({ error: 'Only moderators can assign disputes' }, { status: 403 });
      }
      
      // Check if the assigned user is a moderator
      const assignedMod = await prisma.user.findUnique({
        where: { id: assignedModId },
        select: { role: true },
      });
      
      if (!assignedMod || assignedMod.role !== 'ADMIN') {
        return NextResponse.json({ error: 'The assigned user must be a moderator' }, { status: 400 });
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
        createdBy: {
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
    }
    
    if (resolution) {
      systemMessage += systemMessage ? ' with resolution: ' : `Resolution added by ${session.user.email}: `;
      systemMessage += resolution;
    }
    
    if (systemMessage) {
      await prisma.chatMessage.create({
        data: {
          senderId: session.user.id,
          recipientId: dispute.order.buyerId === session.user.id ? dispute.order.listing.sellerId : dispute.order.buyerId,
          content: systemMessage,
          orderId: dispute.orderId,
          isDisputeMessage: true,
          disputeId: disputeId,
          isSystemMessage: true,
        },
      });
    }

    return NextResponse.json(updatedDispute);
  } catch (error) {
    console.error('Error updating dispute:', error);
    return NextResponse.json({ error: 'Failed to update dispute' }, { status: 500 });
  }
}
      