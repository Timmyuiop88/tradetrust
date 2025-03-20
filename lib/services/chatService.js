import { prisma } from '@/lib/prisma';
import { sendNewMessageNotification } from './notificationService';

/**
 * Unified Chat Service
 * Handles all chat operations with consistent behavior
 */
class ChatService {
  /**
   * Send a message
   * @param {Object} params - Message parameters
   * @param {string} params.senderId - Sender user ID
   * @param {string} params.recipientId - Recipient user ID
   * @param {string} params.content - Message content
   * @param {string} params.orderId - Order ID (optional)
   * @param {string} params.disputeId - Dispute ID (optional)
   * @param {boolean} params.isModOnly - Whether the message is only visible to moderators
   * @returns {Promise<Object>} - Created message
   */
  async sendMessage({ senderId, recipientId, content, orderId = null, disputeId = null, isModOnly = false }) {
    if (!senderId || !recipientId || !content) {
      throw new Error('Missing required parameters');
    }

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        senderId,
        recipientId,
        content,
        orderId,
        disputeId,
        isModOnly,
        isRead: false
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    // Send notification for the new message
    try {
      await sendNewMessageNotification(recipientId, message.id);
    } catch (error) {
      console.error('Error sending message notification:', error);
      // Continue even if notification fails
    }

    return message;
  }

  /**
   * Get messages for an order
   * @param {Object} params - Query parameters
   * @param {string} params.orderId - Order ID
   * @param {string} params.userId - Current user ID
   * @param {boolean} params.markAsRead - Whether to mark messages as read
   * @returns {Promise<Object>} - Messages and order data
   */
  async getOrderMessages({ orderId, userId, markAsRead = true }) {
    if (!orderId || !userId) {
      throw new Error('Missing required parameters');
    }

    // Get order with minimal data needed
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        listing: {
          include: {
            seller: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Check authorization
    const isBuyer = order.buyer.id === userId;
    const isSeller = order.listing.seller.id === userId;
    
    if (!isBuyer && !isSeller) {
      throw new Error('Unauthorized access to order');
    }

    // Get messages
    const messages = await prisma.chatMessage.findMany({
      where: { 
        orderId,
        OR: [
          { isModOnly: false },
          { isModOnly: true, senderId: userId },
          { isModOnly: true, recipientId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    // Get dispute if it exists
    const dispute = await prisma.dispute.findFirst({
      where: { orderId },
      select: {
        id: true,
        status: true,
        reason: true,
        createdAt: true
      }
    });

    // Mark messages as read if requested
    if (markAsRead) {
      await prisma.chatMessage.updateMany({
        where: {
          orderId,
          recipientId: userId,
          isRead: false
        },
        data: { isRead: true }
      });
    }

    return {
      messages,
      order,
      dispute
    };
  }

  /**
   * Mark messages as read
   * @param {Object} params - Parameters
   * @param {string} params.userId - User ID
   * @param {string} params.orderId - Order ID
   * @returns {Promise<number>} - Number of messages marked as read
   */
  async markMessagesAsRead({ userId, orderId }) {
    if (!userId || !orderId) {
      throw new Error('Missing required parameters');
    }

    const result = await prisma.chatMessage.updateMany({
      where: {
        orderId,
        recipientId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    return result.count;
  }

  /**
   * Get unread message count
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Number of unread messages
   */
  async getUnreadCount(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const count = await prisma.chatMessage.count({
      where: {
        recipientId: userId,
        isRead: false
      }
    });

    return count;
  }
}

// Export as singleton
export const chatService = new ChatService(); 