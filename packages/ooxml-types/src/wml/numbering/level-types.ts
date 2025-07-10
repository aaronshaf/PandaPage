/**
 * WordprocessingML Numbering Level Types
 * Based on wml.xsd level-related definitions
 */

import type { ST_NumberFormat, ST_LevelSuffix } from "./numbering-types";

/**
 * Level justification
 */
export type ST_Jc =
  | "start"
  | "center"
  | "end"
  | "both"
  | "distribute"
  | "numTab"
  | "highKashida"
  | "lowKashida"
  | "thaiDistribute";

/**
 * Level text definition
 */
export interface CT_LevelText {
  /** Level text template with placeholders */
  val?: string;
  /** Null value indicator */
  null?: boolean;
}

/**
 * Level suffix formatting
 */
export interface CT_LevelSuffix {
  /** Suffix type */
  val: ST_LevelSuffix;
}

/**
 * Level justification
 */
export interface CT_LevelJc {
  /** Justification value */
  val: ST_Jc;
}

/**
 * Level restart settings
 */
export interface CT_LevelRestart {
  /** Restart level (0-based) */
  val?: number;
}

/**
 * Numbering level definition
 */
export interface CT_Lvl {
  /** Level start value */
  start?: number;
  /** Number format */
  numFmt?: ST_NumberFormat;
  /** Level restart settings */
  lvlRestart?: CT_LevelRestart;
  /** Paragraph style reference */
  pStyle?: string;
  /** Legal numbering flag */
  isLgl?: boolean;
  /** Level suffix */
  suff?: CT_LevelSuffix;
  /** Level text template */
  lvlText?: CT_LevelText;
  /** Picture bullet ID */
  lvlPicBulletId?: number;
  /** Level justification */
  lvlJc?: CT_LevelJc;
  /** Paragraph properties */
  pPr?: any; // CT_PPr
  /** Run properties */
  rPr?: any; // CT_RPr
  /** Level index (0-8) */
  ilvl: number;
  /** Tentative flag */
  tplc?: string;
}

/**
 * Level override for concrete numbering
 */
export interface CT_NumLvl {
  /** Start override value */
  startOverride?: number;
  /** Level definition override */
  lvl?: CT_Lvl;
  /** Level index */
  ilvl: number;
}
