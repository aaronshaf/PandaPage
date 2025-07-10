// line-properties.ts
// Line properties and styles for DrawingML

import type { ST_PositiveFixedPercentage } from '../shared-types';
import type { ST_PositiveCoordinate } from './coordinate-types';
import type { CT_OfficeArtExtensionList } from '../dml-media';
import type {
  CT_NoFillProperties,
  CT_SolidColorFillProperties,
  CT_GradientFillProperties,
  CT_PatternFillProperties
} from '../dml-effects';

// Line end type enum
export enum ST_LineEndType {
  None = "none",
  Arrow = "arrow",
  Oval = "oval",
  StealthArrow = "stealthArrow",
  Diamond = "diamond",
  Triangle = "triangle",
}

// Line end width enum
export enum ST_LineEndWidth {
  Sm = "sm",
  Med = "med",
  Lg = "lg",
}

// Line end length enum
export enum ST_LineEndLength {
  Sm = "sm",
  Med = "med",
  Lg = "lg",
}

// Line cap enum
export enum ST_LineCap {
  Rnd = "rnd",
  Sq = "sq",
  Flat = "flat",
}

// Compound line enum
export enum ST_CompoundLine {
  Sng = "sng",
  Dbl = "dbl",
  ThickThin = "thickThin",
  ThinThick = "thinThick",
  Tri = "tri",
}

// Pen alignment enum
export enum ST_PenAlignment {
  Ctr = "ctr",
  In = "in",
}

// Preset line dash value enum
export enum ST_PresetLineDashVal {
  Solid = "solid",
  Dot = "dot",
  Dash = "dash",
  LargeDash = "largeDash",
  DashDot = "dashDot",
  LargeDashDot = "largeDashDot",
  LargeDashDotDot = "largeDashDotDot",
  SystemDash = "sysDash",
  SystemDot = "sysDot",
  SystemDashDot = "sysDashDot",
  SystemDashDotDot = "sysDashDotDot",
}

// Line end properties
export interface CT_LineEndProperties {
  type?: ST_LineEndType;
  w?: ST_LineEndWidth;
  len?: ST_LineEndLength;
}

// Preset line dash properties
export interface CT_PresetLineDashProperties {
  val: ST_PresetLineDashVal;
}

// Custom dash stop
export interface CT_DashStop {
  d: ST_PositiveFixedPercentage;
  sp: ST_PositiveFixedPercentage;
}

// Custom dash properties
export interface CT_CustomDashProperties {
  ds?: CT_DashStop[];
}

// Round line cap properties
export type CT_RoundLineCapProperties = Record<string, never>

// Bevel line cap properties
export type CT_BevelLineCapProperties = Record<string, never>

// Miter limit properties
export interface CT_MiterLimitProperties {
  val?: ST_PositiveFixedPercentage;
}

// Line properties
export interface CT_LineProperties {
  noFill?: CT_NoFillProperties;
  solidFill?: CT_SolidColorFillProperties;
  gradFill?: CT_GradientFillProperties;
  pattFill?: CT_PatternFillProperties;
  prstDash?: CT_PresetLineDashProperties;
  custDash?: CT_CustomDashProperties;
  round?: CT_RoundLineCapProperties;
  bevel?: CT_BevelLineCapProperties;
  miter?: CT_MiterLimitProperties;
  headEnd?: CT_LineEndProperties;
  tailEnd?: CT_LineEndProperties;
  extLst?: CT_OfficeArtExtensionList;
  w?: ST_PositiveCoordinate;
  cap?: ST_LineCap;
  cmpd?: ST_CompoundLine;
  algn?: ST_PenAlignment;
}