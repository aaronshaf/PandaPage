/**
 * WordprocessingML Run Types
 * Based on wml.xsd run definitions
 */

import type { CT_RPr } from "../style/run-properties-types";

/**
 * Text content
 */
export interface CT_Text {
  /** Text content */
  _text: string;
  /** Preserve space */
  space?: "preserve" | "default";
}

/**
 * Tab character
 */
export type CT_Tab = Record<string, never>;

/**
 * Break element
 */
export interface CT_Br {
  /** Break type */
  type?: "page" | "column" | "textWrapping";
  /** Clear */
  clear?: "none" | "left" | "right" | "all";
}

/**
 * Carriage return
 */
export type CT_Cr = Record<string, never>;

/**
 * No break hyphen
 */
export type CT_NoBreakHyphen = Record<string, never>;

/**
 * Soft hyphen
 */
export type CT_SoftHyphen = Record<string, never>;

/**
 * Day short
 */
export type CT_DayShort = Record<string, never>;

/**
 * Month short
 */
export type CT_MonthShort = Record<string, never>;

/**
 * Year short
 */
export type CT_YearShort = Record<string, never>;

/**
 * Day long
 */
export type CT_DayLong = Record<string, never>;

/**
 * Month long
 */
export type CT_MonthLong = Record<string, never>;

/**
 * Year long
 */
export type CT_YearLong = Record<string, never>;

/**
 * Run content elements
 */
export type RunContent =
  | CT_Text
  | CT_Tab
  | CT_Br
  | CT_Cr
  | CT_NoBreakHyphen
  | CT_SoftHyphen
  | CT_DayShort
  | CT_MonthShort
  | CT_YearShort
  | CT_DayLong
  | CT_MonthLong
  | CT_YearLong
  | any; // EG_RunInnerContent includes many more elements

/**
 * WordprocessingML run
 */
export interface CT_R {
  /** Run properties */
  rPr?: CT_RPr;
  /** Run content */
  content?: RunContent[];
  /** Revision save ID for run properties */
  rsidRPr?: string;
  /** Revision save ID for deletion */
  rsidDel?: string;
  /** Revision save ID for run */
  rsidR?: string;
}
