/**
 * WordprocessingML Table Properties Types
 * Based on wml.xsd table property definitions
 */

/**
 * Table width type
 */
export type ST_TblWidth = 'nil' | 'pct' | 'dxa' | 'auto';

/**
 * Table layout type
 */
export type ST_TblLayoutType = 'fixed' | 'autofit';

/**
 * Table overlap type
 */
export type ST_TblOverlap = 'never' | 'overlap';

/**
 * Table width definition
 */
export interface CT_TblWidth {
  /** Width value */
  w?: number;
  /** Width type */
  type?: ST_TblWidth;
}

/**
 * Table justification
 */
export interface CT_TblJc {
  /** Justification value */
  val: 'start' | 'center' | 'end';
}

/**
 * Table layout
 */
export interface CT_TblLayout {
  /** Layout type */
  type?: ST_TblLayoutType;
}

/**
 * Table overlap
 */
export interface CT_TblOverlap {
  /** Overlap value */
  val: ST_TblOverlap;
}

/**
 * Table cell spacing
 */
export interface CT_TblCellSpacing {
  /** Spacing width */
  w?: number;
  /** Spacing type */
  type?: ST_TblWidth;
}

/**
 * Table indentation
 */
export interface CT_TblInd {
  /** Indentation width */
  w?: number;
  /** Indentation type */
  type?: ST_TblWidth;
}

/**
 * Table border
 */
export interface CT_TblBorders {
  /** Top border */
  top?: any; // CT_Border
  /** Start border */
  start?: any; // CT_Border
  /** Bottom border */
  bottom?: any; // CT_Border
  /** End border */
  end?: any; // CT_Border
  /** Inside horizontal border */
  insideH?: any; // CT_Border
  /** Inside vertical border */
  insideV?: any; // CT_Border
}

/**
 * Table cell margin
 */
export interface CT_TblCellMar {
  /** Top margin */
  top?: CT_TblWidth;
  /** Start margin */
  start?: CT_TblWidth;
  /** Bottom margin */
  bottom?: CT_TblWidth;
  /** End margin */
  end?: CT_TblWidth;
}

/**
 * Table look
 */
export interface CT_TblLook {
  /** First row */
  firstRow?: boolean;
  /** Last row */
  lastRow?: boolean;
  /** First column */
  firstColumn?: boolean;
  /** Last column */
  lastColumn?: boolean;
  /** No horizontal bands */
  noHBand?: boolean;
  /** No vertical bands */
  noVBand?: boolean;
  /** Table look value */
  val?: string;
}

/**
 * Table position properties
 */
export interface CT_TblPPr {
  /** Left from text */
  leftFromText?: number;
  /** Right from text */
  rightFromText?: number;
  /** Top from text */
  topFromText?: number;
  /** Bottom from text */
  bottomFromText?: number;
  /** Vertical anchor */
  vertAnchor?: 'text' | 'margin' | 'page';
  /** Horizontal anchor */
  horzAnchor?: 'text' | 'margin' | 'page';
  /** Table X position */
  tblpX?: number;
  /** Table Y position */
  tblpY?: number;
  /** Table X alignment */
  tblpXSpec?: 'left' | 'center' | 'right' | 'inside' | 'outside';
  /** Table Y alignment */
  tblpYSpec?: 'top' | 'center' | 'bottom' | 'inside' | 'outside';
}

/**
 * Base table properties
 */
export interface CT_TblPrBase {
  /** Table style */
  tblStyle?: string;
  /** Table position properties */
  tblpPr?: CT_TblPPr;
  /** Table overlap */
  tblOverlap?: CT_TblOverlap;
  /** Bidirectional visual */
  bidiVisual?: boolean;
  /** Table width */
  tblW?: CT_TblWidth;
  /** Table justification */
  jc?: CT_TblJc;
  /** Table cell spacing */
  tblCellSpacing?: CT_TblCellSpacing;
  /** Table indentation */
  tblInd?: CT_TblInd;
  /** Table borders */
  tblBorders?: CT_TblBorders;
  /** Shading */
  shd?: any; // CT_Shd
  /** Table layout */
  tblLayout?: CT_TblLayout;
  /** Table cell margins */
  tblCellMar?: CT_TblCellMar;
  /** Table look */
  tblLook?: CT_TblLook;
}

/**
 * Table properties
 */
export interface CT_TblPr extends CT_TblPrBase {
  /** Table properties change */
  tblPrChange?: any; // CT_TblPrChange
}