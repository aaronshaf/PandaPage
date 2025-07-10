import { Effect } from "effect";

// DOCX support
export {
  type DocxDocument,
  type DocxParagraph,
  DocxParseError,
  type DocxRun,
  readDocx,
  convertDocxToMarkdown,
  docxToMarkdown,
  docxToMarkdownWithMetadata,
} from "@browser-document-viewer/docx";
// Keynote support
export {
  type KeyContent,
  type KeyDocument,
  KeyParseError,
  type KeySlide,
  readKey,
  convertKeyToMarkdown,
  keyToMarkdown,
} from "@browser-document-viewer/key";
// Apple Pages support
export {
  type PagesDocument,
  type PagesParagraph,
  PagesParseError,
  type PagesRun,
  readPages,
  convertPagesToMarkdown,
  pagesToMarkdown,
} from "@browser-document-viewer/pages";
// PPTX support
export {
  type PptxContent,
  type PptxDocument,
  PptxParseError,
  type PptxSlide,
  readPptx,
  convertPptxToMarkdown,
  pptxToMarkdown,
} from "@browser-document-viewer/pptx";

// Helper functions to render documents to markdown directly
export async function renderDocx(buffer: ArrayBuffer): Promise<string> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { docxToMarkdown } = yield* Effect.promise(
        () => import("@browser-document-viewer/docx"),
      );
      return yield* docxToMarkdown(buffer);
    }),
  );
}

export async function renderDocxWithMetadata(buffer: ArrayBuffer): Promise<string> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { docxToMarkdownWithMetadata } = yield* Effect.promise(
        () => import("@browser-document-viewer/docx"),
      );
      return yield* docxToMarkdownWithMetadata(buffer);
    }),
  );
}

export async function renderPages(buffer: ArrayBuffer): Promise<string> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { pagesToMarkdown } = yield* Effect.promise(
        () => import("@browser-document-viewer/pages"),
      );
      return yield* pagesToMarkdown(buffer);
    }),
  );
}

export async function renderPptx(buffer: ArrayBuffer): Promise<string> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { pptxToMarkdown } = yield* Effect.promise(
        () => import("@browser-document-viewer/pptx"),
      );
      return yield* pptxToMarkdown(buffer);
    }),
  );
}

export async function renderKey(buffer: ArrayBuffer): Promise<string> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { keyToMarkdown } = yield* Effect.promise(
        () => import("@browser-document-viewer/key"),
      );
      return yield* keyToMarkdown(buffer);
    }),
  );
}

// Re-export types for document structure
export type { 
  DocxElement,
  DocxTable,
  DocxTableRow,
  DocxTableCell,
  DocxTableProperties,
  DocxTableRowProperties,
  DocxTableCellProperties,
  EnhancedDocxDocument
} from "@browser-document-viewer/docx";

// Re-export reader function
export { readEnhancedDocx } from "@browser-document-viewer/docx";

// Re-export structured parsing
export { 
  parseDocxToStructured,
  type StructuredDocxResult 
} from "./src/formats/docx/docx-to-structured";

// Re-export other utilities
export { debug } from "./src/common/debug";

// Re-export unit conversion utilities
export {
  parseUniversalMeasure,
  twipsToInches,
  twipsToPoints,
  twipsToCentimeters,
  emusToInches,
  emusToPoints,
  emusToCentimeters,
  twipsToEmus,
  emusToTwips,
  pointsToTwips,
  pointsToEmus,
  pointsToInches,
  inchesToTwips,
  inchesToEmus,
  inchesToPoints,
  halfPointsToPoints,
  pointsToHalfPoints,
  twipsToCss,
  emusToCss,
  pointsToCss,
  inchesToCss,
  centimetersToCss,
  parseOnOff,
  parseFontSize,
  validateEmuCoordinate,
  validateTwipsCoordinate,
  PAGE_SIZES,
  DEFAULT_MARGINS,
  TYPOGRAPHY_DEFAULTS,
  TWIPS_PER_INCH,
  TWIPS_PER_POINT,
  EMUS_PER_INCH,
  EMUS_PER_POINT,
  EMUS_PER_TWIP
} from "./src/common/units";

// Export wrapper functions for bundling compatibility
export { parseDocxDocument, renderToMarkdown, renderToHtml } from "./src/wrappers";

// Re-export types
export type {
  ParsedDocument,
  DocumentElement,
  Paragraph,
  Heading,
  Table,
  TextRun,
  Image,
  DocumentMetadata,
  ParseOptions as ParserOptions
} from "@browser-document-viewer/parser";

export type { MarkdownRenderOptions } from "@browser-document-viewer/markdown-renderer";
export type { HtmlRenderOptions } from "@browser-document-viewer/dom-renderer";

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
