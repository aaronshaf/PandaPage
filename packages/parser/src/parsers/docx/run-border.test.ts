import { describe, it, expect } from "bun:test";
import "../../test-setup";
import { parseRun } from "./run-parser";
import { ST_Border } from "@browser-document-viewer/ooxml-types";

describe("Run border parsing", () => {
  it("should parse run with text border", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:bdr w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        </w:rPr>
        <w:t>box</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(
      runElement,
      "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    );

    expect(run).not.toBeNull();
    expect(run?.border).toBeDefined();
    expect(run?.border?.style).toBe(ST_Border.Single);
    expect(run?.border?.size).toBe(4);
    expect(run?.border?.space).toBe(0);
    expect(run?.border?.color).toBeUndefined(); // auto color is not stored
    expect(run?.text).toBe("box");
  });

  it("should parse run with colored border", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:bdr w:val="double" w:sz="8" w:space="2" w:color="FF0000"/>
        </w:rPr>
        <w:t>bordered text</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(
      runElement,
      "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    );

    expect(run).not.toBeNull();
    expect(run?.border).toBeDefined();
    expect(run?.border?.style).toBe(ST_Border.Double);
    expect(run?.border?.size).toBe(8);
    expect(run?.border?.space).toBe(2);
    expect(run?.border?.color).toBe("#FF0000");
    expect(run?.text).toBe("bordered text");
  });

  it("should handle run without border", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>normal text</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(
      runElement,
      "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    );

    expect(run).not.toBeNull();
    expect(run?.border).toBeUndefined();
    expect(run?.bold).toBe(true);
    expect(run?.text).toBe("normal text");
  });

  it("should parse run with border and other formatting", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:b/>
          <w:i/>
          <w:bdr w:val="dotted" w:sz="6" w:color="0000FF"/>
          <w:color w:val="FFFFFF"/>
          <w:sz w:val="24"/>
        </w:rPr>
        <w:t>formatted with border</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(
      runElement,
      "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    );

    expect(run).not.toBeNull();
    expect(run?.border).toBeDefined();
    expect(run?.border?.style).toBe(ST_Border.Dotted);
    expect(run?.border?.size).toBe(6);
    expect(run?.border?.color).toBe("#0000FF");
    expect(run?.bold).toBe(true);
    expect(run?.italic).toBe(true);
    expect(run?.color).toBe("FFFFFF");
    expect(run?.fontSize).toBe("24");
    expect(run?.text).toBe("formatted with border");
  });
});
