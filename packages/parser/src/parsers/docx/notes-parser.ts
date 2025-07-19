// Parser for footnotes and endnotes
import type { DocxFootnote, DocxEndnote, DocxNotesData, DocxParagraph } from "./types";
import { WORD_NAMESPACE } from "./types";
import { getElementByTagNameNSFallback, getElementsByTagNameNSFallback } from "./xml-utils";
import { parseParagraph } from "./paragraph-parser";
import type { DocxStylesheet } from "./style-parser";
import type { DocxTheme } from "./theme-parser";
import type { FieldParsingContext } from "./field-context";

/**
 * Parse footnotes from footnotes.xml
 */
export function parseFootnotes(
  footnotesXml: Document,
  imageRelationships: Map<string, any> | undefined,
  hyperlinkRelationships: Map<string, string> | undefined,
  zip: any,
  stylesheet?: DocxStylesheet,
  theme?: DocxTheme,
  fieldContext?: FieldParsingContext,
): Map<string, DocxFootnote> {
  const footnotes = new Map<string, DocxFootnote>();
  const ns = WORD_NAMESPACE;
  
  const footnotesElement = footnotesXml.documentElement;
  if (!footnotesElement) return footnotes;
  
  const footnoteElements = getElementsByTagNameNSFallback(footnotesElement, ns, "footnote");
  
  for (let i = 0; i < footnoteElements.length; i++) {
    const footnoteElement = footnoteElements[i];
    if (!footnoteElement) continue;
    
    const id = footnoteElement.getAttribute("w:id");
    const type = footnoteElement.getAttribute("w:type") as "separator" | "continuationSeparator" | undefined;
    
    if (!id) continue;
    
    // Parse paragraphs within the footnote
    const paragraphs: DocxParagraph[] = [];
    const paragraphElements = getElementsByTagNameNSFallback(footnoteElement, ns, "p");
    
    for (let j = 0; j < paragraphElements.length; j++) {
      const paragraphElement = paragraphElements[j];
      if (!paragraphElement) continue;
      
      const paragraph = parseParagraph(
        paragraphElement,
        hyperlinkRelationships,
        imageRelationships,
        zip,
        stylesheet,
        theme,
        fieldContext,
      );
      
      if (paragraph) {
        paragraphs.push(paragraph);
      }
    }
    
    footnotes.set(id, {
      id,
      type: type || "normal",
      paragraphs,
    });
  }
  
  return footnotes;
}

/**
 * Parse endnotes from endnotes.xml
 */
export function parseEndnotes(
  endnotesXml: Document,
  imageRelationships: Map<string, any> | undefined,
  hyperlinkRelationships: Map<string, string> | undefined,
  zip: any,
  stylesheet?: DocxStylesheet,
  theme?: DocxTheme,
  fieldContext?: FieldParsingContext,
): Map<string, DocxEndnote> {
  const endnotes = new Map<string, DocxEndnote>();
  const ns = WORD_NAMESPACE;
  
  const endnotesElement = endnotesXml.documentElement;
  if (!endnotesElement) return endnotes;
  
  const endnoteElements = getElementsByTagNameNSFallback(endnotesElement, ns, "endnote");
  
  for (let i = 0; i < endnoteElements.length; i++) {
    const endnoteElement = endnoteElements[i];
    if (!endnoteElement) continue;
    
    const id = endnoteElement.getAttribute("w:id");
    const type = endnoteElement.getAttribute("w:type") as "separator" | "continuationSeparator" | undefined;
    
    if (!id) continue;
    
    // Parse paragraphs within the endnote
    const paragraphs: DocxParagraph[] = [];
    const paragraphElements = getElementsByTagNameNSFallback(endnoteElement, ns, "p");
    
    for (let j = 0; j < paragraphElements.length; j++) {
      const paragraphElement = paragraphElements[j];
      if (!paragraphElement) continue;
      
      const paragraph = parseParagraph(
        paragraphElement,
        hyperlinkRelationships,
        imageRelationships,
        zip,
        stylesheet,
        theme,
        fieldContext,
      );
      
      if (paragraph) {
        paragraphs.push(paragraph);
      }
    }
    
    endnotes.set(id, {
      id,
      type: type || "normal",
      paragraphs,
    });
  }
  
  return endnotes;
}