import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  `mailto:${'info@tradetrust.com'}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send a push notification to a user
 * @param {string} userId - User ID
 * @param {Object} notification - Notification data
 * @param {string} notification.title - Notification title
 * @param {string} notification.body - Notification body
 * @param {string} notification.icon - Notification icon URL
 * @param {string} notification.url - URL to open when notification is clicked
 * @param {Object} notification.data - Additional data to send with notification
 * @returns {Promise<Array>} - Array of results from sending notifications
 */
export const sendPushNotification = async (userId, notification) => {
  try {
    // Get all push subscriptions for the user
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      return [];
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/logo.png',
      badge: '/badge.png',
      data: {
        url: notification.url,
        ...notification.data
      }
    });

    // Send notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const parsedSubscription = JSON.parse(subscription.subscription);
          const result = await webpush.sendNotification(parsedSubscription, payload);
          return result;
        } catch (error) {
          // If subscription is invalid or expired, delete it
          if (error.statusCode === 404 || error.statusCode === 410) {
            await prisma.pushSubscription.delete({
              where: { id: subscription.id }
            });
          }
          throw error;
        }
      })
    );

    return results;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

/**
 * Send a dispute notification
 * @param {string} userId - User ID
 * @param {Object} dispute - Dispute details
 * @param {boolean} isUpdate - Whether this is an update to an existing dispute
 * @returns {Promise<Array>} - Array of results from sending notifications
 */
export const sendDisputePushNotification = async (userId, dispute, isUpdate = false) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/disputes/${dispute.id}`;
  
  const title = isUpdate 
    ? `Dispute Update: ${dispute.status}` 
    : 'New Dispute Notification';
  
  const body = isUpdate
    ? `The status of your dispute for order #${dispute.orderId.substring(0, 8)} has been updated to ${dispute.status}.`
    : `A dispute has been opened for order #${dispute.orderId.substring(0, 8)}.`;
  
  return sendPushNotification(userId, {
    title,
    body,
    url,
    data: {
      type: 'dispute',
      disputeId: dispute.id,
      orderId: dispute.orderId,
      status: dispute.status
    }
  });
};

/**
 * Send a message notification
 * @param {string} userId - User ID
 * @param {Object} message - Message details
 * @param {Object} sender - Sender details
 * @param {string} orderId - Optional order ID
 * @param {string} disputeId - Optional dispute ID
 * @returns {Promise<Array>} - Array of results from sending notifications
 */
export const sendMessagePushNotification = async (userId, message, sender, orderId = null, disputeId = null) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  let url = `${baseUrl}/messages`;
  
  if (orderId) {
    url = `${baseUrl}/orders/${orderId}/chat`;
  } else if (disputeId) {
    url = `${baseUrl}/disputes/${disputeId}`;
  }
  
  const senderName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'Someone';
  
  return sendPushNotification(userId, {
    title: 'New Message',
    body: `You have a new message from ${senderName}`,
    url,
    data: {
      type: 'message',
      messageId: message.id,
      senderId: message.senderId,
      orderId,
      disputeId
    }
  });
};

/**
 * Send an order status notification
 * @param {string} userId - User ID
 * @param {Object} order - Order details
 * @returns {Promise<Array>} - Array of results from sending notifications
 */
export const sendOrderStatusPushNotification = async (userId, order) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/orders/${order.id}`;
  
  return sendPushNotification(userId, {
    title: `Order Status: ${order.status}`,
    body: `Your order #${order.id.substring(0, 8)} status has been updated to ${order.status}.`,
    url,
    data: {
      type: 'order',
      orderId: order.id,
      status: order.status
    }
  });
};

/**
 * Send a transaction notification
 * @param {string} userId - User ID
 * @param {Object} transaction - Transaction details
 * @returns {Promise<Array>} - Array of results from sending notifications
 */
export const sendTransactionPushNotification = async (userId, transaction) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/transactions`;
  
  const isDeposit = transaction.type === 'DEPOSIT';
  const title = isDeposit ? 'Deposit Confirmation' : 'Withdrawal Confirmation';
  const body = isDeposit
    ? `Your deposit of ${transaction.amount.toFixed(2)} has been processed successfully.`
    : `Your withdrawal of ${transaction.amount.toFixed(2)} has been ${transaction.status.toLowerCase()}.`;
  
  return sendPushNotification(userId, {
    title,
    body,
    url,
    data: {
      type: 'transaction',
      transactionId: transaction.id,
      transactionType: transaction.type,
      status: transaction.status
    }
  });
};

/**
 * Send an order push notification
 * @param {string} userId - User ID
 * @param {Object} order - Order details
 * @returns {Promise<Array>} - Array of results from sending notifications
 */
export const sendOrderPushNotification = async (userId, order) => {
  const title = `Order Update: ${order.status}`;
  const body = `Your order for ${order.listing.title} is now ${order.status}.`;
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`;

  return sendPushNotification(userId, {
    title,
    body,
    url,
    data: {
      type: 'order',
      orderId: order.id,
      status: order.status
    }
  });
};

// Remove this block if functions are already exported above
// export {
//   sendOrderPushNotification,
//   sendPushNotification,
//   sendDisputePushNotification,
//   sendMessagePushNotification,
//   sendOrderStatusPushNotification,
//   sendTransactionPushNotification
// }; 