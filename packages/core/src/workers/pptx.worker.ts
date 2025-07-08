import { Effect } from "effect";
import { readPptx } from "../formats/pptx/pptx-reader";
import { convertPptxToMarkdown } from "../formats/pptx/pptx-to-markdown";
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

    // Parse the PPTX file
    const parseResult = await Effect.runPromise(
      Effect.gen(function* () {
        // Progress: Starting parse
        self.postMessage({
          id: task.id,
          type: "progress",
          progress: 0.3,
        } satisfies WorkerResult);

        // Read PPTX structure
        const document = yield* readPptx(task.buffer);

        // Progress: Converting to markdown
        self.postMessage({
          id: task.id,
          type: "progress",
          progress: 0.7,
        } satisfies WorkerResult);

        // Convert to markdown
        const markdown = convertPptxToMarkdown(document);

        // Check if we should stream chunks
        if (task.options?.streaming && markdown.length > (task.options.chunkSize || 10000)) {
          // Stream in chunks
          const chunkSize = task.options.chunkSize || 10000;
          const chunks = Math.ceil(markdown.length / chunkSize);

          for (let i = 0; i < chunks; i++) {
            const start = i * chunkSize;
            const end = Math.min((i + 1) * chunkSize, markdown.length);
            const chunk = markdown.slice(start, end);

            self.postMessage({
              id: task.id,
              type: "chunk",
              data: {
                chunk,
                index: i,
                total: chunks,
                isLast: i === chunks - 1,
              },
            } satisfies WorkerResult);
          }

          return { streamed: true, chunks };
        } else {
          // Return complete result
          return { markdown, document };
        }
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
