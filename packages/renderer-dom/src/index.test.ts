import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@pandapage/parser";

test("renderToHtml handles empty document", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: []
  };
  
  const result = renderToHtml(doc);
  expect(result).toBe("");
});

test("renderToHtml renders headings", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "heading",
        level: 1,
        runs: [{ text: "Hello World" }]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain("<h1");
  expect(result).toContain("Hello World</h1>");
});

test("renderToHtml renders paragraphs", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "This is a paragraph." }]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain("<p");
  expect(result).toContain("This is a paragraph.</p>");
});

test("renderToHtml escapes HTML entities", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Test <script>alert('xss')</script>" }]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).not.toContain("<script>");
  expect(result).toContain("&lt;script&gt;");
});

test("renderToHtml includes full document when requested", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Test Document"
    },
    elements: []
  };
  
  const result = renderToHtml(doc, { includeStyles: true });
  expect(result).toContain("<!DOCTYPE html>");
  expect(result).toContain("<title>Test Document</title>");
  expect(result).toContain("<style>");
});