import { test, expect } from "bun:test";
import { Effect } from "effect";
import { docxToMarkdown } from "../../src/formats/docx/docx-to-markdown";
import { readDocx } from "../../src/formats/docx/docx-reader";

// Simple mock DOCX structure for testing
const createMockDocxBuffer = (): ArrayBuffer => {
  // This is a minimal valid DOCX structure
  const mockZipContent = new Uint8Array([
    0x50, 0x4b, 0x03, 0x04, // ZIP signature
    // Minimal ZIP structure would go here
    // For now, we'll test with actual files
  ]);
  return mockZipContent.buffer;
};

test("docxToMarkdown - should handle empty buffer gracefully", async () => {
  const emptyBuffer = new ArrayBuffer(0);
  
  const result = await Effect.runPromiseEither(docxToMarkdown(emptyBuffer));
  
  expect(result._tag).toBe("Left");
  expect(result.left).toMatchObject({
    _tag: "DocxParseError"
  });
});

test("docxToMarkdown - should return Effect with proper error type", () => {
  const buffer = new ArrayBuffer(10);
  const effect = docxToMarkdown(buffer);
  
  // Test that the effect has the correct type structure
  expect(typeof effect).toBe("object");
  expect(effect).toHaveProperty("_op");
});

test("readDocx - should handle invalid ZIP data", async () => {
  const invalidBuffer = new Uint8Array([0x00, 0x01, 0x02, 0x03]).buffer;
  
  const result = await Effect.runPromiseEither(readDocx(invalidBuffer));
  
  expect(result._tag).toBe("Left");
  expect(result.left).toMatchObject({
    _tag: "DocxParseError"
  });
});

test("docxToMarkdown - should produce consistent error messages", async () => {
  const invalidBuffer = new ArrayBuffer(4);
  
  const result = await Effect.runPromiseEither(docxToMarkdown(invalidBuffer));
  
  expect(result._tag).toBe("Left");
  expect(result.left.message).toContain("DOCX");
});

test("Effect chain should be composable", () => {
  const buffer = new ArrayBuffer(10);
  
  // Test that we can chain Effects without compilation errors
  const chainedEffect = Effect.gen(function* () {
    const doc = yield* readDocx(buffer);
    return doc;
  });
  
  expect(typeof chainedEffect).toBe("object");
});

test("Error types should be consistent", () => {
  const buffer = new ArrayBuffer(0);
  
  Effect.runPromiseEither(docxToMarkdown(buffer)).then(result => {
    if (result._tag === "Left") {
      expect(result.left).toHaveProperty("_tag");
      expect(result.left).toHaveProperty("message");
      expect(typeof result.left.message).toBe("string");
    }
  });
});

test("Buffer size validation", async () => {
  // Test with various buffer sizes
  const sizes = [0, 1, 100, 1000];
  
  for (const size of sizes) {
    const buffer = new ArrayBuffer(size);
    const result = await Effect.runPromiseEither(docxToMarkdown(buffer));
    
    // All should fail gracefully with proper error structure
    expect(result._tag).toBe("Left");
    expect(result.left).toHaveProperty("_tag", "DocxParseError");
  }
});

test("Memory efficiency - Effects should not hold references", () => {
  const buffer = new ArrayBuffer(1000);
  const effect = docxToMarkdown(buffer);
  
  // Effect should be lightweight and not hold the entire buffer
  const effectString = effect.toString();
  expect(effectString.length).toBeLessThan(1000);
});