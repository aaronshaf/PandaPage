import { Effect } from "effect";
import { readKey } from "../formats/key/key-reader";
import { convertKeyToMarkdown } from "../formats/key/key-to-markdown";
import type { WorkerResult, WorkerTask } from "./worker-pool";

// Worker message handler
self.onmessage = async (event: MessageEvent<{ task: WorkerTask; transfer?: ArrayBuffer[] }>) => {
  const { task } = event.data;

  try {
    // Send initial progress
    self.postMessage({
      id: task.id,
      type: "progress",
      progress: 0,
    } satisfies WorkerResult);

    // Parse the Keynote file
    const parseResult = await Effect.runPromise(
      Effect.gen(function* () {
        // Progress: Starting parse
        self.postMessage({
          id: task.id,
          type: "progress",
          progress: 0.3,
        } satisfies WorkerResult);

        // Read Keynote structure
        const document = yield* readKey(task.buffer);

        // Progress: Converting to markdown
        self.postMessage({
          id: task.id,
          type: "progress",
          progress: 0.7,
        } satisfies WorkerResult);

        // Convert to markdown
        const markdown = convertKeyToMarkdown(document);

        // For now, Keynote doesn't support streaming
        return { markdown, document };
      }),
    );

    // Send completion
    self.postMessage({
      id: task.id,
      type: "complete",
      data: parseResult,
      progress: 1,
    } satisfies WorkerResult);
  } catch (error) {
    // Send error
    self.postMessage({
      id: task.id,
      type: "error",
      error: error instanceof Error ? error.message : String(error),
    } satisfies WorkerResult);
  }
};
