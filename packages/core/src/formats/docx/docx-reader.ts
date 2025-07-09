import { Effect } from "effect";
import { debug } from "../../common/debug";
import { 
  parseFieldsFromParagraph, 
  paragraphContainsFields,
  type DocxField 
} from "./form-field-parser";
import { parseDocumentXmlWithDom, parseNumberingXmlWithDom } from "./dom-parser";

// Error types
export class DocxParseError {
  readonly _tag = "DocxParseError";
  constructor(public readonly message: string) {}
}

// Basic DOCX structure types
export interface DocxParagraph {
  type: "paragraph";
  style?: string;
  runs: DocxRun[];
  // List properties
  numId?: string;
  ilvl?: number;
  // Field properties
  fields?: DocxField[];
}

export interface DocxRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface DocxDocument {
  paragraphs: DocxParagraph[];
  // Numbering definitions
  numbering?: DocxNumbering;
}

// Numbering types
export interface DocxNumbering {
  // Map of numId to abstractNumId
  instances: Map<string, string>;
  // Map of abstractNumId to format details
  abstractFormats: Map<string, DocxAbstractFormat>;
}

export interface DocxAbstractFormat {
  levels: Map<number, DocxLevelFormat>;
}

export interface DocxLevelFormat {
  numFmt: string; // bullet, decimal, upperLetter, etc.
  lvlText: string; // Format pattern like "•" or "%1."
}

// Read and parse DOCX file
export const readDocx = (buffer: ArrayBuffer): Effect.Effect<DocxDocument, DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Reading DOCX file...");

    try {
      // DOCX files are ZIP archives
      // We need to unzip and parse the document.xml
      const { unzipSync, strFromU8 } = yield* Effect.tryPromise({
        try: () => import("fflate"),
        catch: (error) =>
          new DocxParseError(`Failed to load fflate library: ${error}`),
      });

      // Convert ArrayBuffer to Uint8Array
      const uint8Array = new Uint8Array(buffer);

      // Unzip the DOCX file
      const unzipped = unzipSync(uint8Array);

      // Get the main document content
      const documentXml = unzipped["word/document.xml"];
      if (!documentXml) {
        return yield* Effect.fail(
          new DocxParseError("No word/document.xml found in DOCX file"),
        );
      }

      // Convert to string
      const xmlContent = strFromU8(documentXml);
      debug.log("Document XML length:", xmlContent.length);

      // Try to get numbering definitions
      let numbering: DocxNumbering | undefined;
      const numberingXml = unzipped["word/numbering.xml"];
      if (numberingXml) {
        const numberingContent = strFromU8(numberingXml);
        numbering = yield* parseNumberingXmlWithDom(numberingContent);
      }

      // Parse the XML to extract text using DOM parser instead of regex
      const paragraphs = yield* parseDocumentXmlWithDom(xmlContent);

      return { paragraphs, numbering };
    } catch (error) {
      return yield* Effect.fail(
        new DocxParseError(`Failed to read DOCX: ${error}`),
      );
    }
  });

// Parse document.xml content
// DEPRECATED: Use parseDocumentXmlWithDom instead - this regex-based approach fails with nested XML
export const parseDocumentXml = (xmlContent: string): Effect.Effect<DocxParagraph[], DocxParseError> =>
  Effect.gen(function* () {
    // Redirect to DOM-based parser to fix regex parsing issues
    return yield* parseDocumentXmlWithDom(xmlContent);
  });

