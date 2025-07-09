/**
 * WordprocessingML Table Types
 * Based on wml.xsd table definitions
 */

import type { CT_TblPr } from './table-properties-types';
import type { CT_TblRow } from './table-row-types';

/**
 * Table grid column
 */
export interface CT_TblGridCol {
  /** Column width */
  w?: number;
}

/**
 * Table grid
 */
export interface CT_TblGrid {
  /** Grid columns */
  gridCol?: CT_TblGridCol[];
  /** Table grid change */
  tblGridChange?: any; // CT_TblGridChange
}

/**
 * Table definition
 */
export interface CT_Tbl {
  /** Range markup elements (bookmarks, etc.) */
  rangeMarkupElements?: any[]; // EG_RangeMarkupElements
  /** Table properties */
  tblPr?: CT_TblPr;
  /** Table grid */
  tblGrid?: CT_TblGrid;
  /** Table rows */
  tr?: CT_TblRow[];
}