import { Effect } from "effect";
import { debug } from "../debug";

/**
 * XML parsing utilities for DOCX processing
 * Inspired by docx-preview's XML parser but adapted for Effect-TS
 */

export class XmlParseError {
  readonly _tag = "XmlParseError";
  constructor(public readonly message: string) {}
}

export interface XmlParser {
  // Core element access
  element(parent: Element, localName: string): Element | null;
  elements(parent: Element, localName?: string): Element[];
  
  // Attribute access
  attr(element: Element, attrName: string): string | null;
  attrs(element: Element): Attr[];
  
  // Typed attribute access
  intAttr(element: Element, attrName: string, defaultValue?: number): number | null;
  floatAttr(element: Element, attrName: string, defaultValue?: number): number | null;
  boolAttr(element: Element, attrName: string, defaultValue?: boolean): boolean | null;
  hexAttr(element: Element, attrName: string, defaultValue?: number): number | null;
  
  // Convenience methods
  elementAttr(parent: Element, localName: string, attrName: string): string | null;
  textContent(element: Element): string;
}

export class EffectXmlParser implements XmlParser {
  element(parent: Element, localName: string): Element | null {
    for (let i = 0; i < parent.childNodes.length; i++) {
      const node = parent.childNodes.item(i);
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        // Check both localName and nodeName for namespace handling
        if (element.localName === localName || 
            element.nodeName === localName ||
            element.nodeName.endsWith(`:${localName}`)) {
          return element;
        }
      }
    }
    return null;
  }

  elements(parent: Element, localName?: string): Element[] {
    const result: Element[] = [];
    
    for (let i = 0; i < parent.childNodes.length; i++) {
      const node = parent.childNodes.item(i);
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (!localName || 
            element.localName === localName || 
            element.nodeName === localName ||
            element.nodeName.endsWith(`:${localName}`)) {
          result.push(element);
        }
      }
    }
    
    return result;
  }

  attr(element: Element, attrName: string): string | null {
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes.item(i);
      if (attr && (attr.localName === attrName || 
                   attr.name === attrName ||
                   attr.name.endsWith(`:${attrName}`))) {
        return attr.value;
      }
    }
    return null;
  }

  attrs(element: Element): Attr[] {
    return Array.from(element.attributes);
  }

  intAttr(element: Element, attrName: string, defaultValue?: number): number | null {
    const value = this.attr(element, attrName);
    if (value) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? defaultValue ?? null : parsed;
    }
    return defaultValue ?? null;
  }

  floatAttr(element: Element, attrName: string, defaultValue?: number): number | null {
    const value = this.attr(element, attrName);
    if (value) {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue ?? null : parsed;
    }
    return defaultValue ?? null;
  }

  boolAttr(element: Element, attrName: string, defaultValue?: boolean): boolean | null {
    const value = this.attr(element, attrName);
    if (value) {
      // DOCX boolean attributes can be "1", "true", "0", "false", or just presence
      return value === "1" || value === "true" || value === "on";
    }
    return defaultValue ?? null;
  }

  hexAttr(element: Element, attrName: string, defaultValue?: number): number | null {
    const value = this.attr(element, attrName);
    if (value) {
      const parsed = parseInt(value, 16);
      return isNaN(parsed) ? defaultValue ?? null : parsed;
    }
    return defaultValue ?? null;
  }

  elementAttr(parent: Element, localName: string, attrName: string): string | null {
    const element = this.element(parent, localName);
    return element ? this.attr(element, attrName) : null;
  }

  textContent(element: Element): string {
    return element.textContent || "";
  }
}

/**
 * Get DOMParser for both browser and Node.js environments
 */
const getDOMParser = (): DOMParser => {
  // Browser environment
  if (typeof window !== 'undefined' && window.DOMParser) {
    return new window.DOMParser();
  }
  
  // Node.js environment - use happy-dom (more lenient than @xmldom/xmldom)
  try {
    const { Window } = require('happy-dom');
    const window = new Window();
    return new window.DOMParser();
  } catch (error) {
    throw new Error('DOMParser not available. Please install happy-dom for Node.js environments.');
  }
};

/**
 * Parse XML string into DOM Document
 */
export const parseXmlString = (xmlString: string): Effect.Effect<Document, XmlParseError> =>
  Effect.gen(function* () {
    debug.log("Parsing XML string, length:", xmlString.length);
    
    try {
      // Remove UTF-8 BOM if present
      const cleanXml = xmlString.charCodeAt(0) === 0xFEFF ? xmlString.substring(1) : xmlString;
      
      // Parse using DOMParser (with environment detection)
      // Use "text/xml" instead of "application/xml" for better compatibility with DOCX XML
      const parser = getDOMParser();
      const document = parser.parseFromString(cleanXml, "text/xml");
      
      // Check for parser errors
      const errorElement = document.getElementsByTagName("parsererror")[0];
      if (errorElement) {
        const errorText = errorElement.textContent || "Unknown XML parsing error";
        return yield* Effect.fail(new XmlParseError(`XML parsing failed: ${errorText}`));
      }
      
      debug.log("Successfully parsed XML document");
      return document;
      
    } catch (error) {
      return yield* Effect.fail(new XmlParseError(`XML parsing error: ${error}`));
    }
  });

/**
 * Get XML element by path (e.g., "document/body/p")
 */
export const getElementByPath = (
  root: Element, 
  path: string, 
  parser: XmlParser = new EffectXmlParser()
): Element | null => {
  const parts = path.split("/").filter(part => part.length > 0);
  let current: Element | null = root;
  
  for (const part of parts) {
    if (!current) return null;
    current = parser.element(current, part);
  }
  
  return current;
};

/**
 * Get all XML elements by path pattern
 */
export const getElementsByPath = (
  root: Element,
  path: string,
  parser: XmlParser = new EffectXmlParser()
): Element[] => {
  const parts = path.split("/").filter(part => part.length > 0);
  let current: Element[] = [root];
  
  for (const part of parts) {
    const next: Element[] = [];
    for (const element of current) {
      if (part === "*") {
        // Wildcard - get all child elements
        next.push(...parser.elements(element));
      } else {
        // Specific tag name
        next.push(...parser.elements(element, part));
      }
    }
    current = next;
  }
  
  return current;
};

/**
 * Create a default XML parser instance
 */
export const createXmlParser = (): XmlParser => new EffectXmlParser();

/**
 * Global XML parser instance for convenience
 */
export const xmlParser: XmlParser = createXmlParser();