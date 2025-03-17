import Handlebars from 'handlebars';
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
 * Get a template from the cache or compile it if not cached
 * @param {string} templatePath - Path to the template file
 * @returns {Promise<Function>} - Compiled template function
 */
export const getTemplate = async (templatePath) => {
  try {
    const content = await fs.readFile(templatePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading template:', error);
    throw error;
  }
};

/**
 * Render a template with data
 * @param {string} templatePath - Path to the template file
 * @param {Object} data - Data to render the template with
 * @returns {Promise<string>} - Rendered template
 */
export const renderTemplate = async (templatePath, data = {}) => {
  const template = await getTemplate(templatePath);
  const compiled = compileTemplate(template);
  return compiled(data);
};

/**
 * Register all template partials from the templates directory
 */
export const registerPartials = async () => {
  const partialsDir = path.join(process.cwd(), 'lib/email/templates/partials');
  
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
    throw error;
  }
};

/**
 * Register Handlebars helpers
 */
export const registerHelpers = () => {
  // Current date helper
  Handlebars.registerHelper('now', function() {
    return new Date();
  });
  
  // Format date helper
  Handlebars.registerHelper('formatDate', function(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  });
  
  // Currency formatter helper
  Handlebars.registerHelper('formatCurrency', function(amount) {
    if (typeof amount !== 'number') return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  });
  
  // Conditional helper
  Handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
    switch (operator) {
      case '==':
        return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
        return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '!=':
        return (v1 != v2) ? options.fn(this) : options.inverse(this);
      case '!==':
        return (v1 !== v2) ? options.fn(this) : options.inverse(this);
      case '<':
        return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
        return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  });
};

// Register helpers when the module is loaded
registerHelpers(); 