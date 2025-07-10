// coordinate-types.ts
// Basic coordinate and measurement types for DrawingML

import type { ST_UniversalMeasure } from "../shared-types";

// Coordinate types
export type ST_Coordinate = ST_CoordinateUnqualified | ST_UniversalMeasure;
export type ST_CoordinateUnqualified = number; // xsd:long, minInclusive -27273042329600, maxInclusive 27273042316900
export type ST_Coordinate32 = ST_Coordinate32Unqualified | ST_UniversalMeasure;
export type ST_Coordinate32Unqualified = number; // xsd:int
export type ST_PositiveCoordinate = number; // xsd:long, minInclusive 0, maxInclusive 27273042316900
export type ST_PositiveCoordinate32 = number; // ST_Coordinate32Unqualified, minInclusive 0

// Angle types
export type ST_Angle = number; // xsd:int
export type ST_FixedAngle = number; // ST_Angle, minExclusive -5400000, maxExclusive 5400000
export type ST_PositiveFixedAngle = number; // ST_Angle, minInclusive 0, maxExclusive 21600000

// Geometry guide types
export type ST_GeomGuideName = string; // xsd:token
export type ST_GeomGuideFormula = string; // xsd:string
export type ST_AdjCoordinate = ST_Coordinate | ST_GeomGuideName;
export type ST_AdjAngle = ST_Angle | ST_GeomGuideName;

// Drawing element ID
export type ST_DrawingElementId = number; // xsd:unsignedInt

// Point and size interfaces
export interface CT_Point2D {
  x: ST_Coordinate;
  y: ST_Coordinate;
}

export interface CT_PositiveSize2D {
  cx: ST_PositiveCoordinate;
  cy: ST_PositiveCoordinate;
}

export interface CT_Point3D {
  x: ST_Coordinate;
  y: ST_Coordinate;
  z: ST_Coordinate;
}

// Ratio for scaling
export interface CT_Ratio {
  n: number; // xsd:long
  d: number; // xsd:long
}

// Adjusted point for geometry
export interface CT_AdjPoint2D {
  x: ST_AdjCoordinate;
  y: ST_AdjCoordinate;
}

// Text point
export interface CT_TextPoint {
  val: number; // xsd:int
}

// Connection
export interface CT_Connection {
  id: ST_DrawingElementId;
  idx: number; // xsd:unsignedInt
}
