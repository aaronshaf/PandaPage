import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import type { Mock } from "bun:test";

describe("debug utility", () => {
  let consoleDebugSpy: Mock<any>;
  let consoleLogSpy: Mock<any>;
  let consoleErrorSpy: Mock<any>;
  let originalEnv: NodeJS.ProcessEnv;
  let originalWindow: any;

  beforeEach(() => {
    // Save original values
    originalEnv = { ...process.env };
    if (typeof window !== "undefined") {
      originalWindow = { ...(window as any) };
    }

    // Create spies
    consoleDebugSpy = spyOn(console, "debug");
    consoleLogSpy = spyOn(console, "log");
    consoleErrorSpy = spyOn(console, "error");

    // Clear module cache to force re-evaluation
    delete require.cache[require.resolve("../src/common/debug")];
  });

  afterEach(() => {
    // Restore original values
    process.env = originalEnv;
    if (typeof window !== "undefined" && originalWindow) {
      Object.keys(originalWindow).forEach((key) => {
        (window as any)[key] = originalWindow[key];
      });
    }

    // Clear spies
    consoleDebugSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("getLogLevel", () => {
    test("should default to 'error' when LOG_LEVEL is not set", () => {
      delete process.env.LOG_LEVEL;
      const { debug } = require("../src/common/debug");

      // Debug should not log
      debug.log("test");
      expect(consoleDebugSpy).not.toHaveBeenCalled();

      // Error should log
      debug.error("test error");
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test("should respect LOG_LEVEL environment variable", () => {
      process.env.LOG_LEVEL = "debug";
      const { debug } = require("../src/common/debug");

      debug.log("test debug");
      expect(consoleDebugSpy).toHaveBeenCalledWith("test debug");
    });

    test("should handle case-insensitive LOG_LEVEL", () => {
      process.env.LOG_LEVEL = "DEBUG";
      const { debug } = require("../src/common/debug");

      debug.log("test debug");
      expect(consoleDebugSpy).toHaveBeenCalledWith("test debug");
    });

    test("should handle browser environment without process.env", () => {
      // Simulate browser environment
      const originalProcess = (global as any).process;
      delete (global as any).process;

      // Set window.LOG_LEVEL
      (global as any).window = { LOG_LEVEL: "debug" };

      // Clear cache and reload module
      delete require.cache[require.resolve("../src/common/debug")];
      const { debug } = require("../src/common/debug");

      debug.log("browser test");
      expect(consoleDebugSpy).toHaveBeenCalledWith("browser test");

      // Restore process
      (global as any).process = originalProcess;
      delete (global as any).window;
    });

    test("should handle browser environment with undefined window.LOG_LEVEL", () => {
      // Simulate browser environment
      const originalProcess = (global as any).process;
      delete (global as any).process;

      // Set empty window
      (global as any).window = {};

      // Clear cache and reload module
      delete require.cache[require.resolve("../src/common/debug")];
      const { debug } = require("../src/common/debug");

      // Should default to error level
      debug.log("browser test");
      expect(consoleDebugSpy).not.toHaveBeenCalled();

      debug.error("browser error");
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Restore process
      (global as any).process = originalProcess;
      delete (global as any).window;
    });
  });

  describe("debug.log", () => {
    test("should log when LOG_LEVEL is 'debug'", () => {
      process.env.LOG_LEVEL = "debug";
      const { debug } = require("../src/common/debug");

      debug.log("test message", { data: "value" });
      expect(consoleDebugSpy).toHaveBeenCalledWith("test message", { data: "value" });
    });

    test("should log when LOG_LEVEL is 'trace'", () => {
      process.env.LOG_LEVEL = "trace";
      const { debug } = require("../src/common/debug");

      debug.log("trace message");
      expect(consoleDebugSpy).toHaveBeenCalledWith("trace message");
    });

    test("should log when LOG_LEVEL is 'all'", () => {
      process.env.LOG_LEVEL = "all";
      const { debug } = require("../src/common/debug");

      debug.log("all message");
      expect(consoleDebugSpy).toHaveBeenCalledWith("all message");
    });

    test("should not log when LOG_LEVEL is 'error'", () => {
      process.env.LOG_LEVEL = "error";
      const { debug } = require("../src/common/debug");

      debug.log("should not appear");
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    test("should not log when LOG_LEVEL is 'info'", () => {
      process.env.LOG_LEVEL = "info";
      const { debug } = require("../src/common/debug");

      debug.log("should not appear");
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });

  describe("debug.ai", () => {
    test("should log when LOG_LEVEL is 'ai'", () => {
      process.env.LOG_LEVEL = "ai";
      const { debug } = require("../src/common/debug");

      debug.ai("AI message");
      expect(consoleLogSpy).toHaveBeenCalledWith("AI message");
    });

    test("should log when LOG_LEVEL is 'debug'", () => {
      process.env.LOG_LEVEL = "debug";
      const { debug } = require("../src/common/debug");

      debug.ai("AI debug message");
      expect(consoleLogSpy).toHaveBeenCalledWith("AI debug message");
    });

    test("should log when LOG_LEVEL is 'trace'", () => {
      process.env.LOG_LEVEL = "trace";
      const { debug } = require("../src/common/debug");

      debug.ai("AI trace message");
      expect(consoleLogSpy).toHaveBeenCalledWith("AI trace message");
    });

    test("should log when LOG_LEVEL is 'all'", () => {
      process.env.LOG_LEVEL = "all";
      const { debug } = require("../src/common/debug");

      debug.ai("AI all message");
      expect(consoleLogSpy).toHaveBeenCalledWith("AI all message");
    });

    test("should not log when LOG_LEVEL is 'error'", () => {
      process.env.LOG_LEVEL = "error";
      const { debug } = require("../src/common/debug");

      debug.ai("should not appear");
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    test("should not log when LOG_LEVEL is 'info'", () => {
      process.env.LOG_LEVEL = "info";
      const { debug } = require("../src/common/debug");

      debug.ai("should not appear");
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe("debug.error", () => {
    test("should log errors by default", () => {
      delete process.env.LOG_LEVEL;
      const { debug } = require("../src/common/debug");

      debug.error("error message");
      expect(consoleErrorSpy).toHaveBeenCalledWith("error message");
    });

    test("should log errors for all log levels except 'none'", () => {
      const levels = ["fatal", "error", "warning", "info", "ai", "debug", "trace", "all"];

      levels.forEach((level) => {
        // Reset spies
        consoleErrorSpy.mockClear();

        process.env.LOG_LEVEL = level;
        delete require.cache[require.resolve("../src/common/debug")];
        const { debug } = require("../src/common/debug");

        debug.error(`error at ${level} level`);
        expect(consoleErrorSpy).toHaveBeenCalledWith(`error at ${level} level`);
      });
    });

    test("should not log errors when LOG_LEVEL is 'none'", () => {
      process.env.LOG_LEVEL = "none";
      const { debug } = require("../src/common/debug");

      debug.error("should not appear");
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test("should handle multiple arguments", () => {
      process.env.LOG_LEVEL = "error";
      const { debug } = require("../src/common/debug");

      const error = new Error("test error");
      debug.error("Error occurred:", error, { context: "test" });
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error occurred:", error, { context: "test" });
    });
  });

  describe("edge cases", () => {
    test("should handle null and undefined arguments", () => {
      process.env.LOG_LEVEL = "all";
      const { debug } = require("../src/common/debug");

      debug.log(null, undefined);
      expect(consoleDebugSpy).toHaveBeenCalledWith(null, undefined);

      debug.ai(null, undefined);
      expect(consoleLogSpy).toHaveBeenCalledWith(null, undefined);

      debug.error(null, undefined);
      expect(consoleErrorSpy).toHaveBeenCalledWith(null, undefined);
    });

    test("should handle no arguments", () => {
      process.env.LOG_LEVEL = "all";
      const { debug } = require("../src/common/debug");

      debug.log();
      expect(consoleDebugSpy).toHaveBeenCalledWith();

      debug.ai();
      expect(consoleLogSpy).toHaveBeenCalledWith();

      debug.error();
      expect(consoleErrorSpy).toHaveBeenCalledWith();
    });

    test("should handle circular references", () => {
      process.env.LOG_LEVEL = "all";
      const { debug } = require("../src/common/debug");

      const circular: any = { a: 1 };
      circular.self = circular;

      // Should not throw
      expect(() => {
        debug.log("circular:", circular);
        debug.ai("circular:", circular);
        debug.error("circular:", circular);
      }).not.toThrow();
    });
  });
});
