import { test, expect } from "bun:test";
import { parseFieldInstruction, createFieldPlaceholder } from "./field-code-parser";

test("parseFieldInstruction handles table formulas", () => {
  const sumFormula = "=sum(above)";
  const parsed = parseFieldInstruction(sumFormula);

  expect(parsed.type).toBe("FORMULA");
  expect(parsed.formula).toBe("=sum(above)");
  expect(parsed.instruction).toBe("=sum(above)");
});

test("parseFieldInstruction handles various table formulas", () => {
  const formulas = [
    "=sum(left)",
    "=sum(below)", 
    "=sum(right)",
    "=average(above)",
    "=count(above)",
    "=5+3",
    "=10*2"
  ];

  formulas.forEach(formula => {
    const parsed = parseFieldInstruction(formula);
    expect(parsed.type).toBe("FORMULA");
    expect(parsed.formula).toBe(formula);
  });
});

test("createFieldPlaceholder evaluates sum(above) formula", () => {
  const fieldCode = {
    type: "FORMULA" as const,
    instruction: "=sum(above)",
    switches: new Map(),
    arguments: [],
    formula: "=sum(above)"
  };

  const context = {
    tableValues: [10, 20, 30]
  };

  const result = createFieldPlaceholder(fieldCode, context);
  expect(result).toBe("60");
});

test("createFieldPlaceholder evaluates average(above) formula", () => {
  const fieldCode = {
    type: "FORMULA" as const,
    instruction: "=average(above)",
    switches: new Map(),
    arguments: [],
    formula: "=average(above)"
  };

  const context = {
    tableValues: [10, 20, 30]
  };

  const result = createFieldPlaceholder(fieldCode, context);
  expect(result).toBe("20.00");
});

test("createFieldPlaceholder evaluates count(above) formula", () => {
  const fieldCode = {
    type: "FORMULA" as const,
    instruction: "=count(above)",
    switches: new Map(),
    arguments: [],
    formula: "=count(above)"
  };

  const context = {
    tableValues: [10, 20, 30, 40, 50]
  };

  const result = createFieldPlaceholder(fieldCode, context);
  expect(result).toBe("5");
});

test("createFieldPlaceholder handles simple arithmetic", () => {
  const fieldCode = {
    type: "FORMULA" as const,
    instruction: "=5+3",
    switches: new Map(),
    arguments: [],
    formula: "=5+3"
  };

  const result = createFieldPlaceholder(fieldCode);
  expect(result).toBe("8");
});

test("createFieldPlaceholder handles multiplication", () => {
  const fieldCode = {
    type: "FORMULA" as const,
    instruction: "=10*2",
    switches: new Map(),
    arguments: [],
    formula: "=10*2"
  };

  const result = createFieldPlaceholder(fieldCode);
  expect(result).toBe("20");
});

test("createFieldPlaceholder returns default for empty table values", () => {
  const fieldCode = {
    type: "FORMULA" as const,
    instruction: "=sum(above)",
    switches: new Map(),
    arguments: [],
    formula: "=sum(above)"
  };

  const context = {
    tableValues: []
  };

  const result = createFieldPlaceholder(fieldCode, context);
  expect(result).toBe("0");
});

test("createFieldPlaceholder returns formula for unknown expressions", () => {
  const fieldCode = {
    type: "FORMULA" as const,
    instruction: "=COMPLEX_FUNCTION(A1:B5)",
    switches: new Map(),
    arguments: [],
    formula: "=COMPLEX_FUNCTION(A1:B5)"
  };

  const result = createFieldPlaceholder(fieldCode);
  expect(result).toBe("=COMPLEX_FUNCTION(A1:B5)");
});