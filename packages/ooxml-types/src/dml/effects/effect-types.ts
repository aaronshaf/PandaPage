/**
 * DrawingML Effect Types
 * @see ECMA-376 Part 1, §20.1.8 (Effects)
 */

import type { ST_Guid, ST_String } from "../../shared/common-types";
import type { ST_Percentage, ST_PositivePercentage } from "../../shared/measurement-types";

/**
 * Effect style item.
 * @see ECMA-376 Part 1, §20.1.4.1.18 CT_EffectStyleItem
 */
export interface CT_EffectStyleItem {
  effectLst?: CT_EffectList;
  effectDag?: CT_EffectContainer;
  scene3d?: any; // CT_Scene3D placeholder
  sp3d?: any; // CT_Shape3D placeholder
}

/**
 * Effect style list.
 * @see ECMA-376 Part 1, §20.1.4.1.17 CT_EffectStyleList
 */
export interface CT_EffectStyleList {
  effectStyle?: CT_EffectStyleItem[];
}

/**
 * Effect reference.
 * @see ECMA-376 Part 1, §20.1.8.19 CT_EffectReference
 */
export interface CT_EffectReference {
  ref: ST_Guid;
}

/**
 * Effect container.
 * @see ECMA-376 Part 1, §20.1.8.18 CT_EffectContainer
 */
export interface CT_EffectContainer {
  cont?: CT_EffectContainer[];
  effect?: any[]; // Placeholder for effect elements
  type?: ST_EffectContainerType;
  name?: ST_String;
}

/**
 * Effect container types.
 * @see ECMA-376 Part 1, §20.1.10.21 ST_EffectContainerType
 */
export enum ST_EffectContainerType {
  Sib = "sib",
  Tree = "tree",
}

/**
 * Effect list.
 * @see ECMA-376 Part 1, §20.1.8.26 CT_EffectList
 */
export interface CT_EffectList {
  blur?: CT_BlurEffect;
  fillOverlay?: CT_FillOverlayEffect;
  glow?: CT_GlowEffect;
  innerShdw?: CT_InnerShadowEffect;
  outerShdw?: CT_OuterShadowEffect;
  prstShdw?: CT_PresetShadowEffect;
  reflection?: CT_ReflectionEffect;
  softEdge?: CT_SoftEdgesEffect;
}

/**
 * Effect properties group.
 * Will be expanded with specific effect types.
 */
export interface CT_EffectProperties {
  effectLst?: CT_EffectList;
  effectDag?: CT_EffectContainer;
}

/**
 * Blur effect.
 * @see ECMA-376 Part 1, §20.1.8.15 CT_BlurEffect
 */
export interface CT_BlurEffect {
  rad?: number; // ST_PositiveCoordinate
  grow?: boolean;
}

/**
 * Fill overlay effect.
 * @see ECMA-376 Part 1, §20.1.8.30 CT_FillOverlayEffect
 */
export interface CT_FillOverlayEffect {
  fillProperties?: any; // Placeholder for EG_FillProperties
  blend: ST_BlendMode;
}

/**
 * Glow effect.
 * @see ECMA-376 Part 1, §20.1.8.32 CT_GlowEffect
 */
export interface CT_GlowEffect {
  color?: any; // Placeholder for EG_ColorChoice
  rad?: number; // ST_PositiveCoordinate
}

/**
 * Inner shadow effect.
 * @see ECMA-376 Part 1, §20.1.8.40 CT_InnerShadowEffect
 */
export interface CT_InnerShadowEffect {
  color?: any; // Placeholder for EG_ColorChoice
  blurRad?: number; // ST_PositiveCoordinate
  dist?: number; // ST_PositiveCoordinate
  dir?: number; // ST_PositiveFixedAngle
}

/**
 * Outer shadow effect.
 * @see ECMA-376 Part 1, §20.1.8.53 CT_OuterShadowEffect
 */
export interface CT_OuterShadowEffect {
  color?: any; // Placeholder for EG_ColorChoice
  blurRad?: number; // ST_PositiveCoordinate
  dist?: number; // ST_PositiveCoordinate
  dir?: number; // ST_PositiveFixedAngle
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  kx?: number; // ST_FixedAngle
  ky?: number; // ST_FixedAngle
  algn?: ST_RectAlignment;
  rotWithShape?: boolean;
}

/**
 * Preset shadow effect.
 * @see ECMA-376 Part 1, §20.1.8.54 CT_PresetShadowEffect
 */
export interface CT_PresetShadowEffect {
  color?: any; // Placeholder for EG_ColorChoice
  prst: ST_PresetShadowVal;
  dist?: number; // ST_PositiveCoordinate
  dir?: number; // ST_PositiveFixedAngle
}

/**
 * Reflection effect.
 * @see ECMA-376 Part 1, §20.1.8.55 CT_ReflectionEffect
 */
export interface CT_ReflectionEffect {
  blurRad?: number; // ST_PositiveCoordinate
  stA?: ST_PositivePercentage;
  stPos?: ST_PositivePercentage;
  endA?: ST_PositivePercentage;
  endPos?: ST_PositivePercentage;
  dist?: number; // ST_PositiveCoordinate
  dir?: number; // ST_PositiveFixedAngle
  fadeDir?: number; // ST_PositiveFixedAngle
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  kx?: number; // ST_FixedAngle
  ky?: number; // ST_FixedAngle
  algn?: ST_RectAlignment;
  rotWithShape?: boolean;
}

/**
 * Soft edges effect.
 * @see ECMA-376 Part 1, §20.1.8.57 CT_SoftEdgesEffect
 */
export interface CT_SoftEdgesEffect {
  rad: number; // ST_PositiveCoordinate
}

/**
 * Blend modes.
 * @see ECMA-376 Part 1, §20.1.10.11 ST_BlendMode
 */
export enum ST_BlendMode {
  Over = "over",
  Mult = "mult",
  Screen = "screen",
  Darken = "darken",
  Lighten = "lighten",
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
 * Preset shadow values.
 * @see ECMA-376 Part 1, §20.1.10.49 ST_PresetShadowVal
 */
export enum ST_PresetShadowVal {
  Shdw1 = "shdw1",
  Shdw2 = "shdw2",
  Shdw3 = "shdw3",
  Shdw4 = "shdw4",
  Shdw5 = "shdw5",
  Shdw6 = "shdw6",
  Shdw7 = "shdw7",
  Shdw8 = "shdw8",
  Shdw9 = "shdw9",
  Shdw10 = "shdw10",
  Shdw11 = "shdw11",
  Shdw12 = "shdw12",
  Shdw13 = "shdw13",
  Shdw14 = "shdw14",
  Shdw15 = "shdw15",
  Shdw16 = "shdw16",
  Shdw17 = "shdw17",
  Shdw18 = "shdw18",
  Shdw19 = "shdw19",
  Shdw20 = "shdw20",
}
