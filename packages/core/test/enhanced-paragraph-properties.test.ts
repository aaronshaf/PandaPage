import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { parseDocumentXmlWithDom } from "../src/formats/docx/dom-parser";
import { ST_Jc } from "@browser-document-viewer/ooxml-types";

describe("Enhanced Paragraph Properties", () => {
  describe("Paragraph alignment", () => {
    test("should parse left alignment", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:jc w:val="left"/>
              </w:pPr>
              <w:r>
                <w:t>Left aligned text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.alignment).toBe("left");
    });

    test("should parse center alignment", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:jc w:val="center"/>
              </w:pPr>
              <w:r>
                <w:t>Center aligned text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.alignment).toBe("center");
    });

    test("should parse right alignment", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:jc w:val="right"/>
              </w:pPr>
              <w:r>
                <w:t>Right aligned text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.alignment).toBe("right");
    });

    test("should parse justify alignment", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:jc w:val="both"/>
              </w:pPr>
              <w:r>
                <w:t>Justified text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.alignment).toBe("both");
    });
  });

  describe("Paragraph indentation", () => {
    test("should parse left indentation", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:ind w:left="720"/>
              </w:pPr>
              <w:r>
                <w:t>Indented text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.indentation?.left).toBe(720);
    });

    test("should parse right indentation", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:ind w:right="360"/>
              </w:pPr>
              <w:r>
                <w:t>Right indented text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.indentation?.right).toBe(360);
    });

    test("should parse first line indentation", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:ind w:firstLine="360"/>
              </w:pPr>
              <w:r>
                <w:t>First line indented text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.indentation?.firstLine).toBe(360);
    });

    test("should parse hanging indentation", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:ind w:hanging="360"/>
              </w:pPr>
              <w:r>
                <w:t>Hanging indented text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.indentation?.hanging).toBe(360);
    });

    test("should parse multiple indentation properties", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:ind w:left="720" w:right="360" w:firstLine="180"/>
              </w:pPr>
              <w:r>
                <w:t>Complex indented text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.indentation?.left).toBe(720);
      expect(result[0]?.indentation?.right).toBe(360);
      expect(result[0]?.indentation?.firstLine).toBe(180);
    });
  });

  describe("Paragraph spacing", () => {
    test("should parse before spacing", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:spacing w:before="240"/>
              </w:pPr>
              <w:r>
                <w:t>Spaced before text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.spacing?.before).toBe(240);
    });

    test("should parse after spacing", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:spacing w:after="120"/>
              </w:pPr>
              <w:r>
                <w:t>Spaced after text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.spacing?.after).toBe(120);
    });

    test("should parse line spacing", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:spacing w:line="360"/>
              </w:pPr>
              <w:r>
                <w:t>Line spaced text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.spacing?.line).toBe(360);
    });

    test("should parse multiple spacing properties", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:spacing w:before="240" w:after="120" w:line="360"/>
              </w:pPr>
              <w:r>
                <w:t>Complex spaced text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.spacing?.before).toBe(240);
      expect(result[0]?.spacing?.after).toBe(120);
      expect(result[0]?.spacing?.line).toBe(360);
    });
  });

  describe("Combined paragraph properties", () => {
    test("should parse all paragraph properties together", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:jc w:val="center"/>
                <w:ind w:left="720" w:right="360" w:firstLine="180"/>
                <w:spacing w:before="240" w:after="120" w:line="360"/>
              </w:pPr>
              <w:r>
                <w:t>Fully formatted paragraph</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      const paragraph = result[0];
      
      // Alignment
      expect(paragraph?.alignment).toBe("center");
      
      // Indentation
      expect(paragraph?.indentation?.left).toBe(720);
      expect(paragraph?.indentation?.right).toBe(360);
      expect(paragraph?.indentation?.firstLine).toBe(180);
      
      // Spacing
      expect(paragraph?.spacing?.before).toBe(240);
      expect(paragraph?.spacing?.after).toBe(120);
      expect(paragraph?.spacing?.line).toBe(360);
    });
  });

  describe("Error handling", () => {
    test("should handle paragraph without properties", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>Plain paragraph</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.alignment).toBeUndefined();
      expect(result[0]?.indentation).toBeUndefined();
      expect(result[0]?.spacing).toBeUndefined();
    });

    test("should handle empty property elements", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:jc/>
                <w:ind/>
                <w:spacing/>
              </w:pPr>
              <w:r>
                <w:t>Empty properties</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.alignment).toBeUndefined();
      expect(result[0]?.indentation).toBeUndefined();
      expect(result[0]?.spacing).toBeUndefined();
    });
  });
});