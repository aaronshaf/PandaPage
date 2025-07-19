import { describe, it, expect } from "bun:test";
import "../../test-setup";
import { parseConditionalFormatting, parseCnfStyle } from "./conditional-formatting";
import { WORD_NAMESPACE } from "./types";

describe("Conditional formatting (cnfStyle) parsing", () => {
  describe("parseConditionalFormatting", () => {
    it("should parse header row pattern (100000000000)", () => {
      const result = parseConditionalFormatting("100000000000");

      expect(result.val).toBe("100000000000");
      expect(result.firstRow).toBe(true);
      expect(result.lastRow).toBe(false);
      expect(result.firstCol).toBe(false);
      expect(result.lastCol).toBe(false);
      expect(result.bandedRows).toBe(false);
      expect(result.bandedCols).toBe(false);
    });

    it("should parse first column pattern (001000000000)", () => {
      const result = parseConditionalFormatting("001000000000");

      expect(result.val).toBe("001000000000");
      expect(result.firstRow).toBe(false);
      expect(result.lastRow).toBe(false);
      expect(result.firstCol).toBe(true);
      expect(result.lastCol).toBe(false);
      expect(result.bandedRows).toBe(false);
      expect(result.bandedCols).toBe(false);
    });

    it("should parse banded rows pattern (000000100000)", () => {
      const result = parseConditionalFormatting("000000100000");

      expect(result.val).toBe("000000100000");
      expect(result.firstRow).toBe(false);
      expect(result.lastRow).toBe(false);
      expect(result.firstCol).toBe(false);
      expect(result.lastCol).toBe(false);
      expect(result.bandedRows).toBe(true);
      expect(result.bandedCols).toBe(false);
    });

    it("should parse combined first column and additional formatting (001000000100)", () => {
      const result = parseConditionalFormatting("001000000100");

      expect(result.val).toBe("001000000100");
      expect(result.firstRow).toBe(false);
      expect(result.lastRow).toBe(false);
      expect(result.firstCol).toBe(true);
      expect(result.lastCol).toBe(false);
      expect(result.bandedRows).toBe(false); // Position 9, not position 6
      expect(result.bandedCols).toBe(false);
    });

    it("should parse no conditional formatting (000000000000)", () => {
      const result = parseConditionalFormatting("000000000000");

      expect(result.val).toBe("000000000000");
      expect(result.firstRow).toBe(false);
      expect(result.lastRow).toBe(false);
      expect(result.firstCol).toBe(false);
      expect(result.lastCol).toBe(false);
      expect(result.bandedRows).toBe(false);
      expect(result.bandedCols).toBe(false);
    });

    it("should handle short patterns by padding with zeros", () => {
      const result = parseConditionalFormatting("1");

      expect(result.val).toBe("1");
      expect(result.firstRow).toBe(false);
      expect(result.lastRow).toBe(false);
      expect(result.firstCol).toBe(false);
      expect(result.lastCol).toBe(false);
      expect(result.bandedRows).toBe(false);
      expect(result.bandedCols).toBe(false);
    });

    it("should parse all conditional formatting types", () => {
      const result = parseConditionalFormatting("111111110000");

      expect(result.val).toBe("111111110000");
      expect(result.firstRow).toBe(true);
      expect(result.lastRow).toBe(true);
      expect(result.firstCol).toBe(true);
      expect(result.lastCol).toBe(true);
      expect(result.bandedRows).toBe(true);
      expect(result.bandedCols).toBe(true);
    });
  });

  describe("parseCnfStyle", () => {
    // Helper function to create XML elements
    function createElementWithCnfStyle(cnfStyleVal: string): Element {
      const parser = new DOMParser();
      const xmlString = `
        <w:tcPr xmlns:w="${WORD_NAMESPACE}">
          <w:cnfStyle w:val="${cnfStyleVal}"/>
        </w:tcPr>
      `;
      const doc = parser.parseFromString(xmlString, "text/xml");
      return doc.documentElement;
    }

    function createElementWithoutCnfStyle(): Element {
      const parser = new DOMParser();
      const xmlString = `
        <w:tcPr xmlns:w="${WORD_NAMESPACE}">
          <w:tcW w:w="2000" w:type="dxa"/>
        </w:tcPr>
      `;
      const doc = parser.parseFromString(xmlString, "text/xml");
      return doc.documentElement;
    }

    it("should parse cnfStyle from table cell properties", () => {
      const element = createElementWithCnfStyle("100000000000");
      const result = parseCnfStyle(element, WORD_NAMESPACE);

      expect(result).toBeDefined();
      expect(result?.val).toBe("100000000000");
      expect(result?.firstRow).toBe(true);
    });

    it("should parse cnfStyle with first column formatting", () => {
      const element = createElementWithCnfStyle("001000000000");
      const result = parseCnfStyle(element, WORD_NAMESPACE);

      expect(result).toBeDefined();
      expect(result?.val).toBe("001000000000");
      expect(result?.firstCol).toBe(true);
      expect(result?.firstRow).toBe(false);
    });

    it("should parse cnfStyle with banded rows", () => {
      const element = createElementWithCnfStyle("000000100000");
      const result = parseCnfStyle(element, WORD_NAMESPACE);

      expect(result).toBeDefined();
      expect(result?.val).toBe("000000100000");
      expect(result?.bandedRows).toBe(true);
    });

    it("should return undefined when no cnfStyle element exists", () => {
      const element = createElementWithoutCnfStyle();
      const result = parseCnfStyle(element, WORD_NAMESPACE);

      expect(result).toBeUndefined();
    });

    it("should return undefined when cnfStyle has no val attribute", () => {
      const parser = new DOMParser();
      const xmlString = `
        <w:tcPr xmlns:w="${WORD_NAMESPACE}">
          <w:cnfStyle/>
        </w:tcPr>
      `;
      const doc = parser.parseFromString(xmlString, "text/xml");
      const element = doc.documentElement;

      const result = parseCnfStyle(element, WORD_NAMESPACE);
      expect(result).toBeUndefined();
    });

    it("should parse complex combined conditional formatting", () => {
      const element = createElementWithCnfStyle("001000000100");
      const result = parseCnfStyle(element, WORD_NAMESPACE);

      expect(result).toBeDefined();
      expect(result?.val).toBe("001000000100");
      expect(result?.firstCol).toBe(true);
      expect(result?.bandedRows).toBe(false); // Position 9, not position 6
      expect(result?.firstRow).toBe(false);
      expect(result?.lastRow).toBe(false);
    });
  });
});
