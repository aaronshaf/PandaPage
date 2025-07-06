import { test, expect } from "bun:test";
import { parseDocx, parseDocxDocument } from "./index";
import { Effect } from "effect";

test("parseDocxDocument handles empty buffer", async () => {
  const buffer = new ArrayBuffer(0);
  
  try {
    await parseDocxDocument(buffer);
    expect(true).toBe(false); // Should not reach here
  } catch (error) {
    expect(error).toBeDefined();
  }
});

test("parseDocx returns Effect with DocxParseError", async () => {
  const buffer = new ArrayBuffer(0);
  
  const result = await Effect.runPromiseExit(parseDocx(buffer));
  
  expect(result._tag).toBe("Failure");
  if (result._tag === "Failure") {
    expect(result.cause._tag).toBe("Fail");
  }
});

test("DocxParseError has correct structure", () => {
  const { DocxParseError } = require("./index");
  const error = new DocxParseError("Test error");
  
  expect(error._tag).toBe("DocxParseError");
  expect(error.message).toBe("Test error");
});

test("parseDocxDocument is a function", () => {
  expect(typeof parseDocxDocument).toBe("function");
});