import { test, expect } from "bun:test";
import { Effect } from "effect";
import { extractTextContent } from "../../src/pdf-text-extractor";
import * as fs from "fs";
import * as path from "path";

// Detailed line-by-line analysis for sample3.pdf beyond line 20
test("Detailed line analysis for sample3.pdf (lines 21-50)", async () => {
  // Load PDF using the assets directory where files are confirmed to exist
  const loadPDF = (filename: string): ArrayBuffer => {
    const pdfPath = path.join(__dirname, "../../../../assets/examples", filename);
    const buffer = fs.readFileSync(pdfPath);
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  };

  const loadExpectedMarkdown = (filename: string): string => {
    const mdPath = path.join(__dirname, "../../../../assets/examples", filename);
    const content = fs.readFileSync(mdPath, "utf-8").trim();
    
    // Strip YAML frontmatter if present
    const frontmatterRegex = /^---\n[\s\S]*?\n---\n\n?/;
    return content.replace(frontmatterRegex, '').trim();
  };
  
  // Extract text
  const extractedText = await Effect.runPromise(
    extractTextContent(loadPDF("sample3.pdf"))
  );
  
  // Load expected text
  const expectedText = loadExpectedMarkdown("sample3.md");
  
  // Split into lines for detailed comparison
  const extractedLines = extractedText.split('\n');
  const expectedLines = expectedText.split('\n');
  
  console.log(`\n=== DETAILED LINE ANALYSIS (21-50) ===`);
  console.log(`Total - Expected: ${expectedLines.length}, Extracted: ${extractedLines.length}, Diff: ${extractedLines.length - expectedLines.length}`);
  
  // Compare lines 21-50 in detail
  for (let i = 20; i < Math.min(50, Math.max(expectedLines.length, extractedLines.length)); i++) {
    const expected = expectedLines[i] || '[MISSING]';
    const extracted = extractedLines[i] || '[MISSING]';
    const match = expected === extracted ? '✓' : '✗';
    
    console.log(`\nLine ${i + 1} ${match}`);
    if (expected !== extracted) {
      console.log(`  Expected (${expected.length} chars): "${expected}"`);
      console.log(`  Extracted (${extracted.length} chars): "${extracted}"`);
      
      // Show character-level diff for short lines
      if (expected.length < 100 && extracted.length < 100) {
        console.log(`  Char diff: Expected[${expected.split('').join(',')}] vs Extracted[${extracted.split('').join(',')}]`);
      }
    }
  }
  
  // Identify where extra lines might be coming from
  console.log(`\n=== EXTRA LINES ANALYSIS ===`);
  const extraLines = extractedLines.length - expectedLines.length;
  console.log(`Extra lines: ${extraLines}`);
  
  if (extraLines > 0) {
    console.log("\nLooking for patterns in extra content...");
    
    // Find lines that appear in extracted but not expected
    const expectedSet = new Set(expectedLines);
    const extraExtractedLines = extractedLines.filter(line => !expectedSet.has(line));
    
    console.log(`\nLines in extracted but not in expected (${extraExtractedLines.length}):`);
    extraExtractedLines.slice(0, 10).forEach((line, idx) => {
      console.log(`  ${idx + 1}: "${line}"`);
    });
  }
  
  // Always pass - this is analysis only
  expect(extractedLines.length).toBeGreaterThan(130);
}, 30000);