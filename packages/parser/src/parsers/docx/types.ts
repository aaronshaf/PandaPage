// Internal types for DOCX parsing

export interface DocxRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  link?: string;
  _footnoteRef?: string;
  _fieldCode?: string; // For PAGE, NUMPAGES, etc. fields
}

export interface DocxParagraph {
  runs: DocxRun[];
  style?: string;
  numId?: string;
  ilvl?: number;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  images?: any[]; // Temporary, will be processed to Image[]
}

export class DocxParseError {
  readonly _tag = "DocxParseError";
  constructor(public readonly message: string) {}
}

// Namespace constants
export const WORD_NAMESPACE = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
export const RELS_NAMESPACE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
export const DRAWING_NAMESPACE = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing";