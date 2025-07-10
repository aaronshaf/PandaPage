import { describe, test, expect, beforeAll } from "bun:test";
import { convertEnhancedDocxToMarkdown } from "../src/formats/docx/docx-to-markdown";
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

describe("docx-to-markdown frontmatter generation", () => {
  describe("generateFrontmatter", () => {
    test("should generate complete frontmatter with all metadata fields", () => {
      const doc: EnhancedDocxDocument = {
        elements: [],
        metadata: {
          title: "Test Document",
          subject: "Testing",
          description: "A test document for unit tests",
          creator: "Test Author",
          keywords: ["test", "unit", "coverage"],
          language: "en-US",
          created: new Date("2024-01-01T00:00:00Z"),
          modified: new Date("2024-01-02T00:00:00Z"),
          pages: 10,
          words: 1000,
          characters: 5000,
          paragraphs: 50,
          application: "Microsoft Word",
          appVersion: "16.0",
          company: "Test Company",
          manager: "Test Manager",
          template: "Normal.dotm",
          outline: [
            { title: "Introduction", level: 1, style: "Heading1" },
            { title: "Chapter 1", level: 1, style: "Heading1" },
            { title: "Section 1.1", level: 2, style: "Heading2" },
          ],
          extractedAt: new Date(),
          originalFormat: "docx" as const,
        },
        numbering: undefined,
        processingTime: 100,
        extractedAt: new Date(),
        originalFormat: "docx",
      };

      const result = convertEnhancedDocxToMarkdown(doc);

      expect(result).toContain("---");
      expect(result).toContain('title: "Test Document"');
      expect(result).toContain('subject: "Testing"');
      expect(result).toContain('description: "A test document for unit tests"');
      expect(result).toContain('author: "Test Author"');
      expect(result).toContain('keywords: ["test", "unit", "coverage"]');
      expect(result).toContain('language: "en-US"');
      expect(result).toContain("created: 2024-01-01T00:00:00.000Z");
      expect(result).toContain("modified: 2024-01-02T00:00:00.000Z");
      expect(result).toContain("pages: 10");
      expect(result).toContain("words: 1000");
      expect(result).toContain("characters: 5000");
      expect(result).toContain("paragraphs: 50");
      expect(result).toContain('application: "Microsoft Word"');
      expect(result).toContain('app_version: "16.0"');
      expect(result).toContain('company: "Test Company"');
      expect(result).toContain('manager: "Test Manager"');
      expect(result).toContain('template: "Normal.dotm"');
      expect(result).toContain("outline:");
      expect(result).toContain('- title: "Introduction"');
      expect(result).toContain('  - title: "Section 1.1"');
    });

    test("should handle metadata with special characters", () => {
      const doc: EnhancedDocxDocument = {
        elements: [],
        metadata: {
          title: 'Title with "quotes" and\nnewlines',
          creator: 'Author with "special" chars',
          keywords: ['key"word', "new\nline"],
          extractedAt: new Date(),
          originalFormat: "docx" as const,
        },
        numbering: undefined,
        processingTime: 100,
        extractedAt: new Date(),
        originalFormat: "docx",
      };

      const result = convertEnhancedDocxToMarkdown(doc);

      expect(result).toContain('title: "Title with \\"quotes\\" and\\nnewlines"');
      expect(result).toContain('author: "Author with \\"special\\" chars"');
      expect(result).toContain('keywords: ["key\\"word", "new\\nline"]');
    });

    test("should handle empty metadata", () => {
      const doc: EnhancedDocxDocument = {
        elements: [],
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

      // Should not include frontmatter section if metadata is empty
      expect(result).not.toContain("---");
    });

    test("should handle partial metadata", () => {
      const doc: EnhancedDocxDocument = {
        elements: [],
        metadata: {
          title: "Only Title",
          pages: 5,
          extractedAt: new Date(),
          originalFormat: "docx" as const,
        },
        numbering: undefined,
        processingTime: 100,
        extractedAt: new Date(),
        originalFormat: "docx",
      };

      const result = convertEnhancedDocxToMarkdown(doc);

      expect(result).toContain("---");
      expect(result).toContain('title: "Only Title"');
      expect(result).toContain("pages: 5");
      expect(result).not.toContain("author:");
      expect(result).not.toContain("subject:");
    });
  });
});
