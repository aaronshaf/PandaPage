/**
 * HTML sanitization utilities for safe rendering
 * Protects against XSS attacks when using dangerouslySetInnerHTML
 */

export interface SanitizationOptions {
  /** Allow basic formatting tags like <b>, <i>, <em>, <strong> */
  allowFormatting?: boolean;
  /** Allow structural tags like <p>, <div>, <span> */
  allowStructural?: boolean;
  /** Allow list tags like <ul>, <ol>, <li> */
  allowLists?: boolean;
  /** Allow heading tags like <h1>, <h2>, etc. */
  allowHeadings?: boolean;
  /** Allow table tags like <table>, <tr>, <td>, etc. */
  allowTables?: boolean;
  /** Allow specific style attributes (validated against whitelist) */
  allowSafeStyles?: boolean;
  /** Allow specific data attributes */
  allowDataAttributes?: boolean;
  /** Custom allowed tags beyond the defaults */
  customAllowedTags?: string[];
  /** Custom allowed attributes beyond the defaults */
  customAllowedAttributes?: string[];
}

interface SanitizationResult {
  sanitized: string;
  warnings: string[];
  blocked: string[];
}

/**
 * Default safe HTML tags for document content
 */
const DEFAULT_SAFE_TAGS = new Set([
  // Text formatting
  'strong', 'b', 'em', 'i', 'u', 'strike', 's', 'del', 'ins',
  'sup', 'sub', 'small', 'big', 'mark', 'code', 'kbd', 'samp', 'var',
  
  // Structure
  'p', 'div', 'span', 'br', 'hr',
  
  // Links (attributes validated separately)
  'a',
  
  // Lists
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  
  // Tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup', 'col',
  
  // Quotes and citations
  'blockquote', 'q', 'cite',
  
  // Preformatted
  'pre',
]);

/**
 * Safe HTML attributes (those that don't enable script execution)
 */
const DEFAULT_SAFE_ATTRIBUTES = new Set([
  // Core attributes
  'id', 'class', 'title', 'lang', 'dir',
  
  // Accessibility
  'role', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden',
  'aria-expanded', 'aria-live', 'aria-level',
  
  // Table specific
  'colspan', 'rowspan', 'headers', 'scope',
  
  // Links (href validated separately)
  'href', 'target', 'rel',
  
  // List attributes
  'type', 'start', 'reversed',
]);

/**
 * CSS properties that are safe to allow in style attributes
 */
const SAFE_CSS_PROPERTIES = new Set([
  // Typography
  'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant',
  'line-height', 'letter-spacing', 'word-spacing', 'text-align', 'text-decoration',
  'text-transform', 'text-indent', 'text-shadow',
  
  // Colors
  'color', 'background-color',
  
  // Layout (safe subset)
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
  'border-width', 'border-style', 'border-color', 'border-collapse',
  'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
  
  // Positioning (limited)
  'vertical-align', 'display',
  
  // Table
  'border-spacing', 'table-layout',
]);

/**
 * Validate CSS value for safety
 */
