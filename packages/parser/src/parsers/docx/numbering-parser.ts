// Numbering parser for DOCX files
import { Effect } from 'effect';
import { DocxParseError } from './types';
import { getElementsByTagNameNSFallback, getElementByTagNameNSFallback } from './xml-utils';

export interface NumberingDefinition {
  instances: Map<string, string>; // numId -> abstractNumId
  abstractFormats: Map<string, AbstractFormat>; // abstractNumId -> format
}

export interface AbstractFormat {
  levels: Map<number, LevelFormat>; // ilvl -> format
}

export interface LevelFormat {
  numFmt: string; // bullet, decimal, upperLetter, etc.
  lvlText: string; // Format pattern like "•" or "%1."
}

/**
 * Parse numbering.xml content to extract list format definitions
 */
export const parseNumberingXml = (xmlContent: string): Effect.Effect<NumberingDefinition, DocxParseError> =>
  Effect.gen(function* () {
    const instances = new Map<string, string>();
    const abstractFormats = new Map<string, AbstractFormat>();
    
    // Parse XML
    let doc: Document;
    if (typeof DOMParser === 'undefined') {
      const { DOMParser: XMLDOMParser } = yield* Effect.tryPromise({
        try: () => import('@xmldom/xmldom'),
        catch: (error) => new DocxParseError(`Failed to load XML parser: ${error}`)
      });
      const parser = new XMLDOMParser();
      doc = parser.parseFromString(xmlContent, "text/xml") as any;
    } else {
      const parser = new DOMParser();
      doc = parser.parseFromString(xmlContent, "text/xml");
    }
    
    const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    
    // Parse abstract numbering definitions
    const abstractNumElements = getElementsByTagNameNSFallback(doc.documentElement, ns, 'abstractNum');
    
    
    // First pass: parse all abstract formats
    const abstractFormatsTemp = new Map<string, { levels: Map<number, LevelFormat>; styleLink?: string; numStyleLink?: string }>();
    
    for (const abstractElement of abstractNumElements) {
      const abstractNumId = abstractElement.getAttribute('w:abstractNumId') || 
                           abstractElement.getAttribute('abstractNumId');
      if (!abstractNumId) continue;

      
      const levels = new Map<number, LevelFormat>();
      
      // Check for style links
      const styleLinkElement = getElementByTagNameNSFallback(abstractElement, ns, 'styleLink');
      const styleLink = styleLinkElement?.getAttribute('w:val') || styleLinkElement?.getAttribute('val') || undefined;
      
      const numStyleLinkElement = getElementByTagNameNSFallback(abstractElement, ns, 'numStyleLink');
      const numStyleLink = numStyleLinkElement?.getAttribute('w:val') || numStyleLinkElement?.getAttribute('val') || undefined;
      
      
      // Parse levels within this abstract format
      const levelElements = getElementsByTagNameNSFallback(abstractElement, ns, 'lvl');
      
      
      for (const levelElement of levelElements) {
        const ilvlStr = levelElement.getAttribute('w:ilvl') || 
                        levelElement.getAttribute('ilvl');
        if (!ilvlStr) continue;
        
        const ilvl = parseInt(ilvlStr, 10);
        
        // Extract numFmt
        const numFmtElement = getElementByTagNameNSFallback(levelElement, ns, 'numFmt');
        const numFmt = numFmtElement?.getAttribute('w:val') || 
                       numFmtElement?.getAttribute('val') || 'bullet';
        
        // Extract lvlText
        const lvlTextElement = getElementByTagNameNSFallback(levelElement, ns, 'lvlText');
        const lvlText = lvlTextElement?.getAttribute('w:val') || 
                        lvlTextElement?.getAttribute('val') || '•';
        
        
        levels.set(ilvl, { numFmt, lvlText });
      }
      
      abstractFormatsTemp.set(abstractNumId, { levels, styleLink, numStyleLink });
    }
    
    // Second pass: resolve style links
    for (const [abstractNumId, format] of abstractFormatsTemp) {
      if (format.levels.size === 0 && (format.styleLink || format.numStyleLink)) {
        // This is a style link - find the referenced format
        const styleNameToFind = format.styleLink || format.numStyleLink;
        
        // Find the abstract format that has this style name
        for (const [refAbstractNumId, refFormat] of abstractFormatsTemp) {
          if (refFormat.styleLink === styleNameToFind && refFormat.levels.size > 0) {
            // Copy the levels from the referenced format
            format.levels = new Map(refFormat.levels);
            break;
          }
        }
      }
      
      abstractFormats.set(abstractNumId, { levels: format.levels });
    }

    // Parse numbering instances
    const numElements = getElementsByTagNameNSFallback(doc.documentElement, ns, 'num');
    
    
    for (const numElement of numElements) {
      const numId = numElement.getAttribute('w:numId') || 
                    numElement.getAttribute('numId');
      if (!numId) continue;
      
      // Extract abstractNumId reference
      const abstractNumIdElement = getElementByTagNameNSFallback(numElement, ns, 'abstractNumId');
      const abstractNumId = abstractNumIdElement?.getAttribute('w:val') || 
                            abstractNumIdElement?.getAttribute('val');
      
      
      if (abstractNumId) {
        instances.set(numId, abstractNumId);
      }
    }

    return { instances, abstractFormats };
  });

