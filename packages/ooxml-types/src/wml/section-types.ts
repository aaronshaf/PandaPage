/**
 * WordprocessingML Section and Document Types
 * @see ECMA-376 Part 1, §17.6 (Sections)
 */

import type { ST_OnOff, ST_String, ST_DecimalNumber, ST_RelationshipId } from '../shared/common-types';
import type { ST_TwipsMeasure } from '../shared/measurement-types';
import type { 
  ST_SignedTwipsMeasure,
  CT_DecimalNumber,
  CT_OnOff,
  ST_LongHexNumber
} from './basic-types';
import type { CT_Border } from './border-shading-types';

/**
 * Section type.
 * @see ECMA-376 Part 1, §17.18.77 ST_SectionMark
 */
export enum ST_SectionMark {
  NextPage = "nextPage",
  NextColumn = "nextColumn",
  Continuous = "continuous",
  EvenPage = "evenPage",
  OddPage = "oddPage",
}

/**
 * Section type.
 * @see ECMA-376 Part 1, §17.6.18 CT_SectType
 */
export interface CT_SectType {
  val?: ST_SectionMark;
}

/**
 * Page orientation.
 * @see ECMA-376 Part 1, §17.18.64 ST_PageOrientation
 */
export enum ST_PageOrientation {
  Portrait = "portrait",
  Landscape = "landscape",
}

/**
 * Page size.
 * @see ECMA-376 Part 1, §17.6.13 CT_PageSz
 */
export interface CT_PageSz {
  w?: ST_TwipsMeasure;
  h?: ST_TwipsMeasure;
  orient?: ST_PageOrientation;
  code?: ST_DecimalNumber;
}

/**
 * Page margins.
 * @see ECMA-376 Part 1, §17.6.11 CT_PageMar
 */
export interface CT_PageMar {
  top: ST_SignedTwipsMeasure;
  right: ST_TwipsMeasure;
  bottom: ST_SignedTwipsMeasure;
  left: ST_TwipsMeasure;
  header: ST_TwipsMeasure;
  footer: ST_TwipsMeasure;
  gutter: ST_TwipsMeasure;
}

/**
 * Paper source.
 * @see ECMA-376 Part 1, §17.6.12 CT_PaperSource
 */
export interface CT_PaperSource {
  first?: ST_DecimalNumber;
  other?: ST_DecimalNumber;
}

/**
 * Page border z-order.
 * @see ECMA-376 Part 1, §17.18.61 ST_PageBorderZOrder
 */
export enum ST_PageBorderZOrder {
  Front = "front",
  Back = "back",
}

/**
 * Page border display.
 * @see ECMA-376 Part 1, §17.18.59 ST_PageBorderDisplay
 */
export enum ST_PageBorderDisplay {
  AllPages = "allPages",
  FirstPage = "firstPage",
  NotFirstPage = "notFirstPage",
}

/**
 * Page border offset.
 * @see ECMA-376 Part 1, §17.18.60 ST_PageBorderOffset
 */
export enum ST_PageBorderOffset {
  Page = "page",
  Text = "text",
}

/**
 * Page border.
 * @see ECMA-376 Part 1, §17.6.16 CT_PageBorder
 */
export interface CT_PageBorder extends CT_Border {
  id?: ST_RelationshipId; // r:id
}

/**
 * Bottom page border.
 * @see ECMA-376 Part 1, §17.6.2 CT_BottomPageBorder
 */
export interface CT_BottomPageBorder extends CT_PageBorder {
  bottomLeft?: ST_RelationshipId; // r:bottomLeft
  bottomRight?: ST_RelationshipId; // r:bottomRight
}

/**
 * Top page border.
 * @see ECMA-376 Part 1, §17.6.21 CT_TopPageBorder
 */
export interface CT_TopPageBorder extends CT_PageBorder {
  topLeft?: ST_RelationshipId; // r:topLeft
  topRight?: ST_RelationshipId; // r:topRight
}

/**
 * Page borders.
 * @see ECMA-376 Part 1, §17.6.10 CT_PageBorders
 */
export interface CT_PageBorders {
  top?: CT_TopPageBorder;
  left?: CT_PageBorder;
  bottom?: CT_BottomPageBorder;
  right?: CT_PageBorder;
  zOrder?: ST_PageBorderZOrder;
  display?: ST_PageBorderDisplay;
  offsetFrom?: ST_PageBorderOffset;
}

/**
 * Number format.
 * @see ECMA-376 Part 1, §17.18.59 ST_NumberFormat
 */
