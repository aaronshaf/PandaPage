import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@browser-document-viewer/parser";

test("renderToHtml handles page breaks", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Page 1" }]
      },
      {
        type: "pageBreak"
      },
      {
        type: "paragraph",
        runs: [{ text: "Page 2" }]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  // Page breaks now split content into separate page divs
  expect(result).toContain('data-page-number="1"');
  expect(result).toContain('data-page-number="2"');
  expect(result).toContain('Page 1');
  expect(result).toContain('Page 2');
});

test("renderToHtml includes full document when requested", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Test Document",
      author: "Test Author",
      description: "Test description"
    },
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Content" }]
      }
    ]
  };
  
  const result = renderToHtml(doc, { includeStyles: true });
  // DOM renderer doesn't create full HTML document structure, just the content
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>Content</span></p>');
  expect(result).not.toContain('<!DOCTYPE html>');
});

test("renderToHtml handles full document with all metadata", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Test Document",
      author: "Test Author", 
      description: "Test description",
      keywords: ["test", "document"],
      language: "en"
    },
    elements: []
  };
  
  const result = renderToHtml(doc, { includeStyles: true });
  // DOM renderer returns a page even for empty documents
  expect(result).toContain('data-page-number="1"');
  expect(result).toContain('class="page"');
  expect(result).toContain('class="page-content"');
});

test("renderToHtml handles fragment output", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Test Document"
    },
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Content" }]
      }
    ]
  };
  
  const result = renderToHtml(doc, { includeStyles: false });
  expect(result).not.toContain("<!DOCTYPE html>");
  expect(result).not.toContain("<title>");
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>Content</span></p>');
});