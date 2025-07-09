/**
 * DrawingML Coordinate and Measurement Types
 * @see ECMA-376 Part 1, §20.1.10 (Simple Types)
 */

import type { ST_UniversalMeasure, ST_Percentage, ST_PositiveFixedPercentage, ST_FixedPercentage } from '../../shared/measurement-types';

/**
 * Coordinate type (EMUs or universal measure).
 * @see ECMA-376 Part 1, §20.1.10.16 ST_Coordinate
 */
export type ST_Coordinate = ST_CoordinateUnqualified | ST_UniversalMeasure;

/**
 * Unqualified coordinate in EMUs.
 * Range: -27273042329600 to 27273042316900
 * @see ECMA-376 Part 1, §20.1.10.17 ST_CoordinateUnqualified
 */
export type ST_CoordinateUnqualified = number; // xsd:long

/**
 * 32-bit coordinate type.
 * @see ECMA-376 Part 1, §20.1.10.18 ST_Coordinate32
 */
export type ST_Coordinate32 = ST_Coordinate32Unqualified | ST_UniversalMeasure;

/**
 * Unqualified 32-bit coordinate.
 * @see ECMA-376 Part 1, §20.1.10.19 ST_Coordinate32Unqualified
 */
export type ST_Coordinate32Unqualified = number; // xsd:int

/**
 * Positive coordinate (non-negative).
 * Range: 0 to 27273042316900
 * @see ECMA-376 Part 1, §20.1.10.42 ST_PositiveCoordinate
 */
export type ST_PositiveCoordinate = number; // xsd:long

/**
 * Positive 32-bit coordinate.
 * @see ECMA-376 Part 1, §20.1.10.43 ST_PositiveCoordinate32
 */
export type ST_PositiveCoordinate32 = number;

/**
 * Angle in 60,000ths of a degree.
 * @see ECMA-376 Part 1, §20.1.10.3 ST_Angle
 */
export type ST_Angle = number; // xsd:int

/**
 * Fixed angle with constraints.
 * Range: -5400000 to 5400000 (exclusive)
 * @see ECMA-376 Part 1, §20.1.10.23 ST_FixedAngle
 */
export type ST_FixedAngle = number;

/**
 * Positive fixed angle.
 * Range: 0 to 21600000 (exclusive)
 * @see ECMA-376 Part 1, §20.1.10.44 ST_PositiveFixedAngle
 */
export type ST_PositiveFixedAngle = number;

/**
 * Angle complex type.
 * @see ECMA-376 Part 1, §20.1.2.2.3 CT_Angle
 */
export interface CT_Angle {
  val: ST_Angle;
}

/**
 * Positive fixed angle complex type.
 * @see ECMA-376 Part 1, §20.1.2.2.30 CT_PositiveFixedAngle
 */
export interface CT_PositiveFixedAngle {
  val: ST_PositiveFixedAngle;
}

/**
 * Percentage complex type.
 * @see ECMA-376 Part 1, §20.1.2.2.25 CT_Percentage
 */
export interface CT_Percentage {
  val: ST_Percentage;
}

/**
 * Positive percentage complex type.
 * @see ECMA-376 Part 1, §20.1.2.2.32 CT_PositivePercentage
 */
export interface CT_PositivePercentage {
  val: ST_PositiveFixedPercentage;
}

/**
 * Fixed percentage complex type.
 * @see ECMA-376 Part 1, §20.1.2.2.11 CT_FixedPercentage
 */
export interface CT_FixedPercentage {
  val: ST_FixedPercentage;
}

/**
 * Positive fixed percentage complex type.
 * @see ECMA-376 Part 1, §20.1.2.2.31 CT_PositiveFixedPercentage
 */
export interface CT_PositiveFixedPercentage {
  val: ST_PositiveFixedPercentage;
}

/**
 * Ratio type for aspect ratios.
 * @see ECMA-376 Part 1, §20.1.2.2.35 CT_Ratio
 */
export interface CT_Ratio {
  n: number; // xsd:long - numerator
  d: number; // xsd:long - denominator
}

/**
 * 2D point.
 * @see ECMA-376 Part 1, §20.1.2.2.27 CT_Point2D
 */
export interface CT_Point2D {
  x: ST_Coordinate;
  y: ST_Coordinate;
}

/**
 * Positive size in 2D.
 * @see ECMA-376 Part 1, §20.1.2.2.33 CT_PositiveSize2D
 */
export interface CT_PositiveSize2D {
  cx: ST_PositiveCoordinate;
  cy: ST_PositiveCoordinate;
}