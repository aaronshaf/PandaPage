// Basic DOCX types

/**
 * DOCX run properties
 */
export interface DocxRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  fontSize?: string;
  color?: string;
  highlight?: string;
  hyperlink?: string;
}

/**
 * DOCX paragraph properties
 */
export interface DocxParagraph {
  type: "paragraph";
  style?: string;
  runs: DocxRun[];
  // List properties
  numId?: string;
  ilvl?: number;
  // Field properties
  fields?: DocxField[];
  // Additional properties that may be used by enhanced parsers
  properties?: {
    styleId?: string;
    numbering?: {
      levelId: number;
      numberingId: number;
    };
    indentation?: {
      left?: string;
      right?: string;
      firstLine?: string;
      hanging?: string;
    };
    alignment?: "left" | "center" | "right" | "justify";
    spacing?: {
      before?: string;
      after?: string;
      line?: string;
    };
  };
}

/**
 * DOCX field types
 */
export interface DocxField {
  type: string;
  instruction?: string;
  result?: string;
  properties?: Record<string, any>;
}

/**
 * Union type for all DOCX elements
 */
export type DocxElement = DocxParagraph | DocxTable;

/**
 * Enhanced document type
 */
export interface EnhancedDocxDocument {
  elements: DocxElement[];
  metadata?: DocxMetadata;
  numbering?: DocxNumbering;
}

/**
 * DOCX numbering definitions
 */
export interface DocxNumbering {
  // Map of numId to abstractNumId
  instances: Map<string, string>;
  // Map of abstractNumId to format details
  abstractFormats: Map<string, DocxAbstractFormat>;
  // Legacy format support
  formats?: Map<number, { abstractNumId: number }>;
}

export interface DocxAbstractFormat {
  levels: Map<number, DocxLevelFormat>;
}

export interface DocxLevelFormat {
  numFmt: string; // bullet, decimal, upperLetter, etc.
  lvlText: string; // Format pattern like "•" or "%1."
  // Legacy properties
  format?: string;
  text?: string;
  alignment?: string;
  indentation?: {
    left?: string;
    hanging?: string;
  };
  isBullet?: boolean;
}

/**
 * DOCX metadata
 */
export interface DocxMetadata {
  // Core properties
  title?: string;
  author?: string;
  creator?: string;
  created?: Date;
  modified?: Date;
  lastModifiedBy?: string;
  description?: string;
  subject?: string;
  keywords?: string | string[];
  category?: string;
  company?: string;
  revision?: string | number;
  language?: string;
  // Extended properties
  pages?: number;
  words?: number;
  characters?: number;
  charactersWithSpaces?: number;
  lines?: number;
  paragraphs?: number;
  version?: string;
  application?: string;
  appVersion?: string;
  template?: string;
  manager?: string;
  // Document structure
  outline?: DocxOutlineItem[];
  styleUsage?: DocxStyleUsage[];
  // Processing metadata
  extractedAt?: Date;
  originalFormat?: "docx";
  processingTime?: number;
}

/**
 * Document outline item
 */
export interface DocxOutlineItem {
  level: number;
  title: string;
  style: string;
  page?: number;
}

/**
 * Style usage statistics
 */
export interface DocxStyleUsage {
  name: string;
  type: "paragraph" | "character" | "table" | "numbering" | "unknown";
  usage: number;
}

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
  indentation?: string;
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

