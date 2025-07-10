/**
 * WordprocessingML Document Structure Types
 * Based on wml.xsd document definitions
 */

import type { CT_SectPr } from "./section-types";
import type { CT_P } from "./paragraph-types";
import type { CT_Tbl } from "../table/table-types";

/**
 * Document background
 */
export interface CT_DocBackground {
  /** Drawing element */
  drawing?: any; // CT_Drawing
  /** Background color */
  color?: string;
  /** Theme color */
  themeColor?: string;
  /** Theme tint */
  themeTint?: string;
  /** Theme shade */
  themeShade?: string;
}

/**
 * Base document structure
 */
export interface CT_DocumentBase {
  /** Document background */
  background?: CT_DocBackground;
}

/**
 * Document body content
 */
export interface CT_Body {
  /** Block level elements (paragraphs, tables, etc.) */
  content?: Array<CT_P | CT_Tbl | any>; // EG_BlockLevelElts
  /** Section properties */
  sectPr?: CT_SectPr;
}

/**
 * WordprocessingML document
 */
export interface CT_Document extends CT_DocumentBase {
  /** Document body */
  body?: CT_Body;
  /** Conformance mode */
  conformance?: "strict" | "transitional";
}
