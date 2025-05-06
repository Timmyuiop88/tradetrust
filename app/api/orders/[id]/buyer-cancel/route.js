import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { sendPushNotification } from '@/lib/notifications';
import { differenceInMinutes } from 'date-fns';
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
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        listing: true,
        buyer: true,
        seller: true,
      },
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check if the user is the buyer
    if (order.buyerId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Only the buyer can cancel this order' 
      }, { status: 403 });
    }
    
    // Check order status
    if (order.status !== 'WAITING_FOR_SELLER') {
      return NextResponse.json({ 
        error: 'Can only cancel when waiting for seller' 
      }, { status: 400 });
    }
    
    // Check if seller deadline has expired
    const sellerDeadline = new Date(order.sellerDeadline);
    const now = new Date();
    const isExpired = now > sellerDeadline;
    
    if (!isExpired) {
      return NextResponse.json({ 
        error: 'Cannot cancel order before seller deadline expires' 
      }, { status: 400 });
    }
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledReason: 'SELLER_DEADLINE_EXPIRED',
      },
    });
    
    // Set listing back to active
    await prisma.listing.update({
      where: { id: order.listingId },
      data: { isActive: true },
    });
    
    // Send email to seller
    await sendEmail({
      to: order.seller.email,
      subject: `Order #${order.id} has been cancelled`,
      text: `The buyer has cancelled order #${order.id} because you did not provide credentials within the deadline. The listing has been set back to active.`,
    });
    
    // Send email to buyer
    await sendEmail({
      to: order.buyer.email,
      subject: `Order #${order.id} has been cancelled`,
      text: `You have cancelled order #${order.id} because the seller did not provide credentials within the deadline. A refund will be processed.`,
    });
    
    // Send push notifications if possible
    if (order.seller.pushTokens) {
      await sendPushNotification({
        token: order.seller.pushTokens,
        title: 'Order Cancelled',
        body: `Order #${order.id} has been cancelled due to missed deadline.`,
        data: {
          orderId: order.id,
          type: 'order_cancelled',
        },
      });
    }
    
    // Send system message to chat (server-side)
    await sendSystemMessage(
      params.id, 
      `Order has been cancelled by the buyer due to expired seller deadline. The listing has been returned to active status.`
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