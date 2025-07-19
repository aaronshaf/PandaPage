import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@browser-document-viewer/parser";

test("renderToHtml applies complex script fonts", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          {
            text: "Mixed text 漢字",
            fontFamilyAscii: "Arial",
            fontFamilyEastAsia: "MS Mincho",
            fontFamilyHAnsi: "Arial",
            fontFamilyCs: "Arial Unicode MS",
            fontFamily: "MS Mincho",
          },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);

  // Check that font family stack is applied with all variants
  expect(result).toContain(
    "font-family: &quot;MS Mincho&quot;, Arial, Arial, &quot;Arial Unicode MS&quot;, sans-serif",
  );
  expect(result).toContain("Mixed text 漢字");
});

test("renderToHtml handles eastAsia font priority", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          {
            text: "東京",
            fontFamilyEastAsia: "Times New Roman",
            fontFamily: "Times New Roman",
          },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);

  // Should use the eastAsia font as primary
  expect(result).toContain("font-family: &quot;Times New Roman&quot;, sans-serif");
  expect(result).toContain("東京");
});

test("renderToHtml handles ASCII font fallback", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          {
            text: "English text",
            fontFamilyAscii: "Calibri",
            fontFamilyHAnsi: "Calibri",
            fontFamily: "Calibri",
          },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);

  // Should use ASCII font as primary with hAnsi as fallback
  expect(result).toContain("font-family: Calibri, sans-serif");
  expect(result).toContain("English text");
});

test("renderToHtml handles complex script font only", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          {
            text: "العربية",
            fontFamilyCs: "Noto Sans Arabic",
            fontFamily: "Noto Sans Arabic",
          },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);

  // Should use complex script font
  expect(result).toContain("font-family: &quot;Noto Sans Arabic&quot;, sans-serif");
  expect(result).toContain("العربية");
});

test("renderToHtml deduplicates identical fonts in stack", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          {
            text: "Test text",
            fontFamilyAscii: "Arial",
            fontFamilyHAnsi: "Arial", // Same as ASCII
            fontFamily: "Arial",
          },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);

  // Should not duplicate Arial in the font stack
  expect(result).toContain("font-family: Arial, sans-serif");
  expect(result).not.toContain("Arial, Arial");
});
