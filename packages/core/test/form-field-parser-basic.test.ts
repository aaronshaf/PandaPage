import { describe, test, expect, beforeAll } from "bun:test";
import { parseFieldInstruction, FieldCode } from "../src/formats/docx/form-field-parser";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  const window = new Window();
  (global as any).DOMParser = window.DOMParser;
  (global as any).Document = window.Document;
  (global as any).Element = window.Element;
  (global as any).Node = window.Node;
});

describe("form-field-parser - basic field parsing", () => {
  describe("parseFieldInstruction", () => {
    test("should parse basic field instruction", () => {
      const result = parseFieldInstruction("PAGE");

      expect(result.type).toBe("PAGE");
      expect(result.instruction).toBe("PAGE");
      expect(result.properties).toEqual({});
    });

    test("should parse field with switches", () => {
      const result = parseFieldInstruction('DATE \\@ "dd/MM/yyyy" \\* MERGEFORMAT');

      expect(result.type).toBe("DATE");
      expect(result.instruction).toBe('DATE \\@ "dd/MM/yyyy" \\* MERGEFORMAT');
      expect(result.properties).toEqual({
        "@": "dd/MM/yyyy",
        "*": "MERGEFORMAT",
      });
    });

    test("should parse field with unquoted switch values", () => {
      const result = parseFieldInstruction("REF bookmark1 \\h");

      expect(result.type).toBe("REF");
      expect(result.properties).toEqual({
        h: "true",
      });
    });

    test("should parse FORMTEXT field with default text", () => {
      const result = parseFieldInstruction('FORMTEXT "Enter your name here"');

      expect(result.type).toBe("FORMTEXT");
      expect(result.properties).toEqual({
        defaultText: "Enter your name here",
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
        url: "https://example.com",
      });
    });

    test("should parse HYPERLINK field with URL and switches", () => {
      const result = parseFieldInstruction('HYPERLINK "https://example.com" \\o "Tooltip text"');

      expect(result.type).toBe("HYPERLINK");
      expect(result.properties).toEqual({
        url: "https://example.com",
        o: "Tooltip text",
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
        s: "prefix",
      });
    });

    test("should handle switches with special characters", () => {
      const result = parseFieldInstruction('DATE \\@ "d/M/yyyy h:mm"');

      expect(result.type).toBe("DATE");
      expect(result.properties).toEqual({
        "@": "d/M/yyyy h:mm",
      });
    });
  });
});
