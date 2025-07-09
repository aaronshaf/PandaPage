// Header and footer content parsing functions
import type { Header, Footer, Paragraph, Table } from '../../types/document';
import { parseParagraph } from './paragraph-parser';
import { parseTable } from './table-parser';
import { convertToDocumentElement } from './element-converter';
import { WORD_NAMESPACE } from './types';
import type { DocxStylesheet } from './style-parser';
import type { DocxTheme } from './theme-parser';

/**
 * Parse header or footer XML content
 * @param xml - Header or footer XML string
 * @param type - Whether this is a header or footer
 * @param relationships - Map of relationship IDs to URLs
 * @param stylesheet - Document stylesheet for style resolution
 * @param theme - Document theme for color and font resolution
 * @returns Parsed header/footer or null
 */
export function parseHeaderFooter(
  xml: string, 
  type: 'header' | 'footer', 
  relationships?: Map<string, string>,
  stylesheet?: DocxStylesheet,
  theme?: DocxTheme
): Header | Footer | null {
  let doc: Document;
  if (typeof DOMParser === 'undefined') {
    // @ts-ignore
    const { DOMParser: XMLDOMParser } = require('@xmldom/xmldom');
    const parser = new XMLDOMParser();
    doc = parser.parseFromString(xml, "text/xml");
  } else {
    const parser = new DOMParser();
    doc = parser.parseFromString(xml, "text/xml");
  }
  
  const elements: (Paragraph | Table)[] = [];
  
  // Get all paragraphs and tables from the header/footer
  const body = doc.documentElement;
  
  // Parse all children
  for (let i = 0; i < body.childNodes.length; i++) {
    const child = body.childNodes[i];
    if (!child || child.nodeType !== 1) continue; // Skip non-element nodes
    
    const element = child as Element;
    const tagName = element.tagName || element.localName;
    
    if (tagName === "w:p" || tagName === "p") {
      // Parse paragraph with relationships for hyperlink resolution
      const paragraph = parseParagraph(element, relationships, undefined, undefined, stylesheet, theme);
      if (paragraph) {
        const docElement = convertToDocumentElement(paragraph);
        if (docElement.type === 'paragraph' || docElement.type === 'heading') {
          elements.push(docElement as Paragraph);
        }
      }
    } else if (tagName === "w:tbl" || tagName === "tbl") {
      // Parse table with relationships for hyperlink resolution
      const table = parseTable(element, relationships, theme, stylesheet);
      if (table) {
        elements.push(table);
      }
    }
  }
  
  // Always return header/footer even if empty, as they may contain field codes
  if (elements.length === 0 && type === 'header') {
    // Return with empty elements array for headers
  } else if (elements.length === 0) {
    return null;
  }
  
  return {
    type,
    elements
  } as Header | Footer;
}