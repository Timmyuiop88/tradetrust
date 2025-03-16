import { initializeDefaultTemplates } from './templates.js';

/**
 * Initialize email templates
 * @param {boolean} force - Whether to overwrite existing templates
 */
async function init(force = false) {
  try {
    console.log('Initializing email templates...');
    await initializeDefaultTemplates(force);
    console.log('Email templates initialized successfully');
  } catch (error) {
    console.error('Error initializing email templates:', error);
    process.exit(1);
  }
}

// Run the initialization
// Pass true to force overwrite existing templates
init(true); 