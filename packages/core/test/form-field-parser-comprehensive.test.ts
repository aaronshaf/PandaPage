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

describe("Form Field Parser Comprehensive Tests", () => {
  describe("parseFieldInstruction", () => {
    test("should parse FORMTEXT field with default text", () => {
      const instruction = 'FORMTEXT "Default Value"';
      const result = parseFieldInstruction(instruction);
      
      expect(result.type).toBe("FORMTEXT");
      expect(result.instruction).toBe(instruction);
      expect(result.properties?.defaultText).toBe("Default Value");
    });

    test("should parse FORMTEXT field without default text", () => {
      const instruction = "FORMTEXT";
      const result = parseFieldInstruction(instruction);
      
      expect(result.type).toBe("FORMTEXT");
      expect(result.properties?.defaultText).toBeUndefined();
    });

    test("should parse HYPERLINK field with URL", () => {
      const instruction = 'HYPERLINK "https://example.com"';
      const result = parseFieldInstruction(instruction);
      
      expect(result.type).toBe("HYPERLINK");
      expect(result.properties?.url).toBe("https://example.com");
    });

    test("should parse field with switches", () => {
      const instruction = 'DATE \\@ "MM/dd/yyyy" \\* MERGEFORMAT';
      const result = parseFieldInstruction(instruction);
      
      expect(result.type).toBe("DATE");
      expect(result.properties?.["@"]).toBe("MM/dd/yyyy");
      expect(result.properties?.["*"]).toBe("MERGEFORMAT");
    });

    test("should parse field with unquoted switch values", () => {
      const instruction = 'REF bookmark1 \\h \\p';
      const result = parseFieldInstruction(instruction);
      
      expect(result.type).toBe("REF");
      expect(result.properties?.h).toBe("true");
      expect(result.properties?.p).toBe("true");
    });

    test("should handle unknown field types", () => {
      const instruction = "UNKNOWNFIELD some parameters";
      const result = parseFieldInstruction(instruction);
      
      expect(result.type).toBe("UNKNOWNFIELD");
      expect(result.instruction).toBe(instruction);
    });

    test("should handle empty instruction", () => {
      const instruction = "";
      const result = parseFieldInstruction(instruction);
      
      expect(result.type).toBe("UNKNOWN");
      expect(result.instruction).toBe("");
    });

    test("should handle instruction with only whitespace", () => {
      const instruction = "   ";
      const result = parseFieldInstruction(instruction);
      
      expect(result.type).toBe("UNKNOWN");
      expect(result.instruction).toBe("");
    });

    test("should handle complex switch patterns", () => {
      const instruction = 'FILENAME \\p \\# "special#char" \\w';
      const result = parseFieldInstruction(instruction);
      
      expect(result.type).toBe("FILENAME");
      expect(result.properties?.p).toBe("true");
      expect(result.properties?.["#"]).toBe("special#char");
      expect(result.properties?.w).toBe("true");
    });
  });

  describe("parseFieldsFromParagraph", () => {
    test("should parse simple field", async () => {
      const xml = `
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
            <w:t>5</w:t>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const result = await Effect.runPromise(parseFieldsFromParagraph(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe("PAGE");
      expect(result[0]?.result).toBe("5");
    });

    test("should parse field without result", async () => {
      const xml = `
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

      const result = await Effect.runPromise(parseFieldsFromParagraph(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe("DATE");
      expect(result[0]?.result).toBeUndefined();
    });

    test("should parse multiple fields", async () => {
      const xml = `
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

      const result = await Effect.runPromise(parseFieldsFromParagraph(xml));
      expect(result).toHaveLength(2);
      expect(result[0]?.type).toBe("PAGE");
      expect(result[0]?.result).toBe("1");
      expect(result[1]?.type).toBe("NUMPAGES");
      expect(result[1]?.result).toBe("10");
    });

    test("should handle nested fields", async () => {
      const xml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>IF </w:instrText>
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
            <w:instrText> = 1 "First" "Other"</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const result = await Effect.runPromise(parseFieldsFromParagraph(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe("IF");
    });

    test("should handle multiple instruction text runs", async () => {
      const xml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>HYPER</w:instrText>
          </w:r>
          <w:r>
            <w:instrText>LINK</w:instrText>
          </w:r>
          <w:r>
            <w:instrText> "https://example.com"</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const result = await Effect.runPromise(parseFieldsFromParagraph(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe("HYPERLINK");
      expect(result[0]?.properties?.url).toBe("https://example.com");
    });

    test("should handle multiple result text runs", async () => {
      const xml = `
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
            <w:t>John </w:t>
          </w:r>
          <w:r>
            <w:t>Doe</w:t>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const result = await Effect.runPromise(parseFieldsFromParagraph(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe("AUTHOR");
      expect(result[0]?.result).toBe("John Doe");
    });

    test("should handle paragraph without namespace declaration", async () => {
      const xml = `
        <w:p>
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>TITLE</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const result = await Effect.runPromise(parseFieldsFromParagraph(xml));
      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe("TITLE");
    });

    test("should handle invalid XML", async () => {
      const xml = `<w:p><w:r><w:fldChar`;

      await expect(Effect.runPromise(parseFieldsFromParagraph(xml))).rejects.toThrow();
    });

    test("should handle field without fldCharType attribute", async () => {
      const xml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:fldChar/>
          </w:r>
          <w:r>
            <w:instrText>BROKEN</w:instrText>
          </w:r>
        </w:p>`;

      const result = await Effect.runPromise(parseFieldsFromParagraph(xml));
      expect(result).toHaveLength(0);
    });
  });

  describe("fieldToMarkdown", () => {
    test("should convert FORMTEXT with default text", () => {
      const field: DocxField = {
        type: FieldCode.FORMTEXT,
        instruction: 'FORMTEXT "Enter Name"',
        properties: { defaultText: "Enter Name" },
      };
      
      expect(fieldToMarkdown(field)).toBe("[Enter Name]");
    });

    test("should convert FORMTEXT without default text", () => {
      const field: DocxField = {
        type: FieldCode.FORMTEXT,
        instruction: "FORMTEXT",
      };
      
      expect(fieldToMarkdown(field)).toBe("[_____________]");
    });

    test("should convert FORMCHECKBOX", () => {
      const field: DocxField = {
        type: FieldCode.FORMCHECKBOX,
        instruction: "FORMCHECKBOX",
      };
      
      expect(fieldToMarkdown(field)).toBe("☐");
    });

    test("should convert FORMDROPDOWN", () => {
      const field: DocxField = {
        type: FieldCode.FORMDROPDOWN,
        instruction: "FORMDROPDOWN",
      };
      
      expect(fieldToMarkdown(field)).toBe("[Select Option ▼]");
    });

    test("should convert PAGE with result", () => {
      const field: DocxField = {
        type: FieldCode.PAGE,
        instruction: "PAGE",
        result: "5",
      };
      
      expect(fieldToMarkdown(field)).toBe("5");
    });

    test("should convert PAGE without result", () => {
      const field: DocxField = {
        type: FieldCode.PAGE,
        instruction: "PAGE",
      };
      
      expect(fieldToMarkdown(field)).toBe("[Page]");
    });

    test("should convert NUMPAGES", () => {
      const field: DocxField = {
        type: FieldCode.NUMPAGES,
        instruction: "NUMPAGES",
        result: "100",
      };
      
      expect(fieldToMarkdown(field)).toBe("100");
    });

    test("should convert DATE with result", () => {
      const field: DocxField = {
        type: FieldCode.DATE,
        instruction: "DATE",
        result: "12/25/2023",
      };
      
      expect(fieldToMarkdown(field)).toBe("12/25/2023");
    });

    test("should convert DATE without result", () => {
      const field: DocxField = {
        type: FieldCode.DATE,
        instruction: "DATE",
      };
      
      const result = fieldToMarkdown(field);
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    test("should convert TIME with result", () => {
      const field: DocxField = {
        type: FieldCode.TIME,
        instruction: "TIME",
        result: "3:45 PM",
      };
      
      expect(fieldToMarkdown(field)).toBe("3:45 PM");
    });

    test("should convert TIME without result", () => {
      const field: DocxField = {
        type: FieldCode.TIME,
        instruction: "TIME",
      };
      
      const result = fieldToMarkdown(field);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    test("should convert FILENAME", () => {
      const field: DocxField = {
        type: FieldCode.FILENAME,
        instruction: "FILENAME",
        result: "document.docx",
      };
      
      expect(fieldToMarkdown(field)).toBe("document.docx");
    });

    test("should convert AUTHOR", () => {
      const field: DocxField = {
        type: FieldCode.AUTHOR,
        instruction: "AUTHOR",
        result: "John Doe",
      };
      
      expect(fieldToMarkdown(field)).toBe("John Doe");
    });

    test("should convert TITLE", () => {
      const field: DocxField = {
        type: FieldCode.TITLE,
        instruction: "TITLE",
        result: "My Document",
      };
      
      expect(fieldToMarkdown(field)).toBe("My Document");
    });

    test("should convert HYPERLINK with URL and text", () => {
      const field: DocxField = {
        type: FieldCode.HYPERLINK,
        instruction: 'HYPERLINK "https://example.com"',
        result: "Click Here",
        properties: { url: "https://example.com" },
      };
      
      expect(fieldToMarkdown(field)).toBe("[Click Here](https://example.com)");
    });

    test("should convert HYPERLINK with URL only", () => {
      const field: DocxField = {
        type: FieldCode.HYPERLINK,
        instruction: 'HYPERLINK "https://example.com"',
        properties: { url: "https://example.com" },
      };
      
      expect(fieldToMarkdown(field)).toBe("https://example.com");
    });

    test("should convert HYPERLINK with result only", () => {
      const field: DocxField = {
        type: FieldCode.HYPERLINK,
        instruction: "HYPERLINK",
        result: "Link Text",
      };
      
      expect(fieldToMarkdown(field)).toBe("Link Text");
    });

    test("should convert HYPERLINK without URL or result", () => {
      const field: DocxField = {
        type: FieldCode.HYPERLINK,
        instruction: "HYPERLINK",
      };
      
      expect(fieldToMarkdown(field)).toBe("[Link]");
    });

    test("should convert REF with result", () => {
      const field: DocxField = {
        type: FieldCode.REF,
        instruction: "REF bookmark1",
        result: "Referenced Text",
      };
      
      expect(fieldToMarkdown(field)).toBe("Referenced Text");
    });

    test("should convert REF without result", () => {
      const field: DocxField = {
        type: FieldCode.REF,
        instruction: "REF bookmark1",
      };
      
      expect(fieldToMarkdown(field)).toBe("[Reference: REF bookmark1]");
    });

    test("should convert TOC", () => {
      const field: DocxField = {
        type: FieldCode.TOC,
        instruction: "TOC",
      };
      
      expect(fieldToMarkdown(field)).toBe("");
    });

    test("should convert unknown field type with result", () => {
      const field: DocxField = {
        type: "CUSTOMFIELD",
        instruction: "CUSTOMFIELD",
        result: "Custom Value",
      };
      
      expect(fieldToMarkdown(field)).toBe("Custom Value");
    });

    test("should convert unknown field type without result", () => {
      const field: DocxField = {
        type: "CUSTOMFIELD",
        instruction: "CUSTOMFIELD",
      };
      
      expect(fieldToMarkdown(field)).toBe("[CUSTOMFIELD]");
    });

    test("should handle SUBJECT field", () => {
      const field: DocxField = {
        type: FieldCode.SUBJECT,
        instruction: "SUBJECT",
        result: "Test Subject",
      };
      
      expect(fieldToMarkdown(field)).toBe("Test Subject");
    });

    test("should handle KEYWORDS field", () => {
      const field: DocxField = {
        type: FieldCode.KEYWORDS,
        instruction: "KEYWORDS",
        result: "test, document, sample",
      };
      
      expect(fieldToMarkdown(field)).toBe("test, document, sample");
    });
  });

  describe("processFieldsInParagraph", () => {
    test("should process paragraph with multiple fields", async () => {
      const xml = `
        <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>FORMTEXT "Name"</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>`;

      const result = await Effect.runPromise(processFieldsInParagraph(xml));
      expect(result.xml).toBe(xml);
      expect(result.fields).toHaveLength(1);
      expect(result.fields[0]?.type).toBe("FORMTEXT");
    });

    test("should handle empty paragraph", async () => {
      const xml = "<w:p></w:p>";
      const result = await Effect.runPromise(processFieldsInParagraph(xml));
      expect(result.xml).toBe(xml);
      expect(result.fields).toHaveLength(0);
    });
  });
});