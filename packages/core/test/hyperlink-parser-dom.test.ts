import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import { parseHyperlinkRelationships, parseHyperlink } from "../src/formats/docx/hyperlink-parser";

describe("Hyperlink Parser - DOM Based", () => {
  describe("parseHyperlinkRelationships", () => {
    test("should parse hyperlink relationships from XML", async () => {
      const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com" TargetMode="External"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://google.com"/>
</Relationships>`;

      const result = await Effect.runPromise(parseHyperlinkRelationships(relsXml));
      
      expect(result.size).toBe(2);
      expect(result.get("rId1")).toEqual({
        id: "rId1",
        target: "https://example.com",
        targetMode: "External"
      });
      expect(result.get("rId2")).toEqual({
        id: "rId2",
        target: "https://google.com"
      });
    });
  });

  describe("parseHyperlink", () => {
    test("should parse hyperlink with external URL", async () => {
      const relationships = new Map([
        ["rId1", { id: "rId1", target: "https://example.com", targetMode: "External" }]
      ]);
      
      const hyperlinkXml = `<w:hyperlink r:id="rId1" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
        <w:r>
          <w:t>Visit Example</w:t>
        </w:r>
      </w:hyperlink>`;

      const result = await Effect.runPromise(parseHyperlink(hyperlinkXml, relationships));
      
      expect(result.url).toBe("https://example.com");
      expect(result.runs).toHaveLength(1);
      expect(result.runs[0]?.text).toBe("Visit Example");
      expect(result.runs[0]?.hyperlink).toBe("https://example.com");
    });

    test("should parse hyperlink with anchor", async () => {
      const hyperlinkXml = `<w:hyperlink w:anchor="section1" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:r>
          <w:t>Go to Section 1</w:t>
        </w:r>
      </w:hyperlink>`;

      const result = await Effect.runPromise(parseHyperlink(hyperlinkXml, new Map()));
      
      expect(result.url).toBe("#section1");
      expect(result.runs).toHaveLength(1);
      expect(result.runs[0]?.text).toBe("Go to Section 1");
      expect(result.runs[0]?.hyperlink).toBe("#section1");
    });

    test("should parse hyperlink without namespace declarations", async () => {
      const relationships = new Map([
        ["rId1", { id: "rId1", target: "https://example.com" }]
      ]);
      
      const hyperlinkXml = `<w:hyperlink r:id="rId1">
        <w:r>
          <w:t>Visit Example</w:t>
        </w:r>
      </w:hyperlink>`;

      const result = await Effect.runPromise(parseHyperlink(hyperlinkXml, relationships));
      
      expect(result.url).toBe("https://example.com");
      expect(result.runs).toHaveLength(1);
      expect(result.runs[0]?.text).toBe("Visit Example");
      expect(result.runs[0]?.hyperlink).toBe("https://example.com");
    });

    test("should parse hyperlink with formatting", async () => {
      const relationships = new Map([
        ["rId1", { id: "rId1", target: "https://example.com" }]
      ]);
      
      const hyperlinkXml = `<w:hyperlink r:id="rId1">
        <w:r>
          <w:rPr>
            <w:b/>
            <w:u w:val="single"/>
          </w:rPr>
          <w:t>Bold Link</w:t>
        </w:r>
      </w:hyperlink>`;

      const result = await Effect.runPromise(parseHyperlink(hyperlinkXml, relationships));
      
      expect(result.url).toBe("https://example.com");
      expect(result.runs).toHaveLength(1);
      expect(result.runs[0]?.text).toBe("Bold Link");
      expect(result.runs[0]?.bold).toBe(true);
      expect(result.runs[0]?.underline).toBe(true);
      expect(result.runs[0]?.hyperlink).toBe("https://example.com");
    });
  });
});