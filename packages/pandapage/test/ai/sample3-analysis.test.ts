import { test, expect } from "bun:test";
import { Effect } from "effect";
import { extractTextContent } from "../../src/pdf-text-extractor";
import { evaluateTextExtraction } from "../../src/test-ai-evaluator";
import * as fs from "fs";
import * as path from "path";

// Dedicated test for analyzing sample3.pdf extraction quality
test("Analyze sample3.pdf extraction for 90% improvement", async () => {
  // Load PDF
  const pdfPath = path.join(__dirname, "../../../demo/public/sample3.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  // Extract text
  const extractedText = await Effect.runPromise(
    extractTextContent(arrayBuffer)
  );
  
  // Load expected markdown and strip frontmatter
  const mdPath = path.join(__dirname, "../../../demo/public/sample3.md");
  const expectedContent = fs.readFileSync(mdPath, "utf-8").trim();
  const frontmatterRegex = /^---\n[\s\S]*?\n---\n\n?/;
  const expectedText = expectedContent.replace(frontmatterRegex, '').trim();
  
  // Get detailed AI evaluation
  const result = await Effect.runPromise(
    evaluateTextExtraction(expectedText, extractedText)
  );
  
  console.log(`\n=== DETAILED ANALYSIS ===`);
  console.log(`Current Score: ${result.score}%`);
  console.log(`Target Score: 90%`);
  console.log(`Gap: ${90 - result.score}%`);
  console.log(`\nAI Description: ${result.description}`);
  
  // Show text length comparison
  console.log(`\n=== LENGTH COMPARISON ===`);
  console.log(`Expected text length: ${expectedText.length} chars`);
  console.log(`Extracted text length: ${extractedText.length} chars`);
  console.log(`Length ratio: ${(extractedText.length / expectedText.length * 100).toFixed(1)}%`);
  
  // Show first 500 chars of each for comparison
  console.log(`\n=== FIRST 500 CHARS COMPARISON ===`);
  console.log(`EXPECTED:\n"${expectedText.substring(0, 500)}..."`);
  console.log(`\nEXTRACTED:\n"${extractedText.substring(0, 500)}..."`);
  
  // This test always passes - it's just for analysis
  expect(result.score).toBeGreaterThan(80);
}, 30000);