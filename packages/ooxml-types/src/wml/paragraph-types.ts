/**
 * WordprocessingML Paragraph Types
 * @see ECMA-376 Part 1, §17.3 (Paragraphs)
 */

import type { ST_OnOff, ST_String } from '../shared/common-types';
import type { ST_DecimalNumber } from '../shared/measurement-types';
import type { ST_TwipsMeasure } from '../shared/measurement-types';
import type { ST_HexColor, ST_ThemeColor } from './text-formatting-types';
import type { CT_Border, CT_Shd } from './border-shading-types';
import type { 
  ST_SignedTwipsMeasure, 
  CT_DecimalNumber, 
  ST_UcharHexNumber,
  CT_TwipsMeasure,
  CT_OnOff
} from './basic-types';

/**
 * Paragraph justification/alignment.
 * Controls horizontal alignment of paragraph text.
 * @see ECMA-376 Part 1, §17.18.44 ST_Jc
 */
export enum ST_Jc {
  Start = "start",
  Center = "center",
  End = "end",
  Both = "both",
  MediumKashida = "mediumKashida",
  Distribute = "distribute",
  NumTab = "numTab",
  HighKashida = "highKashida",
  LowKashida = "lowKashida",
  ThaiDistribute = "thaiDistribute",
}

/**
 * Table justification.
 * @see ECMA-376 Part 1, §17.18.45 ST_JcTable
 */
export enum ST_JcTable {
  Center = "center",
  End = "end",
  Start = "start",
}

/**
 * Paragraph justification.
 * @see ECMA-376 Part 1, §17.3.1.13 CT_Jc
 */
export interface CT_Jc {
  val: ST_Jc;
}

/**
 * Line spacing rule.
 * @see ECMA-376 Part 1, §17.18.48 ST_LineSpacingRule
 */
export enum ST_LineSpacingRule {
  Auto = "auto",
  Exact = "exact",
  AtLeast = "atLeast",
}

/**
 * Spacing between lines and paragraphs.
 * @see ECMA-376 Part 1, §17.3.1.33 CT_Spacing
 */
export interface CT_Spacing {
  before?: ST_TwipsMeasure;
  beforeLines?: ST_DecimalNumber;
  beforeAutospacing?: ST_OnOff;
  after?: ST_TwipsMeasure;
  afterLines?: ST_DecimalNumber;
  afterAutospacing?: ST_OnOff;
  line?: ST_SignedTwipsMeasure;
  lineRule?: ST_LineSpacingRule;
}

/**
 * Paragraph indentation.
 * @see ECMA-376 Part 1, §17.3.1.12 CT_Ind
 */
export interface CT_Ind {
  start?: ST_SignedTwipsMeasure;
  startChars?: ST_DecimalNumber;
  end?: ST_SignedTwipsMeasure;
  endChars?: ST_DecimalNumber;
  hanging?: ST_TwipsMeasure;
  hangingChars?: ST_DecimalNumber;
  firstLine?: ST_TwipsMeasure;
  firstLineChars?: ST_DecimalNumber;
}

/**
 * Tab stop alignment.
 * @see ECMA-376 Part 1, §17.18.89 ST_TabJc
 */
export enum ST_TabJc {
  Clear = "clear",
  Start = "start",
  Center = "center",
  End = "end",
  Decimal = "decimal",
  Bar = "bar",
  Num = "num",
}

/**
 * Tab leader character.
 * @see ECMA-376 Part 1, §17.18.90 ST_TabTlc
 */
export enum ST_TabTlc {
  None = "none",
  Dot = "dot",
  Hyphen = "hyphen",
  Underscore = "underscore",
  Heavy = "heavy",
  MiddleDot = "middleDot",
}

/**
 * Tab stop definition.
 * @see ECMA-376 Part 1, §17.3.1.37 CT_TabStop
 */
export interface CT_TabStop {
  val: ST_TabJc;
  leader?: ST_TabTlc;
  pos: ST_SignedTwipsMeasure;
}

/**
 * Tab stops list.
 * @see ECMA-376 Part 1, §17.3.1.38 CT_Tabs
 */
export interface CT_Tabs {
  tab: CT_TabStop[];
}

