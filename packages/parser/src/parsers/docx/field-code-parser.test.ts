// Tests for advanced field code parser
import { test, expect } from "bun:test";
import { parseFieldInstruction, createFieldPlaceholder } from "./field-code-parser";

test("parseFieldInstruction - parses simple PAGE field", () => {
  const result = parseFieldInstruction("PAGE");
  expect(result.type).toBe("PAGE");
  expect(result.instruction).toBe("PAGE");
  expect(result.arguments).toEqual([]);
  expect(result.switches.size).toBe(0);
});

test("parseFieldInstruction - parses PAGE field with MERGEFORMAT", () => {
  const result = parseFieldInstruction("PAGE \\* MERGEFORMAT");
  expect(result.type).toBe("PAGE");
  expect(result.switches.has("\\*")).toBe(true);
  expect(result.switches.get("\\*")).toBe("MERGEFORMAT");
});

test("parseFieldInstruction - parses REF field with bookmark", () => {
  const result = parseFieldInstruction("REF _Ref12345678 \\h");
  expect(result.type).toBe("REF");
  expect(result.bookmarkRef).toBe("_Ref12345678");
  expect(result.switches.has("\\h")).toBe(true);
  expect(result.switches.get("\\h")).toBe(true);
});

test("parseFieldInstruction - parses HYPERLINK with URL", () => {
  const result = parseFieldInstruction('HYPERLINK "https://example.com"');
  expect(result.type).toBe("HYPERLINK");
  expect(result.hyperlink).toBe("https://example.com");
});

test("parseFieldInstruction - parses HYPERLINK with bookmark", () => {
  const result = parseFieldInstruction('HYPERLINK \\l "bookmark1"');
  expect(result.type).toBe("HYPERLINK");
  expect(result.bookmarkRef).toBe("bookmark1");
  expect(result.switches.has("\\l")).toBe(true);
});

test("parseFieldInstruction - parses SEQ field", () => {
  const result = parseFieldInstruction("SEQ Figure \\* ARABIC");
  expect(result.type).toBe("SEQ");
  expect(result.sequenceName).toBe("Figure");
  expect(result.switches.has("\\*")).toBe(true);
  expect(result.switches.get("\\*")).toBe("ARABIC");
});

test("parseFieldInstruction - parses STYLEREF field", () => {
  const result = parseFieldInstruction('STYLEREF "Heading 1" \\n');
  expect(result.type).toBe("STYLEREF");
  expect(result.styleName).toBe("Heading 1");
  expect(result.switches.has("\\n")).toBe(true);
});

test("parseFieldInstruction - handles unknown field type", () => {
  const result = parseFieldInstruction("CUSTOMFIELD arg1 arg2");
  expect(result.type).toBe("UNKNOWN");
  expect(result.arguments).toEqual(["arg1", "arg2"]);
});

test("createFieldPlaceholder - creates PAGE placeholder", () => {
  const fieldCode = parseFieldInstruction("PAGE");
  const placeholder = createFieldPlaceholder(fieldCode);
  expect(placeholder).toBe("1");
});

test("createFieldPlaceholder - creates REF placeholder with bookmark", () => {
  const fieldCode = parseFieldInstruction("REF bookmark1");
  const context = {
    bookmarks: new Map([["bookmark1", "Chapter 1"]]),
    sequences: new Map(),
    currentDate: new Date()
  };
  const placeholder = createFieldPlaceholder(fieldCode, context);
  expect(placeholder).toBe("Chapter 1");
});

test("createFieldPlaceholder - creates REF placeholder without bookmark", () => {
  const fieldCode = parseFieldInstruction("REF bookmark1");
  const placeholder = createFieldPlaceholder(fieldCode);
  expect(placeholder).toBe("[bookmark1]");
});

test("createFieldPlaceholder - creates HYPERLINK placeholder", () => {
  const fieldCode = parseFieldInstruction('HYPERLINK "https://example.com"');
  const placeholder = createFieldPlaceholder(fieldCode);
  expect(placeholder).toBe("https://example.com");
});

test("createFieldPlaceholder - creates internal HYPERLINK placeholder", () => {
  const fieldCode = parseFieldInstruction('HYPERLINK \\l "bookmark1"');
  const placeholder = createFieldPlaceholder(fieldCode);
  expect(placeholder).toBe("[Link: bookmark1]");
});

test("createFieldPlaceholder - creates SEQ placeholder", () => {
  const fieldCode = parseFieldInstruction("SEQ Figure");
  const context = {
    bookmarks: new Map(),
    sequences: new Map([["Figure", 2]]),
    currentDate: new Date()
  };
  const placeholder = createFieldPlaceholder(fieldCode, context);
  expect(placeholder).toBe("3");
  expect(context.sequences.get("Figure")).toBe(3);
});

test("createFieldPlaceholder - creates DATE placeholder", () => {
  const fieldCode = parseFieldInstruction("DATE");
  const testDate = new Date("2024-01-15");
  const context = {
    bookmarks: new Map(),
    sequences: new Map(),
    currentDate: testDate
  };
  const placeholder = createFieldPlaceholder(fieldCode, context);
  expect(placeholder).toBe(testDate.toLocaleDateString());
});

test("createFieldPlaceholder - creates AUTHOR placeholder", () => {
  const fieldCode = parseFieldInstruction("AUTHOR");
  const context = {
    bookmarks: new Map(),
    sequences: new Map(),
    currentDate: new Date(),
    metadata: { creator: "John Doe" }
  };
  const placeholder = createFieldPlaceholder(fieldCode, context);
  expect(placeholder).toBe("John Doe");
});

test("createFieldPlaceholder - creates TOC placeholder", () => {
  const fieldCode = parseFieldInstruction("TOC \\o \"1-3\"");
  const placeholder = createFieldPlaceholder(fieldCode);
  expect(placeholder).toBe("[Table of Contents]");
});

test("parseFieldInstruction - handles multiple switches", () => {
  const result = parseFieldInstruction("REF bookmark1 \\h \\n \\w");
  expect(result.type).toBe("REF");
  expect(result.bookmarkRef).toBe("bookmark1");
  expect(result.switches.has("\\h")).toBe(true);
  expect(result.switches.has("\\n")).toBe(true);
  expect(result.switches.has("\\w")).toBe(true);
});

test("parseFieldInstruction - handles quoted arguments with spaces", () => {
  const result = parseFieldInstruction('STYLEREF "Heading 1 Title" \\l');
  expect(result.type).toBe("STYLEREF");
  expect(result.styleName).toBe("Heading 1 Title");
  expect(result.switches.has("\\l")).toBe(true);
});

test("parseFieldInstruction - handles switch with value", () => {
  const result = parseFieldInstruction("TOC \\o 1-3 \\h");
  expect(result.type).toBe("TOC");
  expect(result.switches.get("\\o")).toBe("1-3");
  expect(result.switches.has("\\h")).toBe(true);
});