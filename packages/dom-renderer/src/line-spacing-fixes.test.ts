import { describe, it, expect, spyOn, beforeEach, afterEach } from "bun:test";
import { convertLineSpacing } from "./units";
import { getParagraphStyles, getHeadingStyles } from "./style-utils";
import type { Paragraph, Heading } from "@browser-document-viewer/parser";

describe("Line Spacing Fixes", () => {
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("convertLineSpacing", () => {
    it("should handle normal auto line spacing", () => {
      expect(convertLineSpacing(240, "auto")).toBe("1.00"); // Normal spacing
      expect(convertLineSpacing(276, "auto")).toBe("1.15"); // Slightly tighter
      expect(convertLineSpacing(360, "auto")).toBe("1.50"); // 1.5x spacing
    });

    it("should handle any auto values without clamping", () => {
      expect(convertLineSpacing(120, "auto")).toBe("0.50"); // 120/240 = 0.5x
      expect(convertLineSpacing(800, "auto")).toBe("3.33"); // 800/240 = 3.33x
      expect(consoleSpy).not.toHaveBeenCalled(); // No warnings
    });

    it("should handle exact spacing in points", () => {
      expect(convertLineSpacing(240, "exact")).toBe("12pt"); // 240 twips = 12pt
      expect(convertLineSpacing(360, "exact")).toBe("18pt"); // 360 twips = 18pt
    });

    it("should handle atLeast spacing in points", () => {
      expect(convertLineSpacing(240, "atLeast")).toBe("12pt");
      expect(convertLineSpacing(480, "atLeast")).toBe("24pt");
    });
  });

  describe("getParagraphStyles - empty paragraph handling", () => {
    it("should not apply default margin to empty paragraphs", () => {
      const emptyParagraph: Paragraph = {
        type: "paragraph",
        runs: [],
      };

      const result = getParagraphStyles(emptyParagraph);
      expect(result).toBe(""); // No styles applied
    });

    it("should not apply line spacing to empty paragraphs", () => {
      const emptyParagraphWithSpacing: Paragraph = {
        type: "paragraph",
        runs: [],
        spacing: {
          line: 276,
          lineRule: "auto",
        },
      };

      const result = getParagraphStyles(emptyParagraphWithSpacing);
      expect(result).toBe(""); // No line-height applied
    });

    it("should apply margin to paragraphs with content", () => {
      const paragraphWithContent: Paragraph = {
        type: "paragraph",
        runs: [{ text: "Hello world" }],
      };

      const result = getParagraphStyles(paragraphWithContent);
      expect(result).toBe("margin-bottom: 12px");
    });

    it("should apply line spacing to paragraphs with content", () => {
      const paragraphWithContentAndSpacing: Paragraph = {
        type: "paragraph",
        runs: [{ text: "Hello world" }],
        spacing: {
          line: 276,
          lineRule: "auto",
        },
      };

      const result = getParagraphStyles(paragraphWithContentAndSpacing);
      expect(result).toBe("line-height: 1.15");
    });
  });

  describe("getParagraphStyles - faithful line spacing rendering", () => {
    it("should render actual 005.docx line spacing values faithfully", () => {
      const paragraphWithDocumentSpacing: Paragraph = {
        type: "paragraph",
        runs: [{ text: "D" }], // Single letter like in 005.docx
        spacing: {
          line: 951, // Actual value from 005.docx
          lineRule: "exact",
        },
      };

      const result = getParagraphStyles(paragraphWithDocumentSpacing);
      expect(result).toBe("line-height: 47.55pt"); // Faithful rendering: 951 twips = 47.55pt
      expect(consoleSpy).not.toHaveBeenCalled(); // No validation warnings
    });

    it("should handle any line spacing values without validation", () => {
      const paragraphWithLargeSpacing: Paragraph = {
        type: "paragraph",
        runs: [{ text: "Hello world" }],
        spacing: {
          line: 1440, // Very large value (72pt)
          lineRule: "exact",
        },
      };

      const result = getParagraphStyles(paragraphWithLargeSpacing);
      expect(result).toBe("line-height: 72pt"); // 1440 twips = 72pt
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe("getHeadingStyles - faithful line spacing rendering", () => {
    it("should render heading line spacing values faithfully", () => {
      const headingWithDocumentSpacing: Heading = {
        type: "heading",
        level: 1,
        runs: [{ text: "Heading" }],
        spacing: {
          line: 951, // Any spacing value should be rendered faithfully
          lineRule: "exact",
        },
      };

      const result = getHeadingStyles(headingWithDocumentSpacing);
      expect(result).toContain("line-height: 47.55pt"); // Faithful: 951 twips = 47.55pt
      expect(consoleSpy).not.toHaveBeenCalled(); // No validation warnings
    });
  });

  describe("Real-world 005.docx scenarios", () => {
    it("should handle typical 005.docx spacing (276 twips auto)", () => {
      const result = convertLineSpacing(276, "auto");
      expect(result).toBe("1.15"); // Should be readable, not too tight
    });

    it("should handle actual 005.docx spacing (951 twips exact) faithfully", () => {
      const result = convertLineSpacing(951, "exact");
      expect(result).toBe("47.55pt"); // Faithful rendering of document values
    });
  });
});
