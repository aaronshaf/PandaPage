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

    it("should clamp extreme auto values", () => {
      expect(convertLineSpacing(120, "auto")).toBe("0.80"); // Too tight, clamped to min
      expect(convertLineSpacing(800, "auto")).toBe("3.00"); // Too loose, clamped to max
      expect(consoleSpy).toHaveBeenCalledTimes(2);
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
        runs: []
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
          lineRule: "auto"
        }
      };
      
      const result = getParagraphStyles(emptyParagraphWithSpacing);
      expect(result).toBe(""); // No line-height applied
    });

    it("should apply margin to paragraphs with content", () => {
      const paragraphWithContent: Paragraph = {
        type: "paragraph",
        runs: [{ text: "Hello world" }]
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
          lineRule: "auto"
        }
      };
      
      const result = getParagraphStyles(paragraphWithContentAndSpacing);
      expect(result).toBe("line-height: 1.15");
    });
  });

  describe("getParagraphStyles - extreme spacing validation", () => {
    it("should cap extreme line spacing values", () => {
      const paragraphWithExtremeSpacing: Paragraph = {
        type: "paragraph",
        runs: [{ text: "Hello world" }],
        spacing: {
          line: 951, // Extreme value from 005.docx
          lineRule: "exact"
        }
      };
      
      const result = getParagraphStyles(paragraphWithExtremeSpacing);
      expect(result).toBe("line-height: 36pt"); // Capped at 720 twips = 36pt
      expect(consoleSpy).toHaveBeenCalledWith("Extreme line spacing detected (951 twips), capping at maximum");
    });

    it("should allow reasonable spacing values", () => {
      const paragraphWithReasonableSpacing: Paragraph = {
        type: "paragraph",
        runs: [{ text: "Hello world" }],
        spacing: {
          line: 360, // Reasonable value
          lineRule: "exact"
        }
      };
      
      const result = getParagraphStyles(paragraphWithReasonableSpacing);
      expect(result).toBe("line-height: 18pt");
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe("getHeadingStyles - extreme spacing validation", () => {
    it("should cap extreme heading line spacing values", () => {
      const headingWithExtremeSpacing: Heading = {
        type: "heading",
        level: 1,
        runs: [{ text: "Heading" }],
        spacing: {
          line: 951,
          lineRule: "exact"
        }
      };
      
      const result = getHeadingStyles(headingWithExtremeSpacing);
      expect(result).toContain("line-height: 36pt"); // Capped value
      expect(consoleSpy).toHaveBeenCalledWith("Extreme heading line spacing detected (951 twips), capping at maximum");
    });
  });

  describe("Real-world 005.docx scenarios", () => {
    it("should handle typical 005.docx spacing (276 twips auto)", () => {
      const result = convertLineSpacing(276, "auto");
      expect(result).toBe("1.15"); // Should be readable, not too tight
    });

    it("should handle extreme 005.docx spacing (951 twips exact)", () => {
      const result = convertLineSpacing(951, "exact");
      expect(result).toBe("47.55pt"); // Raw value, but will be capped in style functions
    });
  });
});