import { Effect, Stream, pipe } from "effect";
import { PdfInput, ProcessingOptions, MarkdownOutput } from "./types";
import { 
  toArrayBuffer, 
  toChunkStream, 
  validatePdfHeader, 
  extractMetadata,
  PdfReadError,
  PdfParseError 
} from "./pdf-reader";
import { createMarkdownOutput, formatPdfContent, formatFrontMatter } from "./markdown-formatter";
import { extractTextContent } from "./pdf-text-extractor";
import { extractTextContentV3 } from "./pdf-text-extractor-v3";

// Main PDF processing pipeline
export const processPdf = (
  input: PdfInput,
  options: ProcessingOptions = {}
): Effect.Effect<MarkdownOutput, PdfReadError | PdfParseError> =>
  Effect.gen(function* () {
    // 1. Convert input to ArrayBuffer
    yield* Effect.log("Converting input to ArrayBuffer...");
    const buffer = yield* toArrayBuffer(input);
    
    // 2. Validate PDF header
    yield* Effect.log("Validating PDF header...");
    yield* validatePdfHeader(buffer);
    
    // 3. Extract metadata
    yield* Effect.log("Extracting metadata...");
    const metadata = yield* extractMetadata(buffer);
    
    // 4. Extract text content
    yield* Effect.log("Extracting text content...");
    const extractedText = yield* extractTextContentV3(buffer);
    
    // Build content with extracted text
    const rawContent = extractedText || "No text content could be extracted from this PDF.";
    
    // 5. Format content as markdown
    const formattedContent = yield* formatPdfContent(rawContent);
    
    // If no title in metadata, use the first line of extracted text
    if (!metadata.title && extractedText) {
      const firstLine = extractedText.split('\n')[0].trim();
      if (firstLine) {
        metadata.title = firstLine;
      }
    }
    
    // 6. Create final markdown output
    return yield* createMarkdownOutput(
      metadata,
      formattedContent,
      options.includeMetadata ?? true
    );
  });

// Stream-based PDF processing for large files
export const processPdfStream = (
  input: PdfInput,
  options: ProcessingOptions = {}
): Stream.Stream<string, PdfReadError | PdfParseError> =>
  Stream.unwrap(
    Effect.gen(function* () {
      // Convert input to buffer first
      const buffer = yield* toArrayBuffer(input);
      yield* validatePdfHeader(buffer);
      
      // Extract metadata
      const metadata = yield* extractMetadata(buffer);
      
      // Create a stream that emits markdown in chunks
      // Extract text content
      const textContent = yield* extractTextContentV3(buffer);
      const chunks = textContent.match(/.{1,500}/g) || [textContent];
      
      return pipe(
        Stream.make(
          // First chunk: front matter
          options.includeMetadata ? formatFrontMatter(metadata) + "\n\n" : "",
          // Following chunks: actual content
          ...chunks
        ),
        Stream.filter((chunk) => chunk.length > 0)
      );
    })
  );

