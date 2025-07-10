/**
 * WordprocessingML Run and Character Types
 * @see ECMA-376 Part 1, §17.3.2 (Run)
 */

import type { ST_OnOff, ST_String, ST_Lang } from "../shared/common-types";
import type { ST_RelationshipId } from "../shared/relationship-types";
import type {
  CT_OnOff,
  CT_String,
  CT_Lang,
  CT_HpsMeasure,
  CT_SignedHpsMeasure,
  CT_SignedTwipsMeasure,
  CT_Empty,
  ST_LongHexNumber,
  ST_ShortHexNumber,
  ST_UcharHexNumber,
} from "./basic-types";
import type {
  CT_Highlight,
  CT_Color,
  CT_Underline,
  CT_TextEffect,
  CT_TextScale,
  CT_FitText,
  ST_UniversalMeasure,
} from "./text-formatting-types";
import type { CT_Border, CT_Shd } from "./border-shading-types";

/**
 * Text content with xml:space preservation.
 * @see ECMA-376 Part 1, §17.3.2.28 CT_Text
 */
export interface CT_Text {
  _text: ST_String; // Content of the element
  "xml:space"?: ST_String; // xml:space attribute
}

/**
 * Font hint.
 * @see ECMA-376 Part 1, §17.18.39 ST_Hint
 */
export enum ST_Hint {
  Default = "default",
  EastAsia = "eastAsia",
}

/**
 * Theme font.
 * @see ECMA-376 Part 1, §17.18.96 ST_Theme
 */
export enum ST_Theme {
  MajorEastAsia = "majorEastAsia",
  MajorBidi = "majorBidi",
  MajorAscii = "majorAscii",
  MajorHAnsi = "majorHAnsi",
  MinorEastAsia = "minorEastAsia",
  MinorBidi = "minorBidi",
  MinorAscii = "minorAscii",
  MinorHAnsi = "minorHAnsi",
}

/**
 * Font specification.
 * @see ECMA-376 Part 1, §17.3.2.14 CT_Fonts
 */
export interface CT_Fonts {
  hint?: ST_Hint;
  ascii?: ST_String;
  hAnsi?: ST_String;
  eastAsia?: ST_String;
  cs?: ST_String;
  asciiTheme?: ST_Theme;
  hAnsiTheme?: ST_Theme;
  eastAsiaTheme?: ST_Theme;
  cstheme?: ST_Theme;
}

/**
 * Break type.
 * @see ECMA-376 Part 1, §17.18.3 ST_BrType
 */
export enum ST_BrType {
  Page = "page",
  Column = "column",
  TextWrapping = "textWrapping",
}

/**
 * Break clear type.
 * @see ECMA-376 Part 1, §17.18.4 ST_BrClear
 */
export enum ST_BrClear {
  None = "none",
  Left = "left",
  Right = "right",
  All = "all",
}

/**
 * Break.
 * @see ECMA-376 Part 1, §17.3.2.4 CT_Br
 */
export interface CT_Br {
  type?: ST_BrType;
  clear?: ST_BrClear;
}

/**
 * Symbol character.
 * @see ECMA-376 Part 1, §17.3.2.34 CT_Sym
 */
export interface CT_Sym {
  font?: ST_String;
  char?: ST_ShortHexNumber;
}

/**
 * Emphasis mark.
 * @see ECMA-376 Part 1, §17.18.25 ST_Em
 */
export enum ST_Em {
  None = "none",
  Dot = "dot",
  Comma = "comma",
  Circle = "circle",
  UnderDot = "underDot",
}

/**
 * Emphasis mark.
 * @see ECMA-376 Part 1, §17.3.2.12 CT_Em
 */
export interface CT_Em {
  val: ST_Em;
}

/**
 * Combine brackets.
 * @see ECMA-376 Part 1, §17.18.9 ST_CombineBrackets
 */
export enum ST_CombineBrackets {
  None = "none",
  Round = "round",
  Square = "square",
  Angle = "angle",
  Curly = "curly",
}

/**
 * East Asian layout.
 * @see ECMA-376 Part 1, §17.3.2.11 CT_EastAsianLayout
 */
export interface CT_EastAsianLayout {
  id?: ST_DecimalNumber;
  combine?: ST_OnOff;
  combineBrackets?: ST_CombineBrackets;
  vert?: ST_OnOff;
  vertCompress?: ST_OnOff;
}

/**
 * Language specification.
 * @see ECMA-376 Part 1, §17.3.2.19 CT_Language
 */
export interface CT_Language {
  val?: ST_Lang;
  eastAsia?: ST_Lang;
  bidi?: ST_Lang;
}

/**
 * Vertical alignment for run content.
 * @see ECMA-376 Part 1, §17.3.2.42 CT_VerticalAlignRun
 */
