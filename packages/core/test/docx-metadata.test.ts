import { describe, test, expect, beforeAll } from "bun:test";
import { Effect } from "effect";
import {
  parseCoreProperties,
  parseAppProperties,
  extractDocumentOutline,
  analyzeStyleUsage,
  extractCompleteMetadata,
  DocxMetadataError,
  type DocxMetadata,
  type DocxOutlineItem,
  type DocxStyleUsage,
} from "../src/formats/docx/docx-metadata";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  const window = new Window();
  (global as any).DOMParser = window.DOMParser;
  (global as any).Document = window.Document;
  (global as any).Element = window.Element;
  (global as any).Node = window.Node;
});

describe("docx-metadata", () => {
  describe("parseCoreProperties", () => {
    test("should parse complete core properties XML", async () => {
      const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">
          <dc:title>Test Document Title</dc:title>
          <dc:subject>Test Subject</dc:subject>
          <dc:description>Test Description</dc:description>
          <dc:creator>Test Author</dc:creator>
          <cp:keywords>test, metadata, docx</cp:keywords>
          <dc:language>en-US</dc:language>
          <cp:lastModifiedBy>Test Editor</cp:lastModifiedBy>
          <dcterms:created>2024-01-01T12:00:00Z</dcterms:created>
          <dcterms:modified>2024-01-02T15:30:00Z</dcterms:modified>
          <cp:revision>5</cp:revision>
        </cp:coreProperties>`;

      const result = await Effect.runPromise(parseCoreProperties(coreXml));

      expect(result.title).toBe("Test Document Title");
      expect(result.subject).toBe("Test Subject");
      expect(result.description).toBe("Test Description");
      expect(result.creator).toBe("Test Author");
      expect(result.keywords).toEqual(["test", "metadata", "docx"]);
      expect(result.language).toBe("en-US");
      expect(result.lastModifiedBy).toBe("Test Editor");
      expect(result.created).toBeInstanceOf(Date);
      expect(result.modified).toBeInstanceOf(Date);
      expect(result.revision).toBe(5);
    });

    test("should handle empty core properties", async () => {
      const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties">
        </cp:coreProperties>`;

      const result = await Effect.runPromise(parseCoreProperties(coreXml));

      expect(result).toEqual({});
    });

    test("should handle keywords with semicolon separator", async () => {
      const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties">
          <cp:keywords>word1; word2; word3</cp:keywords>
        </cp:coreProperties>`;

      const result = await Effect.runPromise(parseCoreProperties(coreXml));

      expect(result.keywords).toEqual(["word1", "word2", "word3"]);
    });

    test("should handle empty keywords", async () => {
      const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties">
          <cp:keywords></cp:keywords>
        </cp:coreProperties>`;

      const result = await Effect.runPromise(parseCoreProperties(coreXml));

      expect(result.keywords).toEqual([]);
    });

    test("should handle invalid dates gracefully", async () => {
      const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dcterms="http://purl.org/dc/terms/">
          <dcterms:created>invalid-date</dcterms:created>
          <dcterms:modified></dcterms:modified>
        </cp:coreProperties>`;

      const result = await Effect.runPromise(parseCoreProperties(coreXml));

      expect(result.created).toBeUndefined();
      expect(result.modified).toBeUndefined();
    });

    test("should handle invalid revision numbers", async () => {
      const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties">
          <cp:revision>not-a-number</cp:revision>
        </cp:coreProperties>`;

      const result = await Effect.runPromise(parseCoreProperties(coreXml));

      expect(result.revision).toBeUndefined();
    });

    test("should fail with invalid XML", async () => {
      const invalidXml = "not valid xml";

      await expect(Effect.runPromise(parseCoreProperties(invalidXml))).rejects.toThrow();
    });
  });

  describe("parseAppProperties", () => {
    test("should parse complete app properties XML", async () => {
      const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
          <Application>Microsoft Office Word</Application>
          <AppVersion>16.0000</AppVersion>
          <Template>Normal.dotm</Template>
          <Company>Test Company</Company>
          <Manager>Test Manager</Manager>
          <Pages>10</Pages>
          <Words>1500</Words>
          <Characters>8000</Characters>
          <CharactersWithSpaces>9500</CharactersWithSpaces>
          <Lines>75</Lines>
          <Paragraphs>25</Paragraphs>
        </Properties>`;

      const result = await Effect.runPromise(parseAppProperties(appXml));

      expect(result.application).toBe("Microsoft Office Word");
      expect(result.appVersion).toBe("16.0000");
      expect(result.template).toBe("Normal.dotm");
      expect(result.company).toBe("Test Company");
      expect(result.manager).toBe("Test Manager");
      expect(result.pages).toBe(10);
      expect(result.words).toBe(1500);
      expect(result.characters).toBe(8000);
      expect(result.charactersWithSpaces).toBe(9500);
      expect(result.lines).toBe(75);
      expect(result.paragraphs).toBe(25);
    });

    test("should handle empty app properties", async () => {
      const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
        </Properties>`;

      const result = await Effect.runPromise(parseAppProperties(appXml));

      expect(result).toEqual({});
    });

    test("should handle invalid numeric values", async () => {
      const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
          <Pages>not-a-number</Pages>
          <Words></Words>
          <Characters>0</Characters>
        </Properties>`;

      const result = await Effect.runPromise(parseAppProperties(appXml));

      expect(result.pages).toBeUndefined();
      expect(result.words).toBeUndefined();
      expect(result.characters).toBeUndefined(); // parseInt("") returns NaN, || undefined makes it undefined
    });

    test("should fail with invalid XML", async () => {
      const invalidXml = "<invalid><unclosed>";

      await expect(Effect.runPromise(parseAppProperties(invalidXml))).rejects.toThrow();
    });
  });

  describe("extractDocumentOutline", () => {
    test("should extract headings from document XML", async () => {
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
              <w:pPr>
                <w:pStyle w:val="Heading2"/>
              </w:pPr>
              <w:r>
                <w:t>Section 1.1</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Normal"/>
              </w:pPr>
              <w:r>
                <w:t>Regular paragraph</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Title"/>
              </w:pPr>
              <w:r>
                <w:t>Document Title</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;

      const result = await Effect.runPromise(extractDocumentOutline(documentXml));

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        level: 1,
        title: "Chapter 1",
        style: "Heading1",
      });
      expect(result[1]).toEqual({
        level: 2,
        title: "Section 1.1",
        style: "Heading2",
      });
      expect(result[2]).toEqual({
        level: 1,
        title: "Document Title",
        style: "Title",
      });
    });

    test("should handle multiple text runs in heading", async () => {
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Heading1"/>
              </w:pPr>
              <w:r>
                <w:t>Multi</w:t>
              </w:r>
              <w:r>
                <w:t> </w:t>
              </w:r>
              <w:r>
                <w:t>Run</w:t>
              </w:r>
              <w:r>
                <w:t> Heading</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;

      const result = await Effect.runPromise(extractDocumentOutline(documentXml));

      expect(result).toHaveLength(1);
      expect(result[0]?.title).toBe("Multi Run Heading");
    });

    test("should skip paragraphs without heading styles", async () => {
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>No style paragraph</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
              </w:pPr>
              <w:r>
                <w:t>Empty pPr paragraph</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;

      const result = await Effect.runPromise(extractDocumentOutline(documentXml));

      expect(result).toHaveLength(0);
    });

    test("should skip empty headings", async () => {
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Heading1"/>
              </w:pPr>
            </w:p>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Heading2"/>
              </w:pPr>
              <w:r>
                <w:t>   </w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;

      const result = await Effect.runPromise(extractDocumentOutline(documentXml));

      expect(result).toHaveLength(0);
    });

    test("should handle h1-h6 style names", async () => {
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="h1"/>
              </w:pPr>
              <w:r>
                <w:t>H1 Heading</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="h3"/>
              </w:pPr>
              <w:r>
                <w:t>H3 Heading</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;

      const result = await Effect.runPromise(extractDocumentOutline(documentXml));

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        level: 1,
        title: "H1 Heading",
        style: "h1",
      });
      expect(result[1]).toEqual({
        level: 3,
        title: "H3 Heading",
        style: "h3",
      });
    });

    test("should fail with invalid XML", async () => {
      const invalidXml = "<w:document><unclosed>";

      await expect(Effect.runPromise(extractDocumentOutline(invalidXml))).rejects.toThrow();
    });
  });

  describe("analyzeStyleUsage", () => {
    test("should analyze paragraph and run styles", async () => {
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Heading1"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:rStyle w:val="CharBold"/>
                </w:rPr>
                <w:t>Styled text</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Heading1"/>
              </w:pPr>
              <w:r>
                <w:t>Another heading</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="BodyParagraph"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:rStyle w:val="RunDefault"/>
                </w:rPr>
                <w:t>Strong text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;

      const result = await Effect.runPromise(analyzeStyleUsage(documentXml));

      expect(result).toHaveLength(4);

      const heading1Style = result.find((s) => s.name === "Heading1");
      expect(heading1Style).toEqual({
        name: "Heading1",
        usage: 2,
        type: "paragraph",
      });

      const charStyle = result.find((s) => s.name === "CharBold");
      expect(charStyle).toEqual({
        name: "CharBold",
        usage: 1,
        type: "character", // "CharBold" matches /char|run|font/i pattern
      });

      const paragraphStyle = result.find((s) => s.name === "BodyParagraph");
      expect(paragraphStyle).toEqual({
        name: "BodyParagraph",
        usage: 1,
        type: "paragraph", // "BodyParagraph" matches /paragraph|para/i pattern
      });

      const runStyle = result.find((s) => s.name === "RunDefault");
      expect(runStyle).toEqual({
        name: "RunDefault",
        usage: 1,
        type: "character", // "RunDefault" matches /char|run|font/i pattern
      });
    });

    test("should handle document without styles", async () => {
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>No styles</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;

      const result = await Effect.runPromise(analyzeStyleUsage(documentXml));

      expect(result).toHaveLength(0);
    });

    test("should categorize table and numbering styles", async () => {
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="TableHeader"/>
              </w:pPr>
              <w:r>
                <w:t>Table header</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="ListNumber"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:rStyle w:val="CharacterFont"/>
                </w:rPr>
                <w:t>List item</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;

      const result = await Effect.runPromise(analyzeStyleUsage(documentXml));

      expect(result).toHaveLength(3);

      const tableStyle = result.find((s) => s.name === "TableHeader");
      expect(tableStyle?.type).toBe("table");

      const listStyle = result.find((s) => s.name === "ListNumber");
      expect(listStyle?.type).toBe("numbering"); // "ListNumber" matches /list|num/i pattern

      const charStyle = result.find((s) => s.name === "CharacterFont");
      expect(charStyle?.type).toBe("character"); // "CharacterFont" matches /char|run|font/i pattern
    });

    test("should fail with invalid XML", async () => {
      const invalidXml = "<w:document><unclosed>";

      await expect(Effect.runPromise(analyzeStyleUsage(invalidXml))).rejects.toThrow();
    });
  });

  describe("extractCompleteMetadata", () => {
    test("should combine all metadata sources", async () => {
      const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title>Complete Test</dc:title>
          <dc:creator>Test Author</dc:creator>
        </cp:coreProperties>`;

      const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
          <Application>Test App</Application>
          <Pages>5</Pages>
        </Properties>`;

      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Heading1"/>
              </w:pPr>
              <w:r>
                <w:t>Test Heading</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;

      const result = await Effect.runPromise(
        extractCompleteMetadata({
          coreXml,
          appXml,
          documentXml,
        }),
      );

      expect(result.title).toBe("Complete Test");
      expect(result.creator).toBe("Test Author");
      expect(result.application).toBe("Test App");
      expect(result.pages).toBe(5);
      expect(result.outline).toHaveLength(1);
      expect(result.outline?.[0]?.title).toBe("Test Heading");
      expect(result.styleUsage).toHaveLength(1);
      expect(result.extractedAt).toBeInstanceOf(Date);
      expect(result.originalFormat).toBe("docx");
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    test("should handle missing metadata sources", async () => {
      const result = await Effect.runPromise(extractCompleteMetadata({}));

      expect(result.extractedAt).toBeInstanceOf(Date);
      expect(result.originalFormat).toBe("docx");
      expect(result.outline).toEqual([]);
      expect(result.styleUsage).toEqual([]);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    test("should handle partial metadata sources", async () => {
      const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title>Partial Test</dc:title>
        </cp:coreProperties>`;

      const result = await Effect.runPromise(
        extractCompleteMetadata({
          coreXml,
        }),
      );

      expect(result.title).toBe("Partial Test");
      expect(result.outline).toEqual([]);
      expect(result.styleUsage).toEqual([]);
    });

    test("should handle errors in individual parsers", async () => {
      const invalidXml = "<invalid>";

      await expect(
        Effect.runPromise(
          extractCompleteMetadata({
            coreXml: invalidXml,
          }),
        ),
      ).rejects.toThrow();
    });
  });

  describe("DocxMetadataError", () => {
    test("should have correct structure", () => {
      const error = new DocxMetadataError("test message");

      expect(error._tag).toBe("DocxMetadataError");
      expect(error.message).toBe("test message");
    });
  });

  describe("helper functions", () => {
    test("should detect various heading styles", async () => {
      // Test through the extractDocumentOutline function since helpers are not exported
      const testHeadingStyle = async (style: string, shouldBeHeading: boolean) => {
        const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              <w:p>
                <w:pPr>
                  <w:pStyle w:val="${style}"/>
                </w:pPr>
                <w:r>
                  <w:t>Test</w:t>
                </w:r>
              </w:p>
            </w:body>
          </w:document>`;

        const result = await Effect.runPromise(extractDocumentOutline(documentXml));
        return result.length > 0;
      };

      // These should be detected as headings
      expect(await testHeadingStyle("Heading1", true)).toBe(true);
      expect(await testHeadingStyle("heading2", true)).toBe(true);
      expect(await testHeadingStyle("Title", true)).toBe(true);
      expect(await testHeadingStyle("title", true)).toBe(true);
      expect(await testHeadingStyle("h1", true)).toBe(true);
      expect(await testHeadingStyle("H6", true)).toBe(true);

      // These should not be detected as headings
      expect(await testHeadingStyle("Normal", false)).toBe(false);
      expect(await testHeadingStyle("BodyText", false)).toBe(false);
      expect(await testHeadingStyle("ListParagraph", false)).toBe(false);
    });

    test("should extract correct heading levels", async () => {
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Heading3"/>
              </w:pPr>
              <w:r>
                <w:t>Level 3</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="h5"/>
              </w:pPr>
              <w:r>
                <w:t>Level 5</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Title"/>
              </w:pPr>
              <w:r>
                <w:t>Default Level</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;

      const result = await Effect.runPromise(extractDocumentOutline(documentXml));

      expect(result).toHaveLength(3);
      expect(result[0]?.level).toBe(3);
      expect(result[1]?.level).toBe(5);
      expect(result[2]?.level).toBe(1); // Title defaults to level 1
    });
  });
});
