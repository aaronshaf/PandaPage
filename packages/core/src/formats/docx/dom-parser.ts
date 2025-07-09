import { Effect } from "effect";
import { debug } from "../../common/debug";
import { parseXmlString } from "../../common/xml-parser";
import { 
  parseFieldsFromParagraph, 
  paragraphContainsFields,
  type DocxField 
} from "./form-field-parser";
import type { DocxParagraph, DocxRun, DocxParseError } from "./docx-reader";

// Get XMLSerializer for both browser and Node.js environments
function getXMLSerializer(): XMLSerializer {
  // Browser environment
  if (typeof window !== 'undefined' && window.XMLSerializer) {
    return new window.XMLSerializer();
  }
  
  // Node.js environment - use happy-dom (more lenient than @xmldom/xmldom)
  try {
    const { Window } = require('happy-dom');
    const window = new Window();
    return new window.XMLSerializer();
  } catch (error) {
    throw new Error('XMLSerializer not available. Please install happy-dom for Node.js environments.');
  }
}

/**
 * Parse document.xml content using proper DOM parsing instead of regex
 * This replaces the problematic regex-based parsing that fails with nested XML
 */
export const parseDocumentXmlWithDom = (xmlContent: string): Effect.Effect<DocxParagraph[], DocxParseError> =>
  Effect.gen(function* () {
    const paragraphs: DocxParagraph[] = [];

    // Parse XML with proper DOM parser using existing utilities
    const doc = yield* parseXmlString(xmlContent).pipe(
      Effect.mapError(error => ({
        _tag: "DocxParseError" as const,
        message: `XML parsing error: ${error.message}`
      }))
    );

    // Get all paragraph elements using querySelector (more lenient than namespace-aware methods)
    const paragraphElements = doc.querySelectorAll('p');
    
    debug.log(`Found ${paragraphElements.length} paragraph elements`);

    // Process each paragraph
    for (const pElement of paragraphElements) {
      // Check if paragraph contains fields (use full paragraph XML for this)
      const paragraphXml = getXMLSerializer().serializeToString(pElement);
      let fields: DocxField[] | undefined;
      if (paragraphContainsFields(paragraphXml)) {
        const fieldsResult = yield* parseFieldsFromParagraph(paragraphXml);
        if (fieldsResult.length > 0) {
          fields = fieldsResult;
        }
      }

      // Extract paragraph style using querySelector (similar to existing working functions)
      const styleElement = pElement.querySelector('pPr pStyle');
      const style = styleElement?.getAttribute('val') || undefined;

      // Extract list properties
      const numPrElement = pElement.querySelector('pPr numPr');
      const numIdElement = numPrElement?.querySelector('numId');
      const ilvlElement = numPrElement?.querySelector('ilvl');
      
      const numId = numIdElement?.getAttribute('val') || undefined;
      const ilvl = ilvlElement ? parseInt(ilvlElement.getAttribute('val') || '0', 10) : undefined;

      // Extract runs within the paragraph
      const runs: DocxRun[] = [];
      const runElements = pElement.querySelectorAll('r');
      
      for (const runElement of runElements) {
        // Parse the run content to extract text and special elements in order
        let runText = "";
        
        // Process text elements
        const textElements = runElement.querySelectorAll('t');
        for (const textElement of textElements) {
          runText += textElement.textContent || "";
        }
        
        // Process tab elements
        const tabElements = runElement.querySelectorAll('tab');
        for (const tabElement of tabElements) {
          runText += "\t";
        }
        
        // Process break elements
        const breakElements = runElement.querySelectorAll('br');
        for (const breakElement of breakElements) {
          const type = breakElement.getAttribute('type');
          if (type === 'page') {
            // Page break
            runText += "\u000C"; // Form feed character (page break)
          } else {
            // Regular line break
            runText += "\n";
          }
        }

        if (runText) {
          // Check for formatting in run properties using querySelector
          const bold = !!runElement.querySelector('rPr b');
          const italic = !!runElement.querySelector('rPr i');
          
          // Check for underline - need to verify the w:val attribute  
          const underlineElement = runElement.querySelector('rPr u');
          let underline = false;
          if (underlineElement) {
            const val = underlineElement.getAttribute('val');
            const color = underlineElement.getAttribute('color');
            
            if (val) {
              // If w:val is present, only apply underline if it's not "none" or "0"
              underline = val !== "none" && val !== "0";
            } else if (!color) {
              // If no w:val and no w:color, it's a simple <w:u/> which defaults to single underline
              underline = true;
            }
            // If w:color but no w:val, it's likely for color styling only, not underline
          }

          runs.push({
            text: runText,
            ...(bold && { bold }),
            ...(italic && { italic }),
            ...(underline && { underline }),
          });
        }
      }

      if (runs.length > 0 || fields) {
        paragraphs.push({
          type: "paragraph",
          style,
          runs,
          ...(numId && { numId }),
          ...(ilvl !== undefined && { ilvl }),
          ...(fields && { fields }),
        });
      }
    }

    debug.log(`Parsed ${paragraphs.length} paragraphs with DOM parser`);
    return paragraphs;
  });

/**
 * Parse numbering.xml content using proper DOM parsing instead of regex
 */
export const parseNumberingXmlWithDom = (xmlContent: string): Effect.Effect<any, DocxParseError> =>
  Effect.gen(function* () {
    const instances = new Map<string, string>();
    const abstractFormats = new Map<string, any>();
    
    // Parse XML with proper DOM parser using existing utilities
    const doc = yield* parseXmlString(xmlContent).pipe(
      Effect.mapError(error => ({
        _tag: "DocxParseError" as const,
        message: `XML parsing error: ${error.message}`
      }))
    );

    // Parse abstract numbering definitions using getElementsByTagName to handle namespaces
    const abstractNumElements = doc.getElementsByTagName('w:abstractNum');
    
    for (const abstractElement of abstractNumElements) {
      const abstractNumId = abstractElement.getAttribute('w:abstractNumId');
      if (!abstractNumId) continue;

      const levels = new Map<number, any>();
      
      // Parse levels within this abstract format
      const levelElements = abstractElement.getElementsByTagName('w:lvl');
      
      for (const levelElement of levelElements) {
        const ilvlStr = levelElement.getAttribute('w:ilvl');
        if (!ilvlStr) continue;
        
        const ilvl = parseInt(ilvlStr, 10);
        
        // Extract numFmt
        const numFmtElement = levelElement.getElementsByTagName('w:numFmt')[0];
        const numFmt = numFmtElement?.getAttribute('w:val') || 'bullet';
        
        // Extract lvlText
        const lvlTextElement = levelElement.getElementsByTagName('w:lvlText')[0];
        const lvlText = lvlTextElement?.getAttribute('w:val') || '•';
        
        levels.set(ilvl, { numFmt, lvlText });
      }
      
      if (levels.size > 0) {
        abstractFormats.set(abstractNumId, { levels });
      }
    }

    // Parse numbering instances
    const numElements = doc.getElementsByTagName('w:num');
    
    for (const numElement of numElements) {
      const numId = numElement.getAttribute('w:numId');
      if (!numId) continue;
      
      // Extract abstractNumId reference
      const abstractNumIdElement = numElement.getElementsByTagName('w:abstractNumId')[0];
      const abstractNumId = abstractNumIdElement?.getAttribute('w:val');
      
      if (abstractNumId) {
        instances.set(numId, abstractNumId);
      }
    }

    debug.log(`Parsed ${instances.size} numbering instances and ${abstractFormats.size} abstract formats with DOM parser`);
    return { instances, abstractFormats };
  });