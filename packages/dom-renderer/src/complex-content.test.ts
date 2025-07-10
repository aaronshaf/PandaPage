import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@browser-document-viewer/parser";

test("renderToHtml handles unknown element types gracefully", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      { type: "paragraph", runs: [{ text: "Known" }] },
      // @ts-ignore - Testing unknown type
      { type: "unknown", content: "test" },
      { type: "paragraph", runs: [{ text: "After" }] }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>Known</span></p>');
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>After</span></p>');
  expect(result).not.toContain("unknown");
});

test("renderToHtml handles mixed content", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Mixed Content"
    },
    elements: [
      { type: "heading", level: 1, runs: [{ text: "Title" }] },
      { type: "paragraph", runs: [{ text: "Intro paragraph" }] },
      { type: "paragraph", runs: [{ text: "List item" }], listInfo: { level: 0, type: "bullet" } },
      { type: "pageBreak" },
      { type: "heading", level: 2, runs: [{ text: "Section" }] }
    ]
  };
  
  const result = renderToHtml(doc, { includeStyles: true });
  // DOM renderer doesn't create title tags
  expect(result).not.toContain('<title>');
  expect(result).toContain('<h1 style="margin-bottom: 12pt; font-weight: bold; font-size: 24pt;"><span>Title</span></h1>');
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>Intro paragraph</span></p>');
  // Lists are now rendered as proper HTML lists
  expect(result).toContain('<ul style="margin-bottom: 12pt; padding-left: 24pt; list-style-type: disc;"><li style="margin-bottom: 4pt; margin-top: 0px;"><span>List item</span></li></ul>');
  // Page breaks now split content into separate pages
  expect(result).toContain('data-page-number="1"');
  expect(result).toContain('data-page-number="2"');
  expect(result).toContain('<h2 style="margin-bottom: 12pt; font-weight: bold; font-size: 20pt;"><span>Section</span></h2>');
});