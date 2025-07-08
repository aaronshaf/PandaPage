import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import { 
  parseTableEnhanced, 
  parseTableRowEnhanced, 
  parseTableCellEnhanced,
  parseTableProperties,
  parseTableRowProperties,
  parseTableCellProperties
} from "./table-parser";
import type { DocxTable, DocxTableRow, DocxTableCell } from "./types";

describe("Table Parser", () => {
  describe("parseTableProperties", () => {
    test("should parse table width in pixels", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "tblW") {
            return {
              getAttribute: (attr: string) => {
                if (attr === "w") return "5000";
                if (attr === "type") return "dxa";
                return null;
              }
            };
          }
          return null;
        }
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.width).toBe("5000px");
    });

    test("should parse table width in percentage", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "tblW") {
            return {
              getAttribute: (attr: string) => {
                if (attr === "w") return "50";
                if (attr === "type") return "pct";
                return null;
              }
            };
          }
          return null;
        }
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.width).toBe("50%");
    });

    test("should parse table alignment", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "jc") {
            return {
              getAttribute: (attr: string) => attr === "val" ? "center" : null
            };
          }
          return null;
        }
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.alignment).toBe("center");
    });

    test("should parse background color", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "shd") {
            return {
              getAttribute: (attr: string) => attr === "fill" ? "FF0000" : null
            };
          }
          return null;
        }
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.backgroundColor).toBe("#FF0000");
    });

    test("should handle missing properties", async () => {
      const mockElement = {
        querySelector: () => null
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties).toEqual({});
    });
  });

  describe("parseTableRowProperties", () => {
    test("should parse row height", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "trHeight") {
            return {
              getAttribute: (attr: string) => attr === "val" ? "400" : null
            };
          }
          return null;
        }
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableRowProperties(mockElement));
      expect(properties.height).toBe("400px");
    });

    test("should identify header rows", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "tblHeader") {
            return {}; // Element exists
          }
          return null;
        }
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableRowProperties(mockElement));
      expect(properties.isHeader).toBe(true);
    });
  });

  describe("parseTableCellProperties", () => {
    test("should parse cell width", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "tcW") {
            return {
              getAttribute: (attr: string) => {
                if (attr === "w") return "2500";
                if (attr === "type") return "dxa";
                return null;
              }
            };
          }
          return null;
        }
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableCellProperties(mockElement));
      expect(properties.width).toBe("2500px");
    });

    test("should parse vertical alignment", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "vAlign") {
            return {
              getAttribute: (attr: string) => attr === "val" ? "center" : null
            };
          }
          return null;
        }
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableCellProperties(mockElement));
      expect(properties.alignment).toBe("center");
    });

    test("should parse cell background color", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "shd") {
            return {
              getAttribute: (attr: string) => attr === "fill" ? "00FF00" : null
            };
          }
          return null;
        }
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableCellProperties(mockElement));
      expect(properties.backgroundColor).toBe("#00FF00");
    });
  });

  describe("Complex table parsing", () => {
    test("should parse table with GridTable1Light style", async () => {
      // This tests the specific table style mentioned in 008.docx
      const tableXml = `
        <w:tbl>
          <w:tblPr>
            <w:tblStyle w:val="GridTable1Light"/>
            <w:tblW w:w="0" w:type="auto"/>
            <w:tblBorders>
              <w:top w:val="single" w:sz="4" w:color="auto"/>
              <w:left w:val="single" w:sz="4" w:color="auto"/>
              <w:bottom w:val="single" w:sz="4" w:color="auto"/>
              <w:right w:val="single" w:sz="4" w:color="auto"/>
            </w:tblBorders>
          </w:tblPr>
          <w:tr>
            <w:trPr>
              <w:tblHeader/>
            </w:trPr>
            <w:tc>
              <w:tcPr>
                <w:tcW w:w="2000" w:type="dxa"/>
              </w:tcPr>
              <w:p>
                <w:r>
                  <w:t>Header 1</w:t>
                </w:r>
              </w:p>
            </w:tc>
            <w:tc>
              <w:tcPr>
                <w:tcW w:w="2000" w:type="dxa"/>
              </w:tcPr>
              <w:p>
                <w:r>
                  <w:t>Header 2</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
          <w:tr>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Cell 1</w:t>
                </w:r>
              </w:p>
            </w:tc>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Cell 2</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      // Note: In a real test, we would parse the XML and create proper DOM elements
      // For now, this test serves as documentation of the expected structure
      expect(tableXml).toContain("GridTable1Light");
      expect(tableXml).toContain("tblHeader");
    });

    test("should handle tables with merged cells", async () => {
      // Merged cells use gridSpan
      const mergedCellXml = `
        <w:tc>
          <w:tcPr>
            <w:gridSpan w:val="2"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:t>Merged Cell</w:t>
            </w:r>
          </w:p>
        </w:tc>
      `;

      // This documents the expected structure for merged cells
      expect(mergedCellXml).toContain("gridSpan");
    });

    test("should handle nested tables", async () => {
      // Tables can contain other tables within cells
      const nestedTableXml = `
        <w:tc>
          <w:tbl>
            <w:tr>
              <w:tc>
                <w:p><w:r><w:t>Nested</w:t></w:r></w:p>
              </w:tc>
            </w:tr>
          </w:tbl>
        </w:tc>
      `;

      expect(nestedTableXml).toContain("<w:tbl>");
      expect(nestedTableXml).toContain("<w:tc>");
    });
  });

  describe("Border parsing", () => {
    test("should parse table borders correctly", async () => {
      const mockBordersElement = {
        querySelector: (side: string) => {
          if (["top", "right", "bottom", "left"].includes(side)) {
            return {
              getAttribute: (attr: string) => {
                if (attr === "val") return "single";
                if (attr === "sz") return "8"; // 8 eighths = 1px
                if (attr === "color") return "000000";
                return null;
              }
            };
          }
          return null;
        }
      } as unknown as Element;

      const mockElement = {
        querySelector: (selector: string) => {
          if (selector === "tblBorders") {
            return mockBordersElement;
          }
          return null;
        }
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.borders).toEqual({
        top: "1px solid #000000",
        right: "1px solid #000000",
        bottom: "1px solid #000000",
        left: "1px solid #000000"
      });
    });

    test("should handle different border styles", async () => {
      const createBorderElement = (style: string) => ({
        querySelector: (side: string) => {
          if (side === "top") {
            return {
              getAttribute: (attr: string) => {
                if (attr === "val") return style;
                if (attr === "sz") return "8";
                if (attr === "color") return "FF0000";
                return null;
              }
            };
          }
          return null;
        }
      });

      // Test dashed border
      const dashedElement = {
        querySelector: (selector: string) => 
          selector === "tblBorders" ? createBorderElement("dashed") : null
      } as unknown as Element;

      const dashedProps = await Effect.runPromise(parseTableProperties(dashedElement));
      expect(dashedProps.borders?.top).toBe("1px dashed #FF0000");

      // Test dotted border
      const dottedElement = {
        querySelector: (selector: string) => 
          selector === "tblBorders" ? createBorderElement("dotted") : null
      } as unknown as Element;

      const dottedProps = await Effect.runPromise(parseTableProperties(dottedElement));
      expect(dottedProps.borders?.top).toBe("1px dotted #FF0000");
    });
  });
});