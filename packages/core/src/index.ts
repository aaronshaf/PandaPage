// Re-export everything from the parser package
export * from "@browser-document-viewer/parser";

// Re-export everything from the renderer packages
export * from "@browser-document-viewer/markdown-renderer";
export * from "@browser-document-viewer/dom-renderer";

// Export wrapper functions
export { parseDocxDocument, renderToMarkdown, renderToHtml } from "./wrappers";

// Export common utilities
export * from "./common/config";
export * from "./common/debug";
export * from "./common/error-handling";
export * from "./common/print-page";
export * from "./common/units";
export * from "./common/xml-parser";

// Export document renderer
export * from "./document-renderer";

// Export DOCX types and utilities (avoiding duplicates from parser)
export type {
  DocxElement,
  DocxParagraph,
  DocxTable,
  DocxTableRow,
  DocxTableCell,
  DocxTableProperties,
  DocxMetadata,
  EnhancedDocxDocument,
} from "./formats/docx/types";
export { readDocx } from "./formats/docx/docx-reader";
export {
  docxToMarkdown,
  docxToMarkdownWithMetadata,
} from "./formats/docx/docx-to-markdown";
export * from "./formats/docx/docx-to-structured";
export * from "./formats/docx/table-parser";
export * from "./formats/docx/form-field-parser";
export * from "./formats/docx/hyperlink-parser";
export * from "./formats/docx/validation";
export * from "./formats/docx/docx-metadata";

// Export PPTX utilities
export * from "./formats/pptx/pptx-reader";
export * from "./formats/pptx/pptx-to-markdown";

// Export Key utilities
export * from "./formats/key/key-reader";
export * from "./formats/key/key-to-markdown";

// Export Pages utilities
export * from "./formats/pages/pages-reader";
export * from "./formats/pages/pages-to-markdown";

// Export worker utilities
export type {
  WorkerTask,
  WorkerResult,
} from "./workers/worker-pool";
export type {
  WorkerParseOptions,
  ProgressCallback,
} from "./workers/worker-manager";
export {
  createWorkerPool,
  type WorkerPoolConfig,
} from "./workers/worker-pool";
