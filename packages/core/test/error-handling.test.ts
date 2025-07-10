import { test, expect, describe } from "bun:test";
import {
  createCategorizedError,
  getRecoveryStrategy,
  retryWithBackoff,
  safeExecute,
  type ErrorCategory,
  type CategorizedError,
} from "../src/common/error-handling";
import { Effect } from "effect";

test("createCategorizedError - should create proper error structure", async () => {
  const error = await Effect.runPromise(
    createCategorizedError("TestError", "Test message", "parsing"),
  );

  expect(error).toMatchObject({
    _tag: "TestError",
    message: "Test message",
    category: "parsing",
    recoverable: false,
    timestamp: expect.any(Date),
  });
});

test("createCategorizedError - should handle recoverable errors", async () => {
  const error = await Effect.runPromise(
    createCategorizedError("NetworkError", "Connection failed", "network", {
      recoverable: true,
      retryAfter: 5000,
    }),
  );

  expect(error).toMatchObject({
    _tag: "NetworkError",
    message: "Connection failed",
    category: "network",
    recoverable: true,
    retryAfter: 5000,
  });
});

test("getRecoveryStrategy - should return correct strategies", () => {
  const testCases: Array<{ error: CategorizedError; expected: string }> = [
    {
      error: {
        _tag: "NetworkError",
        message: "Network failed",
        category: "network",
        recoverable: true,
      },
      expected: "retry",
    },
    {
      error: {
        _tag: "ParseError",
        message: "Parse failed",
        category: "parsing",
        recoverable: true,
      },
      expected: "ignore",
    },
    {
      error: {
        _tag: "CriticalError",
        message: "Critical failure",
        category: "unknown",
        recoverable: false,
      },
      expected: "abort",
    },
    {
      error: {
        _tag: "MemoryError",
        message: "Out of memory",
        category: "memory",
        recoverable: true,
      },
      expected: "fallback",
    },
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
    "unknown",
  ];

  validCategories.forEach((category) => {
    expect(typeof category).toBe("string");
    expect(category.length).toBeGreaterThan(0);
  });
});

test("createCategorizedError - should handle context data", async () => {
  const contextData = { fileName: "test.docx", lineNumber: 42 };

  const error = await Effect.runPromise(
    createCategorizedError("ContextError", "Error with context", "parsing", {
      context: contextData,
    }),
  );

  expect(error.context).toEqual(contextData);
});

test("Error timestamps should be recent", async () => {
  const before = new Date();

  const error = await Effect.runPromise(
    createCategorizedError("TimestampTest", "Time test", "unknown"),
  );

  const after = new Date();

  expect(error.timestamp).toBeInstanceOf(Date);
  expect(error.timestamp!.getTime()).toBeGreaterThanOrEqual(before.getTime());
  expect(error.timestamp!.getTime()).toBeLessThanOrEqual(after.getTime());
});

test("Error messages should be non-empty strings", async () => {
  const error = await Effect.runPromise(
    createCategorizedError("MessageTest", "Test message", "validation"),
  );

  expect(typeof error.message).toBe("string");
  expect(error.message.length).toBeGreaterThan(0);
  expect(error.message.trim()).toBe(error.message); // No leading/trailing whitespace
});

describe("retryWithBackoff", () => {
  test("should return the original effect (TODO implementation)", async () => {
    const successEffect = Effect.succeed(42);
    const retried = retryWithBackoff(successEffect);

    const result = await Effect.runPromise(retried);
    expect(result).toBe(42);
  });

  test("should pass through failures without retry (TODO implementation)", async () => {
    const failEffect = Effect.fail(new Error("Test error"));
    const retried = retryWithBackoff(failEffect);

    await expect(Effect.runPromise(retried)).rejects.toThrow("Test error");
  });
});

