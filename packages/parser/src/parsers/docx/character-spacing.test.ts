import { test, expect } from "bun:test";
import { parseRun } from "./run-parser";
import { DOMParser } from "@xmldom/xmldom";

const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

test("parseRun handles character spacing from w:spacing", () => {
  const xml = `<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:rPr>
      <w:spacing w:val="40"/>
    </w:rPr>
    <w:t>Text with spacing</w:t>
  </w:r>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const runElement = doc.documentElement;

  const run = parseRun(runElement! as unknown as Element, ns);

  expect(run).not.toBeNull();
  expect(run?.text).toBe("Text with spacing");
  expect(run?.characterSpacing).toBe(40);
});

test("parseRun handles negative character spacing", () => {
  const xml = `<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:rPr>
      <w:spacing w:val="-20"/>
    </w:rPr>
    <w:t>Condensed text</w:t>
  </w:r>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const runElement = doc.documentElement;

  const run = parseRun(runElement! as unknown as Element, ns);

  expect(run).not.toBeNull();
  expect(run?.text).toBe("Condensed text");
  expect(run?.characterSpacing).toBe(-20);
});

test("parseRun handles character spacing with other formatting", () => {
  const xml = `<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:rPr>
      <w:b/>
      <w:i/>
      <w:spacing w:val="100"/>
      <w:sz w:val="36"/>
    </w:rPr>
    <w:t>Bold italic spaced text</w:t>
  </w:r>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const runElement = doc.documentElement;

  const run = parseRun(runElement! as unknown as Element, ns);

  expect(run).not.toBeNull();
  expect(run?.text).toBe("Bold italic spaced text");
  expect(run?.bold).toBe(true);
  expect(run?.italic).toBe(true);
  expect(run?.characterSpacing).toBe(100);
  expect(run?.fontSize).toBe("36");
});
