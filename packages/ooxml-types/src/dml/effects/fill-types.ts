/**
 * DrawingML Fill Types
 * @see ECMA-376 Part 1, §20.1.8 (Fills)
 */

import type { ST_Percentage, ST_PositivePercentage, ST_PositiveFixedPercentage } from '../../shared/measurement-types';
import type { ST_Coordinate32, ST_PositiveCoordinate32, CT_Ratio } from '../core/coordinate-types';
import type { CT_OfficeArtExtensionList } from '../core/extension-types';

/**
 * Fill style list.
 * @see ECMA-376 Part 1, §20.1.4.1.13 CT_FillStyleList
 */
export interface CT_FillStyleList {
  // EG_FillProperties is a group
  fillProperties: any[]; // Placeholder
}

/**
 * Fill properties.
 * Placeholder for fill properties group.
 * @see ECMA-376 Part 1, §20.1.8.28 CT_FillProperties
 */
export interface CT_FillProperties {
  noFill?: CT_NoFillProperties;
  solidFill?: CT_SolidColorFillProperties;
  gradFill?: CT_GradientFillProperties;
  blipFill?: CT_BlipFillProperties;
  pattFill?: CT_PatternFillProperties;
  grpFill?: CT_GroupFillProperties;
}

/**
 * No fill properties.
 * @see ECMA-376 Part 1, §20.1.8.44 CT_NoFillProperties
 */
export type CT_NoFillProperties = Record<string, never>;

/**
 * Solid color fill properties.
 * @see ECMA-376 Part 1, §20.1.8.54 CT_SolidColorFillProperties
 */
export interface CT_SolidColorFillProperties {
  color?: any; // Placeholder for EG_ColorChoice
}

/**
 * Gradient fill properties.
 * @see ECMA-376 Part 1, §20.1.8.33 CT_GradientFillProperties
 */
export interface CT_GradientFillProperties {
  gsLst?: CT_GradientStopList;
  lin?: CT_LinearShadeProperties;
  path?: CT_PathShadeProperties;
  tileRect?: CT_RelativeRect;
  flip?: ST_TileFlipMode;
  rotWithShape?: boolean;
}

/**
 * Linear shade properties.
 * @see ECMA-376 Part 1, §20.1.8.41 CT_LinearShadeProperties
 */
export interface CT_LinearShadeProperties {
  ang?: number; // ST_PositiveFixedAngle
  scaled?: boolean;
}

/**
 * Path shade properties.
 * @see ECMA-376 Part 1, §20.1.8.46 CT_PathShadeProperties
 */
export interface CT_PathShadeProperties {
  fillToRect?: CT_RelativeRect;
  path?: ST_PathShadeType;
}

/**
 * Path shade types.
 * @see ECMA-376 Part 1, §20.1.10.41 ST_PathShadeType
 */
export enum ST_PathShadeType {
  Shape = "shape",
  Circle = "circle",
  Rect = "rect",
}

/**
 * Gradient stop list.
 * @see ECMA-376 Part 1, §20.1.8.37 CT_GradientStopList
 */
export interface CT_GradientStopList {
  gs: CT_GradientStop[];
}

/**
 * Gradient stop.
 * @see ECMA-376 Part 1, §20.1.8.36 CT_GradientStop
 */
export interface CT_GradientStop {
  color?: any; // Placeholder for EG_ColorChoice
  pos: ST_PositiveFixedPercentage;
}

/**
 * Relative rectangle.
 * @see ECMA-376 Part 1, §20.1.8.56 CT_RelativeRect
 */
export interface CT_RelativeRect {
  l?: ST_Percentage;
  t?: ST_Percentage;
  r?: ST_Percentage;
  b?: ST_Percentage;
}

/**
 * Blip fill properties.
 * @see ECMA-376 Part 1, §20.1.8.14 CT_BlipFillProperties
 */
export interface CT_BlipFillProperties {
  blip?: CT_Blip;
  srcRect?: CT_RelativeRect;
  tile?: CT_TileInfoProperties;
  stretch?: CT_StretchInfoProperties;
  dpi?: number; // xsd:unsignedInt
  rotWithShape?: boolean;
}

/**
 * Blip (Binary Large Image or Picture).
 * @see ECMA-376 Part 1, §20.1.8.13 CT_Blip
 */
export interface CT_Blip {
  alphaBiLevel?: CT_AlphaBiLevelEffect;
  alphaCeiling?: CT_AlphaCeilingEffect;
  alphaFloor?: CT_AlphaFloorEffect;
  alphaInv?: CT_AlphaInverseEffect;
  alphaMod?: CT_AlphaModulateEffect;
  alphaModFix?: CT_AlphaModulateFixedEffect;
  alphaRepl?: CT_AlphaReplaceEffect;
  biLevel?: CT_BiLevelEffect;
  blur?: CT_BlurEffect;
  clrChange?: CT_ColorChangeEffect;
  clrRepl?: CT_ColorReplaceEffect;
  duotone?: CT_DuotoneEffect;
  fillOverlay?: CT_FillOverlayEffect;
  grayscl?: CT_GrayscaleEffect;
  hsl?: CT_HSLEffect;
  lum?: CT_LuminanceEffect;
  tint?: CT_TintEffect;
  extLst?: CT_OfficeArtExtensionList;
  embed?: string; // ST_RelationshipId
  link?: string; // ST_RelationshipId
  cstate?: ST_BlipCompression;
}

