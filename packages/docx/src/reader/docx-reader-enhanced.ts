// Re-export everything from the new modular structure
export type {
  EnhancedDocxDocument,
  DocxElement,
  DocxTable,
  DocxTableRow,
  DocxTableCell,
  DocxParagraph,
  DocxRun,
  DocxNumbering,
  DocxAbstractFormat,
  DocxLevelFormat,
  DocxMetadata,
} from "../types";

export { DocxParseError } from "./docx-reader";
export { readEnhancedDocx } from "./reader-enhanced";
