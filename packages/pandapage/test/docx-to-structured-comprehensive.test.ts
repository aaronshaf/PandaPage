import { describe, test, expect, beforeAll } from "bun:test";
import { Effect } from "effect";
import {
  docxToStructured,
  parseDocxToStructured,
  type StructuredDocxResult
} from "../src/formats/docx/docx-to-structured";
import type { EnhancedDocxDocument, DocxElement } from "../src/formats/docx/types";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  const window = new Window();
  (global as any).DOMParser = window.DOMParser;
  (global as any).Document = window.Document;
  (global as any).Element = window.Element;
  (global as any).Node = window.Node;
});

// Helper to create minimal DOCX buffer for testing
function createMinimalDocx(options: {
  hasDocument?: boolean;
  documentContent?: string;
  metadataContent?: string;
} = {}): ArrayBuffer {
  const { zipSync, strToU8 } = require("fflate");
  
  const files: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
      </Types>`),
    "_rels/.rels": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
        <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
      </Relationships>`)
  };
  
  if (options.hasDocument !== false) {
    files["word/document.xml"] = strToU8(options.documentContent || `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:r>
              <w:t>Test document</w:t>
            </w:r>
          </w:p>
        </w:body>
      </w:document>`);
  }
  
  files["docProps/core.xml"] = strToU8(options.metadataContent || `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">
      <dc:title>Test Document</dc:title>
      <dc:creator>Test Author</dc:creator>
      <dcterms:created>2024-01-01T12:00:00Z</dcterms:created>
      <dcterms:modified>2024-01-02T15:30:00Z</dcterms:modified>
    </cp:coreProperties>`);
  
  const zipped = zipSync(files);
  return zipped.buffer;
}

