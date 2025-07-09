import { Effect } from "effect";
import { debug } from "../../common/debug";
import type { DocxRun } from "./types";
import { DocxParseError } from "./types";
import { parseXmlString } from "../../common/xml-parser";

/**
 * Hyperlink relationship data from document.xml.rels
 */
export interface HyperlinkRelationship {
  id: string;
  target: string;
  targetMode?: string;
}

/**
 * Parse hyperlink relationships from document.xml.rels using DOM parsing
 */
export const parseHyperlinkRelationships = (
  relsXml: string
): Effect.Effect<Map<string, HyperlinkRelationship>, DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Parsing hyperlink relationships with DOM parsing");
    
    const relationships = new Map<string, HyperlinkRelationship>();
    
    // Parse XML with DOM parser
    const doc = yield* parseXmlString(relsXml).pipe(
      Effect.mapError(error => new DocxParseError(`Failed to parse relationships XML: ${error.message}`))
    );
    
    // Get all Relationship elements
    const relationshipElements = doc.getElementsByTagName('Relationship');
    
    for (const element of relationshipElements) {
      const type = element.getAttribute('Type');
      
      // Check if it's a hyperlink relationship
      if (type === 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink') {
        const id = element.getAttribute('Id');
        const target = element.getAttribute('Target');
        const targetMode = element.getAttribute('TargetMode');
        
        if (id && target) {
          relationships.set(id, {
            id,
            target,
            ...(targetMode && { targetMode })
          });
        }
      }
    }
    
    debug.log(`Found ${relationships.size} hyperlink relationships`);
    return relationships;
  });

/**
 * Parse a hyperlink element and extract its runs using DOM parsing
 */
export const parseHyperlink = (
  hyperlinkXml: string,
  relationships: Map<string, HyperlinkRelationship>
): Effect.Effect<{ runs: DocxRun[], url?: string }, DocxParseError> =>
  Effect.gen(function* () {
    const runs: DocxRun[] = [];
    let url: string | undefined;
    
    // Add namespace declarations if missing
    let xmlContent = hyperlinkXml;
    if (!xmlContent.includes('xmlns:w=')) {
      xmlContent = xmlContent.replace(
        /<w:hyperlink([^>]*)>/,
        '<w:hyperlink$1 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
      );
    }
    
    // Parse XML with DOM parser
    const doc = yield* parseXmlString(xmlContent).pipe(
      Effect.mapError(error => new DocxParseError(`Failed to parse hyperlink XML: ${error.message}`))
    );
    
    // Get the hyperlink element
    const wordNamespaceURI = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    const relNamespaceURI = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
    
    let hyperlinkElement = doc.getElementsByTagNameNS(wordNamespaceURI, 'hyperlink')[0];
    if (!hyperlinkElement) {
      hyperlinkElement = doc.getElementsByTagName('w:hyperlink')[0];
    }
    
    if (!hyperlinkElement) {
      return { runs, url };
    }
    
    // Extract relationship ID
    const rId = hyperlinkElement.getAttributeNS(relNamespaceURI, 'id') || 
                hyperlinkElement.getAttribute('r:id');
    if (rId) {
      const relationship = relationships.get(rId);
      if (relationship) {
        url = relationship.target;
      }
    }
    
    // Extract anchor (for internal links)
    const anchor = hyperlinkElement.getAttributeNS(wordNamespaceURI, 'anchor') || 
                   hyperlinkElement.getAttribute('w:anchor');
    if (anchor && !url) {
      url = `#${anchor}`;
    }
    
    // Get all run elements within the hyperlink
    let runElements = hyperlinkElement.getElementsByTagNameNS(wordNamespaceURI, 'r');
    if (runElements.length === 0) {
      runElements = hyperlinkElement.getElementsByTagName('w:r');
    }
    
    // Process each run element
    for (const runElement of runElements) {
      // Get text elements
      let textElements = runElement.getElementsByTagNameNS(wordNamespaceURI, 't');
      if (textElements.length === 0) {
        textElements = runElement.getElementsByTagName('w:t');
      }
      
      if (textElements.length > 0) {
        const text = Array.from(textElements).map(el => el.textContent || '').join('');
        
        if (text) {
          // Check for formatting elements
          const boldElements = runElement.getElementsByTagName('w:b');
          const italicElements = runElement.getElementsByTagName('w:i');
          const underlineElements = runElement.getElementsByTagName('w:u');
          
          const bold = boldElements.length > 0 && 
                      (boldElements[0]?.getAttribute('w:val') !== '0' && 
                       boldElements[0]?.getAttribute('w:val') !== 'false');
          
          const italic = italicElements.length > 0 && 
                        (italicElements[0]?.getAttribute('w:val') !== '0' && 
                         italicElements[0]?.getAttribute('w:val') !== 'false');
          
          const underline = underlineElements.length > 0 && 
                           (underlineElements[0]?.getAttribute('w:val') !== 'none' && 
                            underlineElements[0]?.getAttribute('w:val') !== '0');
          
          runs.push({
            text,
            ...(bold && { bold }),
            ...(italic && { italic }),
            ...(underline && { underline }),
            ...(url && { hyperlink: url })
          });
        }
      }
    }
    
    return { runs, url };
  });

/**
 * Convert hyperlink runs to markdown link format
 */
export const formatHyperlinkAsMarkdown = (runs: DocxRun[], url?: string): string => {
  if (!url || runs.length === 0) {
    return runs.map(r => r.text).join('');
  }
  
  const linkText = runs.map(r => r.text).join('');
  return `[${linkText}](${url})`;
};