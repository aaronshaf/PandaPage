/**
 * Utility functions for converting OOXML units to CSS units
 */

/**
 * Convert twips to points
 * 1 twip = 1/20 of a point
 */
export function twipsToPoints(twips: number): number {
  return twips / 20;
}

/**
 * Convert twips to CSS pt string
 */
export function twipsToPt(twips: number): string {
  return `${twipsToPoints(twips)}pt`;
}

/**
 * Convert half-points to points
 * Used for font sizes in OOXML
 */
export function halfPointsToPoints(halfPoints: number): number {
  return halfPoints / 2;
}

/**
 * Convert half-points to CSS pt string
 */
export function halfPointsToPt(halfPoints: string | number): string {
  const value = typeof halfPoints === "string" ? parseInt(halfPoints, 10) : halfPoints;
  return `${halfPointsToPoints(value)}pt`;
}

// Standard line spacing value in twips (normal = 240 twips = 1.0x)
const NORMAL_LINE_SPACING_TWIPS = 240;

/**
 * Convert line spacing based on line rule
 * @param value - The line spacing value in twips
 * @param lineRule - The line spacing rule
 * @returns CSS line-height value
 */
export function convertLineSpacing(value: number, lineRule?: "auto" | "exact" | "atLeast"): string {
  switch (lineRule) {
    case "exact":
      // Exact line height in points - use absolute unit
      return twipsToPt(value);
    case "atLeast":
      // Minimum line height in points - use absolute unit
      return twipsToPt(value);
    case "auto":
    default:
      // Auto means the value is in 240ths of a line (relative to font size)
      // Normal line spacing is 240 twips, so divide by 240 to get a unitless multiplier
      const ratio = value / NORMAL_LINE_SPACING_TWIPS;
      return ratio.toFixed(2);
  }
}
