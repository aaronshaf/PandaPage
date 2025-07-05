import { Effect } from "effect";
import { parseXmlString } from "../../common/xml-parser";
import { debug } from "../../common/debug";
import { extractCompleteMetadata } from "./docx-metadata";
import { parseDocumentXmlEnhanced, parseNumberingXml, extractFileContent, calculateDocumentStats } from "./document-parser";
import type { EnhancedDocxDocument, DocxParseError } from "./types";

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
  Effect.gen(function* () {
    const startTime = Date.now();
    debug.log("Reading enhanced DOCX file...");

    try {
      // Load fflate for ZIP handling
      const { unzipSync, strFromU8 } = yield* Effect.tryPromise({
        try: () => import("fflate"),
        catch: (error) => new DocxParseError(`Failed to load fflate library: ${error}`),
      });

      const uint8Array = new Uint8Array(buffer);
      const unzipped = unzipSync(uint8Array);

      // Extract all relevant parts
      const parts = {
        documentXml: extractFileContent(unzipped, "word/document.xml", strFromU8),
        stylesXml: extractFileContent(unzipped, "word/styles.xml", strFromU8),
        numberingXml: extractFileContent(unzipped, "word/numbering.xml", strFromU8),
        corePropsXml: extractFileContent(unzipped, "docProps/core.xml", strFromU8),
        appPropsXml: extractFileContent(unzipped, "docProps/app.xml", strFromU8),
      };

      if (!parts.documentXml) {
        return yield* Effect.fail(new DocxParseError("No word/document.xml found in DOCX file"));
      }

      // Extract metadata first (lightweight operation)
      const metadata = yield* extractCompleteMetadata({
        coreXml: parts.corePropsXml,
        appXml: parts.appPropsXml,
        documentXml: parts.documentXml,
        stylesXml: parts.stylesXml,
      }).pipe(
        Effect.catchAll(() => {
          debug.log("Metadata extraction failed, using minimal metadata");
          return Effect.succeed({
            extractedAt: new Date(),
            originalFormat: "docx" as const,
          });
        })
      );

      // Parse document XML
      const documentDoc = yield* parseXmlString(parts.documentXml);
      const documentRoot = documentDoc.documentElement;

      if (documentRoot.tagName !== "document") {
        return yield* Effect.fail(new DocxParseError("Invalid document XML structure"));
      }

      // Parse document elements
      const elements = yield* parseDocumentXmlEnhanced(documentRoot);

      // Parse numbering if present
      const numbering = yield* parseNumberingXml(parts.numberingXml);

      // Calculate document statistics
      const stats = calculateDocumentStats(elements);

      const processingTime = Date.now() - startTime;
      debug.log(`Enhanced DOCX parsing completed in ${processingTime}ms`);

      return {
        elements,
        metadata: {
          ...metadata,
          ...stats,
        },
        numbering,
        processingTime,
        extractedAt: new Date(),
        originalFormat: "docx" as const,
        ...stats,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return yield* Effect.fail(new DocxParseError(`Failed to parse DOCX: ${message}`));
    }
  });