import { describe, it, expect } from "bun:test";
import "../../test-setup";
import { parseParagraph } from "./paragraph-parser";
import { parseStylesheet } from "./style-parser";
import { WORD_NAMESPACE } from "./types";
import { ST_Border, ST_Shd } from "@browser-document-viewer/ooxml-types";

describe("Paragraph Borders and Shading", () => {
  const ns = WORD_NAMESPACE;

  describe("Border Parsing", () => {
    it("should parse paragraph with all borders", () => {
      const xml = `
        <w:p xmlns:w="${ns}">
          <w:pPr>
            <w:pBdr>
              <w:top w:val="single" w:sz="4" w:space="1" w:color="FF0000"/>
              <w:bottom w:val="double" w:sz="8" w:space="2" w:color="00FF00"/>
              <w:left w:val="dashed" w:sz="6" w:space="3" w:color="0000FF"/>
              <w:right w:val="dotted" w:sz="2" w:space="4" w:color="000000"/>
            </w:pBdr>
          </w:pPr>
          <w:r>
            <w:t>Text with borders</w:t>
          </w:r>
        </w:p>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const paragraph = doc.documentElement;

      const result = parseParagraph(paragraph);

      expect(result).toBeDefined();
      expect(result?.borders).toBeDefined();
      expect(result?.borders?.top).toEqual({
        style: ST_Border.Single,
        size: 4,
        space: 1,
        color: "#FF0000",
      });
      expect(result?.borders?.bottom).toEqual({
        style: ST_Border.Double,
        size: 8,
        space: 2,
        color: "#00FF00",
      });
      expect(result?.borders?.left).toEqual({
        style: ST_Border.Dashed,
        size: 6,
        space: 3,
        color: "#0000FF",
      });
      expect(result?.borders?.right).toEqual({
        style: ST_Border.Dotted,
        size: 2,
        space: 4,
        color: "#000000",
      });
    });

    it("should parse paragraph with between border", () => {
      const xml = `
        <w:p xmlns:w="${ns}">
          <w:pPr>
            <w:pBdr>
              <w:between w:val="single" w:sz="4" w:color="808080"/>
            </w:pBdr>
          </w:pPr>
          <w:r>
            <w:t>Text with between border</w:t>
          </w:r>
        </w:p>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const paragraph = doc.documentElement;

      const result = parseParagraph(paragraph);

      expect(result?.borders).toBeDefined();
      expect(result?.borders?.between).toEqual({
        style: ST_Border.Single,
        size: 4,
        color: "#808080",
      });
    });

    it("should handle borders with auto color", () => {
      const xml = `
        <w:p xmlns:w="${ns}">
          <w:pPr>
            <w:pBdr>
              <w:top w:val="single" w:sz="4" w:color="auto"/>
            </w:pBdr>
          </w:pPr>
          <w:r>
            <w:t>Text with auto color border</w:t>
          </w:r>
        </w:p>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const paragraph = doc.documentElement;

      const result = parseParagraph(paragraph);

      expect(result?.borders).toBeDefined();
      expect(result?.borders?.top).toEqual({
        style: ST_Border.Single,
        size: 4,
      });
      expect(result?.borders?.top?.color).toBeUndefined();
    });

    it("should handle none/nil border style", () => {
      const xml = `
        <w:p xmlns:w="${ns}">
          <w:pPr>
            <w:pBdr>
              <w:top w:val="none"/>
              <w:bottom w:val="nil"/>
            </w:pBdr>
          </w:pPr>
          <w:r>
            <w:t>Text with no borders</w:t>
          </w:r>
        </w:p>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const paragraph = doc.documentElement;

      const result = parseParagraph(paragraph);

      expect(result?.borders).toBeDefined();
      expect(result?.borders?.top?.style).toBe(ST_Border.None);
      expect(result?.borders?.bottom?.style).toBe(ST_Border.Nil);
    });
  });

  describe("Shading Parsing", () => {
    it("should parse paragraph with solid shading", () => {
      const xml = `
        <w:p xmlns:w="${ns}">
          <w:pPr>
            <w:shd w:val="clear" w:fill="FFFF00" w:color="auto"/>
          </w:pPr>
          <w:r>
            <w:t>Text with yellow background</w:t>
          </w:r>
        </w:p>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const paragraph = doc.documentElement;

      const result = parseParagraph(paragraph);

      expect(result?.shading).toBeDefined();
      expect(result?.shading).toEqual({
        val: ST_Shd.Clear,
        fill: "#FFFF00",
      });
    });

    it("should parse paragraph with patterned shading", () => {
      const xml = `
        <w:p xmlns:w="${ns}">
          <w:pPr>
            <w:shd w:val="pct25" w:fill="FFFF00" w:color="FF0000"/>
          </w:pPr>
          <w:r>
            <w:t>Text with 25% pattern shading</w:t>
          </w:r>
        </w:p>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const paragraph = doc.documentElement;

      const result = parseParagraph(paragraph);

      expect(result?.shading).toBeDefined();
      expect(result?.shading).toEqual({
        val: ST_Shd.Pct25,
        fill: "#FFFF00",
        color: "#FF0000",
      });
    });

    it("should handle shading with auto colors", () => {
      const xml = `
        <w:p xmlns:w="${ns}">
          <w:pPr>
            <w:shd w:val="solid" w:fill="auto" w:color="auto"/>
          </w:pPr>
          <w:r>
            <w:t>Text with auto shading</w:t>
          </w:r>
        </w:p>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const paragraph = doc.documentElement;

      const result = parseParagraph(paragraph);

      expect(result?.shading).toBeDefined();
      expect(result?.shading).toEqual({
        val: ST_Shd.Solid,
      });
      expect(result?.shading?.fill).toBeUndefined();
      expect(result?.shading?.color).toBeUndefined();
    });
  });

  describe("Style Cascade with Borders and Shading", () => {
    it("should inherit borders and shading from styles", () => {
      const stylesXml = `
        <w:styles xmlns:w="${ns}">
          <w:style w:type="paragraph" w:styleId="BorderedPara">
            <w:name w:val="Bordered Paragraph"/>
            <w:pPr>
              <w:pBdr>
                <w:top w:val="single" w:sz="4" w:color="000000"/>
                <w:bottom w:val="single" w:sz="4" w:color="000000"/>
              </w:pBdr>
              <w:shd w:val="clear" w:fill="F0F0F0"/>
            </w:pPr>
          </w:style>
        </w:styles>
      `;

      const stylesheet = parseStylesheet(stylesXml);

      const xml = `
        <w:p xmlns:w="${ns}">
          <w:pPr>
            <w:pStyle w:val="BorderedPara"/>
          </w:pPr>
          <w:r>
            <w:t>Text with styled borders</w:t>
          </w:r>
        </w:p>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const paragraph = doc.documentElement;

      const result = parseParagraph(paragraph, undefined, undefined, undefined, stylesheet);

      expect(result?.borders).toBeDefined();
      expect(result?.borders?.top).toEqual({
        style: ST_Border.Single,
        size: 4,
        color: "#000000",
      });
      expect(result?.borders?.bottom).toEqual({
        style: ST_Border.Single,
        size: 4,
        color: "#000000",
      });
      expect(result?.shading).toEqual({
        val: ST_Shd.Clear,
        fill: "#F0F0F0",
      });
    });

    it("should override style borders with direct formatting", () => {
      const stylesXml = `
        <w:styles xmlns:w="${ns}">
          <w:style w:type="paragraph" w:styleId="BorderedPara">
            <w:name w:val="Bordered Paragraph"/>
            <w:pPr>
              <w:pBdr>
                <w:top w:val="single" w:sz="4" w:color="000000"/>
              </w:pBdr>
              <w:shd w:val="clear" w:fill="F0F0F0"/>
            </w:pPr>
          </w:style>
        </w:styles>
      `;

      const stylesheet = parseStylesheet(stylesXml);

      const xml = `
        <w:p xmlns:w="${ns}">
          <w:pPr>
            <w:pStyle w:val="BorderedPara"/>
            <w:pBdr>
              <w:top w:val="double" w:sz="8" w:color="FF0000"/>
            </w:pBdr>
            <w:shd w:val="clear" w:fill="FFFF00"/>
          </w:pPr>
          <w:r>
            <w:t>Text with overridden borders</w:t>
          </w:r>
        </w:p>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const paragraph = doc.documentElement;

      const result = parseParagraph(paragraph, undefined, undefined, undefined, stylesheet);

      expect(result?.borders?.top).toEqual({
        style: ST_Border.Double,
        size: 8,
        color: "#FF0000",
      });
      expect(result?.shading).toEqual({
        fill: "#FFFF00",
        val: ST_Shd.Clear,
      });
    });
  });
});