describe("safeExecute", () => {
  test("should handle successful effects", async () => {
    const successEffect = Effect.succeed("success");
    const result = await Effect.runPromise(safeExecute(successEffect));

    expect(result).toBe("success");
  });

  test("should categorize network errors", async () => {
    const networkError = Effect.fail(new Error("Network connection failed"));

    const result = await Effect.runPromiseExit(safeExecute(networkError));

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const error = result.cause as any;
      expect(error._tag).toBe("Fail");
      const errorValue = error.error;
      expect(errorValue).toMatchObject({
        _tag: "NetworkError",
        message: "Network connection failed",
        category: "network",
        recoverable: true,
        timestamp: expect.any(Date),
      });
    }
  });

  test("should categorize fetch errors as network errors", async () => {
    const fetchError = Effect.fail(new Error("Failed to fetch resource"));

    const result = await Effect.runPromiseExit(safeExecute(fetchError));

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const error = result.cause as any;
      expect(error._tag).toBe("Fail");
      const errorValue = error.error;
      expect(errorValue).toMatchObject({
        _tag: "NetworkError",
        message: "Failed to fetch resource",
        category: "network",
        recoverable: true,
      });
    }
  });

  test("should handle unknown errors", async () => {
    const unknownError = Effect.fail(new Error("Some random error"));

    const result = await Effect.runPromiseExit(safeExecute(unknownError));

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const error = result.cause as any;
      expect(error._tag).toBe("Fail");
      const errorValue = error.error;
      expect(errorValue).toMatchObject({
        _tag: "UnknownError",
        message: "Some random error",
        category: "unknown",
        recoverable: false,
        timestamp: expect.any(Date),
      });
    }
  });

  test("should handle non-Error objects", async () => {
    const stringError = Effect.fail("string error");

    const result = await Effect.runPromiseExit(safeExecute(stringError));

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const error = result.cause as any;
      expect(error._tag).toBe("Fail");
      const errorValue = error.error;
      expect(errorValue).toMatchObject({
        _tag: "UnknownError",
        message: "string error",
        category: "unknown",
        recoverable: false,
      });
    }
  });

  test("should handle null/undefined errors", async () => {
    const nullError = Effect.fail(null);

    const result = await Effect.runPromiseExit(safeExecute(nullError));

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const error = result.cause as any;
      expect(error._tag).toBe("Fail");
      const errorValue = error.error;
      expect(errorValue).toMatchObject({
        _tag: "UnknownError",
        message: "Unknown error occurred",
        category: "unknown",
        recoverable: false,
      });
    }
  });

  test("should handle objects without message property", async () => {
    const objectError = Effect.fail({ code: "ERR_123", data: "some data" });

    const result = await Effect.runPromiseExit(safeExecute(objectError));

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const error = result.cause as any;
      expect(error._tag).toBe("Fail");
      const errorValue = error.error;
      expect(errorValue).toMatchObject({
        _tag: "UnknownError",
        message: "Unknown error occurred",
        category: "unknown",
        recoverable: false,
      });
    }
  });
});

describe("getRecoveryStrategy edge cases", () => {
  test("should handle timeout errors", () => {
    const timeoutError: CategorizedError = {
      _tag: "TimeoutError",
      message: "Request timed out",
      category: "timeout",
      recoverable: true,
    };

    expect(getRecoveryStrategy(timeoutError)).toBe("retry");
  });

  test("should handle validation errors", () => {
    const validationError: CategorizedError = {
      _tag: "ValidationError",
      message: "Invalid input",
      category: "validation",
      recoverable: true,
    };

    // Validation doesn't have a specific case, so it should default to "abort"
    expect(getRecoveryStrategy(validationError)).toBe("abort");
  });

  test("should handle worker errors", () => {
    const workerError: CategorizedError = {
      _tag: "WorkerError",
      message: "Worker crashed",
      category: "worker",
      recoverable: true,
    };

    // Worker doesn't have a specific case, so it should default to "abort"
    expect(getRecoveryStrategy(workerError)).toBe("abort");
  });
});
