import { Effect, Stream } from "effect";
import { debug } from "../common/debug";
import type { WorkerResult, WorkerTask } from "./worker-pool";
import { createTransferableTask, shouldUseWorker } from "./worker-pool";

// Progress callback type
export type ProgressCallback = (progress: number) => void;

// Parse options with worker support
export interface WorkerParseOptions {
  useWorker?: boolean;
  streaming?: boolean;
  onProgress?: ProgressCallback;
  chunkSize?: number;
}

// Validate and apply defaults to parse options
export const validateParseOptions = (
  options: unknown,
): Effect.Effect<WorkerParseOptions, WorkerParseError> =>
  Effect.try({
    try: () => {
      // Simplified validation without schema for now
      const opts = typeof options === "object" && options !== null ? (options as any) : {};

      // Apply intelligent defaults
      return {
        useWorker: opts.useWorker ?? true,
        streaming: opts.streaming ?? false,
        chunkSize: opts.chunkSize ?? 1024 * 1024, // 1MB chunks
        onProgress: opts.onProgress, // Functions can't be validated by schema
      };
    },
    catch: (error) => new WorkerParseError(`Invalid parse options: ${error}`, "validation"),
  });

// Worker URLs by document type
const WORKER_URLS: Record<WorkerTask["type"], string> = {
  docx: "./docx.worker.ts",
  pptx: "./pptx.worker.ts",
  pages: "./pages.worker.ts",
  key: "./key.worker.ts",
};

// Parse error with categorization
export class WorkerParseError {
  readonly _tag = "WorkerParseError";
  constructor(
    public readonly message: string,
    public readonly category: "validation" | "worker" | "timeout" | "memory" | "parsing",
    public readonly taskId?: string,
  ) {}
}

// Create a worker for a specific document type
const createWorker = (type: WorkerTask["type"]): Worker => {
  const url = WORKER_URLS[type];
  if (!url) {
    throw new Error(`No worker URL for type: ${type}`);
  }
  return new Worker(url, { type: "module" });
};

// Parse document using a worker
export const parseDocumentInWorker = <T>(
  type: WorkerTask["type"],
  buffer: ArrayBuffer,
  options?: WorkerParseOptions,
): Effect.Effect<T, WorkerParseError> =>
  Effect.tryPromise({
    try: () =>
      new Promise<T>((resolve, reject) => {
        debug.log(`Starting worker parse for ${type}, size: ${buffer.byteLength}`);

        // Create transferable task
        const { task, transfer } = createTransferableTask(type, buffer, {
          streaming: options?.streaming,
          chunkSize: options?.chunkSize,
        });

        // Create worker
        const worker = createWorker(type);
        const chunks: any[] = [];

        worker.onmessage = (event: MessageEvent<WorkerResult>) => {
          const result = event.data;

          switch (result.type) {
            case "progress":
              if (options?.onProgress && result.progress !== undefined) {
                options.onProgress(result.progress);
              }
              break;

            case "chunk":
              chunks.push(result.data);
              break;

            case "complete":
              worker.terminate();
              if (chunks.length > 0) {
                // Reassemble chunks
                const assembled = chunks
                  .sort((a, b) => a.index - b.index)
                  .map((c) => c.chunk)
                  .join("");
                resolve({ markdown: assembled } as T);
              } else {
                resolve(result.data as T);
              }
              break;

            case "error":
              worker.terminate();
              reject(
                new WorkerParseError(result.error || "Unknown worker error", "worker", task.id),
              );
              break;
          }
        };

        worker.onerror = (error) => {
          worker.terminate();
          reject(new WorkerParseError(error.message || "Worker error", "worker", task.id));
        };

        // Send task to worker with transferable objects
        worker.postMessage({ task, transfer }, { transfer });
      }),
    catch: (error) => {
      if (error instanceof WorkerParseError) {
        return error;
      }
      return new WorkerParseError(error instanceof Error ? error.message : String(error), "worker");
    },
  });

// Parse document with automatic worker decision
export const parseDocumentSmart = <T>(
  type: WorkerTask["type"],
  buffer: ArrayBuffer,
  options?: WorkerParseOptions,
): Effect.Effect<T, WorkerParseError | Error> => {
  const useWorker = options?.useWorker ?? shouldUseWorker(buffer.byteLength);

  if (useWorker) {
    debug.log("Using worker for parsing");
    return parseDocumentInWorker<T>(type, buffer, options);
  } else {
    debug.log("Using main thread for parsing");
    // Fall back to main thread parsing
    return Effect.fail(new Error("Main thread parsing not implemented yet"));
  }
};

// Stream document parsing results
export const streamDocumentParse = (
  type: WorkerTask["type"],
  buffer: ArrayBuffer,
  options?: Omit<ParseOptions, "streaming">,
): Stream.Stream<string, WorkerParseError> =>
  Stream.async<string, WorkerParseError>((emit) => {
    const worker = createWorker(type);
    const { task, transfer } = createTransferableTask(type, buffer, {
      streaming: true,
      chunkSize: options?.chunkSize,
    });

    worker.onmessage = (event: MessageEvent<WorkerResult>) => {
      const result = event.data;

      switch (result.type) {
        case "progress":
          if (options?.onProgress && result.progress !== undefined) {
            options.onProgress(result.progress);
          }
          break;

        case "chunk":
          const chunkData = result.data as { chunk?: string; isLast?: boolean } | undefined;
          if (chunkData?.chunk) {
            emit.single(chunkData.chunk);
          }
          if (chunkData?.isLast) {
            emit.end();
          }
          break;

        case "complete":
          emit.end();
          break;

        case "error":
          emit.fail(
            new WorkerParseError(result.error || "Unknown worker error", "worker", task.id),
          );
          break;
      }
    };

    worker.onerror = (error) => {
      emit.fail(new WorkerParseError(error.message || "Worker error", "worker", task.id));
    };

    // Send task to worker
    worker.postMessage({ task, transfer }, { transfer });

    // Return cleanup effect
    return Effect.sync(() => {
      worker.terminate();
    });
  });
