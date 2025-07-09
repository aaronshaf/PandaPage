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
  underline?: boolean;
  strikethrough?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  fontSize?: number; // Font size in points
  fontSizeCs?: number; // Complex script font size in points (for non-Latin scripts)
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  link?: string;
  _footnoteRef?: string;
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
  emphasis?: 'dot' | 'comma' | 'circle' | 'underDot';
  lang?: string;
}

export interface Paragraph {
  type: 'paragraph';
  runs: TextRun[];
  style?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify' | 'distribute' | 'highKashida' | 'lowKashida' | 'mediumKashida' | 'thaiDistribute';
  indentLevel?: number;
  listInfo?: {
    level: number;
    type: 'bullet' | 'number';
    text?: string;
  };
  images?: Image[];
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

export interface Heading {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  runs: TextRun[];
  alignment?: 'left' | 'center' | 'right' | 'justify' | 'distribute' | 'highKashida' | 'lowKashida' | 'mediumKashida' | 'thaiDistribute';
  images?: Image[];
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

export interface Table {
  type: 'table';
  rows: TableRow[];
  width?: number;
}

export interface TableRow {
  cells: TableCell[];
}

export interface TableCell {
  paragraphs: Paragraph[];
  colspan?: number;
  rowspan?: number;
  width?: number;
  verticalAlignment?: 'top' | 'center' | 'bottom';
  textDirection?: 'ltr' | 'rtl' | 'lrV' | 'tbV' | 'lrTbV' | 'tbLrV';
}

export interface Image {
  type: 'image';
  data: ArrayBuffer;
  mimeType: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface PageBreak {
  type: 'pageBreak';
}

export interface Header {
  type: 'header';
  elements: (Paragraph | Table)[];
}

export interface Footer {
  type: 'footer';
  elements: (Paragraph | Table)[];
}

export interface HeaderFooterInfo {
  default?: Header | Footer;
  first?: Header | Footer;
  even?: Header | Footer;
  odd?: Header | Footer;
}

export interface Bookmark {
  type: 'bookmark';
  id: string;
  name: string;
  text?: string;
}

export interface FootnoteReference {
  type: 'footnoteReference';
  id: string;
  text: string; // The reference number or marker
}

export interface Footnote {
  type: 'footnote';
  id: string;
  elements: (Paragraph | Table)[];
}

export type DocumentElement = Paragraph | Heading | Table | Image | PageBreak | Header | Footer | Bookmark | FootnoteReference | Footnote;

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