// Main exports for PPTX package

// Reader exports
export {
  readPptx,
  PptxParseError,
  type PptxDocument,
  type PptxSlide,
  type PptxContent,
} from "./reader/pptx-reader";

// Converter exports
export {
  convertPptxToMarkdown,
  pptxToMarkdown,
} from "./converter/pptx-to-markdown";

// Re-export from sub-modules
export * from "./parser";
export * from "./reader";
export * from "./types";
