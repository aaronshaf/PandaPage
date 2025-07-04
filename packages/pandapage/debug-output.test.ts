import { test } from "bun:test";
import { Effect } from "effect";
import { extractTextContent } from "./src/pdf-text-extractor";
import * as fs from "fs";
import * as path from "path";

test("Debug current output", async () => {
  const loadPDF = (filename: string): ArrayBuffer => {
    const pdfPath = path.join(__dirname, "../../assets/examples", filename);
    const buffer = fs.readFileSync(pdfPath);
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  };

  const extractedText = await Effect.runPromise(
    extractTextContent(loadPDF("sample3.pdf"))
  );
  
  console.log("=== CURRENT OUTPUT ===");
  const lines = extractedText.split('\n');
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    console.log(`Line ${i + 1}: "${lines[i]}"`);
  }
  
  console.log("\n=== EXPECTED OUTPUT ===");
  const expectedPath = path.join(__dirname, "../../assets/examples/sample3.md");
  const expected = fs.readFileSync(expectedPath, "utf-8").replace(/^---\n[\s\S]*?\n---\n\n?/, '').trim();
  const expectedLines = expected.split('\n');
  for (let i = 0; i < Math.min(10, expectedLines.length); i++) {
    console.log(`Line ${i + 1}: "${expectedLines[i]}"`);
  }
});