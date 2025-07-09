/**
 * DrawingML Line Types
 * @see ECMA-376 Part 1, §20.1.8 (Lines)
 */

import type { ST_Coordinate32 } from '../core/coordinate-types';
import type { ST_Percentage } from '../../shared/measurement-types';
import type { CT_OfficeArtExtensionList } from '../core/extension-types';
import type { 
  CT_FillProperties, 
  CT_SolidColorFillProperties, 
  CT_GradientFillProperties, 
  CT_PatternFillProperties,
  CT_NoFillProperties 
} from './fill-types';

/**
 * Line style list.
 * @see ECMA-376 Part 1, §20.1.4.1.21 CT_LineStyleList
 */
export interface CT_LineStyleList {
  ln?: CT_LineProperties[];
}

/**
 * Line properties.
 * @see ECMA-376 Part 1, §20.1.2.2.24 CT_LineProperties
 */
export interface CT_LineProperties {
  noFill?: CT_NoFillProperties;
  solidFill?: CT_SolidColorFillProperties;
  gradFill?: CT_GradientFillProperties;
  pattFill?: CT_PatternFillProperties;
  prstDash?: CT_PresetLineDashProperties;
  custDash?: CT_DashStopList;
  round?: CT_LineJoinRound;
  bevel?: CT_LineJoinBevel;
  miter?: CT_LineJoinMiterProperties;
  headEnd?: CT_LineEndProperties;
  tailEnd?: CT_LineEndProperties;
  extLst?: CT_OfficeArtExtensionList;
  w?: ST_Coordinate32;
  cap?: ST_LineCap;
  cmpd?: ST_CompoundLine;
  algn?: ST_PenAlignment;
}


/**
 * Preset line dash properties.
 * @see ECMA-376 Part 1, §20.1.8.48 CT_PresetLineDashProperties
 */
export interface CT_PresetLineDashProperties {
  val?: ST_PresetLineDashVal;
}

/**
 * Preset line dash values.
 * @see ECMA-376 Part 1, §20.1.10.48 ST_PresetLineDashVal
 */
export enum ST_PresetLineDashVal {
  Solid = "solid",
  Dot = "dot",
  Dash = "dash",
  LgDash = "lgDash",
  DashDot = "dashDot",
  LgDashDot = "lgDashDot",
  LgDashDotDot = "lgDashDotDot",
  SysDash = "sysDash",
  SysDot = "sysDot",
  SysDashDot = "sysDashDot",
  SysDashDotDot = "sysDashDotDot",
}

/**
 * Custom dash stop list.
 * @see ECMA-376 Part 1, §20.1.8.16 CT_DashStopList
 */
export interface CT_DashStopList {
  ds?: CT_DashStop[];
}

/**
 * Dash stop.
 * @see ECMA-376 Part 1, §20.1.8.15 CT_DashStop
 */
export interface CT_DashStop {
  d: ST_Percentage;
  sp: ST_Percentage;
}

/**
 * Line join round.
 * @see ECMA-376 Part 1, §20.1.8.42 CT_LineJoinRound
 */
export type CT_LineJoinRound = Record<string, never>;

/**
 * Line join bevel.
 * @see ECMA-376 Part 1, §20.1.8.41 CT_LineJoinBevel
 */
export type CT_LineJoinBevel = Record<string, never>;

/**
 * Line join miter properties.
 * @see ECMA-376 Part 1, §20.1.8.43 CT_LineJoinMiterProperties
 */
export interface CT_LineJoinMiterProperties {
  lim?: ST_Percentage;
}

/**
 * Line end properties.
 * @see ECMA-376 Part 1, §20.1.8.39 CT_LineEndProperties
 */
export interface CT_LineEndProperties {
  type?: ST_LineEndType;
  w?: ST_LineEndWidth;
  len?: ST_LineEndLength;
}

/**
 * Line end types.
 * @see ECMA-376 Part 1, §20.1.10.33 ST_LineEndType
 */
export enum ST_LineEndType {
  None = "none",
  Triangle = "triangle",
  Stealth = "stealth",
  Diamond = "diamond",
  Oval = "oval",
  Arrow = "arrow",
}

/**
 * Line end width.
 * @see ECMA-376 Part 1, §20.1.10.32 ST_LineEndWidth
 */
export enum ST_LineEndWidth {
  Sm = "sm",
  Med = "med",
  Lg = "lg",
}

/**
 * Line end length.
 * @see ECMA-376 Part 1, §20.1.10.31 ST_LineEndLength
 */
export enum ST_LineEndLength {
  Sm = "sm",
  Med = "med",
  Lg = "lg",
}

/**
 * Line cap values.
 * @see ECMA-376 Part 1, §20.1.10.30 ST_LineCap
 */
export enum ST_LineCap {
  Rnd = "rnd",
  Sq = "sq",
  Flat = "flat",
}

/**
 * Compound line types.
 * @see ECMA-376 Part 1, §20.1.10.15 ST_CompoundLine
 */
export enum ST_CompoundLine {
  Sng = "sng",
  Dbl = "dbl",
  ThickThin = "thickThin",
  ThinThick = "thinThick",
  Tri = "tri",
}

/**
 * Pen alignment.
 * @see ECMA-376 Part 1, §20.1.10.39 ST_PenAlignment
 */
export enum ST_PenAlignment {
  Ctr = "ctr",
  In = "in",
}