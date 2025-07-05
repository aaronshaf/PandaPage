import { Effect } from "effect";

// DOCX support
export {
  type DocxDocument,
  type DocxParagraph,
  DocxParseError,
  type DocxRun,
  readDocx,
} from "./src/formats/docx/docx-reader";

export {
  convertDocxToMarkdown,
  docxToMarkdown,
} from "./src/formats/docx/docx-to-markdown";
// Keynote support
export {
  type KeyContent,
  type KeyDocument,
  KeyParseError,
  type KeySlide,
  readKey,
} from "./src/formats/key/key-reader";
export {
  convertKeyToMarkdown,
  keyToMarkdown,
} from "./src/formats/key/key-to-markdown";
// Apple Pages support
export {
  type PagesDocument,
  type PagesParagraph,
  PagesParseError,
  type PagesRun,
  readPages,
} from "./src/formats/pages/pages-reader";
export {
  convertPagesToMarkdown,
  pagesToMarkdown,
} from "./src/formats/pages/pages-to-markdown";
// PPTX support
export {
  type PptxContent,
  type PptxDocument,
  PptxParseError,
  type PptxSlide,
  readPptx,
} from "./src/formats/pptx/pptx-reader";
export {
  convertPptxToMarkdown,
  pptxToMarkdown,
} from "./src/formats/pptx/pptx-to-markdown";

// Helper functions to render documents to markdown directly
export async function renderDocx(buffer: ArrayBuffer): Promise<string> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { docxToMarkdown } = yield* Effect.promise(
        () => import("./src/formats/docx/docx-to-markdown"),
      );
      return yield* docxToMarkdown(buffer);
    }),
  );
}

export async function renderPages(buffer: ArrayBuffer): Promise<string> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { pagesToMarkdown } = yield* Effect.promise(
        () => import("./src/formats/pages/pages-to-markdown"),
      );
      return yield* pagesToMarkdown(buffer);
    }),
  );
}

export async function renderPptx(buffer: ArrayBuffer): Promise<string> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { pptxToMarkdown } = yield* Effect.promise(
        () => import("./src/formats/pptx/pptx-to-markdown"),
      );
      return yield* pptxToMarkdown(buffer);
    }),
  );
}

export async function renderKey(buffer: ArrayBuffer): Promise<string> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { keyToMarkdown } = yield* Effect.promise(
        () => import("./src/formats/key/key-to-markdown"),
      );
      return yield* keyToMarkdown(buffer);
    }),
  );
}

// Re-export other utilities
export { debug } from "./src/common/debug";

// Worker support
export {
  type ParseOptions,
  type ProgressCallback,
  parseDocumentInWorker,
  parseDocumentSmart,
  streamDocumentParse,
  WorkerParseError,
} from "./src/workers/worker-manager";

export {
  createTransferableTask,
  shouldUseWorker,
  type WorkerPoolConfig,
  type WorkerResult,
  type WorkerTask,
} from "./src/workers/worker-pool";
