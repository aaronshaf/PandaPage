import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import {
  validateTableBorders,
  validateTableProperties,
  validateTableRowProperties,
  validateTableCellProperties,
  parseWithDefaults,
} from "../src/formats/docx/validation";
import { DocxParseError } from "../src/formats/docx/types";

describe("Validation Functions", () => {
  describe("validateTableBorders", () => {
    test("should return empty object for null input", async () => {
      const result = await Effect.runPromise(validateTableBorders(null));
      expect(result).toEqual({});
    });

    test("should return empty object for undefined input", async () => {
      const result = await Effect.runPromise(validateTableBorders(undefined));
      expect(result).toEqual({});
    });

    test("should return empty object for non-object input", async () => {
      const result = await Effect.runPromise(validateTableBorders("string"));
      expect(result).toEqual({});
    });

    test("should return empty object for number input", async () => {
      const result = await Effect.runPromise(validateTableBorders(123));
      expect(result).toEqual({});
    });

    test("should return array as-is for array input", async () => {
      // Arrays are objects in JS, so they pass the object check
      const result = await Effect.runPromise(validateTableBorders([]));
      expect(result).toEqual([] as any);
    });

    test("should return object as-is for valid object input", async () => {
      const borders = {
        top: "single",
        bottom: "single",
      };
      const result = await Effect.runPromise(validateTableBorders(borders));
      expect(result).toEqual(borders);
    });

    test("should handle complex border objects", async () => {
      const borders = {
        top: "double",
        bottom: "single",
        left: "dashed",
        right: "dotted",
      };
      const result = await Effect.runPromise(validateTableBorders(borders));
      expect(result).toEqual(borders);
    });
  });

  describe("validateTableProperties", () => {
    test("should return empty object for null input", async () => {
      const result = await Effect.runPromise(validateTableProperties(null));
      expect(result).toEqual({});
    });

    test("should return empty object for undefined input", async () => {
      const result = await Effect.runPromise(validateTableProperties(undefined));
      expect(result).toEqual({});
    });

    test("should return empty object for non-object input", async () => {
      const result = await Effect.runPromise(validateTableProperties(false));
      expect(result).toEqual({});
    });

    test("should return object as-is for valid object input", async () => {
      const properties = {
        width: "100%",
        alignment: "center" as const,
        backgroundColor: "#F0F0F0",
        borders: { top: "single" },
      };
      const result = await Effect.runPromise(validateTableProperties(properties));
      expect(result).toEqual(properties);
    });

    test("should handle properties with style", async () => {
      const properties = {
        width: "5000px",
        alignment: "left" as const,
      };
      const result = await Effect.runPromise(validateTableProperties(properties));
      expect(result).toEqual(properties);
    });
  });

  describe("validateTableRowProperties", () => {
    test("should return empty object for null input", async () => {
      const result = await Effect.runPromise(validateTableRowProperties(null));
      expect(result).toEqual({});
    });

    test("should return empty object for undefined input", async () => {
      const result = await Effect.runPromise(validateTableRowProperties(undefined));
      expect(result).toEqual({});
    });

    test("should return empty object for string input", async () => {
      const result = await Effect.runPromise(validateTableRowProperties("invalid"));
      expect(result).toEqual({});
    });

    test("should return object as-is for valid object input", async () => {
      const properties = {
        height: "720px",
        isHeader: true,
        cantSplit: true,
      };
      const result = await Effect.runPromise(validateTableRowProperties(properties));
      expect(result).toEqual(properties);
    });

    test("should handle row properties with various fields", async () => {
      const properties = {
        height: "500px",
        isHeader: false,
        cantSplit: false,
        tblHeader: true,
      };
      const result = await Effect.runPromise(validateTableRowProperties(properties));
      expect(result).toEqual(properties);
    });
  });

  describe("validateTableCellProperties", () => {
    test("should return empty object for null input", async () => {
      const result = await Effect.runPromise(validateTableCellProperties(null));
      expect(result).toEqual({});
    });

    test("should return empty object for undefined input", async () => {
      const result = await Effect.runPromise(validateTableCellProperties(undefined));
      expect(result).toEqual({});
    });

    test("should return empty object for boolean input", async () => {
      const result = await Effect.runPromise(validateTableCellProperties(true));
      expect(result).toEqual({});
    });

    test("should return object as-is for valid object input", async () => {
      const properties = {
        width: "25%",
        alignment: "center" as const,
        backgroundColor: "#FFFFFF",
      };
      const result = await Effect.runPromise(validateTableCellProperties(properties));
      expect(result).toEqual(properties);
    });

    test("should handle cell properties with borders", async () => {
      const properties = {
        width: "2500px",
        alignment: "top" as const,
        backgroundColor: "#E0E0E0",
        borders: {
          top: "single",
          bottom: "single",
        },
      };
      const result = await Effect.runPromise(validateTableCellProperties(properties));
      expect(result).toEqual(properties);
    });
  });

  describe("parseWithDefaults", () => {
    test("should return defaults for null input", async () => {
      const defaults = { name: "default", value: 42 };
      const result = await Effect.runPromise(parseWithDefaults(null, defaults));
      expect(result).toEqual(defaults);
    });

    test("should return defaults for undefined input", async () => {
      const defaults = { name: "default", value: 42 };
      const result = await Effect.runPromise(parseWithDefaults(undefined, defaults));
      expect(result).toEqual(defaults);
    });

    test("should merge data with defaults", async () => {
      const defaults = { name: "default", value: 42, enabled: true };
      const data = { name: "custom", extra: "field" };
      const result = await Effect.runPromise(parseWithDefaults(data, defaults));
      expect(result).toMatchObject({
        name: "custom",
        value: 42,
        enabled: true,
      });
      expect((result as any).extra).toBe("field");
    });

    test("should override defaults with provided data", async () => {
      const defaults = { name: "default", value: 42 };
      const data = { name: "custom", value: 100 };
      const result = await Effect.runPromise(parseWithDefaults(data, defaults));
      expect(result).toEqual(data);
    });

    test("should handle empty object with defaults", async () => {
      const defaults = { name: "default", value: 42 };
      const data = {};
      const result = await Effect.runPromise(parseWithDefaults(data, defaults));
      expect(result).toEqual(defaults);
    });

    test("should handle complex nested objects", async () => {
      const defaults = {
        settings: {
          theme: "light",
          fontSize: 14,
        },
        features: {
          enabled: true,
          advanced: false,
        },
      };
      const data = {
        settings: {
          theme: "dark",
          fontSize: 14,
        },
        features: {
          enabled: true,
          advanced: true,
        },
      };
      const result = await Effect.runPromise(parseWithDefaults(data, defaults));
      expect(result).toEqual({
        settings: {
          theme: "dark",
          fontSize: 14,
        },
        features: {
          enabled: true,
          advanced: true,
        },
      });
    });

    test("should handle arrays in data", async () => {
      const defaults = { items: [] as number[], count: 0 };
      const data = { items: [1, 2, 3], count: 3 };
      const result = await Effect.runPromise(parseWithDefaults(data, defaults));
      expect(result).toEqual(data);
    });

    test("should preserve all data fields even if not in defaults", async () => {
      const defaults = { required: "value" };
      const data = {
        required: "overridden",
        optional: "extra",
        another: 123,
        nested: { field: true },
      };
      const result = await Effect.runPromise(parseWithDefaults(data, defaults));
      expect(result).toEqual(data);
    });
  });

  describe("Error handling", () => {
    // These tests would be for error cases that aren't currently reachable
    // in the implementation, but we'll test the structure is correct
    test("DocxParseError should be throwable from validation", async () => {
      const error = new DocxParseError("Test error");
      expect(error._tag).toBe("DocxParseError");
      expect(error.message).toBe("Test error");
    });

    test("All validation functions return Effect type", () => {
      // Type checking test - these should all compile
      const bordersEffect = validateTableBorders({});
      const propsEffect = validateTableProperties({});
      const rowPropsEffect = validateTableRowProperties({});
      const cellPropsEffect = validateTableCellProperties({});
      const defaultsEffect = parseWithDefaults({}, {});

      // All should be Effect types
      expect(bordersEffect).toBeDefined();
      expect(propsEffect).toBeDefined();
      expect(rowPropsEffect).toBeDefined();
      expect(cellPropsEffect).toBeDefined();
      expect(defaultsEffect).toBeDefined();
    });
  });
});
