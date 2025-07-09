/**
 * DrawingML Transform Types
 * Based on dml-main.xsd transform definitions
 */

/**
 * 2D transform
 */
export interface CT_DMLTransform2D {
  /** Offset */
  off?: CT_DMLPoint2D;
  /** Extents */
  ext?: CT_DMLPositiveSize2D;
  /** Rotation angle */
  rot?: number;
  /** Flip horizontal */
  flipH?: boolean;
  /** Flip vertical */
  flipV?: boolean;
}

/**
 * Point 2D
 */
export interface CT_DMLPoint2D {
  /** X coordinate */
  x?: number;
  /** Y coordinate */
  y?: number;
}

/**
 * Positive size 2D
 */
export interface CT_DMLPositiveSize2D {
  /** Width (must be positive) */
  cx?: number;
  /** Height (must be positive) */
  cy?: number;
}

/**
 * Scale 2D
 */
export interface CT_DMLScale2D {
  /** X scale */
  sx?: CT_DMLRatio;
  /** Y scale */
  sy?: CT_DMLRatio;
}

/**
 * Ratio
 */
export interface CT_DMLRatio {
  /** Numerator */
  n?: number;
  /** Denominator */
  d?: number;
}