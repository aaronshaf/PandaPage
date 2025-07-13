import { test, expect } from "bun:test";
import { parseParagraph } from "./paragraph-parser";
import { DOMParser } from "@xmldom/xmldom";
import "../../test-setup";

test("parseParagraph handles fldSimple field codes", () => {
  const xml = `<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:fldSimple w:instr="PAGE \\* MERGEFORMAT">
      <w:r>
        <w:t>1</w:t>
      </w:r>
    </w:fldSimple>
  </w:p>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const paragraphElement = doc.documentElement;

  const paragraph = parseParagraph(paragraphElement! as unknown as Element);

  expect(paragraph).not.toBeNull();
  expect(paragraph?.runs.length).toBe(1);
  expect(paragraph?.runs[0]?.text).toBe("1");
  expect((paragraph?.runs[0] as any)?._fieldCode).toBe("PAGE");
  expect((paragraph?.runs[0] as any)?._fieldInstruction).toBe("PAGE \\* MERGEFORMAT");
});

test("parseParagraph handles complex field codes with fldChar", () => {
  const xml = `<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:r>
      <w:fldChar w:fldCharType="begin"/>
    </w:r>
    <w:r>
      <w:instrText>SEQ Table \\* ARABIC</w:instrText>
    </w:r>
    <w:r>
      <w:fldChar w:fldCharType="separate"/>
    </w:r>
    <w:r>
      <w:t>1</w:t>
    </w:r>
    <w:r>
      <w:fldChar w:fldCharType="end"/>
    </w:r>
  </w:p>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const paragraphElement = doc.documentElement;

  const paragraph = parseParagraph(paragraphElement! as unknown as Element, undefined, undefined, undefined, undefined, undefined, {
    bookmarks: new Map(),
    sequences: new Map(),
    currentDate: new Date(),
  });

  expect(paragraph).not.toBeNull();
  expect(paragraph?.runs.length).toBe(1);
  expect(paragraph?.runs[0]?.text).toBe("1");
  expect((paragraph?.runs[0] as any)?._fieldCode).toBe("SEQ");
  expect((paragraph?.runs[0] as any)?._fieldInstruction).toBe("SEQ Table \\* ARABIC");
});

test("parseParagraph handles HYPERLINK field codes", () => {
  const xml = `<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:fldSimple w:instr='HYPERLINK "https://example.com"'>
      <w:r>
        <w:t>Click here</w:t>
      </w:r>
    </w:fldSimple>
  </w:p>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const paragraphElement = doc.documentElement;

  const paragraph = parseParagraph(paragraphElement! as unknown as Element);

  expect(paragraph).not.toBeNull();
  expect(paragraph?.runs.length).toBe(1);
  expect(paragraph?.runs[0]?.text).toBe("https://example.com");
  expect(paragraph?.runs[0]?.link).toBe("https://example.com");
  expect((paragraph?.runs[0] as any)?._fieldCode).toBe("HYPERLINK");
});

test("parseParagraph handles REF field codes with bookmarks", () => {
  const xml = `<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:fldSimple w:instr="REF _Ref12345678 \\h">
      <w:r>
        <w:t>See Section 1.2</w:t>
      </w:r>
    </w:fldSimple>
  </w:p>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const paragraphElement = doc.documentElement;

  const bookmarks = new Map([["_Ref12345678", "Section 1.2"]]);
  const paragraph = parseParagraph(paragraphElement! as unknown as Element, undefined, undefined, undefined, undefined, undefined, {
    bookmarks,
    sequences: new Map(),
    currentDate: new Date(),
  });

  expect(paragraph).not.toBeNull();
  expect(paragraph?.runs.length).toBe(1);
  expect(paragraph?.runs[0]?.text).toBe("Section 1.2");
  expect(paragraph?.runs[0]?.link).toBe("#_Ref12345678");
  expect((paragraph?.runs[0] as any)?._internalLink).toBe(true);
  expect((paragraph?.runs[0] as any)?._bookmarkRef).toBe("_Ref12345678");
});

test("parseParagraph handles DATE field codes", () => {
  const xml = `<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:fldSimple w:instr="DATE \\@ &quot;M/d/yyyy&quot;">
      <w:r>
        <w:t>12/25/2023</w:t>
      </w:r>
    </w:fldSimple>
  </w:p>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const paragraphElement = doc.documentElement;

  const testDate = new Date("2023-12-25");
  const paragraph = parseParagraph(paragraphElement! as unknown as Element, undefined, undefined, undefined, undefined, undefined, {
    bookmarks: new Map(),
    sequences: new Map(),
    currentDate: testDate,
  });

  expect(paragraph).not.toBeNull();
  expect(paragraph?.runs.length).toBe(1);
  expect((paragraph?.runs[0] as any)?._fieldCode).toBe("DATE");
  // The text will be the localized date string
  expect(paragraph?.runs[0]?.text).toBeTruthy();
});