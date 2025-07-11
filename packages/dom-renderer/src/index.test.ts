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
  expect(result).toContain('</div>');
  // Enhanced DOM renderer doesn't use page structure
  expect(result).not.toContain('data-page-number');
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
  expect(result).toContain('<h1 class="font-bold mb-4 text-4xl">');
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
    '<h1 class="font-bold mb-4 text-4xl"><span>H1</span></h1>',
  );
  expect(result).toContain(
    '<h2 class="font-bold mb-4 text-3xl"><span>H2</span></h2>',
  );
  expect(result).toContain(
    '<h3 class="font-bold mb-4 text-2xl"><span>H3</span></h3>',
  );
  expect(result).toContain(
    '<h4 class="font-bold mb-4 text-xl"><span>H4</span></h4>',
  );
  expect(result).toContain(
    '<h5 class="font-bold mb-4 text-lg"><span>H5</span></h5>',
  );
  expect(result).toContain(
    '<h6 class="font-bold mb-4"><span>H6</span></h6>',
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
  expect(result).toContain('<p class="mb-4">');
  expect(result).toContain("<span>This is a paragraph.</span></p>");
});
