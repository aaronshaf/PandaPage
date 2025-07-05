import { test, expect } from "bun:test";
import { Effect } from "effect";
import { readDocx, DocxParseError } from "../../src/formats/docx/docx-reader";
import { convertDocxToMarkdown } from "../../src/formats/docx/docx-to-markdown";

// Pure function tests for DOCX parsing (no browser APIs needed)
  test("convertDocxToMarkdown handles empty document", () => {
    const emptyDoc = {
      paragraphs: [],
      numbering: undefined
    };
    
    const result = convertDocxToMarkdown(emptyDoc);
    expect(result).toBe("");
  });

  test("convertDocxToMarkdown formats headings correctly", () => {
    const doc = {
      paragraphs: [
        {
          type: "paragraph" as const,
          style: "Heading 1",
          runs: [{ text: "Main Title" }]
        },
        {
          type: "paragraph" as const,
          style: "Heading 2",
          runs: [{ text: "Subtitle" }]
        }
      ],
      numbering: undefined
    };
    
    const result = convertDocxToMarkdown(doc);
    expect(result).toBe("# Main Title\n\n## Subtitle");
  });

  test("convertDocxToMarkdown handles text formatting", () => {
    const doc = {
      paragraphs: [
        {
          type: "paragraph" as const,
          runs: [
            { text: "Normal " },
            { text: "italic", italic: true },
            { text: " and " },
            { text: "bold", bold: true }
          ]
        }
      ],
      numbering: undefined
    };
    
    const result = convertDocxToMarkdown(doc);
    expect(result).toBe("Normal _italic_ and bold");
  });

  test("convertDocxToMarkdown formats bullet lists", () => {
    const doc = {
      paragraphs: [
        {
          type: "paragraph" as const,
          runs: [{ text: "Item 1" }],
          numId: "1",
          ilvl: 0
        },
        {
          type: "paragraph" as const,
          runs: [{ text: "Item 2" }],
          numId: "1",
          ilvl: 0
        }
      ],
      numbering: {
        instances: new Map([["1", "0"]]),
        abstractFormats: new Map([
          ["0", {
            levels: new Map([
              [0, { numFmt: "bullet", lvlText: "•" }]
            ])
          }]
        ])
      }
    };
    
    const result = convertDocxToMarkdown(doc);
    expect(result).toBe("- Item 1\n- Item 2");
  });

  test("convertDocxToMarkdown formats numbered lists", () => {
    const doc = {
      paragraphs: [
        {
          type: "paragraph" as const,
          runs: [{ text: "First" }],
          numId: "1",
          ilvl: 0
        },
        {
          type: "paragraph" as const,
          runs: [{ text: "Second" }],
          numId: "1",
          ilvl: 0
        }
      ],
      numbering: {
        instances: new Map([["1", "0"]]),
        abstractFormats: new Map([
          ["0", {
            levels: new Map([
              [0, { numFmt: "decimal", lvlText: "%1." }]
            ])
          }]
        ])
      }
    };
    
    const result = convertDocxToMarkdown(doc);
    expect(result).toBe("1. First\n2. Second");
  });

  test("convertDocxToMarkdown handles nested lists", () => {
    const doc = {
      paragraphs: [
        {
          type: "paragraph" as const,
          runs: [{ text: "Parent" }],
          numId: "1",
          ilvl: 0
        },
        {
          type: "paragraph" as const,
          runs: [{ text: "Child" }],
          numId: "1",
          ilvl: 1
        }
      ],
      numbering: {
        instances: new Map([["1", "0"]]),
        abstractFormats: new Map([
          ["0", {
            levels: new Map([
              [0, { numFmt: "bullet", lvlText: "•" }],
              [1, { numFmt: "bullet", lvlText: "•" }]
            ])
          }]
        ])
      }
    };
    
    const result = convertDocxToMarkdown(doc);
    expect(result).toBe("- Parent\n  - Child");
  });

  test("readDocx returns error for invalid buffer", async () => {
    const invalidBuffer = new ArrayBuffer(10);
    const result = await Effect.runPromise(
      Effect.either(readDocx(invalidBuffer))
    );
    
    expect(result._tag).toBe("Left");
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(DocxParseError);
    }
  });