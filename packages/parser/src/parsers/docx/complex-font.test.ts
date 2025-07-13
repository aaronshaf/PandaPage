import { test, expect } from "bun:test";
import { parseRun } from "./run-parser";
import { DOMParser } from "@xmldom/xmldom";

const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

test("parseRun handles complex script fonts (eastAsia)", () => {
  const xml = `<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:rPr>
      <w:rFonts w:eastAsia="Times New Roman"/>
    </w:rPr>
    <w:t>東京</w:t>
  </w:r>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const runElement = doc.documentElement;

  const run = parseRun(runElement! as unknown as Element, ns);

  expect(run).not.toBeNull();
  expect(run?.text).toBe("東京");
  expect(run?.fontFamilyEastAsia).toBe("Times New Roman");
  expect(run?.fontFamily).toBe("Times New Roman"); // Should prioritize eastAsia
});

test("parseRun handles multiple font attributes", () => {
  const xml = `<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:rPr>
      <w:rFonts w:ascii="Arial" w:eastAsia="MS Mincho" w:hAnsi="Arial" w:cs="Arial Unicode MS"/>
    </w:rPr>
    <w:t>Mixed text 漢字</w:t>
  </w:r>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const runElement = doc.documentElement;

  const run = parseRun(runElement! as unknown as Element, ns);

  expect(run).not.toBeNull();
  expect(run?.text).toBe("Mixed text 漢字");
  expect(run?.fontFamilyAscii).toBe("Arial");
  expect(run?.fontFamilyEastAsia).toBe("MS Mincho");
  expect(run?.fontFamilyHAnsi).toBe("Arial");
  expect(run?.fontFamilyCs).toBe("Arial Unicode MS");
  expect(run?.fontFamily).toBe("MS Mincho"); // Should prioritize eastAsia
});

test("parseRun handles ASCII font when no eastAsia font", () => {
  const xml = `<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
    </w:rPr>
    <w:t>English text</w:t>
  </w:r>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const runElement = doc.documentElement;

  const run = parseRun(runElement! as unknown as Element, ns);

  expect(run).not.toBeNull();
  expect(run?.text).toBe("English text");
  expect(run?.fontFamilyAscii).toBe("Calibri");
  expect(run?.fontFamilyHAnsi).toBe("Calibri");
  expect(run?.fontFamilyEastAsia).toBeUndefined();
  expect(run?.fontFamily).toBe("Calibri"); // Should fall back to ascii
});

test("parseRun handles complex script font priority", () => {
  const xml = `<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:rPr>
      <w:rFonts w:cs="Noto Sans Arabic"/>
    </w:rPr>
    <w:t>العربية</w:t>
  </w:r>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const runElement = doc.documentElement;

  const run = parseRun(runElement! as unknown as Element, ns);

  expect(run).not.toBeNull();
  expect(run?.text).toBe("العربية");
  expect(run?.fontFamilyCs).toBe("Noto Sans Arabic");
  expect(run?.fontFamily).toBe("Noto Sans Arabic"); // Should use cs font
});

test("parseRun handles theme fonts with eastAsia", () => {
  const xml = `<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:rPr>
      <w:rFonts w:ascii="+mn-lt" w:eastAsia="+mn-ea"/>
    </w:rPr>
    <w:t>Theme fonts test</w:t>
  </w:r>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const runElement = doc.documentElement;

  const theme = {
    fonts: {
      major: new Map([
        ["latin", "Calibri Light"],
        ["ea", "Yu Gothic Light"]
      ]),
      minor: new Map([
        ["latin", "Calibri"],
        ["ea", "Yu Gothic"] // ea = east asia
      ])
    },
    colors: new Map() // Required by DocxTheme interface
  };

  const run = parseRun(runElement! as unknown as Element, ns, undefined, undefined, theme);

  expect(run).not.toBeNull();
  expect(run?.text).toBe("Theme fonts test");
  expect(run?.fontFamilyAscii).toBe("Calibri");
  expect(run?.fontFamilyEastAsia).toBe("Yu Gothic");
  expect(run?.fontFamily).toBe("Yu Gothic"); // Should prioritize resolved eastAsia theme font
});