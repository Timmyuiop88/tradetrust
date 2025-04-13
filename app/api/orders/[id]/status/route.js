import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { sendPushNotification } from '@/lib/notifications';
import { StreamChat } from 'stream-chat';

// Initialize Stream server client
const serverClient = StreamChat.getInstance(
  process.env.GETSTREAM_API_KEY,
  process.env.GETSTREAM_API_SECRET
);

// Helper function to send system message via StreamChat
const sendSystemMessage = async (orderId, message) => {
  try {
    // Get channel for this order
    const channelId = `order-${orderId}`;
    const channel = serverClient.channel('messaging', channelId);
    
    // Send message as system user
    await channel.sendMessage({
      text: message,
      user: { 
        id: 'system', 
        name: 'System',
        image: '/images/system-avatar.png'
      },
      type: 'system'
    });
    
    return true;
  } catch (error) {
    console.error('Error sending system message:', error);
    return false;
  }
};

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            pushTokens: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            pushTokens: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            platform: true,
            images: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user is either the buyer or seller of the order
    if (
      order.buyerId !== session.user.id &&
      order.sellerId !== session.user.id &&
      !session.user.isAdmin
    ) {
      return NextResponse.json(
        { error: 'You are not authorized to view this order' },
        { status: 403 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order status' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            pushTokens: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            pushTokens: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            platform: true,
            status: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only admin can update the status
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'You are not authorized to update this order' },
        { status: 403 }
      );
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
        ...(status === 'CANCELLED' && { 
          cancelledAt: new Date(),
          cancelledBy: 'ADMIN'
        }),
      },
    });

    // If order is cancelled, set the listing status back to ACTIVE
    if (status === 'CANCELLED') {
      await prisma.listing.update({
        where: { id: order.listing.id },
        data: { status: 'ACTIVE' },
      });
    }

    // Send appropriate emails based on the new status
    let buyerSubject, buyerText, sellerSubject, sellerText, systemMessage;

    switch (status) {
      case 'WAITING_FOR_SELLER':
        buyerSubject = `Order #${order.id} status updated`;
        buyerText = `Your order #${order.id} for "${order.listing.title}" is now waiting for the seller to accept.`;
        sellerSubject = `New order #${order.id} received`;
        sellerText = `You have received a new order #${order.id} for your listing "${order.listing.title}". Please accept or decline this order.`;
        systemMessage = `The order is now waiting for the seller to accept.`;
        break;
      case 'PROCESSING':
        buyerSubject = `Order #${order.id} is now processing`;
        buyerText = `Your order #${order.id} for "${order.listing.title}" is now being processed by the seller.`;
        sellerSubject = `Order #${order.id} status updated`;
        sellerText = `Order #${order.id} for your listing "${order.listing.title}" is now in processing status.`;
        systemMessage = `The order is now being processed by the seller.`;
        break;
      case 'COMPLETED':
        buyerSubject = `Order #${order.id} has been completed`;
        buyerText = `Your order #${order.id} for "${order.listing.title}" has been completed. Thank you for your purchase!`;
        sellerSubject = `Order #${order.id} has been completed`;
        sellerText = `Order #${order.id} for your listing "${order.listing.title}" has been completed. The payment has been processed to your account.`;
        systemMessage = `This order has been marked as completed by an administrator.`;
        break;
      case 'CANCELLED':
        buyerSubject = `Order #${order.id} has been cancelled`;
        buyerText = `Your order #${order.id} for "${order.listing.title}" has been cancelled by an administrator. If you had made a payment, it will be refunded.`;
        sellerSubject = `Order #${order.id} has been cancelled`;
        sellerText = `Order #${order.id} for your listing "${order.listing.title}" has been cancelled by an administrator.`;
        systemMessage = `This order has been cancelled by an administrator.`;
        break;
      default:
        buyerSubject = `Order #${order.id} status updated`;
        buyerText = `Your order #${order.id} for "${order.listing.title}" status has been updated to ${status}.`;
        sellerSubject = `Order #${order.id} status updated`;
        sellerText = `Order #${order.id} for your listing "${order.listing.title}" status has been updated to ${status}.`;
        systemMessage = `The order status has been updated to ${status} by an administrator.`;
    }

    // Send emails to buyer and seller
    await sendEmail({
      to: order.buyer.email,
      subject: buyerSubject,
      text: buyerText,
    });

    await sendEmail({
      to: order.seller.email,
      subject: sellerSubject,
      text: sellerText,
    });

    // Send push notifications
    if (order.buyer.pushTokens) {
      await sendPushNotification({
        token: order.buyer.pushTokens,
        title: 'Order Status Updated',
        body: buyerText,
        data: {
          orderId: order.id,
          type: 'order_status_update',
        },
      });
    }

    if (order.seller.pushTokens) {
      await sendPushNotification({
        token: order.seller.pushTokens,
        title: 'Order Status Updated',
        body: sellerText,
        data: {
          orderId: order.id,
          type: 'order_status_update',
        },
      });
    }

    // Send system message to chat
    await sendSystemMessage(params.id, systemMessage);

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
} 