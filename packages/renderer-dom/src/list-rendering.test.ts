import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@browser-document-viewer/parser";

test("renderToHtml handles lists", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Item 1" }],
        listInfo: { level: 0, type: "bullet" }
      },
      {
        type: "paragraph",
        runs: [{ text: "Item 2" }],
        listInfo: { level: 0, type: "bullet" }
      },
      {
        type: "paragraph",
        runs: [{ text: "Nested item" }],
        listInfo: { level: 1, type: "bullet" }
      }
    ]
  };
  
  const result = renderToHtml(doc);
  // Lists are now rendered as proper HTML lists
  expect(result).toContain('<ul style="margin-bottom: 12pt; padding-left: 24pt; list-style-type: disc;">');
  expect(result).toContain('<li style="margin-bottom: 4pt; margin-top: 0px;"><span>Item 1</span></li>');
  expect(result).toContain('<li style="margin-bottom: 4pt; margin-top: 0px;"><span>Item 2</span></li>');
  expect(result).toContain('<ul style="margin-left: 24pt; margin-bottom: 12pt; padding-left: 24pt; list-style-type: circle;">');
  expect(result).toContain('<li style="margin-bottom: 4pt; margin-top: 0px;"><span>Nested item</span></li>');
});

test("renderToHtml handles numbered lists", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "First" }],
        listInfo: { level: 0, type: "number" }
      },
      {
        type: "paragraph",
        runs: [{ text: "Second" }],
        listInfo: { level: 0, type: "number" }
      }
    ]
  };
  
  const result = renderToHtml(doc);
  // Lists are now rendered as proper HTML lists
  expect(result).toContain('<ol style="margin-bottom: 12pt; padding-left: 24pt; list-style-type: decimal;">');
  expect(result).toContain('<li style="margin-bottom: 4pt; margin-top: 0px;"><span>First</span></li>');
  expect(result).toContain('<li style="margin-bottom: 4pt; margin-top: 0px;"><span>Second</span></li>');
});

test("renderToHtml handles mixed list types", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Bullet 1" }],
        listInfo: { level: 0, type: "bullet" }
      },
      {
        type: "paragraph",
        runs: [{ text: "Number 1" }],
        listInfo: { level: 0, type: "number" }
      }
    ]
  };
  
  const result = renderToHtml(doc);
  // Mixed list types are now rendered as separate list containers
  expect(result).toContain('<ul style="margin-bottom: 12pt; padding-left: 24pt; list-style-type: disc;">');
  expect(result).toContain('<li style="margin-bottom: 4pt; margin-top: 0px;"><span>Bullet 1</span></li>');
  expect(result).toContain('<ol style="margin-bottom: 12pt; padding-left: 24pt; list-style-type: decimal;">');
  expect(result).toContain('<li style="margin-bottom: 4pt; margin-top: 0px;"><span>Number 1</span></li>');
});