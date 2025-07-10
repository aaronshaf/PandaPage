import { describe, test, expect, beforeAll } from "bun:test";
import { convertTableToMarkdown } from "../src/formats/docx/docx-to-markdown";
import type { DocxTable } from "../src/formats/docx/docx-reader-enhanced";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  const window = new Window();
  (global as any).DOMParser = window.DOMParser;
  (global as any).Document = window.Document;
  (global as any).Element = window.Element;
  (global as any).Node = window.Node;
});

describe("docx-to-markdown table conversion", () => {
  describe("convertTableToMarkdown", () => {
    test("should convert simple table", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              { content: [{ type: "paragraph", runs: [{ text: "A" }] }] },
              { content: [{ type: "paragraph", runs: [{ text: "B" }] }] }
            ]
          },
          {
            cells: [
              { content: [{ type: "paragraph", runs: [{ text: "1" }] }] },
              { content: [{ type: "paragraph", runs: [{ text: "2" }] }] }
            ]
          }
        ]
      };

      const result = convertTableToMarkdown(table);
      
      expect(result).toBe("| A | B |\n| --- | --- |\n| 1 | 2 |");
    });

    test("should handle empty table", () => {
      const table: DocxTable = {
        type: "table",
        rows: []
      };

      const result = convertTableToMarkdown(table);
      
      expect(result).toBe("");
    });

    test("should handle table with header row property", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              { content: [{ type: "paragraph", runs: [{ text: "Header" }] }] }
            ],
            properties: { isHeader: true }
          },
          {
            cells: [
              { content: [{ type: "paragraph", runs: [{ text: "Data" }] }] }
            ]
          }
        ]
      };

      const result = convertTableToMarkdown(table);
      
      expect(result).toContain("| Header |");
      expect(result).toContain("| --- |");
      expect(result).toContain("| Data |");
    });

    test("should handle cells with multiple paragraphs", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              { 
                content: [
                  { type: "paragraph", runs: [{ text: "Line 1" }] },
                  { type: "paragraph", runs: [{ text: "Line 2" }] }
                ]
              }
            ]
          }
        ]
      };

      const result = convertTableToMarkdown(table);
      
      expect(result).toContain("Line 1 Line 2");
    });

    test("should escape pipe characters in cell content", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              { content: [{ type: "paragraph", runs: [{ text: "A | B" }] }] }
            ]
          }
        ]
      };

      const result = convertTableToMarkdown(table);
      
      expect(result).toContain("A \\| B");
    });

    test("should handle cells with formatted text", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              { 
                content: [
                  { 
                    type: "paragraph", 
                    runs: [
                      { text: "Bold", bold: true },
                      { text: " and " },
                      { text: "italic", italic: true }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = convertTableToMarkdown(table);
      
      // Bold formatting is currently disabled in formatRun function
      // And it seems italic formatting is stripped in table cells
      expect(result).toContain("| Bold and italic |");
    });

    test("should handle cells with lists", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              { 
                content: [
                  { 
                    type: "paragraph", 
                    runs: [{ text: "Item 1" }],
                    numId: "1",
                    ilvl: 0
                  },
                  { 
                    type: "paragraph", 
                    runs: [{ text: "Item 2" }],
                    numId: "1", 
                    ilvl: 0
                  }
                ]
              }
            ]
          }
        ]
      };

      const numbering = {
        instances: new Map([["1", "0"]]),
        abstractFormats: new Map([
          ["0", { levels: new Map([[0, { numFmt: "bullet", lvlText: "•" }]]) }]
        ])
      };

      const result = convertTableToMarkdown(table, numbering);
      
      // Lists in table cells are rendered inline
      expect(result).toContain("Item 1 Item 2");
    });
  });
});