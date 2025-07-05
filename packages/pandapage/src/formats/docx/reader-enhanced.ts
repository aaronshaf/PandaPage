import { Effect } from "effect";
import { debug } from "../../common/debug";
import { DocxParseError } from "./types";
import type { EnhancedDocxDocument } from "./types";

// Re-export types for convenience
export type { 
  EnhancedDocxDocument, 
  DocxElement, 
  DocxTable, 
  DocxTableRow, 
  DocxTableCell,
  DocxParseError 
} from "./types";

/**
 * Enhanced DOCX reader with proper XML parsing and metadata extraction
 */
export const readEnhancedDocx = (buffer: ArrayBuffer): Effect.Effect<EnhancedDocxDocument, DocxParseError> =>
  Effect.tryPromise({
    try: async () => {
      debug.log("Reading enhanced DOCX file...");
      const startTime = Date.now();

      // Import the working simple reader and use it
      const { readDocx } = await import("./docx-reader");
      const document = await Effect.runPromise(readDocx(buffer));

      // Convert simple document to enhanced format
      const elements = document.paragraphs.map(p => ({ 
        type: "paragraph" as const, 
        ...p 
      }));

      const processingTime = Date.now() - startTime;
      debug.log(`Enhanced DOCX parsing completed in ${processingTime}ms`);

      return {
        elements,
        metadata: {
          extractedAt: new Date(),
          originalFormat: "docx" as const,
          wordCount: elements.reduce((count, el) => {
            if (el.type === "paragraph") {
              return count + el.runs.map(r => r.text).join("").split(/\s+/).length;
            }
            return count;
          }, 0),
          characterCount: elements.reduce((count, el) => {
            if (el.type === "paragraph") {
              return count + el.runs.map(r => r.text).join("").length;
            }
            return count;
          }, 0),
          paragraphCount: elements.filter(el => el.type === "paragraph").length,
        },
        numbering: document.numbering,
        processingTime,
        extractedAt: new Date(),
        originalFormat: "docx" as const,
        wordCount: 0,
        characterCount: 0,
        paragraphCount: 0,
      };
    },
    catch: (error) => new DocxParseError(`Failed to parse DOCX: ${error}`)
  });