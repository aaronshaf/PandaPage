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

describe("docx-to-markdown list formatting", () => {
  describe("list formatting edge cases", () => {
    test("should handle upper and lower letter lists", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "Upper letter item" }],
            numId: "1",
            ilvl: 0,
          },
          {
            type: "paragraph",
            runs: [{ text: "Lower letter item" }],
            numId: "2",
            ilvl: 0,
          },
        ],
        numbering: {
          instances: new Map([
            ["1", "0"],
            ["2", "1"],
          ]),
          abstractFormats: new Map([
            ["0", { levels: new Map([[0, { numFmt: "upperLetter", lvlText: "%1." }]]) }],
            ["1", { levels: new Map([[0, { numFmt: "lowerLetter", lvlText: "%1." }]]) }],
          ]),
        },
      };

      const result = convertDocxToMarkdown(doc);

      // Letter lists are converted to numbered lists for markdown compatibility
      expect(result).toBe("1. Upper letter item\n1. Lower letter item");
    });

    test("should handle deeply nested lists", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "Level 0" }],
            numId: "1",
            ilvl: 0,
          },
          {
            type: "paragraph",
            runs: [{ text: "Level 1" }],
            numId: "1",
            ilvl: 1,
          },
          {
            type: "paragraph",
            runs: [{ text: "Level 2" }],
            numId: "1",
            ilvl: 2,
          },
        ],
        numbering: {
          instances: new Map([["1", "0"]]),
          abstractFormats: new Map([
            [
              "0",
              {
                levels: new Map([
                  [0, { numFmt: "bullet", lvlText: "•" }],
                  [1, { numFmt: "bullet", lvlText: "•" }],
                  [2, { numFmt: "bullet", lvlText: "•" }],
                ]),
              },
            ],
          ]),
        },
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe("- Level 0\n  - Level 1\n    - Level 2");
    });

    test("should track list counters correctly for numbered lists", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "First" }],
            numId: "1",
            ilvl: 0,
          },
          {
            type: "paragraph",
            runs: [{ text: "Second" }],
            numId: "1",
            ilvl: 0,
          },
          {
            type: "paragraph",
            runs: [{ text: "Non-list paragraph" }],
          },
          {
            type: "paragraph",
            runs: [{ text: "New list" }],
            numId: "2",
            ilvl: 0,
          },
        ],
        numbering: {
          instances: new Map([
            ["1", "0"],
            ["2", "0"],
          ]),
          abstractFormats: new Map([
            ["0", { levels: new Map([[0, { numFmt: "decimal", lvlText: "%1." }]]) }],
          ]),
        },
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toContain("1. First");
      expect(result).toContain("2. Second");
      expect(result).toContain("Non-list paragraph");
      expect(result).toContain("1. New list"); // New list starts at 1
    });

    test("should handle bullet lists", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "Bullet 1" }],
            numId: "1",
            ilvl: 0,
          },
          {
            type: "paragraph",
            runs: [{ text: "Bullet 2" }],
            numId: "1",
            ilvl: 0,
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

      expect(result).toBe("- Bullet 1\n- Bullet 2");
    });

    test("should handle mixed list types", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "Numbered item" }],
            numId: "1",
            ilvl: 0,
          },
          {
            type: "paragraph",
            runs: [{ text: "Bullet item" }],
            numId: "2",
            ilvl: 0,
          },
        ],
        numbering: {
          instances: new Map([
            ["1", "0"],
            ["2", "1"],
          ]),
          abstractFormats: new Map([
            ["0", { levels: new Map([[0, { numFmt: "decimal", lvlText: "%1." }]]) }],
            ["1", { levels: new Map([[0, { numFmt: "bullet", lvlText: "•" }]]) }],
          ]),
        },
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe("1. Numbered item\n- Bullet item");
    });

    test("should handle nested lists with different types", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "Bullet top" }],
            numId: "1",
            ilvl: 0,
          },
          {
            type: "paragraph",
            runs: [{ text: "Numbered sub" }],
            numId: "1",
            ilvl: 1,
          },
        ],
        numbering: {
          instances: new Map([["1", "0"]]),
          abstractFormats: new Map([
            [
              "0",
              {
                levels: new Map([
                  [0, { numFmt: "bullet", lvlText: "•" }],
                  [1, { numFmt: "decimal", lvlText: "%2." }],
                ]),
              },
            ],
          ]),
        },
      };

      const result = convertDocxToMarkdown(doc);

      expect(result).toBe("- Bullet top\n  1. Numbered sub");
    });
  });
});
