/**
 * WordprocessingML Table Row Types
 * Based on wml.xsd table row definitions
 */

import type { CT_TcPr } from "./table-cell-types";

/**
 * Table row height type
 */
export type ST_TblRowHeightRule = "auto" | "exact" | "atLeast";

/**
 * Table row height
 */
export interface CT_TblRowHeight {
  /** Height value */
  val?: number;
  /** Height rule */
  hRule?: ST_TblRowHeightRule;
}

/**
 * Table row width
 */
export interface CT_TblRowWidth {
  /** Width value */
  w?: number;
  /** Width type */
  type?: "nil" | "pct" | "dxa" | "auto";
}

/**
 * Base table row properties
 */
export interface CT_TrPrBase {
  /** Conditional formatting style */
  cnfStyle?: any; // CT_Cnf
  /** Division ID */
  divId?: number;
  /** Grid columns before */
  gridBefore?: number;
  /** Grid columns after */
  gridAfter?: number;
  /** Width before */
  wBefore?: CT_TblRowWidth;
  /** Width after */
  wAfter?: CT_TblRowWidth;
  /** Cannot split */
  cantSplit?: boolean;
  /** Table row height */
  trHeight?: CT_TblRowHeight;
  /** Table header */
  tblHeader?: boolean;
  /** Table cell spacing */
  tblCellSpacing?: CT_TblRowWidth;
  /** Justification */
  jc?: "start" | "center" | "end";
  /** Hidden */
  hidden?: boolean;
}

/**
 * Table row properties
 */
export interface CT_TblRowPr extends CT_TrPrBase {
  /** Insert tracking change */
  ins?: any; // CT_TrackChange
  /** Delete tracking change */
  del?: any; // CT_TrackChange
  /** Table row properties change */
  trPrChange?: any; // CT_TrPrChange
}

/**
 * Table cell
 */
export interface CT_TblCell {
  /** Table cell properties */
  tcPr?: CT_TcPr;
  /** Block level elements */
  content?: any[]; // EG_BlockLevelElts
  /** Cell ID */
  id?: string;
}

/**
 * Table row
 */
export interface CT_TblRow {
  /** Table properties exception */
  tblPrEx?: any; // CT_TblPrEx
  /** Table row properties */
  trPr?: CT_TblRowPr;
  /** Table cells */
  tc?: CT_TblCell[];
  /** Revision save ID for row properties */
  rsidRPr?: string;
  /** Revision save ID for row */
  rsidR?: string;
  /** Revision save ID for deletion */
  rsidDel?: string;
  /** Revision save ID for table properties */
  rsidTr?: string;
}
