import { Effect, Stream, Chunk } from "effect";
import * as S from "@effect/schema/Schema";
import { createTransferableTask, shouldUseWorker } from "./worker-pool";
import type { WorkerTask, WorkerResult } from "./worker-pool";
import { debug } from "../common/debug";

// Progress callback type
export type ProgressCallback = (progress: number) => void;

// Parse options with worker support
export interface ParseOptions {
  useWorker?: boolean;
  streaming?: boolean;
  onProgress?: ProgressCallback;
  chunkSize?: number;
}

// Worker URLs by document type
const WORKER_URLS: Record<WorkerTask["type"], string> = {
  docx: new URL("./docx.worker.ts", import.meta.url).href,
  pptx: new URL("./pptx.worker.ts", import.meta.url).href,
  pages: new URL("./pages.worker.ts", import.meta.url).href,
  key: new URL("./key.worker.ts", import.meta.url).href,
};

// Parse error
export class WorkerParseError extends S.TaggedError<WorkerParseError>()("WorkerParseError") {
  readonly message!: string;
  readonly taskId!: string;
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
  options?: ParseOptions
): Effect.Effect<T, WorkerParseError> =>
  Effect.gen(function* () {
    debug.log(`Starting worker parse for ${type}, size: ${buffer.byteLength}`);
    
    // Create transferable task
    const { task, transfer } = createTransferableTask(type, buffer, {
      streaming: options?.streaming,
      chunkSize: options?.chunkSize
    });
    
    // Create worker
    const worker = createWorker(type);
    
    try {
      // Create a promise for the result
      const result = yield* Effect.async<T, WorkerParseError>((resume) => {
        let chunks: any[] = [];
        
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
              if (chunks.length > 0) {
                // Reassemble chunks
                const assembled = chunks
                  .sort((a, b) => a.index - b.index)
                  .map(c => c.chunk)
                  .join("");
                resume(Effect.succeed({ markdown: assembled } as T));
              } else {
                resume(Effect.succeed(result.data as T));
              }
              break;
              
            case "error":
              resume(Effect.fail(new WorkerParseError({
                message: result.error || "Unknown worker error",
                taskId: task.id
              })));
              break;
          }
        };
        
        worker.onerror = (error) => {
          resume(Effect.fail(new WorkerParseError({
            message: error.message || "Worker error",
            taskId: task.id
          })));
        };
        
        // Send task to worker with transferable objects
        worker.postMessage({ task, transfer }, { transfer });
      });
      
      return result;
      
    } finally {
      // Clean up worker
      worker.terminate();
    }
  });

// Parse document with automatic worker decision
export const parseDocumentSmart = <T>(
  type: WorkerTask["type"],
  buffer: ArrayBuffer,
  options?: ParseOptions
): Effect.Effect<T, WorkerParseError | Error> =>
  Effect.gen(function* () {
    const useWorker = options?.useWorker ?? shouldUseWorker(buffer.byteLength);
    
    if (useWorker) {
      debug.log("Using worker for parsing");
      return yield* parseDocumentInWorker<T>(type, buffer, options);
    } else {
      debug.log("Using main thread for parsing");
      // Fall back to main thread parsing
      // This would import the appropriate parser
      throw new Error("Main thread parsing not implemented yet");
    }
  });

// Stream document parsing results
export const streamDocumentParse = (
  type: WorkerTask["type"],
  buffer: ArrayBuffer,
  options?: Omit<ParseOptions, "streaming">
): Stream.Stream<string, WorkerParseError> =>
  Stream.async<string, WorkerParseError>((emit) => {
    const worker = createWorker(type);
    const { task, transfer } = createTransferableTask(type, buffer, {
      streaming: true,
      chunkSize: options?.chunkSize
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
          if (result.data?.chunk) {
            emit.single(result.data.chunk);
          }
          if (result.data?.isLast) {
            emit.end();
          }
          break;
          
        case "complete":
          emit.end();
          break;
          
        case "error":
          emit.fail(new WorkerParseError({
            message: result.error || "Unknown worker error",
            taskId: task.id
          }));
          break;
      }
    };
    
    worker.onerror = (error) => {
      emit.fail(new WorkerParseError({
        message: error.message || "Worker error",
        taskId: task.id
      }));
    };
    
    // Send task to worker
    worker.postMessage({ task, transfer }, { transfer });
    
    // Cleanup on stream end
    emit.onInterrupt(() => {
      worker.terminate();
    });
  });