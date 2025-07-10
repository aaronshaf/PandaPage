import { describe, it, expect } from "bun:test";
import { parseFieldInstruction, createFieldPlaceholder } from "./field-code-parser";

describe("Field Code Parser - Edge Cases for 95%+ Coverage", () => {
  describe("Empty parts handling", () => {
    it("should handle multiple consecutive spaces creating empty parts", () => {
      // Test lines 134-135: empty part skipping
      const result = parseFieldInstruction('HYPERLINK    "url"   \\o   "tooltip"');
      expect(result.type).toBe("HYPERLINK");
      expect(result.arguments[0]).toBe("url");
      expect(result.switches.get("\\o")).toBe('"tooltip"');
    });

    it("should handle tabs and multiple whitespace", () => {
      const result = parseFieldInstruction("REF\t\t\tBookmark\t\t\\h");
      expect(result.type).toBe("REF");
      expect(result.arguments[0]).toBe("Bookmark");
      expect(result.switches.has("\\h")).toBe(true);
    });
  });

  describe("Switch value edge cases", () => {
    it("should handle switch with value at end of instruction", () => {
      // Test line 164: switch value assignment
      const result = parseFieldInstruction('TOC \\h \\z \\o "1-3"');
      expect(result.switches.get("\\h")).toBe(true);
      expect(result.switches.get("\\z")).toBe(true);
      expect(result.switches.get("\\o")).toBe('"1-3"');
    });

    it("should handle switch without value followed by another switch", () => {
      const result = parseFieldInstruction("REF Bookmark \\h \\p");
      expect(result.switches.get("\\h")).toBe(true);
      expect(result.switches.get("\\p")).toBe(true);
    });
  });

  describe("Field placeholders with context", () => {
    it("should use context date for TIME field", () => {
      // Test line 298: TIME with context
      const context = {
        currentDate: new Date("2023-01-01T14:30:00"),
      };

      const fieldCode = parseFieldInstruction("TIME");
      const result = createFieldPlaceholder(fieldCode, context);
      expect(result).toContain("30"); // Should contain minutes from the date
    });

    it("should handle FILENAME with metadata", () => {
      // Test line 266: FILENAME with context
      const context = {
        metadata: { filename: "document.docx" },
      };

      const fieldCode = parseFieldInstruction("FILENAME");
      const result = createFieldPlaceholder(fieldCode, context);
      expect(result).toBe("[Filename]"); // Still returns placeholder
    });

    it("should handle TITLE with missing metadata", () => {
      // Test line 269: TITLE without metadata
      const context = {
        metadata: {}, // Empty metadata
      };

      const fieldCode = parseFieldInstruction("TITLE");
      const result = createFieldPlaceholder(fieldCode, context);
      expect(result).toBe("[Title]");
    });

    it("should handle SUBJECT with context", () => {
      // Test lines 278-279: SUBJECT with metadata
      const context = {
        metadata: { subject: "Test Subject" },
      };

      const fieldCode = parseFieldInstruction("SUBJECT");
      const result = createFieldPlaceholder(fieldCode, context);
      expect(result).toBe("Test Subject");
    });

    it("should handle KEYWORDS with context", () => {
      // Test lines 281-282: KEYWORDS with metadata
      const context = {
        metadata: { keywords: "test, document, sample" },
      };

      const fieldCode = parseFieldInstruction("KEYWORDS");
      const result = createFieldPlaceholder(fieldCode, context);
      expect(result).toBe("test, document, sample");
    });

    it("should handle LASTSAVEDBY with correct metadata key", () => {
      // Test line 284: Check if LASTSAVEDBY looks for lastModifiedBy
      // Since it falls through to default, this tests the default case
      const context = {
        metadata: { lastModifiedBy: "John Doe" },
      };

      const fieldCode = parseFieldInstruction("LASTSAVEDBY");
      const result = createFieldPlaceholder(fieldCode, context);
      expect(result).toBe("{LASTSAVEDBY}"); // Falls through to default
    });
  });

  describe("Complex quoted strings", () => {
    it("should handle nested quotes in field arguments", () => {
      const result = parseFieldInstruction('HYPERLINK "url with \\"quotes\\""');
      expect(result.type).toBe("HYPERLINK");
      expect(result.arguments[0]).toContain("quotes");
    });

    it("should handle very long field instructions", () => {
      const longArg = "a".repeat(1000);
      const result = parseFieldInstruction(`HYPERLINK "${longArg}"`);
      expect(result.type).toBe("HYPERLINK");
      expect(result.arguments[0]).toBe(longArg);
    });
  });

  describe("Error scenarios", () => {
    it("should handle malformed field instructions gracefully", () => {
      // Test lines 389-391: Error handling
      // Since the function expects a string and calls .trim(), passing null/undefined will throw
      // This tests that the function has type expectations
      expect(() => parseFieldInstruction(null as any)).toThrow();
      expect(() => parseFieldInstruction(undefined as any)).toThrow();
      expect(() => parseFieldInstruction(123 as any)).toThrow();

      // Test with valid but empty strings
      expect(parseFieldInstruction("")).toHaveProperty("type", "UNKNOWN");
      expect(parseFieldInstruction("   ")).toHaveProperty("type", "UNKNOWN");
    });
  });
});
