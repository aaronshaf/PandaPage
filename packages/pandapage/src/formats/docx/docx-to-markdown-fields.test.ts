import { describe, test, expect } from "bun:test";
import { convertDocxToMarkdown } from "./docx-to-markdown";
import type { DocxDocument, DocxParagraph } from "./docx-reader";
import { FieldCode } from "./form-field-parser";

describe("DOCX to Markdown - Field Conversion", () => {
  test("should convert FORMTEXT fields to markdown placeholders", () => {
    const document: DocxDocument = {
      paragraphs: [
        {
          type: "paragraph",
          runs: [
            { text: "Name: " },
            { text: "John Doe" }
          ],
          fields: [
            {
              type: FieldCode.FORMTEXT,
              instruction: 'FORMTEXT "Enter your name"',
              properties: { defaultText: "Enter your name" },
              result: "John Doe"
            }
          ]
        }
      ]
    };

    const markdown = convertDocxToMarkdown(document);
    expect(markdown).toContain("Name: John Doe");
  });

  test("should convert empty FORMTEXT fields to default placeholders", () => {
    const document: DocxDocument = {
      paragraphs: [
        {
          type: "paragraph",
          runs: [{ text: "Email: " }],
          fields: [
            {
              type: FieldCode.FORMTEXT,
              instruction: "FORMTEXT"
            }
          ]
        }
      ]
    };

    const markdown = convertDocxToMarkdown(document);
    expect(markdown).toBe("Email: [_____________]");
  });

  test("should convert checkbox fields", () => {
    const document: DocxDocument = {
      paragraphs: [
        {
          type: "paragraph",
          runs: [],
          fields: [
            {
              type: FieldCode.FORMCHECKBOX,
              instruction: "FORMCHECKBOX"
            }
          ]
        },
        {
          type: "paragraph",
          runs: [{ text: " Completed" }],
        }
      ]
    };

    const markdown = convertDocxToMarkdown(document);
    expect(markdown).toContain("☐");
    expect(markdown).toContain("Completed");
  });

  test("should convert dropdown fields", () => {
    const document: DocxDocument = {
      paragraphs: [
        {
          type: "paragraph",
          runs: [{ text: "Priority: " }],
          fields: [
            {
              type: FieldCode.FORMDROPDOWN,
              instruction: "FORMDROPDOWN"
            }
          ]
        }
      ]
    };

    const markdown = convertDocxToMarkdown(document);
    expect(markdown).toBe("Priority: [Select Option ▼]");
  });

  test("should convert date fields with results", () => {
    const document: DocxDocument = {
      paragraphs: [
        {
          type: "paragraph",
          runs: [
            { text: "Meeting Date: " },
            { text: "12/25/2023" }
          ],
          fields: [
            {
              type: FieldCode.DATE,
              instruction: 'DATE \\@ "MM/dd/yyyy"',
              properties: { "@": "MM/dd/yyyy" },
              result: "12/25/2023"
            }
          ]
        }
      ]
    };

    const markdown = convertDocxToMarkdown(document);
    expect(markdown).toContain("Meeting Date: 12/25/2023");
  });

  test("should handle multiple fields in one paragraph", () => {
    const document: DocxDocument = {
      paragraphs: [
        {
          type: "paragraph",
          runs: [
            { text: "From: " },
            { text: "John Doe" },
            { text: " To: " },
            { text: "" }
          ],
          fields: [
            {
              type: FieldCode.FORMTEXT,
              instruction: "FORMTEXT",
              result: "John Doe"
            },
            {
              type: FieldCode.FORMTEXT,
              instruction: "FORMTEXT"
            }
          ]
        }
      ]
    };

    const markdown = convertDocxToMarkdown(document);
    expect(markdown).toContain("From: John Doe To:");
  });

  test("should convert page numbering fields", () => {
    const document: DocxDocument = {
      paragraphs: [
        {
          type: "paragraph",
          runs: [
            { text: "Page " },
            { text: "1" },
            { text: " of " },
            { text: "10" }
          ],
          fields: [
            {
              type: FieldCode.PAGE,
              instruction: "PAGE",
              result: "1"
            },
            {
              type: FieldCode.NUMPAGES,
              instruction: "NUMPAGES",
              result: "10"
            }
          ]
        }
      ]
    };

    const markdown = convertDocxToMarkdown(document);
    expect(markdown).toBe("Page 1 of 10");
  });

  test("should handle fields in headings", () => {
    const document: DocxDocument = {
      paragraphs: [
        {
          type: "paragraph",
          style: "Heading1",
          runs: [
            { text: "Meeting Minutes - " },
            { text: "12/25/2023" }
          ],
          fields: [
            {
              type: FieldCode.DATE,
              instruction: "DATE",
              result: "12/25/2023"
            }
          ]
        }
      ]
    };

    const markdown = convertDocxToMarkdown(document);
    expect(markdown).toBe("# Meeting Minutes - 12/25/2023");
  });

  test("should handle fields in list items", () => {
    const document: DocxDocument = {
      paragraphs: [
        {
          type: "paragraph",
          runs: [
            { text: "Action Item: " },
            { text: "" }
          ],
          numId: "1",
          ilvl: 0,
          fields: [
            {
              type: FieldCode.FORMTEXT,
              instruction: "FORMTEXT"
            }
          ]
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

    const markdown = convertDocxToMarkdown(document);
    expect(markdown).toContain("1. Action Item: [_____________]");
  });

  test("should handle fields without accompanying text", () => {
    const document: DocxDocument = {
      paragraphs: [
        {
          type: "paragraph",
          runs: [],
          fields: [
            {
              type: FieldCode.FORMTEXT,
              instruction: 'FORMTEXT "Type your response here"',
              properties: { defaultText: "Type your response here" }
            }
          ]
        }
      ]
    };

    const markdown = convertDocxToMarkdown(document);
    expect(markdown).toBe("[Type your response here]");
  });
});