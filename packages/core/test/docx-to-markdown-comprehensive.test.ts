import { describe, test, expect, beforeAll } from "bun:test";
import {
  convertDocxToMarkdown,
  convertEnhancedDocxToMarkdown,
} from "../src/formats/docx/docx-to-markdown";
import type { DocxDocument } from "../src/formats/docx/docx-reader";
import type { EnhancedDocxDocument } from "../src/formats/docx/docx-reader-enhanced";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  const window = new Window();
  (global as any).DOMParser = window.DOMParser;
  (global as any).Document = window.Document;
  (global as any).Element = window.Element;
  (global as any).Node = window.Node;
});

describe("docx-to-markdown comprehensive tests", () => {
  describe("basic document conversion", () => {
    test("should convert simple document", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "Hello World" }],
          },
        ],
        numbering: undefined,
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe("Hello World");
    });

    test("should handle empty document", () => {
      const doc: DocxDocument = {
        paragraphs: [],
        numbering: undefined,
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe("");
    });

    test("should convert multiple paragraphs", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "First paragraph" }],
          },
          {
            type: "paragraph",
            runs: [{ text: "Second paragraph" }],
          },
        ],
        numbering: undefined,
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe("First paragraph\nSecond paragraph");
    });
  });

  describe("convertEnhancedDocxToMarkdown", () => {
    test("should convert document with paragraphs and tables", () => {
      const doc: EnhancedDocxDocument = {
        elements: [
          {
            type: "paragraph",
            style: "Heading1",
            runs: [{ text: "Chapter 1" }],
          },
          {
            type: "paragraph",
            runs: [{ text: "This is a paragraph." }],
          },
          {
            type: "table",
            rows: [
              {
                cells: [
                  { content: [{ type: "paragraph", runs: [{ text: "Header 1" }] }] },
                  { content: [{ type: "paragraph", runs: [{ text: "Header 2" }] }] },
                ],
              },
              {
                cells: [
                  { content: [{ type: "paragraph", runs: [{ text: "Cell 1" }] }] },
                  { content: [{ type: "paragraph", runs: [{ text: "Cell 2" }] }] },
                ],
              },
            ],
          },
          {
            type: "paragraph",
            runs: [{ text: "After table paragraph." }],
          },
        ],
        metadata: {
          title: "Test",
          extractedAt: new Date(),
          originalFormat: "docx" as const,
        },
        numbering: undefined,
        processingTime: 100,
        extractedAt: new Date(),
        originalFormat: "docx",
      };

      const result = convertEnhancedDocxToMarkdown(doc);

      expect(result).toContain("# Chapter 1");
      expect(result).toContain("This is a paragraph.");
      expect(result).toContain("| Header 1 | Header 2 |");
      expect(result).toContain("| --- | --- |");
      expect(result).toContain("| Cell 1 | Cell 2 |");
      expect(result).toContain("After table paragraph.");
    });

    test("should handle enhanced document with only paragraphs", () => {
      const doc: EnhancedDocxDocument = {
        elements: [
          {
            type: "paragraph",
            runs: [{ text: "Simple paragraph" }],
          },
        ],
        metadata: {
          extractedAt: new Date(),
          originalFormat: "docx" as const,
        },
        numbering: undefined,
        processingTime: 100,
        extractedAt: new Date(),
        originalFormat: "docx",
      };

      const result = convertEnhancedDocxToMarkdown(doc);

      expect(result).toBe("Simple paragraph");
    });

    test("should handle document with metadata and content", () => {
      const doc: EnhancedDocxDocument = {
        elements: [
          {
            type: "paragraph",
            style: "Title",
            runs: [{ text: "Document Title" }],
          },
          {
            type: "paragraph",
            runs: [{ text: "Document content here." }],
          },
        ],
        metadata: {
          title: "My Document",
          creator: "John Doe",
          extractedAt: new Date(),
          originalFormat: "docx" as const,
        },
        numbering: undefined,
        processingTime: 100,
        extractedAt: new Date(),
        originalFormat: "docx",
      };

      const result = convertEnhancedDocxToMarkdown(doc);

      // Check frontmatter
      expect(result).toContain("---");
      expect(result).toContain('title: "My Document"');
      expect(result).toContain('author: "John Doe"');

      // Check content
      expect(result).toContain("# Document Title");
      expect(result).toContain("Document content here.");
    });
  });
});
