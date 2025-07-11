import type {
  ST_HighlightColor,
  ST_Underline,
  ST_Border,
  ST_Shd,
  ST_Jc,
  ST_Em,
} from "@browser-document-viewer/ooxml-types";

export interface DocumentMetadata {
  title?: string;
  author?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  keywords?: string[];
  description?: string;
  language?: string;
}

export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean | ST_Underline; // Support both boolean and specific underline styles
  strikethrough?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  fontSize?: number; // Font size in points
  fontSizeCs?: number; // Complex script font size in points (for non-Latin scripts)
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  highlightColor?: ST_HighlightColor; // OOXML highlight color
  link?: string;
  _footnoteRef?: string;
  _endnoteRef?: string;
  _fieldCode?: string;
  // Advanced text formatting
  characterSpacing?: number; // Twips
  position?: number; // Twips
  emboss?: boolean;
  imprint?: boolean;
  outline?: boolean;
  shadow?: boolean;
  smallCaps?: boolean;
  caps?: boolean;
  hidden?: boolean;
  doubleStrikethrough?: boolean;
  kerning?: number; // Half-points
  textScale?: number; // Percentage
  emphasis?: ST_Em;
  lang?: string;
}

export interface Paragraph {
  type: "paragraph";
  runs: TextRun[];
  style?: string;
  alignment?: ST_Jc;
  indentLevel?: number;
  listInfo?: {
    level: number;
    type: "bullet" | "number";
    text?: string;
    numFmt?: string; // The numbering format (bullet, decimal, upperLetter, etc.)
  };
  images?: Image[];
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
}

export interface Heading {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  runs: TextRun[];
  alignment?: ST_Jc;
  images?: Image[];
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
}

export interface TableBorder {
  style?: ST_Border;
  color?: string; // Hex color
  width?: number; // Border width in points (converted from eighth-points)
}

export interface TableBorders {
  top?: TableBorder;
  bottom?: TableBorder;
  left?: TableBorder;
  right?: TableBorder;
  insideH?: TableBorder; // Inside horizontal borders
  insideV?: TableBorder; // Inside vertical borders
}

export interface TableShading {
  fill?: string; // Background fill color (hex)
  color?: string; // Pattern color (hex)
  pattern?: ST_Shd;
}

export interface Table {
  type: "table";
  rows: TableRow[];
  width?: number;
  borders?: TableBorders;
  shading?: TableShading;
  cellMargin?: {
    top?: number; // Twips
    bottom?: number; // Twips
    left?: number; // Twips
    right?: number; // Twips
  };
}

export interface TableRow {
  cells: TableCell[];
}

export interface TableCellBorders {
  top?: TableBorder;
  bottom?: TableBorder;
  left?: TableBorder;
  right?: TableBorder;
  tl2br?: TableBorder; // Top-left to bottom-right diagonal
  tr2bl?: TableBorder; // Top-right to bottom-left diagonal
}

export interface TableCell {
  paragraphs: Paragraph[];
  colspan?: number;
  rowspan?: number;
  width?: number;
  verticalAlignment?: "top" | "center" | "bottom";
  textDirection?: "ltr" | "rtl" | "lrV" | "tbV" | "lrTbV" | "tbLrV";
  borders?: TableCellBorders;
  shading?: TableShading;
  margin?: {
    top?: number; // Twips
    bottom?: number; // Twips
    left?: number; // Twips
    right?: number; // Twips
  };
}

export interface Image {
  type: "image";
  data: ArrayBuffer;
  mimeType: string;
  width?: number;
  height?: number;
  alt?: string;
  // Advanced image properties
  crop?: ImageCrop;
  transform?: DrawingTransform;
  effects?: ImageEffects;
  border?: ImageBorder;
}

export interface ImageCrop {
  top?: number; // Percentage (0-100)
  bottom?: number; // Percentage (0-100)
  left?: number; // Percentage (0-100)
  right?: number; // Percentage (0-100)
}

export interface DrawingTransform {
  rotation?: number; // Degrees
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  scaleX?: number; // Scale factor (1.0 = 100%)
  scaleY?: number; // Scale factor (1.0 = 100%)
  skewX?: number; // Degrees
  skewY?: number; // Degrees
}

export interface ImageEffects {
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // 0 to 200
  blur?: number; // Radius in pixels
  shadow?: ShadowEffect;
  reflection?: ReflectionEffect;
  glow?: GlowEffect;
  softEdges?: number; // Radius in pixels
  preset3D?: string; // Preset 3D effect name
}

export interface ShadowEffect {
  color?: string;
  transparency?: number; // 0-100
  size?: number; // Percentage
  blur?: number; // Points
  angle?: number; // Degrees
  distance?: number; // Points
}

export interface ReflectionEffect {
  transparency?: number; // 0-100
  size?: number; // Percentage
  distance?: number; // Points
  blur?: number; // Points
}

export interface GlowEffect {
  color?: string;
  transparency?: number; // 0-100
  radius?: number; // Points
}

