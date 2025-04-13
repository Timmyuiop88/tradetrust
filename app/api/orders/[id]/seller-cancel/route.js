import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
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

export async function POST(request, { params }) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the order details
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        buyer: true,
        seller: true,
        listing: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if the authenticated user is the seller of the order
    if (order.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to cancel this order' },
        { status: 403 }
      );
    }

    // Check if the order is in a status that can be canceled by the seller
    if (order.status !== 'WAITING_FOR_SELLER') {
      return NextResponse.json(
        { error: 'Order cannot be canceled in its current status' },
        { status: 400 }
      );
    }

    // Update order status to CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: 'SELLER',
      },
    });

    // Update listing to be active again
    await prisma.listing.update({
      where: { id: order.listing.id },
      data: { status: 'ACTIVE' },
    });

    // Send cancellation notification to buyer
    await sendEmail({
      to: order.buyer.email,
      subject: `Order #${order.id} has been cancelled by the seller`,
      text: `We regret to inform you that the seller has cancelled order #${order.id} for the listing "${order.listing.title}". Your payment has been refunded to your account.`,
    });

    // Send confirmation notification to seller
    await sendEmail({
      to: order.seller.email,
      subject: `You have cancelled order #${order.id}`,
      text: `You have successfully cancelled order #${order.id} for your listing "${order.listing.title}". The listing has been set back to active.`,
    });

    // Send push notification to buyer if they have push tokens
    if (order.buyer.pushTokens) {
      await sendPushNotification({
        token: order.buyer.pushTokens,
        title: 'Order Cancelled',
        body: `The seller has cancelled order #${order.id}. Your payment has been refunded.`,
        data: {
          orderId: order.id,
          type: 'order_cancelled',
        },
      });
    }

    // Send system message to chat
    await sendSystemMessage(
      params.id,
      `The seller has cancelled this order. The listing is now available for purchase again.`
    );

    return NextResponse.json({
      message: 'Order cancelled successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
} 