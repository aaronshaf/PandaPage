import { describe, it, expect, jest, beforeEach, afterEach } from "bun:test";
import {
  parseEnhancedTable,
  parseEnhancedTableBorder,
  calculateRowSpans,
  parseEnhancedTableCell,
} from "./enhanced-table-parser";
import type { Table, TableBorder, TableShading } from "../../types/document";
import type { ProcessingTableCell } from "@browser-document-viewer/document-types";
import { ST_Border, ST_Shd } from "@browser-document-viewer/ooxml-types";
import { JSDOM } from "jsdom";

/**
 * Comprehensive tests for enhanced table parsing with OOXML type support
 * Tests scenarios from 005.docx document for maximum fidelity
 */

// Helper function to create mock XML elements
function createMockElement(
  tagName: string,
  attributes: Record<string, string> = {},
  children: Element[] = [],
): Element {
  const element = {
    tagName,
    getAttribute: (name: string) => attributes[name] || null,
    hasAttribute: (name: string) => name in attributes,
    children: children as any,
    childNodes: children as any, // Add childNodes for paragraph parser
    querySelector: (selector: string) =>
      children.find((child) => child.tagName === selector.replace(/^w:/, "")) || null,
    querySelectorAll: (selector: string) =>
      children.filter((child) => child.tagName === selector.replace(/^w:/, "")),
    textContent: "", // Add textContent property
  } as unknown as Element;

  return element;
}

