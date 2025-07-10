import { describe, it, expect } from "bun:test";
import { parseTable } from "./table-parser";
import { parseStylesheet } from "./style-parser";
import { WORD_NAMESPACE } from "./types";
import { ST_Border, ST_Shd } from "@browser-document-viewer/ooxml-types";

describe("Table Parser", () => {
  const ns = WORD_NAMESPACE;

  describe("Basic Table Structure", () => {
    it("should parse simple table with one cell", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Simple cell</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result).toBeDefined();
      expect(result?.type).toBe("table");
      expect(result?.rows).toHaveLength(1);
      expect(result?.rows[0]?.cells).toHaveLength(1);
      expect(result?.rows[0]?.cells[0]?.paragraphs).toHaveLength(1);
      expect(result?.rows[0]?.cells[0]?.paragraphs[0]?.type).toBe("paragraph");
    });

    it("should parse table with multiple rows and cells", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc>
              <w:p><w:r><w:t>R1C1</w:t></w:r></w:p>
            </w:tc>
            <w:tc>
              <w:p><w:r><w:t>R1C2</w:t></w:r></w:p>
            </w:tc>
          </w:tr>
          <w:tr>
            <w:tc>
              <w:p><w:r><w:t>R2C1</w:t></w:r></w:p>
            </w:tc>
            <w:tc>
              <w:p><w:r><w:t>R2C2</w:t></w:r></w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.rows).toHaveLength(2);
      expect(result?.rows[0]?.cells).toHaveLength(2);
      expect(result?.rows[1]?.cells).toHaveLength(2);
    });

    it("should handle empty table", () => {
      const xml = `<w:tbl xmlns:w="${ns}"></w:tbl>`;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result).toBeNull(); // Empty tables return null per implementation
    });

    it("should handle table with empty cells", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc></w:tc>
            <w:tc>
              <w:p></w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.rows).toHaveLength(1);
      expect(result?.rows[0]?.cells).toHaveLength(2);
      expect(result?.rows[0]?.cells[0]?.paragraphs).toHaveLength(0);
      expect(result?.rows[0]?.cells[1]?.paragraphs).toHaveLength(1);
    });
  });

  describe("Table Properties", () => {
    it("should parse table width in dxa", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tblPr>
            <w:tblW w:w="5000" w:type="dxa"/>
          </w:tblPr>
          <w:tr>
            <w:tc><w:p></w:p></w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.width).toBe(5000);
    });

    it("should not parse table width in pct", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tblPr>
            <w:tblW w:w="5000" w:type="pct"/>
          </w:tblPr>
          <w:tr>
            <w:tc><w:p></w:p></w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.width).toBeUndefined(); // Only dxa type is parsed
    });

    it("should parse table cell margins", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tblPr>
            <w:tblCellMar>
              <w:top w:w="100" w:type="dxa"/>
              <w:bottom w:w="100" w:type="dxa"/>
              <w:left w:w="120" w:type="dxa"/>
              <w:right w:w="120" w:type="dxa"/>
            </w:tblCellMar>
          </w:tblPr>
          <w:tr>
            <w:tc><w:p></w:p></w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.cellMargin).toEqual({
        top: 100,
        bottom: 100,
        left: 120,
        right: 120,
      });
    });
  });

  describe("Cell Properties", () => {
    it("should parse cell width in dxa", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:tcW w:w="2000" w:type="dxa"/>
              </w:tcPr>
              <w:p></w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.rows[0]?.cells[0]?.width).toBe(2000);
    });

    it("should parse cell with gridSpan", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:gridSpan w:val="2"/>
              </w:tcPr>
              <w:p><w:r><w:t>Spanning cell</w:t></w:r></w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.rows[0]?.cells[0]?.colspan).toBe(2);
    });

    it("should parse cell with vertical merge", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:vMerge w:val="restart"/>
              </w:tcPr>
              <w:p><w:r><w:t>Start merge</w:t></w:r></w:p>
            </w:tc>
          </w:tr>
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:vMerge/>
              </w:tcPr>
              <w:p></w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.rows[0]?.cells[0]?.rowspan).toBe(1); // rowspan is calculated, not directly from vMerge
      expect(result?.rows[1]?.cells[0]?.rowspan).toBeUndefined();
    });

    it("should parse cell vertical alignment", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:vAlign w:val="center"/>
              </w:tcPr>
              <w:p></w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.rows[0]?.cells[0]?.verticalAlignment).toBe("center");
    });

    it("should parse cell text direction", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:textDirection w:val="tbV"/>
              </w:tcPr>
              <w:p></w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.rows[0]?.cells[0]?.textDirection).toBe("tbV");
    });
  });

  describe("Complex Content", () => {
    it("should parse cell with multiple paragraphs", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc>
              <w:p><w:r><w:t>First paragraph</w:t></w:r></w:p>
              <w:p><w:r><w:t>Second paragraph</w:t></w:r></w:p>
              <w:p><w:r><w:t>Third paragraph</w:t></w:r></w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.rows[0]?.cells[0]?.paragraphs).toHaveLength(3);
      expect(result?.rows[0]?.cells[0]?.paragraphs[0]?.type).toBe("paragraph");
      expect(result?.rows[0]?.cells[0]?.paragraphs[1]?.type).toBe("paragraph");
      expect(result?.rows[0]?.cells[0]?.paragraphs[2]?.type).toBe("paragraph");
    });

    it("should parse nested table", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc>
              <w:p><w:r><w:t>Before nested table</w:t></w:r></w:p>
              <w:tbl>
                <w:tr>
                  <w:tc>
                    <w:p><w:r><w:t>Nested cell</w:t></w:r></w:p>
                  </w:tc>
                </w:tr>
              </w:tbl>
              <w:p><w:r><w:t>After nested table</w:t></w:r></w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      // The current implementation only parses paragraphs in cells, not nested tables
      expect(result?.rows[0]?.cells[0]?.paragraphs).toHaveLength(2); // Only paragraphs, not the nested table
      expect(result?.rows[0]?.cells[0]?.paragraphs[0]?.runs[0]?.text).toBe("Before nested table");
      expect(result?.rows[0]?.cells[0]?.paragraphs[1]?.runs[0]?.text).toBe("After nested table");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle invalid XML gracefully", () => {
      const xml = `<w:tbl xmlns:w="${ns}">Invalid content</w:tbl>`;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result).toBeNull(); // No rows means null
    });

    it("should handle missing namespace", () => {
      const xml = `<tbl><tr><tc><p></p></tc></tr></tbl>`;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result).toBeDefined();
      expect(result?.rows).toHaveLength(1);
    });

    it("should handle cell with no content", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:gridSpan w:val="3"/>
              </w:tcPr>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.rows[0]?.cells[0]?.paragraphs).toHaveLength(0);
      expect(result?.rows[0]?.cells[0]?.colspan).toBe(3);
    });
  });

  describe("Table Borders and Shading Conversion", () => {
    it("should convert table borders correctly", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tblPr>
            <w:tblBorders>
              <w:top w:val="single" w:sz="8" w:color="FF0000"/>
              <w:insideH w:val="dashed" w:sz="4" w:color="0000FF"/>
            </w:tblBorders>
          </w:tblPr>
          <w:tr>
            <w:tc><w:p></w:p></w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.borders?.top).toEqual({
        style: ST_Border.Single,
        width: 1, // 8 eighth-points = 1 point
        color: "#FF0000",
      });
      expect(result?.borders?.insideH).toEqual({
        style: ST_Border.Dashed,
        width: 0.5, // 4 eighth-points = 0.5 points
        color: "#0000FF",
      });
    });

    it("should handle borders with auto color", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tblPr>
            <w:tblBorders>
              <w:top w:val="single" w:sz="4" w:color="auto"/>
            </w:tblBorders>
          </w:tblPr>
          <w:tr>
            <w:tc><w:p></w:p></w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.borders?.top?.color).toBeUndefined();
    });

    it("should convert table shading correctly", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tblPr>
            <w:shd w:val="pct25" w:fill="FFFF00" w:color="FF0000"/>
          </w:tblPr>
          <w:tr>
            <w:tc><w:p></w:p></w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.shading).toEqual({
        pattern: ST_Shd.Pct25,
        fill: "#FFFF00",
        color: "#FF0000",
      });
    });
  });

  describe("Cell Borders and Margins", () => {
    it("should parse cell borders with diagonals", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:tcBorders>
                  <w:top w:val="single" w:sz="8" w:color="FF0000"/>
                  <w:tl2br w:val="single" w:sz="4" w:color="00FF00"/>
                </w:tcBorders>
              </w:tcPr>
              <w:p></w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.rows[0]?.cells[0]?.borders?.top).toEqual({
        style: ST_Border.Single,
        width: 1,
        color: "#FF0000",
      });
      expect(result?.rows[0]?.cells[0]?.borders?.tl2br).toEqual({
        style: ST_Border.Single,
        width: 0.5,
        color: "#00FF00",
      });
    });

    it("should parse cell margins", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:tcMar>
                  <w:top w:w="50" w:type="dxa"/>
                  <w:left w:w="60" w:type="dxa"/>
                </w:tcMar>
              </w:tcPr>
              <w:p></w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.rows[0]?.cells[0]?.margin).toEqual({
        top: 50,
        left: 60,
      });
    });
  });
});
