import dotenv from 'dotenv';
import { createNewTemplate } from './templates.js';

// Load environment variables
dotenv.config();

/**
 * Create a custom email template
 */
async function createCustomTemplate() {
  try {
    console.log('Creating custom email template...');
    
    // HTML version of the template
    const htmlTemplate = `{{#> base subject="Order Confirmation"}}
  <h1>Order Confirmation</h1>
  <p>Hello {{firstName}},</p>
  <p>Thank you for your order! Your order #{{orderId}} has been confirmed and is being processed.</p>
  
  <div class="card">
    <h2>Order Details</h2>
    <table class="detail-table">
      <tr>
        <td><span class="label">Order ID:</span></td>
        <td><span class="value">{{orderId}}</span></td>
      </tr>
      <tr>
        <td><span class="label">Date:</span></td>
        <td><span class="value">{{formatDate orderDate}}</span></td>
      </tr>
      <tr>
        <td><span class="label">Total Amount:</span></td>
        <td><span class="amount">{{formatCurrency amount}}</span></td>
      </tr>
    </table>
  </div>
  
  <p>You can view your order details by clicking the button below:</p>
  
  <div style="text-align: center;">
    <a href="{{orderUrl}}" class="button">View Order</a>
  </div>
  
  <div class="divider"></div>
  
  <p>If you have any questions about your order, please contact our support team.</p>
  <p>Best regards,<br>The {{appName}} Team</p>
{{/base}}`;

    // Text version of the template
    const textTemplate = `Order Confirmation

Hello {{firstName}},

Thank you for your order! Your order #{{orderId}} has been confirmed and is being processed.

Order Details:
- Order ID: {{orderId}}
- Date: {{formatDate orderDate}}
- Total Amount: {{formatCurrency amount}}

You can view your order details by visiting:
{{orderUrl}}

If you have any questions about your order, please contact our support team.

Best regards,
The {{appName}} Team

© {{formatDate (now) "YYYY"}} {{appName}}. All rights reserved.`;

    // Create the template with force=true to overwrite existing templates
    await createNewTemplate('orderConfirmation', htmlTemplate, textTemplate, true);
    
    console.log('Custom template created successfully!');
  } catch (error) {
    console.error('Error creating custom template:', error);
    process.exit(1);
  }
}

// Run the script
createCustomTemplate(); 