import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@browser-document-viewer/parser";

test("renderToHtml applies character spacing", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "Normal text " },
          { text: "with spacing", characterSpacing: 40 },
          { text: " and ", characterSpacing: -20 },
          { text: "normal again" },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);
  
  // Check that letter-spacing is applied (40 twips = 2.67px at 96 DPI)
  expect(result).toContain('letter-spacing: 3px');
  
  // Check that negative spacing is applied (-20 twips = -1.33px at 96 DPI)
  expect(result).toContain('letter-spacing: -1px');
  
  // Verify text content
  expect(result).toContain("Normal text");
  expect(result).toContain("with spacing");
  expect(result).toContain("and");
  expect(result).toContain("normal again");
});

test("renderToHtml combines character spacing with other formatting", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          {
            text: "Bold spaced text",
            bold: true,
            italic: true,
            characterSpacing: 100, // 100 twips = 6.67px
            color: "FF0000",
            fontSize: 18,
          },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);
  
  // Check all styles are applied
  expect(result).toContain("font-weight: bold");
  expect(result).toContain("font-style: italic");
  expect(result).toContain("letter-spacing: 7px");
  expect(result).toContain("color: #FF0000");
  expect(result).toContain("font-size: 18pt");
});