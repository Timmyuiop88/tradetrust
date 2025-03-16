import dotenv from 'dotenv';
import { sendEmail } from './emailService.js';

// Load environment variables
dotenv.config();

/**
 * Send a test email using the custom template
 */
async function sendTestCustomEmail() {
  try {
    console.log('Sending test email with custom template...');
    
    // Define email parameters
    const to = process.env.TEST_EMAIL || 'test@example.com';
    const subject = 'Your TrustTrade Order Confirmation';
    const template = 'orderConfirmation';
    
    // Define template data
    const data = {
      firstName: 'John',
      orderId: 'TT-' + Math.floor(100000 + Math.random() * 900000),
      orderDate: new Date(),
      amount: 1250.75,
      orderUrl: `${process.env.NEXTAUTH_URL}/orders/details`,
      appName: 'TrustTrade'
    };
    
    // Send the email
    const info = await sendEmail({
      to,
      subject,
      template,
      data
    });
    
    console.log('Test email with custom template sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending test email:', error);
    process.exit(1);
  }
}

// Run the script
sendTestCustomEmail(); 