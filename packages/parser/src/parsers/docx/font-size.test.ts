import { expect, test, describe } from "bun:test";
import "../../test-setup";
import { parseRun } from "./paragraph-parser";
import { WORD_NAMESPACE } from "./types";
import { halfPointsToPoints } from "./unit-utils";
import { convertToDocumentElement } from "./element-converter";
import type { DocxParagraph } from "./types";

describe("Font Size Handling", () => {
  const ns = WORD_NAMESPACE;

  function createRunElement(properties: string): Element {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<w:r xmlns:w="${ns}">
        <w:rPr>${properties}</w:rPr>
        <w:t>Test text</w:t>
      </w:r>`,
      "text/xml",
    );
    return doc.documentElement;
  }

  describe("halfPointsToPoints conversion", () => {
    test("converts even half-points correctly", () => {
      expect(halfPointsToPoints("24")).toBe(12);
      expect(halfPointsToPoints("28")).toBe(14);
      expect(halfPointsToPoints("32")).toBe(16);
    });

    test("converts odd half-points with decimal precision", () => {
      expect(halfPointsToPoints("23")).toBe(11.5);
      expect(halfPointsToPoints("25")).toBe(12.5);
      expect(halfPointsToPoints("27")).toBe(13.5);
    });

    test("handles numeric input", () => {
      expect(halfPointsToPoints(24)).toBe(12);
      expect(halfPointsToPoints(23)).toBe(11.5);
    });

    test("handles invalid input", () => {
      expect(halfPointsToPoints(null)).toBeUndefined();
      expect(halfPointsToPoints(undefined)).toBeUndefined();
      expect(halfPointsToPoints("")).toBeUndefined();
      expect(halfPointsToPoints("invalid")).toBeUndefined();
    });
  });

  describe("Font size parsing from DOCX", () => {
    test("parses regular font size (sz)", () => {
      const run = createRunElement('<w:sz w:val="24"/>');
      const result = parseRun(run, ns);
      expect(result?.fontSize).toBe("24");
    });

    test("parses complex script font size (szCs)", () => {
      const run = createRunElement('<w:szCs w:val="28"/>');
      const result = parseRun(run, ns);
      expect(result?.fontSizeCs).toBe("28");
    });

    test("parses both regular and complex script font sizes", () => {
      const run = createRunElement('<w:sz w:val="24"/><w:szCs w:val="28"/>');
      const result = parseRun(run, ns);
      expect(result?.fontSize).toBe("24");
      expect(result?.fontSizeCs).toBe("28");
    });

    test("handles missing font size", () => {
      const run = createRunElement("");
      const result = parseRun(run, ns);
      expect(result?.fontSize).toBeUndefined();
      expect(result?.fontSizeCs).toBeUndefined();
    });
  });

  describe("Font size conversion in element converter", () => {
    test("converts font sizes to points in document elements", () => {
      const docxParagraph: DocxParagraph = {
        runs: [
          {
            text: "This is a longer paragraph text that should not be detected as a heading.",
            fontSize: "24",
            fontSizeCs: "28",
          },
        ],
        style: "Normal",
      };

      const element = convertToDocumentElement(docxParagraph, undefined, 100); // High paragraph index to avoid heading detection
      expect(element.type).toBe("paragraph"); // Debug assertion
      if (element.type === "paragraph") {
        const run = element.runs[0];
        expect(run.fontSize).toBe(12);
        expect(run.fontSizeCs).toBe(14);
      } else {
        throw new Error("Expected paragraph element");
      }
    });

    test("handles decimal font sizes correctly", () => {
      const docxParagraph: DocxParagraph = {
        runs: [
          {
            text: "This is a longer paragraph text that should not be detected as a heading.",
            fontSize: "23",
            fontSizeCs: "27",
          },
        ],
        style: "Normal",
      };

      const element = convertToDocumentElement(docxParagraph, undefined, 100); // High paragraph index to avoid heading detection
      if (element.type === "paragraph") {
        const run = element.runs[0];
        expect(run.fontSize).toBe(11.5);
        expect(run.fontSizeCs).toBe(13.5);
      } else {
        throw new Error("Expected paragraph element");
      }
    });

    test("handles missing font sizes", () => {
      const docxParagraph: DocxParagraph = {
        runs: [
          {
            text: "This is a longer paragraph text that should not be detected as a heading.",
          },
        ],
        style: "Normal",
      };

      const element = convertToDocumentElement(docxParagraph, undefined, 100); // High paragraph index to avoid heading detection
      if (element.type === "paragraph") {
        const run = element.runs[0];
        expect(run.fontSize).toBeUndefined();
        expect(run.fontSizeCs).toBeUndefined();
      } else {
        throw new Error("Expected paragraph element");
      }
    });
  });
});
