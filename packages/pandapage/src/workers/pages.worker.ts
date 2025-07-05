import { Effect } from "effect";
import { WorkerTask, WorkerResult } from "./worker-pool";
import { readPages } from "../formats/pages/pages-reader";
import { convertPagesToMarkdown } from "../formats/pages/pages-to-markdown";

// Worker message handler
self.onmessage = async (event: MessageEvent<{ task: WorkerTask; transfer?: ArrayBuffer[] }>) => {
  const { task } = event.data;
  
  try {
    // Send initial progress
    self.postMessage({
      id: task.id,
      type: "progress",
      progress: 0
    } satisfies WorkerResult);
    
    // Parse the Pages file
    const parseResult = await Effect.runPromise(
      Effect.gen(function* () {
        // Progress: Starting parse
        self.postMessage({
          id: task.id,
          type: "progress",
          progress: 0.3
        } satisfies WorkerResult);
        
        // Read Pages structure
        const document = yield* readPages(task.buffer);
        
        // Progress: Converting to markdown
        self.postMessage({
          id: task.id,
          type: "progress",
          progress: 0.7
        } satisfies WorkerResult);
        
        // Convert to markdown
        const markdown = convertPagesToMarkdown(document);
        
        // For now, Pages doesn't support streaming
        return { markdown, document };
      })
    );
    
    // Send completion
    self.postMessage({
      id: task.id,
      type: "complete",
      data: parseResult,
      progress: 1
    } satisfies WorkerResult);
    
  } catch (error) {
    // Send error
    self.postMessage({
      id: task.id,
      type: "error",
      error: error instanceof Error ? error.message : String(error)
    } satisfies WorkerResult);
  }
};

// Export for TypeScript
export {};