/**
 * Paragraph numbering properties.
 * @see ECMA-376 Part 1, §17.3.1.19 CT_NumPr
 */
export interface CT_NumPr {
  ilvl?: CT_DecimalNumber;
  numId?: CT_DecimalNumber;
  ins?: any; // CT_TrackChange - defined in tracking types
}

/**
 * Paragraph borders.
 * @see ECMA-376 Part 1, §17.3.1.24 CT_PBdr
 */
export interface CT_PBdr {
  top?: CT_Border;
  left?: CT_Border;
  bottom?: CT_Border;
  right?: CT_Border;
  between?: CT_Border;
  bar?: CT_Border;
}

/**
 * Text direction.
 * @see ECMA-376 Part 1, §17.18.92 ST_TextDirection
 */
export enum ST_TextDirection {
  Tb = "tb",
  Rl = "rl",
  Lr = "lr",
  TbV = "tbV",
  RlV = "rlV",
  LrV = "lrV",
}

/**
 * Text direction.
 * @see ECMA-376 Part 1, §17.3.1.39 CT_TextDirection
 */
export interface CT_TextDirection {
  val: ST_TextDirection;
}

/**
 * Text alignment.
 * @see ECMA-376 Part 1, §17.18.93 ST_TextAlignment
 */
export enum ST_TextAlignment {
  Top = "top",
  Center = "center",
  Baseline = "baseline",
  Bottom = "bottom",
  Auto = "auto",
}

/**
 * Text alignment.
 * @see ECMA-376 Part 1, §17.3.1.40 CT_TextAlignment
 */
export interface CT_TextAlignment {
  val: ST_TextAlignment;
}

/**
 * Textbox tight wrap.
 * @see ECMA-376 Part 1, §17.18.94 ST_TextboxTightWrap
 */
export enum ST_TextboxTightWrap {
  None = "none",
  AllLines = "allLines",
  FirstAndLastLine = "firstAndLastLine",
  FirstLineOnly = "firstLineOnly",
  LastLineOnly = "lastLineOnly",
}

/**
 * Textbox tight wrap.
 * @see ECMA-376 Part 1, §17.3.1.43 CT_TextboxTightWrap
 */
export interface CT_TextboxTightWrap {
  val: ST_TextboxTightWrap;
}

/**
 * Base paragraph properties.
 * @see ECMA-376 Part 1, §17.3.1.26 CT_PPrBase
 */
export interface CT_PPrBase {
  pStyle?: any; // CT_String
  keepNext?: CT_OnOff;
  keepLines?: CT_OnOff;
  pageBreakBefore?: CT_OnOff;
  framePr?: any; // CT_FramePr
  widowControl?: CT_OnOff;
  numPr?: CT_NumPr;
  suppressLineNumbers?: CT_OnOff;
  pBdr?: CT_PBdr;
  shd?: CT_Shd;
  tabs?: CT_Tabs;
  suppressAutoHyphens?: CT_OnOff;
  kinsoku?: CT_OnOff;
  wordWrap?: CT_OnOff;
  overflowPunct?: CT_OnOff;
  topLinePunct?: CT_OnOff;
  autoSpaceDE?: CT_OnOff;
  autoSpaceDN?: CT_OnOff;
  bidi?: CT_OnOff;
  adjustRightInd?: CT_OnOff;
  snapToGrid?: CT_OnOff;
  spacing?: CT_Spacing;
  ind?: CT_Ind;
  contextualSpacing?: CT_OnOff;
  mirrorIndents?: CT_OnOff;
  suppressOverlap?: CT_OnOff;
  jc?: CT_Jc;
  textDirection?: CT_TextDirection;
  textAlignment?: CT_TextAlignment;
  textboxTightWrap?: CT_TextboxTightWrap;
  outlineLvl?: CT_DecimalNumber;
  divId?: CT_DecimalNumber;
  cnfStyle?: any; // CT_Cnf
}

/**
 * Paragraph properties.
 * @see ECMA-376 Part 1, §17.3.1.25 CT_PPr
 */
export interface CT_PPr extends CT_PPrBase {
  rPr?: any; // CT_ParaRPr
  sectPr?: any; // CT_SectPr
  pPrChange?: any; // CT_PPrChange
}