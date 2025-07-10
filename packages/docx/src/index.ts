// Main exports for DOCX package
export * from "./types";
export {
  DocxParseError,
  readDocx,
  type DocxDocument,
  readEnhancedDocx,
} from "./reader";
export {
  parseDocumentXmlWithDom,
  parseNumberingXmlWithDom,
  parseDocumentXmlEnhanced,
  parseFieldsFromParagraph,
  paragraphContainsFields,
  fieldToMarkdown,
  type FieldCode,
} from "./parser";
export * from "./converter";
export * from "./metadata";
