import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@browser-document-viewer/parser";

test("renderToHtml handles tables", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "table",
        rows: [
          {
            cells: [
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Header 1" }] }] },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Header 2" }] }] },
            ],
          },
          {
            cells: [
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Cell 1" }] }] },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Cell 2" }] }] },
            ],
          },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).toContain('<table style="border-collapse: collapse; margin-bottom: 12pt;">');
  expect(result).toContain("<tr>");
  expect(result).toContain(
    '<th style="border: 1px solid #ccc; padding: 4pt; font-weight: 600; background-color: #f3f4f6;"><p><span>Header 1</span></p></th>',
  );
  expect(result).toContain(
    '<th style="border: 1px solid #ccc; padding: 4pt; font-weight: 600; background-color: #f3f4f6;"><p><span>Header 2</span></p></th>',
  );
  expect(result).toContain(
    '<td style="border: 1px solid #ccc; padding: 4pt;"><p><span>Cell 1</span></p></td>',
  );
  expect(result).toContain(
    '<td style="border: 1px solid #ccc; padding: 4pt;"><p><span>Cell 2</span></p></td>',
  );
  expect(result).toContain("</tr>");
  expect(result).toContain("</table>");
});

test("renderToHtml handles empty table cells", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "table",
        rows: [
          {
            cells: [
              { paragraphs: [] },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Content" }] }] },
            ],
          },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).toContain(
    '<th style="border: 1px solid #ccc; padding: 4pt; font-weight: 600; background-color: #f3f4f6;">&nbsp;</th>',
  );
  expect(result).toContain(
    '<th style="border: 1px solid #ccc; padding: 4pt; font-weight: 600; background-color: #f3f4f6;"><p><span>Content</span></p></th>',
  );
});

test("renderToHtml handles table cell spans", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "table",
        rows: [
          {
            cells: [
              {
                paragraphs: [{ type: "paragraph", runs: [{ text: "Span cell" }] }],
                colspan: 2,
                rowspan: 2,
              },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Normal" }] }] },
            ],
          },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).toContain('colspan="2"');
  expect(result).toContain('rowspan="2"');
});

test("renderToHtml handles multiple paragraphs in table cells", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "table",
        rows: [
          {
            cells: [
              {
                paragraphs: [
                  { type: "paragraph", runs: [{ text: "Line 1" }] },
                  { type: "paragraph", runs: [{ text: "Line 2" }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).toContain(
    '<th style="border: 1px solid #ccc; padding: 4pt; font-weight: 600; background-color: #f3f4f6;"><p><span>Line 1</span></p><p><span>Line 2</span></p></th>',
  );
});
