import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@browser-document-viewer/parser";

test("renderToHtml handles empty document", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: []
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('data-page-number="1"');
  expect(result).toContain('class="page"');
  expect(result).toContain('class="page-content"');
  expect(result).toContain('style="width: 8.5in');
  expect(result).toContain('style="padding: 0px 0px 0.5in');
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
  expect(result).toContain('<h1 style="margin-bottom: 12pt; font-weight: bold; font-size: 24pt;">');
  expect(result).toContain("<span>Hello World</span></h1>");
});

test("renderToHtml renders all heading levels", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      { type: "heading", level: 1, runs: [{ text: "H1" }] },
      { type: "heading", level: 2, runs: [{ text: "H2" }] },
      { type: "heading", level: 3, runs: [{ text: "H3" }] },
      { type: "heading", level: 4, runs: [{ text: "H4" }] },
      { type: "heading", level: 5, runs: [{ text: "H5" }] },
      { type: "heading", level: 6, runs: [{ text: "H6" }] }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<h1 style="margin-bottom: 12pt; font-weight: bold; font-size: 24pt;"><span>H1</span></h1>');
  expect(result).toContain('<h2 style="margin-bottom: 12pt; font-weight: bold; font-size: 20pt;"><span>H2</span></h2>');
  expect(result).toContain('<h3 style="margin-bottom: 12pt; font-weight: bold; font-size: 16pt;"><span>H3</span></h3>');
  expect(result).toContain('<h4 style="margin-bottom: 12pt; font-weight: bold; font-size: 14pt;"><span>H4</span></h4>');
  expect(result).toContain('<h5 style="margin-bottom: 12pt; font-weight: bold; font-size: 12pt;"><span>H5</span></h5>');
  expect(result).toContain('<h6 style="margin-bottom: 12pt; font-weight: bold; font-size: 11pt;"><span>H6</span></h6>');
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
  expect(result).toContain('<p style="margin-bottom: 12pt;">');
  expect(result).toContain("<span>This is a paragraph.</span></p>");
});