// DEPRECATED: Legacy regex-based parsing - kept for reference but not used
const parseDocumentXmlRegex = (xmlContent: string): Effect.Effect<DocxParagraph[], DocxParseError> =>
  Effect.gen(function* () {
    const paragraphs: DocxParagraph[] = [];

    // PROBLEM: Simple regex-based XML parsing fails with nested XML elements
    // This caused issues like only finding 98 of 299 paragraphs in 011.docx

    // Match all paragraphs
    const paragraphRegex = /<w:p[^>]*>(.*?)<\/w:p>/gs;
    let paragraphMatch;

    while ((paragraphMatch = paragraphRegex.exec(xmlContent)) !== null) {
      const paragraphContent = paragraphMatch[1];
      if (!paragraphContent) continue;

      // Check if paragraph contains fields
      let fields: DocxField[] | undefined;
      if (paragraphContainsFields(paragraphMatch[0])) {
        const fieldsResult = yield* parseFieldsFromParagraph(paragraphMatch[0]);
        if (fieldsResult.length > 0) {
          fields = fieldsResult;
        }
      }

      // Extract paragraph style
      const styleMatch = paragraphContent.match(/<w:pStyle w:val="([^"]+)"/);
      const style = styleMatch?.[1];

      // Extract list properties
      const numIdMatch = paragraphContent.match(/<w:numId w:val="([^"]+)"/);
      const numId = numIdMatch?.[1];

      const ilvlMatch = paragraphContent.match(/<w:ilvl w:val="([^"]+)"/);
      const ilvl = ilvlMatch?.[1] ? parseInt(ilvlMatch[1], 10) : undefined;

      // Extract runs within the paragraph
      const runs: DocxRun[] = [];
      const runRegex = /<w:r[^>]*>(.*?)<\/w:r>/gs;
      let runMatch;

      while ((runMatch = runRegex.exec(paragraphContent)) !== null) {
        const runContent = runMatch[1];
        if (!runContent) continue;

        // Parse the run content to extract text and special elements in order
        let runText = "";
        
        // More comprehensive regex to match elements in order they appear
        const allElementsRegex = /<w:(?:t[^>]*>([^<]*)<\/w:t|tab\s*\/|br\s*\/)>/g;
        let elementMatch;
        
        while ((elementMatch = allElementsRegex.exec(runContent)) !== null) {
          const fullMatch = elementMatch[0];
          
          if (fullMatch.includes('<w:t')) {
            // Extract text content - the captured group is at index 1
            const textContent = elementMatch[1] || "";
            runText += textContent;
          } else if (fullMatch.includes('<w:tab')) {
            // Add tab character
            runText += "\t";
          } else if (fullMatch.includes('<w:br')) {
            // Check if it's a page break
            if (fullMatch.includes('w:type="page"')) {
              // This is a page break - add a special marker
              runText += "\u000C"; // Form feed character (page break)
            } else {
              // Regular line break
              runText += "\n";
            }
          }
        }

        if (runText) {
          // Check for formatting
          const bold = /<w:b(\s|\/|>)/.test(runContent);
          const italic = /<w:i(\s|\/|>)/.test(runContent);
          
          // Check for underline - need to verify the w:val attribute
          const underlineMatch = runContent.match(/<w:u(\s+([^>]*))?/);
          let underline = false;
          if (underlineMatch) {
            const attrs = underlineMatch[2] || "";
            // Look for w:val and w:color attributes
            const valMatch = attrs.match(/w:val="([^"]+)"/);
            const colorMatch = attrs.match(/w:color="([^"]+)"/);
            
            if (valMatch) {
              // If w:val is present, only apply underline if it's not "none" or "0"
              underline = valMatch[1] !== "none" && valMatch[1] !== "0";
            } else if (!colorMatch) {
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

    debug.log(`Parsed ${paragraphs.length} paragraphs`);

    return paragraphs;
  });

// Parse numbering.xml content  
// DEPRECATED: Use parseNumberingXmlWithDom instead - this regex-based approach fails with nested XML
const parseNumberingXml = (xmlContent: string): Effect.Effect<DocxNumbering, DocxParseError> =>
  Effect.gen(function* () {
    // Redirect to DOM-based parser
    return yield* parseNumberingXmlWithDom(xmlContent);
  });

