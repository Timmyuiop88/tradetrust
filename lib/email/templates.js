import path from 'path';
import fs from 'fs/promises';
import { renderTemplate } from './templateEngine.js';
import Handlebars from 'handlebars';

// Base directory for email templates - use process.cwd() for consistent path resolution
const TEMPLATES_DIR = path.join(process.cwd(), 'lib', 'email', 'templates');

// Template content cache
const templateContentCache = new Map();

// Ensure templates directory exists
const ensureTemplatesDir = async () => {
  try {
    await fs.access(TEMPLATES_DIR);
    console.log('Templates directory exists:', TEMPLATES_DIR);
  } catch (error) {
    // Create directory if it doesn't exist
    console.log('Creating templates directory:', TEMPLATES_DIR);
    try {
      await fs.mkdir(TEMPLATES_DIR, { recursive: true });
      console.log('Templates directory created successfully');
    } catch (mkdirError) {
      console.error('Failed to create templates directory:', mkdirError);
      // In production, don't fail if we can't create the directory
      // Just log the error and continue
    }
  }
};

// Initialize templates directory (but don't fail if it doesn't exist in production)
try {
  ensureTemplatesDir();
} catch (error) {
  console.error('Error initializing templates directory:', error);
}

/**
 * Get the path to a template file
 * @param {string} templateName - Name of the template
 * @param {string} type - Type of template (html or text)
 * @returns {string} - Path to the template file
 */
const getTemplatePath = (templateName, type = 'html') => {
  return path.join(TEMPLATES_DIR, `${templateName}.${type}.hbs`);
};

/**
 * Check if a template file exists
 * @param {string} templatePath - Path to the template file
 * @returns {Promise<boolean>} - True if the template exists, false otherwise
 */
