/**
 * WordprocessingML Paragraph Types
 * Based on wml.xsd paragraph definitions
 */

import type { CT_PPr } from "../style/paragraph-properties-types";
import type { CT_R } from "./run-types";

/**
 * Paragraph content elements
 */
export type ParagraphContent = CT_R | any; // EG_PContent includes runs, fields, hyperlinks, etc.

/**
 * WordprocessingML paragraph
 */
export interface CT_P {
  /** Paragraph properties */
  pPr?: CT_PPr;
  /** Paragraph content */
  content?: ParagraphContent[];
  /** Revision save ID for paragraph properties */
  rsidRPr?: string;
  /** Revision save ID for paragraph */
  rsidR?: string;
  /** Revision save ID for deletion */
  rsidDel?: string;
  /** Revision save ID for paragraph mark */
  rsidP?: string;
  /** Paragraph ID for math */
  paraId?: string;
  /** Text ID for math */
  textId?: string;
}
