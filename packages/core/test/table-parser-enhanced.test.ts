import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import {
  parseTableEnhanced,
  parseTableRowEnhanced,
  parseTableCellEnhanced,
  parseTableProperties,
  parseTableRowProperties,
  parseTableCellProperties,
} from "../src/formats/docx/table-parser";
import { parseXmlString } from "../src/common/xml-parser";
import { Window } from "happy-dom";

// Set up DOM environment
const window = new Window();
const document = window.document;
(global as any).DOMParser = window.DOMParser;
(global as any).Document = window.Document;
(global as any).Element = window.Element;
(global as any).Node = window.Node;

// Create mock DOM element
async function createMockElement(html: string): Promise<Element> {
  const doc = await Effect.runPromise(parseXmlString(html));
  return doc.documentElement;
}

describe("Table Parser Enhanced", () => {
  describe("parseTableEnhanced", () => {
    test("should parse a simple table", async () => {
      const xml = `
        <tbl>
          <tr>
            <tc>
              <p>
                <r>
                  <t>Cell 1</t>
                </r>
              </p>
            </tc>
            <tc>
              <p>
                <r>
                  <t>Cell 2</t>
                </r>
              </p>
            </tc>
          </tr>
        </tbl>
      `;
      const tblElement = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableEnhanced(tblElement));
      expect(result.type).toBe("table");
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]?.cells).toHaveLength(2);
    });

    test("should parse table with namespace prefix", async () => {
      const xml = `
        <tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <tr>
            <tc>
              <p>
                <r>
                  <t>Namespaced cell</t>
                </r>
              </p>
            </tc>
          </tr>
        </tbl>
      `;
      const tblElement = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableEnhanced(tblElement));
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]?.cells).toHaveLength(1);
    });

    test("should parse table with uppercase namespace", async () => {
      const xml = `
        <W:TBL xmlns:W="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <W:TR>
            <W:TC>
              <W:P>
                <W:R>
                  <W:T>Uppercase namespace</W:T>
                </W:R>
              </W:P>
            </W:TC>
          </W:TR>
        </W:TBL>
      `;
      const tblElement = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableEnhanced(tblElement));
      expect(result.rows).toHaveLength(1);
    });

    test("should parse table with properties", async () => {
      const xml = `
        <tbl>
          <tblPr>
            <tblW w="5000" type="dxa"/>
            <jc val="center"/>
          </tblPr>
          <tr>
            <tc>
              <p>
                <r>
                  <t>Cell with table props</t>
                </r>
              </p>
            </tc>
          </tr>
        </tbl>
      `;
      const tblElement = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableEnhanced(tblElement));
      expect(result.properties).toBeDefined();
      expect(result.properties?.width).toBe("5000px");
      expect(result.properties?.alignment).toBe("center");
    });
  });

  describe("parseTableRowEnhanced", () => {
    test("should parse row with multiple cells", async () => {
      const xml = `
        <tr>
          <tc>
            <p>
              <r>
                <t>Cell 1</t>
              </r>
            </p>
          </tc>
          <tc>
            <p>
              <r>
                <t>Cell 2</t>
              </r>
            </p>
          </tc>
          <tc>
            <p>
              <r>
                <t>Cell 3</t>
              </r>
            </p>
          </tc>
        </tr>
      `;
      const trElement = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableRowEnhanced(trElement));
      expect(result.cells).toHaveLength(3);
    });

    test("should parse row with properties", async () => {
      const xml = `
        <tr>
          <trPr>
            <trHeight val="720"/>
            <tblHeader/>
          </trPr>
          <tc>
            <p>
              <r>
                <t>Header cell</t>
              </r>
            </p>
          </tc>
        </tr>
      `;
      const trElement = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableRowEnhanced(trElement));
      expect(result.properties).toBeDefined();
      expect(result.properties?.height).toBe("720px");
      expect(result.properties?.isHeader).toBe(true);
    });

    test("should parse row with namespace prefix", async () => {
      const xml = `
        <tr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <tc>
            <p>
              <r>
                <t>Namespaced row</t>
              </r>
            </p>
          </tc>
        </tr>
      `;
      const trElement = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableRowEnhanced(trElement));
      expect(result.cells).toHaveLength(1);
    });
  });

  describe("parseTableCellEnhanced", () => {
    test("should parse cell with multiple paragraphs", async () => {
      const xml = `
        <tc>
          <p>
            <r>
              <t>First paragraph</t>
            </r>
          </p>
          <p>
            <r>
              <t>Second paragraph</t>
            </r>
          </p>
        </tc>
      `;
      const tcElement = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableCellEnhanced(tcElement));
      expect(result.content).toHaveLength(2);
    });

    test("should handle paragraph parse errors gracefully", async () => {
      const xml = `
        <tc>
          <p>
            <r>
              <t>Valid paragraph</t>
            </r>
          </p>
          <p>
            <!-- Invalid paragraph structure -->
            <invalidTag>
              <nestedInvalid>Invalid content</nestedInvalid>
            </invalidTag>
          </p>
          <p>
            <r>
              <t>Another valid paragraph</t>
            </r>
          </p>
        </tc>
      `;
      const tcElement = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableCellEnhanced(tcElement));
      // Should parse at least the valid paragraphs
      expect(result.content.length).toBeGreaterThan(0);
    });

    test("should parse cell with properties", async () => {
      const xml = `
        <tc>
          <tcPr>
            <tcW w="2500" type="dxa"/>
            <vAlign val="center"/>
            <shd fill="FF0000"/>
          </tcPr>
          <p>
            <r>
              <t>Cell with properties</t>
            </r>
          </p>
        </tc>
      `;
      const tcElement = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableCellEnhanced(tcElement));
      expect(result.properties).toBeDefined();
      expect(result.properties?.width).toBe("2500px");
      expect(result.properties?.alignment).toBe("center");
      expect(result.properties?.backgroundColor).toBe("#FF0000");
    });
  });

  describe("parseTableProperties with borders", () => {
    test("should parse table borders", async () => {
      const xml = `
        <tblPr>
          <tblBorders>
            <top val="single" sz="8" color="000000"/>
            <right val="dashed" sz="16" color="FF0000"/>
            <bottom val="dotted" sz="24" color="00FF00"/>
            <left val="double" sz="32" color="0000FF"/>
          </tblBorders>
        </tblPr>
      `;
      const tblPr = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableProperties(tblPr));
      expect(result.borders).toBeDefined();
      expect(result.borders?.top).toBe("1px solid #000000");
      expect(result.borders?.right).toBe("2px dashed #FF0000");
      expect(result.borders?.bottom).toBe("3px dotted #00FF00");
      expect(result.borders?.left).toBe("4px solid #0000FF");
    });

    test("should handle borders with no size", async () => {
      const xml = `
        <tblPr>
          <tblBorders>
            <top val="single" color="000000"/>
          </tblBorders>
        </tblPr>
      `;
      const tblPr = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableProperties(tblPr));
      expect(result.borders?.top).toBe("1px solid #000000");
    });

    test("should ignore none borders", async () => {
      const xml = `
        <tblPr>
          <tblBorders>
            <top val="none"/>
            <right val="single" sz="8" color="000000"/>
          </tblBorders>
        </tblPr>
      `;
      const tblPr = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableProperties(tblPr));
      expect(result.borders?.top).toBeUndefined();
      expect(result.borders?.right).toBe("1px solid #000000");
    });

    test("should handle auto color", async () => {
      const xml = `
        <tblPr>
          <tblBorders>
            <top val="single" sz="8" color="auto"/>
          </tblBorders>
        </tblPr>
      `;
      const tblPr = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableProperties(tblPr));
      expect(result.borders?.top).toBe("1px solid #000000");
    });

    test("should parse table indentation", async () => {
      const xml = `
        <tblPr>
          <tblInd w="720" type="dxa"/>
        </tblPr>
      `;
      const tblPr = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableProperties(tblPr));
      expect(result.indentation).toBe("720px");
    });

    test("should parse table indentation percentage", async () => {
      const xml = `
        <tblPr>
          <tblInd w="50" type="pct"/>
        </tblPr>
      `;
      const tblPr = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableProperties(tblPr));
      expect(result.indentation).toBe("50%");
    });

    test("should handle invalid alignment", async () => {
      const xml = `
        <tblPr>
          <jc val="invalid"/>
        </tblPr>
      `;
      const tblPr = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableProperties(tblPr));
      expect(result.alignment).toBeUndefined();
    });
  });

  describe("parseTableCellProperties with borders", () => {
    test("should parse cell borders", async () => {
      const xml = `
        <tcPr>
          <tcBorders>
            <top val="single" sz="8" color="000000"/>
            <right val="dashed" sz="16" color="FF0000"/>
          </tcBorders>
        </tcPr>
      `;
      const tcPr = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result.borders).toBeDefined();
      expect(result.borders?.top).toBe("1px solid #000000");
      expect(result.borders?.right).toBe("2px dashed #FF0000");
    });

    test("should handle cell without width attributes", async () => {
      const xml = `
        <tcPr>
          <tcW/>
        </tcPr>
      `;
      const tcPr = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableCellProperties(tcPr));
      expect(result.width).toBeUndefined();
    });

    test("should handle table without width attributes", async () => {
      const xml = `
        <tblPr>
          <tblW/>
        </tblPr>
      `;
      const tblPr = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableProperties(tblPr));
      expect(result.width).toBeUndefined();
    });
  });

  describe("parseTableRowProperties edge cases", () => {
    test("should handle row without height value", async () => {
      const xml = `
        <trPr>
          <trHeight/>
        </trPr>
      `;
      const trPr = await createMockElement(xml);

      const result = await Effect.runPromise(parseTableRowProperties(trPr));
      expect(result.height).toBeUndefined();
    });
  });
});