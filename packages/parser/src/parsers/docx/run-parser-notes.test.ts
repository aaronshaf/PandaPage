import { describe, test, expect } from "bun:test";
import { parseRunElement } from "./run-parser";
import { WORD_NAMESPACE } from "./types";
import type { DocxRun } from "./types";
import type { Image } from "../../types/document";
import type { FieldParsingState } from "./run-parser";

// Helper to create a DOM parser
function createDocument(xml: string): Document {
  if (typeof DOMParser === "undefined") {
    const { DOMParser: XMLDOMParser } = require("@xmldom/xmldom");
    const parser = new XMLDOMParser();
    return parser.parseFromString(xml, "text/xml");
  } else {
    const parser = new DOMParser();
    return parser.parseFromString(xml, "text/xml");
  }
}

describe("Run Parser - Notes Support", () => {
  describe("Footnote References", () => {
    test("should parse footnote reference", () => {
      const xml = `<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:footnoteReference w:id="2"/>
      </w:r>`;
      
      const doc = createDocument(xml);
      const element = doc.documentElement;
      const runs: DocxRun[] = [];
      const images: Image[] = [];
      const fieldState: FieldParsingState = {
        inField: false,
        fieldInstruction: "",
        fieldRunProperties: null,
        skipFieldValue: false,
      };
      
      parseRunElement(
        element,
        WORD_NAMESPACE,
        runs,
        images,
        undefined,
        undefined,
        fieldState,
        () => {},
      );
      
      expect(runs).toHaveLength(1);
      expect(runs[0].text).toBe("2");
      expect(runs[0].superscript).toBe(true);
      expect(runs[0]._footnoteRef).toBe("2");
    });
  });
  
  describe("Endnote References", () => {
    test("should parse endnote reference", () => {
      const xml = `<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:endnoteReference w:id="1"/>
      </w:r>`;
      
      const doc = createDocument(xml);
      const element = doc.documentElement;
      const runs: DocxRun[] = [];
      const images: Image[] = [];
      const fieldState: FieldParsingState = {
        inField: false,
        fieldInstruction: "",
        fieldRunProperties: null,
        skipFieldValue: false,
      };
      
      parseRunElement(
        element,
        WORD_NAMESPACE,
        runs,
        images,
        undefined,
        undefined,
        fieldState,
        () => {},
      );
      
      expect(runs).toHaveLength(1);
      expect(runs[0].text).toBe("1");
      expect(runs[0].superscript).toBe(true);
      expect(runs[0]._endnoteRef).toBe("1");
    });
  });
  
  describe("Mixed Content", () => {
    test("should handle run with text and footnote reference", () => {
      const xml = `<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:t>Some text</w:t>
        <w:footnoteReference w:id="3"/>
      </w:r>`;
      
      const doc = createDocument(xml);
      const element = doc.documentElement;
      const runs: DocxRun[] = [];
      const images: Image[] = [];
      const fieldState: FieldParsingState = {
        inField: false,
        fieldInstruction: "",
        fieldRunProperties: null,
        skipFieldValue: false,
      };
      
      parseRunElement(
        element,
        WORD_NAMESPACE,
        runs,
        images,
        undefined,
        undefined,
        fieldState,
        () => {},
      );
      
      // The run parser will create a footnote reference run when it encounters footnoteReference
      expect(runs).toHaveLength(1);
      expect(runs[0].text).toBe("3");
      expect(runs[0].superscript).toBe(true);
      expect(runs[0]._footnoteRef).toBe("3");
    });
  });
});