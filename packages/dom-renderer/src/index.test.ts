import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@browser-document-viewer/parser";

test("renderToHtml handles empty document", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [],
  };

  const result = renderToHtml(doc);
  expect(result).toContain('<div class="document-container">');
  expect(result).toContain("</div>");
  // Enhanced DOM renderer doesn't use page structure
  expect(result).not.toContain("data-page-number");
});

test("renderToHtml renders headings", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "heading",
        level: 1,
        runs: [{ text: "Hello World" }],
      },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).toContain('<h1 style="font-size: 32px; font-weight: bold; margin-bottom: 16px;">');
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
      { type: "heading", level: 6, runs: [{ text: "H6" }] },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).toContain(
    '<h1 style="font-size: 32px; font-weight: bold; margin-bottom: 16px;"><span>H1</span></h1>',
  );
  expect(result).toContain(
    '<h2 style="font-size: 28px; font-weight: bold; margin-bottom: 14px;"><span>H2</span></h2>',
  );
  expect(result).toContain(
    '<h3 style="font-size: 24px; font-weight: bold; margin-bottom: 12px;"><span>H3</span></h3>',
  );
  expect(result).toContain(
    '<h4 style="font-size: 20px; font-weight: bold; margin-bottom: 10px;"><span>H4</span></h4>',
  );
  expect(result).toContain(
    '<h5 style="font-size: 18px; font-weight: bold; margin-bottom: 9px;"><span>H5</span></h5>',
  );
  expect(result).toContain(
    '<h6 style="font-size: 16px; font-weight: bold; margin-bottom: 8px;"><span>H6</span></h6>',
  );
});

test("renderToHtml renders paragraphs", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "This is a paragraph." }],
      },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).toContain('<p style="margin-bottom: 12px;">');
  expect(result).toContain("<span>This is a paragraph.</span></p>");
});
