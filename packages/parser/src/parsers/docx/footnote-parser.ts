// Footnote parsing functions
import type { Footnote, Paragraph, Table } from '../../types/document';
import { parseParagraph } from './paragraph-parser';
import { parseTable } from './table-parser';
import { convertToDocumentElement } from './element-converter';
import { WORD_NAMESPACE } from './types';
import type { DocxStylesheet } from './style-parser';
import type { DocxTheme } from './theme-parser';

/**
 * Parse footnotes from footnotes.xml
 * @param xml - Footnotes XML string
 * @param relationships - Map of relationship IDs to URLs
 * @param stylesheet - Document stylesheet for style resolution
 * @param theme - Document theme for color and font resolution
 * @returns Array of parsed footnotes
 */
export function parseFootnotes(xml: string, relationships?: Map<string, string>, stylesheet?: DocxStylesheet, theme?: DocxTheme): Footnote[] {
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
  
  // Check for parsing errors
  const parserError = doc.getElementsByTagName('parsererror');
  if (parserError.length > 0) {
    console.error('XML parsing error in footnotes:', parserError[0]?.textContent);
    return [];
  }
  
  const footnotes: Footnote[] = [];
  
  // Get all footnote elements
  const footnoteElements = doc.getElementsByTagNameNS(WORD_NAMESPACE, "footnote");
  
  for (let i = 0; i < footnoteElements.length; i++) {
    const footnoteElement = footnoteElements[i];
    if (!footnoteElement) continue;
    
    const id = footnoteElement.getAttribute("w:id");
    const type = footnoteElement.getAttribute("w:type");
    
    // Skip separator, continuationSeparator, and continuationNotice footnotes
    if (type === "separator" || type === "continuationSeparator" || type === "continuationNotice") {
      continue;
    }
    
    if (id) {
      const elements: (Paragraph | Table)[] = [];
      
      // Parse all paragraphs and tables in this footnote
      for (let j = 0; j < footnoteElement.childNodes.length; j++) {
        const child = footnoteElement.childNodes[j];
        if (!child || child.nodeType !== 1) continue;
        
        const element = child as Element;
        const tagName = element.tagName;
        
        if (tagName === "w:p") {
          const paragraph = parseParagraph(element, relationships, undefined, undefined, stylesheet, theme);
          if (paragraph) {
            const docElement = convertToDocumentElement(paragraph);
            if (docElement.type === 'paragraph' || docElement.type === 'heading') {
              elements.push(docElement as Paragraph);
            }
          }
        } else if (tagName === "w:tbl") {
          const table = parseTable(element, relationships, theme, stylesheet);
          if (table) {
            elements.push(table);
          }
        }
      }
      
      if (elements.length > 0) {
        footnotes.push({
          type: 'footnote',
          id,
          elements
        });
      }
    }
  }
  
  return footnotes;
}