import { Effect } from "effect";
import { PdfInput } from "./types";

// Browser-specific utility to fetch PDF from a URL/path
export const fetchPdf = (urlOrPath: string): Effect.Effect<Blob, Error> =>
  Effect.gen(function* () {
    try {
      const url = new URL(urlOrPath, window.location.href);
      const response = yield* Effect.promise(() => fetch(url));
      
      if (!response.ok) {
        return yield* Effect.fail(new Error(`Failed to fetch PDF: ${response.statusText}`));
      }
      
      const blob = yield* Effect.promise(() => response.blob());
      
      // Verify it's a PDF
      if (!blob.type.includes('pdf')) {
        console.warn(`Fetched file may not be a PDF. Content-Type: ${blob.type}`);
      }
      
      return blob;
    } catch (error) {
      return yield* Effect.fail(new Error(`Failed to fetch PDF: ${error}`));
    }
  });

// Helper for demo - accepts string path and converts to proper input
export const renderPdfFromPath = (path: string): Promise<string> => {
  return Effect.runPromise(
    Effect.gen(function* () {
      const blob = yield* fetchPdf(path);
      const { processPdf } = yield* Effect.promise(() => import('./pdf-processor'));
      const result = yield* processPdf(blob);
      return result.raw;
    })
  );
};