/**
 * Blip compression.
 * @see ECMA-376 Part 1, §20.1.10.5 ST_BlipCompression
 */
export enum ST_BlipCompression {
  Email = "email",
  Screen = "screen",
  Print = "print",
  HqPrint = "hqprint",
  None = "none",
}

/**
 * Tile info properties.
 * @see ECMA-376 Part 1, §20.1.8.58 CT_TileInfoProperties
 */
export interface CT_TileInfoProperties {
  tx?: ST_Coordinate32;
  ty?: ST_Coordinate32;
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  flip?: ST_TileFlipMode;
  algn?: ST_RectAlignment;
}

/**
 * Tile flip modes.
 * @see ECMA-376 Part 1, §20.1.10.86 ST_TileFlipMode
 */
export enum ST_TileFlipMode {
  None = "none",
  X = "x",
  Y = "y",
  Xy = "xy",
}

/**
 * Rectangle alignment.
 * @see ECMA-376 Part 1, §20.1.10.53 ST_RectAlignment
 */
export enum ST_RectAlignment {
  Tl = "tl",
  T = "t",
  Tr = "tr",
  L = "l",
  Ctr = "ctr",
  R = "r",
  Bl = "bl",
  B = "b",
  Br = "br",
}

/**
 * Stretch info properties.
 * @see ECMA-376 Part 1, §20.1.8.56 CT_StretchInfoProperties
 */
export interface CT_StretchInfoProperties {
  fillRect?: CT_RelativeRect;
}

/**
 * Pattern fill properties.
 * @see ECMA-376 Part 1, §20.1.8.47 CT_PatternFillProperties
 */
export interface CT_PatternFillProperties {
  fgClr?: any; // Placeholder for EG_ColorChoice
  bgClr?: any; // Placeholder for EG_ColorChoice
  prst?: ST_PresetPatternVal;
}

/**
 * Preset pattern values.
 * @see ECMA-376 Part 1, §20.1.10.48 ST_PresetPatternVal
 */
export enum ST_PresetPatternVal {
  Pct5 = "pct5",
  Pct10 = "pct10",
  Pct20 = "pct20",
  Pct25 = "pct25",
  Pct30 = "pct30",
  Pct40 = "pct40",
  Pct50 = "pct50",
  Pct60 = "pct60",
  Pct70 = "pct70",
  Pct75 = "pct75",
  Pct80 = "pct80",
  Pct90 = "pct90",
  Horz = "horz",
  Vert = "vert",
  LtHorz = "ltHorz",
  LtVert = "ltVert",
  DkHorz = "dkHorz",
  DkVert = "dkVert",
  NarHorz = "narHorz",
  NarVert = "narVert",
  DashHorz = "dashHorz",
  DashVert = "dashVert",
  Cross = "cross",
  DnDiag = "dnDiag",
  UpDiag = "upDiag",
  LtDnDiag = "ltDnDiag",
  LtUpDiag = "ltUpDiag",
  DkDnDiag = "dkDnDiag",
  DkUpDiag = "dkUpDiag",
  WdDnDiag = "wdDnDiag",
  WdUpDiag = "wdUpDiag",
  DashDnDiag = "dashDnDiag",
  DashUpDiag = "dashUpDiag",
  DiagCross = "diagCross",
  SmCheck = "smCheck",
  LgCheck = "lgCheck",
  SmGrid = "smGrid",
  LgGrid = "lgGrid",
  DotGrid = "dotGrid",
  SmConfetti = "smConfetti",
  LgConfetti = "lgConfetti",
  HorzBrick = "horzBrick",
  DiagBrick = "diagBrick",
  SolidDmnd = "solidDmnd",
  OpenDmnd = "openDmnd",
  DotDmnd = "dotDmnd",
  Plaid = "plaid",
  Sphere = "sphere",
  Weave = "weave",
  Divot = "divot",
  Shingle = "shingle",
  Wave = "wave",
  Trellis = "trellis",
  ZigZag = "zigZag",
}

/**
 * Group fill properties.
 * @see ECMA-376 Part 1, §20.1.8.35 CT_GroupFillProperties
 */
export type CT_GroupFillProperties = Record<string, never>;

// Placeholder types for effects (will be defined in effect-types.ts)
export type CT_AlphaBiLevelEffect = any;
export type CT_AlphaCeilingEffect = any;
export type CT_AlphaFloorEffect = any;
export type CT_AlphaInverseEffect = any;
export type CT_AlphaModulateEffect = any;
export type CT_AlphaModulateFixedEffect = any;
export type CT_AlphaReplaceEffect = any;
export type CT_BiLevelEffect = any;
export type CT_BlurEffect = any;
export type CT_ColorChangeEffect = any;
export type CT_ColorReplaceEffect = any;
export type CT_DuotoneEffect = any;
export type CT_FillOverlayEffect = any;
export type CT_GrayscaleEffect = any;
export type CT_HSLEffect = any;
export type CT_LuminanceEffect = any;
export type CT_TintEffect = any;