/**
 * Determine list type from numbering definition
 */
export function getListType(
  numId: string | undefined,
  ilvl: number | undefined,
  numberingDef: NumberingDefinition | undefined
): 'bullet' | 'number' {
  
  if (!numId || ilvl === undefined || !numberingDef) {
    return 'number'; // Default fallback
  }
  
  // Look up abstractNumId
  const abstractNumId = numberingDef.instances.get(numId);
  if (!abstractNumId) {
    return 'number'; // Default fallback
  }
  
  // Look up abstract format
  const abstractFormat = numberingDef.abstractFormats.get(abstractNumId);
  if (!abstractFormat) {
    return 'number'; // Default fallback
  }
  
  // Look up level format
  const levelFormat = abstractFormat.levels.get(ilvl);
  if (!levelFormat) {
    return 'number'; // Default fallback
  }
  
  // Determine type based on numFmt
  // Only "bullet" format is considered a bullet list
  // All other formats (decimal, upperLetter, lowerLetter, etc.) are numbered lists
  if (levelFormat.numFmt === 'bullet') {
    return 'bullet';
  } else {
    return 'number';
  }
}

/**
 * Get list text pattern for a specific list item
 */
export function getListText(
  numId: string | undefined,
  ilvl: number | undefined,
  numberingDef: NumberingDefinition | undefined
): string | undefined {
  if (!numId || ilvl === undefined || !numberingDef) {
    return undefined;
  }
  
  // Look up abstractNumId
  const abstractNumId = numberingDef.instances.get(numId);
  if (!abstractNumId) {
    return undefined;
  }
  
  // Look up abstract format
  const abstractFormat = numberingDef.abstractFormats.get(abstractNumId);
  if (!abstractFormat) {
    return undefined;
  }
  
  // Look up level format
  const levelFormat = abstractFormat.levels.get(ilvl);
  if (!levelFormat) {
    return undefined;
  }
  
  return levelFormat.lvlText;
}

/**
 * Get numbering format for a specific list item
 */
export function getNumberingFormat(
  numId: string | undefined,
  ilvl: number | undefined,
  numberingDef: NumberingDefinition | undefined
): string | undefined {
  if (!numId || ilvl === undefined || !numberingDef) {
    return undefined;
  }
  
  // Look up abstractNumId
  const abstractNumId = numberingDef.instances.get(numId);
  if (!abstractNumId) {
    return undefined;
  }
  
  // Look up abstract format
  const abstractFormat = numberingDef.abstractFormats.get(abstractNumId);
  if (!abstractFormat) {
    return undefined;
  }
  
  // Look up level format
  const levelFormat = abstractFormat.levels.get(ilvl);
  if (!levelFormat) {
    return undefined;
  }
  
  return levelFormat.numFmt;
}