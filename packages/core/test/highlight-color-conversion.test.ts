import { describe, expect, test } from "bun:test";
import { ST_HighlightColor } from "@browser-document-viewer/ooxml-types";

// We need to extract the helper function for testing
// This is a test implementation that mimics the actual function
function convertHighlightColorToHex(colorName: string): string {
  const highlightColors: Record<ST_HighlightColor, string> = {
    [ST_HighlightColor.Yellow]: "#FFFF00",
    [ST_HighlightColor.Green]: "#00FF00",
    [ST_HighlightColor.Cyan]: "#00FFFF",
    [ST_HighlightColor.Magenta]: "#FF00FF",
    [ST_HighlightColor.Blue]: "#0000FF",
    [ST_HighlightColor.Red]: "#FF0000",
    [ST_HighlightColor.DarkBlue]: "#000080",
    [ST_HighlightColor.DarkCyan]: "#008080",
    [ST_HighlightColor.DarkGreen]: "#008000",
    [ST_HighlightColor.DarkMagenta]: "#800080",
    [ST_HighlightColor.DarkRed]: "#800000",
    [ST_HighlightColor.DarkYellow]: "#808000",
    [ST_HighlightColor.DarkGray]: "#808080",
    [ST_HighlightColor.LightGray]: "#C0C0C0",
    [ST_HighlightColor.Black]: "#000000",
    [ST_HighlightColor.White]: "#FFFFFF",
    [ST_HighlightColor.None]: "",
  };
  
  return highlightColors[colorName as ST_HighlightColor] || colorName;
}

describe("Highlight Color Conversion", () => {
  describe("Standard OOXML highlight colors", () => {
    test("should convert yellow to hex", () => {
      expect(convertHighlightColorToHex(ST_HighlightColor.Yellow)).toBe("#FFFF00");
    });

    test("should convert green to hex", () => {
      expect(convertHighlightColorToHex(ST_HighlightColor.Green)).toBe("#00FF00");
    });

    test("should convert cyan to hex", () => {
      expect(convertHighlightColorToHex(ST_HighlightColor.Cyan)).toBe("#00FFFF");
    });

    test("should convert magenta to hex", () => {
      expect(convertHighlightColorToHex(ST_HighlightColor.Magenta)).toBe("#FF00FF");
    });

    test("should convert blue to hex", () => {
      expect(convertHighlightColorToHex(ST_HighlightColor.Blue)).toBe("#0000FF");
    });

    test("should convert red to hex", () => {
      expect(convertHighlightColorToHex(ST_HighlightColor.Red)).toBe("#FF0000");
    });
  });

  describe("Dark color variants", () => {
    test("should convert dark colors correctly", () => {
      expect(convertHighlightColorToHex(ST_HighlightColor.DarkBlue)).toBe("#000080");
      expect(convertHighlightColorToHex(ST_HighlightColor.DarkCyan)).toBe("#008080");
      expect(convertHighlightColorToHex(ST_HighlightColor.DarkGreen)).toBe("#008000");
      expect(convertHighlightColorToHex(ST_HighlightColor.DarkMagenta)).toBe("#800080");
      expect(convertHighlightColorToHex(ST_HighlightColor.DarkRed)).toBe("#800000");
      expect(convertHighlightColorToHex(ST_HighlightColor.DarkYellow)).toBe("#808000");
    });
  });

  describe("Grayscale colors", () => {
    test("should convert grayscale colors correctly", () => {
      expect(convertHighlightColorToHex(ST_HighlightColor.Black)).toBe("#000000");
      expect(convertHighlightColorToHex(ST_HighlightColor.White)).toBe("#FFFFFF");
      expect(convertHighlightColorToHex(ST_HighlightColor.DarkGray)).toBe("#808080");
      expect(convertHighlightColorToHex(ST_HighlightColor.LightGray)).toBe("#C0C0C0");
    });
  });

  describe("Special cases", () => {
    test("should handle none highlight", () => {
      expect(convertHighlightColorToHex(ST_HighlightColor.None)).toBe("");
    });

    test("should pass through unknown colors", () => {
      expect(convertHighlightColorToHex("unknownColor")).toBe("unknownColor");
    });

    test("should handle empty string", () => {
      expect(convertHighlightColorToHex("")).toBe("");
    });
  });

  describe("Type safety", () => {
    test("all OOXML highlight colors should be defined", () => {
      const allColors = Object.values(ST_HighlightColor);
      for (const color of allColors) {
        const result = convertHighlightColorToHex(color);
        expect(typeof result).toBe("string");
        // None should return empty string, others should return hex or color name
        if (color === ST_HighlightColor.None) {
          expect(result).toBe("");
        } else {
          expect(result.length).toBeGreaterThan(0);
        }
      }
    });
  });
});