const templateExists = async (templatePath) => {
  try {
    await fs.access(templatePath);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Ensure the base template is registered as a partial
 * @returns {Promise<void>}
 */
const ensureBaseTemplateRegistered = async () => {
  try {
    const baseTemplatePath = getTemplatePath('base', 'html');
    const baseTemplateExists = await templateExists(baseTemplatePath);
    
    if (baseTemplateExists) {
      const baseTemplate = await fs.readFile(baseTemplatePath, 'utf-8');
      Handlebars.registerPartial('base', baseTemplate);
      Handlebars.registerPartial('content', '{{> @partial-block }}');
      console.log('Base template registered successfully');
    } else {
      console.warn('Base template not found at:', baseTemplatePath);
    }
  } catch (error) {
    console.error('Error registering base template:', error);
  }
};

// Try to register base template, but don't fail if not found
try {
  ensureBaseTemplateRegistered();
} catch (error) {
  console.error('Error with base template registration:', error);
}

/**
 * Get the content of an email template
 * @param {string} templateName - Name of the template
 * @param {Object} data - Data to render the template with
 * @returns {Promise<Object>} - Object with html and text content
 */
export const getEmailContent = async (templateName, data = {}) => {
  try {
    // Ensure base template is registered
    await ensureBaseTemplateRegistered();
    
    // Get paths to HTML and text templates
    const htmlTemplatePath = getTemplatePath(templateName, 'html');
    const textTemplatePath = getTemplatePath(templateName, 'text');
    
    // Render HTML template
    const html = await renderTemplate(htmlTemplatePath, data);
    
    // Try to render text template, fall back to generating text from HTML
    let text = '';
    const textTemplateExists = await templateExists(textTemplatePath);
    
    if (textTemplateExists) {
      text = await renderTemplate(textTemplatePath, data);
    } else {
      // If text template doesn't exist, generate a simple text version from HTML
      // This is a very basic conversion and might not be perfect
      text = html.replace(/<[^>]*>/g, '')
                 .replace(/\s+/g, ' ')
                 .trim();
    }
    
    return { html, text };
  } catch (error) {
    console.error(`Error getting email content for template ${templateName}:`, error);
    throw error;
  }
};

/**
 * Create a template file if it doesn't exist
 * @param {string} templateName - Name of the template
 * @param {string} content - Content of the template
 * @param {string} type - Type of template (html or text)
 * @param {boolean} force - Whether to overwrite existing template
 * @returns {Promise<void>}
 */
export const createTemplateFile = async (templateName, content, type = 'html', force = false) => {
  const templatePath = getTemplatePath(templateName, type);
  
  try {
    // Check if template already exists
    try {
      await fs.access(templatePath);
      if (force) {
        // Overwrite existing template
        await fs.writeFile(templatePath, content);
        console.log(`Template ${templateName}.${type} updated`);
      } else {
        console.log(`Template ${templateName}.${type} already exists`);
      }
      return;
    } catch (error) {
      // Template doesn't exist, create it
      await fs.writeFile(templatePath, content);
      console.log(`Template ${templateName}.${type} created`);
    }
  } catch (error) {
    console.error(`Error creating template ${templateName}.${type}:`, error);
    throw error;
  }
};

/**
 * Initialize default templates
 * @param {boolean} force - Whether to overwrite existing templates
 * @returns {Promise<void>}
 */
export const initializeDefaultTemplates = async (force = false) => {
  // Base layout template
  const baseLayoutHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>{{subject}}</title>
  <style>
    /* Reset styles */
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      font-family: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #f9fafb;
      background-color: #000000;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    
    /* Email wrapper */
    .email-wrapper {
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #000000;
    }
    
    /* Container */
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background-color: #000000;
    }
    
    /* Header */
    .header {
      text-align: center;
      padding: 25px 0;
      border-bottom: 1px solid #2a2a2a;
    }
    
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
    }
    
    /* Content */
    .content {
      padding: 30px 20px;
      background-color: #000000;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #2a2a2a;
      background-color: #000000;
    }
    
    /* Typography */
    h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 16px;
    }
    
    h2 {
      color: #f3f4f6;
      font-size: 20px;
      font-weight: 500;
      margin-top: 0;
      margin-bottom: 12px;
    }
    
    p {
      margin-top: 0;
      margin-bottom: 16px;
      color: #d1d5db;
    }
    
    a {
      color: #10B981;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
      color: #059669;
    }
    
    /* Button */
    .button {
      display: inline-block;
      width: 100%;
      background-color: #10B981;
      color: #ffffff !important;
      font-weight: 500;
      text-align: center;
      padding: 12px 0;
      margin: 16px 0;
      border-radius: 6px;
      text-decoration: none !important;
      box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
    }
    
    /* Card */
    .card {
      background-color: #1a1a1a;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border: 1px solid #2a2a2a;
    }
    
    /* Divider */
    .divider {
      height: 1px;
      background-color: #2a2a2a;
      margin: 20px 0;
    }
    
    /* Labels and values */
    .label {
      font-weight: 500;
      color: #9ca3af;
    }
    
    .value {
      color: #f9fafb;
    }
    
    .amount {
      color: #10B981;
      font-weight: 600;
    }
    
    /* Link styles */
    .link {
      color: #10B981;
      word-break: break-all;
      font-size: 14px;
    }
    
    /* Responsive */
    @media screen and (max-width: 600px) {
      .container {
        width: 100% !important;
      }
      
      .content {
        padding: 20px 15px !important;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <h1>TradeVero</h1>
      </div>
      <div class="content">
        {{> content}}
      </div>
      <div class="footer">
        <p>&copy; {{formatDate (now) "YYYY"}} {{appName}}. All rights reserved.</p>
        <p>
          <a href="{{appUrl}}/privacy-policy">Privacy Policy</a> | 
          <a href="{{appUrl}}/terms-of-service">Terms of Service</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

  // Welcome email template
  const welcomeHtml = `{{#> base subject="Welcome to TradeTrust!"}}
  <h1>Welcome to TradeTrust, {{firstName}}!</h1>
  <p>Thank you for joining TradeTrust. We're excited to have you on board!</p>
  <p>TradeTrust is a platform where you can safely trade digital goods with confidence.</p>
  
  <div class="card">
    <h2>Getting Started</h2>
    <p>To get started, explore your dashboard and discover all the features we offer:</p>
    <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
  </div>
  
  <p>If you have any questions or need assistance, feel free to contact our support team.</p>
  <p>Best regards,<br>The TradeTrust Team</p>
{{/base}}`;

  // Verification email template
  const verificationHtml = `{{#> base subject="Verify Your Email Address"}}
  <h1>Verify Your Email Address</h1>
  <p>Hello {{firstName}},</p>
  <p>Thank you for registering with TradeTrust. To complete your registration, please verify your email address by clicking the button below:</p>
  
  <a href="{{verificationUrl}}" class="button">Verify Email Address</a>
  
  <div class="card">
    <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
    <p class="link">{{verificationUrl}}</p>
  </div>
  
  <p>If you didn't create an account with us, you can safely ignore this email.</p>
  <p>This verification link will expire in 24 hours.</p>
  <p>Best regards,<br>The TradeTrust Team</p>
{{/base}}`;

  // Password reset email template
  const passwordResetHtml = `{{#> base subject="Reset Your Password"}}
  <h1>Reset Your Password</h1>
  <p>Hello {{firstName}},</p>
  <p>We received a request to reset your password. Click the button below to create a new password:</p>
  
  <a href="{{resetUrl}}" class="button">Reset Password</a>
  
  <div class="card">
    <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
    <p class="link">{{resetUrl}}</p>
  </div>
  
  <p>If you didn't request a password reset, you can safely ignore this email.</p>
  <p>This password reset link will expire in 1 hour.</p>
  <p>Best regards,<br>The TradeTrust Team</p>
{{/base}}`;

  // Notification email template
  const notificationHtml = `{{#> base subject=subject}}
  <h1>{{subject}}</h1>
  <p>Hello {{firstName}},</p>
  <p>{{message}}</p>
  
  {{#if actionUrl}}
  <a href="{{actionUrl}}" class="button">{{actionText}}</a>
  {{/if}}
  
  <div class="divider"></div>
  
  <p>Best regards,<br>The TradeTrust Team</p>
{{/base}}`;

  // Text templates
  const welcomeText = `Welcome to {{appName}}, {{firstName}}!

Thank you for joining {{appName}}. We're excited to have you on board!

{{appName}} is a platform where you can safely trade digital goods with confidence.

To get started, explore your dashboard and discover all the features we offer:
{{dashboardUrl}}

If you have any questions or need assistance, feel free to contact our support team.

Best regards,
The {{appName}} Team

© {{formatDate (now) "YYYY"}} {{appName}}. All rights reserved.`;

  const verificationText = `Verify Your Email Address

Hello {{firstName}},

Thank you for registering with {{appName}}. To complete your registration, please verify your email address by visiting the link below:

{{verificationUrl}}

If you didn't create an account with us, you can safely ignore this email.

This verification link will expire in 24 hours.

Best regards,
The {{appName}} Team

© {{formatDate (now) "YYYY"}} {{appName}}. All rights reserved.`;

  const passwordResetText = `Reset Your Password

Hello {{firstName}},

We received a request to reset your password. Visit the link below to create a new password:

{{resetUrl}}

If you didn't request a password reset, you can safely ignore this email.

This password reset link will expire in 1 hour.

Best regards,
The {{appName}} Team

© {{formatDate (now) "YYYY"}} {{appName}}. All rights reserved.`;

  const notificationText = `{{subject}}

Hello {{firstName}},

{{message}}

{{#if actionUrl}}
{{actionText}}: {{actionUrl}}
{{/if}}

Best regards,
The {{appName}} Team

© {{formatDate (now) "YYYY"}} {{appName}}. All rights reserved.`;

  // Create the templates
  await Promise.all([
    // HTML templates
    createTemplateFile('base', baseLayoutHtml, 'html', force),
    createTemplateFile('welcome', welcomeHtml, 'html', force),
    createTemplateFile('verification', verificationHtml, 'html', force),
    createTemplateFile('passwordReset', passwordResetHtml, 'html', force),
    createTemplateFile('notification', notificationHtml, 'html', force),
    
    // Text templates
    createTemplateFile('welcome', welcomeText, 'text', force),
    createTemplateFile('verification', verificationText, 'text', force),
    createTemplateFile('passwordReset', passwordResetText, 'text', force),
    createTemplateFile('notification', notificationText, 'text', force),
  ]);
};

/**
 * Create a new email template with both HTML and text versions
 * @param {string} templateName - Name of the template
 * @param {string} htmlContent - HTML content of the template
 * @param {string} textContent - Text content of the template (optional)
 * @param {boolean} force - Whether to overwrite existing template
 * @returns {Promise<void>}
 */
export const createNewTemplate = async (templateName, htmlContent, textContent = null, force = false) => {
  try {
    // Create HTML template
    await createTemplateFile(templateName, htmlContent, 'html', force);
    
    // Create text template if provided, otherwise generate from HTML
    if (textContent) {
      await createTemplateFile(templateName, textContent, 'text', force);
    } else {
      // Generate a simple text version from HTML
      const simpleText = htmlContent.replace(/<[^>]*>/g, '')
                                   .replace(/\s+/g, ' ')
                                   .trim();
      await createTemplateFile(templateName, simpleText, 'text', force);
    }
    
    console.log(`Template ${templateName} created successfully with both HTML and text versions`);
  } catch (error) {
    console.error(`Error creating template ${templateName}:`, error);
    throw error;
  }
}; 