export interface CT_VerticalAlignRun {
  val: ST_String; // s:ST_VerticalAlignRun
}

/**
 * Run properties base type (using discriminated union).
 * @see ECMA-376 Part 1, §17.3.2.25 EG_RPrBase
 */
export type EG_RPrBase =
  | { rStyle: CT_String }
  | { rFonts: CT_Fonts }
  | { b: CT_OnOff }
  | { bCs: CT_OnOff }
  | { i: CT_OnOff }
  | { iCs: CT_OnOff }
  | { caps: CT_OnOff }
  | { smallCaps: CT_OnOff }
  | { strike: CT_OnOff }
  | { dstrike: CT_OnOff }
  | { outline: CT_OnOff }
  | { shadow: CT_OnOff }
  | { emboss: CT_OnOff }
  | { imprint: CT_OnOff }
  | { noProof: CT_OnOff }
  | { snapToGrid: CT_OnOff }
  | { vanish: CT_OnOff }
  | { webHidden: CT_OnOff }
  | { color: CT_Color }
  | { spacing: CT_SignedTwipsMeasure }
  | { w: CT_TextScale }
  | { kern: CT_HpsMeasure }
  | { position: CT_SignedHpsMeasure }
  | { sz: CT_HpsMeasure }
  | { szCs: CT_HpsMeasure }
  | { highlight: CT_Highlight }
  | { u: CT_Underline }
  | { effect: CT_TextEffect }
  | { bdr: CT_Border }
  | { shd: CT_Shd }
  | { fitText: CT_FitText }
  | { vertAlign: CT_VerticalAlignRun }
  | { rtl: CT_OnOff }
  | { cs: CT_OnOff }
  | { em: CT_Em }
  | { lang: CT_Language }
  | { eastAsianLayout: CT_EastAsianLayout }
  | { specVanish: CT_OnOff }
  | { oMath: CT_OnOff };

/**
 * Run properties content.
 * @see ECMA-376 Part 1, §17.3.2.25 EG_RPrContent
 */
export type EG_RPrContent = EG_RPrBase[] | { rPrChange: any }; // CT_RPrChange

/**
 * Run properties.
 * @see ECMA-376 Part 1, §17.3.2.27 CT_RPr
 */
export interface CT_RPr {
  rPrContent?: EG_RPrContent;
}

/**
 * Run properties wrapper.
 * @see ECMA-376 Part 1, §17.3.2.27 EG_RPr
 */
export type EG_RPr = { rPr: CT_RPr };

/**
 * Run inner content type (discriminated union).
 * @see ECMA-376 Part 1, §17.3.2.22 EG_RunInnerContent
 */
export type EG_RunInnerContent =
  | { br: CT_Br }
  | { t: CT_Text }
  | { contentPart: any } // CT_Rel
  | { delText: CT_Text }
  | { instrText: CT_Text }
  | { delInstrText: CT_Text }
  | { noBreakHyphen: CT_Empty }
  | { softHyphen: CT_Empty }
  | { dayShort: CT_Empty }
  | { monthShort: CT_Empty }
  | { yearShort: CT_Empty }
  | { dayLong: CT_Empty }
  | { monthLong: CT_Empty }
  | { yearLong: CT_Empty }
  | { annotationRef: CT_Empty }
  | { footnoteRef: CT_Empty }
  | { endnoteRef: CT_Empty }
  | { separator: CT_Empty }
  | { continuationSeparator: CT_Empty }
  | { sym: CT_Sym }
  | { pgNum: CT_Empty }
  | { cr: CT_Empty }
  | { tab: CT_Empty }
  | { object: any } // CT_Object
  | { fldChar: any } // CT_FldChar
  | { ruby: any } // CT_Ruby
  | { footnoteReference: any } // CT_FtnEdnRef
  | { endnoteReference: any } // CT_FtnEdnRef
  | { commentReference: any } // CT_Markup
  | { drawing: any } // CT_Drawing
  | { ptab: any } // CT_PTab
  | { lastRenderedPageBreak: CT_Empty };

/**
 * Run content.
 * @see ECMA-376 Part 1, §17.3.2.22 CT_R
 */
export interface CT_R {
  rPr?: EG_RPr;
  content?: EG_RunInnerContent[];
  rsidRPr?: ST_LongHexNumber;
  rsidDel?: ST_LongHexNumber;
  rsidR?: ST_LongHexNumber;
}

/**
 * Paragraph run properties base.
 * @see ECMA-376 Part 1, §17.3.1.27 CT_ParaRPr
 */
export interface CT_ParaRPr {
  paraRPrTrackChanges?: any; // EG_ParaRPrTrackChanges
  rPrBase?: EG_RPrBase[];
  rPrChange?: any; // CT_ParaRPrChange
}

// Import missing type
import type { ST_DecimalNumber } from "../shared/measurement-types";
