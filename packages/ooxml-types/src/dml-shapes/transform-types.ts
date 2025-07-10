// transform-types.ts
// Transform and scale types for DrawingML

import type { ST_Percentage, ST_PositiveFixedPercentage } from "../shared-types";
import type {
  ST_Angle,
  ST_Coordinate,
  ST_PositiveCoordinate,
  ST_FixedAngle,
  CT_Point2D,
  CT_PositiveSize2D,
  CT_Ratio,
} from "./coordinate-types";

// Scale 2D
export interface CT_Scale2D {
  sx: CT_Ratio;
  sy: CT_Ratio;
}

// Transform 2D
export interface CT_Transform2D {
  off?: CT_Point2D;
  ext?: CT_PositiveSize2D;
  rot?: ST_Angle;
  flipH?: boolean;
  flipV?: boolean;
}

// Group transform 2D
export interface CT_GroupTransform2D {
  off?: CT_Point2D;
  ext?: CT_PositiveSize2D;
  chOff?: CT_Point2D;
  chExt?: CT_PositiveSize2D;
  rot?: ST_Angle;
  flipH?: boolean;
  flipV?: boolean;
}

// Relative rectangle
export interface CT_RelativeRect {
  l?: ST_Percentage;
  t?: ST_Percentage;
  r?: ST_Percentage;
  b?: ST_Percentage;
}

// Transform effect
export interface CT_TransformEffect {
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  kx?: ST_FixedAngle;
  ky?: ST_FixedAngle;
  tx?: ST_Coordinate;
  ty?: ST_Coordinate;
}

// Relative offset effect
export interface CT_RelativeOffsetEffect {
  tx?: ST_Percentage;
  ty?: ST_Percentage;
}

// Path shade properties
export interface CT_PathShadeProperties {
  fillToRect?: CT_RelativeRect;
  path?: ST_PathShadeType;
}

// Stretch info properties
export interface CT_StretchInfoProperties {
  fillRect?: CT_RelativeRect;
}

// Path shade type enum
export enum ST_PathShadeType {
  Shape = "shape",
  Circle = "circle",
  Rect = "rect",
}

// Rectangle alignment enum
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
