/**
 * WordprocessingML Table Style Types
 * Based on wml.xsd table style definitions
 */

/**
 * Table style part type
 */
export type ST_TblStyleOverrideType =
  | "wholeTable"
  | "firstRow"
  | "lastRow"
  | "firstCol"
  | "lastCol"
  | "band1Vert"
  | "band2Vert"
  | "band1Horz"
  | "band2Horz"
  | "neCell"
  | "nwCell"
  | "seCell"
  | "swCell";

/**
 * Table style property override
 */
export interface CT_TblStylePr {
  /** Paragraph properties */
  pPr?: any; // CT_PPr
  /** Run properties */
  rPr?: any; // CT_RPr
  /** Table properties */
  tblPr?: any; // CT_TblPr
  /** Table row properties */
  trPr?: any; // CT_TrPr
  /** Table cell properties */
  tcPr?: any; // CT_TcPr
  /** Style part type */
  type: ST_TblStyleOverrideType;
}
