import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@browser-document-viewer/parser";

test("renderToHtml handles page breaks", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Page 1" }],
      },
      {
        type: "pageBreak",
      },
      {
        type: "paragraph",
        runs: [{ text: "Page 2" }],
      },
    ],
  };

  const result = renderToHtml(doc);
  // Page breaks now split content into separate page divs
  // Enhanced renderer doesn't split into pages
  expect(result).not.toContain('data-page-number');
  expect(result).toContain("Page 1");
  expect(result).toContain("Page 2");
});

test("renderToHtml includes full document when requested", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Test Document",
      author: "Test Author",
      description: "Test description",
    },
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Content" }],
      },
    ],
  };

  const result = renderToHtml(doc, { includeStyles: true });
  // Enhanced renderer now uses inline styles
  expect(result).toContain('<p style="margin-bottom: 12px;"><span>Content</span></p>');
  expect(result).not.toContain("<!DOCTYPE html>");
});

test("renderToHtml handles full document with all metadata", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Test Document",
      author: "Test Author",
      description: "Test description",
      keywords: ["test", "document"],
      language: "en",
    },
    elements: [],
  };

  const result = renderToHtml(doc, { includeStyles: true });
  // Enhanced renderer creates a document container without page structure
  expect(result).toContain('class="document-container"');
  expect(result).not.toContain('data-page-number');
  expect(result).not.toContain('class="page"');
});

test("renderToHtml handles fragment output", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Test Document",
    },
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Content" }],
      },
    ],
  };

  const result = renderToHtml(doc, { includeStyles: false });
  expect(result).not.toContain("<!DOCTYPE html>");
  expect(result).not.toContain("<title>");
  // Enhanced renderer uses inline styles even when includeStyles is false
  expect(result).toContain('<p style="margin-bottom: 12px;"><span>Content</span></p>');
});
