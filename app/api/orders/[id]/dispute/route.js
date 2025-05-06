import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/app/lib/prisma';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Properly extract the ID from params
    const orderId = params.id;
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Check if the user is involved in the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        listing: {
          include: {
            seller: true
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check if the user is the buyer or seller of the order
    const isBuyer = order.buyerId === session.user.id;
    const isSeller = order.listing.sellerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    
    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: 'You are not authorized to view this order' }, { status: 403 });
    }
    
    // Find the dispute for this order
    const dispute = await prisma.dispute.findUnique({
      where: { orderId: orderId },
      include: {
        initiator: {
          select: {
            id: true,
            email: true
          }
        },
        assignedMod: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    if (!dispute) {
      return NextResponse.json({ error: 'No dispute found for this order' }, { status: 404 });
    }
    
    return NextResponse.json({ dispute });
  } catch (error) {
    console.error('Error fetching dispute:', error);
    return NextResponse.json({ error: 'Failed to fetch dispute details' }, { status: 500 });
  }
} 