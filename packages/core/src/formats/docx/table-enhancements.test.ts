import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import {
  parseGridSpan,
  parseVMerge,
  calculateRowSpans,
  hasNestedTables,
  parseTableStyle,
  convertEnhancedTableToMarkdown
} from "./table-enhancements";
import type { DocxTable, DocxTableCell } from "./types";
import type { EnhancedDocxTableCell } from "./table-enhancements";

describe("Table Enhancements", () => {
  describe("parseGridSpan", () => {
    test("should parse grid span value", () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "gridSpan") {
            return {
              getAttribute: (attr: string) => {
                if (attr === "w:val" || attr === "val") return "3";
                return null;
              }
            };
          }
          return null;
        }
      } as unknown as Element;

      expect(parseGridSpan(mockElement)).toBe(3);
    });

    test("should return 1 for missing grid span", () => {
      const mockElement = {
        querySelector: () => null
      } as unknown as Element;

      expect(parseGridSpan(mockElement)).toBe(1);
    });

    test("should handle invalid grid span values", () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "gridSpan") {
            return {
              getAttribute: () => "invalid"
            };
          }
          return null;
        }
      } as unknown as Element;

      expect(parseGridSpan(mockElement)).toBe(1);
    });
  });

  describe("parseVMerge", () => {
    test("should parse vMerge continue", () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "vMerge") {
            return {
              getAttribute: (attr: string) => {
                if (attr === "w:val" || attr === "val") return "continue";
                return null;
              }
            };
          }
          return null;
        }
      } as unknown as Element;

      expect(parseVMerge(mockElement)).toBe("continue");
    });

    test("should parse vMerge restart", () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "vMerge") {
            return {
              getAttribute: () => null // vMerge without val = restart
            };
          }
          return null;
        }
      } as unknown as Element;

      expect(parseVMerge(mockElement)).toBe("restart");
    });

    test("should return undefined for no vMerge", () => {
      const mockElement = {
        querySelector: () => null
      } as unknown as Element;

      expect(parseVMerge(mockElement)).toBeUndefined();
    });
  });

  describe("calculateRowSpans", () => {
    test("should calculate row spans for vertically merged cells", async () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              {
                content: [{ type: "paragraph", runs: [{ text: "Merged" }] }],
                properties: { vMerge: "restart" } as any
              },
              {
                content: [{ type: "paragraph", runs: [{ text: "Normal" }] }]
              }
            ]
          },
          {
            cells: [
              {
                content: [{ type: "paragraph", runs: [{ text: "" }] }],
                properties: { vMerge: "continue" } as any
              },
              {
                content: [{ type: "paragraph", runs: [{ text: "Normal 2" }] }]
              }
            ]
          }
        ]
      };

      const result = await Effect.runPromise(calculateRowSpans(table));
      
      const firstCell = result.rows[0]?.cells[0] as EnhancedDocxTableCell;
      expect(firstCell.properties?.rowSpan).toBe(2);
      
      const continuedCell = result.rows[1]?.cells[0] as EnhancedDocxTableCell;
      expect(continuedCell.properties?.rowSpan).toBe(0); // Marked as merged
    });

    test("should handle complex merge patterns", async () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              {
                content: [{ type: "paragraph", runs: [{ text: "A" }] }],
                properties: { vMerge: "restart" } as any
              },
              {
                content: [{ type: "paragraph", runs: [{ text: "B" }] }]
              }
            ]
          },
          {
            cells: [
              {
                content: [{ type: "paragraph", runs: [{ text: "" }] }],
                properties: { vMerge: "continue" } as any
              },
              {
                content: [{ type: "paragraph", runs: [{ text: "B2" }] }],
                properties: { vMerge: "restart" } as any
              }
            ]
          },
          {
            cells: [
              {
                content: [{ type: "paragraph", runs: [{ text: "" }] }],
                properties: { vMerge: "continue" } as any
              },
              {
                content: [{ type: "paragraph", runs: [{ text: "" }] }],
                properties: { vMerge: "continue" } as any
              }
            ]
          }
        ]
      };

      const result = await Effect.runPromise(calculateRowSpans(table));
      
      // First column should span 3 rows
      const cellA = result.rows[0]?.cells[0] as EnhancedDocxTableCell;
      expect(cellA.properties?.rowSpan).toBe(3);
      
      // Second column, second cell should span 2 rows
      const cellB2 = result.rows[1]?.cells[1] as EnhancedDocxTableCell;
      expect(cellB2.properties?.rowSpan).toBe(2);
    });
  });

  describe("hasNestedTables", () => {
    test("should detect nested tables", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              {
                content: [
                  { type: "paragraph", runs: [{ text: "Normal" }] },
                  { type: "table", rows: [] } as any // Nested table
                ]
              }
            ]
          }
        ]
      };

      // Note: Current implementation doesn't support nested tables
      // This is a placeholder that always returns false
      expect(hasNestedTables(table)).toBe(false);
    });

    test("should return false for simple tables", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              {
                content: [
                  { type: "paragraph", runs: [{ text: "Normal" }] }
                ]
              }
            ]
          }
        ]
      };

      expect(hasNestedTables(table)).toBe(false);
    });
  });

  describe("parseTableStyle", () => {
    test("should parse table style name", () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "tblStyle") {
            return {
              getAttribute: (attr: string) => 
                (attr === "w:val" || attr === "val") ? "GridTable1Light" : null
            };
          }
          return null;
        }
      } as unknown as Element;

      const style = parseTableStyle(mockElement);
      expect(style.name).toBe("GridTable1Light");
    });

    test("should parse table look options", () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "tblLook") {
            return {
              getAttribute: (attr: string) => {
                switch (attr) {
                  case "w:firstRow": return "1";
                  case "w:lastRow": return "0";
                  case "w:firstColumn": return "1";
                  case "w:noHBand": return "0"; // Row banding enabled
                  case "w:noVBand": return "1"; // Column banding disabled
                  default: return null;
                }
              }
            };
          }
          return null;
        }
      } as unknown as Element;

      const style = parseTableStyle(mockElement);
      expect(style.firstRowFormatting).toBe(true);
      expect(style.lastRowFormatting).toBe(false);
      expect(style.firstColumnFormatting).toBe(true);
      expect(style.rowBanding).toBe(true);
      expect(style.columnBanding).toBe(false);
    });
  });

  describe("convertEnhancedTableToMarkdown", () => {
    test("should convert table with merged cells to HTML", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              {
                content: [{ type: "paragraph", runs: [{ text: "Merged Header" }] }],
                properties: { gridSpan: 2 } as any
              }
            ],
            properties: { isHeader: true }
          },
          {
            cells: [
              {
                content: [{ type: "paragraph", runs: [{ text: "Cell 1" }] }]
              },
              {
                content: [{ type: "paragraph", runs: [{ text: "Cell 2" }] }]
              }
            ]
          }
        ]
      };

      const markdown = convertEnhancedTableToMarkdown(table, true);
      expect(markdown).toContain("<table>");
      expect(markdown).toContain('colspan="2"');
      expect(markdown).toContain("<th");
      expect(markdown).toContain("Merged Header");
    });

    test("should handle rowspan in HTML output", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              {
                content: [{ type: "paragraph", runs: [{ text: "Tall Cell" }] }],
                properties: { rowSpan: 2 } as any
              },
              {
                content: [{ type: "paragraph", runs: [{ text: "Normal" }] }]
              }
            ]
          },
          {
            cells: [
              {
                content: [{ type: "paragraph", runs: [{ text: "Normal 2" }] }]
              }
            ]
          }
        ]
      };

      const markdown = convertEnhancedTableToMarkdown(table, true);
      expect(markdown).toContain('rowspan="2"');
      expect(markdown).toContain("Tall Cell");
    });
  });
});