// DEPRECATED: Legacy regex-based parsing - kept for reference but not used
const parseNumberingXmlRegex = (xmlContent: string): Effect.Effect<DocxNumbering, DocxParseError> =>
  Effect.gen(function* () {
    const instances = new Map<string, string>();
    const abstractFormats = new Map<string, DocxAbstractFormat>();
    const styleLinks = new Map<string, string>(); // Map abstractNumId to style name

    // First pass: Parse abstract numbering definitions and style links
    const abstractNumRegex = /<w:abstractNum w:abstractNumId="(\d+)"[^>]*>([\s\S]*?)<\/w:abstractNum>/g;
    let abstractMatch;
    while ((abstractMatch = abstractNumRegex.exec(xmlContent)) !== null) {
      const abstractNumId = abstractMatch[1];
      const abstractContent = abstractMatch[2];
      if (!abstractNumId || !abstractContent) continue;

      // Check for style link
      const styleLinkMatch = abstractContent.match(/<w:numStyleLink w:val="([^"]+)"/);
      if (styleLinkMatch && styleLinkMatch[1]) {
        styleLinks.set(abstractNumId, styleLinkMatch[1]);
        continue;
      }

      const levels = new Map<number, DocxLevelFormat>();

      // Parse levels
      const lvlRegex = /<w:lvl w:ilvl="(\d+)"[^>]*>([\s\S]*?)<\/w:lvl>/g;
      let lvlMatch;
      while ((lvlMatch = lvlRegex.exec(abstractContent)) !== null) {
        const ilvl = parseInt(lvlMatch[1]!, 10);
        const lvlContent = lvlMatch[2];
        if (!lvlContent) continue;

        // Extract numFmt
        const numFmtMatch = lvlContent.match(/<w:numFmt w:val="([^"]+)"/);
        const numFmt = numFmtMatch?.[1] || "bullet";

        // Extract lvlText
        const lvlTextMatch = lvlContent.match(/<w:lvlText w:val="([^"]+)"/);
        const lvlText = lvlTextMatch?.[1] || "•";

        levels.set(ilvl, { numFmt, lvlText });
      }

      abstractFormats.set(abstractNumId, { levels });
    }

    // Second pass: Resolve style links to actual definitions
    // Map style names to their actual abstract format IDs
    const styleToAbstractId = new Map<string, string>();
    for (const [id] of abstractFormats.entries()) {
      // Check if this abstract has a styleLink pointing to it
      const styleLinkRegex = new RegExp(`<w:styleLink w:val="([^"]+)"[^>]*>`, 'g');
      const abstractDef = xmlContent.match(new RegExp(`<w:abstractNum w:abstractNumId="${id}"[^>]*>([\\s\\S]*?)<\\/w:abstractNum>`));
      if (abstractDef && abstractDef[1]) {
        const linkMatch = abstractDef[1].match(styleLinkRegex);
        if (linkMatch && linkMatch[0]) {
          const styleName = linkMatch[0].match(/w:val="([^"]+)"/)?.[1];
          if (styleName) {
            styleToAbstractId.set(styleName, id);
          }
        }
      }
    }

    // Resolve style links
    for (const [id, styleName] of styleLinks.entries()) {
      const targetId = styleToAbstractId.get(styleName);
      if (targetId && abstractFormats.has(targetId)) {
        abstractFormats.set(id, abstractFormats.get(targetId)!);
      }
    }

    // Parse num instances (mapping numId to abstractNumId)
    const numRegex = /<w:num w:numId="(\d+)"[^>]*>[\s\S]*?<w:abstractNumId w:val="(\d+)"[\s\S]*?<\/w:num>/g;
    let numMatch;
    while ((numMatch = numRegex.exec(xmlContent)) !== null) {
      const numId = numMatch[1];
      const abstractNumId = numMatch[2];
      if (numId && abstractNumId) {
        instances.set(numId, abstractNumId);
      }
    }

    debug.log(`Parsed numbering: ${instances.size} instances, ${abstractFormats.size} abstract formats`);
    return { instances, abstractFormats };
  });

