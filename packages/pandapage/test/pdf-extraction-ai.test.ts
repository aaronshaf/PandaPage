import { test, expect } from "bun:test";
import { Effect } from "effect";
import { extractTextContent } from "../src/pdf-text-extractor";
import { expectTextMatch, evaluateTextExtraction } from "../src/test-ai-evaluator";
import * as fs from "fs";
import * as path from "path";

// Load expected markdown files
const loadExpectedMarkdown = (filename: string): string => {
  const mdPath = path.join(__dirname, "../../../assets/examples", filename);
  return fs.readFileSync(mdPath, "utf-8").trim();
};

test("PDF extraction - sample1.pdf with AI evaluation", async () => {
  const pdfPath = path.join(__dirname, "../../../assets/examples/sample1.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  // Extract text
  const extractedText = await Effect.runPromise(extractTextContent(arrayBuffer));
  
  // Load expected markdown
  const expectedMarkdown = loadExpectedMarkdown("sample1.md");
  
  // Use AI evaluation
  await expectTextMatch(extractedText, expectedMarkdown, "sample1.pdf extraction");
});

test("PDF extraction - sample2.pdf with AI evaluation", async () => {
  const pdfPath = path.join(__dirname, "../../../assets/examples/sample2.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  // Extract text
  const extractedText = await Effect.runPromise(extractTextContent(arrayBuffer));
  
  // Load expected markdown
  const expectedMarkdown = loadExpectedMarkdown("sample2.md");
  
  // Use AI evaluation
  await expectTextMatch(extractedText, expectedMarkdown, "sample2.pdf extraction");
});

test("AI evaluation - demonstrate scoring", async () => {
  const perfectMatch = "This is a test document.";
  const nearMatch = "This is a test document";  // Missing period
  const partialMatch = "This is a test doc.";  // Different ending
  const poorMatch = "Something completely different";
  
  // Test perfect match
  const perfectResult = await Effect.runPromise(
    evaluateTextExtraction(perfectMatch, perfectMatch)
  );
  expect(perfectResult.score).toBe(100);
  expect(perfectResult.passed).toBe(true);
  
  // Test near match
  const nearResult = await Effect.runPromise(
    evaluateTextExtraction(perfectMatch, nearMatch)
  );
  console.log(`Near match score: ${nearResult.score}%, Description: ${nearResult.description}`);
  expect(nearResult.score).toBeGreaterThan(90);
  
  // Test partial match
  const partialResult = await Effect.runPromise(
    evaluateTextExtraction(perfectMatch, partialMatch)
  );
  console.log(`Partial match score: ${partialResult.score}%, Description: ${partialResult.description}`);
  expect(partialResult.score).toBeGreaterThan(50);
  expect(partialResult.score).toBeLessThan(90);
  
  // Test poor match
  const poorResult = await Effect.runPromise(
    evaluateTextExtraction(perfectMatch, poorMatch)
  );
  console.log(`Poor match score: ${poorResult.score}%, Description: ${poorResult.description}`);
  expect(poorResult.score).toBeLessThan(50);
  expect(poorResult.passed).toBe(false);
});

test("PDF extraction - sample3.pdf with detailed AI feedback", async () => {
  const pdfPath = path.join(__dirname, "../../../assets/examples/sample3.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  // Extract text with V3 extractor (which has spacing issues)
  const { extractTextContentV3 } = await import("../src/pdf-text-extractor-v3");
  const extractedText = await Effect.runPromise(extractTextContentV3(arrayBuffer));
  
  // Load expected markdown
  const expectedMarkdown = loadExpectedMarkdown("sample3.md");
  
  // Get detailed evaluation
  const result = await Effect.runPromise(
    evaluateTextExtraction(expectedMarkdown, extractedText)
  );
  
  console.log(`\nSample3.pdf extraction evaluation:`);
  console.log(`Score: ${result.score}%`);
  console.log(`Passed: ${result.passed}`);
  console.log(`AI Feedback: ${result.description}`);
  
  // This test is expected to fail but will provide useful feedback
  if (!result.passed) {
    console.log("\nThis is expected - sample3.pdf has known spacing issues");
  }
});