/**
 * WordprocessingML Section Types
 * Based on wml.xsd section definitions
 */

/**
 * Page orientation
 */
export type ST_PageOrientation = 'portrait' | 'landscape';

/**
 * Section type
 */
export type ST_SectionMark = 'nextPage' | 'nextColumn' | 'continuous' | 'evenPage' | 'oddPage';

/**
 * Page size
 */
export interface CT_PageSz {
  /** Page width */
  w?: number;
  /** Page height */
  h?: number;
  /** Page orientation */
  orient?: ST_PageOrientation;
  /** Page code */
  code?: number;
}

/**
 * Page margins
 */
export interface CT_PageMar {
  /** Top margin */
  top?: number;
  /** Right margin */
  right?: number;
  /** Bottom margin */
  bottom?: number;
  /** Left margin */
  left?: number;
  /** Header margin */
  header?: number;
  /** Footer margin */
  footer?: number;
  /** Gutter margin */
  gutter?: number;
  /** Gutter at top */
  gutterAtTop?: boolean;
}

/**
 * Paper source
 */
export interface CT_PaperSource {
  /** First page paper source */
  first?: number;
  /** Other pages paper source */
  other?: number;
}

/**
 * Page numbering
 */
export interface CT_PageNumber {
  /** Format */
  fmt?: 'decimal' | 'upperRoman' | 'lowerRoman' | 'upperLetter' | 'lowerLetter' | 'ordinal' | 'cardinalText' | 'ordinalText' | 'hex' | 'chicago';
  /** Start value */
  start?: number;
  /** Chapter style */
  chapStyle?: number;
  /** Chapter separator */
  chapSep?: 'hyphen' | 'period' | 'colon' | 'emDash' | 'enDash';
}

/**
 * Columns
 */
export interface CT_Columns {
  /** Equal width */
  equalWidth?: boolean;
  /** Space between columns */
  space?: number;
  /** Number of columns */
  num?: number;
  /** Separator line */
  sep?: boolean;
  /** Column definitions */
  col?: Array<{
    w?: number;
    space?: number;
  }>;
}

/**
 * Line numbering
 */
export interface CT_LineNumber {
  /** Count by */
  countBy?: number;
  /** Start value */
  start?: number;
  /** Distance from text */
  distance?: number;
  /** Restart */
  restart?: 'newPage' | 'newSection' | 'continuous';
}

/**
 * Page borders
 */
export interface CT_PageBorders {
  /** Z-order */
  zOrder?: 'front' | 'back';
  /** Display */
  display?: 'allPages' | 'firstPage' | 'notFirstPage';
  /** Offset from */
  offsetFrom?: 'page' | 'text';
  /** Top border */
  top?: any; // CT_PageBorder
  /** Left border */
  left?: any; // CT_PageBorder
  /** Bottom border */
  bottom?: any; // CT_PageBorder
  /** Right border */
  right?: any; // CT_PageBorder
}

/**
 * Document grid
 */
export interface CT_DocGrid {
  /** Type */
  type?: 'default' | 'lines' | 'linesAndChars' | 'snapToChars';
  /** Line pitch */
  linePitch?: number;
  /** Character space */
  charSpace?: number;
}

/**
 * Header footer reference
 */
export interface CT_HdrFtrRef {
  /** Type */
  type: 'even' | 'default' | 'first';
  /** Relationship ID */
  id: string;
}

/**
 * Section properties
 */
export interface CT_SectPr {
  /** Header references */
  headerReference?: CT_HdrFtrRef[];
  /** Footer references */
  footerReference?: CT_HdrFtrRef[];
  /** Form protection */
  formProt?: boolean;
  /** Vertical justification */
  vAlign?: 'top' | 'center' | 'both' | 'bottom';
  /** No endnote */
  noEndnote?: boolean;
  /** Title page */
  titlePg?: boolean;
  /** Text direction */
  textDirection?: 'lrTb' | 'tbRl' | 'btLr' | 'lrTbV' | 'tbRlV' | 'tbLrV';
  /** Bidirectional */
  bidi?: boolean;
  /** Right to left gutter */
  rtlGutter?: boolean;
  /** Document grid */
  docGrid?: CT_DocGrid;
  /** Printer settings */
  printerSettings?: any; // CT_Rel
  /** Page size */
  pgSz?: CT_PageSz;
  /** Page margins */
  pgMar?: CT_PageMar;
  /** Paper source */
  paperSrc?: CT_PaperSource;
  /** Page borders */
  pgBorders?: CT_PageBorders;
  /** Line numbering */
  lnNumType?: CT_LineNumber;
  /** Page numbering */
  pgNumType?: CT_PageNumber;
  /** Columns */
  cols?: CT_Columns;
  /** Section type */
  type?: ST_SectionMark;
  /** Section properties change */
  sectPrChange?: any; // CT_SectPrChange
  /** Revision save ID */
  rsidRPr?: string;
  /** Revision save ID for section properties */
  rsidSect?: string;
}