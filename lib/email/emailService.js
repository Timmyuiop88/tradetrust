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