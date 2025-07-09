/**
 * WordprocessingML Table Cell Types
 * Based on wml.xsd table cell definitions
 */

/**
 * Table cell width type
 */
export type ST_TblCellWidth = 'nil' | 'pct' | 'dxa' | 'auto';

/**
 * Vertical merge type
 */
export type ST_Merge = 'continue' | 'restart';

/**
 * Vertical alignment
 */
export type ST_VerticalJc = 'top' | 'center' | 'bottom';

/**
 * Text direction
 */
export type ST_TextDirection = 'lrTb' | 'tbRl' | 'btLr' | 'lrTbV' | 'tbRlV' | 'tbLrV';

/**
 * Table cell width
 */
export interface CT_TblCellWidth {
  /** Width value */
  w?: number;
  /** Width type */
  type?: ST_TblCellWidth;
}

/**
 * Vertical merge
 */
export interface CT_VMerge {
  /** Merge value */
  val?: ST_Merge;
}

/**
 * Vertical alignment
 */
export interface CT_VerticalJc {
  /** Vertical alignment value */
  val: ST_VerticalJc;
}

/**
 * Text direction
 */
export interface CT_TextDirection {
  /** Text direction value */
  val: ST_TextDirection;
}

/**
 * Table cell borders
 */
export interface CT_TcBorders {
  /** Top border */
  top?: any; // CT_Border
  /** Start border */
  start?: any; // CT_Border
  /** Bottom border */
  bottom?: any; // CT_Border
  /** End border */
  end?: any; // CT_Border
  /** Top-left to bottom-right border */
  tl2br?: any; // CT_Border
  /** Top-right to bottom-left border */
  tr2bl?: any; // CT_Border
}

/**
 * Table cell margins
 */
export interface CT_TcMar {
  /** Top margin */
  top?: CT_TblCellWidth;
  /** Start margin */
  start?: CT_TblCellWidth;
  /** Bottom margin */
  bottom?: CT_TblCellWidth;
  /** End margin */
  end?: CT_TblCellWidth;
}

/**
 * Base table cell properties
 */
export interface CT_TcPrBase {
  /** Conditional formatting style */
  cnfStyle?: any; // CT_Cnf
  /** Table cell width */
  tcW?: CT_TblCellWidth;
  /** Grid span */
  gridSpan?: number;
  /** Vertical merge */
  vMerge?: CT_VMerge;
  /** Table cell borders */
  tcBorders?: CT_TcBorders;
  /** Shading */
  shd?: any; // CT_Shd
  /** No wrap */
  noWrap?: boolean;
  /** Table cell margins */
  tcMar?: CT_TcMar;
  /** Text direction */
  textDirection?: CT_TextDirection;
  /** Fit text */
  tcFitText?: boolean;
  /** Vertical alignment */
  vAlign?: CT_VerticalJc;
  /** Hide mark */
  hideMark?: boolean;
  /** Cell headers */
  headers?: string;
}

/**
 * Table cell properties inner
 */
export interface CT_TcPrInner extends CT_TcPrBase {
  /** Cell insertion */
  cellIns?: any; // CT_TrackChange
  /** Cell deletion */
  cellDel?: any; // CT_TrackChange
  /** Cell merge */
  cellMerge?: any; // CT_CellMergeTrackChange
}

/**
 * Table cell properties
 */
export interface CT_TcPr extends CT_TcPrInner {
  /** Table cell properties change */
  tcPrChange?: any; // CT_TcPrChange
}