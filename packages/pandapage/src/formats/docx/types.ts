import * as S from "@effect/schema/Schema";

// Re-export existing types from docx-reader
export type { DocxParagraph, DocxRun, DocxNumbering, DocxAbstractFormat, DocxLevelFormat } from "./docx-reader";
export type { DocxMetadata } from "./docx-metadata";

// Effect Schema definitions for runtime validation

/**
 * Schema for table borders
 */
export const DocxTableBordersSchema = S.Struct({
  top: S.optional(S.String),
  right: S.optional(S.String),
  bottom: S.optional(S.String),
  left: S.optional(S.String),
});

/**
 * Schema for table properties
 */
export const DocxTablePropertiesSchema = S.Struct({
  width: S.optional(S.String),
  alignment: S.optional(S.Literal("left", "center", "right")),
  borders: S.optional(DocxTableBordersSchema),
  backgroundColor: S.optional(S.String),
});

/**
 * Schema for table row properties
 */
export const DocxTableRowPropertiesSchema = S.Struct({
  height: S.optional(S.String),
  isHeader: S.optional(S.Boolean),
});

/**
 * Schema for table cell properties
 */
export const DocxTableCellPropertiesSchema = S.Struct({
  width: S.optional(S.String),
  alignment: S.optional(S.Literal("left", "center", "right", "top", "bottom")),
  borders: S.optional(DocxTableBordersSchema),
  backgroundColor: S.optional(S.String),
});

/**
 * DOCX table interfaces
 */
export interface DocxTable {
  type: "table";
  rows: DocxTableRow[];
  properties?: DocxTableProperties;
}

export interface DocxTableRow {
  cells: DocxTableCell[];
  properties?: DocxTableRowProperties;
}

export interface DocxTableCell {
  content: DocxParagraph[];
  properties?: DocxTableCellProperties;
}

export interface DocxTableProperties {
  width?: string;
  alignment?: "left" | "center" | "right";
  borders?: DocxTableBorders;
  backgroundColor?: string;
}

export interface DocxTableRowProperties {
  height?: string;
  isHeader?: boolean;
}

export interface DocxTableCellProperties {
  width?: string;
  alignment?: "left" | "center" | "right" | "top" | "bottom";
  borders?: DocxTableBorders;
  backgroundColor?: string;
}

export interface DocxTableBorders {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

/**
 * Document element union type
 */
export type DocxElement = DocxParagraph | DocxTable;

/**
 * Enhanced document structure
 */
export interface EnhancedDocxDocument {
  elements: DocxElement[];
  metadata: DocxMetadata;
  sections?: DocxSection[];
  headers?: DocxHeaderFooter[];
  footers?: DocxHeaderFooter[];
  numbering?: DocxNumbering;
  
  // Processing metadata
  processingTime: number;
  extractedAt: Date;
  originalFormat: "docx";
  wordCount?: number;
  pageCount?: number;
  characterCount?: number;
  paragraphCount?: number;
}

/**
 * Document section interface
 */
export interface DocxSection {
  id: string;
  elements: DocxElement[];
  properties?: {
    pageSize?: { width: string; height: string };
    margins?: { top: string; right: string; bottom: string; left: string };
    orientation?: "portrait" | "landscape";
  };
}

/**
 * Header/Footer interface
 */
export interface DocxHeaderFooter {
  type: "header" | "footer";
  id: string;
  elements: DocxElement[];
}

/**
 * Error class for DOCX parsing
 */
export class DocxParseError {
  readonly _tag = "DocxParseError";
  constructor(public readonly message: string) {}
}