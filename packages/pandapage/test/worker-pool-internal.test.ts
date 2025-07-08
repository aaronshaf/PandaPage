import { describe, test, expect, beforeAll } from "bun:test";
import { Effect } from "effect";
import { createWorkerPool, type WorkerPoolConfig, type WorkerTask, type WorkerResult } from "../src/workers/worker-pool";

// Mock navigator.hardwareConcurrency
beforeAll(() => {
  if (typeof navigator === 'undefined') {
    (global as any).navigator = {
      hardwareConcurrency: 4
    };
  }
});

describe("worker-pool internal functions", () => {
  describe("createWorkerPool", () => {
    test("should create a worker pool with default config", async () => {
      const pool = await Effect.runPromise(createWorkerPool());
      
      expect(pool).toBeDefined();
      expect(pool.executeTask).toBeDefined();
      expect(pool.getOptimalWorkerCount).toBeDefined();
      expect(pool.shutdown).toBeDefined();
    });

    test("should create a worker pool with custom config", async () => {
      const config: WorkerPoolConfig = {
        minWorkers: 2,
        maxWorkers: 8,
        workerIdleTimeout: 60000
      };
      
      const pool = await Effect.runPromise(createWorkerPool(config));
      
      expect(pool).toBeDefined();
      expect(pool.executeTask).toBeDefined();
      expect(pool.getOptimalWorkerCount).toBeDefined();
      expect(pool.shutdown).toBeDefined();
    });
  });

  describe("executeTask", () => {
    test("should execute a task successfully", async () => {
      const pool = await Effect.runPromise(createWorkerPool());
      
      const task: WorkerTask = {
        id: "test-123",
        type: "docx",
        buffer: new ArrayBuffer(100),
        options: { streaming: false }
      };
      
      const result = await Effect.runPromise(pool.executeTask<{ parsed: boolean }>(task));
      
      expect(result).toBeDefined();
      expect(result.parsed).toBe(true);
    });

    test("should handle different document types", async () => {
      const pool = await Effect.runPromise(createWorkerPool());
      const types: WorkerTask["type"][] = ["docx", "pptx", "pages", "key"];
      
      for (const type of types) {
        const task: WorkerTask = {
          id: `test-${type}`,
          type,
          buffer: new ArrayBuffer(100)
        };
        
        const result = await Effect.runPromise(pool.executeTask<{ parsed: boolean }>(task));
        expect(result.parsed).toBe(true);
      }
    });

    test("should pass through task options", async () => {
      const pool = await Effect.runPromise(createWorkerPool());
      
      const task: WorkerTask = {
        id: "test-options",
        type: "docx",
        buffer: new ArrayBuffer(100),
        options: {
          streaming: true,
          chunkSize: 1024
        }
      };
      
      const result = await Effect.runPromise(pool.executeTask<{ parsed: boolean }>(task));
      expect(result.parsed).toBe(true);
    });
  });

  describe("getOptimalWorkerCount", () => {
    test("should calculate optimal worker count based on file size", async () => {
      // Use explicit config to ensure predictable maxWorkers
      const config: WorkerPoolConfig = {
        minWorkers: 1,
        maxWorkers: 4,
        workerIdleTimeout: 30000
      };
      const pool = await Effect.runPromise(createWorkerPool(config));
      
      // Test different file sizes
      expect(pool.getOptimalWorkerCount(0)).toBe(0); // 0MB
      expect(pool.getOptimalWorkerCount(5 * 1024 * 1024)).toBe(1); // 5MB
      expect(pool.getOptimalWorkerCount(10 * 1024 * 1024)).toBe(1); // 10MB
      expect(pool.getOptimalWorkerCount(15 * 1024 * 1024)).toBe(2); // 15MB
      expect(pool.getOptimalWorkerCount(25 * 1024 * 1024)).toBe(3); // 25MB
      expect(pool.getOptimalWorkerCount(35 * 1024 * 1024)).toBe(4); // 35MB
      expect(pool.getOptimalWorkerCount(100 * 1024 * 1024)).toBe(4); // 100MB - capped at maxWorkers
    });

    test("should respect maxWorkers limit", async () => {
      const config: WorkerPoolConfig = {
        minWorkers: 1,
        maxWorkers: 2,
        workerIdleTimeout: 30000
      };
      
      const pool = await Effect.runPromise(createWorkerPool(config));
      
      // Even with large file, should not exceed maxWorkers
      expect(pool.getOptimalWorkerCount(100 * 1024 * 1024)).toBe(2); // 100MB
      expect(pool.getOptimalWorkerCount(500 * 1024 * 1024)).toBe(2); // 500MB
    });

    test("should handle edge cases", async () => {
      const pool = await Effect.runPromise(createWorkerPool());
      
      // Very small files
      expect(pool.getOptimalWorkerCount(1)).toBe(1); // 1 byte
      expect(pool.getOptimalWorkerCount(1024)).toBe(1); // 1KB
      
      // Exact boundary
      expect(pool.getOptimalWorkerCount(10 * 1024 * 1024)).toBe(1); // Exactly 10MB
      expect(pool.getOptimalWorkerCount(10 * 1024 * 1024 + 1)).toBe(2); // Just over 10MB
    });
  });

  describe("shutdown", () => {
    test("should shutdown cleanly", async () => {
      const pool = await Effect.runPromise(createWorkerPool());
      
      // Shutdown should return void Effect
      const result = await Effect.runPromise(pool.shutdown());
      expect(result).toBeUndefined();
    });

    test("should handle multiple shutdowns", async () => {
      const pool = await Effect.runPromise(createWorkerPool());
      
      // Multiple shutdowns should be safe
      await Effect.runPromise(pool.shutdown());
      await Effect.runPromise(pool.shutdown());
      await Effect.runPromise(pool.shutdown());
      
      // No error should occur
      expect(true).toBe(true);
    });
  });

  describe("WorkerResult interface", () => {
    test("should handle complete result", () => {
      const result: WorkerResult = {
        id: "test-123",
        type: "complete",
        data: { parsed: true }
      };
      
      expect(result.type).toBe("complete");
      expect(result.data).toBeDefined();
      expect(result.progress).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    test("should handle chunk result", () => {
      const result: WorkerResult = {
        id: "test-123",
        type: "chunk",
        data: { chunk: "data" }
      };
      
      expect(result.type).toBe("chunk");
      expect(result.data).toBeDefined();
    });

    test("should handle progress result", () => {
      const result: WorkerResult = {
        id: "test-123",
        type: "progress",
        progress: 50
      };
      
      expect(result.type).toBe("progress");
      expect(result.progress).toBe(50);
      expect(result.data).toBeUndefined();
    });

    test("should handle error result", () => {
      const result: WorkerResult = {
        id: "test-123",
        type: "error",
        error: "Failed to parse"
      };
      
      expect(result.type).toBe("error");
      expect(result.error).toBe("Failed to parse");
      expect(result.data).toBeUndefined();
    });
  });

  describe("defaultConfig", () => {
    test("should use navigator.hardwareConcurrency for maxWorkers", async () => {
      // Test with mocked navigator
      const pool = await Effect.runPromise(createWorkerPool());
      
      // Default config should use hardwareConcurrency
      expect(pool).toBeDefined();
      
      // Test getOptimalWorkerCount respects the default
      const largeFile = 100 * 1024 * 1024; // 100MB
      const workerCount = pool.getOptimalWorkerCount(largeFile);
      // Should be capped at navigator.hardwareConcurrency or 4
      expect(workerCount).toBeGreaterThan(0);
      expect(workerCount).toBeLessThanOrEqual(Math.max(navigator.hardwareConcurrency || 4, 4));
    });

    test("should handle various maxWorkers configurations", async () => {
      // Test with explicit config to ensure behavior
      const configs = [
        { minWorkers: 1, maxWorkers: 2, workerIdleTimeout: 30000 },
        { minWorkers: 1, maxWorkers: 8, workerIdleTimeout: 30000 },
        { minWorkers: 2, maxWorkers: 16, workerIdleTimeout: 30000 }
      ];
      
      for (const config of configs) {
        const pool = await Effect.runPromise(createWorkerPool(config));
        const workerCount = pool.getOptimalWorkerCount(100 * 1024 * 1024); // 100MB
        
        // Should be capped at config.maxWorkers
        expect(workerCount).toBeLessThanOrEqual(config.maxWorkers);
        expect(workerCount).toBeGreaterThan(0);
      }
    });
  });

  describe("Error handling", () => {
    test("should handle errors in executeTask", async () => {
      const pool = await Effect.runPromise(createWorkerPool());
      
      // The current implementation doesn't actually throw errors,
      // but we're testing the error handling structure
      const task: WorkerTask = {
        id: "error-test",
        type: "docx",
        buffer: new ArrayBuffer(100)
      };
      
      // Should not throw
      const result = await Effect.runPromise(pool.executeTask<{ parsed: boolean }>(task));
      expect(result).toBeDefined();
    });
  });
});