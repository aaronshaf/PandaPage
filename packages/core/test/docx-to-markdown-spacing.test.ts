import { describe, test, expect, beforeAll } from "bun:test";
import {
  convertDocxToMarkdown,
  convertEnhancedDocxToMarkdown,
} from "../src/formats/docx/docx-to-markdown";
import type { DocxDocument } from "../src/formats/docx/docx-reader";
import type { EnhancedDocxDocument, DocxElement } from "../src/formats/docx/docx-reader-enhanced";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  const window = new Window();
  (global as any).DOMParser = window.DOMParser;
  (global as any).Document = window.Document;
  (global as any).Element = window.Element;
  (global as any).Node = window.Node;
});

describe("docx-to-markdown spacing and formatting", () => {
  describe("spacing and formatting", () => {
    test("should add proper spacing between elements", () => {
      const elements: DocxElement[] = [
        {
          type: "paragraph",
          style: "Heading1",
          runs: [{ text: "Heading" }],
        },
        {
          type: "paragraph",
          runs: [{ text: "Paragraph after heading" }],
        },
        {
          type: "paragraph",
          runs: [{ text: "Another paragraph" }],
        },
        {
          type: "table",
          rows: [
            {
              cells: [{ content: [{ type: "paragraph", runs: [{ text: "Table" }] }] }],
            },
          ],
        },
        {
          type: "paragraph",
          runs: [{ text: "After table" }],
        },
      ];

      const doc: EnhancedDocxDocument = {
        elements,
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
      const lines = result.split("\n");

      // Check spacing after heading
      const headingIndex = lines.findIndex((l) => l === "# Heading");
      expect(lines[headingIndex + 1]).toBe("");

      // Check spacing between paragraphs
      const para1Index = lines.findIndex((l) => l === "Paragraph after heading");
      const para2Index = lines.findIndex((l) => l === "Another paragraph");
      expect(para2Index - para1Index).toBe(2); // One empty line between

      // Check spacing after table
      const tableIndex = lines.findIndex((l) => l.includes("| Table |"));
      const afterTableIndex = lines.findIndex((l) => l === "After table");
      expect(lines[tableIndex + 2]).toBe(""); // Empty line after table
    });

    test("should remove trailing empty lines", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "Last paragraph" }],
          },
        ],
        numbering: undefined,
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe("Last paragraph");
      expect(result).not.toEndWith("\n");
    });

    test("should handle empty paragraphs", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "First" }],
          },
          {
            type: "paragraph",
            runs: [],
          },
          {
            type: "paragraph",
            runs: [{ text: "Third" }],
          },
        ],
        numbering: undefined,
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe("First\nThird");
    });

    test("should handle paragraphs with only whitespace", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "First" }],
          },
          {
            type: "paragraph",
            runs: [{ text: "   " }],
          },
          {
            type: "paragraph",
            runs: [{ text: "Third" }],
          },
        ],
        numbering: undefined,
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe("First\n   \nThird");
    });

    test("should maintain proper spacing with lists", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "Before list" }],
          },
          {
            type: "paragraph",
            runs: [{ text: "Item 1" }],
            numId: "1",
            ilvl: 0,
          },
          {
            type: "paragraph",
            runs: [{ text: "Item 2" }],
            numId: "1",
            ilvl: 0,
          },
          {
            type: "paragraph",
            runs: [{ text: "After list" }],
          },
        ],
        numbering: {
          instances: new Map([["1", "0"]]),
          abstractFormats: new Map([
            ["0", { levels: new Map([[0, { numFmt: "bullet", lvlText: "•" }]]) }],
          ]),
        },
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe("Before list\n- Item 1\n- Item 2\nAfter list");
    });

    test("should handle spacing between different heading levels", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            style: "Heading1",
            runs: [{ text: "Chapter" }],
          },
          {
            type: "paragraph",
            style: "Heading2",
            runs: [{ text: "Section" }],
          },
          {
            type: "paragraph",
            style: "Heading3",
            runs: [{ text: "Subsection" }],
          },
        ],
        numbering: undefined,
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe("# Chapter\n\n## Section\n\n### Subsection");
    });
  });
});
