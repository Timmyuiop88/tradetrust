import nodemailer from 'nodemailer';
import { compileTemplate } from './templateEngine.js';
import { getEmailContent } from './templates.js';

// Create a transporter with custom SMTP configuration
const createTransporter = () => {
  // Use environment variables for SMTP configuration
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    // Optimize for performance
    pool: true, // Use connection pool for better performance
    maxConnections: 5, // Limit concurrent connections
    maxMessages: 100, // Limit messages per connection
    // Set timeout values
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 30000, // 30 seconds
  });

  return transporter;
};

// Cache the transporter to avoid creating a new one for each email
let cachedTransporter = null;

const getTransporter = () => {
  if (!cachedTransporter) {
    cachedTransporter = createTransporter();
  }
  return cachedTransporter;
};

/**
 * Send an email using the configured SMTP server
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name
 * @param {Object} options.data - Data to be used in the template
 * @param {Array} options.attachments - Optional attachments
 * @returns {Promise} - Promise that resolves with the send info
 */
export const sendEmail = async ({ to, subject, template, data, attachments = [] }) => {
  try {
    const transporter = getTransporter();
    
    // Get the template content
    const { html, text } = await getEmailContent(template, data);
    
    // Configure email options
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html,
      text,
      attachments,
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send a verification email to a user
 * @param {Object} user - User object or object with email and firstName
 * @param {string} verificationToken - Verification token
 * @returns {Promise} - Promise that resolves with the send info
 */
export const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;
  
  return sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address',
    template: 'verification',
    data: {
      firstName: user.firstName || 'User',
      verificationUrl,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'TrustTrade',
    },
  });
};

/**
 * Send a welcome email to a new user
 * @param {Object} user - User object or object with email and firstName
 * @returns {Promise} - Promise that resolves with the send info
 */
export const sendWelcomeEmail = async (user) => {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
  
  return sendEmail({
    to: user.email,
    subject: 'Welcome to TrustTrade!',
    template: 'welcome',
    data: {
      firstName: user.firstName || 'User',
      dashboardUrl,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'TrustTrade',
    },
  });
};

/**
 * Send a password reset email
 * @param {Object} user - User object or object with email and firstName
 * @param {string} resetToken - Reset token
 * @returns {Promise} - Promise that resolves with the send info
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: user.email,
    subject: 'Reset Your Password',
    template: 'passwordReset',
    data: {
      firstName: user.firstName || 'User',
      resetUrl,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'TrustTrade',
    },
  });
};

/**
 * Send a notification email
 * @param {Object} user - User object or object with email and firstName
 * @param {Object} options - Notification options
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Notification message
 * @param {string} options.actionUrl - URL for the action button
 * @param {string} options.actionText - Text for the action button
 * @returns {Promise} - Promise that resolves with the send info
 */
export const sendNotificationEmail = async (user, { subject, message, actionUrl, actionText }) => {
  return sendEmail({
    to: user.email,
    subject,
    template: 'notification',
    data: {
      firstName: user.firstName || 'User',
      message,
      actionUrl,
      actionText,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'TrustTrade',
    },
  });
};

/**
 * Send an order confirmation email
 * @param {Object} user - User object or object with email and firstName
 * @param {Object} order - Order details
 * @returns {Promise} - Promise that resolves with the send info
 */
export const sendOrderConfirmationEmail = async (user, order) => {
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`;
  
  return sendEmail({
    to: user.email,
    subject: `Order Confirmation #${order.id.substring(0, 8)}`,
    template: 'orderConfirmation',
    data: {
      firstName: user.firstName || 'User',
      orderId: order.id,
      orderDate: order.createdAt,
      itemName: order.listing?.username || 'Account',
      amount: order.price,
      status: order.status,
      orderUrl,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'TrustTrade',
    },
  });
};

/**
 * Send an order status update email
 * @param {Object} user - User object or object with email and firstName
 * @param {Object} order - Order details
 * @param {string} statusMessage - Optional message about the status update
 * @param {string} nextSteps - Optional next steps instructions
 * @returns {Promise} - Promise that resolves with the send info
 */
export const sendOrderStatusEmail = async (user, order, statusMessage = '', nextSteps = '') => {
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`;
  
  // Determine status color based on status
  let statusColor = '#10B981'; // Default green
  switch (order.status) {
    case 'PENDING':
      statusColor = '#f59e0b'; // Amber
      break;
    case 'CANCELLED':
    case 'REJECTED':
      statusColor = '#ef4444'; // Red
      break;
    case 'COMPLETED':
      statusColor = '#10B981'; // Green
      break;
    case 'IN_PROGRESS':
      statusColor = '#3b82f6'; // Blue
      break;
    case 'DISPUTED':
      statusColor = '#f43f5e'; // Pink
      break;
  }
  
  return sendEmail({
    to: user.email,
    subject: `Order Status Update: ${order.status}`,
    template: 'orderStatus',
    data: {
      firstName: user.firstName || 'User',
      orderId: order.id,
      itemName: order.listing?.username || 'Account',
      amount: order.price,
      status: order.status,
      statusColor,
      updateDate: new Date(),
      statusMessage,
      nextSteps,
      orderUrl,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'TrustTrade',
    },
  });
};

/**
 * Send a deposit confirmation email
 * @param {Object} user - User object or object with email and firstName
 * @param {Object} transaction - Transaction details
 * @returns {Promise} - Promise that resolves with the send info
 */
export const sendDepositConfirmationEmail = async (user, transaction) => {
  const transactionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/transactions`;
  
  return sendEmail({
    to: user.email,
    subject: 'Deposit Confirmation',
    template: 'depositConfirmation',
    data: {
      firstName: user.firstName || 'User',
      transactionId: transaction.id,
      transactionDate: transaction.createdAt,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      newBalance: transaction.newBalance,
      transactionUrl,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'TrustTrade',
    },
  });
};

