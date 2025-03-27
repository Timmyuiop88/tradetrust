import dotenv from 'dotenv';
import { sendEmail } from './emailService.js';

// Load environment variables
dotenv.config();

/**
 * Send test emails for all templates
 */
async function testAllTemplates() {
  try {
    console.log('Testing all email templates...');
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const appName = 'TradeVero';
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    console.log(`Sending test emails to: ${testEmail}`);
    
    // Common data for all templates
    const commonData = {
      firstName: 'John',
      lastName: 'Doe',
      appName,
      appUrl
    };
    
    // Test welcome email
    console.log('\nSending welcome email...');
    const welcomeResult = await sendEmail({
      to: testEmail,
      subject: 'Welcome to TradeVero',
      template: 'welcome',
      data: {
        ...commonData,
        dashboardUrl: `${appUrl}/dashboard`,
        verificationUrl: `${appUrl}/verify-email?token=example-token`
      }
    });
    console.log(`Welcome email sent successfully! Message ID: ${welcomeResult.messageId}`);
    
    // Test verification email
    console.log('\nSending verification email...');
    const verificationResult = await sendEmail({
      to: testEmail,
      subject: 'Verify Your Email Address',
      template: 'verification',
      data: {
        ...commonData,
        verificationUrl: `${appUrl}/verify-email?token=example-token`,
        expiresIn: '24 hours'
      }
    });
    console.log(`Verification email sent successfully! Message ID: ${verificationResult.messageId}`);
    
    // Test password reset email
    console.log('\nSending password reset email...');
    const resetResult = await sendEmail({
      to: testEmail,
      subject: 'Reset Your Password',
      template: 'passwordReset',
      data: {
        ...commonData,
        resetUrl: `${appUrl}/reset-password?token=example-token`,
        expiresIn: '1 hour'
      }
    });
    console.log(`Password reset email sent successfully! Message ID: ${resetResult.messageId}`);
    
    // Test notification email
    console.log('\nSending notification email...');
    const notificationResult = await sendEmail({
      to: testEmail,
      subject: 'Important Account Notification',
      template: 'notification',
      data: {
        ...commonData,
        title: 'Security Alert',
        message: 'We detected a login from a new device. If this was not you, please secure your account immediately.',
        actionText: 'Review Activity',
        actionUrl: `${appUrl}/account/security`
      }
    });
    console.log(`Notification email sent successfully! Message ID: ${notificationResult.messageId}`);
    
    // Test order confirmation email
    console.log('\nSending order confirmation email...');
    const orderResult = await sendEmail({
      to: testEmail,
      subject: 'Your TradeVero Order Confirmation',
      template: 'orderConfirmation',
      data: {
        ...commonData,
        orderId: 'TT-' + Math.floor(100000 + Math.random() * 900000),
        orderDate: new Date(),
        amount: 1250.75,
        orderUrl: `${appUrl}/orders/details`
      }
    });
    console.log(`Order confirmation email sent successfully! Message ID: ${orderResult.messageId}`);
    
    console.log('\nAll email templates tested successfully!');
  } catch (error) {
    console.error('Error testing email templates:', error);
    process.exit(1);
  }
}

// Run the script
testAllTemplates(); 