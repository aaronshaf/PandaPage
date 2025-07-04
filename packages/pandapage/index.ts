import { Effect, Stream } from "effect";
import * as Schema from "@effect/schema/Schema";
import { processPdf, processPdfStream } from "./src/pdf-processor";
import { PdfInput, ProcessingOptions } from "./src/types";
import { fetchPdf, renderPdfFromPath } from "./src/browser-utils";

// Re-export types
export * from "./src/types";
export { PdfReadError, PdfParseError } from "./src/pdf-reader";

// Schema for PDF rendering options
export const RenderOptions = Schema.Struct({
  pdfPath: Schema.String,
  format: Schema.optionalWith(Schema.Literal("markdown", "html", "text"), {
    default: () => "markdown" as const
  }),
  includeMetadata: Schema.optionalWith(Schema.Boolean, {
    default: () => true
  }),
});

export type RenderOptions = Schema.Schema.Type<typeof RenderOptions>;

// Synchronous version - returns markdown string directly
// Note: This is not truly sync as PDF processing is inherently async
export function renderPdfSync(pdfPath: string): string {
  // For now, return placeholder - true sync would require blocking
  return `# PDF Document\n\nSynchronous processing of: ${pdfPath}\n\nNote: Real PDF processing requires async operations.`;
}

// Promise-based version - returns a promise that resolves to markdown
export function renderPdf(input: PdfInput | string): Promise<string>;
export function renderPdf(options: RenderOptions & { input?: PdfInput }): Promise<string>;
export function renderPdf(inputOrOptions: PdfInput | string | (RenderOptions & { input?: PdfInput })): Promise<string> {
  // Handle string path for backward compatibility
  if (typeof inputOrOptions === "string") {
    return renderPdfFromPath(inputOrOptions);
  }
  
  const isOptions = inputOrOptions && typeof inputOrOptions === "object" && "pdfPath" in inputOrOptions;
  const input = isOptions ? (inputOrOptions.input || inputOrOptions.pdfPath) : inputOrOptions;
  const options: ProcessingOptions = isOptions ? {
    includeMetadata: inputOrOptions.includeMetadata
  } : {};
  
  // If input is still a string path from options, fetch it first
  if (typeof input === "string") {
    return renderPdfFromPath(input);
  }
  
  return Effect.runPromise(
    Effect.gen(function* () {
      const result = yield* processPdf(input as PdfInput, options);
      return result.raw;
    })
  );
}

// Stream-based version - returns a stream of markdown chunks
export function renderPdfStream(input: PdfInput | string, options?: ProcessingOptions): Stream.Stream<string, Error> {
  // Handle string path by fetching first
  if (typeof input === "string") {
    return Stream.unwrap(
      Effect.gen(function* () {
        const blob = yield* fetchPdf(input);
        return processPdfStream(blob, options);
      })
    );
  }
  
  return processPdfStream(input, options);
}

// Effect-based version for more control
export function renderPdfEffect(
  input: PdfInput,
  options?: ProcessingOptions
): Effect.Effect<string, Error> {
  return Effect.gen(function* () {
    const result = yield* processPdf(input, options);
    return result.raw;
  });
}