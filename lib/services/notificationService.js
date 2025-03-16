import { prisma } from '@/lib/prisma';
import * as emailService from '@/lib/email/emailService';
import * as pushService from '@/lib/notifications/pushService';

/**
 * Send order confirmation notifications
 * @param {string} userId - User ID
 * @param {string} orderId - Order ID
 * @returns {Promise<void>}
 */
export const sendOrderConfirmation = async (userId, orderId) => {
  try {
    // Get user and order details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true }
    });

    if (!user || !order) {
      console.error('User or order not found');
      return;
    }

    // Send email notification
    await emailService.sendOrderConfirmationEmail(user, order);

    // Send push notification
    await pushService.sendOrderStatusPushNotification(userId, order);
  } catch (error) {
    console.error('Error sending order confirmation notifications:', error);
  }
};

/**
 * Send order status update notifications
 * @param {string} userId - User ID
 * @param {string} orderId - Order ID
 * @param {string} statusMessage - Optional message about the status update
 * @param {string} nextSteps - Optional next steps instructions
 * @returns {Promise<void>}
 */
export const sendOrderStatusUpdate = async (userId, orderId, statusMessage = '', nextSteps = '') => {
  try {
    // Get user and order details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true }
    });

    if (!user || !order) {
      console.error('User or order not found');
      return;
    }

    // Send email notification
    await emailService.sendOrderStatusEmail(user, order, statusMessage, nextSteps);

    // Send push notification
    await pushService.sendOrderStatusPushNotification(userId, order);
  } catch (error) {
    console.error('Error sending order status update notifications:', error);
  }
};

/**
 * Send deposit confirmation notifications
 * @param {string} userId - User ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<void>}
 */
export const sendDepositConfirmation = async (userId, transactionId) => {
  try {
    // Get user and transaction details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!user || !transaction) {
      console.error('User or transaction not found');
      return;
    }

    // Send email notification
    await emailService.sendDepositConfirmationEmail(user, transaction);

    // Send push notification
    await pushService.sendTransactionPushNotification(userId, transaction);
  } catch (error) {
    console.error('Error sending deposit confirmation notifications:', error);
  }
};

/**
 * Send withdrawal confirmation notifications
 * @param {string} userId - User ID
 * @param {string} transactionId - Transaction ID
 * @param {string} estimatedArrival - Optional estimated arrival time
 * @returns {Promise<void>}
 */
export const sendWithdrawalConfirmation = async (userId, transactionId, estimatedArrival = '') => {
  try {
    // Get user and transaction details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!user || !transaction) {
      console.error('User or transaction not found');
      return;
    }

    // Send email notification
    await emailService.sendWithdrawalConfirmationEmail(user, transaction, estimatedArrival);

    // Send push notification
    await pushService.sendTransactionPushNotification(userId, transaction);
  } catch (error) {
    console.error('Error sending withdrawal confirmation notifications:', error);
  }
};

/**
 * Send dispute notifications
 * @param {string} userId - User ID
 * @param {string} disputeId - Dispute ID
 * @param {boolean} isInitiator - Whether the user is the initiator of the dispute
 * @returns {Promise<void>}
 */
export const sendDisputeNotification = async (userId, disputeId, isInitiator = false) => {
  try {
    // Get user and dispute details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId }
    });

    if (!user || !dispute) {
      console.error('User or dispute not found');
      return;
    }

    // Send email notification
    await emailService.sendDisputeNotificationEmail(user, dispute, isInitiator);

    // Send push notification
    await pushService.sendDisputePushNotification(userId, dispute, false);
  } catch (error) {
    console.error('Error sending dispute notifications:', error);
  }
};

/**
 * Send dispute update notifications
 * @param {string} userId - User ID
 * @param {string} disputeId - Dispute ID
 * @param {string} updateMessage - Optional message about the update
 * @param {string} resolution - Optional resolution details
 * @param {boolean} hasNewMessages - Whether there are new messages
 * @param {string} nextSteps - Optional next steps instructions
 * @returns {Promise<void>}
 */
export const sendDisputeUpdate = async (userId, disputeId, updateMessage = '', resolution = '', hasNewMessages = false, nextSteps = '') => {
  try {
    // Get user and dispute details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId }
    });

    if (!user || !dispute) {
      console.error('User or dispute not found');
      return;
    }

    // Send email notification
    await emailService.sendDisputeUpdateEmail(user, dispute, updateMessage, resolution, hasNewMessages, nextSteps);

    // Send push notification
    await pushService.sendDisputePushNotification(userId, dispute, true);
  } catch (error) {
    console.error('Error sending dispute update notifications:', error);
  }
};

/**
 * Send new message notifications
 * @param {string} recipientId - Recipient user ID
 * @param {string} messageId - Message ID
 * @returns {Promise<void>}
 */
export const sendNewMessageNotification = async (recipientId, messageId) => {
  try {
    // Get recipient, message, and sender details
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId }
    });

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: { sender: true }
    });

    if (!recipient || !message) {
      console.error('Recipient or message not found');
      return;
    }

    // Determine if message is related to an order or dispute
    let orderId = message.orderId;
    let disputeId = message.disputeId;

    // Send email notification
    await emailService.sendNewMessageEmail(recipient, message, message.sender, orderId, disputeId);

    // Send push notification
    await pushService.sendMessagePushNotification(recipientId, message, message.sender, orderId, disputeId);
  } catch (error) {
    console.error('Error sending new message notifications:', error);
  }
}; 