/**
 * Send a withdrawal confirmation email
 * @param {Object} user - User object or object with email and firstName
 * @param {Object} transaction - Transaction details
 * @param {string} estimatedArrival - Optional estimated arrival time
 * @returns {Promise} - Promise that resolves with the send info
 */
export const sendWithdrawalConfirmationEmail = async (user, transaction, estimatedArrival = '') => {
  const transactionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/transactions`;
  
  return sendEmail({
    to: user.email,
    subject: 'Withdrawal Confirmation',
    template: 'withdrawalConfirmation',
    data: {
      firstName: user.firstName || 'User',
      transactionId: transaction.id,
      transactionDate: transaction.createdAt,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
      newBalance: transaction.newBalance,
      estimatedArrival,
      transactionUrl,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'TrustTrade',
    },
  });
};

/**
 * Send a dispute notification email
 * @param {Object} user - User object or object with email and firstName
 * @param {Object} dispute - Dispute details
 * @param {boolean} isInitiator - Whether the user is the initiator of the dispute
 * @returns {Promise} - Promise that resolves with the send info
 */
export const sendDisputeNotificationEmail = async (user, dispute, isInitiator = false) => {
  const disputeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/disputes/${dispute.id}`;
  
  return sendEmail({
    to: user.email,
    subject: 'Dispute Notification',
    template: 'disputeNotification',
    data: {
      firstName: user.firstName || 'User',
      disputeId: dispute.id,
      orderId: dispute.orderId,
      openDate: dispute.createdAt,
      status: dispute.status,
      reason: dispute.reason,
      description: dispute.description,
      isInitiator,
      disputeUrl,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'TrustTrade',
    },
  });
};

/**
 * Send a dispute update email
 * @param {Object} user - User object or object with email and firstName
 * @param {Object} dispute - Dispute details
 * @param {string} updateMessage - Optional message about the update
 * @param {string} resolution - Optional resolution details
 * @param {boolean} hasNewMessages - Whether there are new messages
 * @param {string} nextSteps - Optional next steps instructions
 * @returns {Promise} - Promise that resolves with the send info
 */
export const sendDisputeUpdateEmail = async (user, dispute, updateMessage = '', resolution = '', hasNewMessages = false, nextSteps = '') => {
  const disputeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/disputes/${dispute.id}`;
  
  // Determine status color based on status
  let statusColor = '#f59e0b'; // Default amber
  switch (dispute.status) {
    case 'OPEN':
      statusColor = '#f59e0b'; // Amber
      break;
    case 'RESOLVED':
      statusColor = '#10B981'; // Green
      break;
    case 'CLOSED':
      statusColor = '#6b7280'; // Gray
      break;
    case 'ESCALATED':
      statusColor = '#ef4444'; // Red
      break;
    case 'IN_REVIEW':
      statusColor = '#3b82f6'; // Blue
      break;
  }
  
  return sendEmail({
    to: user.email,
    subject: `Dispute Update: ${dispute.status}`,
    template: 'disputeUpdate',
    data: {
      firstName: user.firstName || 'User',
      disputeId: dispute.id,
      orderId: dispute.orderId,
      status: dispute.status,
      statusColor,
      updateDate: new Date(),
      updateMessage,
      resolution,
      hasNewMessages,
      nextSteps,
      disputeUrl,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'TrustTrade',
    },
  });
};

/**
 * Send a new message notification email
 * @param {Object} user - User object or object with email and firstName
 * @param {Object} message - Message details
 * @param {Object} sender - Sender details
 * @param {string} orderId - Optional order ID
 * @param {string} disputeId - Optional dispute ID
 * @returns {Promise} - Promise that resolves with the send info
 */
export const sendNewMessageEmail = async (user, message, sender, orderId = null, disputeId = null) => {
  let messageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/messages`;
  
  if (orderId) {
    messageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}/chat`;
  } else if (disputeId) {
    messageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/disputes/${disputeId}`;
  }
  
  return sendEmail({
    to: user.email,
    subject: 'New Message Notification',
    template: 'newMessage',
    data: {
      firstName: user.firstName || 'User',
      senderName: `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'User',
      messageDate: message.createdAt,
      orderId,
      disputeId,
      messageUrl,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'TrustTrade',
    },
  });
}; 