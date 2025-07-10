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

describe("docx-to-markdown paragraph styles", () => {
  describe("paragraph styles", () => {
    test("should handle all heading styles", () => {
      const styles = [
        { style: "Title", expected: "# " },
        { style: "Subtitle", expected: "## " },
        { style: "Author", expected: "**", suffix: "**" },
        { style: "Heading", expected: "# " },
        { style: "Heading1", expected: "# " },
        { style: "Heading 1", expected: "# " },
        { style: "Heading2", expected: "## " },
        { style: "Heading 2", expected: "## " },
        { style: "Heading3", expected: "### " },
        { style: "Heading 3", expected: "### " },
        { style: "Heading4", expected: "#### " },
        { style: "Heading 4", expected: "#### " },
        { style: "Heading5", expected: "##### " },
        { style: "Heading 5", expected: "##### " },
        { style: "Heading6", expected: "###### " },
        { style: "Heading 6", expected: "###### " }
      ];

      styles.forEach(({ style, expected, suffix = "" }) => {
        const doc: DocxDocument = {
          paragraphs: [{
            type: "paragraph",
            style,
            runs: [{ text: "Heading Text" }]
          }],
          numbering: undefined
        };

        const result = convertDocxToMarkdown(doc);
        expect(result).toBe(`${expected}Heading Text${suffix}`);
      });
    });

    test("should handle normal paragraph style", () => {
      const doc: DocxDocument = {
        paragraphs: [{
          type: "paragraph",
          style: "Normal",
          runs: [{ text: "Normal paragraph text" }]
        }],
        numbering: undefined
      };

      const result = convertDocxToMarkdown(doc);
      
      expect(result).toBe("Normal paragraph text");
    });

    test("should handle undefined style", () => {
      const doc: DocxDocument = {
        paragraphs: [{
          type: "paragraph",
          runs: [{ text: "No style paragraph" }]
        }],
        numbering: undefined
      };

      const result = convertDocxToMarkdown(doc);
      
      expect(result).toBe("No style paragraph");
    });

    test("should handle quote style", () => {
      const doc: DocxDocument = {
        paragraphs: [{
          type: "paragraph",
          style: "Quote",
          runs: [{ text: "This is a quote" }]
        }],
        numbering: undefined
      };

      const result = convertDocxToMarkdown(doc);
      
      // Quote style is not currently handled, falls back to plain text
      expect(result).toBe("This is a quote");
    });

    test("should handle intense quote style", () => {
      const doc: DocxDocument = {
        paragraphs: [{
          type: "paragraph",
          style: "IntenseQuote",
          runs: [{ text: "This is an intense quote" }]
        }],
        numbering: undefined
      };

      const result = convertDocxToMarkdown(doc);
      
      // IntenseQuote style is not currently handled, falls back to plain text
      expect(result).toBe("This is an intense quote");
    });

    test("should handle caption style", () => {
      const doc: DocxDocument = {
        paragraphs: [{
          type: "paragraph",
          style: "Caption",
          runs: [{ text: "Figure 1: Sample caption" }]
        }],
        numbering: undefined
      };

      const result = convertDocxToMarkdown(doc);
      
      // Caption style is not currently handled, falls back to plain text
      expect(result).toBe("Figure 1: Sample caption");
    });

    test("should handle multiple paragraphs with different styles", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            style: "Heading1",
            runs: [{ text: "Main Title" }]
          },
          {
            type: "paragraph",
            style: "Heading2",
            runs: [{ text: "Subtitle" }]
          },
          {
            type: "paragraph",
            runs: [{ text: "Regular paragraph" }]
          },
          {
            type: "paragraph",
            style: "Quote",
            runs: [{ text: "A quoted text" }]
          }
        ],
        numbering: undefined
      };

      const result = convertDocxToMarkdown(doc);
      const lines = result.split("\n");
      
      expect(lines[0]).toBe("# Main Title");
      expect(lines[1]).toBe(""); // Empty line after heading
      expect(lines[2]).toBe("## Subtitle");
      expect(lines[3]).toBe(""); // Empty line after heading
      expect(lines[4]).toBe("Regular paragraph");
      expect(lines[5]).toBe("A quoted text"); // Quote style not handled
    });
  });
});