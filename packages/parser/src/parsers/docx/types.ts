// Internal types for DOCX parsing
import type {
  ST_Underline,
  ST_HighlightColor,
  ST_VerticalAlignRun,
  ST_Lang,
  ST_Border,
  ST_Shd,
  ST_Jc,
  ST_Em,
} from "@browser-document-viewer/ooxml-types";

export interface DocxRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean | ST_Underline; // Support both boolean and specific underline styles
  underlineColor?: string; // Underline color (hex format)
  strikethrough?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  fontSize?: string; // Regular font size in half-points (w:sz)
  fontSizeCs?: string; // Complex script font size in half-points (w:szCs)
  fontFamily?: string;
  // Extended font properties for complex scripts
  fontFamilyAscii?: string; // ASCII font (w:ascii)
  fontFamilyEastAsia?: string; // East Asian font (w:eastAsia)
  fontFamilyHAnsi?: string; // High ANSI font (w:hAnsi)
  fontFamilyCs?: string; // Complex script font (w:cs)
  color?: string; // Hex color (ST_HexColorRGB format)
  backgroundColor?: string; // Background color from highlighting
  highlightColor?: ST_HighlightColor; // Text highlighting
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
  emphasis?: ST_Em; // w:em - East Asian emphasis marks
  lang?: ST_Lang; // Language code (w:lang)
  bidi?: boolean; // Bidirectional text (w:bidi attribute on w:lang)
  rtl?: boolean; // Right-to-left text direction (w:rtl)
  verticalAlign?: ST_VerticalAlignRun; // Vertical alignment (superscript/subscript/baseline)
  border?: DocxBorder; // Text border (w:bdr)
}

export interface DocxBorder {
  style?: ST_Border;
  color?: string; // Hex color or 'auto'
  size?: number; // Border width in eighth-points (1/8 of a point)
  space?: number; // Space from text in points
}

export interface DocxShading {
  fill?: string; // Background fill color (hex or 'auto')
  color?: string; // Pattern color (hex or 'auto')
  val?: ST_Shd;
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
  alignment?: ST_Jc;
  outlineLevel?: number; // w:outlineLvl for heading detection
  images?: any[]; // Temporary, will be processed to Image[]
  spacing?: {
    before?: number; // Twips
    after?: number; // Twips
    line?: number; // Twips
    lineRule?: "auto" | "exact" | "atLeast";
  };
  indentation?: {
    left?: number; // Twips
    right?: number; // Twips
    firstLine?: number; // Twips
    hanging?: number; // Twips
  };
  textDirection?: "ltr" | "rtl" | "lrV" | "tbV" | "lrTbV" | "tbLrV";
  verticalAlignment?: "top" | "center" | "bottom" | "auto";
  borders?: DocxParagraphBorders;
  shading?: DocxShading;
  cnfStyle?: DocxConditionalFormatting;
  framePr?: DocxFrameProperties; // Drop caps and text frames
}

export interface DocxFrameProperties {
  dropCap?: "none" | "drop" | "margin"; // Drop cap style
  lines?: number; // Number of lines for drop cap (default: 3)
  wrap?: "around" | "tight" | "through" | "topAndBottom" | "none";
  vAnchor?: "text" | "margin" | "page";
  hAnchor?: "text" | "margin" | "page";
  x?: number; // X position in twips
  y?: number; // Y position in twips
  w?: number; // Width in twips
  h?: number; // Height in twips
  hRule?: "atLeast" | "exact" | "auto";
  xAlign?: "left" | "right" | "center" | "inside" | "outside";
  yAlign?: "top" | "bottom" | "center" | "inside" | "outside";
  hSpace?: number; // Horizontal space from text in twips
  vSpace?: number; // Vertical space from text in twips
}

export class DocxParseError {
  readonly _tag = "DocxParseError";
  constructor(public readonly message: string) {}
}

// Table-specific types for DOCX parsing
export interface DocxTableBorder {
  style?: ST_Border;
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
    type: "dxa" | "pct" | "auto"; // dxa = twips, pct = percentage
  };
}

export interface DocxTableRowProperties {
  cnfStyle?: DocxConditionalFormatting;
}

export interface DocxTableCellProperties {
  borders?: DocxTableCellBorders;
  shading?: DocxShading;
  margin?: DocxTableCellMargin;
  width?: {
    value: number;
    type: "dxa" | "pct" | "auto";
  };
  gridSpan?: number;
  vMerge?: "restart" | "continue";
  vAlign?: "top" | "center" | "bottom";
  textDirection?: "ltr" | "rtl" | "lrV" | "tbV" | "lrTbV" | "tbLrV";
  cnfStyle?: DocxConditionalFormatting;
}

/**
 * Conditional formatting (cnfStyle) for table elements
 * Represents a 12-digit binary pattern indicating which conditional formats apply
 */
export interface DocxConditionalFormatting {
  /** First row (header row) */
  firstRow?: boolean;
  /** Last row */
  lastRow?: boolean;
  /** First column */
  firstCol?: boolean;
  /** Last column */
  lastCol?: boolean;
  /** Banded rows (even/odd row formatting) */
  bandedRows?: boolean;
  /** Banded columns (even/odd column formatting) */
  bandedCols?: boolean;
  /** The original 12-digit binary string for reference */
  val: string;
}

// Namespace constants
export const WORD_NAMESPACE = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
export const RELS_NAMESPACE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
export const DRAWING_NAMESPACE =
  "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing";
