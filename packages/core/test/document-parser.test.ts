import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { Effect } from "effect";
import {
  parseDocumentXmlEnhanced,
  parseNumberingXml,
  extractFileContent,
  calculateDocumentStats,
} from "../src/formats/docx/document-parser";
import { DocxParseError } from "../src/formats/docx/types";
import { parseXmlString } from "../src/common/xml-parser";
import { Window } from "happy-dom";

// Set up DOM environment
const window = new Window();
const document = window.document;
(global as any).DOMParser = window.DOMParser;
(global as any).Document = window.Document;
(global as any).Element = window.Element;
(global as any).Node = window.Node;

// Create mock DOM element
async function createMockElement(html: string): Promise<Element> {
  const doc = await Effect.runPromise(parseXmlString(html));
  return doc.documentElement;
}

describe("Document Parser", () => {
  describe("parseDocumentXmlEnhanced", () => {
    test("should parse document with paragraphs", async () => {
      const xml = `
        <document>
          <body>
            <p>
              <r>
                <t>Hello World</t>
              </r>
            </p>
          </body>
        </document>
      `;
      const root = await createMockElement(xml);

      const result = await Effect.runPromise(parseDocumentXmlEnhanced(root));
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("type", "paragraph");
    });

    test("should parse document with namespace prefixed body", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>Test content</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      const root = await createMockElement(xml);

      const result = await Effect.runPromise(parseDocumentXmlEnhanced(root));
      expect(result).toHaveLength(1);
    });

    test("should handle missing body element", async () => {
      const xml = `<document></document>`;
      const root = await createMockElement(xml);

      await expect(Effect.runPromise(parseDocumentXmlEnhanced(root))).rejects.toThrow();
    });

    test("should parse tables", async () => {
      const xml = `
        <document>
          <body>
            <tbl>
              <tr>
                <tc>
                  <p>
                    <r>
                      <t>Cell 1</t>
                    </r>
                  </p>
                </tc>
              </tr>
            </tbl>
          </body>
        </document>
      `;
      const root = await createMockElement(xml);

      const result = await Effect.runPromise(parseDocumentXmlEnhanced(root));
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("type", "table");
    });

    test("should skip section properties", async () => {
      const xml = `
        <document>
          <body>
            <p>
              <r>
                <t>Paragraph</t>
              </r>
            </p>
            <sectPr>
              <pgSz w="12240" h="15840"/>
            </sectPr>
          </body>
        </document>
      `;
      const root = await createMockElement(xml);

      const result = await Effect.runPromise(parseDocumentXmlEnhanced(root));
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("type", "paragraph");
    });

    test("should handle unknown elements gracefully", async () => {
      const xml = `
        <document>
          <body>
            <p>
              <r>
                <t>Valid paragraph</t>
              </r>
            </p>
            <unknownElement>Unknown content</unknownElement>
            <p>
              <r>
                <t>Another paragraph</t>
              </r>
            </p>
          </body>
        </document>
      `;
      const root = await createMockElement(xml);

      const result = await Effect.runPromise(parseDocumentXmlEnhanced(root));
      expect(result).toHaveLength(2);
      expect(result.every((el) => el.type === "paragraph")).toBe(true);
    });
  });

  describe("parseNumberingXml", () => {
    test("should return undefined for null numbering XML", async () => {
      const result = await Effect.runPromise(parseNumberingXml(null));
      expect(result).toBeUndefined();
    });

    test("should return undefined for empty numbering XML", async () => {
      const result = await Effect.runPromise(parseNumberingXml(""));
      expect(result).toBeUndefined();
    });

    test("should parse valid numbering XML", async () => {
      const xml = `
        <numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="decimal"/>
            </w:lvl>
          </w:abstractNum>
        </numbering>
      `;

      const result = await Effect.runPromise(parseNumberingXml(xml));
      expect(result).toBeDefined();
    });

    test("should handle invalid numbering XML structure", async () => {
      const xml = `<notNumbering></notNumbering>`;

      const result = await Effect.runPromise(parseNumberingXml(xml));
      expect(result).toBeUndefined();
    });

    test("should handle malformed XML gracefully", async () => {
      const xml = `<numbering><invalid></numbering>`;

      const result = await Effect.runPromise(parseNumberingXml(xml));
      expect(result).toBeUndefined();
    });
  });

  describe("extractFileContent", () => {
    const strFromU8 = (data: Uint8Array): string => {
      return new TextDecoder().decode(data);
    };

    test("should extract file content successfully", () => {
      const unzipped = {
        "word/document.xml": new TextEncoder().encode("Hello World"),
      };

      const result = extractFileContent(unzipped, "word/document.xml", strFromU8);
      expect(result).toBe("Hello World");
    });

    test("should return null for missing file", () => {
      const unzipped = {};

      const result = extractFileContent(unzipped, "word/document.xml", strFromU8);
      expect(result).toBeNull();
    });

    test("should handle decoding errors gracefully", () => {
      const unzipped = {
        "word/document.xml": new Uint8Array([0xff, 0xfe, 0xfd]),
      };

      const badDecoder = () => {
        throw new Error("Decoding error");
      };

      const result = extractFileContent(unzipped, "word/document.xml", badDecoder);
      expect(result).toBeNull();
    });
  });

  describe("calculateDocumentStats", () => {
    test("should calculate stats for paragraphs", () => {
      const elements = [
        {
          type: "paragraph",
          runs: [{ text: "Hello world" }, { text: " this is a test" }],
        },
        {
          type: "paragraph",
          runs: [{ text: "Another paragraph with more words" }],
        },
      ];

      const stats = calculateDocumentStats(elements as any);
      expect(stats.paragraphCount).toBe(2);
      expect(stats.wordCount).toBe(11); // Hello world this is a test Another paragraph with more words
      expect(stats.characterCount).toBe(59); // Including spaces
    });

    test("should calculate stats for tables", () => {
      const elements = [
        {
          type: "table",
          rows: [
            {
              cells: [
                {
                  content: [
                    {
                      type: "paragraph",
                      runs: [{ text: "Cell one" }],
                    },
                  ],
                },
                {
                  content: [
                    {
                      type: "paragraph",
                      runs: [{ text: "Cell two" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const stats = calculateDocumentStats(elements as any);
      expect(stats.paragraphCount).toBe(2);
      expect(stats.wordCount).toBe(4); // Cell one Cell two
      expect(stats.characterCount).toBe(16);
    });

    test("should handle empty elements", () => {
      const elements: any[] = [];

      const stats = calculateDocumentStats(elements);
      expect(stats.paragraphCount).toBe(0);
      expect(stats.wordCount).toBe(0);
      expect(stats.characterCount).toBe(0);
    });

    test("should handle paragraphs with empty runs", () => {
      const elements = [
        {
          type: "paragraph",
          runs: [],
        },
        {
          type: "paragraph",
          runs: [{ text: "" }],
        },
      ];

      const stats = calculateDocumentStats(elements as any);
      expect(stats.paragraphCount).toBe(2);
      expect(stats.wordCount).toBe(0);
      expect(stats.characterCount).toBe(0);
    });

    test("should handle mixed content", () => {
      const elements = [
        {
          type: "paragraph",
          runs: [{ text: "Introduction text" }],
        },
        {
          type: "table",
          rows: [
            {
              cells: [
                {
                  content: [
                    {
                      type: "paragraph",
                      runs: [{ text: "Table content here" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          runs: [{ text: "Conclusion text" }],
        },
      ];

      const stats = calculateDocumentStats(elements as any);
      expect(stats.paragraphCount).toBe(3);
      expect(stats.wordCount).toBe(7);
      expect(stats.characterCount).toBe(50);
    });
  });
});
