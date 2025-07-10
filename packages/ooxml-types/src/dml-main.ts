// dml-main.ts - Re-export all DrawingML types from modular files
import type { ST_RelationshipId, ST_Guid, ST_String, ST_Percentage } from "./shared-types";

// Re-export all types from modular files for backward compatibility
// First export base types that others depend on
export * from "./dml-media";

// Then export types from modules that don't have conflicts
export * from "./dml-animation";

// Export from dml-fonts
export * from "./dml-fonts";

// Selectively export from dml-colors to avoid conflicts
export type {
  // Color model types
  CT_ScRgbColor,
  CT_SRgbColor,
  CT_HslColor,
  CT_SystemColor,
  CT_SchemeColor,
  CT_PresetColor,
  ST_HexColorRGB,
  // Main color types
  EG_ColorChoice,
  CT_Color,
  CT_ColorMRU,
  CT_ColorScheme,
  CT_ColorMapping,
  CT_ColorMappingOverride,
  // Color transform types
  EG_ColorTransform,
  CT_ComplementTransform,
  CT_InverseTransform,
  CT_GrayscaleTransform,
  CT_GammaTransform,
  CT_InverseGammaTransform,
} from "./dml-colors";

// Re-export enums from original source to avoid issues with type-only re-exports
export { ST_SystemColorVal, ST_SchemeColorVal, ST_PresetColorVal } from "./dml/colors/color-models";
export { ST_BlackWhiteMode, ST_ColorSchemeIndex } from "./dml/colors/color-types";

// Export additional color types
export type {
  CT_CustomColor,
  CT_CustomColorList,
  CT_ColorChangeEffect,
  CT_ColorReplaceEffect,
} from "./dml-colors";

// Export from dml-shapes
export * from "./dml-shapes";

// Finally export from dml-effects, explicitly re-exporting conflicting types
export type {
  // Re-export everything except conflicting types
  CT_EffectList,
  CT_EffectContainer,
  CT_EffectReference,
  CT_EffectStyleItem,
  CT_EffectStyleList,
  CT_StyleMatrix,
  CT_BaseStyles,
  CT_Backdrop,
  ST_BevelPresetType,
  CT_Bevel,
  CT_Shape3D,
  CT_FlatText,
  CT_InnerShadowEffect,
  CT_OuterShadowEffect,
  CT_PresetShadowEffect,
  CT_ReflectionEffect,
  CT_RelativeOffsetEffect,
  CT_TransformEffect,
  CT_FillOverlayEffect,
  CT_GlowEffect,
  CT_PathShadeProperties,
  ST_PathShadeType,
  CT_SoftEdgesEffect,
  CT_StretchInfoProperties,
  CT_LineProperties,
  CT_FontCollection,
  CT_FontScheme,
  CT_FontReference,
  CT_StyleMatrixReference,
  CT_ShapeStyle,
  EG_FillProperties,
  CT_BlipFillProperties,
  // Types that need to be re-exported under their original names
  ST_PresetMaterialType,
} from "./dml-effects";

// Import commonly used types from extracted modules
import type { CT_OfficeArtExtensionList } from "./dml-media";

import type { EG_ColorChoice } from "./dml-colors";

import type { ST_Coordinate, ST_PositiveCoordinate, ST_Angle } from "./dml-shapes";

import type { CT_TextFont } from "./dml-fonts";

import type { EG_FillProperties, CT_EffectList } from "./dml-effects";

// Text-related enums and types not extracted to other modules
export enum ST_TextVerticalType {
  Horz = "horz",
  Vert = "vert",
  Vert270 = "vert270",
  WordArtVert = "wordArtVert",
  EaVert = "eaVert",
  Mongolian = "mongolianVert",
  WordArtVertRtl = "wordArtVertRtl",
}

export enum ST_TextAlignType {
  L = "l",
  Ctr = "ctr",
  R = "r",
  Just = "just",
  JustLow = "justLow",
  Dist = "dist",
  ThaiDist = "thaiDist",
}