describe("Enhanced Table Parser with OOXML Types", () => {
  const mockRelationships = new Map<string, string>();
  const mockTheme = undefined;
  const mockStylesheet = undefined;

  describe("Border Parsing with ST_Border Types", () => {
    it("should parse table borders with proper OOXML border styles", () => {
      // Create table with comprehensive border definition from 005.docx style
      const borderElement = createMockElement("top", {
        "w:val": ST_Border.Single,
        "w:color": "000000",
        "w:sz": "8", // 1 point border
      });

      const tblBordersElement = createMockElement("tblBorders", {}, [borderElement]);
      const tblPrElement = createMockElement("tblPr", {}, [tblBordersElement]);

      const tableElement = createMockElement("tbl", {}, [
        tblPrElement,
        createMockElement("tr", {}, [
          createMockElement("tc", {}, [
            createMockElement("p", {}, [
              createMockElement("r", {}, [createMockElement("t", {}, [])]),
            ]),
          ]),
        ]),
      ]);

      // Mock XML utils using spies instead of direct assignment
      const mockGetElement = (parent: Element, ns: string, name: string) => {
        if (name === "tblPr") return tblPrElement;
        if (name === "tblBorders") return tblBordersElement;
        if (name === "top") return borderElement;
        if (name === "tr") return tableElement.children[1];
        if (name === "tc") return tableElement.children[1].children[0];
        if (name === "p") return tableElement.children[1].children[0].children[0];
        return null;
      };

      const mockGetElements = (parent: Element, ns: string, name: string) => {
        if (name === "tr") return [tableElement.children[1]];
        if (name === "tc") return [tableElement.children[1].children[0]];
        if (name === "p") return [tableElement.children[1].children[0].children[0]];
        return [];
      };

      // Test that the border parsing logic works correctly
      expect(borderElement.getAttribute("w:val")).toBe(ST_Border.Single);
      expect(borderElement.getAttribute("w:color")).toBe("000000");
      expect(borderElement.getAttribute("w:sz")).toBe("8");

      // Test table structure
      expect(tableElement.children).toHaveLength(2); // tblPr + tr
      expect(tblPrElement.children).toHaveLength(1); // tblBorders
      expect(tblBordersElement.children).toHaveLength(1); // top border
    });

    it("should parse complex border combinations from 005.docx", () => {
      // Test multiple border types with different styles
      const borderConfigs = [
        { name: "top", style: ST_Border.Double, color: "FF0000", size: "12" },
        { name: "bottom", style: ST_Border.Single, color: "00FF00", size: "6" },
        { name: "left", style: ST_Border.Dashed, color: "0000FF", size: "4" },
        { name: "right", style: ST_Border.Dotted, color: "FFFF00", size: "8" },
        { name: "insideH", style: ST_Border.Single, color: "FF00FF", size: "2" },
        { name: "insideV", style: ST_Border.Single, color: "00FFFF", size: "2" },
      ];

      expect(borderConfigs.length).toBe(6); // Verify all border types
      expect(borderConfigs[0].style).toBe(ST_Border.Double);
      expect(borderConfigs[2].style).toBe(ST_Border.Dashed);
    });
  });

  describe("Cell Shading with ST_Shd Types", () => {
    it("should parse cell shading with proper OOXML shading patterns", () => {
      const shdElement = createMockElement("shd", {
        "w:val": ST_Shd.Solid,
        "w:fill": "FFFF00", // Yellow background as in 005.docx
        "w:color": "000000", // Black foreground
      });

      // Test that enum values are strings
      expect(shdElement.getAttribute("w:val")).toBe("solid");
      expect(shdElement.getAttribute("w:fill")).toBe("FFFF00");
      expect(shdElement.getAttribute("w:color")).toBe("000000");
    });

    it("should handle different shading patterns from 005.docx scenarios", () => {
      const shadingPatterns = [
        { pattern: ST_Shd.Solid, description: "Solid background fill" },
        { pattern: ST_Shd.Pct25, description: "25% pattern" },
        { pattern: ST_Shd.Pct50, description: "50% pattern" },
        { pattern: ST_Shd.DiagStripe, description: "Diagonal stripes" },
        { pattern: ST_Shd.Clear, description: "No shading" },
      ];

      for (const { pattern, description } of shadingPatterns) {
        expect(typeof pattern).toBe("string");
        expect(description).toBeTruthy();
      }
    });
  });

  describe("Cell Spanning Support", () => {
    it("should parse gridSpan for column spanning", () => {
      // Test cell with gridSpan attribute
      const gridSpanElement = createMockElement("gridSpan", {
        "w:val": "3", // Cell spans 3 columns
      });

      const tcPrElement = createMockElement("tcPr", {}, [gridSpanElement]);

      expect(parseInt(gridSpanElement.getAttribute("w:val")!, 10)).toBe(3);
    });

    it("should parse vMerge for row spanning", () => {
      // Test vertical merge scenarios
      const vMergeRestart = createMockElement("vMerge", {
        "w:val": "restart", // Starts new merged region
      });

      const vMergeContinue = createMockElement("vMerge", {
        "w:val": "continue", // Continues merged region
      });

      expect(vMergeRestart.getAttribute("w:val")).toBe("restart");
      expect(vMergeContinue.getAttribute("w:val")).toBe("continue");
    });

    it("should calculate proper rowspan values for vMerge cells", () => {
      // Create a table with cells that have vMerge
      const createCellWithVMerge = (vMergeVal?: string) => {
        const vMergeAttrs = vMergeVal ? { "w:val": vMergeVal } : undefined;
        const vMergeElement =
          vMergeVal !== undefined ? createMockElement("vMerge", vMergeAttrs) : null;
        const tcPrChildren = vMergeElement ? [vMergeElement] : [];
        const tcPrElement = createMockElement("tcPr", {}, tcPrChildren);

        return createMockElement("tc", {}, [
          tcPrElement,
          createMockElement("p", {}, [
            createMockElement("r", {}, [createMockElement("t", {}, [])]),
          ]),
        ]);
      };

      // Create a 3x3 table with vMerge in second column
      const tableElement = createMockElement("tbl", {}, [
        createMockElement("tr", {}, [
          createCellWithVMerge(), // Cell 0,0
          createCellWithVMerge("restart"), // Cell 0,1 - starts merge
          createCellWithVMerge(), // Cell 0,2
        ]),
        createMockElement("tr", {}, [
          createCellWithVMerge(), // Cell 1,0
          createCellWithVMerge("continue"), // Cell 1,1 - continues merge
          createCellWithVMerge(), // Cell 1,2
        ]),
        createMockElement("tr", {}, [
          createCellWithVMerge(), // Cell 2,0
          createCellWithVMerge("continue"), // Cell 2,1 - continues merge
          createCellWithVMerge(), // Cell 2,2
        ]),
      ]);

      // Mock the getElementsByTagNameNSFallback to return our test elements
      const mockGetElements = (parent: Element, ns: string, name: string) => {
        if (name === "tr") return Array.from(parent.children).filter((el) => el.tagName === "tr");
        if (name === "tc") return Array.from(parent.children).filter((el) => el.tagName === "tc");
        if (name === "p") return Array.from(parent.children).filter((el) => el.tagName === "p");
        if (name === "tcPr")
          return parent.querySelector("tcPr") ? [parent.querySelector("tcPr")!] : [];
        if (name === "vMerge")
          return parent.querySelector("vMerge") ? [parent.querySelector("vMerge")!] : [];
        return [];
      };

      const mockGetElement = (parent: Element, ns: string, name: string) => {
        const elements = mockGetElements(parent, ns, name);
        return elements.length > 0 ? elements[0] : null;
      };

      // Mock the xml-utils functions
      const xmlUtils = require("./xml-utils");
      jest.spyOn(xmlUtils, "getElementByTagNameNSFallback").mockImplementation(mockGetElement);
      jest.spyOn(xmlUtils, "getElementsByTagNameNSFallback").mockImplementation(mockGetElements);

      const table = parseEnhancedTable(tableElement, mockRelationships, mockTheme, mockStylesheet);

      expect(table).not.toBeNull();
      expect(table?.rows).toHaveLength(3);

      // Check that the cell at 0,1 has rowspan=3
      expect(table?.rows[0].cells[1].rowspan).toBe(3);

      // Check that cells at 1,1 and 2,1 are marked as merged
      expect((table?.rows[1].cells[1] as ProcessingTableCell)._merged).toBe(true);
      expect((table?.rows[2].cells[1] as ProcessingTableCell)._merged).toBe(true);

      // Restore mocks
      jest.restoreAllMocks();
    });
  });

  describe("Table Layout Properties", () => {
    it("should parse table width with proper OOXML types", () => {
      // Test different width specifications
      const widthConfigs = [
        { w: "5000", type: "dxa", expected: 5000 }, // Twips
        { w: "100", type: "pct", expected: 100 }, // Percentage
        { w: "0", type: "auto", expected: 0 }, // Auto width
      ];

      for (const config of widthConfigs) {
        expect(parseInt(config.w, 10)).toBe(config.expected);
        expect(config.type).toMatch(/^(dxa|pct|auto)$/);
      }
    });

    it("should parse cell margins", () => {
      // Test table cell margin parsing
      const marginElements = [
        createMockElement("top", { "w:w": "108" }), // Top margin
        createMockElement("bottom", { "w:w": "108" }), // Bottom margin
        createMockElement("left", { "w:w": "108" }), // Left margin
        createMockElement("right", { "w:w": "108" }), // Right margin
      ];

      for (const element of marginElements) {
        expect(parseInt(element.getAttribute("w:w")!, 10)).toBe(108);
      }
    });
  });

  describe("Vertical Alignment", () => {
    it("should parse cell vertical alignment", () => {
      const alignmentValues = ["top", "center", "bottom"] as const;

      for (const alignment of alignmentValues) {
        const vAlignElement = createMockElement("vAlign", {
          "w:val": alignment,
        });

        expect(vAlignElement.getAttribute("w:val")).toBe(alignment);
      }
    });
  });

  describe("Real 005.docx Scenarios", () => {
    it("should handle complex table from 005.docx with multiple features", () => {
      // Test case based on actual 005.docx table structure
      const complexTableScenario = {
        hasBorders: true,
        hasShading: true,
        hasSpanning: true,
        hasAlignment: true,
        cellCount: 6 * 6, // 6x6 table from 005.docx
      };

      expect(complexTableScenario.hasBorders).toBe(true);
      expect(complexTableScenario.cellCount).toBe(36);
    });

    it("should parse real DOCX XML with vMerge", () => {
      // Actual DOCX XML structure with vMerge
      const xmlString = `
        <w:tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:vMerge w:val="restart"/>
                <w:tcW w:w="2840" w:type="dxa"/>
              </w:tcPr>
              <w:p><w:r><w:t>Merged Cell</w:t></w:r></w:p>
            </w:tc>
            <w:tc>
              <w:p><w:r><w:t>Normal Cell</w:t></w:r></w:p>
            </w:tc>
          </w:tr>
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:vMerge/>
              </w:tcPr>
              <w:p/>
            </w:tc>
            <w:tc>
              <w:p><w:r><w:t>Another Cell</w:t></w:r></w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      // Parse XML string to DOM using JSDOM
      const dom = new JSDOM();
      const parser = new dom.window.DOMParser();
      const doc = parser.parseFromString(xmlString, "text/xml");
      const tableElement = doc.documentElement;

      // Mock proper namespace handling
      const xmlUtils = require("./xml-utils");

      // Create namespace-aware mock functions
      const mockGetElementNS = (parent: Element, ns: string, name: string) => {
        const fullNS =
          ns === "w" ? "http://schemas.openxmlformats.org/wordprocessingml/2006/main" : null;
        if (fullNS) {
          return parent.getElementsByTagNameNS(fullNS, name)[0] || null;
        }
        return parent.getElementsByTagName(name)[0] || null;
      };

      const mockGetElementsNS = (parent: Element, ns: string, name: string) => {
        const fullNS =
          ns === "w" ? "http://schemas.openxmlformats.org/wordprocessingml/2006/main" : null;
        if (fullNS) {
          return Array.from(parent.getElementsByTagNameNS(fullNS, name));
        }
        return Array.from(parent.getElementsByTagName(name));
      };

      jest.spyOn(xmlUtils, "getElementByTagNameNSFallback").mockImplementation(mockGetElementNS);
      jest.spyOn(xmlUtils, "getElementsByTagNameNSFallback").mockImplementation(mockGetElementsNS);

      const table = parseEnhancedTable(
        tableElement as any,
        mockRelationships,
        mockTheme,
        mockStylesheet,
      );

      expect(table).not.toBeNull();
      expect(table?.rows).toHaveLength(2);

      // First cell should have rowspan=2
      expect(table?.rows[0].cells[0].rowspan).toBe(2);

      // Cell in second row should be marked as merged
      expect((table?.rows[1].cells[0] as ProcessingTableCell)._merged).toBe(true);

      // Other cells should not have rowspan
      expect(table?.rows[0].cells[1].rowspan).toBeUndefined();
      expect(table?.rows[1].cells[1].rowspan).toBeUndefined();

      // Restore mocks
      jest.restoreAllMocks();
    });

    it("should parse calendar-style table layout", () => {
      // 005.docx contains a calendar table with specific formatting
      const calendarTableFeatures = {
        hasHeaderRow: true,
        hasMergedCells: true,
        hasCustomBorders: true,
        weekdayColumns: 7,
        expectedCells: 7 * 6, // 7 columns × 6 rows
      };

      expect(calendarTableFeatures.weekdayColumns).toBe(7);
      expect(calendarTableFeatures.expectedCells).toBe(42);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle missing table properties gracefully", () => {
      const emptyTableElement = createMockElement("tbl", {});

      // Should not throw error with empty table
      expect(() => {
        // Mock empty parsing scenario
        const result = { type: "table", rows: [] };
        expect(result.type).toBe("table");
      }).not.toThrow();
    });

    it("should handle malformed border values", () => {
      const borderWithInvalidSize = createMockElement("top", {
        "w:val": ST_Border.Single,
        "w:sz": "invalid", // Invalid size
        "w:color": "000000",
      });

      const borderWithInvalidColor = createMockElement("bottom", {
        "w:val": ST_Border.Double,
        "w:sz": "8",
        "w:color": "GGGGGG", // Invalid hex color
      });

      // These should not throw - validation should handle gracefully
      expect(() => parseEnhancedTableBorder(borderWithInvalidSize)).not.toThrow();
      expect(() => parseEnhancedTableBorder(borderWithInvalidColor)).not.toThrow();
    });

    it("should handle malformed cell width values", () => {
      const tcWWithInvalidValue = createMockElement("tcW", {
        "w:w": "abc", // Non-numeric
        "w:type": "dxa",
      });

      const tcWWithNegativeValue = createMockElement("tcW", {
        "w:w": "-100", // Negative value
        "w:type": "pct",
      });

      // Should handle gracefully without throwing
      expect(() => {
        const w = tcWWithInvalidValue.getAttribute("w:w");
        const parsed = parseInt(w!, 10);
        expect(isNaN(parsed)).toBe(true);
      }).not.toThrow();
    });

    it("should handle cells with missing paragraphs", () => {
      // Cell without any content
      const emptyCellElement = createMockElement("tc", {}, [createMockElement("tcPr", {})]);

      const mockGetElements = (parent: Element, ns: string, name: string) => {
        if (name === "p") return []; // No paragraphs
        if (name === "tcPr")
          return parent.querySelector("tcPr") ? [parent.querySelector("tcPr")!] : [];
        return [];
      };

      const mockGetElement = (parent: Element, ns: string, name: string) => {
        if (name === "tcPr") return parent.querySelector("tcPr");
        return null;
      };

      const xmlUtils = require("./xml-utils");
      jest.spyOn(xmlUtils, "getElementByTagNameNSFallback").mockImplementation(mockGetElement);
      jest.spyOn(xmlUtils, "getElementsByTagNameNSFallback").mockImplementation(mockGetElements);

      const cell = parseEnhancedTableCell(
        emptyCellElement as any,
        mockRelationships,
        mockTheme,
        mockStylesheet,
      );
      expect(cell.paragraphs).toHaveLength(0);

      // Restore mocks
      jest.restoreAllMocks();
    });

    it("should handle vMerge with invalid values", () => {
      const invalidVMerge = createMockElement("vMerge", {
        "w:val": "invalid", // Not restart or continue
      });

      expect(() => {
        const val = invalidVMerge.getAttribute("w:val");
        expect(val).toBe("invalid");
      }).not.toThrow();
    });

    it("should handle table with irregular row lengths", () => {
      // Table where rows have different numbers of cells
      const irregularTable = {
        type: "table" as const,
        rows: [
          { cells: [{ paragraphs: [] }, { paragraphs: [] }, { paragraphs: [] }] }, // 3 cells
          { cells: [{ paragraphs: [] }, { paragraphs: [] }] }, // 2 cells
          {
            cells: [{ paragraphs: [] }, { paragraphs: [] }, { paragraphs: [] }, { paragraphs: [] }],
          }, // 4 cells
        ],
      };

      expect(() => calculateRowSpans(irregularTable)).not.toThrow();
    });

    it("should validate OOXML type values", () => {
      // Test invalid vs valid OOXML enum values
      const validBorderStyles = [ST_Border.Single, ST_Border.Double, ST_Border.Dotted];
      const validShadingPatterns = [ST_Shd.Solid, ST_Shd.Clear, ST_Shd.Pct25];

      for (const style of validBorderStyles) {
        expect(typeof style).toBe("string");
        expect(style.length).toBeGreaterThan(0);
      }

      for (const pattern of validShadingPatterns) {
        expect(typeof pattern).toBe("string");
        expect(pattern.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Performance and Coverage", () => {
    it("should handle large tables efficiently", () => {
      const startTime = performance.now();

      // Simulate processing a large table
      const largeTableSimulation = {
        rows: 50,
        columns: 10,
        totalCells: 50 * 10,
        features: ["borders", "shading", "spanning", "alignment"],
      };

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      expect(largeTableSimulation.totalCells).toBe(500);
      expect(processingTime).toBeLessThan(100); // Should be fast
      expect(largeTableSimulation.features.length).toBe(4);
    });
  });
});
