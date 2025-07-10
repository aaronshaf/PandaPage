import { describe, test, expect, beforeAll } from "bun:test";
import { convertDocxToMarkdown } from "../src/formats/docx/docx-to-markdown";
import type { DocxDocument } from "../src/formats/docx/docx-reader";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  const window = new Window();
  (global as any).DOMParser = window.DOMParser;
  (global as any).Document = window.Document;
  (global as any).Element = window.Element;
  (global as any).Node = window.Node;
});

describe("docx-to-markdown text formatting", () => {
  describe("formatRun with advanced formatting", () => {
    test("should handle underline formatting for short text", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "Short underlined text", underline: true }],
          },
        ],
        numbering: undefined,
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe("<u>Short underlined text</u>");
    });

    test("should ignore underline formatting for long text", () => {
      const longText =
        "This is a very long piece of text that exceeds the 50 character limit for underline formatting";
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: longText, underline: true }],
          },
        ],
        numbering: undefined,
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe(longText);
      expect(result).not.toContain("<u>");
    });

    test("should handle combined bold and italic formatting", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "Bold and italic", bold: true, italic: true }],
          },
        ],
        numbering: undefined,
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe("***Bold and italic***");
    });

    test("should convert tabs to spaces", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "Before\tAfter\tEnd" }],
          },
        ],
        numbering: undefined,
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe("Before    After    End");
    });

    test("should handle bold formatting", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "Bold text", bold: true }],
          },
        ],
        numbering: undefined,
      };

      const result = convertDocxToMarkdown(doc);

      // Bold formatting is currently disabled in formatRun function
      expect(result).toBe("Bold text");
    });

    test("should handle italic formatting", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "Italic text", italic: true }],
          },
        ],
        numbering: undefined,
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe("_Italic text_");
    });

    test("should handle mixed formatting in a paragraph", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [
              { text: "Normal " },
              { text: "bold", bold: true },
              { text: " and " },
              { text: "italic", italic: true },
              { text: " text" },
            ],
          },
        ],
        numbering: undefined,
      };

      const result = convertDocxToMarkdown(doc);

      // Bold formatting is currently disabled
      expect(result).toBe("Normal bold and _italic_ text");
    });
  });
});
