import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Check if an order has an active dispute
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const orderId = params.orderId;
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Get the order to check authorization
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check if the user is authorized to view this order
    const isBuyer = order.buyerId === session.user.id;
    const isSeller = order.listing.sellerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    
    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: 'You do not have access to this order' }, { status: 403 });
    }
    
    // Find active dispute for this order
    const dispute = await prisma.dispute.findFirst({
      where: {
        orderId: orderId,
        status: 'OPEN'
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
          }
        }
      }
    });
    
    if (!dispute) {
      return NextResponse.json({ exists: false });
    }
    
    return NextResponse.json({
      exists: true,
      id: dispute.id,
      reason: dispute.reason,
      status: dispute.status,
      createdAt: dispute.createdAt,
      createdBy: dispute.createdBy
    });
  } catch (error) {
    console.error('Error checking dispute:', error);
    return NextResponse.json(
      { error: 'Failed to check dispute status' },
      { status: 500 }
    );
  }
} 