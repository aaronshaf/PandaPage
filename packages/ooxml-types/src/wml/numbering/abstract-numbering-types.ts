/**
 * WordprocessingML Abstract Numbering Types
 * Based on wml.xsd abstract numbering definitions
 */

import type { CT_Lvl } from "./level-types";
import type { ST_MultiLevelType } from "./numbering-types";

/**
 * Abstract numbering definition
 */
export interface CT_AbstractNum {
  /** Numbering style ID */
  nsid?: string;
  /** Multi-level type */
  multiLevelType?: ST_MultiLevelType;
  /** Template code */
  tmpl?: string;
  /** Numbering definition name */
  name?: string;
  /** Style link */
  styleLink?: string;
  /** Numbering style link */
  numStyleLink?: string;
  /** Level definitions (0-8) */
  lvl?: CT_Lvl[];
  /** Abstract numbering ID */
  abstractNumId: number;
}