// Simple paragraph parser helper
export const parseParagraph = (pElement: Element): DocxParagraph => {
  const runs: DocxRun[] = [];
  const runElements = pElement.querySelectorAll('r');
  
  for (const runElement of runElements) {
    const textElements = runElement.querySelectorAll('t');
    for (const textElement of textElements) {
      // Check for underline with proper attribute analysis
      const underlineElement = runElement.querySelector('u');
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
        text: textElement.textContent || '',
        bold: !!runElement.querySelector('b'),
        italic: !!runElement.querySelector('i'),
        underline,
      });
    }
  }
  
  // Extract style
  const styleElement = pElement.querySelector('pPr pStyle');
  const style = styleElement?.getAttribute('val') || undefined;
  
  // Extract numbering properties
  const numPrElement = pElement.querySelector('pPr numPr');
  const numIdElement = numPrElement?.querySelector('numId');
  const ilvlElement = numPrElement?.querySelector('ilvl');
  
  return {
    type: "paragraph" as const,
    style,
    runs,
    numId: numIdElement?.getAttribute('val') || undefined,
    ilvl: ilvlElement ? parseInt(ilvlElement.getAttribute('val') || '0', 10) : undefined,
  };
};

// Parse numbering.xml content
export const parseNumbering = (numberingRoot: Element): DocxNumbering => {
  const instances = new Map<string, string>();
  const abstractFormats = new Map<string, DocxAbstractFormat>();

  // Parse abstract numbering definitions  
  const abstractNumElements = numberingRoot.getElementsByTagName ? 
    numberingRoot.getElementsByTagName('w:abstractNum') : 
    numberingRoot.querySelectorAll('abstractNum');
  
  for (const abstractElement of abstractNumElements) {
    const abstractNumId = abstractElement.getAttribute('w:abstractNumId') || 
      abstractElement.getAttribute('abstractNumId');
    if (!abstractNumId) continue;

    const levels = new Map<number, DocxLevelFormat>();
    
    // Parse levels within this abstract format
    const levelElements = abstractElement.getElementsByTagName ? 
      abstractElement.getElementsByTagName('w:lvl') : 
      abstractElement.querySelectorAll('lvl');
    
    for (const levelElement of levelElements) {
      const ilvlStr = levelElement.getAttribute('w:ilvl') || 
        levelElement.getAttribute('ilvl');
      if (!ilvlStr) continue;
      
      const ilvl = parseInt(ilvlStr, 10);
      
      // Extract numFmt
      const numFmtElement = levelElement.getElementsByTagName ? 
        levelElement.getElementsByTagName('w:numFmt')[0] : 
        levelElement.querySelector('numFmt');
      const numFmt = numFmtElement?.getAttribute('w:val') || 
        numFmtElement?.getAttribute('val') || 'bullet';
      
      // Extract lvlText
      const lvlTextElement = levelElement.getElementsByTagName ? 
        levelElement.getElementsByTagName('w:lvlText')[0] : 
        levelElement.querySelector('lvlText');
      const lvlText = lvlTextElement?.getAttribute('w:val') || 
        lvlTextElement?.getAttribute('val') || '•';
      
      levels.set(ilvl, { numFmt, lvlText });
    }
    
    if (levels.size > 0) {
      abstractFormats.set(abstractNumId, { levels });
    }
  }

  // Parse numbering instances
  const numElements = numberingRoot.getElementsByTagName ? 
    numberingRoot.getElementsByTagName('w:num') : 
    numberingRoot.querySelectorAll('num');
  
  for (const numElement of numElements) {
    const numId = numElement.getAttribute('w:numId') || 
      numElement.getAttribute('numId');
    if (!numId) continue;
    
    // Extract abstractNumId reference
    const abstractNumIdElement = numElement.getElementsByTagName ? 
      numElement.getElementsByTagName('w:abstractNumId')[0] : 
      numElement.querySelector('abstractNumId');
    const abstractNumId = abstractNumIdElement?.getAttribute('w:val') || 
      abstractNumIdElement?.getAttribute('val');
    
    if (abstractNumId) {
      instances.set(numId, abstractNumId);
    }
  }

  debug.log(
    `Parsed ${instances.size} numbering instances and ${abstractFormats.size} abstract formats`,
  );

  return { instances, abstractFormats };
};
