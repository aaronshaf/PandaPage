// Internal types for DOCX parsing

export interface DocxRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  fontSize?: string; // Regular font size in half-points (w:sz)
  fontSizeCs?: string; // Complex script font size in half-points (w:szCs)
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  link?: string;
  _footnoteRef?: string;
  _fieldCode?: string; // For PAGE, NUMPAGES, etc. fields
  _fieldInstruction?: string; // Full field instruction
  _internalLink?: boolean; // Indicates link is to internal bookmark
  _bookmarkRef?: string; // Reference to bookmark ID
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

export interface DocxBorder {
  style?: 'single' | 'double' | 'thick' | 'dashed' | 'dotted' | 'dashDot' | 'dashDotDot' | 'triple' | 'thickThinSmall' | 'thinThickSmall' | 'thinThickThinSmall' | 'thickThinMedium' | 'thinThickMedium' | 'thinThickThinMedium' | 'thickThinLarge' | 'thinThickLarge' | 'thinThickThinLarge' | 'wave' | 'doubleWave' | 'dashSmall' | 'dashDotStroked' | 'threeDEmboss' | 'threeDEngrave' | 'outset' | 'inset' | 'none';
  color?: string; // Hex color or 'auto'
  size?: number; // Border width in eighth-points (1/8 of a point)
  space?: number; // Space from text in points
}

export interface DocxShading {
  fill?: string; // Background fill color (hex or 'auto')
  color?: string; // Pattern color (hex or 'auto')
  val?: 'clear' | 'solid' | 'horzStripe' | 'vertStripe' | 'reverseDiagStripe' | 'diagStripe' | 'horzCross' | 'diagCross' | 'thinHorzStripe' | 'thinVertStripe' | 'thinReverseDiagStripe' | 'thinDiagStripe' | 'thinHorzCross' | 'thinDiagCross' | 'pct5' | 'pct10' | 'pct12' | 'pct15' | 'pct20' | 'pct25' | 'pct30' | 'pct35' | 'pct37' | 'pct40' | 'pct45' | 'pct50' | 'pct55' | 'pct60' | 'pct62' | 'pct65' | 'pct70' | 'pct75' | 'pct80' | 'pct85' | 'pct87' | 'pct90' | 'pct95';
}

export interface DocxParagraphBorders {
  top?: DocxBorder;
  bottom?: DocxBorder;
  left?: DocxBorder;
  right?: DocxBorder;
  between?: DocxBorder; // Border between consecutive paragraphs
}

export interface DocxParagraph {
  runs: DocxRun[];
  style?: string;
  numId?: string;
  ilvl?: number;
  alignment?: 'left' | 'center' | 'right' | 'justify' | 'distribute' | 'highKashida' | 'lowKashida' | 'mediumKashida' | 'thaiDistribute';
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
  textDirection?: 'ltr' | 'rtl' | 'lrV' | 'tbV' | 'lrTbV' | 'tbLrV';
  verticalAlignment?: 'top' | 'center' | 'bottom' | 'auto';
  borders?: DocxParagraphBorders;
  shading?: DocxShading;
}

export class DocxParseError {
  readonly _tag = "DocxParseError";
  constructor(public readonly message: string) {}
}

// Table-specific types for DOCX parsing
export interface DocxTableBorder {
  style?: 'single' | 'double' | 'thick' | 'dashed' | 'dotted' | 'dashDot' | 'dashDotDot' | 'triple' | 'thickThinSmall' | 'thinThickSmall' | 'thinThickThinSmall' | 'thickThinMedium' | 'thinThickMedium' | 'thinThickThinMedium' | 'thickThinLarge' | 'thinThickLarge' | 'thinThickThinLarge' | 'wave' | 'doubleWave' | 'dashSmall' | 'dashDotStroked' | 'threeDEmboss' | 'threeDEngrave' | 'outset' | 'inset' | 'none';
  color?: string; // Hex color or 'auto'
  size?: number; // Border width in eighth-points (1/8 of a point)
  space?: number; // Space from text in points
}

export interface DocxTableBorders {
  top?: DocxTableBorder;
  bottom?: DocxTableBorder;
  left?: DocxTableBorder;
  right?: DocxTableBorder;
  insideH?: DocxTableBorder; // Inside horizontal borders
  insideV?: DocxTableBorder; // Inside vertical borders
}

export interface DocxTableCellBorders {
  top?: DocxTableBorder;
  bottom?: DocxTableBorder;
  left?: DocxTableBorder;
  right?: DocxTableBorder;
  tl2br?: DocxTableBorder; // Top-left to bottom-right diagonal
  tr2bl?: DocxTableBorder; // Top-right to bottom-left diagonal
}

export interface DocxTableCellMargin {
  top?: number; // Twips
  bottom?: number; // Twips
  left?: number; // Twips
  right?: number; // Twips
}

export interface DocxTableProperties {
  borders?: DocxTableBorders;
  shading?: DocxShading;
  cellMargin?: DocxTableCellMargin;
  width?: {
    value: number;
    type: 'dxa' | 'pct' | 'auto'; // dxa = twips, pct = percentage
  };
}

export interface DocxTableCellProperties {
  borders?: DocxTableCellBorders;
  shading?: DocxShading;
  margin?: DocxTableCellMargin;
  width?: {
    value: number;
    type: 'dxa' | 'pct' | 'auto';
  };
  gridSpan?: number;
  vMerge?: 'restart' | 'continue';
  vAlign?: 'top' | 'center' | 'bottom';
  textDirection?: 'ltr' | 'rtl' | 'lrV' | 'tbV' | 'lrTbV' | 'tbLrV';
}

// Namespace constants
export const WORD_NAMESPACE = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
export const RELS_NAMESPACE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
export const DRAWING_NAMESPACE = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing";