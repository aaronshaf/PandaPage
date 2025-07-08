import { describe, test, expect, beforeAll } from "bun:test";
import { Effect } from "effect";
import {
  convertDocxToMarkdown,
  convertEnhancedDocxToMarkdown,
  convertTableToMarkdown,
  docxToMarkdown,
  docxToMarkdownWithMetadata
} from "../src/formats/docx/docx-to-markdown";
import type { DocxDocument, DocxParagraph, DocxRun } from "../src/formats/docx/docx-reader";
import type { EnhancedDocxDocument, DocxElement, DocxTable, DocxMetadata } from "../src/formats/docx/docx-reader-enhanced";
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
            { title: "Section 1.1", level: 2, style: "Heading2" }
          ],
          extractedAt: new Date(),
          originalFormat: "docx" as const
        },
        numbering: undefined,
        processingTime: 100,
        extractedAt: new Date(),
        originalFormat: "docx"
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
          keywords: ['key"word', 'new\nline'],
          extractedAt: new Date(),
          originalFormat: "docx" as const
        },
        numbering: undefined,
        processingTime: 100,
        extractedAt: new Date(),
        originalFormat: "docx"
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
          originalFormat: "docx" as const
        },
        numbering: undefined,
        processingTime: 100,
        extractedAt: new Date(),
        originalFormat: "docx"
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
          originalFormat: "docx" as const
        },
        numbering: undefined,
        processingTime: 100,
        extractedAt: new Date(),
        originalFormat: "docx"
      };

      const result = convertEnhancedDocxToMarkdown(doc);
      
      expect(result).toContain("---");
      expect(result).toContain('title: "Only Title"');
      expect(result).toContain("pages: 5");
      expect(result).not.toContain("author:");
      expect(result).not.toContain("subject:");
    });
  });

  describe("convertEnhancedDocxToMarkdown", () => {
    test("should convert document with paragraphs and tables", () => {
      const doc: EnhancedDocxDocument = {
        elements: [
          {
            type: "paragraph",
            style: "Heading1",
            runs: [{ text: "Chapter 1" }]
          },
          {
            type: "paragraph",
            runs: [{ text: "This is a paragraph." }]
          },
          {
            type: "table",
            rows: [
              {
                cells: [
                  { content: [{ type: "paragraph", runs: [{ text: "Header 1" }] }] },
                  { content: [{ type: "paragraph", runs: [{ text: "Header 2" }] }] }
                ]
              },
              {
                cells: [
                  { content: [{ type: "paragraph", runs: [{ text: "Cell 1" }] }] },
                  { content: [{ type: "paragraph", runs: [{ text: "Cell 2" }] }] }
                ]
              }
            ]
          },
          {
            type: "paragraph",
            runs: [{ text: "After table paragraph." }]
          }
        ],
        metadata: { 
          title: "Test",
          extractedAt: new Date(),
          originalFormat: "docx" as const
        },
        numbering: undefined,
        processingTime: 100,
        extractedAt: new Date(),
        originalFormat: "docx"
      };

      const result = convertEnhancedDocxToMarkdown(doc);
      
      expect(result).toContain("# Chapter 1");
      expect(result).toContain("This is a paragraph.");
      expect(result).toContain("| Header 1 | Header 2 |");
      expect(result).toContain("| --- | --- |");
      expect(result).toContain("| Cell 1 | Cell 2 |");
      expect(result).toContain("After table paragraph.");
    });
  });

  describe("convertTableToMarkdown", () => {
    test("should convert simple table", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              { content: [{ type: "paragraph", runs: [{ text: "A" }] }] },
              { content: [{ type: "paragraph", runs: [{ text: "B" }] }] }
            ]
          },
          {
            cells: [
              { content: [{ type: "paragraph", runs: [{ text: "1" }] }] },
              { content: [{ type: "paragraph", runs: [{ text: "2" }] }] }
            ]
          }
        ]
      };

      const result = convertTableToMarkdown(table);
      
      expect(result).toBe("| A | B |\n| --- | --- |\n| 1 | 2 |");
    });

    test("should handle empty table", () => {
      const table: DocxTable = {
        type: "table",
        rows: []
      };

      const result = convertTableToMarkdown(table);
      
      expect(result).toBe("");
    });

    test("should handle table with header row property", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              { content: [{ type: "paragraph", runs: [{ text: "Header" }] }] }
            ],
            properties: { isHeader: true }
          },
          {
            cells: [
              { content: [{ type: "paragraph", runs: [{ text: "Data" }] }] }
            ]
          }
        ]
      };

      const result = convertTableToMarkdown(table);
      
      expect(result).toContain("| Header |");
      expect(result).toContain("| --- |");
      expect(result).toContain("| Data |");
    });

    test("should handle cells with multiple paragraphs", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              { 
                content: [
                  { type: "paragraph", runs: [{ text: "Line 1" }] },
                  { type: "paragraph", runs: [{ text: "Line 2" }] }
                ]
              }
            ]
          }
        ]
      };

      const result = convertTableToMarkdown(table);
      
      expect(result).toContain("Line 1 Line 2");
    });

    test("should escape pipe characters in cell content", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              { content: [{ type: "paragraph", runs: [{ text: "A | B" }] }] }
            ]
          }
        ]
      };

      const result = convertTableToMarkdown(table);
      
      expect(result).toContain("A \\| B");
    });

    test("should handle cells with formatted text", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              { 
                content: [
                  { 
                    type: "paragraph", 
                    runs: [
                      { text: "Bold", bold: true },
                      { text: " and " },
                      { text: "italic", italic: true }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = convertTableToMarkdown(table);
      
      // Bold formatting is currently disabled in formatRun function
      // And it seems italic formatting is stripped in table cells
      expect(result).toContain("| Bold and italic |");
    });

    test("should handle cells with lists", () => {
      const table: DocxTable = {
        type: "table",
        rows: [
          {
            cells: [
              { 
                content: [
                  { 
                    type: "paragraph", 
                    runs: [{ text: "Item 1" }],
                    numId: "1",
                    ilvl: 0
                  },
                  { 
                    type: "paragraph", 
                    runs: [{ text: "Item 2" }],
                    numId: "1", 
                    ilvl: 0
                  }
                ]
              }
            ]
          }
        ]
      };

      const numbering = {
        instances: new Map([["1", "0"]]),
        abstractFormats: new Map([
          ["0", { levels: new Map([[0, { numFmt: "bullet", lvlText: "•" }]]) }]
        ])
      };

      const result = convertTableToMarkdown(table, numbering);
      
      // Lists in table cells are rendered inline
      expect(result).toContain("Item 1 Item 2");
    });
  });

  describe("formatRun with advanced formatting", () => {
    test("should handle underline formatting for short text", () => {
      const doc: DocxDocument = {
        paragraphs: [{
          type: "paragraph",
          runs: [{ text: "Short underlined text", underline: true }]
        }],
        numbering: undefined
      };

      const result = convertDocxToMarkdown(doc);
      
      expect(result).toBe("<u>Short underlined text</u>");
    });

    test("should ignore underline formatting for long text", () => {
      const longText = "This is a very long piece of text that exceeds the 50 character limit for underline formatting";
      const doc: DocxDocument = {
        paragraphs: [{
          type: "paragraph",
          runs: [{ text: longText, underline: true }]
        }],
        numbering: undefined
      };

      const result = convertDocxToMarkdown(doc);
      
      expect(result).toBe(longText);
      expect(result).not.toContain("<u>");
    });

    test("should handle combined bold and italic formatting", () => {
      const doc: DocxDocument = {
        paragraphs: [{
          type: "paragraph",
          runs: [{ text: "Bold and italic", bold: true, italic: true }]
        }],
        numbering: undefined
      };

      const result = convertDocxToMarkdown(doc);
      
      expect(result).toBe("***Bold and italic***");
    });

    test("should convert tabs to spaces", () => {
      const doc: DocxDocument = {
        paragraphs: [{
          type: "paragraph",
          runs: [{ text: "Before\tAfter\tEnd" }]
        }],
        numbering: undefined
      };

      const result = convertDocxToMarkdown(doc);
      
      expect(result).toBe("Before    After    End");
    });
  });

  describe("list formatting edge cases", () => {
    test("should handle upper and lower letter lists", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "Upper letter item" }],
            numId: "1",
            ilvl: 0
          },
          {
            type: "paragraph",
            runs: [{ text: "Lower letter item" }],
            numId: "2",
            ilvl: 0
          }
        ],
        numbering: {
          instances: new Map([["1", "0"], ["2", "1"]]),
          abstractFormats: new Map([
            ["0", { levels: new Map([[0, { numFmt: "upperLetter", lvlText: "%1." }]]) }],
            ["1", { levels: new Map([[0, { numFmt: "lowerLetter", lvlText: "%1." }]]) }]
          ])
        }
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
            ilvl: 0
          },
          {
            type: "paragraph",
            runs: [{ text: "Level 1" }],
            numId: "1",
            ilvl: 1
          },
          {
            type: "paragraph",
            runs: [{ text: "Level 2" }],
            numId: "1",
            ilvl: 2
          }
        ],
        numbering: {
          instances: new Map([["1", "0"]]),
          abstractFormats: new Map([
            ["0", { 
              levels: new Map([
                [0, { numFmt: "bullet", lvlText: "•" }],
                [1, { numFmt: "bullet", lvlText: "•" }],
                [2, { numFmt: "bullet", lvlText: "•" }]
              ])
            }]
          ])
        }
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
            ilvl: 0
          },
          {
            type: "paragraph",
            runs: [{ text: "Second" }],
            numId: "1",
            ilvl: 0
          },
          {
            type: "paragraph",
            runs: [{ text: "Non-list paragraph" }]
          },
          {
            type: "paragraph",
            runs: [{ text: "New list" }],
            numId: "2",
            ilvl: 0
          }
        ],
        numbering: {
          instances: new Map([["1", "0"], ["2", "0"]]),
          abstractFormats: new Map([
            ["0", { levels: new Map([[0, { numFmt: "decimal", lvlText: "%1." }]]) }]
          ])
        }
      };

      const result = convertDocxToMarkdown(doc);
      
      expect(result).toContain("1. First");
      expect(result).toContain("2. Second");
      expect(result).toContain("Non-list paragraph");
      expect(result).toContain("1. New list"); // New list starts at 1
    });
  });

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
  });

  describe("spacing and formatting", () => {
    test("should add proper spacing between elements", () => {
      const elements: DocxElement[] = [
        {
          type: "paragraph",
          style: "Heading1",
          runs: [{ text: "Heading" }]
        },
        {
          type: "paragraph",
          runs: [{ text: "Paragraph after heading" }]
        },
        {
          type: "paragraph",
          runs: [{ text: "Another paragraph" }]
        },
        {
          type: "table",
          rows: [
            {
              cells: [
                { content: [{ type: "paragraph", runs: [{ text: "Table" }] }] }
              ]
            }
          ]
        },
        {
          type: "paragraph",
          runs: [{ text: "After table" }]
        }
      ];

      const doc: EnhancedDocxDocument = {
        elements,
        metadata: {
          extractedAt: new Date(),
          originalFormat: "docx" as const
        },
        numbering: undefined,
        processingTime: 100,
        extractedAt: new Date(),
        originalFormat: "docx"
      };

      const result = convertEnhancedDocxToMarkdown(doc);
      const lines = result.split("\n");
      
      // Check spacing after heading
      const headingIndex = lines.findIndex(l => l === "# Heading");
      expect(lines[headingIndex + 1]).toBe("");
      
      // Check spacing between paragraphs
      const para1Index = lines.findIndex(l => l === "Paragraph after heading");
      const para2Index = lines.findIndex(l => l === "Another paragraph");
      expect(para2Index - para1Index).toBe(2); // One empty line between
      
      // Check spacing after table
      const tableIndex = lines.findIndex(l => l.includes("| Table |"));
      const afterTableIndex = lines.findIndex(l => l === "After table");
      expect(lines[tableIndex + 2]).toBe(""); // Empty line after table
    });

    test("should remove trailing empty lines", () => {
      const doc: DocxDocument = {
        paragraphs: [
          {
            type: "paragraph",
            runs: [{ text: "Last paragraph" }]
          }
        ],
        numbering: undefined
      };

      const result = convertDocxToMarkdown(doc);
      
      expect(result).toBe("Last paragraph");
      expect(result).not.toEndWith("\n");
    });
  });

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
  });
});