export enum ST_TextUnderlineType {
  None = "none",
  Words = "words",
  Sng = "sng",
  Dbl = "dbl",
  Heavy = "heavy",
  Dotted = "dotted",
  DottedHeavy = "dottedHeavy",
  Dash = "dash",
  DashHeavy = "dashHeavy",
  DashLong = "dashLong",
  DashLongHeavy = "dashLongHeavy",
  DotDash = "dotDash",
  DotDashHeavy = "dotDashHeavy",
  DotDotDash = "dotDotDash",
  DotDotDashHeavy = "dotDotDashHeavy",
  Wavy = "wavy",
  WavyHeavy = "wavyHeavy",
  WavyDbl = "wavyDbl",
}

export enum ST_TextStrikeType {
  NoStrike = "noStrike",
  SngStrike = "sngStrike",
  DblStrike = "dblStrike",
}

export enum ST_TextCapsType {
  None = "none",
  Small = "small",
  All = "all",
}

export enum ST_TextTabAlignType {
  L = "l",
  Ctr = "ctr",
  R = "r",
  Dec = "dec",
}

export enum ST_TextWrappingType {
  None = "none",
  Square = "square",
}

export enum ST_TextColumnCount {
  Count1 = 1,
  Count2 = 2,
  Count3 = 3,
  Count4 = 4,
  Count5 = 5,
  Count6 = 6,
  Count7 = 7,
  Count8 = 8,
  Count9 = 9,
  Count10 = 10,
  Count11 = 11,
  Count12 = 12,
  Count13 = 13,
  Count14 = 14,
  Count15 = 15,
  Count16 = 16,
}

export enum ST_TextAnchoringType {
  T = "t",
  Ctr = "ctr",
  B = "b",
  Just = "just",
  Dist = "dist",
}

export enum ST_TextHorzOverflowType {
  Overflow = "overflow",
  Clip = "clip",
}

export enum ST_TextVertOverflowType {
  Overflow = "overflow",
  Ellipsis = "ellipsis",
  Clip = "clip",
}

// Text properties interfaces
export interface CT_TextUnderline {
  u?: { val?: ST_TextUnderlineType };
  uFill?: EG_FillProperties;
  uFillTx?: any; // Empty element
}