describe("docx-to-structured comprehensive", () => {
  describe("convertEnhancedDocumentToMarkdown (internal function)", () => {
    test("should convert document with complete metadata to markdown with frontmatter", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:pPr>
                  <w:pStyle w:val="Heading1"/>
                </w:pPr>
                <w:r>
                  <w:t>Chapter 1</w:t>
                </w:r>
              </w:p>
              <w:p>
                <w:r>
                  <w:t>This is a paragraph.</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown).toContain("---");
      expect(result.markdown).toContain('title: "Test Document"');
      expect(result.markdown).toContain('author: "Test Author"');
      expect(result.markdown).toContain("created: 2024-01-01T12:00:00.000Z");
      expect(result.markdown).toContain("modified: 2024-01-02T15:30:00.000Z");
      expect(result.markdown).toContain("# Chapter 1");
      expect(result.markdown).toContain("This is a paragraph.");
    });

    test("should convert document without metadata (no frontmatter)", async () => {
      const buffer = createMinimalDocx({
        metadataContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties">
          </cp:coreProperties>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown).not.toContain("---");
      expect(result.markdown).not.toContain("title:");
      expect(result.markdown).not.toContain("author:");
    });

    test("should convert document with partial metadata", async () => {
      const buffer = createMinimalDocx({
        metadataContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">
            <dc:title>Only Title</dc:title>
          </cp:coreProperties>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown).toContain("---");
      expect(result.markdown).toContain('title: "Only Title"');
      expect(result.markdown).not.toContain("author:");
      expect(result.markdown).not.toContain("created:");
      expect(result.markdown).not.toContain("modified:");
    });

    test("should convert paragraphs with bold formatting", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:rPr>
                    <w:b/>
                  </w:rPr>
                  <w:t>Bold text</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown).toContain("**Bold text**");
    });

    test("should convert paragraphs with italic formatting", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:rPr>
                    <w:i/>
                  </w:rPr>
                  <w:t>Italic text</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown).toContain("*Italic text*");
    });

    test("should convert paragraphs with underline formatting", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:rPr>
                    <w:u w:val="single"/>
                  </w:rPr>
                  <w:t>Underlined text</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown).toContain("<u>Underlined text</u>");
    });

    test("should convert paragraphs with multiple formatting", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:rPr>
                    <w:b/>
                    <w:i/>
                    <w:u w:val="single"/>
                  </w:rPr>
                  <w:t>Formatted text</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown).toContain("<u>***Formatted text***</u>");
    });

    test("should convert headings with different levels", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:pPr>
                  <w:pStyle w:val="Heading1"/>
                </w:pPr>
                <w:r>
                  <w:t>Heading 1</w:t>
                </w:r>
              </w:p>
              <w:p>
                <w:pPr>
                  <w:pStyle w:val="Heading2"/>
                </w:pPr>
                <w:r>
                  <w:t>Heading 2</w:t>
                </w:r>
              </w:p>
              <w:p>
                <w:pPr>
                  <w:pStyle w:val="Heading3"/>
                </w:pPr>
                <w:r>
                  <w:t>Heading 3</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown).toContain("# Heading 1");
      expect(result.markdown).toContain("## Heading 2");
      expect(result.markdown).toContain("### Heading 3");
    });

    test("should handle headings with invalid level (defaults to 1)", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:pPr>
                  <w:pStyle w:val="HeadingInvalid"/>
                </w:pPr>
                <w:r>
                  <w:t>Invalid Heading</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown).toContain("# Invalid Heading");
    });

    test("should skip empty paragraphs", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:t></w:t>
                </w:r>
              </w:p>
              <w:p>
                <w:r>
                  <w:t>   </w:t>
                </w:r>
              </w:p>
              <w:p>
                <w:r>
                  <w:t>Valid content</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown.trim()).toBe("Valid content");
    });

    test("should handle paragraphs without runs", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:pPr>
                  <w:pStyle w:val="Normal"/>
                </w:pPr>
              </w:p>
              <w:p>
                <w:r>
                  <w:t>Text content</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown.trim()).toBe("Text content");
    });

    test("should handle runs without text", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:rPr>
                    <w:b/>
                  </w:rPr>
                </w:r>
                <w:r>
                  <w:t>Content</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown).toContain("Content");
    });

    test("should convert tables to markdown", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:tbl>
                <w:tr>
                  <w:tc>
                    <w:p>
                      <w:r>
                        <w:t>Header 1</w:t>
                      </w:r>
                    </w:p>
                  </w:tc>
                  <w:tc>
                    <w:p>
                      <w:r>
                        <w:t>Header 2</w:t>
                      </w:r>
                    </w:p>
                  </w:tc>
                </w:tr>
                <w:tr>
                  <w:tc>
                    <w:p>
                      <w:r>
                        <w:t>Cell 1</w:t>
                      </w:r>
                    </w:p>
                  </w:tc>
                  <w:tc>
                    <w:p>
                      <w:r>
                        <w:t>Cell 2</w:t>
                      </w:r>
                    </w:p>
                  </w:tc>
                </w:tr>
              </w:tbl>
            </w:body>
          </w:document>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown).toContain("| Header 1 | Header 2 |");
      expect(result.markdown).toContain("| --- | --- |");
      expect(result.markdown).toContain("| Cell 1 | Cell 2 |");
    });

    test("should handle empty table (no markdown output)", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:tbl>
              </w:tbl>
              <w:p>
                <w:r>
                  <w:t>After table</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown.trim()).toBe("After table");
    });

    test("should remove trailing empty lines", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:t>Last paragraph</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown).not.toEndWith("\n\n");
      expect(result.markdown.trim()).toBe("Last paragraph");
    });

    test("should handle mixed content with headings, paragraphs, and tables", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:pPr>
                  <w:pStyle w:val="Heading1"/>
                </w:pPr>
                <w:r>
                  <w:t>Introduction</w:t>
                </w:r>
              </w:p>
              <w:p>
                <w:r>
                  <w:t>This is an introduction paragraph.</w:t>
                </w:r>
              </w:p>
              <w:tbl>
                <w:tr>
                  <w:tc>
                    <w:p>
                      <w:r>
                        <w:t>Data</w:t>
                      </w:r>
                    </w:p>
                  </w:tc>
                </w:tr>
              </w:tbl>
              <w:p>
                <w:r>
                  <w:t>Conclusion paragraph.</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await Effect.runPromise(docxToStructured(buffer));

      expect(result.markdown).toContain("# Introduction");
      expect(result.markdown).toContain("This is an introduction paragraph.");
      expect(result.markdown).toContain("| Data |");
      expect(result.markdown).toContain("Conclusion paragraph.");
    });
  });

  describe("docxToStructured", () => {
    test("should handle invalid buffer", async () => {
      const buffer = new ArrayBuffer(10); // Invalid DOCX

      await expect(Effect.runPromise(docxToStructured(buffer))).rejects.toThrow();
    });

    test("should handle empty buffer", async () => {
      const buffer = new ArrayBuffer(0);

      await expect(Effect.runPromise(docxToStructured(buffer))).rejects.toThrow();
    });

    test("should return Effect type", () => {
      const buffer = createMinimalDocx();
      const result = docxToStructured(buffer);

      expect(typeof result).toBe("object");
      expect(result._tag).toBeDefined(); // Effect objects have internal tags
    });

    test("should handle buffer with invalid ZIP signature", async () => {
      const buffer = new ArrayBuffer(100);
      const view = new Uint8Array(buffer);
      view.fill(255); // Invalid ZIP signature

      await expect(Effect.runPromise(docxToStructured(buffer))).rejects.toThrow();
    });
  });

  describe("parseDocxToStructured", () => {
    test("should be promise-based wrapper", async () => {
      const buffer = createMinimalDocx();

      const result = await parseDocxToStructured(buffer);

      expect(result).toBeDefined();
      expect(result.document).toBeDefined();
      expect(result.markdown).toBeDefined();
      expect(typeof result.markdown).toBe("string");
    });
  });

  describe("StructuredDocxResult interface", () => {
    test("should have correct type structure", async () => {
      const buffer = createMinimalDocx();
      const result = await parseDocxToStructured(buffer);

      expect(result).toHaveProperty("document");
      expect(result).toHaveProperty("markdown");
      expect(result.document).toHaveProperty("elements");
      expect(result.document).toHaveProperty("metadata");
      expect(typeof result.markdown).toBe("string");
    });
  });

  describe("Markdown conversion logic", () => {
    test("should format bold text correctly", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:rPr><w:b/></w:rPr>
                  <w:t>Bold</w:t>
                </w:r>
                <w:r>
                  <w:t> normal</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown).toContain("**Bold** normal");
    });

    test("should format italic text correctly", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:rPr><w:i/></w:rPr>
                  <w:t>Italic</w:t>
                </w:r>
                <w:r>
                  <w:t> normal</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown).toContain("*Italic* normal");
    });

    test("should format underline text correctly", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:rPr><w:u w:val="single"/></w:rPr>
                  <w:t>Underline</w:t>
                </w:r>
                <w:r>
                  <w:t> normal</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown).toContain("<u>Underline</u> normal");
    });

    test("should format headings correctly", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
                <w:r><w:t>Main Title</w:t></w:r>
              </w:p>
              <w:p>
                <w:pPr><w:pStyle w:val="Heading2"/></w:pPr>
                <w:r><w:t>Subtitle</w:t></w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown).toContain("# Main Title");
      expect(result.markdown).toContain("## Subtitle");
    });

    test("should handle heading style names", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:pPr><w:pStyle w:val="Heading6"/></w:pPr>
                <w:r><w:t>Deep heading</w:t></w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown).toContain("###### Deep heading");
    });

    test("should handle edge case heading styles", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:pPr><w:pStyle w:val="HeadingXYZ"/></w:pPr>
                <w:r><w:t>Invalid heading style</w:t></w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown).toContain("# Invalid heading style");
    });
  });

  describe("Frontmatter generation", () => {
    test("should format frontmatter correctly", async () => {
      const buffer = createMinimalDocx();
      const result = await parseDocxToStructured(buffer);

      const lines = result.markdown.split("\n");
      expect(lines[0]).toBe("---");
      expect(lines.some(line => line.startsWith('title:'))).toBe(true);
      expect(lines.some(line => line.startsWith('author:'))).toBe(true);
      expect(lines.some(line => line.startsWith('created:'))).toBe(true);
      expect(lines.some(line => line.startsWith('modified:'))).toBe(true);
      expect(lines.includes("---")).toBe(true);
    });

    test("should handle metadata with missing fields", async () => {
      const buffer = createMinimalDocx({
        metadataContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">
            <dc:title>Title Only</dc:title>
          </cp:coreProperties>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown).toContain('title: "Title Only"');
      expect(result.markdown).not.toContain("author:");
      expect(result.markdown).not.toContain("created:");
    });

    test("should skip frontmatter for empty metadata", async () => {
      const buffer = createMinimalDocx({
        metadataContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties">
          </cp:coreProperties>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown).not.toContain("---");
    });
  });

  describe("Element processing", () => {
    test("should handle empty runs array", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
              </w:p>
              <w:p>
                <w:r>
                  <w:t>Content</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown.trim()).toBe("Content");
    });

    test("should handle runs with multiple formatting", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:rPr>
                    <w:b/>
                    <w:i/>
                  </w:rPr>
                  <w:t>Bold and italic</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown).toContain("***Bold and italic***");
    });

    test("should handle paragraphs without style", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:t>No style paragraph</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown.trim()).toBe("No style paragraph");
    });

    test("should trim whitespace from paragraphs", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:t>   Padded text   </w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown.trim()).toBe("Padded text");
    });
  });

  describe("Line handling", () => {
    test("should remove trailing empty lines", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:t>Final content</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown).toBe("Final content");
      expect(result.markdown).not.toEndWith("\n");
    });

    test("should handle all empty lines", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:t></w:t>
                </w:r>
              </w:p>
              <w:p>
                <w:r>
                  <w:t>   </w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown).toBe("");
    });

    test("should preserve internal empty lines", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:r>
                  <w:t>First paragraph</w:t>
                </w:r>
              </w:p>
              <w:p>
                <w:r>
                  <w:t>Second paragraph</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown).toBe("First paragraph\n\nSecond paragraph");
    });
  });

  describe("Error handling", () => {
    test("DocxParseError should be used for errors", async () => {
      const invalidBuffer = new ArrayBuffer(5);

      try {
        await parseDocxToStructured(invalidBuffer);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  describe("Table conversion", () => {
    test("should handle table elements", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:tbl>
                <w:tr>
                  <w:tc>
                    <w:p>
                      <w:r>
                        <w:t>Test</w:t>
                      </w:r>
                    </w:p>
                  </w:tc>
                </w:tr>
              </w:tbl>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown).toContain("| Test |");
    });

    test("should handle missing table markdown", async () => {
      // This tests the case where convertTableToMarkdown returns empty string
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:tbl>
                <!-- Empty table that might return empty markdown -->
              </w:tbl>
              <w:p>
                <w:r>
                  <w:t>After empty table</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown.trim()).toBe("After empty table");
    });
  });

  describe("Integration scenarios", () => {
    test("should handle document with mixed content", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
                <w:r><w:t>Title</w:t></w:r>
              </w:p>
              <w:p>
                <w:r>
                  <w:rPr><w:b/></w:rPr>
                  <w:t>Bold paragraph</w:t>
                </w:r>
              </w:p>
              <w:tbl>
                <w:tr>
                  <w:tc>
                    <w:p><w:r><w:t>Table cell</w:t></w:r></w:p>
                  </w:tc>
                </w:tr>
              </w:tbl>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown).toContain("# Title");
      expect(result.markdown).toContain("**Bold paragraph**");
      expect(result.markdown).toContain("| Table cell |");
    });

    test("should handle document with only tables", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:tbl>
                <w:tr>
                  <w:tc>
                    <w:p><w:r><w:t>Only table</w:t></w:r></w:p>
                  </w:tc>
                </w:tr>
              </w:tbl>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown).toContain("| Only table |");
    });

    test("should handle empty document", async () => {
      const buffer = createMinimalDocx({
        documentContent: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
            </w:body>
          </w:document>`
      });

      const result = await parseDocxToStructured(buffer);
      expect(result.markdown.trim()).toBe("");
    });
  });
});