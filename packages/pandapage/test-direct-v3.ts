import { Effect, pipe } from "effect";
import { readFileSync } from "fs";
import { extractTextContentV3 } from "./src/pdf-text-extractor-v3";
import { debug } from "./src/debug";

// Force enable debug
debug.enabled = true;

const testPdfPath = process.argv[2];
if (!testPdfPath) {
  console.error("Please provide a PDF file path as argument");
  process.exit(1);
}

console.log(`Testing with: ${testPdfPath}`);

const buffer = readFileSync(testPdfPath);

const program = pipe(
  extractTextContentV3(buffer.buffer),
  Effect.map((text) => {
    console.log("\nExtracted Text Length:", text.length);
    console.log("\nFirst 500 chars:");
    console.log(text.substring(0, 500));
  }),
  Effect.catchAll((error) => {
    console.error("Error:", error);
    return Effect.succeed(undefined);
  })
);

Effect.runPromise(program);