import { Effect, Queue, Pool, Scope } from "effect";
import * as S from "@effect/schema/Schema";
import { BrowserWorker } from "@effect/platform-browser";
import { debug } from "../common/debug";

// Worker task types
export interface WorkerTask {
  id: string;
  type: "docx" | "pptx" | "pages" | "key";
  buffer: ArrayBuffer;
  options?: {
    streaming?: boolean;
    chunkSize?: number;
  };
}

// Worker result types  
export interface WorkerResult {
  id: string;
  type: "complete" | "chunk" | "progress" | "error";
  data?: unknown;
  progress?: number;
  error?: string;
}

// Worker pool configuration
export interface WorkerPoolConfig {
  minWorkers: number;
  maxWorkers: number;
  workerIdleTimeout: number; // ms
}

const defaultConfig: WorkerPoolConfig = {
  minWorkers: 1,
  maxWorkers: navigator.hardwareConcurrency || 4,
  workerIdleTimeout: 30000 // 30 seconds
};

// Create a worker pool for document parsing
export const createWorkerPool = (config: WorkerPoolConfig = defaultConfig) =>
  Effect.gen(function* () {
    // Create a pool of workers
    const pool = yield* Pool.make({
      acquire: Effect.gen(function* () {
        debug.log("Creating new worker");
        // TODO: Create actual worker based on platform-browser
        // For now, return a mock worker
        return {
          id: Math.random().toString(36),
          execute: (task: WorkerTask) => Effect.succeed({
            id: task.id,
            type: "complete" as const,
            data: { parsed: true }
          })
        };
      }),
      min: config.minWorkers,
      max: config.maxWorkers,
      timeToLive: config.workerIdleTimeout
    });

    // Execute a task in the pool
    const executeTask = <T>(task: WorkerTask): Effect.Effect<T, Error> =>
      Effect.gen(function* () {
        debug.log(`Executing task ${task.id} of type ${task.type}`);
        
        // Get a worker from the pool
        const worker = yield* Pool.get(pool);
        
        try {
          // Execute the task
          const result = yield* worker.execute(task);
          
          if (result.type === "error") {
            return yield* Effect.fail(new Error(result.error || "Unknown error"));
          }
          
          return result.data as T;
        } finally {
          // Return worker to pool
          // This happens automatically with Pool
        }
      });

    // Get optimal worker count based on file size
    const getOptimalWorkerCount = (fileSize: number): number => {
      // Simple heuristic: 1 worker per 10MB, capped at maxWorkers
      const sizeMB = fileSize / (1024 * 1024);
      const suggested = Math.ceil(sizeMB / 10);
      return Math.min(suggested, config.maxWorkers);
    };

    return {
      executeTask,
      getOptimalWorkerCount,
      shutdown: () => Pool.shutdown(pool)
    };
  });

// Helper to determine if we should use a worker for a given file
export const shouldUseWorker = (fileSize: number): boolean => {
  // Use worker for files larger than 1MB
  return fileSize > 1024 * 1024;
};

// Create a transferable task from a buffer
export const createTransferableTask = (
  type: WorkerTask["type"],
  buffer: ArrayBuffer,
  options?: WorkerTask["options"]
): { task: WorkerTask; transfer: ArrayBuffer[] } => {
  const task: WorkerTask = {
    id: Math.random().toString(36),
    type,
    buffer,
    options
  };
  
  // Mark the buffer for transfer
  return {
    task,
    transfer: [buffer]
  };
};