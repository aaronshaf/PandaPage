/**
 * DrawingML Path Types
 * Based on dml-main.xsd path definitions
 */

import type { CT_AdjPoint2D } from './geometry-types';

/**
 * Path fill mode
 */
export type ST_PathFillMode = 'none' | 'norm' | 'lighten' | 'lightenLess' | 'darken' | 'darkenLess';

/**
 * Move to command
 */
export interface CT_Path2DMoveTo {
  /** Point */
  pt: CT_AdjPoint2D;
}

/**
 * Line to command
 */
export interface CT_Path2DLineTo {
  /** Point */
  pt: CT_AdjPoint2D;
}

/**
 * Arc to command
 */
export interface CT_Path2DArcTo {
  /** Width radius */
  wR: string;
  /** Height radius */
  hR: string;
  /** Start angle */
  stAng: string;
  /** Swing angle */
  swAng: string;
}

/**
 * Quadratic Bezier curve to command
 */
export interface CT_Path2DQuadBezierTo {
  /** Control point 1 */
  pt1: CT_AdjPoint2D;
  /** End point */
  pt2: CT_AdjPoint2D;
}

/**
 * Cubic Bezier curve to command
 */
export interface CT_Path2DCubicBezierTo {
  /** Control point 1 */
  pt1: CT_AdjPoint2D;
  /** Control point 2 */
  pt2: CT_AdjPoint2D;
  /** End point */
  pt3: CT_AdjPoint2D;
}

/**
 * Close path command
 */
export type CT_Path2DClose = Record<string, never>;

/**
 * Path commands union
 */
export type PathCommand = 
  | { moveTo: CT_Path2DMoveTo }
  | { lineTo: CT_Path2DLineTo }
  | { arcTo: CT_Path2DArcTo }
  | { quadBezTo: CT_Path2DQuadBezierTo }
  | { cubicBezTo: CT_Path2DCubicBezierTo }
  | { close: CT_Path2DClose };

/**
 * 2D path
 */
export interface CT_Path2D {
  /** Width */
  w?: number;
  /** Height */
  h?: number;
  /** Fill mode */
  fill?: ST_PathFillMode;
  /** Stroke */
  stroke?: boolean;
  /** Extrusion okay */
  extrusionOk?: boolean;
  /** Path commands */
  commands?: PathCommand[];
}

/**
 * Path list
 */
export interface CT_Path2DList {
  /** Paths */
  path?: CT_Path2D[];
}

