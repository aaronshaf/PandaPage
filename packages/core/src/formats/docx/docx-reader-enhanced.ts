// Re-export everything from the new modular structure
export type {
  EnhancedDocxDocument,
  DocxElement,
  DocxTable,
  DocxTableRow,
  DocxTableCell,
  DocxParseError,
  DocxParagraph,
  DocxRun,
  DocxNumbering,
  DocxAbstractFormat,
  DocxLevelFormat,
  DocxMetadata,
} from "./types";

export { readEnhancedDocx } from "./reader-enhanced";
