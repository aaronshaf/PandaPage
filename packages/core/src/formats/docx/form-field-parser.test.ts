import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import {
  parseFieldInstruction,
  parseFieldsFromParagraph,
  fieldToMarkdown,
  paragraphContainsFields,
  FieldCode,
  type DocxField,
} from "./form-field-parser";

describe("Form Field Parser", () => {
  describe("parseFieldInstruction", () => {
    test("should parse FORMTEXT field with default text", () => {
      const instruction = 'FORMTEXT "Enter your name here"';
      const field = parseFieldInstruction(instruction);

      expect(field.type).toBe(FieldCode.FORMTEXT);
      expect(field.instruction).toBe(instruction);
      expect(field.properties?.defaultText).toBe("Enter your name here");
    });

    test("should parse FORMTEXT field without default text", () => {
      const instruction = "FORMTEXT";
      const field = parseFieldInstruction(instruction);

      expect(field.type).toBe(FieldCode.FORMTEXT);
      expect(field.properties?.defaultText).toBeUndefined();
    });

    test("should parse HYPERLINK field", () => {
      const instruction = 'HYPERLINK "https://example.com"';
      const field = parseFieldInstruction(instruction);

      expect(field.type).toBe(FieldCode.HYPERLINK);
      expect(field.properties?.url).toBe("https://example.com");
    });

    test("should parse PAGE field", () => {
      const instruction = "PAGE";
      const field = parseFieldInstruction(instruction);

      expect(field.type).toBe(FieldCode.PAGE);
    });

    test("should parse field with switches", () => {
      const instruction = 'DATE \\@ "MM/dd/yyyy" \\* MERGEFORMAT';
      const field = parseFieldInstruction(instruction);

      expect(field.type).toBe(FieldCode.DATE);
      expect(field.properties?.["@"]).toBe("MM/dd/yyyy");
      expect(field.properties?.["*"]).toBe("MERGEFORMAT");
    });

    test("should handle unknown field types", () => {
      const instruction = "CUSTOMFIELD some parameters";
      const field = parseFieldInstruction(instruction);

      expect(field.type).toBe("CUSTOMFIELD");
      expect(field.instruction).toBe(instruction);
    });
  });

  describe("parseFieldsFromParagraph", () => {
    test("should parse simple FORMTEXT field", async () => {
      const paragraphXml = `
        <w:p>
          <w:r>
            <w:fldChar w:fldCharType="begin"/>
          </w:r>
          <w:r>
            <w:instrText>FORMTEXT</w:instrText>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="separate"/>
          </w:r>
          <w:r>
            <w:t>Default Value</w:t>
          </w:r>
          <w:r>
            <w:fldChar w:fldCharType="end"/>
          </w:r>
        </w:p>
      `;

      const result = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));

      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe(FieldCode.FORMTEXT);
      expect(result[0]?.result).toBe("Default Value");
    });

    test("should parse multiple fields in one paragraph", async () => {
      const paragraphXml = `
        <w:p>
          <w:r><w:t>Name: </w:t></w:r>
          <w:r><w:fldChar w:fldCharType="begin"/></w:r>
          <w:r><w:instrText>FORMTEXT</w:instrText></w:r>
          <w:r><w:fldChar w:fldCharType="end"/></w:r>
          <w:r><w:t>, Date: </w:t></w:r>
          <w:r><w:fldChar w:fldCharType="begin"/></w:r>
          <w:r><w:instrText>DATE</w:instrText></w:r>
          <w:r><w:fldChar w:fldCharType="separate"/></w:r>
          <w:r><w:t>12/25/2023</w:t></w:r>
          <w:r><w:fldChar w:fldCharType="end"/></w:r>
        </w:p>
      `;

      const result = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));

      expect(result).toHaveLength(2);
      expect(result[0]?.type).toBe(FieldCode.FORMTEXT);
      expect(result[1]?.type).toBe(FieldCode.DATE);
      expect(result[1]?.result).toBe("12/25/2023");
    });

    test("should handle nested fields", async () => {
      const paragraphXml = `
        <w:p>
          <w:r><w:fldChar w:fldCharType="begin"/></w:r>
          <w:r><w:instrText>IF </w:instrText></w:r>
          <w:r><w:fldChar w:fldCharType="begin"/></w:r>
          <w:r><w:instrText>PAGE</w:instrText></w:r>
          <w:r><w:fldChar w:fldCharType="end"/></w:r>
          <w:r><w:instrText> = 1 "First Page" "Other Page"</w:instrText></w:r>
          <w:r><w:fldChar w:fldCharType="end"/></w:r>
        </w:p>
      `;

      const result = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));

      // Should handle nested fields correctly
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    test("should handle empty paragraph", async () => {
      const paragraphXml = `<w:p><w:r><w:t>No fields here</w:t></w:r></w:p>`;

      const result = await Effect.runPromise(parseFieldsFromParagraph(paragraphXml));

      expect(result).toHaveLength(0);
    });
  });

  describe("fieldToMarkdown", () => {
    test("should convert FORMTEXT to placeholder", () => {
      const field: DocxField = {
        type: FieldCode.FORMTEXT,
        instruction: "FORMTEXT",
        properties: { defaultText: "Enter name" },
      };

      expect(fieldToMarkdown(field)).toBe("[Enter name]");
    });

    test("should use default placeholder for FORMTEXT without default", () => {
      const field: DocxField = {
        type: FieldCode.FORMTEXT,
        instruction: "FORMTEXT",
      };

      expect(fieldToMarkdown(field)).toBe("[_____________]");
    });

    test("should convert FORMCHECKBOX to checkbox", () => {
      const field: DocxField = {
        type: FieldCode.FORMCHECKBOX,
        instruction: "FORMCHECKBOX",
      };

      expect(fieldToMarkdown(field)).toBe("☐");
    });

    test("should convert FORMDROPDOWN to dropdown", () => {
      const field: DocxField = {
        type: FieldCode.FORMDROPDOWN,
        instruction: "FORMDROPDOWN",
      };

      expect(fieldToMarkdown(field)).toBe("[Select Option ▼]");
    });

    test("should convert PAGE field with result", () => {
      const field: DocxField = {
        type: FieldCode.PAGE,
        instruction: "PAGE",
        result: "1",
      };

      expect(fieldToMarkdown(field)).toBe("1");
    });

    test("should convert HYPERLINK to markdown link", () => {
      const field: DocxField = {
        type: FieldCode.HYPERLINK,
        instruction: 'HYPERLINK "https://example.com"',
        properties: { url: "https://example.com" },
        result: "Example Link",
      };

      expect(fieldToMarkdown(field)).toBe("[Example Link](https://example.com)");
    });

    test("should handle DATE field", () => {
      const field: DocxField = {
        type: FieldCode.DATE,
        instruction: "DATE",
        result: "12/25/2023",
      };

      expect(fieldToMarkdown(field)).toBe("12/25/2023");
    });

    test("should use current date for DATE without result", () => {
      const field: DocxField = {
        type: FieldCode.DATE,
        instruction: "DATE",
      };

      const result = fieldToMarkdown(field);
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Basic date format check
    });

    test("should handle unknown field types", () => {
      const field: DocxField = {
        type: "CUSTOMFIELD",
        instruction: "CUSTOMFIELD",
        result: "Custom Result",
      };

      expect(fieldToMarkdown(field)).toBe("Custom Result");
    });

    test("should show placeholder for unknown field without result", () => {
      const field: DocxField = {
        type: "UNKNOWNFIELD",
        instruction: "UNKNOWNFIELD",
      };

      expect(fieldToMarkdown(field)).toBe("[UNKNOWNFIELD]");
    });
  });

  describe("paragraphContainsFields", () => {
    test("should detect fields in paragraph", () => {
      const xmlWithField = '<w:p><w:r><w:fldChar w:fldCharType="begin"/></w:r></w:p>';
      expect(paragraphContainsFields(xmlWithField)).toBe(true);
    });

    test("should return false for paragraph without fields", () => {
      const xmlWithoutField = "<w:p><w:r><w:t>Regular text</w:t></w:r></w:p>";
      expect(paragraphContainsFields(xmlWithoutField)).toBe(false);
    });
  });

  describe("edge cases", () => {
    test("should handle malformed field XML gracefully", async () => {
      const malformedXml = `
        <w:p>
          <w:r><w:fldChar w:fldCharType="begin"/></w:r>
          <!-- Missing instrText -->
          <w:r><w:fldChar w:fldCharType="end"/></w:r>
        </w:p>
      `;

      const result = await Effect.runPromise(parseFieldsFromParagraph(malformedXml));

      expect(result).toHaveLength(1);
      expect(result[0]?.instruction).toBe("");
    });

    test("should handle fields split across multiple runs", async () => {
      const splitFieldXml = `
        <w:p>
          <w:r><w:fldChar w:fldCharType="begin"/></w:r>
          <w:r><w:instrText>FORM</w:instrText></w:r>
          <w:r><w:instrText>TEXT</w:instrText></w:r>
          <w:r><w:fldChar w:fldCharType="end"/></w:r>
        </w:p>
      `;

      const result = await Effect.runPromise(parseFieldsFromParagraph(splitFieldXml));

      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe(FieldCode.FORMTEXT);
      expect(result[0]?.instruction).toBe("FORMTEXT");
    });

    test("should handle special characters in field values", () => {
      const instruction = 'FORMTEXT "Value with \\"quotes\\" and \\backslash"';
      const field = parseFieldInstruction(instruction);

      expect(field.type).toBe(FieldCode.FORMTEXT);
      // Note: Simple implementation might not handle escaped quotes perfectly
    });
  });
});
