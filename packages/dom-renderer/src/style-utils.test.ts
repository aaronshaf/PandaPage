import { describe, it, expect, spyOn, beforeEach, afterEach } from "bun:test";
import {
  twipsToPixels,
  formatColor,
  pointsToPixels,
  getTextRunStyles,
  getHeadingStyles,
  getParagraphStyles,
  getImageStyles,
  getTableStyles,
  getTableCellStyles,
} from "./style-utils";
import type { TextRun, Paragraph, Heading } from "@browser-document-viewer/parser";
import { ST_Underline, ST_Jc } from "@browser-document-viewer/ooxml-types";

describe("Style Utils", () => {
  describe("twipsToPixels", () => {
    it("should convert twips to pixels correctly", () => {
      expect(twipsToPixels(1440)).toBe(96); // 1 inch at 96 DPI
      expect(twipsToPixels(720)).toBe(48); // 0.5 inch
      expect(twipsToPixels(240)).toBe(16); // Normal line spacing
      expect(twipsToPixels(0)).toBe(0);
    });

    it("should round to nearest pixel", () => {
      expect(twipsToPixels(721)).toBe(48); // Should round down
      expect(twipsToPixels(735)).toBe(49); // Should round up (735/1440 * 96 = 49.0)
    });

    it("should handle negative values", () => {
      expect(twipsToPixels(-240)).toBe(-16);
    });
  });

  describe("formatColor", () => {
    it("should return null for undefined color", () => {
      expect(formatColor(undefined)).toBeNull();
    });

    it("should return null for auto color", () => {
      expect(formatColor("auto")).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(formatColor("")).toBeNull();
    });

    it("should add hash prefix when missing", () => {
      expect(formatColor("FF0000")).toBe("#FF0000");
      expect(formatColor("123ABC")).toBe("#123ABC");
      expect(formatColor("000000")).toBe("#000000");
    });

    it("should preserve existing hash prefix", () => {
      expect(formatColor("#FF0000")).toBe("#FF0000");
      expect(formatColor("#123ABC")).toBe("#123ABC");
    });

    it("should handle various color formats", () => {
      expect(formatColor("fff")).toBe("#fff");
      expect(formatColor("#fff")).toBe("#fff");
      expect(formatColor("FFFFFF")).toBe("#FFFFFF");
      expect(formatColor("#FFFFFF")).toBe("#FFFFFF");
    });
  });

  describe("pointsToPixels", () => {
    it("should convert points to pixels correctly", () => {
      expect(pointsToPixels(72)).toBe(96); // 1 inch at 96 DPI
      expect(pointsToPixels(36)).toBe(48); // 0.5 inch
      expect(pointsToPixels(12)).toBe(16); // 12pt font
      expect(pointsToPixels(0)).toBe(0);
    });

    it("should round to nearest pixel", () => {
      expect(pointsToPixels(0.4)).toBe(1); // Should round up
      expect(pointsToPixels(0.3)).toBe(0); // Should round down
    });

    it("should handle negative values", () => {
      expect(pointsToPixels(-12)).toBe(-16);
    });

    it("should handle decimal points", () => {
      expect(pointsToPixels(10.5)).toBe(14);
      expect(pointsToPixels(13.25)).toBe(18);
    });
  });

  describe("getTextRunStyles", () => {
    let consoleSpy: any;

    beforeEach(() => {
      consoleSpy = spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("should return empty string for text run with no formatting", () => {
      const run: TextRun = { text: "plain text" };
      expect(getTextRunStyles(run)).toBe("");
    });

    it("should handle bold formatting", () => {
      const run: TextRun = { text: "bold", bold: true };
      expect(getTextRunStyles(run)).toBe("font-weight: bold");
    });

    it("should handle italic formatting", () => {
      const run: TextRun = { text: "italic", italic: true };
      expect(getTextRunStyles(run)).toBe("font-style: italic");
    });

    it("should handle boolean underline", () => {
      const run: TextRun = { text: "underlined", underline: true };
      expect(getTextRunStyles(run)).toBe("text-decoration: underline");
    });

    it("should handle specific underline styles", () => {
      const run: TextRun = { text: "text", underline: ST_Underline.Double };
      const result = getTextRunStyles(run);
      expect(result).toBe("text-decoration: underline double");
    });

    it("should handle unknown underline styles with fallback", () => {
      const run: TextRun = { text: "text", underline: "unknown" as any };
      const result = getTextRunStyles(run);
      expect(result).toBe("text-decoration: underline");
      expect(consoleSpy).toHaveBeenCalledWith("Unknown underline style: unknown, using default underline");
    });

    it("should handle all known underline styles", () => {
      const styles = [
        ST_Underline.Single,
        ST_Underline.Double, 
        ST_Underline.Thick,
        ST_Underline.Dotted,
        ST_Underline.Dash,
        ST_Underline.Wave
      ];
      
      styles.forEach(style => {
        const run: TextRun = { text: "text", underline: style };
        const result = getTextRunStyles(run);
        expect(result).toContain("text-decoration:");
        expect(consoleSpy).not.toHaveBeenCalled();
      });
    });

    it("should handle strikethrough", () => {
      const run: TextRun = { text: "struck", strikethrough: true };
      expect(getTextRunStyles(run)).toBe("text-decoration-line: line-through");
    });

    it("should handle double strikethrough", () => {
      const run: TextRun = { text: "struck", doubleStrikethrough: true };
      const result = getTextRunStyles(run);
      expect(result).toContain("text-decoration-line: line-through");
      expect(result).toContain("text-decoration-style: double");
    });

    it("should handle font properties", () => {
      const run: TextRun = { 
        text: "formatted", 
        fontSize: 14, 
        fontFamily: "Arial" 
      };
      const result = getTextRunStyles(run);
      expect(result).toContain("font-size: 14pt");
      expect(result).toContain("font-family: Arial");
    });

    it("should handle colors", () => {
      const run: TextRun = { 
        text: "colored", 
        color: "FF0000",
        backgroundColor: "#00FF00"
      };
      const result = getTextRunStyles(run);
      expect(result).toContain("color: #FF0000");
      expect(result).toContain("background-color: #00FF00");
    });

    it("should ignore auto colors", () => {
      const run: TextRun = { 
        text: "auto colored", 
        color: "auto",
        backgroundColor: "auto"
      };
      const result = getTextRunStyles(run);
      expect(result).not.toContain("color:");
      expect(result).not.toContain("background-color:");
    });

    it("should handle advanced formatting", () => {
      const run: TextRun = { 
        text: "advanced",
        characterSpacing: 120,
        position: 60,
        smallCaps: true,
        caps: true,
        hidden: true,
        textScale: 85,
        shadow: true,
        outline: true
      };
      const result = getTextRunStyles(run);
      
      expect(result).toContain("letter-spacing: 8px"); // 120 twips
      expect(result).toContain("vertical-align: 4px"); // 60 twips
      expect(result).toContain("font-variant: small-caps");
      expect(result).toContain("text-transform: uppercase");
      expect(result).toContain("display: none");
      expect(result).toContain("transform: scaleX(0.85)");
      expect(result).toContain("text-shadow: 1px 1px 2px rgba(0,0,0,0.5)");
      expect(result).toContain("color: transparent");
      expect(result).toContain("-webkit-text-stroke: 1px currentColor");
    });

    it("should handle combined formatting", () => {
      const run: TextRun = { 
        text: "complex",
        bold: true,
        italic: true,
        underline: ST_Underline.Thick,
        color: "0000FF",
        fontSize: 16
      };
      const result = getTextRunStyles(run);
      
      expect(result).toContain("font-weight: bold");
      expect(result).toContain("font-style: italic");
      expect(result).toContain("text-decoration: underline");
      expect(result).toContain("text-decoration-thickness: 2px");
      expect(result).toContain("color: #0000FF");
      expect(result).toContain("font-size: 16pt");
    });
  });

  describe("getHeadingStyles", () => {
    it("should apply correct font size for each heading level", () => {
      const levels = [1, 2, 3, 4, 5, 6];
      const expectedSizes = [32, 28, 24, 20, 18, 16];
      
      levels.forEach((level, index) => {
        const heading: Heading = { type: "heading", level: level as 1 | 2 | 3 | 4 | 5 | 6, runs: [] };
        const result = getHeadingStyles(heading);
        expect(result).toContain(`font-size: ${expectedSizes[index]}px`);
        expect(result).toContain("font-weight: bold");
      });
    });

    it("should default to level 1 for invalid levels", () => {
      const heading: Heading = { type: "heading", level: 1, runs: [] };
      // Test the fallback behavior by passing an invalid level through type assertion
      const headingWithInvalidLevel = { ...heading, level: 99 } as unknown as Heading;
      const result = getHeadingStyles(headingWithInvalidLevel);
      expect(result).toContain("font-size: 32px");
    });

    it("should apply spacing when defined", () => {
      const heading: Heading = { 
        type: "heading", 
        level: 1, 
        runs: [],
        spacing: {
          before: 240,
          after: 120,
          line: 360
        }
      };
      const result = getHeadingStyles(heading);
      
      expect(result).toContain("margin-top: 16px"); // 240 twips
      expect(result).toContain("margin-bottom: 8px"); // 120 twips
      expect(result).toContain("line-height: 1.50"); // 360 twips auto = 360/240 = 1.5x
    });

    it("should apply exact line spacing", () => {
      const heading: Heading = { 
        type: "heading", 
        level: 1, 
        runs: [],
        spacing: {
          line: 480,
          lineRule: "exact"
        }
      };
      const result = getHeadingStyles(heading);
      expect(result).toContain("line-height: 24pt"); // 480 twips exact = 24pt
    });

    it("should apply minimum line spacing", () => {
      const heading: Heading = { 
        type: "heading", 
        level: 1, 
        runs: [],
        spacing: {
          line: 240,
          lineRule: "atLeast"
        }
      };
      const result = getHeadingStyles(heading);
      expect(result).toContain("line-height: 12pt"); // 240 twips atLeast = 12pt
    });

    it("should apply default margins when no spacing defined", () => {
      const heading: Heading = { type: "heading", level: 2, runs: [] };
      const result = getHeadingStyles(heading);
      expect(result).toContain("margin-bottom: 14px"); // 28 * 0.5
    });

    it("should handle alignment", () => {
      const alignments = [ST_Jc.Center, ST_Jc.End, ST_Jc.Both, ST_Jc.Distribute] as const;
      const expectedAligns = ["center", "right", "justify", "justify"];
      
      alignments.forEach((alignment, index) => {
        const heading: Heading = { 
          type: "heading", 
          level: 1, 
          runs: [],
          alignment
        };
        const result = getHeadingStyles(heading);
        expect(result).toContain(`text-align: ${expectedAligns[index]}`);
      });
    });

    it("should handle indentation", () => {
      const heading: Heading = { 
        type: "heading", 
        level: 1, 
        runs: [],
        indentation: {
          left: 720,
          right: 360,
          firstLine: 240,
          hanging: 480
        }
      };
      const result = getHeadingStyles(heading);
      
      expect(result).toContain("margin-left: 48px"); // 720 twips
      expect(result).toContain("margin-right: 24px"); // 360 twips
      expect(result).toContain("text-indent: 16px"); // 240 twips
      expect(result).toContain("padding-left: 32px"); // 480 twips
      expect(result).toContain("text-indent: -32px"); // -480 twips (hanging override)
    });
  });

  describe("getParagraphStyles", () => {
    it("should apply default margin when no spacing defined", () => {
      const paragraph: Paragraph = { type: "paragraph", runs: [{ text: "Hello" }] };
      const result = getParagraphStyles(paragraph);
      expect(result).toBe("margin-bottom: 12px");
    });

    it("should handle line spacing calculations", () => {
      const paragraph: Paragraph = { 
        type: "paragraph", 
        runs: [{ text: "Hello" }],
        spacing: {
          line: 480,
          lineRule: "auto"
        }
      };
      const result = getParagraphStyles(paragraph);
      expect(result).toContain("line-height: 2.00"); // 480 twips auto = 480/240 = 2.0x
    });

    it("should handle list indentation", () => {
      const paragraph: Paragraph = { 
        type: "paragraph", 
        runs: [],
        listInfo: { level: 2, type: "number" }
      };
      const result = getParagraphStyles(paragraph);
      expect(result).toContain("margin-left: 80px"); // 2 * 40px per level
    });

    it("should handle special paragraph styles", () => {
      const styles = ["title", "subtitle", "heading1", "heading2", "heading3", "heading4", "heading5", "heading6"];
      
      styles.forEach(style => {
        const paragraph: Paragraph = { 
          type: "paragraph", 
          runs: [],
          style
        };
        const result = getParagraphStyles(paragraph);
        expect(result).toContain("font-size:");
        
        if (style === "title" || style.startsWith("heading")) {
          expect(result).toContain("font-weight: bold");
        }
        if (style === "title" || style === "subtitle") {
          expect(result).toContain("text-align: center");
        }
      });
    });

    it("should handle case-insensitive style names", () => {
      const paragraph: Paragraph = { 
        type: "paragraph", 
        runs: [],
        style: "TITLE"
      };
      const result = getParagraphStyles(paragraph);
      expect(result).toContain("font-size: 32px");
      expect(result).toContain("text-align: center");
    });
  });

  describe("getImageStyles", () => {
    it("should return standard image styles", () => {
      const result = getImageStyles();
      expect(result).toBe("max-width: 100%; height: auto; margin-bottom: 12px");
    });
  });

  describe("getTableStyles", () => {
    it("should return standard table styles", () => {
      const result = getTableStyles();
      expect(result).toBe("border-collapse: collapse; margin-bottom: 12px");
    });
  });

  describe("getTableCellStyles", () => {
    it("should return basic cell styles for regular cells", () => {
      const result = getTableCellStyles(false);
      expect(result).toContain("border: 1px solid #d1d5db");
      expect(result).toContain("padding: 8px 16px");
      expect(result).not.toContain("font-weight: 600");
      expect(result).not.toContain("background-color: #f9fafb");
    });

    it("should return enhanced styles for header cells", () => {
      const result = getTableCellStyles(true);
      expect(result).toContain("border: 1px solid #d1d5db");
      expect(result).toContain("padding: 8px 16px");
      expect(result).toContain("font-weight: 600");
      expect(result).toContain("background-color: #f9fafb");
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle null/undefined properties gracefully", () => {
      const run: TextRun = { 
        text: "test",
        color: undefined,
        backgroundColor: undefined,
        fontSize: undefined,
        fontFamily: undefined
      };
      const result = getTextRunStyles(run);
      expect(result).toBe("");
    });

    it("should handle zero values correctly", () => {
      expect(twipsToPixels(0)).toBe(0);
      expect(pointsToPixels(0)).toBe(0);
      
      // Note: zero values are falsy in JavaScript, so they don't get included in styles
      // This is actually correct behavior - we don't want "font-size: 0pt" in output
      const run: TextRun = { 
        text: "test",
        fontSize: 0,
        characterSpacing: 0,
        position: 0,
        textScale: 0
      };
      const result = getTextRunStyles(run);
      expect(result).toBe(""); // Zero values are falsy and excluded
      
      // Test with non-zero values to ensure they work
      const runWithValues: TextRun = { 
        text: "test",
        fontSize: 12,
        characterSpacing: 20,
        position: 10,
        textScale: 100
      };
      const resultWithValues = getTextRunStyles(runWithValues);
      expect(resultWithValues).toContain("font-size: 12pt");
      expect(resultWithValues).toContain("letter-spacing: 1px"); // 20 twips
      expect(resultWithValues).toContain("vertical-align: 1px"); // 10 twips  
      expect(resultWithValues).toContain("transform: scaleX(1)"); // 100/100
    });

    it("should handle very large values", () => {
      expect(twipsToPixels(144000)).toBe(9600); // 100 inches
      expect(pointsToPixels(7200)).toBe(9600); // 100 inches
    });

    it("should handle decimal precision correctly", () => {
      // Test that rounding works correctly for edge cases
      expect(twipsToPixels(15)).toBe(1); // 15/1440 * 96 = 1.0
      expect(twipsToPixels(14)).toBe(1); // 14/1440 * 96 = 0.93... rounds to 1
      expect(twipsToPixels(7)).toBe(0); // 7/1440 * 96 = 0.47... rounds to 0
    });
  });
});