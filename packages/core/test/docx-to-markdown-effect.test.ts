import { describe, test, expect, beforeAll } from "bun:test";
import { Effect } from "effect";
import { docxToMarkdown, docxToMarkdownWithMetadata } from "../src/formats/docx/docx-to-markdown";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  const window = new Window();
  (global as any).DOMParser = window.DOMParser;
  (global as any).Document = window.Document;
  (global as any).Element = window.Element;
  (global as any).Node = window.Node;
});

describe("docx-to-markdown Effect-based functions", () => {
  describe("Effect-based functions", () => {
    test("docxToMarkdown should handle valid buffer", async () => {
      // Create a mock valid DOCX buffer
      const { zipSync, strToU8 } = require("fflate");
      const files = {
        "[Content_Types].xml": strToU8('<?xml version="1.0"?>...'),
        "word/document.xml": strToU8(`<?xml version="1.0"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
                <w:r><w:t>Test Heading</w:t></w:r>
              </w:p>
            </w:body>
          </w:document>`)
      };
      const buffer = zipSync(files).buffer;

      const result = await Effect.runPromise(docxToMarkdown(buffer));
      
      expect(result).toContain("# Test Heading");
    });

    test.skip("docxToMarkdownWithMetadata should include frontmatter", async () => {
      // Create a mock DOCX with metadata
      const { zipSync, strToU8 } = require("fflate");
      const files = {
        "[Content_Types].xml": strToU8('<?xml version="1.0"?>...'),
        "word/document.xml": strToU8(`<?xml version="1.0"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r><w:t>Content</w:t></w:r>
              </w:p>
            </w:body>
          </w:document>`),
        "docProps/core.xml": strToU8(`<?xml version="1.0"?>
          <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">
            <dc:title>Test Title</dc:title>
            <dc:creator>Test Author</dc:creator>
          </cp:coreProperties>`)
      };
      const buffer = zipSync(files).buffer;

      const result = await Effect.runPromise(docxToMarkdownWithMetadata(buffer));
      
      expect(result).toContain("---");
      expect(result).toContain('title: "Test Title"');
      expect(result).toContain('author: "Test Author"');
      expect(result).toContain("Content");
    });

    test("docxToMarkdown should handle invalid buffer", async () => {
      const invalidBuffer = new ArrayBuffer(100);
      
      try {
        await Effect.runPromise(docxToMarkdown(invalidBuffer));
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain("Failed to read DOCX");
      }
    });

    test("docxToMarkdown should handle empty buffer", async () => {
      const emptyBuffer = new ArrayBuffer(0);
      
      try {
        await Effect.runPromise(docxToMarkdown(emptyBuffer));
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain("Failed to read DOCX");
      }
    });
  });
});