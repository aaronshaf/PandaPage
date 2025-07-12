import { describe, it, expect } from "bun:test";
import {
  validateNumeric,
  validateColor,
  validateCSSValue,
  validateBorderStyle,
  escapeCSSString,
} from "./css-validation";

describe("CSS Validation", () => {
  describe("validateNumeric", () => {
    it("should validate numeric values within bounds", () => {
      expect(validateNumeric(5, 0, 10, 0)).toBe(5);
      expect(validateNumeric(15, 0, 10, 0)).toBe(10);
      expect(validateNumeric(-5, 0, 10, 0)).toBe(0);
    });

    it("should handle string inputs", () => {
      expect(validateNumeric("5.5", 0, 10, 0)).toBe(5.5);
      expect(validateNumeric("invalid", 0, 10, 3)).toBe(3);
    });

    it("should use default for undefined/null", () => {
      expect(validateNumeric(undefined, 0, 10, 7)).toBe(7);
      expect(validateNumeric(null as any, 0, 10, 7)).toBe(7);
    });

    it("should handle NaN and Infinity", () => {
      expect(validateNumeric(NaN, 0, 10, 5)).toBe(5);
      expect(validateNumeric(Infinity, 0, 10, 5)).toBe(5);
    });
  });

  describe("validateColor", () => {
    it("should validate hex colors", () => {
      expect(validateColor("#123456")).toBe("#123456");
      expect(validateColor("#abc")).toBe("#abc");
      expect(validateColor("#ABCDEF")).toBe("#ABCDEF");
    });

    it("should validate rgb colors", () => {
      expect(validateColor("rgb(255, 0, 0)")).toBe("rgb(255, 0, 0)");
      expect(validateColor("rgb(0,128,255)")).toBe("rgb(0,128,255)");
    });

    it("should validate rgba colors", () => {
      expect(validateColor("rgba(255, 0, 0, 0.5)")).toBe("rgba(255, 0, 0, 0.5)");
      expect(validateColor("rgba(0,0,0,1)")).toBe("rgba(0,0,0,1)");
    });

    it("should validate named colors", () => {
      expect(validateColor("red")).toBe("red");
      expect(validateColor("transparent")).toBe("transparent");
      expect(validateColor("BLACK")).toBe("BLACK");
    });

    it("should sanitize invalid colors", () => {
      expect(validateColor("javascript:alert('xss')")).toBe("");
      expect(validateColor("#xyz123")).toBe("");
      expect(validateColor("rgb(256, 0, 0)")).toBe(""); // Invalid RGB value
    });

    it("should handle empty/undefined", () => {
      expect(validateColor("")).toBe("");
      expect(validateColor(undefined)).toBe("");
    });
  });

  describe("validateCSSValue", () => {
    it("should validate values with units", () => {
      expect(validateCSSValue("10px")).toBe("10px");
      expect(validateCSSValue("2.5em")).toBe("2.5em");
      expect(validateCSSValue("100%")).toBe("100%");
      expect(validateCSSValue("50vw")).toBe("50vw");
    });

    it("should handle numeric values as pixels", () => {
      expect(validateCSSValue(10)).toBe("10px");
      expect(validateCSSValue(0)).toBe("");
      expect(validateCSSValue(-5)).toBe("");
    });

    it("should validate bounds for percentages", () => {
      expect(validateCSSValue("150%")).toBe("100%");
      expect(validateCSSValue("-10%")).toBe("");
    });

    it("should reject invalid units", () => {
      expect(validateCSSValue("10foo")).toBe("");
      expect(validateCSSValue("10 px")).toBe("10px"); // Should handle space
    });

    it("should handle malformed values", () => {
      expect(validateCSSValue("abc")).toBe("");
      expect(validateCSSValue("10px20")).toBe("");
    });
  });

  describe("validateBorderStyle", () => {
    it("should validate border styles", () => {
      expect(validateBorderStyle("solid")).toBe("solid");
      expect(validateBorderStyle("dashed")).toBe("dashed");
      expect(validateBorderStyle("DOUBLE")).toBe("double");
    });

    it("should default to solid for invalid styles", () => {
      expect(validateBorderStyle("invalid")).toBe("solid");
      expect(validateBorderStyle("")).toBe("solid");
      expect(validateBorderStyle(undefined)).toBe("solid");
    });
  });

  describe("escapeCSSString", () => {
    it("should escape special characters", () => {
      expect(escapeCSSString('test"value')).toBe('test\\"value');
      expect(escapeCSSString("test'value")).toBe("test\\'value");
      expect(escapeCSSString("test\\value")).toBe("test\\\\value");
    });

    it("should escape newlines and tabs", () => {
      expect(escapeCSSString("test\nvalue")).toBe("test\\nvalue");
      expect(escapeCSSString("test\rvalue")).toBe("test\\rvalue");
      expect(escapeCSSString("test\tvalue")).toBe("test\\tvalue");
    });

    it("should handle multiple escapes", () => {
      expect(escapeCSSString('\\test"value\n')).toBe('\\\\test\\"value\\n');
    });
  });
});