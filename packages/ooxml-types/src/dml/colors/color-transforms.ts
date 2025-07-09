/**
 * DrawingML Color Transform Types
 * @see ECMA-376 Part 1, §20.1.2.3 (Color Transforms)
 */

import type { CT_PositiveFixedPercentage, CT_FixedPercentage, CT_PositivePercentage, CT_Percentage, CT_PositiveFixedAngle, CT_Angle } from '../core/coordinate-types';

/**
 * Complement transform.
 * @see ECMA-376 Part 1, §20.1.2.3.7 CT_ComplementTransform
 */
export type CT_ComplementTransform = Record<string, never>;

/**
 * Inverse transform.
 * @see ECMA-376 Part 1, §20.1.2.3.21 CT_InverseTransform
 */
export type CT_InverseTransform = Record<string, never>;

/**
 * Grayscale transform.
 * @see ECMA-376 Part 1, §20.1.2.3.19 CT_GrayscaleTransform
 */
export type CT_GrayscaleTransform = Record<string, never>;

/**
 * Gamma transform.
 * @see ECMA-376 Part 1, §20.1.2.3.15 CT_GammaTransform
 */
export type CT_GammaTransform = Record<string, never>;

/**
 * Inverse gamma transform.
 * @see ECMA-376 Part 1, §20.1.2.3.20 CT_InverseGammaTransform
 */
export type CT_InverseGammaTransform = Record<string, never>;

/**
 * Color transform group.
 * Represents various color modifications that can be applied.
 * @see ECMA-376 Part 1, §20.1.2.3.1 EG_ColorTransform
 */
export type EG_ColorTransform = 
  | { tint: CT_PositiveFixedPercentage }
  | { shade: CT_PositiveFixedPercentage }
  | { comp: CT_ComplementTransform }
  | { inv: CT_InverseTransform }
  | { gray: CT_GrayscaleTransform }
  | { alpha: CT_PositiveFixedPercentage }
  | { alphaOff: CT_FixedPercentage }
  | { alphaMod: CT_PositivePercentage }
  | { hue: CT_PositiveFixedAngle }
  | { hueOff: CT_Angle }
  | { hueMod: CT_PositivePercentage }
  | { sat: CT_Percentage }
  | { satOff: CT_Percentage }
  | { satMod: CT_Percentage }
  | { lum: CT_Percentage }
  | { lumOff: CT_Percentage }
  | { lumMod: CT_Percentage }
  | { red: CT_Percentage }
  | { redOff: CT_Percentage }
  | { redMod: CT_Percentage }
  | { green: CT_Percentage }
  | { greenOff: CT_Percentage }
  | { greenMod: CT_Percentage }
  | { blue: CT_Percentage }
  | { blueOff: CT_Percentage }
  | { blueMod: CT_Percentage }
  | { gamma: CT_GammaTransform }
  | { invGamma: CT_InverseGammaTransform };