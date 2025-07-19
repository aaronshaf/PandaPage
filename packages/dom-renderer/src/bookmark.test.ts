import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@browser-document-viewer/parser";

test("renderToHtml handles bookmarks as invisible anchors", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "bookmark",
        id: "bm1",
        name: "Chapter1",
        text: "Introduction",
      },
    ],
  };

  const result = renderToHtml(doc);
  // Enhanced renderer doesn't use page structure
  expect(result).not.toContain("data-page-number");
  // Enhanced renderer creates <a> elements for bookmarks
  expect(result).toContain('<a id="Chapter1">Introduction</a>');
});

test("renderToHtml handles bookmarks with special characters", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "bookmark",
        id: "bm2",
        name: "Section_2.1",
        text: "Analysis & Results",
      },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).not.toContain("data-page-number");
  expect(result).toContain('<a id="Section_2.1">Analysis &amp; Results</a>');
});

test("renderToHtml handles bookmarks without text content", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "bookmark",
        id: "bm3",
        name: "EmptyBookmark",
      },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).not.toContain("data-page-number");
  // Bookmarks without text render as empty anchors
  expect(result).toContain('<a id="EmptyBookmark"></a>');
});

test("renderToHtml renders bookmarks with content for deep linking", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "bookmark",
        id: "intro-start",
        name: "introduction",
        text: "Introduction Section",
      },
      { type: "heading", level: 1, runs: [{ text: "Introduction" }] },
      { type: "paragraph", runs: [{ text: "This is the introduction." }] },
      {
        type: "bookmark",
        id: "conclusion-start",
        name: "conclusion",
      },
      { type: "heading", level: 1, runs: [{ text: "Conclusion" }] },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).toContain('<a id="introduction">Introduction Section</a>');
  expect(result).toContain('<a id="conclusion"></a>');
  // Enhanced renderer uses inline styles for headings (order may vary)
  expect(result).toContain(
    '<h1 style="font-size: 32px; font-weight: bold; margin-bottom: 16px;"><span>Introduction</span></h1>',
  );
  expect(result).toContain(
    '<h1 style="font-size: 32px; font-weight: bold; margin-bottom: 16px;"><span>Conclusion</span></h1>',
  );
});
