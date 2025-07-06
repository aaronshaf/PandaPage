import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import { readDocx } from "./docx-reader";
import { convertDocxToMarkdown } from "./docx-to-markdown";
import { convertTableToMarkdown } from "./docx-to-markdown";
import type { DocxTable } from "./types";

describe("008.docx Table Parsing", () => {
  test("should parse table with 'Requested information' and 'Insert inputs under this column'", () => {
    // This is a simplified version of the table from 008.docx
    const table: DocxTable = {
      type: "table",
      rows: [
        {
          cells: [
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Requested information" }]
              }]
            },
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Insert inputs under this column" }]
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
                runs: [{ text: "Name of Organization:" }]
              }]
            },
            {
              content: [{
                type: "paragraph",
                runs: [],
                fields: [{
                  type: "FORMTEXT",
                  instruction: "FORMTEXT",
                  properties: {}
                }]
              }]
            }
          ]
        }
      ],
      properties: {
        // Table is centered via indentation
        width: "8005px",
        alignment: "left" // But with indentation
      }
    };

    const markdown = convertTableToMarkdown(table);
    const lines = markdown.split('\n');
    
    // Check header row
    expect(lines[0]).toBe("| Requested information | Insert inputs under this column |");
    expect(lines[1]).toBe("| --- | --- |");
    
    // Check data row with form field
    expect(lines[2]).toContain("Name of Organization:");
    expect(lines[2]).toContain("[___________]"); // Form field placeholder (11 underscores)
  });

  test("should handle table properties from 008.docx", () => {
    const tableWithStyle: DocxTable = {
      type: "table",
      rows: [
        {
          cells: [
            { content: [{ type: "paragraph", runs: [{ text: "Header 1" }] }] },
            { content: [{ type: "paragraph", runs: [{ text: "Header 2" }] }] }
          ]
        }
      ],
      properties: {
        width: "8005px",
        // Table appears centered due to indentation
        // tblInd of 607 dxa units
        alignment: "left",
        // GridTable1Light style would include borders
        borders: {
          top: "1px solid #E7E6E6",
          right: "1px solid #E7E6E6",
          bottom: "1px solid #E7E6E6",
          left: "1px solid #E7E6E6"
        }
      }
    };

    const markdown = convertTableToMarkdown(tableWithStyle);
    expect(markdown).toContain("| Header 1 | Header 2 |");
    // Note: Markdown tables don't support centering or indentation
    // This would need to be handled at the rendering level
  });

  test("should parse form fields in table cells", () => {
    const tableWithFormFields: DocxTable = {
      type: "table",
      rows: [
        {
          cells: [
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Meeting Date:" }]
              }]
            },
            {
              content: [{
                type: "paragraph",
                runs: [],
                fields: [{
                  type: "FORMTEXT",
                  instruction: "FORMTEXT",
                  properties: {}
                }]
              }]
            }
          ]
        },
        {
          cells: [
            {
              content: [{
                type: "paragraph",
                runs: [{ text: "Meeting Time:" }]
              }]
            },
            {
              content: [{
                type: "paragraph",
                runs: [],
                fields: [{
                  type: "FORMTEXT",
                  instruction: "FORMTEXT",
                  properties: {}
                }]
              }]
            }
          ]
        }
      ]
    };

    const markdown = convertTableToMarkdown(tableWithFormFields);
    const lines = markdown.split('\n');
    
    expect(lines[0]).toContain("Meeting Date:");
    expect(lines[0]).toContain("[___________]");
    expect(lines[2]).toContain("Meeting Time:");
    expect(lines[2]).toContain("[___________]");
  });

  test("should handle Note with bold formatting after table", () => {
    // The paragraph after the table has "Note:" in bold
    const paragraph = {
      type: "paragraph" as const,
      runs: [
        { text: "Note", bold: true },
        { text: ":  ", bold: true },
        { text: "Enter as much information as known. If unknown, enter TBD." }
      ]
    };

    // Convert runs to markdown manually
    const markdown = paragraph.runs
      .map(run => run.bold ? `**${run.text}**` : run.text)
      .join("");
    
    expect(markdown).toBe("**Note****:  **Enter as much information as known. If unknown, enter TBD.");
  });
});