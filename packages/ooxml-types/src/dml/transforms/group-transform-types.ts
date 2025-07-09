/**
 * DrawingML Group Transform Types
 * Based on dml-main.xsd group transform definitions
 */

import type { CT_DMLPoint2D, CT_DMLPositiveSize2D } from './transform-types';

/**
 * Group transform 2D
 */
export interface CT_DMLGroupTransform2D {
  /** Offset */
  off?: CT_DMLPoint2D;
  /** Extents */
  ext?: CT_DMLPositiveSize2D;
  /** Child offset */
  chOff?: CT_DMLPoint2D;
  /** Child extents */
  chExt?: CT_DMLPositiveSize2D;
  /** Rotation angle */
  rot?: number;
  /** Flip horizontal */
  flipH?: boolean;
  /** Flip vertical */
  flipV?: boolean;
}