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
  // Check if template is in cache
  if (templateCache.has(templatePath)) {
    return templateCache.get(templatePath);
  }

  try {
    // Read template file
    const templateString = await fs.readFile(templatePath, 'utf-8');
    
    // Compile template
    const compiledTemplate = compileTemplate(templateString);
    
    // Cache the compiled template
    templateCache.set(templatePath, compiledTemplate);
    
    return compiledTemplate;
  } catch (error) {
    console.error(`Error loading template ${templatePath}:`, error);
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
  // Make sure partials are registered
  await registerPartials();
  
  const template = await getTemplate(templatePath);
  return template(data);
};

/**
 * Register all template partials from the templates directory
 */
export const registerPartials = async () => {
  try {
    // Register the base template as a partial
    const baseTemplatePath = path.join(TEMPLATES_DIR, 'base.html.hbs');
    
    try {
      const baseTemplate = await fs.readFile(baseTemplatePath, 'utf-8');
      Handlebars.registerPartial('base', baseTemplate);
    } catch (error) {
      console.warn('Base template not found, some emails may not render correctly:', error.message);
    }
    
    // Register content partial (used by the base template)
    Handlebars.registerPartial('content', '{{> @partial-block }}');
    
    return true;
  } catch (error) {
    console.error('Error registering partials:', error);
    return false;
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
  Handlebars.registerHelper('formatDate', function(date, format) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });
  
  // Currency formatter helper
  Handlebars.registerHelper('formatCurrency', function(amount) {
    if (amount === undefined || amount === null) return '';
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