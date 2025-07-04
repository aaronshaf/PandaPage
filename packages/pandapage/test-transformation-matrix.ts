import { Effect, pipe } from "effect";
import { readFileSync } from "fs";
import { extractTextContentV3 } from "./src/pdf-text-extractor-v3";

// Enable debug logging
process.env.DEBUG = "true";

const testPdfPath = process.argv[2];
if (!testPdfPath) {
  console.error("Please provide a PDF file path as argument");
  process.exit(1);
}

console.log(`Testing transformation matrix handling with: ${testPdfPath}`);
console.log("=".repeat(80));

const buffer = readFileSync(testPdfPath);

const program = pipe(
  extractTextContentV3(buffer.buffer),
  Effect.map((text) => {
    console.log("\nExtracted Text:");
    console.log("-".repeat(80));
    console.log(text);
    console.log("-".repeat(80));
    console.log(`\nTotal characters: ${text.length}`);
    
    // Show first few lines
    const lines = text.split('\n').filter(line => line.trim());
    console.log(`\nFirst 10 lines:`);
    lines.slice(0, 10).forEach((line, i) => {
      console.log(`${i + 1}: ${line}`);
    });
  }),
  Effect.catchAll((error) => {
    console.error("Error extracting text:", error);
    return Effect.succeed(undefined);
  })
);

Effect.runPromise(program);