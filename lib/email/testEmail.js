import dotenv from 'dotenv';
import { sendEmail } from './emailService.js';

// Load environment variables
dotenv.config();

/**
 * Send a test email
 */
async function sendTestEmail() {
  try {
    console.log('Sending test email...');
    
    const result = await sendEmail({
      to: process.env.TEST_EMAIL || process.env.SMTP_USER,
      subject: 'Test Email from TradeTrust',
      template: 'notification',
      data: {
        firstName: 'Test User',
        message: 'This is a test email from TradeTrust. If you received this email, the email system is working correctly.',
        actionUrl: process.env.NEXT_PUBLIC_APP_URL,
        actionText: 'Visit TradeTrust',
        appName: process.env.NEXT_PUBLIC_APP_NAME || 'TradeTrust',
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
      },
    });
    
    console.log('Test email sent successfully!');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('Error sending test email:', error);
    process.exit(1);
  }
}

// Run the test
sendTestEmail(); 