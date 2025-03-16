// Export email service functions
export {
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendDepositConfirmationEmail,
  sendWithdrawalConfirmationEmail,
  sendDisputeNotificationEmail,
  sendDisputeUpdateEmail,
  sendNewMessageEmail,
} from './emailService.js';

// Export verification token functions
export {
  createVerificationToken,
  createPasswordResetToken,
  verifyToken,
  deleteToken,
} from './verificationToken.js';

// Export template functions
export {
  getEmailContent,
  createTemplateFile,
  initializeDefaultTemplates,
  createNewTemplate,
} from './templates.js';

// Export template engine functions
export {
  compileTemplate,
  renderTemplate,
} from './templateEngine.js'; 