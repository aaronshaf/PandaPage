import { Effect } from "effect";
import { debug } from "../../common/debug";
import { parseXmlString } from "../../common/xml-parser";
import { parseParagraph, parseNumbering } from "./docx-reader";
import { parseTableEnhanced } from "./table-parser";
import type { 
  DocxElement, 
  DocxParseError, 
  DocxParagraph, 
  DocxTable,
  DocxNumbering 
} from "./types";

/**
 * Parse the main document XML and extract elements
 */
export const parseDocumentXmlEnhanced = (root: Element): Effect.Effect<DocxElement[], DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Parsing document XML with enhanced parser");
    
    const body = root.querySelector("body");
    if (!body) {
      return yield* Effect.fail(new DocxParseError("No body element found in document"));
    }
    
    const elements: DocxElement[] = [];
    const children = Array.from(body.children);
    
    for (const child of children) {
      try {
        if (child.tagName === "p") {
          // Parse paragraph
          const paragraph = parseParagraph(child);
          elements.push(paragraph);
        } else if (child.tagName === "tbl") {
          // Parse table
          const table = yield* parseTableEnhanced(child);
          elements.push(table);
        } else if (child.tagName === "sectPr") {
          // Section properties - skip for now but could be parsed later
          debug.log("Skipping section properties");
        } else {
          debug.log(`Unknown element type: ${child.tagName}`);
        }
      } catch (error) {
        debug.log(`Failed to parse element ${child.tagName}:`, error);
        // Continue with other elements
      }
    }
    
    debug.log(`Parsed ${elements.length} document elements`);
    return elements;
  });

/**
 * Parse numbering XML if present
 */
export const parseNumberingXml = (numberingXml: string | null): Effect.Effect<DocxNumbering | undefined, DocxParseError> =>
  Effect.gen(function* () {
    if (!numberingXml) {
      debug.log("No numbering XML found");
      return undefined;
    }
    
    try {
      debug.log("Parsing numbering XML");
      const numberingDoc = yield* parseXmlString(numberingXml);
      const numberingRoot = numberingDoc.documentElement;
      
      if (numberingRoot.tagName !== "numbering") {
        debug.log("Invalid numbering XML structure");
        return undefined;
      }
      
      return parseNumbering(numberingRoot);
    } catch (error) {
      debug.log("Failed to parse numbering XML:", error);
      return undefined;
    }
  });

/**
 * Extract file content from unzipped DOCX
 */
export const extractFileContent = (
  unzipped: Record<string, Uint8Array>,
  filePath: string,
  strFromU8: (data: Uint8Array) => string
): string | null => {
  const file = unzipped[filePath];
  if (!file) {
    debug.log(`File not found: ${filePath}`);
    return null;
  }
  
  try {
    return strFromU8(file);
  } catch (error) {
    debug.log(`Failed to read file ${filePath}:`, error);
    return null;
  }
};

/**
 * Calculate document statistics
 */
export const calculateDocumentStats = (elements: DocxElement[]): {
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
} => {
  let wordCount = 0;
  let characterCount = 0;
  let paragraphCount = 0;
  
  const countTextInElements = (elements: DocxElement[]): void => {
    for (const element of elements) {
      if (element.type === "table") {
        // Count text in table cells
        for (const row of element.rows) {
          for (const cell of row.cells) {
            countTextInElements(cell.content);
          }
        }
      } else {
        // Count text in paragraph
        paragraphCount++;
        const text = element.runs.map(run => run.text).join("");
        characterCount += text.length;
        
        // Simple word count (split by whitespace)
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        wordCount += words.length;
      }
    }
  };
  
  countTextInElements(elements);
  
  return {
    wordCount,
    characterCount,
    paragraphCount,
  };
};