export interface CT_TextCharacterProperties {
  ln?: any; // CT_LineProperties
  noFill?: any; // Empty element
  solidFill?: any; // CT_SolidColorFillProperties
  gradFill?: any; // CT_GradientFillProperties
  blipFill?: any; // CT_BlipFillProperties
  pattFill?: any; // CT_PatternFillProperties
  grpFill?: any; // Empty element
  effectLst?: CT_EffectList;
  effectDag?: any; // CT_EffectContainer
  highlight?: EG_ColorChoice;
  uLnTx?: any; // Empty element
  uLn?: CT_TextUnderline;
  uFillTx?: any; // Empty element
  uFill?: EG_FillProperties;
  latin?: CT_TextFont;
  ea?: CT_TextFont;
  cs?: CT_TextFont;
  sym?: CT_TextFont;
  hlinkClick?: CT_Hyperlink;
  hlinkMouseOver?: CT_Hyperlink;
  rtl?: { val?: boolean };
  kumimoji?: { val?: boolean };
  lang?: { val?: ST_String };
  altLang?: { val?: ST_String };
  sz?: { val?: number }; // Text size in points * 100
  b?: { val?: boolean };
  i?: { val?: boolean };
  u?: { val?: ST_TextUnderlineType };
  strike?: { val?: ST_TextStrikeType };
  kern?: { val?: number };
  cap?: { val?: ST_TextCapsType };
  spc?: { val?: number };
  normalizeH?: { val?: boolean };
  baseline?: { val?: ST_Percentage };
  noProof?: { val?: boolean };
  dirty?: { val?: boolean };
  err?: { val?: boolean };
  smtClean?: { val?: boolean };
  smtId?: { val?: number };
  bmk?: { val?: ST_String };
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_TextTab {
  pos?: ST_Coordinate;
  algn?: ST_TextTabAlignType;
}

export interface CT_TextTabStop {
  tab?: CT_TextTab[];
}

export interface CT_TextLineBreak {
  rPr?: CT_TextCharacterProperties;
}

export interface CT_RegularTextRun {
  rPr?: CT_TextCharacterProperties;
  t: ST_String;
}

export interface CT_TextField {
  id: ST_Guid;
  type?: ST_String;
  rPr?: CT_TextCharacterProperties;
  pPr?: any; // CT_TextParagraphProperties
  t?: ST_String;
}

export type EG_TextRun = CT_RegularTextRun | CT_TextLineBreak | CT_TextField;

export interface CT_TextParagraphProperties {
  lnSpc?: any; // CT_TextSpacing
  spcBef?: any; // CT_TextSpacing
  spcAft?: any; // CT_TextSpacing
  buClrTx?: any; // Empty element
  buClr?: EG_ColorChoice;
  buSzTx?: any; // Empty element
  buSzPct?: { val?: ST_TextBulletSizePercent };
  buSzPts?: { val?: ST_TextBulletSizePoint };
  buFontTx?: any; // Empty element
  buFont?: CT_TextFont;
  buNone?: any; // Empty element
  buAutoNum?: { type: ST_TextAutonumberScheme; startAt?: number };
  buChar?: { char: ST_String };
  buBlip?: any; // CT_TextBlipBullet
  tabLst?: CT_TextTabStop;
  defRPr?: CT_TextCharacterProperties;
  extLst?: CT_OfficeArtExtensionList;
  marL?: ST_TextMargin;
  marR?: ST_TextMargin;
  lvl?: ST_TextIndentLevelType;
  indent?: ST_TextIndent;
  algn?: ST_TextAlignType;
  defTabSz?: ST_Coordinate;
  rtl?: boolean;
  eaLnBrk?: boolean;
  fontAlgn?: ST_TextFontAlignType;
  latinLnBrk?: boolean;
  hangingPunct?: boolean;
}

export interface CT_TextParagraph {
  pPr?: CT_TextParagraphProperties;
  r?: EG_TextRun[];
  br?: CT_TextLineBreak[];
  fld?: CT_TextField[];
  endParaRPr?: CT_TextCharacterProperties;
}

export interface CT_TextListStyle {
  defPPr?: CT_TextParagraphProperties;
  lvl1pPr?: CT_TextParagraphProperties;
  lvl2pPr?: CT_TextParagraphProperties;
  lvl3pPr?: CT_TextParagraphProperties;
  lvl4pPr?: CT_TextParagraphProperties;
  lvl5pPr?: CT_TextParagraphProperties;
  lvl6pPr?: CT_TextParagraphProperties;
  lvl7pPr?: CT_TextParagraphProperties;
  lvl8pPr?: CT_TextParagraphProperties;
  lvl9pPr?: CT_TextParagraphProperties;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_TextBodyProperties {
  rot?: ST_Angle;
  spcFirstLastPara?: boolean;
  vertOverflow?: ST_TextVertOverflowType;
  horzOverflow?: ST_TextHorzOverflowType;
  vert?: ST_TextVerticalType;
  wrap?: ST_TextWrappingType;
  lIns?: ST_Coordinate;
  tIns?: ST_Coordinate;
  rIns?: ST_Coordinate;
  bIns?: ST_Coordinate;
  numCol?: ST_TextColumnCount;
  spcCol?: ST_PositiveCoordinate;
  rtlCol?: boolean;
  fromWordArt?: boolean;
  anchor?: ST_TextAnchoringType;
  anchorCtr?: boolean;
  forceAA?: boolean;
  upright?: boolean;
  compatLnSpc?: boolean;
  prstTxWarp?: any; // CT_PresetTextShape
  noAutofit?: any; // Empty element
  normAutofit?: any; // Empty element
  spAutoFit?: any; // Empty element
  scene3d?: any; // CT_Scene3D
  sp3d?: any; // CT_Shape3D
  flatTx?: any; // CT_FlatText
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_TextBody {
  bodyPr: CT_TextBodyProperties;
  lstStyle?: CT_TextListStyle;
  p: CT_TextParagraph[];
}

// Hyperlink interface
export interface CT_Hyperlink {
  hlinkClick?: { "r:id"?: ST_RelationshipId };
  hlinkMouseOver?: { "r:id"?: ST_RelationshipId };
  tooltip?: ST_String;
  tgtFrame?: ST_String;
  invalidUrl?: ST_String;
  action?: ST_String;
  history?: boolean;
  highlightClick?: boolean;
  endSnd?: boolean;
  extLst?: CT_OfficeArtExtensionList;
}

// Additional required types
export enum ST_TextAutonumberScheme {
  AlphaLcParenBoth = "alphaLcParenBoth",
  AlphaUcParenBoth = "alphaUcParenBoth",
  AlphaLcParenR = "alphaLcParenR",
  AlphaUcParenR = "alphaUcParenR",
  AlphaLcPeriod = "alphaLcPeriod",
  AlphaUcPeriod = "alphaUcPeriod",
  ArabicParenBoth = "arabicParenBoth",
  ArabicParenR = "arabicParenR",
  ArabicPeriod = "arabicPeriod",
  ArabicPlain = "arabicPlain",
  RomanLcParenBoth = "romanLcParenBoth",
  RomanUcParenBoth = "romanUcParenBoth",
  RomanLcParenR = "romanLcParenR",
  RomanUcParenR = "romanUcParenR",
  RomanLcPeriod = "romanLcPeriod",
  RomanUcPeriod = "romanUcPeriod",
}

// Type aliases for convenience
export type ST_TextMargin = ST_Coordinate;
export type ST_TextIndentLevelType = number; // 0-8
export type ST_TextIndent = ST_Coordinate;
export type ST_TextFontAlignType = "auto" | "t" | "ctr" | "base" | "b";
export type ST_TextBulletSizePercent = ST_Percentage;
export type ST_TextBulletSizePoint = number; // 1-4000

// 3D Scene types
export interface CT_Point3D {
  x: ST_Coordinate;
  y: ST_Coordinate;
  z: ST_Coordinate;
}

export interface CT_Vector3D {
  dx: ST_Coordinate;
  dy: ST_Coordinate;
  dz: ST_Coordinate;
}

export interface CT_Camera {
  prst: string; // ST_PresetCameraType
  fov?: ST_Angle;
  zoom?: ST_Percentage;
  rot?: any; // CT_SphereCoords
}

export interface CT_LightRig {
  rig: string; // ST_LightRigType
  dir: string; // ST_LightRigDirection
  rot?: any; // CT_SphereCoords
}

export interface CT_Scene3D {
  camera: CT_Camera;
  lightRig: CT_LightRig;
  backdrop?: any; // CT_Backdrop
  extLst?: CT_OfficeArtExtensionList;
}

// Essential types that may be referenced
export type CT_Empty = Record<string, never>;
export type CT_NonVisualContentPartProperties = Record<string, never>;

// Additional types needed by other modules
export type EG_EffectProperties = any; // Placeholder for effect properties group
export interface CT_WholeE2oFormatting {
  ln?: any; // CT_LineProperties from dml-shapes
  effectLst?: CT_EffectList;
  effectDag?: any; // CT_EffectContainer
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_BackgroundFormatting {
  noFill?: CT_Empty;
  solidFill?: any; // CT_SolidColorFillProperties
  gradFill?: any; // CT_GradientFillProperties
  blipFill?: any; // CT_BlipFillProperties
  pattFill?: any; // CT_PatternFillProperties
  grpFill?: CT_Empty;
  effectLst?: CT_EffectList;
  effectDag?: any; // CT_EffectContainer
  extLst?: CT_OfficeArtExtensionList;
}
