import { test, expect } from "bun:test";
import { Effect } from "effect";
import { extractTextContent } from "../../src/pdf-text-extractor";
import * as fs from "fs";
import * as path from "path";

// Deterministic tests that check for specific content without AI

// Helper to strip YAML frontmatter
const stripFrontmatter = (content: string): string => {
  const frontmatterRegex = /^---\n[\s\S]*?\n---\n\n?/;
  return content.replace(frontmatterRegex, '').trim();
};

test("PDF extraction - sample1.pdf contains expected text", async () => {
  const pdfPath = path.join(__dirname, "../../../demo/public/sample1.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  // Extract text
  const extractedText = await Effect.runPromise(extractTextContent(arrayBuffer));
  
  // Check for key content
  expect(extractedText).toContain("Dummy PDF file");
  expect(extractedText.toLowerCase()).toContain("dummy");
  expect(extractedText.toLowerCase()).toContain("pdf");
  expect(extractedText.toLowerCase()).toContain("file");
});

test("PDF extraction - sample2.pdf contains Hello World", async () => {
  const pdfPath = path.join(__dirname, "../../../demo/public/sample2.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  // Extract text
  const extractedText = await Effect.runPromise(extractTextContent(arrayBuffer));
  
  // Check for key content
  expect(extractedText).toContain("Hello");
  expect(extractedText.toLowerCase()).toContain("world");
  expect(extractedText).toMatch(/Hello,?\s*[Ww]orld/);  // Allow for variations
});

test("PDF extraction - sample3.pdf contains Lorem Ipsum", async () => {
  const pdfPath = path.join(__dirname, "../../../demo/public/sample3.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  // Extract text
  const extractedText = await Effect.runPromise(extractTextContent(arrayBuffer));
  
  // Check for key content
  expect(extractedText.toLowerCase()).toContain("lorem");
  expect(extractedText.toLowerCase()).toContain("ipsum");
  expect(extractedText.toLowerCase()).toContain("dolor");
  expect(extractedText.toLowerCase()).toContain("sit");
  expect(extractedText.toLowerCase()).toContain("amet");
  
  // Check for specific phrases that should be in the PDF
  expect(extractedText).toContain("Sample PDF");
  expect(extractedText.toLowerCase()).toContain("created for testing");
});

test("PDF extraction - guide-footnotes.pdf structure", async () => {
  const pdfPath = path.join(__dirname, "../../../demo/public/guide-footnotes.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  // Extract text
  const extractedText = await Effect.runPromise(extractTextContent(arrayBuffer));
  
  // Check for structure elements
  expect(extractedText).toContain("Footnote");
  expect(extractedText.toLowerCase()).toContain("example");
  
  // Check it has numbered items
  expect(extractedText).toMatch(/1\./);
  expect(extractedText).toMatch(/2\./);
});

test("PDF extraction - text length validation", async () => {
  const pdfPath = path.join(__dirname, "../../../demo/public/sample1.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  // Extract text
  const extractedText = await Effect.runPromise(extractTextContent(arrayBuffer));
  
  // Basic validation
  expect(extractedText.length).toBeGreaterThan(0);
  expect(extractedText.trim().length).toBeGreaterThan(0);
  
  // Should not be too short for a PDF
  expect(extractedText.length).toBeGreaterThan(10);
});

// Exact match tests - these PDFs extract perfectly
test("PDF extraction - sample1.pdf exact match", async () => {
  const pdfPath = path.join(__dirname, "../../../demo/public/sample1.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  const extractedText = await Effect.runPromise(extractTextContent(arrayBuffer));
  
  // Load expected text (strip frontmatter)
  const expectedPath = path.join(__dirname, "../../../demo/public/sample1.md");
  const expectedContent = stripFrontmatter(fs.readFileSync(expectedPath, "utf-8"));
  
  expect(extractedText.trim()).toBe(expectedContent.trim());
});

test("PDF extraction - sample2.pdf exact match", async () => {
  const pdfPath = path.join(__dirname, "../../../demo/public/sample2.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  const extractedText = await Effect.runPromise(extractTextContent(arrayBuffer));
  
  // Load expected text (strip frontmatter)
  const expectedPath = path.join(__dirname, "../../../demo/public/sample2.md");
  const expectedContent = stripFrontmatter(fs.readFileSync(expectedPath, "utf-8"));
  
  expect(extractedText.trim()).toBe(expectedContent.trim());
});