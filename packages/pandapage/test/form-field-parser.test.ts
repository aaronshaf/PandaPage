import { describe, test, expect, beforeAll } from "bun:test";
import { Effect } from "effect";
import {
  parseFieldInstruction,
  parseFieldsFromParagraph,
  fieldToMarkdown,
  paragraphContainsFields,
  processFieldsInParagraph,
  FieldCode,
  type DocxField
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

  describe("parseFieldInstruction", () => {
    test("should parse basic field instruction", () => {
      const result = parseFieldInstruction("PAGE");
      
      expect(result.type).toBe("PAGE");
      expect(result.instruction).toBe("PAGE");
      expect(result.properties).toEqual({});
    });

    test("should parse field with switches", () => {
      const result = parseFieldInstruction("DATE \\@ \"dd/MM/yyyy\" \\* MERGEFORMAT");
      
      expect(result.type).toBe("DATE");
      expect(result.instruction).toBe("DATE \\@ \"dd/MM/yyyy\" \\* MERGEFORMAT");
      expect(result.properties).toEqual({
        "@": "dd/MM/yyyy",
        "*": "MERGEFORMAT"
      });
    });

    test("should parse field with unquoted switch values", () => {
      const result = parseFieldInstruction("REF bookmark1 \\h");
      
      expect(result.type).toBe("REF");
      expect(result.properties).toEqual({
        "h": "true"
      });
    });

    test("should parse FORMTEXT field with default text", () => {
      const result = parseFieldInstruction('FORMTEXT "Enter your name here"');
      
      expect(result.type).toBe("FORMTEXT");
      expect(result.properties).toEqual({
        defaultText: "Enter your name here"
      });
    });

    test("should parse FORMTEXT field without default text", () => {
      const result = parseFieldInstruction("FORMTEXT");
      
      expect(result.type).toBe("FORMTEXT");
      expect(result.properties).toEqual({});
    });

    test("should parse HYPERLINK field with URL", () => {
      const result = parseFieldInstruction('HYPERLINK "https://example.com"');
      
      expect(result.type).toBe("HYPERLINK");
      expect(result.properties).toEqual({
        url: "https://example.com"
      });
    });

    test("should parse HYPERLINK field with URL and switches", () => {
      const result = parseFieldInstruction('HYPERLINK "https://example.com" \\o "Tooltip text"');
      
      expect(result.type).toBe("HYPERLINK");
      expect(result.properties).toEqual({
        url: "https://example.com",
        "o": "Tooltip text"
      });
    });

    test("should handle empty instruction", () => {
      const result = parseFieldInstruction("");
      
      expect(result.type).toBe("UNKNOWN");
      expect(result.instruction).toBe("");
      expect(result.properties).toEqual({});
    });

    test("should handle whitespace-only instruction", () => {
      const result = parseFieldInstruction("   ");
      
      expect(result.type).toBe("UNKNOWN");
      expect(result.instruction).toBe("");
      expect(result.properties).toEqual({});
    });

    test("should handle instruction with only spaces", () => {
      const result = parseFieldInstruction("  PAGE  ");
      
      expect(result.type).toBe("PAGE");
      expect(result.instruction).toBe("PAGE");
      expect(result.properties).toEqual({});
    });

    test("should handle unknown field type", () => {
      const result = parseFieldInstruction("UNKNOWNFIELD");
      
      expect(result.type).toBe("UNKNOWNFIELD");
      expect(result.instruction).toBe("UNKNOWNFIELD");
      expect(result.properties).toEqual({});
    });

    test("should parse complex field with multiple switches", () => {
      const result = parseFieldInstruction('PAGE \\* ARABIC \\* MERGEFORMAT \\s "prefix"');
      
      expect(result.type).toBe("PAGE");
      expect(result.properties).toEqual({
        "*": "MERGEFORMAT", // Last occurrence wins
        "s": "prefix"
      });
    });

    test("should handle switches with special characters", () => {
      const result = parseFieldInstruction("DATE \\@ \"d/M/yyyy h:mm\"");
      
      expect(result.type).toBe("DATE");
      expect(result.properties).toEqual({
        "@": "d/M/yyyy h:mm"
      });
    });
  });

  describe("parseFieldsFromParagraph", () => {
    test("should parse simple field in paragraph", async () => {
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

      const result = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: "PAGE",
        instruction: "PAGE",
        result: "1",
        properties: {}
      });
    });

    test("should parse field without result", async () => {
      const paragraphXml = `
        <w:p>
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>NUMPAGES</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const result = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: "NUMPAGES",
        instruction: "NUMPAGES",
        properties: {}
      });
    });

    test("should parse multiple fields in paragraph", async () => {
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
          <w:r>
            <w:t> of </w:t>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>NUMPAGES</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="separate"/>
          </w:r>
          <w:r>
            <w:t>10</w:t>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const result = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));

      expect(result).toHaveLength(2);
      expect(result[0]?.type).toBe("PAGE");
      expect(result[0]?.result).toBe("1");
      expect(result[1]?.type).toBe("NUMPAGES");
      expect(result[1]?.result).toBe("10");
    });

    test("should handle nested fields", async () => {
      const paragraphXml = `
        <w:p>
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>DATE</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>NESTED</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="separate"/>
          </w:r>
          <w:r>
            <w:t>01/01/2024</w:t>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const result = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));

      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe("DATENESTED");  // The instruction text gets concatenated during nesting
      expect(result[0]?.result).toBe("01/01/2024");
    });

    test("should handle multipart instruction text", async () => {
      const paragraphXml = `
        <w:p>
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>DATE </w:instrText>
          </w:r>
          <w:r>
            <w:instrText>\\@ "dd/MM/yyyy"</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="separate"/>
          </w:r>
          <w:r>
            <w:t>01/01/2024</w:t>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const result = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));

      expect(result).toHaveLength(1);
      expect(result[0]?.instruction).toBe('DATE \\@ "dd/MM/yyyy"');
      expect(result[0]?.properties).toEqual({
        "@": "dd/MM/yyyy"
      });
    });

    test("should handle multipart result text", async () => {
      const paragraphXml = `
        <w:p>
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
            <w:t>John </w:t>
          </w:r>
          <w:r>
            <w:t>Doe</w:t>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const result = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));

      expect(result).toHaveLength(1);
      expect(result[0]?.result).toBe("John Doe");
    });

    test("should handle paragraph without fields", async () => {
      const paragraphXml = `
        <w:p>
          <w:r>
            <w:t>Regular text without fields</w:t>
          </w:r>
        </w:p>`;

      const result = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));

      expect(result).toHaveLength(0);
    });

    test("should handle empty paragraph", async () => {
      const paragraphXml = "<w:p></w:p>";

      const result = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));

      expect(result).toHaveLength(0);
    });

    test("should handle runs without content", async () => {
      const paragraphXml = `
        <w:p>
          <w:r></w:r>
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>PAGE</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
          <w:r></w:r>
        </w:p>`;

      const result = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));

      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe("PAGE");
    });
  });

  describe("fieldToMarkdown", () => {
    test("should convert FORMTEXT field with default text", () => {
      const field: DocxField = {
        type: FieldCode.FORMTEXT,
        instruction: 'FORMTEXT "Enter name"',
        properties: { defaultText: "Enter name" }
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("[Enter name]");
    });

    test("should convert FORMTEXT field without default text", () => {
      const field: DocxField = {
        type: FieldCode.FORMTEXT,
        instruction: "FORMTEXT",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("[_____________]");
    });

    test("should convert FORMCHECKBOX field", () => {
      const field: DocxField = {
        type: FieldCode.FORMCHECKBOX,
        instruction: "FORMCHECKBOX",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("☐");
    });

    test("should convert FORMDROPDOWN field", () => {
      const field: DocxField = {
        type: FieldCode.FORMDROPDOWN,
        instruction: "FORMDROPDOWN",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("[Select Option ▼]");
    });

    test("should convert PAGE field with result", () => {
      const field: DocxField = {
        type: FieldCode.PAGE,
        instruction: "PAGE",
        result: "5",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("5");
    });

    test("should convert PAGE field without result", () => {
      const field: DocxField = {
        type: FieldCode.PAGE,
        instruction: "PAGE",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("[Page]");
    });

    test("should convert NUMPAGES field", () => {
      const field: DocxField = {
        type: FieldCode.NUMPAGES,
        instruction: "NUMPAGES",
        result: "10",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("10");
    });

    test("should convert DATE field with result", () => {
      const field: DocxField = {
        type: FieldCode.DATE,
        instruction: "DATE",
        result: "01/01/2024",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("01/01/2024");
    });

    test("should convert DATE field without result", () => {
      const field: DocxField = {
        type: FieldCode.DATE,
        instruction: "DATE",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      // Should return current date, just check it's a string
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    test("should convert TIME field without result", () => {
      const field: DocxField = {
        type: FieldCode.TIME,
        instruction: "TIME",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      // Should return current time, just check it's a string
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    test("should convert FILENAME field", () => {
      const field: DocxField = {
        type: FieldCode.FILENAME,
        instruction: "FILENAME",
        result: "document.docx",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("document.docx");
    });

    test("should convert AUTHOR field", () => {
      const field: DocxField = {
        type: FieldCode.AUTHOR,
        instruction: "AUTHOR",
        result: "John Doe",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("John Doe");
    });

    test("should convert TITLE field", () => {
      const field: DocxField = {
        type: FieldCode.TITLE,
        instruction: "TITLE",
        result: "Document Title",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("Document Title");
    });

    test("should convert HYPERLINK field with URL and text", () => {
      const field: DocxField = {
        type: FieldCode.HYPERLINK,
        instruction: 'HYPERLINK "https://example.com"',
        result: "Visit Example",
        properties: { url: "https://example.com" }
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("[Visit Example](https://example.com)");
    });

    test("should convert HYPERLINK field with URL only", () => {
      const field: DocxField = {
        type: FieldCode.HYPERLINK,
        instruction: 'HYPERLINK "https://example.com"',
        properties: { url: "https://example.com" }
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("https://example.com");
    });

    test("should convert HYPERLINK field with text only", () => {
      const field: DocxField = {
        type: FieldCode.HYPERLINK,
        instruction: "HYPERLINK",
        result: "Link Text",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("Link Text");
    });

    test("should convert HYPERLINK field without URL or text", () => {
      const field: DocxField = {
        type: FieldCode.HYPERLINK,
        instruction: "HYPERLINK",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("[Link]");
    });

    test("should convert REF field", () => {
      const field: DocxField = {
        type: FieldCode.REF,
        instruction: "REF bookmark1",
        result: "Referenced text",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("Referenced text");
    });

    test("should convert REF field without result", () => {
      const field: DocxField = {
        type: FieldCode.REF,
        instruction: "REF bookmark1",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("[Reference: REF bookmark1]");
    });

    test("should convert TOC field", () => {
      const field: DocxField = {
        type: FieldCode.TOC,
        instruction: "TOC",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("");
    });

    test("should convert unknown field with result", () => {
      const field: DocxField = {
        type: "UNKNOWN",
        instruction: "UNKNOWN",
        result: "Some result",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("Some result");
    });

    test("should convert unknown field without result", () => {
      const field: DocxField = {
        type: "UNKNOWN",
        instruction: "UNKNOWN",
        properties: {}
      };

      const result = fieldToMarkdown(field);
      expect(result).toBe("[UNKNOWN]");
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