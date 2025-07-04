import { test, expect } from "bun:test";
import { extractTextContentV3 } from "../src/pdf-text-extractor-v3";
import { Effect, Logger, LogLevel } from "effect";
import * as fs from "fs";
import * as path from "path";

const loadPdfAsArrayBuffer = (sampleName: string): ArrayBuffer => {
  const pdfPath = path.join(__dirname, `../../../assets/examples/${sampleName}.pdf`);
  const buffer = fs.readFileSync(pdfPath);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
};

// Configure logger for tests
const getLogLevel = (): LogLevel.LogLevel => {
  const level = process.env.LOG_LEVEL?.toLowerCase() || "error";
  switch (level) {
    case "none": return LogLevel.None;
    case "fatal": return LogLevel.Fatal;
    case "error": return LogLevel.Error;
    case "warning": return LogLevel.Warning;
    case "info": return LogLevel.Info;
    case "debug": return LogLevel.Debug;
    case "trace": return LogLevel.Trace;
    case "all": return LogLevel.All;
    default: return LogLevel.Error;
  }
};

const testLoggerLayer = Logger.minimumLogLevel(getLogLevel());

// Helper to run effects with test logger
const runEffect = <A>(effect: Effect.Effect<A, any>) => 
  Effect.runPromise(effect.pipe(Effect.provide(testLoggerLayer)));

test("V3 extractor - sample1.pdf basic extraction", async () => {
  const pdfBuffer = loadPdfAsArrayBuffer("sample1");
  const result = await runEffect(extractTextContentV3(pdfBuffer));
  
  expect(result).toContain("Dummy PDF file");
  expect(result.length).toBeGreaterThan(10);
});

test("V3 extractor - sample2.pdf extracts 'Hello, world.'", async () => {
  const pdfBuffer = loadPdfAsArrayBuffer("sample2");
  const result = await runEffect(extractTextContentV3(pdfBuffer));
  
  expect(result).toContain("Hello, world.");
  expect(result.trim()).toBe("Hello, world.");
});

test("V3 extractor - sample3.pdf multi-page content", async () => {
  const pdfBuffer = loadPdfAsArrayBuffer("sample3");
  const result = await runEffect(extractTextContentV3(pdfBuffer));
  
  // Check key content from the three-page document
  expect(result).toContain("Sample PDF");
  expect(result).toContain("Created for testing PDFObject");
  expect(result).toContain("This PDF is three pages long");
  expect(result).toContain("Lorem ipsum");
  expect(result).toContain("Etiam ultrices");
  
  // Verify it has substantial content (multi-page)
  expect(result.length).toBeGreaterThan(5000);
});

test("V3 extractor - guide-footnotes.pdf academic content", async () => {
  const pdfBuffer = loadPdfAsArrayBuffer("guide-footnotes");
  const result = await runEffect(extractTextContentV3(pdfBuffer));
  
  // Check key sections from the footnotes guide
  expect(result).toContain("Eighth Grade Term Paper: Footnotes");
  expect(result).toContain("What is a footnote?");
  expect(result).toContain("Why do you need to use footnotes?");
  expect(result).toContain("How do you make a footnote?");
  expect(result).toContain("plagiarism");
  expect(result).toContain("After the Civil War, New York City");
  expect(result).toContain("Block Quotations");
  
  // Verify it extracts footnotes
  const footnoteMatches = result.match(/\d+\./g) || [];
  expect(footnoteMatches.length).toBeGreaterThan(5); // Should have multiple footnote numbers
});

test("V3 extractor - TJ array handling", async () => {
  // Test that TJ arrays are properly concatenated
  const pdfBuffer = loadPdfAsArrayBuffer("sample3");
  const result = await runEffect(extractTextContentV3(pdfBuffer));
  
  // These should appear as continuous text, not fragmented
  expect(result).toContain("Sample PDF"); // Not "Sa m ple PDF"
  expect(result).toContain("Lorem ipsum dolor"); // Not "Lo rem ip sum do lor"
});

test("V3 extractor - preserves reading order", async () => {
  const pdfBuffer = loadPdfAsArrayBuffer("guide-footnotes");
  const result = await runEffect(extractTextContentV3(pdfBuffer));
  
  // Check that sections appear in correct order
  const whatIndex = result.indexOf("What is a footnote?");
  const whyIndex = result.indexOf("Why do you need to use footnotes?");
  const howIndex = result.indexOf("How do you make a footnote?");
  
  expect(whatIndex).toBeGreaterThan(-1);
  expect(whyIndex).toBeGreaterThan(whatIndex);
  expect(howIndex).toBeGreaterThan(whyIndex);
});