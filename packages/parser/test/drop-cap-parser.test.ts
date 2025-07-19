import { describe, test, expect } from "bun:test";
import { parseParagraph } from "../src/parsers/docx/paragraph-parser";
import { parseXmlString } from "../src/parsers/docx/xml-utils";
import { WORD_NAMESPACE } from "../src/parsers/docx/types";
import { Window } from "happy-dom";

// Set up DOM environment
const window = new Window();
(global as any).DOMParser = window.DOMParser;
(global as any).Document = window.Document;
(global as any).Element = window.Element;
(global as any).Node = window.Node;

describe("Drop Cap Parsing", () => {
  test("should parse drop cap with default settings", async () => {
    const xml = `
      <w:p xmlns:w="${WORD_NAMESPACE}">
        <w:pPr>
          <w:framePr w:dropCap="drop" w:lines="3" w:wrap="around"/>
        </w:pPr>
        <w:r>
          <w:t>This is a paragraph with a drop cap.</w:t>
        </w:r>
      </w:p>
    `;

    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const paragraphElement = doc.documentElement;

    const result = parseParagraph(paragraphElement);

    expect(result).toBeDefined();
    expect(result?.framePr).toBeDefined();
    expect(result?.framePr?.dropCap).toBe("drop");
    expect(result?.framePr?.lines).toBe(3);
    expect(result?.framePr?.wrap).toBe("around");
  });

  test("should parse margin drop cap", async () => {
    const xml = `
      <w:p xmlns:w="${WORD_NAMESPACE}">
        <w:pPr>
          <w:framePr w:dropCap="margin" w:lines="5" w:wrap="tight"/>
        </w:pPr>
        <w:r>
          <w:t>Margin drop cap paragraph.</w:t>
        </w:r>
      </w:p>
    `;

    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const paragraphElement = doc.documentElement;

    const result = parseParagraph(paragraphElement);

    expect(result?.framePr?.dropCap).toBe("margin");
    expect(result?.framePr?.lines).toBe(5);
    expect(result?.framePr?.wrap).toBe("tight");
  });

  test("should parse frame properties with positioning", async () => {
    const xml = `
      <w:p xmlns:w="${WORD_NAMESPACE}">
        <w:pPr>
          <w:framePr 
            w:dropCap="drop" 
            w:lines="3" 
            w:wrap="around"
            w:vAnchor="text"
            w:hAnchor="margin"
            w:x="100"
            w:y="200"
            w:w="500"
            w:h="600"
            w:hRule="exact"
            w:xAlign="left"
            w:yAlign="top"
            w:hSpace="50"
            w:vSpace="40"
          />
        </w:pPr>
        <w:r>
          <w:t>Complex frame properties.</w:t>
        </w:r>
      </w:p>
    `;

    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const paragraphElement = doc.documentElement;

    const result = parseParagraph(paragraphElement);

    expect(result?.framePr).toMatchObject({
      dropCap: "drop",
      lines: 3,
      wrap: "around",
      vAnchor: "text",
      hAnchor: "margin",
      x: 100,
      y: 200,
      w: 500,
      h: 600,
      hRule: "exact",
      xAlign: "left",
      yAlign: "top",
      hSpace: 50,
      vSpace: 40,
    });
  });

  test("should handle framePr without drop cap", async () => {
    const xml = `
      <w:p xmlns:w="${WORD_NAMESPACE}">
        <w:pPr>
          <w:framePr w:wrap="none" w:vAnchor="page"/>
        </w:pPr>
        <w:r>
          <w:t>Frame without drop cap.</w:t>
        </w:r>
      </w:p>
    `;

    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const paragraphElement = doc.documentElement;

    const result = parseParagraph(paragraphElement);

    expect(result?.framePr).toBeDefined();
    expect(result?.framePr?.dropCap).toBeUndefined();
    expect(result?.framePr?.wrap).toBe("none");
    expect(result?.framePr?.vAnchor).toBe("page");
  });

  test("should handle none drop cap value", async () => {
    const xml = `
      <w:p xmlns:w="${WORD_NAMESPACE}">
        <w:pPr>
          <w:framePr w:dropCap="none" w:lines="3"/>
        </w:pPr>
        <w:r>
          <w:t>No drop cap here.</w:t>
        </w:r>
      </w:p>
    `;

    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const paragraphElement = doc.documentElement;

    const result = parseParagraph(paragraphElement);

    expect(result?.framePr?.dropCap).toBe("none");
    expect(result?.framePr?.lines).toBe(3);
  });

  test("should parse paragraph without framePr", async () => {
    const xml = `
      <w:p xmlns:w="${WORD_NAMESPACE}">
        <w:pPr>
          <w:pStyle w:val="Normal"/>
        </w:pPr>
        <w:r>
          <w:t>Regular paragraph.</w:t>
        </w:r>
      </w:p>
    `;

    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const paragraphElement = doc.documentElement;

    const result = parseParagraph(paragraphElement);

    expect(result?.framePr).toBeUndefined();
    expect(result?.runs).toHaveLength(1);
    expect(result?.runs[0]?.text).toBe("Regular paragraph.");
  });
});
