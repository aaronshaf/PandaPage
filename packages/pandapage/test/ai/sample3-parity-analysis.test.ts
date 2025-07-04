import { test, expect } from "bun:test";
import { Effect } from "effect";
import { extractTextContent } from "../../src/pdf-text-extractor";
import { evaluateTextExtraction } from "../../src/test-ai-evaluator";
import * as fs from "fs";
import * as path from "path";

// Detailed analysis for reaching sample3.md parity
test("Deep analysis for sample3.md parity", async () => {
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
  
  // Split into sections for detailed comparison
  const extractedLines = extractedText.split('\n');
  const expectedLines = expectedText.split('\n');
  
  console.log(`\n=== PARITY ANALYSIS ===`);
  console.log(`Expected lines: ${expectedLines.length}`);
  console.log(`Extracted lines: ${extractedLines.length}`);
  
  // Compare first 20 lines in detail
  console.log(`\n=== LINE-BY-LINE COMPARISON (first 20 lines) ===`);
  for (let i = 0; i < Math.min(20, Math.max(expectedLines.length, extractedLines.length)); i++) {
    const expected = expectedLines[i] || '[MISSING]';
    const extracted = extractedLines[i] || '[MISSING]';
    const match = expected === extracted ? '✓' : '✗';
    
    console.log(`Line ${i + 1} ${match}`);
    if (expected !== extracted) {
      console.log(`  Expected: "${expected}"`);
      console.log(`  Extracted: "${extracted}"`);
      console.log(`  Diff: Expected ${expected.length} chars, Got ${extracted.length} chars`);
    }
  }
  
  // Analyze paragraph structure
  const expectedParagraphs = expectedText.split('\n\n').filter(p => p.trim());
  const extractedParagraphs = extractedText.split('\n\n').filter(p => p.trim());
  
  console.log(`\n=== PARAGRAPH STRUCTURE ===`);
  console.log(`Expected paragraphs: ${expectedParagraphs.length}`);
  console.log(`Extracted paragraphs: ${extractedParagraphs.length}`);
  
  // Show paragraph differences
  for (let i = 0; i < Math.min(5, Math.max(expectedParagraphs.length, extractedParagraphs.length)); i++) {
    const expected = expectedParagraphs[i] || '[MISSING]';
    const extracted = extractedParagraphs[i] || '[MISSING]';
    const match = expected === extracted ? '✓' : '✗';
    
    console.log(`\nParagraph ${i + 1} ${match}`);
    if (expected !== extracted) {
      console.log(`  Expected (${expected.length} chars): "${expected.substring(0, 100)}..."`);
      console.log(`  Extracted (${extracted.length} chars): "${extracted.substring(0, 100)}..."`);
    }
  }
  
  // Get AI evaluation with specific feedback
  const result = await Effect.runPromise(
    evaluateTextExtraction(expectedText, extractedText)
  );
  
  console.log(`\n=== AI EVALUATION ===`);
  console.log(`Current Score: ${result.score}%`);
  console.log(`Description: ${result.description}`);
  
  // Count specific markdown elements
  const expectedHeaders = expectedText.match(/^#{1,6}\s+/gm) || [];
  const extractedHeaders = extractedText.match(/^#{1,6}\s+/gm) || [];
  
  console.log(`\n=== MARKDOWN STRUCTURE ===`);
  console.log(`Expected headers: ${expectedHeaders.length}`);
  console.log(`Extracted headers: ${extractedHeaders.length}`);
  console.log(`Expected headers:`, expectedHeaders);
  console.log(`Extracted headers:`, extractedHeaders);
  
  // Always pass - this is analysis only
  expect(result.score).toBeGreaterThan(70);
}, 30000);