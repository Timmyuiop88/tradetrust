# TrustTrade Email System

This directory contains the email system for TrustTrade. It provides a secure, efficient, and customizable way to send emails to users.

## Features

- **Custom SMTP Configuration**: Use your own SMTP server for sending emails
- **Beautiful Dark-Themed Templates**: Responsive email templates that match the site's dark design
- **Template Caching**: Templates are cached for better performance
- **Connection Pooling**: Uses connection pooling for efficient resource usage
- **Secure Token Management**: Secure token generation and verification for email verification and password reset
- **Automatic Text Version Generation**: Automatically generates text versions of HTML emails for better compatibility

## Setup

1. Configure your SMTP settings in the `.env` file:

```
# SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password

# Email Configuration
EMAIL_FROM_ADDRESS=your-email@example.com
EMAIL_FROM_NAME=TrustTrade

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=TrustTrade
```

2. Initialize the email templates:

```bash
npm run init:email-templates
```

3. Test the email system:

```bash
npm run test:email
```

## Usage

### Sending Emails

```javascript
import { sendEmail } from '@/lib/email';

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to TrustTrade',
  template: 'welcome',
  data: {
    firstName: 'John',
    dashboardUrl: 'https://example.com/dashboard',
    appName: 'TrustTrade',
  },
});
```

### Sending Verification Emails

```javascript
import { createVerificationToken, sendVerificationEmail } from '@/lib/email';

// Generate a verification token
const verificationToken = await createVerificationToken(user.id);

// Send verification email
await sendVerificationEmail(user, verificationToken);
```

### Sending Password Reset Emails

```javascript
import { createPasswordResetToken, sendPasswordResetEmail } from '@/lib/email';

// Generate a password reset token
const resetToken = await createPasswordResetToken(user.id);

// Send password reset email
await sendPasswordResetEmail(user, resetToken);
```

### Verifying Tokens

```javascript
import { verifyToken, deleteToken } from '@/lib/email';

// Verify a token
const userId = await verifyToken(token, 'email');

if (userId) {
  // Token is valid, update user
  await prisma.user.update({
    where: { id: userId },
    data: { isEmailVerified: true },
  });
  
  // Delete the token
  await deleteToken(token, 'email');
}
```

### Resending Verification Emails

The system includes an API endpoint for resending verification emails:

```javascript
// Client-side code to request a new verification email
async function resendVerification(email) {
  const response = await fetch('/api/auth/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  
  return response.json();
}
```

## Templates

The email system uses Handlebars templates for rendering emails. The templates are stored in the `lib/email/templates` directory.

### Available Templates

- `base.html`: Base layout template with dark theme styling
- `welcome.html`: Welcome email template
- `verification.html`: Email verification template
- `passwordReset.html`: Password reset template
- `notification.html`: General notification template
- `orderConfirmation.html`: Order confirmation template (custom template)

### Creating Custom Templates

You can create custom templates using the `createNewTemplate` function:

```javascript
import { createNewTemplate } from '@/lib/email';

// Create a new template with both HTML and text versions
await createNewTemplate(
  'customTemplate',
  `{{#> base subject="Custom Template"}}
    <h1>Hello {{firstName}}</h1>
    <p>This is a custom template.</p>
    <div class="card">
      <h2>Important Information</h2>
      <p>This card uses the dark theme styling.</p>
    </div>
    <a href="{{actionUrl}}" class="button">Take Action</a>
  {{/base}}`,
  `Hello {{firstName}},

This is a custom template.

Important Information:
This would be displayed in a card in the HTML version.

Take Action: {{actionUrl}}

Best regards,
The {{appName}} Team`
);
```

Or you can use the provided script:

```bash
npm run create:custom-template
```

And test it:

```bash
npm run test:custom-email
```

## Handlebars Helpers

The email system includes several Handlebars helpers to make template creation easier:

- `{{now}}`: Returns the current date
- `{{formatDate date}}`: Formats a date in a human-readable format
- `{{formatCurrency amount}}`: Formats a number as currency
- `{{ifCond value1 operator value2}}`: Conditional helper for comparing values

Example usage:

```handlebars
<p>Date: {{formatDate (now)}}</p>
<p>Amount: {{formatCurrency 199.99}}</p>

{{#ifCond status "===" "completed"}}
  <p>Your order has been completed!</p>
{{else}}
  <p>Your order is being processed.</p>
{{/ifCond}}
```

## Styling Guide

The email templates use a dark theme that matches the TrustTrade website. Key styling elements include:

- **Dark Background**: `#0f0f0f` for content areas, `#000000` for the wrapper
- **Text Colors**: `#f9fafb` for headings, `#d1d5db` for body text
- **Accent Color**: `#10B981` (emerald green) for buttons and highlights
- **Cards**: `#1a1a1a` background with `#2a2a2a` border
- **Responsive Design**: Adapts to different screen sizes

### CSS Classes

- `.button`: Styled button for call-to-action links
- `.card`: Container for important information
- `.divider`: Horizontal separator
- `.label`: Field labels in lighter color
- `.value`: Field values in standard text color
- `.amount`: Monetary amounts in accent color

## Customization

You can customize the email templates by editing the files in the `lib/email/templates` directory. The templates use Handlebars syntax for dynamic content.

## Security

- Tokens are generated using cryptographically secure random bytes
- Tokens are stored in the database with expiration dates
- Passwords are never sent in emails
- Sensitive information is not logged
- Email verification is required before login

## Performance

- Templates are cached for better performance
- Connection pooling is used for efficient resource usage
- Emails are sent asynchronously
- Timeouts are set to prevent hanging connections 