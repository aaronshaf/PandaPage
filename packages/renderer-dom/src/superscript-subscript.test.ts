import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@browser-document-viewer/parser";

test("renderToHtml handles superscript formatting", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "E=mc" },
          { text: "2", superscript: true },
          { text: " is Einstein's equation" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<sup>2</sup>');
  expect(result).toContain('E=mc');
  expect(result).toContain('is Einstein');
});

test("renderToHtml handles subscript formatting", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "H" },
          { text: "2", subscript: true },
          { text: "O is water" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<sub>2</sub>');
  expect(result).toContain('O is water');
});

test("renderToHtml handles formatted superscript", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "x", superscript: true, bold: true, color: "#FF0000" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<span style="color: #FF0000;"><sup>x</sup></span>');
});

test("renderToHtml handles formatted subscript", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "n", subscript: true, italic: true, backgroundColor: "#FFFF00" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<span style="background-color: #FFFF00;"><sub>n</sub></span>');
});

test("renderToHtml handles superscript with links", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "ref", superscript: true, link: "https://example.com", bold: true }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<a href="https://example.com"');
  expect(result).toContain('target="_blank"');
  expect(result).toContain('style="font-weight: bold;"');
  expect(result).toContain('><sup>ref</sup></a>');
});

test("renderToHtml handles subscript with links", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "note", subscript: true, link: "https://example.com" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<a href="https://example.com"');
  expect(result).toContain('target="_blank"');
  expect(result).toContain('><sub>note</sub></a>');
});