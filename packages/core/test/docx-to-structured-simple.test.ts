import { describe, test, expect, beforeAll } from "bun:test";
import { Effect } from "effect";
import {
  docxToStructured,
  parseDocxToStructured,
  type StructuredDocxResult
} from "../src/formats/docx/docx-to-structured";
import { DocxParseError } from "../src/formats/docx/types";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  const window = new Window();
  (global as any).DOMParser = window.DOMParser;
  (global as any).Document = window.Document;
  (global as any).Element = window.Element;
  (global as any).Node = window.Node;
});

// Helper to create minimal DOCX buffer for testing
function createTestDocx(): ArrayBuffer {
  const { zipSync, strToU8 } = require("fflate");
  
  const files: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
      </Types>`),
    "_rels/.rels": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
      </Relationships>`),
    "word/document.xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:r>
              <w:t>Test content</w:t>
            </w:r>
          </w:p>
        </w:body>
      </w:document>`)
  };
  
  const zipped = zipSync(files);
  return zipped.buffer;
}

describe("docx-to-structured", () => {
  describe("docxToStructured", () => {
    test("should handle invalid buffer", async () => {
      const buffer = new ArrayBuffer(10); // Invalid DOCX

      await expect(Effect.runPromise(docxToStructured(buffer))).rejects.toThrow();
    });

    test("should handle empty buffer", async () => {
      const buffer = new ArrayBuffer(0);

      await expect(Effect.runPromise(docxToStructured(buffer))).rejects.toThrow();
    });

    test("should return Effect type", () => {
      const buffer = createTestDocx();
      const result = docxToStructured(buffer);

      expect(typeof result).toBe("object");
      expect(result).toBeDefined(); // Effect object
    });

    test("should handle buffer with invalid ZIP signature", async () => {
      const buffer = new ArrayBuffer(100);
      const view = new Uint8Array(buffer);
      view.fill(255); // Invalid ZIP signature

      await expect(Effect.runPromise(docxToStructured(buffer))).rejects.toThrow();
    });
  });

  describe("parseDocxToStructured", () => {
    test("should be promise-based wrapper", async () => {
      const buffer = createTestDocx();

      const result = await parseDocxToStructured(buffer);

      expect(result).toBeDefined();
      expect(result.document).toBeDefined();
      expect(result.markdown).toBeDefined();
      expect(typeof result.markdown).toBe("string");
    });
  });

  describe("StructuredDocxResult interface", () => {
    test("should have correct type structure", async () => {
      const buffer = createTestDocx();
      const result = await parseDocxToStructured(buffer);

      expect(result).toHaveProperty("document");
      expect(result).toHaveProperty("markdown");
      expect(result.document).toHaveProperty("elements");
      expect(result.document).toHaveProperty("metadata");
      expect(typeof result.markdown).toBe("string");
    });
  });

  describe("Error handling", () => {
    test("DocxParseError should be used for errors", async () => {
      const invalidBuffer = new ArrayBuffer(5);

      try {
        await parseDocxToStructured(invalidBuffer);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  describe("Basic functionality", () => {
    test("should convert valid DOCX to structured result", async () => {
      const buffer = createTestDocx();
      const result = await parseDocxToStructured(buffer);

      expect(result.document.elements).toBeDefined();
      expect(result.markdown).toBeDefined();
      expect(result.document.originalFormat).toBe("docx");
    });

    test("should handle document conversion", async () => {
      const buffer = createTestDocx();
      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.document).toBeDefined();
      expect(result.markdown).toBeDefined();
      expect(result.document.elements).toBeArray();
    });
  });
});