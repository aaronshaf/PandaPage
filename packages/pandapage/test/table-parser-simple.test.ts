import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import { parseTableProperties, parseTableRowProperties, parseTableCellProperties } from "../src/formats/docx/table-parser";

// Create a minimal mock element that has the querySelector method
function createMockElement(properties: Record<string, any>): any {
  const elements: Record<string, any> = {};
  
  // Store child elements by tag name
  Object.entries(properties).forEach(([key, value]) => {
    elements[key] = {
      getAttribute: (attr: string) => {
        if (typeof value === 'object' && value[attr]) {
          return value[attr];
        }
        return value;
      }
    };
  });

  return {
    querySelector: (selector: string) => {
      // Simple selector parsing - just get the tag name
      const tagName = selector.replace(/^.*?(\w+)$/, '$1');
      return elements[tagName] || null;
    }
  };
}

describe("Table Parser Properties", () => {
  describe("parseTableProperties", () => {
    test("should parse table width", async () => {
      const tblPr = createMockElement({
        tblW: { w: "5000", type: "dxa" }
      });
      
      const result = await Effect.runPromise(parseTableProperties(tblPr));
      expect(result.width).toBe("5000px");
    });

    test("should parse table width percentage", async () => {
      const tblPr = createMockElement({
        tblW: { w: "50", type: "pct" }
      });
      
      const result = await Effect.runPromise(parseTableProperties(tblPr));
      expect(result.width).toBe("50%");
    });

    test("should parse table alignment", async () => {
      const tblPr = createMockElement({
        jc: { val: "center" }
      });
      
      const result = await Effect.runPromise(parseTableProperties(tblPr));
      expect(result.alignment).toBe("center");
    });

    test("should parse table background color", async () => {
      const tblPr = createMockElement({
        shd: { fill: "FF0000" }
      });
      
      const result = await Effect.runPromise(parseTableProperties(tblPr));
      expect(result.backgroundColor).toBe("#FF0000");
    });

    test("should handle empty properties", async () => {
      const tblPr = createMockElement({});
      
      const result = await Effect.runPromise(parseTableProperties(tblPr));
      expect(result).toEqual({});
    });

    test("should ignore auto color", async () => {
      const tblPr = createMockElement({
        shd: { fill: "auto" }
      });
      
      const result = await Effect.runPromise(parseTableProperties(tblPr));
      expect(result.backgroundColor).toBeUndefined();
    });
  });

  describe("parseTableRowProperties", () => {
    test("should parse row height", async () => {
      const trPr = createMockElement({
        trHeight: { val: "720" }
      });
      
      const result = await Effect.runPromise(parseTableRowProperties(trPr));
      expect(result.height).toBe("720px");
    });

    test("should parse header row", async () => {
      const trPr = createMockElement({
        tblHeader: {}
      });
      
      const result = await Effect.runPromise(parseTableRowProperties(trPr));
      expect(result.isHeader).toBe(true);
    });

    test("should handle non-header row", async () => {
      const trPr = createMockElement({});
      
      const result = await Effect.runPromise(parseTableRowProperties(trPr));
      expect(result.isHeader).toBeUndefined();
    });
  });

  describe("parseTableCellProperties", () => {
    test("should parse cell width", async () => {
      const tcPr = createMockElement({
        tcW: { w: "2500", type: "dxa" }
      });
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result.width).toBe("2500px");
    });

    test("should parse cell width percentage", async () => {
      const tcPr = createMockElement({
        tcW: { w: "25", type: "pct" }
      });
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result.width).toBe("25%");
    });

    test("should parse vertical alignment", async () => {
      const tcPr = createMockElement({
        vAlign: { val: "center" }
      });
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result.alignment).toBe("center");
    });

    test("should parse cell background color", async () => {
      const tcPr = createMockElement({
        shd: { fill: "00FF00" }
      });
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result.backgroundColor).toBe("#00FF00");
    });

    test("should handle invalid vertical alignment", async () => {
      const tcPr = createMockElement({
        vAlign: { val: "invalid" }
      });
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result.alignment).toBeUndefined();
    });

    test("should handle empty cell properties", async () => {
      const tcPr = createMockElement({});
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result).toEqual({});
    });
  });
});