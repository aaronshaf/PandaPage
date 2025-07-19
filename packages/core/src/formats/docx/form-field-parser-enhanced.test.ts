import { describe, test, expect, beforeAll } from "bun:test";
import { Effect } from "effect";
import {
  parseFieldInstruction,
  parseFieldsFromParagraph,
  fieldToMarkdown,
  paragraphContainsFields,
  processFieldsInParagraph,
  FieldCode,
  type DocxField,
} from "./form-field-parser";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  const window = new Window();
  (global as any).DOMParser = window.DOMParser;
  (global as any).Document = window.Document;
  (global as any).Element = window.Element;
  (global as any).Node = window.Node;
});

describe("Form Field Parser Enhanced Coverage", () => {
  describe("parseFieldInstruction", () => {
    test("should parse FORMTEXT field with default text", () => {
      const instruction = 'FORMTEXT "Default Value"';
      const field = parseFieldInstruction(instruction);
      
      expect(field.type).toBe("FORMTEXT");
      expect(field.instruction).toBe(instruction);
      expect(field.properties?.defaultText).toBe("Default Value");
    });

    test("should parse HYPERLINK field with URL", () => {
      const instruction = 'HYPERLINK "https://example.com"';
      const field = parseFieldInstruction(instruction);
      
      expect(field.type).toBe("HYPERLINK");
      expect(field.properties?.url).toBe("https://example.com");
    });

    test("should parse field with switches", () => {
      const instruction = 'DATE \\@ "MM/dd/yyyy" \\* MERGEFORMAT';
      const field = parseFieldInstruction(instruction);
      
      expect(field.type).toBe("DATE");
      expect(field.properties?.["@"]).toBe("MM/dd/yyyy");
      expect(field.properties?.["*"]).toBe("MERGEFORMAT");
    });

    test("should parse field with switches without quotes", () => {
      const instruction = 'PAGE \\# 0 \\* ARABIC';
      const field = parseFieldInstruction(instruction);
      
      expect(field.type).toBe("PAGE");
      expect(field.properties?.["#"]).toBe("0");
      expect(field.properties?.["*"]).toBe("ARABIC");
    });

    test("should handle field with only switch names", () => {
      const instruction = 'FORMTEXT \\MAXLENGTH';
      const field = parseFieldInstruction(instruction);
      
      expect(field.type).toBe("FORMTEXT");
      expect(field.properties?.["MAXLENGTH"]).toBe("true");
    });

    test("should handle unknown field type", () => {
      const instruction = 'UNKNOWN_FIELD some parameters';
      const field = parseFieldInstruction(instruction);
      
      expect(field.type).toBe("UNKNOWN_FIELD");
      expect(field.instruction).toBe(instruction);
    });

    test("should handle empty instruction", () => {
      const instruction = '';
      const field = parseFieldInstruction(instruction);
      
      expect(field.type).toBe("UNKNOWN");
      expect(field.instruction).toBe("");
    });

    test("should handle instruction with only whitespace", () => {
      const instruction = '   ';
      const field = parseFieldInstruction(instruction);
      
      expect(field.type).toBe("UNKNOWN");
    });

    test("should handle FORMTEXT without quotes", () => {
      const instruction = 'FORMTEXT DefaultText';
      const field = parseFieldInstruction(instruction);
      
      expect(field.type).toBe("FORMTEXT");
      expect(field.properties?.defaultText).toBeUndefined();
    });

    test("should handle HYPERLINK without quotes", () => {
      const instruction = 'HYPERLINK https://example.com';
      const field = parseFieldInstruction(instruction);
      
      expect(field.type).toBe("HYPERLINK");
      expect(field.properties?.url).toBeUndefined();
    });

    test("should parse complex switches with special characters", () => {
      const instruction = 'MERGEFIELD Name \\* Upper \\b "["  \\f "]"';
      const field = parseFieldInstruction(instruction);
      
      expect(field.type).toBe("MERGEFIELD");
      expect(field.properties?.["*"]).toBe("Upper");
      expect(field.properties?.["b"]).toBe("[");
      expect(field.properties?.["f"]).toBe("]");
    });
  });

  describe("parseFieldsFromParagraph", () => {
    test("should parse paragraph with complete field", async () => {
      const paragraphXml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
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

      const fields = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));
      
      expect(fields).toHaveLength(1);
      expect(fields[0]?.type).toBe("PAGE");
      expect(fields[0]?.instruction).toBe("PAGE");
      expect(fields[0]?.result).toBe("1");
    });

    test("should parse field without separator", async () => {
      const paragraphXml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>DATE</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const fields = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));
      
      expect(fields).toHaveLength(1);
      expect(fields[0]?.type).toBe("DATE");
      expect(fields[0]?.result).toBeUndefined();
    });

    test("should handle nested fields", async () => {
      const paragraphXml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>IF</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>PAGE</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const fields = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));
      
      expect(fields).toHaveLength(1);
      expect(fields[0]?.type).toBe("IFPAGE"); // The nested field instruction gets concatenated
    });

    test("should parse multiple instruction text elements", async () => {
      const paragraphXml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>DATE</w:instrText>
          </w:r>
          <w:r>
            <w:instrText> \\@ "MM/dd/yyyy"</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const fields = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));
      
      expect(fields).toHaveLength(1);
      expect(fields[0]?.instruction).toBe('DATE \\@ "MM/dd/yyyy"');
    });

    test("should parse multiple result text elements", async () => {
      const paragraphXml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>AUTHOR</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="separate"/>
          </w:r>
          <w:r>
            <w:t>John</w:t>
          </w:r>
          <w:r>
            <w:t> Doe</w:t>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const fields = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));
      
      expect(fields).toHaveLength(1);
      expect(fields[0]?.result).toBe("John Doe");
    });

    test("should handle paragraph without namespace", async () => {
      const paragraphXml = `
        <w:p>
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>TIME</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const fields = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));
      
      expect(fields).toHaveLength(1);
      expect(fields[0]?.type).toBe("TIME");
    });

    test("should handle field characters without attributes", async () => {
      const paragraphXml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:fldChar/>
          </w:r>
          <w:r>
            <w:t>Some text</w:t>
          </w:r>
        </w:p>`;

      const fields = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));
      
      expect(fields).toHaveLength(0);
    });

    test("should handle empty instruction text", async () => {
      const paragraphXml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText></w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const fields = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));
      
      expect(fields).toHaveLength(1);
      expect(fields[0]?.instruction).toBe("");
    });

    test("should handle fallback to getElementsByTagName", async () => {
      // This tests the fallback when getElementsByTagNameNS returns empty
      const paragraphXml = `
        <w:p>
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>FILENAME</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const fields = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));
      
      expect(fields).toHaveLength(1);
      expect(fields[0]?.type).toBe("FILENAME");
    });

    test("should handle malformed XML", async () => {
      const paragraphXml = `<w:p><invalid><w:r></w:p>`;

      await expect(Effect.runPromise(parseFieldsFromParagraph(paragraphXml))).rejects.toThrow();
    });

    test("should handle instruction text after separator", async () => {
      const paragraphXml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
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
            <w:instrText>This should be ignored</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const fields = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));
      
      expect(fields).toHaveLength(1);
      expect(fields[0]?.instruction).toBe("PAGE");
    });

    test("should handle text elements before separator", async () => {
      const paragraphXml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:t>This should be ignored</w:t>
          </w:r>
          <w:r>
            <w:instrText>PAGE</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const fields = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));
      
      expect(fields).toHaveLength(1);
      expect(fields[0]?.instruction).toBe("PAGE");
    });
  });

  describe("fieldToMarkdown", () => {
    test("should convert FORMTEXT field", () => {
      const field: DocxField = {
        type: FieldCode.FORMTEXT,
        instruction: 'FORMTEXT "Test Input"',
        properties: { defaultText: "Test Input" }
      };
      
      expect(fieldToMarkdown(field)).toBe("[Test Input]");
    });

    test("should convert FORMTEXT field without default text", () => {
      const field: DocxField = {
        type: FieldCode.FORMTEXT,
        instruction: 'FORMTEXT',
        properties: {}
      };
      
      expect(fieldToMarkdown(field)).toBe("[_____________]");
    });

    test("should convert FORMCHECKBOX field", () => {
      const field: DocxField = {
        type: FieldCode.FORMCHECKBOX,
        instruction: 'FORMCHECKBOX'
      };
      
      expect(fieldToMarkdown(field)).toBe("☐");
    });

    test("should convert FORMDROPDOWN field", () => {
      const field: DocxField = {
        type: FieldCode.FORMDROPDOWN,
        instruction: 'FORMDROPDOWN'
      };
      
      expect(fieldToMarkdown(field)).toBe("[Select Option ▼]");
    });

    test("should convert PAGE field with result", () => {
      const field: DocxField = {
        type: FieldCode.PAGE,
        instruction: 'PAGE',
        result: "5"
      };
      
      expect(fieldToMarkdown(field)).toBe("5");
    });

    test("should convert PAGE field without result", () => {
      const field: DocxField = {
        type: FieldCode.PAGE,
        instruction: 'PAGE'
      };
      
      expect(fieldToMarkdown(field)).toBe("[Page]");
    });

    test("should convert NUMPAGES field", () => {
      const field: DocxField = {
        type: FieldCode.NUMPAGES,
        instruction: 'NUMPAGES',
        result: "10"
      };
      
      expect(fieldToMarkdown(field)).toBe("10");
    });

    test("should convert DATE field with result", () => {
      const field: DocxField = {
        type: FieldCode.DATE,
        instruction: 'DATE',
        result: "12/25/2023"
      };
      
      expect(fieldToMarkdown(field)).toBe("12/25/2023");
    });

    test("should convert DATE field without result", () => {
      const field: DocxField = {
        type: FieldCode.DATE,
        instruction: 'DATE'
      };
      
      const result = fieldToMarkdown(field);
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Should be current date
    });

    test("should convert TIME field", () => {
      const field: DocxField = {
        type: FieldCode.TIME,
        instruction: 'TIME',
        result: "2:30 PM"
      };
      
      expect(fieldToMarkdown(field)).toBe("2:30 PM");
    });

    test("should convert FILENAME field", () => {
      const field: DocxField = {
        type: FieldCode.FILENAME,
        instruction: 'FILENAME',
        result: "document.docx"
      };
      
      expect(fieldToMarkdown(field)).toBe("document.docx");
    });

    test("should convert AUTHOR field", () => {
      const field: DocxField = {
        type: FieldCode.AUTHOR,
        instruction: 'AUTHOR',
        result: "John Doe"
      };
      
      expect(fieldToMarkdown(field)).toBe("John Doe");
    });

    test("should convert TITLE field", () => {
      const field: DocxField = {
        type: FieldCode.TITLE,
        instruction: 'TITLE',
        result: "Document Title"
      };
      
      expect(fieldToMarkdown(field)).toBe("Document Title");
    });

    test("should convert HYPERLINK field with URL and result", () => {
      const field: DocxField = {
        type: FieldCode.HYPERLINK,
        instruction: 'HYPERLINK "https://example.com"',
        result: "Example",
        properties: { url: "https://example.com" }
      };
      
      expect(fieldToMarkdown(field)).toBe("[Example](https://example.com)");
    });

    test("should convert HYPERLINK field with URL only", () => {
      const field: DocxField = {
        type: FieldCode.HYPERLINK,
        instruction: 'HYPERLINK "https://example.com"',
        properties: { url: "https://example.com" }
      };
      
      expect(fieldToMarkdown(field)).toBe("https://example.com");
    });

    test("should convert HYPERLINK field with result only", () => {
      const field: DocxField = {
        type: FieldCode.HYPERLINK,
        instruction: 'HYPERLINK',
        result: "Link Text"
      };
      
      expect(fieldToMarkdown(field)).toBe("Link Text");
    });

    test("should convert HYPERLINK field without URL or result", () => {
      const field: DocxField = {
        type: FieldCode.HYPERLINK,
        instruction: 'HYPERLINK'
      };
      
      expect(fieldToMarkdown(field)).toBe("[Link]");
    });

    test("should convert REF field", () => {
      const field: DocxField = {
        type: FieldCode.REF,
        instruction: 'REF bookmark1',
        result: "Referenced Text"
      };
      
      expect(fieldToMarkdown(field)).toBe("Referenced Text");
    });

    test("should convert REF field without result", () => {
      const field: DocxField = {
        type: FieldCode.REF,
        instruction: 'REF bookmark1'
      };
      
      expect(fieldToMarkdown(field)).toBe("[Reference: REF bookmark1]");
    });

    test("should convert TOC field", () => {
      const field: DocxField = {
        type: FieldCode.TOC,
        instruction: 'TOC'
      };
      
      expect(fieldToMarkdown(field)).toBe("");
    });

    test("should convert unknown field with result", () => {
      const field: DocxField = {
        type: "UNKNOWN_FIELD",
        instruction: 'UNKNOWN_FIELD',
        result: "Some result"
      };
      
      expect(fieldToMarkdown(field)).toBe("Some result");
    });

    test("should convert unknown field without result", () => {
      const field: DocxField = {
        type: "UNKNOWN_FIELD",
        instruction: 'UNKNOWN_FIELD'
      };
      
      expect(fieldToMarkdown(field)).toBe("[UNKNOWN_FIELD]");
    });
  });
});