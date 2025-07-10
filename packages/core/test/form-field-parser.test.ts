import { describe, test, expect, beforeAll } from "bun:test";
import { Effect } from "effect";
import {
  paragraphContainsFields,
  processFieldsInParagraph,
  FieldCode,
} from "../src/formats/docx/form-field-parser";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  const window = new Window();
  (global as any).DOMParser = window.DOMParser;
  (global as any).Document = window.Document;
  (global as any).Element = window.Element;
  (global as any).Node = window.Node;
});

describe("form-field-parser", () => {
  describe("FieldCode enum", () => {
    test("should define all field codes with correct string values", () => {
      expect(FieldCode.FORMTEXT as string).toBe("FORMTEXT");
      expect(FieldCode.FORMCHECKBOX as string).toBe("FORMCHECKBOX");
      expect(FieldCode.FORMDROPDOWN as string).toBe("FORMDROPDOWN");
      expect(FieldCode.PAGE as string).toBe("PAGE");
      expect(FieldCode.NUMPAGES as string).toBe("NUMPAGES");
      expect(FieldCode.DATE as string).toBe("DATE");
      expect(FieldCode.TIME as string).toBe("TIME");
      expect(FieldCode.FILENAME as string).toBe("FILENAME");
      expect(FieldCode.AUTHOR as string).toBe("AUTHOR");
      expect(FieldCode.TITLE as string).toBe("TITLE");
      expect(FieldCode.SUBJECT as string).toBe("SUBJECT");
      expect(FieldCode.KEYWORDS as string).toBe("KEYWORDS");
      expect(FieldCode.REF as string).toBe("REF");
      expect(FieldCode.HYPERLINK as string).toBe("HYPERLINK");
      expect(FieldCode.TOC as string).toBe("TOC");
    });
  });

  describe("paragraphContainsFields", () => {
    test("should detect field characters in paragraph", () => {
      const paragraphXml = `
        <w:p>
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>PAGE</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const result = paragraphContainsFields(paragraphXml);
      expect(result).toBe(true);
    });

    test("should return false for paragraph without fields", () => {
      const paragraphXml = `
        <w:p>
          <w:r>
            <w:t>Regular text</w:t>
          </w:r>
        </w:p>`;

      const result = paragraphContainsFields(paragraphXml);
      expect(result).toBe(false);
    });

    test("should return false for empty paragraph", () => {
      const paragraphXml = "<w:p></w:p>";

      const result = paragraphContainsFields(paragraphXml);
      expect(result).toBe(false);
    });
  });

  describe("processFieldsInParagraph", () => {
    test("should process paragraph with fields", async () => {
      const paragraphXml = `
        <w:p>
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>PAGE</w:instrText>
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

      const result = await Effect.runPromise(processFieldsInParagraph(paragraphXml));

      expect(result.xml).toBe(paragraphXml);
      expect(result.fields).toHaveLength(1);
      expect(result.fields[0]?.type).toBe("PAGE");
      expect(result.fields[0]?.result).toBe("1");
    });

    test("should process paragraph without fields", async () => {
      const paragraphXml = `
        <w:p>
          <w:r>
            <w:t>Regular text</w:t>
          </w:r>
        </w:p>`;

      const result = await Effect.runPromise(processFieldsInParagraph(paragraphXml));

      expect(result.xml).toBe(paragraphXml);
      expect(result.fields).toHaveLength(0);
    });

    test("should process empty paragraph", async () => {
      const paragraphXml = "<w:p></w:p>";

      const result = await Effect.runPromise(processFieldsInParagraph(paragraphXml));

      expect(result.xml).toBe(paragraphXml);
      expect(result.fields).toHaveLength(0);
    });
  });
});