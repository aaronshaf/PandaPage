import { describe, test, expect } from "bun:test";
import { fieldToMarkdown, FieldCode, type DocxField } from "./form-field-parser";

describe("Form Field Parser - Additional Coverage", () => {
  describe("fieldToMarkdown - fallback cases", () => {
    test("should handle NUMPAGES without result", () => {
      const field: DocxField = {
        type: FieldCode.NUMPAGES,
        instruction: "NUMPAGES",
      };
      
      const result = fieldToMarkdown(field);
      expect(result).toBe("[Total Pages]");
    });

    test("should handle TIME without result", () => {
      const field: DocxField = {
        type: FieldCode.TIME,
        instruction: "TIME",
      };
      
      const result = fieldToMarkdown(field);
      // Check it returns a time string (format may vary)
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    test("should handle FILENAME without result", () => {
      const field: DocxField = {
        type: FieldCode.FILENAME,
        instruction: "FILENAME",
      };
      
      const result = fieldToMarkdown(field);
      expect(result).toBe("[Filename]");
    });

    test("should handle AUTHOR without result", () => {
      const field: DocxField = {
        type: FieldCode.AUTHOR,
        instruction: "AUTHOR",
      };
      
      const result = fieldToMarkdown(field);
      expect(result).toBe("[Author]");
    });

    test("should handle TITLE without result", () => {
      const field: DocxField = {
        type: FieldCode.TITLE,
        instruction: "TITLE",
      };
      
      const result = fieldToMarkdown(field);
      expect(result).toBe("[Title]");
    });

    test("should handle HYPERLINK with only URL", () => {
      const field: DocxField = {
        type: FieldCode.HYPERLINK,
        instruction: 'HYPERLINK "https://example.com"',
        properties: { url: "https://example.com" },
      };
      
      const result = fieldToMarkdown(field);
      expect(result).toBe("https://example.com");
    });

    test("should handle HYPERLINK without URL or result", () => {
      const field: DocxField = {
        type: FieldCode.HYPERLINK,
        instruction: "HYPERLINK",
        properties: {},
      };
      
      const result = fieldToMarkdown(field);
      expect(result).toBe("[Link]");
    });

    test("should handle REF without result", () => {
      const field: DocxField = {
        type: FieldCode.REF,
        instruction: "REF bookmark1",
      };
      
      const result = fieldToMarkdown(field);
      expect(result).toBe("[Reference: REF bookmark1]");
    });

    test("should handle TOC field", () => {
      const field: DocxField = {
        type: FieldCode.TOC,
        instruction: "TOC \\o \"1-3\"",
      };
      
      const result = fieldToMarkdown(field);
      expect(result).toBe("");
    });
  });
});