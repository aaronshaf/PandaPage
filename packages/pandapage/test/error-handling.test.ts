import { test, expect } from "bun:test";
import { 
  createCategorizedError, 
  getRecoveryStrategy,
  type ErrorCategory,
  type CategorizedError 
} from "../src/common/error-handling";
import { Effect } from "effect";

test("createCategorizedError - should create proper error structure", async () => {
  const error = await Effect.runPromise(
    createCategorizedError("TestError", "Test message", "parsing")
  );
  
  expect(error).toMatchObject({
    _tag: "TestError",
    message: "Test message",
    category: "parsing",
    recoverable: false,
    timestamp: expect.any(Date)
  });
});

test("createCategorizedError - should handle recoverable errors", async () => {
  const error = await Effect.runPromise(
    createCategorizedError("NetworkError", "Connection failed", "network", {
      recoverable: true,
      retryAfter: 5000
    })
  );
  
  expect(error).toMatchObject({
    _tag: "NetworkError",
    message: "Connection failed",
    category: "network",
    recoverable: true,
    retryAfter: 5000
  });
});

test("getRecoveryStrategy - should return correct strategies", () => {
  const testCases: Array<{ error: CategorizedError; expected: string }> = [
    {
      error: {
        _tag: "NetworkError",
        message: "Network failed",
        category: "network",
        recoverable: true
      },
      expected: "retry"
    },
    {
      error: {
        _tag: "ParseError",
        message: "Parse failed",
        category: "parsing",
        recoverable: true
      },
      expected: "ignore"
    },
    {
      error: {
        _tag: "CriticalError",
        message: "Critical failure",
        category: "unknown",
        recoverable: false
      },
      expected: "abort"
    },
    {
      error: {
        _tag: "MemoryError",
        message: "Out of memory",
        category: "memory",
        recoverable: true
      },
      expected: "fallback"
    }
  ];
  
  testCases.forEach(({ error, expected }) => {
    const strategy = getRecoveryStrategy(error);
    expect(strategy).toBe(expected as "retry" | "fallback" | "ignore" | "abort");
  });
});

test("Error categories should be type-safe", () => {
  const validCategories: ErrorCategory[] = [
    "parsing",
    "validation",
    "network", 
    "timeout",
    "memory",
    "worker",
    "unknown"
  ];
  
  validCategories.forEach(category => {
    expect(typeof category).toBe("string");
    expect(category.length).toBeGreaterThan(0);
  });
});

test("createCategorizedError - should handle context data", async () => {
  const contextData = { fileName: "test.docx", lineNumber: 42 };
  
  const error = await Effect.runPromise(
    createCategorizedError("ContextError", "Error with context", "parsing", {
      context: contextData
    })
  );
  
  expect(error.context).toEqual(contextData);
});

test("Error timestamps should be recent", async () => {
  const before = new Date();
  
  const error = await Effect.runPromise(
    createCategorizedError("TimestampTest", "Time test", "unknown")
  );
  
  const after = new Date();
  
  expect(error.timestamp).toBeInstanceOf(Date);
  expect(error.timestamp!.getTime()).toBeGreaterThanOrEqual(before.getTime());
  expect(error.timestamp!.getTime()).toBeLessThanOrEqual(after.getTime());
});

test("Error messages should be non-empty strings", async () => {
  const error = await Effect.runPromise(
    createCategorizedError("MessageTest", "Test message", "validation")
  );
  
  expect(typeof error.message).toBe("string");
  expect(error.message.length).toBeGreaterThan(0);
  expect(error.message.trim()).toBe(error.message); // No leading/trailing whitespace
});