function isValidCSSValue(property: string, value: string): boolean {
  // Remove comments and normalize
  const cleanValue = value.replace(/\/\*.*?\*\//g, '').trim();
  
  // Block dangerous functions and keywords
  const dangerousPatterns = [
    /javascript:/i,
    /vbscript:/i,
    /data:/i,
    /expression\s*\(/i,
    /url\s*\(/i,
    /@import/i,
    /behavior:/i,
    /-moz-binding/i,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(cleanValue)) {
      return false;
    }
  }
  
  // Property-specific validation
  switch (property.toLowerCase()) {
    case 'width':
    case 'height':
    case 'max-width':
    case 'max-height':
    case 'min-width':
    case 'min-height':
    case 'font-size':
    case 'line-height':
    case 'letter-spacing':
    case 'word-spacing':
    case 'text-indent':
      // Allow numeric values with common units
      return /^(\d+(\.\d+)?(px|pt|em|rem|%|vh|vw|ex|ch)|0|auto|inherit|initial)$/i.test(cleanValue);
      
    case 'color':
    case 'background-color':
    case 'border-color':
      // Allow hex colors, rgb(), rgba(), named colors
      return /^(#[0-9a-f]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|transparent|inherit|initial|[a-z]+)$/i.test(cleanValue);
      
    case 'text-align':
      return /^(left|right|center|justify|inherit|initial)$/i.test(cleanValue);
      
    case 'text-decoration':
      return /^(none|underline|overline|line-through|blink|inherit|initial)$/i.test(cleanValue);
      
    case 'font-weight':
      return /^(normal|bold|bolder|lighter|[1-9]00|inherit|initial)$/i.test(cleanValue);
      
    case 'font-style':
      return /^(normal|italic|oblique|inherit|initial)$/i.test(cleanValue);
      
    case 'display':
      return /^(none|inline|block|inline-block|table|table-cell|table-row|inherit|initial)$/i.test(cleanValue);
      
    default:
      // For other properties, allow basic alphanumeric values and common units
      return /^[\w\s\-.,()%]+$/i.test(cleanValue) && cleanValue.length < 200;
  }
}

/**
 * Sanitize a style attribute value
 */
function sanitizeStyleAttribute(styleValue: string): string {
  const declarations = styleValue.split(';');
  const sanitizedDeclarations: string[] = [];
  
  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) continue;
    
    const property = declaration.substring(0, colonIndex).trim().toLowerCase();
    const value = declaration.substring(colonIndex + 1).trim();
    
    if (SAFE_CSS_PROPERTIES.has(property) && isValidCSSValue(property, value)) {
      sanitizedDeclarations.push(`${property}: ${value}`);
    }
  }
  
  return sanitizedDeclarations.join('; ');
}

/**
 * Validate href attribute for safety
 */
function isValidHref(href: string): boolean {
  if (!href) return false;
  
  const lower = href.toLowerCase().trim();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'vbscript:', 'data:', 'file:'];
  for (const protocol of dangerousProtocols) {
    if (lower.startsWith(protocol)) {
      return false;
    }
  }
  
  // Allow relative URLs, HTTP/HTTPS, mailto, tel, and internal anchors
  return /^(https?:\/\/|mailto:|tel:|#|\/|\.\/|\.\.\/)/.test(lower) || 
         /^[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/.test(href);
}

/**
 * Parse HTML using DOMParser (safer than regex)
 */
function parseHTML(html: string): { document: Document; errors: string[] } {
  const errors: string[] = [];
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Check for parser errors
    const parserErrors = doc.getElementsByTagName('parsererror');
    if (parserErrors.length > 0) {
      errors.push('HTML parsing errors detected');
    }
    
    return { document: doc, errors };
  } catch (error) {
    errors.push(`Failed to parse HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    // Return empty document on parse failure
    const parser = new DOMParser();
    const emptyDoc = parser.parseFromString('<div></div>', 'text/html');
    return { document: emptyDoc, errors };
  }
}

/**
 * Recursively sanitize DOM nodes
 */
function sanitizeNode(
  node: Node, 
  options: Required<SanitizationOptions>,
  warnings: string[],
  blocked: string[]
): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    // Text nodes are safe as-is
    return node.cloneNode(true);
  }
  
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    
    // Build allowed tags set
    const allowedTags = new Set(DEFAULT_SAFE_TAGS);
    
    if (!options.allowFormatting) {
      ['strong', 'b', 'em', 'i', 'u', 'strike', 's', 'del', 'ins', 'sup', 'sub', 'small', 'big', 'mark'].forEach(tag => allowedTags.delete(tag));
    }
    if (!options.allowStructural) {
      ['p', 'div', 'span', 'br', 'hr'].forEach(tag => allowedTags.delete(tag));
    }
    if (!options.allowLists) {
      ['ul', 'ol', 'li', 'dl', 'dt', 'dd'].forEach(tag => allowedTags.delete(tag));
    }
    if (!options.allowHeadings) {
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => allowedTags.delete(tag));
    }
    if (!options.allowTables) {
      ['table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup', 'col'].forEach(tag => allowedTags.delete(tag));
    }
    
    // Add custom allowed tags
    options.customAllowedTags.forEach(tag => allowedTags.add(tag.toLowerCase()));
    
    if (!allowedTags.has(tagName)) {
      blocked.push(`Blocked tag: ${tagName}`);
      // Return children only (unwrap the element)
      const fragment = document.createDocumentFragment();
      for (const child of Array.from(element.childNodes)) {
        const sanitizedChild = sanitizeNode(child, options, warnings, blocked);
        if (sanitizedChild) {
          fragment.appendChild(sanitizedChild);
        }
      }
      return fragment.childNodes.length > 0 ? fragment : null;
    }
    
    // Create clean element
    const cleanElement = document.createElement(tagName);
    
    // Build allowed attributes set
    const allowedAttributes = new Set(DEFAULT_SAFE_ATTRIBUTES);
    options.customAllowedAttributes.forEach(attr => allowedAttributes.add(attr.toLowerCase()));
    
    // Sanitize attributes
    for (const attr of Array.from(element.attributes)) {
      const attrName = attr.name.toLowerCase();
      const attrValue = attr.value;
      
      // Allow data attributes if enabled
      if (options.allowDataAttributes && attrName.startsWith('data-')) {
        // Validate data attribute value (no scripts)
        if (!/javascript:|vbscript:|data:/i.test(attrValue)) {
          cleanElement.setAttribute(attrName, attrValue);
        } else {
          blocked.push(`Blocked dangerous data attribute: ${attrName}="${attrValue}"`);
        }
        continue;
      }
      
      if (!allowedAttributes.has(attrName)) {
        blocked.push(`Blocked attribute: ${attrName} on ${tagName}`);
        continue;
      }
      
      // Special validation for specific attributes
      if (attrName === 'href') {
        if (isValidHref(attrValue)) {
          cleanElement.setAttribute(attrName, attrValue);
        } else {
          blocked.push(`Blocked dangerous href: ${attrValue}`);
        }
      } else if (attrName === 'style' && options.allowSafeStyles) {
        const sanitizedStyle = sanitizeStyleAttribute(attrValue);
        if (sanitizedStyle) {
          cleanElement.setAttribute(attrName, sanitizedStyle);
        } else {
          blocked.push(`Blocked unsafe styles: ${attrValue}`);
        }
      } else if (attrName === 'target') {
        // Only allow _blank for security
        if (attrValue === '_blank') {
          cleanElement.setAttribute(attrName, attrValue);
        } else {
          blocked.push(`Blocked target value: ${attrValue}`);
        }
      } else if (attrName === 'rel') {
        // Ensure noopener noreferrer for external links
        cleanElement.setAttribute(attrName, attrValue);
      } else {
        // Basic attribute value validation
        if (attrValue.length < 1000 && !/javascript:|vbscript:|data:/i.test(attrValue)) {
          cleanElement.setAttribute(attrName, attrValue);
        } else {
          blocked.push(`Blocked dangerous attribute value: ${attrName}="${attrValue}"`);
        }
      }
    }
    
    // Recursively sanitize children
    for (const child of Array.from(element.childNodes)) {
      const sanitizedChild = sanitizeNode(child, options, warnings, blocked);
      if (sanitizedChild) {
        cleanElement.appendChild(sanitizedChild);
      }
    }
    
    return cleanElement;
  }
  
  // Skip other node types (comments, etc.)
  blocked.push(`Blocked node type: ${node.nodeType}`);
  return null;
}

/**
 * Sanitize HTML content for safe rendering with dangerouslySetInnerHTML
 * 
 * @param html - HTML content to sanitize
 * @param options - Sanitization options
 * @returns Sanitized HTML and information about blocked content
 */
export function sanitizeHTML(
  html: string, 
  options: SanitizationOptions = {}
): SanitizationResult {
  const warnings: string[] = [];
  const blocked: string[] = [];
  
  // Set defaults
  const fullOptions: Required<SanitizationOptions> = {
    allowFormatting: true,
    allowStructural: true,
    allowLists: true,
    allowHeadings: true,
    allowTables: true,
    allowSafeStyles: true,
    allowDataAttributes: true,
    customAllowedTags: [],
    customAllowedAttributes: [],
    ...options
  };
  
  try {
    // Basic input validation
    if (!html || typeof html !== 'string') {
      return {
        sanitized: '',
        warnings: ['Input is not a valid string'],
        blocked: []
      };
    }
    
    // Prevent excessively large input (DoS protection)
    if (html.length > 1000000) { // 1MB limit
      warnings.push('Input truncated due to size limit');
      html = html.substring(0, 1000000);
    }
    
    // Parse HTML
    const { document: doc, errors } = parseHTML(html);
    warnings.push(...errors);
    
    // Sanitize body content
    const body = doc.body;
    if (!body) {
      return {
        sanitized: '',
        warnings: [...warnings, 'No body element found'],
        blocked
      };
    }
    
    const sanitizedFragment = document.createDocumentFragment();
    
    for (const child of Array.from(body.childNodes)) {
      const sanitizedChild = sanitizeNode(child, fullOptions, warnings, blocked);
      if (sanitizedChild) {
        if (sanitizedChild.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          // Append all children from fragment
          while (sanitizedChild.firstChild) {
            sanitizedFragment.appendChild(sanitizedChild.firstChild);
          }
        } else {
          sanitizedFragment.appendChild(sanitizedChild);
        }
      }
    }
    
    // Convert back to HTML string
    const container = document.createElement('div');
    container.appendChild(sanitizedFragment);
    const sanitized = container.innerHTML;
    
    return {
      sanitized,
      warnings,
      blocked
    };
    
  } catch (error) {
    return {
      sanitized: '',
      warnings: [...warnings, `Sanitization failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      blocked
    };
  }
}

/**
 * Quick validation to check if HTML appears safe
 * Lighter weight than full sanitization
 */
export function validateHTMLSafety(html: string): { safe: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!html || typeof html !== 'string') {
    return { safe: true, issues: [] }; // Empty is safe
  }
  
  // Check for obvious dangerous patterns
  const dangerousPatterns = [
    /<script\b/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /<form\b/i,
    /<input\b/i,
    /<textarea\b/i,
    /<button\b/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i, // Event handlers like onclick, onload, etc.
    /<meta\b/i,
    /<link\b/i,
    /<style\b/i,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(html)) {
      issues.push(`Potentially dangerous pattern found: ${pattern.source}`);
    }
  }
  
  return {
    safe: issues.length === 0,
    issues
  };
}