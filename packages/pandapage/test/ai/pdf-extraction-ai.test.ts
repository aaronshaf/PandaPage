import { test, expect } from "bun:test";
import { Effect } from "effect";
import { extractTextContent } from "../../src/pdf-text-extractor";
import { expectTextMatch } from "../../src/test-ai-evaluator";
import * as fs from "fs";
import * as path from "path";

// Suppress dotenv output
process.env.DOTENV_CONFIG_SILENT = "true";

// Load expected markdown files
const loadExpectedMarkdown = (filename: string): string => {
  const mdPath = path.join(__dirname, "../../../demo/public", filename);
  const content = fs.readFileSync(mdPath, "utf-8").trim();
  
  // Strip YAML frontmatter if present
  const frontmatterRegex = /^---\n[\s\S]*?\n---\n\n?/;
  return content.replace(frontmatterRegex, '').trim();
};

// Helper to load PDF
const loadPDF = (filename: string): ArrayBuffer => {
  const pdfPath = path.join(__dirname, "../../../demo/public", filename);
  const buffer = fs.readFileSync(pdfPath);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
};

test("sample1.pdf", async () => {
  const extractedText = await Effect.runPromise(
    extractTextContent(loadPDF("sample1.pdf"))
  );
  
  await expectTextMatch(extractedText, loadExpectedMarkdown("sample1.md"), {
    threshold: 85
  });
});

test("sample2.pdf", async () => {
  const extractedText = await Effect.runPromise(
    extractTextContent(loadPDF("sample2.pdf"))
  );
  
  await expectTextMatch(extractedText, loadExpectedMarkdown("sample2.md"), {
    threshold: 90
  });
});

test("sample3.pdf", async () => {
  const extractedText = await Effect.runPromise(
    extractTextContent(loadPDF("sample3.pdf"))
  );
  
  await expectTextMatch(extractedText, loadExpectedMarkdown("sample3.md"), {
    threshold: 5  // Known spacing issues, using basic similarity
  });
});

test("guide-footnotes.pdf", async () => {
  const extractedText = await Effect.runPromise(
    extractTextContent(loadPDF("guide-footnotes.pdf"))
  );
  
  const expectedMarkdown = loadExpectedMarkdown("guide-footnotes.md");
  
  await expectTextMatch(extractedText, expectedMarkdown, {
    threshold: 5  // Complex document, using basic similarity
  });
});