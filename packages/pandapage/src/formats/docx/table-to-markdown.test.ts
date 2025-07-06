import { describe, test, expect } from "bun:test";
import { convertTableToMarkdown } from "./docx-to-markdown";
import type { DocxTable, DocxParagraph } from "./types";

describe("Table to Markdown Conversion", () => {
  test("should convert simple 2x2 table", () => {
    const table: DocxTable = {
      type: "table",
      rows: [
        {
          cells: [
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Header 1" }]
              }]
            },
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Header 2" }]
              }]
            }
          ],
          properties: { isHeader: true }
        },
        {
          cells: [
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Cell 1" }]
              }]
            },
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Cell 2" }]
              }]
            }
          ]
        }
      ]
    };

    const markdown = convertTableToMarkdown(table);
    const lines = markdown.split('\n');
    
    expect(lines[0]).toBe("| Header 1 | Header 2 |");
    expect(lines[1]).toBe("| --- | --- |");
    expect(lines[2]).toBe("| Cell 1 | Cell 2 |");
  });

  test("should handle tables with formatting", () => {
    const table: DocxTable = {
      type: "table",
      rows: [
        {
          cells: [
            {
              content: [{
                type: "paragraph",
                runs: [
                  { text: "Bold ", bold: true },
                  { text: "and ", italic: true },
                  { text: "underlined", underline: true }
                ]
              }]
            }
          ]
        }
      ]
    };

    const markdown = convertTableToMarkdown(table);
    // Note: Table cells have formatting stripped for cleaner tables
    expect(markdown).toContain("Bold and underlined");
  });

  test("should handle multi-paragraph cells", () => {
    const table: DocxTable = {
      type: "table",
      rows: [
        {
          cells: [
            {
              content: [
                {
                  type: "paragraph",
                  runs: [{ text: "First paragraph" }]
                },
                {
                  type: "paragraph",
                  runs: [{ text: "Second paragraph" }]
                }
              ]
            }
          ]
        }
      ]
    };

    const markdown = convertTableToMarkdown(table);
    // Note: Multiple paragraphs are joined with spaces in table cells
    expect(markdown).toContain("First paragraph Second paragraph");
  });

  test("should handle empty cells", () => {
    const table: DocxTable = {
      type: "table",
      rows: [
        {
          cells: [
            {
              content: [{
                type: "paragraph",
                runs: []
              }]
            },
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Not empty" }]
              }]
            }
          ]
        }
      ]
    };

    const markdown = convertTableToMarkdown(table);
    expect(markdown).toContain("|  | Not empty |");
  });

  test("should handle tables with properties", () => {
    const table: DocxTable = {
      type: "table",
      rows: [
        {
          cells: [
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Centered" }]
              }],
              properties: {
                alignment: "center"
              }
            }
          ]
        }
      ],
      properties: {
        width: "100%",
        alignment: "center"
      }
    };

    const markdown = convertTableToMarkdown(table);
    expect(markdown).toContain("Centered");
  });

  test("should handle complex table from 008.docx pattern", () => {
    const table: DocxTable = {
      type: "table",
      rows: [
        {
          cells: [
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Meeting Topic" }]
              }]
            },
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Duration" }]
              }]
            },
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Owner" }]
              }]
            }
          ],
          properties: { isHeader: true }
        },
        {
          cells: [
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Review previous action items" }]
              }]
            },
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "10 minutes" }]
              }]
            },
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Project Manager" }]
              }]
            }
          ]
        }
      ]
    };

    const markdown = convertTableToMarkdown(table);
    const lines = markdown.split('\n');
    
    expect(lines[0]).toBe("| Meeting Topic | Duration | Owner |");
    expect(lines[1]).toBe("| --- | --- | --- |");
    expect(lines[2]).toContain("Review previous action items");
    expect(lines[2]).toContain("10 minutes");
    expect(lines[2]).toContain("Project Manager");
  });

  test("should escape pipe characters in cell content", () => {
    const table: DocxTable = {
      type: "table",
      rows: [
        {
          cells: [
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Command | Option" }]
              }]
            }
          ]
        }
      ]
    };

    const markdown = convertTableToMarkdown(table);
    expect(markdown).toContain("Command \\| Option");
  });

  test("should handle lists within table cells", () => {
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

    // Note: The actual markdown conversion would need numbering data
    // This test documents the expected structure
    const markdown = convertTableToMarkdown(table);
    expect(markdown).toContain("Item 1");
    expect(markdown).toContain("Item 2");
  });

  test("should handle tables with no rows", () => {
    const table: DocxTable = {
      type: "table",
      rows: []
    };

    const markdown = convertTableToMarkdown(table);
    expect(markdown).toBe("");
  });

  test("should determine header row from first row when not specified", () => {
    const table: DocxTable = {
      type: "table",
      rows: [
        {
          cells: [
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Implicit Header" }]
              }]
            }
          ]
          // No properties specifying isHeader
        },
        {
          cells: [
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Data Row" }]
              }]
            }
          ]
        }
      ]
    };

    const markdown = convertTableToMarkdown(table);
    const lines = markdown.split('\n');
    
    // First row should be treated as header
    expect(lines[0]).toBe("| Implicit Header |");
    expect(lines[1]).toBe("| --- |");
    expect(lines[2]).toBe("| Data Row |");
  });
});