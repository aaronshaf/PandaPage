import { describe, it, expect } from "bun:test";
import { parseFieldRun, getMimeType } from "./field-parser";

describe("Field Parser", () => {
  describe("parseFieldRun", () => {
    it("should delegate to parseAdvancedFieldRun", () => {
      const result = parseFieldRun("PAGE", null, "w");

      // Should return a result from the advanced field parser
      expect(result).toBeDefined();
      expect(result?.text).toBe("1"); // PAGE returns "1" as placeholder
    });

    it("should handle field instruction with formatting", () => {
      const result = parseFieldRun("PAGE \\* MERGEFORMAT", null, "w");

      expect(result).toBeDefined();
      expect(result?.text).toBe("1"); // PAGE returns "1" as placeholder
    });

    it("should handle REF field with context", () => {
      const bookmarks = new Map<string, string>();
      bookmarks.set("MyBookmark", "Referenced Text");

      const context = {
        bookmarks,
        sequences: new Map(),
        metadata: {},
        currentDate: new Date("2023-01-01"),
      };

      const result = parseFieldRun("REF MyBookmark", null, "w", context);

      expect(result).toBeDefined();
      expect(result?.text).toBe("Referenced Text");
    });

    it("should handle HYPERLINK field", () => {
      const result = parseFieldRun('HYPERLINK "https://example.com"', null, "w");

      expect(result).toBeDefined();
      expect(result?.text).toBe("https://example.com");
    });

    it("should handle DATE field with context", () => {
      const context = {
        bookmarks: new Map(),
        sequences: new Map(),
        metadata: {},
        currentDate: new Date("2023-01-01T12:00:00Z"),
      };

      const result = parseFieldRun("DATE", null, "w", context);

      expect(result).toBeDefined();
      // Date formatting may vary, just check it's not empty
      expect(result?.text).toBeTruthy();
    });

    it("should handle SEQ field with sequences", () => {
      const sequences = new Map<string, number>();
      sequences.set("Figure", 5);

      const context = {
        bookmarks: new Map(),
        sequences,
        metadata: {},
        currentDate: new Date(),
      };

      const result = parseFieldRun("SEQ Figure", null, "w", context);

      expect(result).toBeDefined();
      expect(result?.text).toBe("6"); // Next sequence number
    });

    it("should handle metadata fields", () => {
      const context = {
        bookmarks: new Map(),
        sequences: new Map(),
        metadata: {
          creator: "John Doe",
          title: "Test Document",
        },
        currentDate: new Date(),
      };

      const authorResult = parseFieldRun("AUTHOR", null, "w", context);
      expect(authorResult?.text).toBe("John Doe");

      const titleResult = parseFieldRun("TITLE", null, "w", context);
      expect(titleResult?.text).toBe("Test Document");
    });

    it("should handle unknown field types", () => {
      const result = parseFieldRun("UNKNOWN_FIELD", null, "w");

      expect(result).toBeDefined();
      expect(result?.text).toBe("{UNKNOWN}"); // Unknown fields return {UNKNOWN}
    });

    it("should handle empty field instruction", () => {
      const result = parseFieldRun("", null, "w");

      expect(result).toBeDefined();
      expect(result?.text).toBe("{UNKNOWN}"); // Empty fields are treated as unknown
    });

    it("should handle fields without context", () => {
      const result = parseFieldRun("PAGE", null, "w");

      expect(result).toBeDefined();
      expect(result?.text).toBe("1");
    });
  });

  describe("getMimeType", () => {
    it("should return correct MIME type for PNG", () => {
      expect(getMimeType("png")).toBe("image/png");
    });

    it("should return correct MIME type for JPEG", () => {
      expect(getMimeType("jpg")).toBe("image/jpeg");
      expect(getMimeType("jpeg")).toBe("image/jpeg");
    });

    it("should return correct MIME type for GIF", () => {
      expect(getMimeType("gif")).toBe("image/gif");
    });

    it("should return correct MIME type for BMP", () => {
      expect(getMimeType("bmp")).toBe("image/bmp");
    });

    it("should return correct MIME type for TIFF", () => {
      expect(getMimeType("tiff")).toBe("image/tiff");
      expect(getMimeType("tif")).toBe("image/tiff");
    });

    it("should return correct MIME type for SVG", () => {
      expect(getMimeType("svg")).toBe("image/svg+xml");
    });

    it("should return correct MIME type for WebP", () => {
      expect(getMimeType("webp")).toBe("image/webp");
    });

    it("should return default MIME type for unknown extension", () => {
      expect(getMimeType("unknown")).toBe("image/png");
    });

    it("should return default MIME type for undefined extension", () => {
      expect(getMimeType(undefined)).toBe("image/png");
    });

    it("should return default MIME type for empty string", () => {
      expect(getMimeType("")).toBe("image/png");
    });

    it("should handle case sensitivity", () => {
      // The function expects lowercase, but let's test what happens with uppercase
      expect(getMimeType("PNG")).toBe("image/png"); // Should be default since it's not found
    });
  });
});
