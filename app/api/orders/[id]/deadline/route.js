import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { addMinutes } from 'date-fns';

import { StreamChat } from 'stream-chat';
import * as emailService from '@/lib/email/emailService';
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
   
    // Check if channel exists
    const existingChannels = await serverClient.queryChannels({ 
      id: channelId,
      type: 'messaging' 
    });

    let channel;
    
    if (existingChannels?.length > 0) {
      channel = existingChannels[0];
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
     
    }
    
   
  } catch (error) {
    console.error('Error sending system message:', error);
    return false;
  }
};

// Helper function to validate deadline extension
const validateDeadlineExtension = async (orderId, userRole, session) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: {
        select: { id: true, email: true, name: true, pushTokens: true }
      },
      seller: {
        select: { id: true, email: true, name: true, pushTokens: true }
      }
    }
  });

  if (!order) {
    return { error: 'Order not found', status: 404 };
  }

  // Verify user is part of this order
  if (session.user.id !== order.buyerId && session.user.id !== order.sellerId) {
    return { error: 'Unauthorized', status: 403 };
  }

  // Check if the user is in the correct role for this action
  if (userRole === 'buyer' && session.user.id !== order.buyerId) {
    return { error: 'Only the buyer can perform this action', status: 403 };
  }

  if (userRole === 'seller' && session.user.id !== order.sellerId) {
    return { error: 'Only the seller can perform this action', status: 403 };
  }

  // Verify order status is appropriate
  if (userRole === 'buyer' && order.status !== 'WAITING_FOR_SELLER') {
    return { error: 'Can only extend seller deadline when waiting for seller', status: 400 };
  }

  if (userRole === 'seller' && order.status !== 'WAITING_FOR_BUYER') {
    return { error: 'Can only extend buyer deadline when waiting for buyer', status: 400 };
  }

  // Check if deadline is actually expired
  const relevantDeadline = userRole === 'buyer' ? order.sellerDeadline : order.buyerDeadline;
  const isExpired = new Date(relevantDeadline) < new Date();

  if (!isExpired) {
    return { error: 'Deadline is not expired yet', status: 400 };
  }

  return { order };
};

// Handler for deadline extension and reminders
export async function POST(request, { params }) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {  action } = body;
  
    // Get order details 
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
       
        listing: true
      },
    });

    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (session.user.id === order.buyerId) {
      var type = 'buyer';
     } else {
      var type = 'seller';
     }

    const buyer = await prisma.user.findUnique({
      where: { id: order.buyerId },
    });

    const seller = await prisma.user.findUnique({
      where: { id: order.sellerId },
    }); 
    // Handle different deadline types
    if (session.user.id === order.buyerId) {
      // Verify the user is the buyer for seller deadline extensions
      if (order.buyerId !== session.user.id) {
        return NextResponse.json({ error: 'Only the buyer can extend seller deadline' }, { status: 403 });
      }

      if (action === 'extend') {
        // Extend seller deadline by 15 minutes
        const newDeadline = addMinutes(new Date(order.sellerDeadline), 15);
        
        // Update order with new deadline
        const updatedOrder = await prisma.order.update({
          where: { id: params.id },
          data: { sellerDeadline: newDeadline },
        });

        // Send notification to seller
        await emailService.sendNotificationEmail(seller, {
          subject: `Seller Deadline Extended for Order #${order.id}`,
          message: `The buyer has extended your deadline for providing credentials for order #${order.id}. You now have until ${newDeadline.toLocaleString()}.`,
          actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${order.id}`,
          actionText: 'View Order'
        });
        // Send push notification to seller
        if (seller.pushTokens) {
         
        }

        // Send system message to chat
        await sendSystemMessage(
          order.id,
          `The buyer has sent a reminder. The seller's deadline has been extended by 15 minutes.`
        );

        return NextResponse.json({
          message: 'Seller deadline extended successfully',
          order: updatedOrder,
        });
      }
      
      // Handle other seller deadline actions if needed
    } else if (session.user.id === order.sellerId) {
      // Verify the user is the seller for buyer deadline extensions
      if (order.sellerId !== session.user.id) {
        return NextResponse.json({ error: 'Only the seller can extend buyer deadline' }, { status: 403 });
      }

      if (action === 'extend') {
        // Extend buyer deadline by 15 minutes
        const newDeadline = addMinutes(new Date(order.buyerDeadline), 15);
        
        // Update order with new deadline
        const updatedOrder = await prisma.order.update({
          where: { id: params.id },
          data: { buyerDeadline: newDeadline },
        });

        // Send notification to buyer
        await emailService.sendNotificationEmail(buyer, {
          subject: `Buyer Deadline Extended for Order #${order.id}`,
          message: `The seller has extended your deadline for confirming receipt for order #${order.id}. You now have until ${newDeadline.toLocaleString()}.`,
          actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${order.id}`,
          actionText: 'View Order'
        });

        // Send push notification to buyer
        if (buyer.pushTokens) {
        
        }

        // Send system message to chat
        await sendSystemMessage(
          params.id,
          `The seller has sent a reminder. The buyer's deadline has been extended by 15 minutes.`
        );

        return NextResponse.json({
          message: 'Buyer deadline extended successfully',
          order: updatedOrder,
        });
      } else if (action === 'auto-release') {
        // Auto-release payment if buyer deadline expired
        if (order.status !== 'WAITING_FOR_BUYER') {
          return NextResponse.json({ error: 'Order is not in waiting for buyer state' }, { status: 400 });
        }

        const currentTime = new Date();
        const buyerDeadline = new Date(order.buyerDeadline);

        if (currentTime < buyerDeadline) {
          return NextResponse.json({ error: 'Buyer deadline has not expired yet' }, { status: 400 });
        }

        // Update order to completed
        const updatedOrder = await prisma.order.update({
          where: { id: params.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            completedBy: 'AUTO',
          },
        });

        // Send notification to buyer
          await emailService.sendNotificationEmail(buyer, {
            subject: `Auto-Completion of Order #${order.id}`,
            message: `Order #${order.id} has been automatically completed as you did not confirm receipt within the deadline. Payment has been released to the seller.`,
          });

        // Send notification to seller
        await emailService.sendNotificationEmail(seller, {
          subject: `Auto-Completion of Order #${order.id}`,
          message: `Order #${order.id} has been automatically completed as the buyer did not confirm receipt within the deadline. Payment has been released to you.`,
        });

        // Send push notifications
      // Send push notification using PushNotificationService
     


        // Send system message to chat
        await sendSystemMessage(
          params.id,
          `The order has been automatically completed as the buyer did not confirm receipt within the deadline. Payment has been released to the seller.`
        );

        return NextResponse.json({
          message: 'Payment auto-released successfully',
          order: updatedOrder,
        });
      }
      
      // Handle other buyer deadline actions if needed
    }

    return NextResponse.json({ error: 'Invalid deadline type or action' }, { status: 400 });
  } catch (error) {
    console.error('Error handling deadline action:', error);
    return NextResponse.json({ error: 'Failed to process deadline action' }, { status: 500 });
  }
} 