import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { parseDocumentXmlWithDom } from "../src/formats/docx/dom-parser";
import { ST_Underline, ST_HighlightColor } from "@browser-document-viewer/ooxml-types";

describe("Enhanced Text Formatting", () => {
  describe("Color parsing", () => {
    test("should parse valid hex colors", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:color w:val="FF0000"/>
                </w:rPr>
                <w:t>Red text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.runs[0]?.color).toBe("#FF0000");
    });

    test("should ignore auto color", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:color w:val="auto"/>
                </w:rPr>
                <w:t>Auto color text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result[0]?.runs[0]?.color).toBeUndefined();
    });

    test("should handle invalid hex colors gracefully", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:color w:val="invalid"/>
                </w:rPr>
                <w:t>Invalid color text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result[0]?.runs[0]?.color).toBeUndefined();
    });
  });

  describe("Highlight color parsing", () => {
    test("should parse standard highlight colors", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:highlight w:val="yellow"/>
                </w:rPr>
                <w:t>Highlighted text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result[0]?.runs[0]?.highlightColor).toBe("#FFFF00");
    });

    test("should handle none highlight", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:highlight w:val="none"/>
                </w:rPr>
                <w:t>No highlight text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result[0]?.runs[0]?.highlightColor).toBeUndefined();
    });
  });

  describe("Underline parsing", () => {
    test("should parse single underline", async () => {
      const xml = `
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
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result[0]?.runs[0]?.underline).toBe(true);
    });

    test("should parse complex underline types", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:u w:val="double"/>
                </w:rPr>
                <w:t>Double underlined text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result[0]?.runs[0]?.underline).toBe("double");
    });

    test("should handle none underline", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:u w:val="none"/>
                </w:rPr>
                <w:t>No underline text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result[0]?.runs[0]?.underline).toBe(false);
    });
  });

  describe("Font size parsing", () => {
    test("should parse font size correctly", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:sz w:val="24"/>
                </w:rPr>
                <w:t>12pt text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result[0]?.runs[0]?.fontSize).toBe(12); // 24 half-points = 12 points
    });

    test("should handle non-integer font sizes", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:sz w:val="25"/>
                </w:rPr>
                <w:t>12.5pt text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result[0]?.runs[0]?.fontSize).toBe(12.5); // 25 half-points = 12.5 points
    });

    test("should handle invalid font size", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:sz w:val="invalid"/>
                </w:rPr>
                <w:t>Invalid font size</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result[0]?.runs[0]?.fontSize).toBeUndefined();
    });
  });

  describe("Font family parsing", () => {
    test("should parse ASCII font family", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Arial"/>
                </w:rPr>
                <w:t>Arial text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result[0]?.runs[0]?.fontFamily).toBe("Arial");
    });

    test("should prioritize ASCII over other font attributes", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Arial" w:hAnsi="Times" w:cs="Courier"/>
                </w:rPr>
                <w:t>Multiple fonts</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result[0]?.runs[0]?.fontFamily).toBe("Arial");
    });
  });

  describe("Strikethrough parsing", () => {
    test("should parse strikethrough", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:strike/>
                </w:rPr>
                <w:t>Strikethrough text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      expect(result[0]?.runs[0]?.strikethrough).toBe(true);
    });
  });

  describe("Combined formatting", () => {
    test("should parse multiple formatting attributes", async () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:b/>
                  <w:i/>
                  <w:u w:val="single"/>
                  <w:color w:val="0000FF"/>
                  <w:highlight w:val="yellow"/>
                  <w:strike/>
                  <w:sz w:val="28"/>
                  <w:rFonts w:ascii="Helvetica"/>
                </w:rPr>
                <w:t>Fully formatted text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      
      const result = await Effect.runPromise(parseDocumentXmlWithDom(xml));
      const run = result[0]?.runs[0];
      expect(run?.bold).toBe(true);
      expect(run?.italic).toBe(true);
      expect(run?.underline).toBe(true);
      expect(run?.color).toBe("#0000FF");
      expect(run?.highlightColor).toBe("#FFFF00");
      expect(run?.strikethrough).toBe(true);
      expect(run?.fontSize).toBe(14); // 28 half-points = 14 points
      expect(run?.fontFamily).toBe("Helvetica");
    });
  });
});