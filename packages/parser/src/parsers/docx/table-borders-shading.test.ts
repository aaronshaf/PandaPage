import { describe, it, expect } from "bun:test";
import { parseTable } from "./table-parser";
import { WORD_NAMESPACE } from './types';
import { ST_Border, ST_Shd } from '@browser-document-viewer/ooxml-types';

describe("Table Borders and Shading", () => {
  const ns = WORD_NAMESPACE;

  describe("Table-level Borders", () => {
    it("should parse table with all borders", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tblPr>
            <w:tblBorders>
              <w:top w:val="single" w:sz="4" w:color="FF0000"/>
              <w:bottom w:val="double" w:sz="8" w:color="00FF00"/>
              <w:left w:val="dashed" w:sz="6" w:color="0000FF"/>
              <w:right w:val="dotted" w:sz="2" w:color="000000"/>
              <w:insideH w:val="single" w:sz="4" w:color="808080"/>
              <w:insideV w:val="single" w:sz="4" w:color="C0C0C0"/>
            </w:tblBorders>
          </w:tblPr>
          <w:tr>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Cell 1</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result).toBeDefined();
      expect(result?.borders).toBeDefined();
      expect(result?.borders?.top).toEqual({
        style: ST_Border.Single,
        width: 0.5, // 4 eighth-points = 0.5 points
        color: '#FF0000'
      });
      expect(result?.borders?.bottom).toEqual({
        style: ST_Border.Double,
        width: 1, // 8 eighth-points = 1 point
        color: '#00FF00'
      });
      expect(result?.borders?.left).toEqual({
        style: ST_Border.Dashed,
        width: 0.75, // 6 eighth-points = 0.75 points
        color: '#0000FF'
      });
      expect(result?.borders?.right).toEqual({
        style: ST_Border.Dotted,
        width: 0.25, // 2 eighth-points = 0.25 points
        color: '#000000'
      });
      expect(result?.borders?.insideH).toEqual({
        style: ST_Border.Single,
        width: 0.5,
        color: '#808080'
      });
      expect(result?.borders?.insideV).toEqual({
        style: ST_Border.Single,
        width: 0.5,
        color: '#C0C0C0'
      });
    });

    it("should handle borders with auto color", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tblPr>
            <w:tblBorders>
              <w:top w:val="single" w:sz="4" w:color="auto"/>
            </w:tblBorders>
          </w:tblPr>
          <w:tr>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Cell with auto color border</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.borders).toBeDefined();
      expect(result?.borders?.top).toEqual({
        style: ST_Border.Single,
        width: 0.5
      });
      expect(result?.borders?.top?.color).toBeUndefined();
    });

    it("should handle none/nil border style", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tblPr>
            <w:tblBorders>
              <w:top w:val="none"/>
              <w:bottom w:val="nil"/>
            </w:tblBorders>
          </w:tblPr>
          <w:tr>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Cell with no borders</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.borders).toBeDefined();
      expect(result?.borders?.top?.style).toBe(ST_Border.None);
      expect(result?.borders?.bottom?.style).toBe(ST_Border.Nil);
    });
  });

  describe("Table-level Shading", () => {
    it("should parse table with solid shading", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tblPr>
            <w:shd w:val="clear" w:fill="FFFF00" w:color="auto"/>
          </w:tblPr>
          <w:tr>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Cell with yellow background</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.shading).toBeDefined();
      expect(result?.shading).toEqual({
        fill: '#FFFF00'
      });
    });

    it("should parse table with patterned shading", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tblPr>
            <w:shd w:val="pct25" w:fill="FFFF00" w:color="FF0000"/>
          </w:tblPr>
          <w:tr>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Cell with 25% pattern shading</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.shading).toBeDefined();
      expect(result?.shading).toEqual({
        pattern: ST_Shd.Pct25,
        fill: '#FFFF00',
        color: '#FF0000'
      });
    });
  });

  describe("Table Cell Margins", () => {
    it("should parse table cell margins", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tblPr>
            <w:tblCellMar>
              <w:top w:w="100" w:type="dxa"/>
              <w:bottom w:w="100" w:type="dxa"/>
              <w:left w:w="120" w:type="dxa"/>
              <w:right w:w="120" w:type="dxa"/>
            </w:tblCellMar>
          </w:tblPr>
          <w:tr>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Cell with margins</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.cellMargin).toBeDefined();
      expect(result?.cellMargin).toEqual({
        top: 100,
        bottom: 100,
        left: 120,
        right: 120
      });
    });
  });

  describe("Cell-level Borders", () => {
    it("should parse cell with all borders including diagonals", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:tcBorders>
                  <w:top w:val="single" w:sz="8" w:color="FF0000"/>
                  <w:bottom w:val="double" w:sz="12" w:color="00FF00"/>
                  <w:left w:val="dashed" w:sz="4" w:color="0000FF"/>
                  <w:right w:val="dotted" w:sz="6" w:color="000000"/>
                  <w:tl2br w:val="single" w:sz="4" w:color="FF00FF"/>
                  <w:tr2bl w:val="single" w:sz="4" w:color="00FFFF"/>
                </w:tcBorders>
              </w:tcPr>
              <w:p>
                <w:r>
                  <w:t>Cell with borders</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.rows[0]?.cells[0]?.borders).toBeDefined();
      const borders = result?.rows[0]?.cells[0]?.borders;
      expect(borders?.top).toEqual({
        style: ST_Border.Single,
        width: 1, // 8 eighth-points = 1 point
        color: '#FF0000'
      });
      expect(borders?.bottom).toEqual({
        style: ST_Border.Double,
        width: 1.5, // 12 eighth-points = 1.5 points
        color: '#00FF00'
      });
      expect(borders?.left).toEqual({
        style: ST_Border.Dashed,
        width: 0.5,
        color: '#0000FF'
      });
      expect(borders?.right).toEqual({
        style: ST_Border.Dotted,
        width: 0.75,
        color: '#000000'
      });
      expect(borders?.tl2br).toEqual({
        style: ST_Border.Single,
        width: 0.5,
        color: '#FF00FF'
      });
      expect(borders?.tr2bl).toEqual({
        style: ST_Border.Single,
        width: 0.5,
        color: '#00FFFF'
      });
    });
  });

  describe("Cell-level Shading", () => {
    it("should parse cell with shading", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:shd w:val="pct50" w:fill="00FF00" w:color="FF0000"/>
              </w:tcPr>
              <w:p>
                <w:r>
                  <w:t>Cell with shading</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.rows[0]?.cells[0]?.shading).toBeDefined();
      expect(result?.rows[0]?.cells[0]?.shading).toEqual({
        pattern: ST_Shd.Pct50,
        fill: '#00FF00',
        color: '#FF0000'
      });
    });
  });

  describe("Cell Margins", () => {
    it("should parse cell margins", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:tcMar>
                  <w:top w:w="50" w:type="dxa"/>
                  <w:bottom w:w="50" w:type="dxa"/>
                  <w:left w:w="60" w:type="dxa"/>
                  <w:right w:w="60" w:type="dxa"/>
                </w:tcMar>
              </w:tcPr>
              <w:p>
                <w:r>
                  <w:t>Cell with custom margins</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      expect(result?.rows[0]?.cells[0]?.margin).toBeDefined();
      expect(result?.rows[0]?.cells[0]?.margin).toEqual({
        top: 50,
        bottom: 50,
        left: 60,
        right: 60
      });
    });
  });

  describe("Complex Table with Mixed Properties", () => {
    it("should parse table with both table and cell properties", () => {
      const xml = `
        <w:tbl xmlns:w="${ns}">
          <w:tblPr>
            <w:tblBorders>
              <w:top w:val="single" w:sz="4" w:color="000000"/>
              <w:bottom w:val="single" w:sz="4" w:color="000000"/>
              <w:left w:val="single" w:sz="4" w:color="000000"/>
              <w:right w:val="single" w:sz="4" w:color="000000"/>
              <w:insideH w:val="single" w:sz="2" w:color="C0C0C0"/>
              <w:insideV w:val="single" w:sz="2" w:color="C0C0C0"/>
            </w:tblBorders>
            <w:shd w:val="clear" w:fill="F0F0F0"/>
          </w:tblPr>
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:tcBorders>
                  <w:top w:val="double" w:sz="8" w:color="FF0000"/>
                </w:tcBorders>
                <w:shd w:val="clear" w:fill="FFFF00"/>
              </w:tcPr>
              <w:p>
                <w:r>
                  <w:t>Header Cell</w:t>
                </w:r>
              </w:p>
            </w:tc>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Regular Cell</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const table = doc.documentElement;

      const result = parseTable(table);

      // Check table-level properties
      expect(result?.borders).toBeDefined();
      expect(result?.shading).toEqual({
        fill: '#F0F0F0'
      });

      // Check cell-level properties (override table properties)
      const firstCell = result?.rows[0]?.cells[0];
      expect(firstCell?.borders?.top).toEqual({
        style: ST_Border.Double,
        width: 1,
        color: '#FF0000'
      });
      expect(firstCell?.shading).toEqual({
        fill: '#FFFF00'
      });

      // Second cell should inherit table properties
      const secondCell = result?.rows[0]?.cells[1];
      expect(secondCell?.borders).toBeUndefined();
      expect(secondCell?.shading).toBeUndefined();
    });
  });
});