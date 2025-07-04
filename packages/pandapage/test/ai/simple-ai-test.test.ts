import { test, expect } from "bun:test";
import { Effect } from "effect";
import { evaluateTextExtraction } from "../../src/test-ai-evaluator";

test("Simple AI evaluation test", async () => {
  console.log("Starting simple AI evaluation test...");
  
  const expected = "Hello, world!";
  const actual = "Hello world";  // Missing comma
  
  try {
    const result = await Effect.runPromise(evaluateTextExtraction(expected, actual));
    
    console.log("Evaluation result:");
    console.log(`Score: ${result.score}%`);
    console.log(`Description: ${result.description}`);
    console.log(`Passed: ${result.passed}`);
    
    // Basic assertions
    expect(result.score).toBeGreaterThan(80);  // Should be high similarity
    expect(result.score).toBeLessThan(100);    // But not perfect
    expect(typeof result.description).toBe("string");
    expect(result.description.length).toBeGreaterThan(0);
  } catch (error) {
    console.error("Error in AI evaluation:", error);
    throw error;
  }
}, 30000);  // 30 second timeout for AI call