/**
 * WordprocessingML Paragraph Properties Types
 * Based on wml.xsd paragraph property definitions
 */

import type { CT_NumPr } from "../numbering/numbering-types";

/**
 * Tab stop alignment
 */
export type ST_TabJc = "clear" | "start" | "center" | "end" | "decimal" | "bar" | "num";

/**
 * Tab stop leader character
 */
export type ST_TabTlc = "none" | "dot" | "hyphen" | "underscore" | "heavy" | "middleDot";

/**
 * WML paragraph text direction
 */
export type ST_WMLParagraphTextDirection = "lrTb" | "tbRl" | "btLr" | "lrTbV" | "tbRlV" | "tbLrV";

/**
 * Text alignment
 */
export type ST_TextAlignment = "top" | "center" | "baseline" | "bottom" | "auto";

/**
 * Textbox tight wrap
 */
export type ST_TextboxTightWrap =
  | "none"
  | "allLines"
  | "firstAndLastLine"
  | "firstLineOnly"
  | "lastLineOnly";

/**
 * Tab stop definition
 */
export interface CT_TabStop {
  /** Tab position */
  pos: number;
  /** Tab alignment */
  val: ST_TabJc;
  /** Tab leader character */
  leader?: ST_TabTlc;
}

/**
 * Tab stops container
 */
export interface CT_Tabs {
  /** Tab stop definitions */
  tab: CT_TabStop[];
}

/**
 * Spacing properties
 */
export interface CT_Spacing {
  /** Before spacing */
  before?: number;
  /** Before auto spacing */
  beforeAutospacing?: boolean;
  /** After spacing */
  after?: number;
  /** After auto spacing */
  afterAutospacing?: boolean;
  /** Line spacing */
  line?: number;
  /** Line spacing rule */
  lineRule?: "auto" | "exact" | "atLeast";
}

/**
 * Indentation properties
 */
export interface CT_Ind {
  /** Start indentation */
  start?: number;
  /** Start characters */
  startChars?: number;
  /** End indentation */
  end?: number;
  /** End characters */
  endChars?: number;
  /** Hanging indentation */
  hanging?: number;
  /** Hanging characters */
  hangingChars?: number;
  /** First line indentation */
  firstLine?: number;
  /** First line characters */
  firstLineChars?: number;
}

/**
 * Justification
 */
export interface CT_Jc {
  /** Justification value */
  val:
    | "start"
    | "center"
    | "end"
    | "both"
    | "distribute"
    | "numTab"
    | "highKashida"
    | "lowKashida"
    | "thaiDistribute";
}

/**
 * WML paragraph text direction
 */
export interface CT_WMLParagraphTextDirection {
  /** Text direction value */
  val: ST_WMLParagraphTextDirection;
}

/**
 * Text alignment
 */
export interface CT_TextAlignment {
  /** Text alignment value */
  val: ST_TextAlignment;
}

/**
 * Textbox tight wrap
 */
export interface CT_TextboxTightWrap {
  /** Tight wrap value */
  val: ST_TextboxTightWrap;
}

/**
 * Frame properties
 */
export interface CT_FramePr {
  /** Drop cap */
  dropCap?: "none" | "drop" | "margin";
  /** Lines */
  lines?: number;
  /** Width */
  w?: number;
  /** Height */
  h?: number;
  /** Vertical space */
  vSpace?: number;
  /** Horizontal space */
  hSpace?: number;
  /** Wrap */
  wrap?: "auto" | "notBeside" | "around" | "tight" | "through";
  /** Horizontal anchor */
  hAnchor?: "text" | "margin" | "page";
  /** Vertical anchor */
  vAnchor?: "text" | "margin" | "page";
  /** Horizontal position */
  x?: number;
  /** Horizontal alignment */
  xAlign?: "left" | "center" | "right" | "inside" | "outside";
  /** Vertical position */
  y?: number;
  /** Vertical alignment */
  yAlign?: "top" | "center" | "bottom" | "inside" | "outside";
  /** Height rule */
  hRule?: "auto" | "exact" | "atLeast";
  /** Anchor lock */
  anchorLock?: boolean;
}

/**
 * Paragraph border
 */
export interface CT_PBdr {
  /** Top border */
  top?: any; // CT_Border
  /** Left border */
  left?: any; // CT_Border
  /** Bottom border */
  bottom?: any; // CT_Border
  /** Right border */
  right?: any; // CT_Border
  /** Between border */
  between?: any; // CT_Border
  /** Bar border */
  bar?: any; // CT_Border
}

/**
 * Base paragraph properties
 */
export interface CT_PPrBase {
  /** Paragraph style */
  pStyle?: string;
  /** Keep with next */
  keepNext?: boolean;
  /** Keep lines together */
  keepLines?: boolean;
  /** Page break before */
  pageBreakBefore?: boolean;
  /** Frame properties */
  framePr?: CT_FramePr;
  /** Widow control */
  widowControl?: boolean;
  /** Numbering properties */
  numPr?: CT_NumPr;
  /** Suppress line numbers */
  suppressLineNumbers?: boolean;
  /** Paragraph borders */
  pBdr?: CT_PBdr;
  /** Shading */
  shd?: any; // CT_Shd
  /** Tab stops */
  tabs?: CT_Tabs;
  /** Suppress auto hyphens */
  suppressAutoHyphens?: boolean;
  /** Kinsoku */
  kinsoku?: boolean;
  /** Word wrap */
  wordWrap?: boolean;
  /** Overflow punctuation */
  overflowPunct?: boolean;
  /** Top line punctuation */
  topLinePunct?: boolean;
  /** Auto space DE */
  autoSpaceDE?: boolean;
  /** Auto space DN */
  autoSpaceDN?: boolean;
  /** Bidirectional */
  bidi?: boolean;
  /** Adjust right indent */
  adjustRightInd?: boolean;
  /** Snap to grid */
  snapToGrid?: boolean;
  /** Spacing */
  spacing?: CT_Spacing;
  /** Indentation */
  ind?: CT_Ind;
  /** Contextual spacing */
  contextualSpacing?: boolean;
  /** Mirror indents */
  mirrorIndents?: boolean;
  /** Suppress overlap */
  suppressOverlap?: boolean;
  /** Justification */
  jc?: CT_Jc;
  /** Text direction */
  textDirection?: CT_WMLParagraphTextDirection;
  /** Text alignment */
  textAlignment?: CT_TextAlignment;
  /** Textbox tight wrap */
  textboxTightWrap?: CT_TextboxTightWrap;
  /** Outline level */
  outlineLvl?: number;
  /** Division ID */
  divId?: number;
  /** Conditional formatting style */
  cnfStyle?: any; // CT_Cnf
}

/**
 * Paragraph properties
 */
export interface CT_PPr extends CT_PPrBase {
  /** Run properties for paragraph mark */
  rPr?: any; // CT_ParaRPr
  /** Section properties */
  sectPr?: any; // CT_SectPr
  /** Paragraph properties change */
  pPrChange?: any; // CT_PPrChange
}