export enum ST_NumberFormat {
  Decimal = "decimal",
  UpperRoman = "upperRoman",
  LowerRoman = "lowerRoman",
  UpperLetter = "upperLetter",
  LowerLetter = "lowerLetter",
  Ordinal = "ordinal",
  CardinalText = "cardinalText",
  OrdinalText = "ordinalText",
  Hex = "hex",
  Chicago = "chicago",
  IdeographDigital = "ideographDigital",
  JapaneseCounting = "japaneseCounting",
  Aiueo = "aiueo",
  Iroha = "iroha",
  DecimalFullWidth = "decimalFullWidth",
  DecimalHalfWidth = "decimalHalfWidth",
  JapaneseLegal = "japaneseLegal",
  JapaneseDigitalTenThousand = "japaneseDigitalTenThousand",
  DecimalEnclosedCircle = "decimalEnclosedCircle",
  DecimalFullWidth2 = "decimalFullWidth2",
  AiueoFullWidth = "aiueoFullWidth",
  IrohaFullWidth = "irohaFullWidth",
  DecimalZero = "decimalZero",
  Bullet = "bullet",
  Ganada = "ganada",
  Chosung = "chosung",
  DecimalEnclosedFullstop = "decimalEnclosedFullstop",
  DecimalEnclosedParen = "decimalEnclosedParen",
  DecimalEnclosedCircleChinese = "decimalEnclosedCircleChinese",
  IdeographEnclosedCircle = "ideographEnclosedCircle",
  IdeographTraditional = "ideographTraditional",
  IdeographZodiac = "ideographZodiac",
  IdeographZodiacTraditional = "ideographZodiacTraditional",
  TaiwaneseCounting = "taiwaneseCounting",
  IdeographLegalTraditional = "ideographLegalTraditional",
  TaiwaneseCountingThousand = "taiwaneseCountingThousand",
  TaiwaneseDigital = "taiwaneseDigital",
  ChineseCounting = "chineseCounting",
  ChineseLegalSimplified = "chineseLegalSimplified",
  ChineseCountingThousand = "chineseCountingThousand",
  KoreanDigital = "koreanDigital",
  KoreanCounting = "koreanCounting",
  KoreanLegal = "koreanLegal",
  KoreanDigital2 = "koreanDigital2",
  VietnameseCounting = "vietnameseCounting",
  RussianLower = "russianLower",
  RussianUpper = "russianUpper",
  None = "none",
  NumberInDash = "numberInDash",
  Hebrew1 = "hebrew1",
  Hebrew2 = "hebrew2",
  ArabicAlpha = "arabicAlpha",
  ArabicAbjad = "arabicAbjad",
  HindiVowels = "hindiVowels",
  HindiConsonants = "hindiConsonants",
  HindiNumbers = "hindiNumbers",
  HindiCounting = "hindiCounting",
  ThaiLetters = "thaiLetters",
  ThaiNumbers = "thaiNumbers",
  ThaiCounting = "thaiCounting",
  BahtText = "bahtText",
  DollarText = "dollarText",
  Custom = "custom",
}

/**
 * Chapter separator.
 * @see ECMA-376 Part 1, §17.18.7 ST_ChapterSep
 */
export enum ST_ChapterSep {
  Hyphen = "hyphen",
  Period = "period",
  Colon = "colon",
  EmDash = "emDash",
  EnDash = "enDash",
}

/**
 * Page numbering.
 * @see ECMA-376 Part 1, §17.6.12 CT_PageNumber
 */
export interface CT_PageNumber {
  fmt?: ST_NumberFormat;
  start?: ST_DecimalNumber;
  chapStyle?: ST_DecimalNumber;
  chapSep?: ST_ChapterSep;
}

/**
 * Line numbering restart.
 * @see ECMA-376 Part 1, §17.18.47 ST_LineNumberRestart
 */
export enum ST_LineNumberRestart {
  NewPage = "newPage",
  NewSection = "newSection",
  Continuous = "continuous",
}

/**
 * Line numbering.
 * @see ECMA-376 Part 1, §17.6.8 CT_LineNumber
 */
export interface CT_LineNumber {
  countBy?: ST_DecimalNumber;
  start?: ST_DecimalNumber;
  distance?: ST_TwipsMeasure;
  restart?: ST_LineNumberRestart;
}

/**
 * Column definition.
 * @see ECMA-376 Part 1, §17.6.4 CT_Column
 */
export interface CT_Column {
  w?: ST_TwipsMeasure;
  space?: ST_TwipsMeasure;
}

/**
 * Document columns.
 * @see ECMA-376 Part 1, §17.6.4 CT_Columns
 */
export interface CT_Columns {
  col?: CT_Column[];
  equalWidth?: ST_OnOff;
  space?: ST_TwipsMeasure;
  num?: ST_DecimalNumber;
  sep?: ST_OnOff;
}

/**
 * Vertical justification.
 * @see ECMA-376 Part 1, §17.18.101 ST_VerticalJc
 */
export enum ST_VerticalJc {
  Top = "top",
  Center = "center",
  Both = "both",
  Bottom = "bottom",
}

/**
 * Vertical justification.
 * @see ECMA-376 Part 1, §17.6.23 CT_VerticalJc
 */
export interface CT_VerticalJc {
  val: ST_VerticalJc;
}

/**
 * Document grid.
 * @see ECMA-376 Part 1, §17.18.14 ST_DocGrid
 */
export enum ST_DocGrid {
  Default = "default",
  Lines = "lines",
  LinesAndChars = "linesAndChars",
  SnapToChars = "snapToChars",
}

/**
 * Document grid.
 * @see ECMA-376 Part 1, §17.6.5 CT_DocGrid
 */
export interface CT_DocGrid {
  type?: ST_DocGrid;
  linePitch?: ST_DecimalNumber;
  charSpace?: ST_DecimalNumber;
}

/**
 * Header/footer type.
 * @see ECMA-376 Part 1, §17.18.38 ST_HdrFtr
 */
export enum ST_HdrFtr {
  Even = "even",
  Default = "default",
  First = "first",
}

/**
 * Section properties attributes.
 * @see ECMA-376 Part 1, §17.6.19 AG_SectPrAttributes
 */
export interface AG_SectPrAttributes {
  rsidRPr?: ST_LongHexNumber;
  rsidDel?: ST_LongHexNumber;
  rsidR?: ST_LongHexNumber;
  rsidSect?: ST_LongHexNumber;
}

/**
 * Base section properties.
 * @see ECMA-376 Part 1, §17.6.17 CT_SectPrBase
 */
export interface CT_SectPrBase extends AG_SectPrAttributes {
  // EG_SectPrContents?: any;
}

/**
 * Section properties.
 * @see ECMA-376 Part 1, §17.6.17 CT_SectPr
 */
export interface CT_SectPr extends CT_SectPrBase {
  // EG_HdrFtrReferences?: any[];
  // EG_SectPrContents?: any;
  sectPrChange?: any; // CT_SectPrChange
}