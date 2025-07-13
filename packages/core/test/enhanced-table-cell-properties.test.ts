import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { parseTableCellProperties } from "../src/formats/docx/table-parser";
import type { ST_VerticalJc } from "@browser-document-viewer/ooxml-types";

// Setup DOM environment for tests
import { JSDOM } from "jsdom";
const dom = new JSDOM();
(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).DOMParser = dom.window.DOMParser;

describe("Enhanced Table Cell Properties", () => {
  describe("Cell merging - colspan", () => {
    test("should parse gridSpan for colspan", async () => {
      const xml = `
        <tcPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:gridSpan w:val="3"/>
        </tcPr>
      `;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const tcPr = doc.documentElement;
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result.colspan).toBe(3);
    });

    test("should ignore gridSpan value of 1", async () => {
      const xml = `
        <tcPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:gridSpan w:val="1"/>
        </tcPr>
      `;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const tcPr = doc.documentElement;
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result.colspan).toBeUndefined();
    });
  });

  describe("Cell merging - rowspan", () => {
    test("should parse vMerge restart", async () => {
      const xml = `
        <tcPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:vMerge w:val="restart"/>
        </tcPr>
      `;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const tcPr = doc.documentElement;
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result.vMergeStart).toBe(true);
      expect(result.vMergeContinue).toBeUndefined();
    });

    test("should parse vMerge continue", async () => {
      const xml = `
        <tcPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:vMerge w:val="continue"/>
        </tcPr>
      `;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const tcPr = doc.documentElement;
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result.vMergeContinue).toBe(true);
      expect(result.vMergeStart).toBeUndefined();
    });

    test("should parse vMerge without val attribute (defaults to continue)", async () => {
      const xml = `
        <tcPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:vMerge/>
        </tcPr>
      `;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const tcPr = doc.documentElement;
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result.vMergeContinue).toBe(true);
      expect(result.vMergeStart).toBeUndefined();
    });
  });

  describe("Text direction", () => {
    test("should parse text direction", async () => {
      const xml = `
        <tcPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:textDirection w:val="tbRl"/>
        </tcPr>
      `;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const tcPr = doc.documentElement;
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result.textDirection).toBe("tbRl");
    });

    test("should handle different text directions", async () => {
      const directions = ["lrTb", "tbRl", "btLr", "lrTbV", "tbRlV", "tbLrV"];
      
      for (const direction of directions) {
        const xml = `
          <tcPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:textDirection w:val="${direction}"/>
          </tcPr>
        `;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "application/xml");
        const tcPr = doc.documentElement;
        
        const result = await Effect.runPromise(parseTableCellProperties(tcPr));
        expect(result.textDirection).toBe(direction);
      }
    });
  });

  describe("Vertical alignment", () => {
    test("should parse vertical alignment with type safety", async () => {
      const alignments: ST_VerticalJc[] = ["top", "center", "bottom"];
      
      for (const alignment of alignments) {
        const xml = `
          <tcPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:vAlign w:val="${alignment}"/>
          </tcPr>
        `;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "application/xml");
        const tcPr = doc.documentElement;
        
        const result = await Effect.runPromise(parseTableCellProperties(tcPr));
        expect(result.alignment).toBe(alignment);
      }
    });
  });

  describe("Combined cell properties", () => {
    test("should parse all enhanced properties together", async () => {
      const xml = `
        <tcPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:tcW w:w="2000" w:type="dxa"/>
          <w:vAlign w:val="center"/>
          <w:gridSpan w:val="2"/>
          <w:vMerge w:val="restart"/>
          <w:textDirection w:val="tbRl"/>
          <w:shd w:fill="FFFF00"/>
        </tcPr>
      `;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const tcPr = doc.documentElement;
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      
      // Existing properties
      expect(result.width).toBe("2000px");
      expect(result.alignment).toBe("center");
      expect(result.backgroundColor).toBe("#FFFF00");
      
      // New enhanced properties
      expect(result.colspan).toBe(2);
      expect(result.vMergeStart).toBe(true);
      expect(result.textDirection).toBe("tbRl");
    });
  });

  describe("Error handling and edge cases", () => {
    test("should handle invalid gridSpan values", async () => {
      const xml = `
        <tcPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:gridSpan w:val="invalid"/>
        </tcPr>
      `;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const tcPr = doc.documentElement;
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result.colspan).toBeUndefined();
    });

    test("should handle missing val attributes gracefully", async () => {
      const xml = `
        <tcPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:gridSpan/>
          <w:textDirection/>
        </tcPr>
      `;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const tcPr = doc.documentElement;
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result.colspan).toBeUndefined();
      expect(result.textDirection).toBeUndefined();
    });

    test("should handle zero and negative gridSpan values", async () => {
      const invalidValues = ["0", "-1", "-5"];
      
      for (const value of invalidValues) {
        const xml = `
          <tcPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:gridSpan w:val="${value}"/>
          </tcPr>
        `;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "application/xml");
        const tcPr = doc.documentElement;
        
        const result = await Effect.runPromise(parseTableCellProperties(tcPr));
        expect(result.colspan).toBeUndefined();
      }
    });
  });

  describe("Backwards compatibility", () => {
    test("should not break existing cell property parsing", async () => {
      const xml = `
        <tcPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:tcW w:w="1000" w:type="dxa"/>
          <w:vAlign w:val="top"/>
          <w:shd w:fill="00FF00"/>
        </tcPr>
      `;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const tcPr = doc.documentElement;
      
      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      
      // Verify existing properties still work
      expect(result.width).toBe("1000px");
      expect(result.alignment).toBe("top");
      expect(result.backgroundColor).toBe("#00FF00");
      
      // New properties should be undefined when not present
      expect(result.colspan).toBeUndefined();
      expect(result.vMergeStart).toBeUndefined();
      expect(result.vMergeContinue).toBeUndefined();
      expect(result.textDirection).toBeUndefined();
    });
  });
});