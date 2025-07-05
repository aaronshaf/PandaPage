import { Effect } from "effect";

// DOCX support
export { 
  readDocx, 
  type DocxDocument, 
  type DocxParagraph, 
  type DocxRun, 
  DocxParseError 
} from "./src/formats/docx/docx-reader";

export { 
  docxToMarkdown, 
  convertDocxToMarkdown 
} from "./src/formats/docx/docx-to-markdown";

// Apple Pages support
export { 
  readPages, 
  type PagesDocument, 
  type PagesParagraph, 
  type PagesRun, 
  PagesParseError 
} from "./src/formats/pages/pages-reader";

export { 
  pagesToMarkdown, 
  convertPagesToMarkdown 
} from "./src/formats/pages/pages-to-markdown";

// PPTX support
export {
  readPptx,
  type PptxDocument,
  type PptxSlide,
  type PptxContent,
  PptxParseError
} from "./src/formats/pptx/pptx-reader";

export {
  pptxToMarkdown,
  convertPptxToMarkdown
} from "./src/formats/pptx/pptx-to-markdown";

// Keynote support
export {
  readKey,
  type KeyDocument,
  type KeySlide,
  type KeyContent,
  KeyParseError
} from "./src/formats/key/key-reader";

export {
  keyToMarkdown,
  convertKeyToMarkdown
} from "./src/formats/key/key-to-markdown";

// Helper functions to render documents to markdown directly
export async function renderDocx(buffer: ArrayBuffer): Promise<string> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { docxToMarkdown } = yield* Effect.promise(() => import("./src/formats/docx/docx-to-markdown"));
      return yield* docxToMarkdown(buffer);
    })
  );
}

export async function renderPages(buffer: ArrayBuffer): Promise<string> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { pagesToMarkdown } = yield* Effect.promise(() => import("./src/formats/pages/pages-to-markdown"));
      return yield* pagesToMarkdown(buffer);
    })
  );
}

export async function renderPptx(buffer: ArrayBuffer): Promise<string> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { pptxToMarkdown } = yield* Effect.promise(() => import("./src/formats/pptx/pptx-to-markdown"));
      return yield* pptxToMarkdown(buffer);
    })
  );
}

export async function renderKey(buffer: ArrayBuffer): Promise<string> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { keyToMarkdown } = yield* Effect.promise(() => import("./src/formats/key/key-to-markdown"));
      return yield* keyToMarkdown(buffer);
    })
  );
}

// Re-export other utilities
export { debug } from "./src/common/debug";