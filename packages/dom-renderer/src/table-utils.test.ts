import { describe, it, expect, beforeEach } from "bun:test";
import { JSDOM } from "jsdom";
import { renderEnhancedTable } from "./table-utils";
import type { Table, TableRow, TableCell, Paragraph } from "@browser-document-viewer/parser";

describe("Table Utils", () => {
  let dom: JSDOM;
  let document: Document;
  let mockRenderParagraph: (paragraph: any) => HTMLElement;

  beforeEach(() => {
    dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>");
    document = dom.window.document;

    mockRenderParagraph = (paragraph: any) => {
      const p = document.createElement("p");
      p.textContent = paragraph.text || "Test paragraph";
      return p;
    };
  });

  describe("renderEnhancedTable", () => {
    it("should render a simple table", () => {
      const table: Table = {
        type: "table",
        rows: [
          {
            cells: [
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Header 1" }] }] },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Header 2" }] }] },
            ],
          } as TableRow,
          {
            cells: [
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Cell 1" }] }] },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Cell 2" }] }] },
            ],
          } as TableRow,
        ],
      };

      const result = renderEnhancedTable(table, document, mockRenderParagraph);

      expect(result.tagName).toBe("TABLE");
      expect(result.className).toBe("table-fancy");
      expect(result.children.length).toBe(2); // Two rows

      // Check header row
      const headerRow = result.children[0] as HTMLTableRowElement;
      expect(headerRow.tagName).toBe("TR");
      expect(headerRow.children.length).toBe(2);
      expect(headerRow.children[0]?.tagName).toBe("TH");
      expect(headerRow.children[1]?.tagName).toBe("TH");

      // Check data row
      const dataRow = result.children[1] as HTMLTableRowElement;
      expect(dataRow.tagName).toBe("TR");
      expect(dataRow.children.length).toBe(2);
      expect(dataRow.children[0]?.tagName).toBe("TD");
      expect(dataRow.children[1]?.tagName).toBe("TD");
    });

    it("should handle empty table", () => {
      const table: Table = { type: "table", rows: [] };

      const result = renderEnhancedTable(table, document, mockRenderParagraph);

      expect(result.tagName).toBe("TABLE");
      expect(result.className).toBe("table-fancy");
      expect(result.children.length).toBe(0);
    });

    it("should handle table with empty rows", () => {
      const table: Table = {
        type: "table",
        rows: [{ cells: [] } as TableRow],
      };

      const result = renderEnhancedTable(table, document, mockRenderParagraph);

      expect(result.tagName).toBe("TABLE");
      expect(result.children.length).toBe(1);
      const row = result.children[0] as HTMLTableRowElement;
      expect(row.children.length).toBe(0);
    });

    it("should handle cells with rowspan", () => {
      const table: Table = {
        type: "table",
        rows: [
          {
            cells: [
              {
                paragraphs: [{ type: "paragraph", runs: [{ text: "Merged Cell" }] }],
                rowspan: 2,
              } as TableCell,
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Header 2" }] }] },
            ],
          } as TableRow,
          {
            cells: [
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Should be skipped" }] }] },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Cell 2" }] }] },
            ],
          } as TableRow,
        ],
      };

      const result = renderEnhancedTable(table, document, mockRenderParagraph);

      const firstRow = result.children[0] as HTMLTableRowElement;
      const firstCell = firstRow.children[0] as HTMLTableCellElement;

      expect(firstCell.rowSpan).toBe(2);
      expect(firstCell.classList.contains("cell-merged")).toBe(true);

      // Second row should only have one cell (the merged cell is skipped)
      const secondRow = result.children[1] as HTMLTableRowElement;
      expect(secondRow.children.length).toBe(1);
    });

    it("should handle cells with colspan", () => {
      const table: Table = {
        type: "table",
        rows: [
          {
            cells: [
              {
                paragraphs: [{ type: "paragraph", runs: [{ text: "Merged Cell" }] }],
                colspan: 2,
              } as TableCell,
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Should be skipped" }] }] },
            ],
          } as TableRow,
          {
            cells: [
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Cell 1" }] }] },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Cell 2" }] }] },
            ],
          } as TableRow,
        ],
      };

      const result = renderEnhancedTable(table, document, mockRenderParagraph);

      const firstRow = result.children[0] as HTMLTableRowElement;
      const firstCell = firstRow.children[0] as HTMLTableCellElement;

      expect(firstCell.colSpan).toBe(2);
      expect(firstCell.classList.contains("cell-merged")).toBe(true);

      // First row should only have one cell (the second cell is merged)
      expect(firstRow.children.length).toBe(1);
    });

    it("should handle cells with both rowspan and colspan", () => {
      const table: Table = {
        type: "table",
        rows: [
          {
            cells: [
              {
                paragraphs: [{ type: "paragraph", runs: [{ text: "Merged Cell" }] }],
                rowspan: 2,
                colspan: 2,
              } as TableCell,
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Cell A" }] }] },
            ],
          } as TableRow,
          {
            cells: [
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Skipped 1" }] }] },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Skipped 2" }] }] },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Cell C" }] }] },
            ],
          } as TableRow,
        ],
      };

      const result = renderEnhancedTable(table, document, mockRenderParagraph);

      const firstRow = result.children[0] as HTMLTableRowElement;
      const firstCell = firstRow.children[0] as HTMLTableCellElement;

      expect(firstCell.rowSpan).toBe(2);
      expect(firstCell.colSpan).toBe(2);
      expect(firstCell.classList.contains("cell-merged")).toBe(true);

      // The merged cell spans 2 columns, so the second cell (index 1) is skipped
      // First row should have 1 cell rendered (the merged cell, second cell is skipped)
      expect(firstRow.children.length).toBe(1);

      // Second row should have 1 cell (2 are skipped due to merge)
      const secondRow = result.children[1] as HTMLTableRowElement;
      expect(secondRow.children.length).toBe(1);
    });

    it("should apply vertical alignment to cells", () => {
      const table: Table = {
        type: "table",
        rows: [
          {
            cells: [
              {
                paragraphs: [{ type: "paragraph", runs: [{ text: "Top Aligned" }] }],
                verticalAlignment: "top",
              } as TableCell,
              {
                paragraphs: [{ type: "paragraph", runs: [{ text: "Middle Aligned" }] }],
                verticalAlignment: "center",
              } as TableCell,
            ],
          } as TableRow,
        ],
      };

      const result = renderEnhancedTable(table, document, mockRenderParagraph);

      const row = result.children[0] as HTMLTableRowElement;
      const cell1 = row.children[0] as HTMLTableCellElement;
      const cell2 = row.children[1] as HTMLTableCellElement;

      expect(cell1.style.verticalAlign).toBe("top");
      expect(cell2.style.verticalAlign).toBe("middle");
    });

    it("should handle cells without paragraphs", () => {
      const table: Table = {
        type: "table",
        rows: [
          {
            cells: [{ paragraphs: [] } as TableCell, { paragraphs: [] } as TableCell],
          } as TableRow,
        ],
      };

      const result = renderEnhancedTable(table, document, mockRenderParagraph);

      const row = result.children[0] as HTMLTableRowElement;
      expect(row.children.length).toBe(2);

      // Both cells should be empty
      const cell1 = row.children[0] as HTMLTableCellElement;
      const cell2 = row.children[1] as HTMLTableCellElement;
      expect(cell1.children.length).toBe(0);
      expect(cell2.children.length).toBe(0);
    });

    it("should handle cells with multiple paragraphs", () => {
      const table: Table = {
        type: "table",
        rows: [
          {
            cells: [
              {
                paragraphs: [
                  { type: "paragraph", runs: [{ text: "Paragraph 1" }] },
                  { type: "paragraph", runs: [{ text: "Paragraph 2" }] },
                  { type: "paragraph", runs: [{ text: "Paragraph 3" }] },
                ],
              } as TableCell,
            ],
          } as TableRow,
        ],
      };

      const result = renderEnhancedTable(table, document, mockRenderParagraph);

      const row = result.children[0] as HTMLTableRowElement;
      const cell = row.children[0] as HTMLTableCellElement;

      expect(cell.children.length).toBe(3);
      expect(cell.children[0]?.tagName).toBe("P");
      expect(cell.children[1]?.tagName).toBe("P");
      expect(cell.children[2]?.tagName).toBe("P");
    });

    it("should use TH for first row and TD for subsequent rows", () => {
      const table: Table = {
        type: "table",
        rows: [
          {
            cells: [{ paragraphs: [{ type: "paragraph", runs: [{ text: "Header" }] }] }],
          } as TableRow,
          {
            cells: [{ paragraphs: [{ type: "paragraph", runs: [{ text: "Data" }] }] }],
          } as TableRow,
        ],
      };

      const result = renderEnhancedTable(table, document, mockRenderParagraph);

      const headerRow = result.children[0] as HTMLTableRowElement;
      const dataRow = result.children[1] as HTMLTableRowElement;

      expect(headerRow.children[0]?.tagName).toBe("TH");
      expect(dataRow.children[0]?.tagName).toBe("TD");
    });
  });
});
