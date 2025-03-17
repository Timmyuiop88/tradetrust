import Handlebars from 'handlebars/dist/handlebars.min.js';
import fs from 'fs/promises';
import path from 'path';

// Cache for compiled templates
const templateCache = new Map();

// Base directory for email templates
const TEMPLATES_DIR = path.join(process.cwd(), 'lib', 'email', 'templates');

/**
 * Compile a Handlebars template
 * @param {string} templateString - The template string to compile
 * @returns {Function} - Compiled template function
 */
export const compileTemplate = (templateString) => {
  return Handlebars.compile(templateString);
};

/**
 * Get a template from the filesystem
 * @param {string} templatePath - Path to the template file
 * @returns {Promise<string>} - Template content
 */
export const getTemplate = async (templatePath) => {
  try {
    const content = await fs.readFile(templatePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading template:', error);
    throw new Error('Failed to read email template');
  }
};

/**
 * Render a template with data
 * @param {string} templatePath - Path to the template file
 * @param {Object} data - Data to render the template with
 * @returns {Promise<string>} - Rendered template
 */
export const renderTemplate = async (templatePath, data = {}) => {
  try {
    const template = await getTemplate(templatePath);
    const compiled = Handlebars.compile(template, { 
      strict: false,
      noEscape: false,
      preventIndent: true,
      ignoreStandalone: true
    });
    return compiled(data);
  } catch (error) {
    console.error('Error rendering template:', error);
    throw new Error('Failed to render email template');
  }
};

/**
 * Register all template partials from the templates directory
 */
export const registerPartials = async () => {
  const partialsDir = path.join(TEMPLATES_DIR, 'partials');
  
  try {
    const files = await fs.readdir(partialsDir);
    
    for (const file of files) {
      if (path.extname(file) === '.hbs') {
        const content = await fs.readFile(path.join(partialsDir, file), 'utf-8');
        const partialName = path.basename(file, '.hbs');
        Handlebars.registerPartial(partialName, content);
      }
    }
  } catch (error) {
    console.error('Error registering partials:', error);
    // Don't throw here - just log the error and continue
  }
};

/**
 * Register Handlebars helpers
 */
export const registerHelpers = () => {
  Handlebars.registerHelper('now', () => new Date());
  
  Handlebars.registerHelper('formatDate', (date, format) => {
    if (!date) return '';
    const d = new Date(date);
    return format ? d.toLocaleDateString() : d.toISOString().split('T')[0];
  });
  
  Handlebars.registerHelper('formatCurrency', (amount) => {
    if (typeof amount !== 'number') return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  });
  
  Handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
    switch (operator) {
      case '==': return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===': return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '!=': return (v1 != v2) ? options.fn(this) : options.inverse(this);
      case '!==': return (v1 !== v2) ? options.fn(this) : options.inverse(this);
      case '<': return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=': return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>': return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=': return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      default: return options.inverse(this);
    }
  });
};

// Initialize helpers when the module is loaded
registerHelpers(); 