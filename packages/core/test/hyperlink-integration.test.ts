import { describe, test, expect, beforeAll } from "bun:test";
import { Effect } from "effect";
import {
  parseHyperlinksInParagraph,
  mergeHyperlinksIntoParagraph,
  loadHyperlinkRelationships,
  type ParagraphWithHyperlinks,
} from "../src/formats/docx/hyperlink-integration";
import type { DocxParagraph } from "../src/formats/docx/types";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  const window = new Window();
  (global as any).DOMParser = window.DOMParser;
  (global as any).Document = window.Document;
  (global as any).Element = window.Element;
  (global as any).Node = window.Node;
  (global as any).XMLSerializer = window.XMLSerializer;
});

describe("Hyperlink Integration", () => {
  describe("parseHyperlinksInParagraph", () => {
    test("should parse simple hyperlink", async () => {
      const xml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:hyperlink r:id="rId1">
            <w:r>
              <w:t>Click Here</w:t>
            </w:r>
          </w:hyperlink>
        </w:p>`;
      
      const relationships = new Map([
        ["rId1", { id: "rId1", target: "https://example.com", type: "hyperlink" }],
      ]);

      const result = await Effect.runPromise(parseHyperlinksInParagraph(xml, relationships));
      expect(result).toHaveLength(1);
      expect(result[0]?.url).toBe("https://example.com");
      expect(result[0]?.runs).toHaveLength(1);
      expect(result[0]?.runs[0]?.text).toBe("Click Here");
    });

    test("should parse multiple hyperlinks", async () => {
      const xml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:hyperlink r:id="rId1">
            <w:r>
              <w:t>First Link</w:t>
            </w:r>
          </w:hyperlink>
          <w:r>
            <w:t> and </w:t>
          </w:r>
          <w:hyperlink r:id="rId2">
            <w:r>
              <w:t>Second Link</w:t>
            </w:r>
          </w:hyperlink>
        </w:p>`;
      
      const relationships = new Map([
        ["rId1", { id: "rId1", target: "https://first.com", type: "hyperlink" }],
        ["rId2", { id: "rId2", target: "https://second.com", type: "hyperlink" }],
      ]);

      const result = await Effect.runPromise(parseHyperlinksInParagraph(xml, relationships));
      expect(result).toHaveLength(2);
      expect(result[0]?.url).toBe("https://first.com");
      expect(result[1]?.url).toBe("https://second.com");
    });

    test("should handle paragraph without namespace declaration", async () => {
      const xml = `
        <w:p>
          <w:hyperlink r:id="rId1">
            <w:r>
              <w:t>Link Text</w:t>
            </w:r>
          </w:hyperlink>
        </w:p>`;
      
      const relationships = new Map([
        ["rId1", { id: "rId1", target: "https://example.com", type: "hyperlink" }],
      ]);

      const result = await Effect.runPromise(parseHyperlinksInParagraph(xml, relationships));
      expect(result).toHaveLength(1);
      expect(result[0]?.url).toBe("https://example.com");
    });

    test("should handle hyperlink without relationship", async () => {
      const xml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:hyperlink>
            <w:r>
              <w:t>No URL Link</w:t>
            </w:r>
          </w:hyperlink>
        </w:p>`;
      
      const relationships = new Map();

      const result = await Effect.runPromise(parseHyperlinksInParagraph(xml, relationships));
      expect(result).toHaveLength(1);
      expect(result[0]?.url).toBeUndefined();
      expect(result[0]?.runs).toHaveLength(1);
    });

    test("should handle empty paragraph", async () => {
      const xml = `<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"></w:p>`;
      const relationships = new Map();

      const result = await Effect.runPromise(parseHyperlinksInParagraph(xml, relationships));
      expect(result).toHaveLength(0);
    });

    test("should handle invalid XML", async () => {
      const xml = `<w:p><w:hyperlink`;
      const relationships = new Map();

      await expect(Effect.runPromise(parseHyperlinksInParagraph(xml, relationships))).rejects.toThrow();
    });

    test("should handle hyperlink with multiple runs", async () => {
      const xml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:hyperlink r:id="rId1">
            <w:r>
              <w:rPr>
                <w:b/>
              </w:rPr>
              <w:t>Bold</w:t>
            </w:r>
            <w:r>
              <w:t> </w:t>
            </w:r>
            <w:r>
              <w:rPr>
                <w:i/>
              </w:rPr>
              <w:t>Italic</w:t>
            </w:r>
          </w:hyperlink>
        </w:p>`;
      
      const relationships = new Map([
        ["rId1", { id: "rId1", target: "https://example.com", type: "hyperlink" }],
      ]);

      const result = await Effect.runPromise(parseHyperlinksInParagraph(xml, relationships));
      expect(result).toHaveLength(1);
      expect(result[0]?.runs).toHaveLength(3);
      expect(result[0]?.runs[0]?.text).toBe("Bold");
      expect(result[0]?.runs[0]?.bold).toBe(true);
      expect(result[0]?.runs[2]?.text).toBe("Italic");
      expect(result[0]?.runs[2]?.italic).toBe(true);
    });
  });

  describe("mergeHyperlinksIntoParagraph", () => {
    test("should merge hyperlinks into paragraph", async () => {
      const paragraph: DocxParagraph = {
        type: "paragraph",
        runs: [],
      };

      const xml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:t>Before </w:t>
          </w:r>
          <w:hyperlink r:id="rId1">
            <w:r>
              <w:t>Link</w:t>
            </w:r>
          </w:hyperlink>
          <w:r>
            <w:t> After</w:t>
          </w:r>
        </w:p>`;
      
      const relationships = new Map([
        ["rId1", { id: "rId1", target: "https://example.com", type: "hyperlink" }],
      ]);

      const result = await Effect.runPromise(
        mergeHyperlinksIntoParagraph(paragraph, xml, relationships)
      );
      
      expect(result.runs).toHaveLength(3);
      expect(result.runs[0]?.text).toBe("Before ");
      expect(result.runs[0]?.hyperlink).toBeUndefined();
      expect(result.runs[1]?.text).toBe("Link");
      expect(result.runs[1]?.hyperlink).toBe("https://example.com");
      expect(result.runs[2]?.text).toBe(" After");
      expect(result.runs[2]?.hyperlink).toBeUndefined();
    });

    test("should return original paragraph if no hyperlinks", async () => {
      const paragraph: DocxParagraph = {
        type: "paragraph",
        runs: [{ text: "No hyperlinks here" }],
      };

      const xml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:t>No hyperlinks here</w:t>
          </w:r>
        </w:p>`;
      
      const relationships = new Map();

      const result = await Effect.runPromise(
        mergeHyperlinksIntoParagraph(paragraph, xml, relationships)
      );
      
      expect(result).toBe(paragraph);
    });

    test("should handle nested elements", async () => {
      const paragraph: DocxParagraph = {
        type: "paragraph",
        runs: [],
      };

      const xml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:pPr>
            <w:pStyle w:val="Heading1"/>
          </w:pPr>
          <w:r>
            <w:t>Heading with </w:t>
          </w:r>
          <w:hyperlink r:id="rId1">
            <w:r>
              <w:t>link</w:t>
            </w:r>
          </w:hyperlink>
        </w:p>`;
      
      const relationships = new Map([
        ["rId1", { id: "rId1", target: "https://example.com", type: "hyperlink" }],
      ]);

      const result = await Effect.runPromise(
        mergeHyperlinksIntoParagraph(paragraph, xml, relationships)
      );
      
      expect(result.runs).toHaveLength(2);
      expect(result.runs[0]?.text).toBe("Heading with ");
      expect(result.runs[1]?.text).toBe("link");
      expect(result.runs[1]?.hyperlink).toBe("https://example.com");
    });

    test("should handle formatting in non-hyperlink runs", async () => {
      const paragraph: DocxParagraph = {
        type: "paragraph",
        runs: [],
      };

      const xml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:rPr>
              <w:b/>
              <w:i/>
            </w:rPr>
            <w:t>Bold Italic</w:t>
          </w:r>
          <w:hyperlink r:id="rId1">
            <w:r>
              <w:rPr>
                <w:u w:val="single"/>
              </w:rPr>
              <w:t>Underlined Link</w:t>
            </w:r>
          </w:hyperlink>
        </w:p>`;
      
      const relationships = new Map([
        ["rId1", { id: "rId1", target: "https://example.com", type: "hyperlink" }],
      ]);

      const result = await Effect.runPromise(
        mergeHyperlinksIntoParagraph(paragraph, xml, relationships)
      );
      
      expect(result.runs).toHaveLength(2);
      expect(result.runs[0]?.text).toBe("Bold Italic");
      expect(result.runs[0]?.bold).toBe(true);
      expect(result.runs[0]?.italic).toBe(true);
      expect(result.runs[1]?.text).toBe("Underlined Link");
      expect(result.runs[1]?.underline).toBe(true);
      expect(result.runs[1]?.hyperlink).toBe("https://example.com");
    });

    test("should handle paragraph without namespace", async () => {
      const paragraph: DocxParagraph = {
        type: "paragraph",
        runs: [],
      };

      const xml = `
        <w:p>
          <w:hyperlink r:id="rId1">
            <w:r>
              <w:t>Link</w:t>
            </w:r>
          </w:hyperlink>
        </w:p>`;
      
      const relationships = new Map([
        ["rId1", { id: "rId1", target: "https://example.com", type: "hyperlink" }],
      ]);

      const result = await Effect.runPromise(
        mergeHyperlinksIntoParagraph(paragraph, xml, relationships)
      );
      
      expect(result.runs).toHaveLength(1);
      expect(result.runs[0]?.hyperlink).toBe("https://example.com");
    });

    test("should handle invalid XML gracefully", async () => {
      const paragraph: DocxParagraph = {
        type: "paragraph",
        runs: [],
      };

      const xml = `<w:p><w:hyperlink`;
      const relationships = new Map();

      await expect(
        Effect.runPromise(mergeHyperlinksIntoParagraph(paragraph, xml, relationships))
      ).rejects.toThrow();
    });
  });

  describe("loadHyperlinkRelationships", () => {
    test("should parse relationships XML", async () => {
      const relsXml = `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com" TargetMode="External"/>
          <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://another.com" TargetMode="External"/>
        </Relationships>`;

      const result = await Effect.runPromise(loadHyperlinkRelationships(relsXml));
      expect(result.size).toBe(2);
      expect(result.get("rId1")?.target).toBe("https://example.com");
      expect(result.get("rId2")?.target).toBe("https://another.com");
    });

    test("should handle undefined relationships XML", async () => {
      const result = await Effect.runPromise(loadHyperlinkRelationships(undefined));
      expect(result.size).toBe(0);
    });

    test("should handle empty relationships XML", async () => {
      const relsXml = `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        </Relationships>`;

      const result = await Effect.runPromise(loadHyperlinkRelationships(relsXml));
      expect(result.size).toBe(0);
    });

    test("should handle invalid relationships XML", async () => {
      const relsXml = `<Relationships><Invalid`;

      await expect(Effect.runPromise(loadHyperlinkRelationships(relsXml))).rejects.toThrow();
    });
  });

  describe("Type definitions", () => {
    test("ParagraphWithHyperlinks should extend DocxParagraph", () => {
      const paragraph: ParagraphWithHyperlinks = {
        type: "paragraph",
        runs: [{ text: "test" }],
        hyperlinks: [
          {
            runs: [{ text: "link" }],
            url: "https://example.com",
            startIndex: 0,
            endIndex: 1,
          },
        ],
      };

      expect(paragraph.type).toBe("paragraph");
      expect(paragraph.hyperlinks).toBeDefined();
    });
  });

  describe("Edge cases", () => {
    test("should handle runs with false formatting values", async () => {
      const paragraph: DocxParagraph = {
        type: "paragraph",
        runs: [],
      };

      const xml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:rPr>
              <w:b w:val="false"/>
              <w:i w:val="0"/>
              <w:u w:val="none"/>
            </w:rPr>
            <w:t>Not formatted</w:t>
          </w:r>
        </w:p>`;
      
      const relationships = new Map();

      const result = await Effect.runPromise(
        mergeHyperlinksIntoParagraph(paragraph, xml, relationships)
      );
      
      // The paragraph has no hyperlinks, so it returns the original paragraph
      expect(result).toBe(paragraph);
    });

    test("should handle empty text runs", async () => {
      const paragraph: DocxParagraph = {
        type: "paragraph",
        runs: [],
      };

      const xml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:t></w:t>
          </w:r>
          <w:r>
            <w:t>Non-empty</w:t>
          </w:r>
        </w:p>`;
      
      const relationships = new Map();

      const result = await Effect.runPromise(
        mergeHyperlinksIntoParagraph(paragraph, xml, relationships)
      );
      
      // The paragraph has no hyperlinks, so it returns the original paragraph
      expect(result).toBe(paragraph);
    });

    test("should handle missing outerHTML property", async () => {
      const xml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:hyperlink r:id="rId1">
            <w:r>
              <w:t>Test</w:t>
            </w:r>
          </w:hyperlink>
        </w:p>`;
      
      const relationships = new Map([
        ["rId1", { id: "rId1", target: "https://example.com", type: "hyperlink" }],
      ]);

      // This should still work using XMLSerializer fallback
      const result = await Effect.runPromise(parseHyperlinksInParagraph(xml, relationships));
      expect(result).toHaveLength(1);
      expect(result[0]?.url).toBe("https://example.com");
    });
  });
});