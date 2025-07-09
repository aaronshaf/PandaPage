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
  // Advanced text formatting
  characterSpacing?: number; // Twips (w:spacing)
  position?: number; // Twips (w:position) - vertical position adjustment
  emboss?: boolean; // w:emboss
  imprint?: boolean; // w:imprint
  outline?: boolean; // w:outline
  shadow?: boolean; // w:shadow
  smallCaps?: boolean; // w:smallCaps
  caps?: boolean; // w:caps (all caps)
  hidden?: boolean; // w:vanish
  doubleStrikethrough?: boolean; // w:dstrike
  kerning?: number; // Minimum font size for kerning (half-points)
  textScale?: number; // Horizontal scaling percentage (w:w)
  emphasis?: 'dot' | 'comma' | 'circle' | 'underDot'; // w:em
  lang?: string; // Language code (w:lang)
}

export interface DocxParagraph {
  runs: DocxRun[];
  style?: string;
  numId?: string;
  ilvl?: number;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  outlineLevel?: number; // w:outlineLvl for heading detection
  images?: any[]; // Temporary, will be processed to Image[]
  spacing?: {
    before?: number; // Twips
    after?: number; // Twips
    line?: number; // Twips
    lineRule?: 'auto' | 'exact' | 'atLeast';
  };
  indentation?: {
    left?: number; // Twips
    right?: number; // Twips
    firstLine?: number; // Twips
    hanging?: number; // Twips
  };
}

export class DocxParseError {
  readonly _tag = "DocxParseError";
  constructor(public readonly message: string) {}
}

// Namespace constants
export const WORD_NAMESPACE = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
export const RELS_NAMESPACE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
export const DRAWING_NAMESPACE = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing";