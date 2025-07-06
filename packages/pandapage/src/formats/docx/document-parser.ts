import { Effect } from "effect";
import { debug } from "../../common/debug";
import { parseXmlString } from "../../common/xml-parser";
import { safeExecute, createCategorizedError } from "../../common/error-handling";
import { parseParagraph, parseNumbering } from "./docx-reader";
import { parseTableEnhanced } from "./table-parser";
import type { 
  DocxElement, 
  DocxParagraph, 
  DocxTable,
  DocxNumbering 
} from "./types";
import { DocxParseError } from "./types";

/**
 * Parse the main document XML and extract elements
 */
export const parseDocumentXmlEnhanced = (root: Element): Effect.Effect<DocxElement[], DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Parsing document XML with enhanced parser");
    
    // Try multiple ways to find the body element
    let body: Element | null = root.querySelector("body");
    if (!body) {
      // Try with namespace
      const bodies = root.getElementsByTagNameNS("*", "body");
      if (bodies.length > 0) {
        body = bodies[0] || null;
      }
    }
    if (!body) {
      // Try looking for any element with local name "body"
      const allElements = root.getElementsByTagName("*");
      for (let i = 0; i < allElements.length; i++) {
        const elem = allElements[i];
        if (elem && elem.localName === "body") {
          body = elem;
          break;
        }
      }
    }
    if (!body) {
      return yield* Effect.fail(new DocxParseError("No body element found in document"));
    }
    
    const elements: DocxElement[] = [];
    const children = Array.from(body.children);
    
    for (const child of children) {
      const parseElement = Effect.gen(function* () {
        const tagName = child.tagName || child.localName;
        if (tagName === "p" || tagName === "w:p") {
          // Parse paragraph with safe execution
          return yield* safeExecute(
            Effect.sync(() => parseParagraph(child))
          );
        } else if (tagName === "tbl" || tagName === "w:tbl") {
          // Parse table
          return yield* parseTableEnhanced(child);
        } else if (tagName === "sectPr" || tagName === "w:sectPr") {
          // Section properties - skip for now but could be parsed later
          debug.log("Skipping section properties");
          return null;
        } else {
          debug.log(`Unknown element type: ${child.tagName}`);
          return null;
        }
      });
      
      const result = yield* Effect.either(parseElement);
      if (result._tag === "Right" && result.right) {
        elements.push(result.right);
      } else if (result._tag === "Left") {
        debug.log(`Failed to parse element ${child.tagName}:`, result.left);
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
    
    debug.log("Parsing numbering XML");
    const parseNumberingEffect = Effect.gen(function* () {
      const numberingDoc = yield* parseXmlString(numberingXml);
      const numberingRoot = numberingDoc.documentElement;
      
      if (numberingRoot.tagName !== "numbering") {
        return yield* Effect.fail(new DocxParseError("Invalid numbering XML structure"));
      }
      
      return parseNumbering(numberingRoot);
    });
    
    const result = yield* Effect.either(parseNumberingEffect);
    if (result._tag === "Right") {
      return result.right;
    } else {
      debug.log("Failed to parse numbering XML:", result.left);
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
        const text = element.runs.map((run: any) => run.text).join("");
        characterCount += text.length;
        
        // Simple word count (split by whitespace)
        const words = text.trim().split(/\s+/).filter((word: string) => word.length > 0);
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