export interface ImageBorder {
  color?: string;
  width?: number; // Points
  style?: "solid" | "dashed" | "dotted" | "double";
}

export interface Shape {
  type: "shape";
  shapeType: string; // e.g., 'rect', 'ellipse', 'triangle', 'arrow'
  width?: number;
  height?: number;
  transform?: DrawingTransform;
  fill?: ShapeFill;
  outline?: ShapeOutline;
  effects?: ImageEffects;
  textBox?: TextBox;
}

export interface ShapeFill {
  type: "solid" | "gradient" | "pattern" | "picture";
  color?: string;
  transparency?: number; // 0-100
  gradient?: GradientFill;
  picture?: {
    data: ArrayBuffer;
    mimeType: string;
  };
}

export interface GradientFill {
  type: "linear" | "radial" | "rectangular" | "path";
  stops: GradientStop[];
  angle?: number; // Degrees (for linear)
}

export interface GradientStop {
  position: number; // 0-100
  color: string;
  transparency?: number; // 0-100
}

export interface ShapeOutline {
  color?: string;
  width?: number; // Points
  style?: "solid" | "dashed" | "dotted" | "dashDot" | "dashDotDot";
  transparency?: number; // 0-100
}

export interface TextBox {
  paragraphs: Paragraph[];
  verticalAlignment?: "top" | "middle" | "bottom";
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  autoFit?: "none" | "shrinkText" | "resizeShape";
  wordWrap?: boolean;
}

export interface DrawingObject {
  type: "drawing";
  drawingType: "inline" | "anchor";
  content: Image | Shape | Chart | SmartArt | Group;
  // Positioning for anchored drawings
  position?: DrawingPosition;
  wrapType?: "none" | "square" | "tight" | "through" | "topAndBottom";
  wrapSide?: "both" | "left" | "right" | "largest";
  allowOverlap?: boolean;
  behindText?: boolean;
  locked?: boolean;
  layoutInCell?: boolean; // For table cells
  distanceFromText?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

export interface DrawingPosition {
  horizontal?: {
    relativeTo:
      | "character"
      | "column"
      | "insideMargin"
      | "leftMargin"
      | "margin"
      | "outsideMargin"
      | "page"
      | "rightMargin";
    offset?: number; // EMUs
    align?: "left" | "center" | "right" | "inside" | "outside";
  };
  vertical?: {
    relativeTo:
      | "line"
      | "paragraph"
      | "margin"
      | "page"
      | "topMargin"
      | "bottomMargin"
      | "insideMargin"
      | "outsideMargin";
    offset?: number; // EMUs
    align?: "top" | "center" | "bottom" | "inside" | "outside";
  };
}

export interface Chart {
  type: "chart";
  chartType: string; // e.g., 'bar', 'line', 'pie', 'scatter'
  width?: number;
  height?: number;
  title?: string;
  data?: any; // Chart data structure (simplified for now)
}

export interface SmartArt {
  type: "smartArt";
  layout: string; // SmartArt layout type
  width?: number;
  height?: number;
  nodes?: SmartArtNode[];
}

export interface SmartArtNode {
  text: string;
  level: number;
  children?: SmartArtNode[];
}

export interface Group {
  type: "group";
  children: (Image | Shape | Chart | SmartArt | Group)[];
  transform?: DrawingTransform;
}

export interface PageBreak {
  type: "pageBreak";
}

export interface Header {
  type: "header";
  elements: (Paragraph | Table)[];
}

export interface Footer {
  type: "footer";
  elements: (Paragraph | Table)[];
}

export interface HeaderFooterInfo {
  default?: Header | Footer;
  first?: Header | Footer;
  even?: Header | Footer;
  odd?: Header | Footer;
}

export interface Bookmark {
  type: "bookmark";
  id: string;
  name: string;
  text?: string;
}

export interface FootnoteReference {
  type: "footnoteReference";
  id: string;
  text: string; // The reference number or marker
}

export interface Footnote {
  type: "footnote";
  id: string;
  elements: (Paragraph | Table)[];
}

export interface EndnoteReference {
  type: "endnoteReference";
  id: string;
  text: string; // The reference number or marker
}

export interface Endnote {
  type: "endnote";
  id: string;
  elements: (Paragraph | Table)[];
}

export type DocumentElement =
  | Paragraph
  | Heading
  | Table
  | Image
  | PageBreak
  | Header
  | Footer
  | Bookmark
  | FootnoteReference
  | Footnote
  | EndnoteReference
  | Endnote
  | DrawingObject
  | Shape
  | Chart
  | SmartArt
  | Group;

export interface ParsedDocument {
  metadata: DocumentMetadata;
  elements: DocumentElement[];
  headers?: HeaderFooterInfo;
  footers?: HeaderFooterInfo;
}

export interface ParseOptions {
  extractImages?: boolean;
  preserveStyles?: boolean;
  preserveComments?: boolean;
}
