import { Effect } from "effect";
import { parseXmlString } from "../../common/xml-parser";
import { debug } from "../../common/debug";
import { validateConfig, DEFAULT_CONFIG, type DocumentConfig } from "../../common/config";
import { safeExecute, retryWithBackoff } from "../../common/error-handling";
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
export const readEnhancedDocx = (buffer: ArrayBuffer, userConfig?: unknown): Effect.Effect<EnhancedDocxDocument, DocxParseError> =>
  Effect.gen(function* () {
    const startTime = Date.now();
    debug.log("Reading enhanced DOCX file...");
    
    // Validate configuration
    const config = yield* Effect.either(validateConfig(userConfig));
    const documentConfig = config._tag === "Right" ? config.right : DEFAULT_CONFIG;
    
    // Check file size limits
    if (buffer.byteLength > documentConfig.maxFileSize) {
      return yield* Effect.fail(new DocxParseError(`File size (${buffer.byteLength} bytes) exceeds limit (${documentConfig.maxFileSize} bytes)`));
    }

    // Load fflate for ZIP handling with retry on failure
    const { unzipSync, strFromU8 } = yield* retryWithBackoff(
      Effect.tryPromise({
        try: () => import("fflate"),
        catch: (error) => new DocxParseError(`Failed to load fflate library: ${error}`),
      }),
      3 // Max 3 attempts
    );

      const uint8Array = new Uint8Array(buffer);
      const unzipped = yield* safeExecute(
        Effect.sync(() => unzipSync(uint8Array))
      );

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

      // Parse document XML with timeout if configured
      const parseDocumentEffect = Effect.gen(function* () {
        const documentDoc = yield* parseXmlString(parts.documentXml);
        const documentRoot = documentDoc.documentElement;

        if (documentRoot.tagName !== "document") {
          return yield* Effect.fail(new DocxParseError("Invalid document XML structure"));
        }

        return yield* parseDocumentXmlEnhanced(documentRoot);
      });
      
      const elements = documentConfig.timeout > 0 
        ? yield* Effect.timeout(parseDocumentEffect, documentConfig.timeout)
        : yield* parseDocumentEffect;

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
  });