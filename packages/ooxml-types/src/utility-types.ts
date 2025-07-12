/**
 * Utility types for working with OOXML enums and types.
 * These types provide convenient subsets and string literal unions
 * for common use cases while maintaining type safety.
 */

/**
 * Common border style values as string literal union.
 * Extracted from ST_Border enum for compatibility with string-based APIs.
 * @see ST_Border for complete OOXML specification
 */
export type BorderStyleString =
  | "single"
  | "double"
  | "thick"
  | "dashed"
  | "dotted"
  | "dashDot"
  | "dashDotDot"
  | "triple"
  | "wave"
  | "doubleWave"
  | "dashSmall"
  | "dashDotStroked"
  | "threeDEmboss"
  | "threeDEngrave"
  | "outset"
  | "inset"
  | "none";

/**
 * Common shading pattern values as string literal union.
 * Extracted from ST_Shd enum for compatibility with string-based APIs.
 * @see ST_Shd for complete OOXML specification
 */
export type ShadingPatternString =
  | "clear"
  | "solid"
  | "horzStripe"
  | "vertStripe"
  | "reverseDiagStripe"
  | "diagStripe"
  | "horzCross"
  | "diagCross"
  | "thinHorzStripe"
  | "thinVertStripe"
  | "thinReverseDiagStripe"
  | "thinDiagStripe"
  | "thinHorzCross"
  | "thinDiagCross"
  | "pct5"
  | "pct10"
  | "pct12"
  | "pct15"
  | "pct20"
  | "pct25"
  | "pct30"
  | "pct35"
  | "pct37"
  | "pct40"
  | "pct45"
  | "pct50"
  | "pct55"
  | "pct60"
  | "pct62"
  | "pct65"
  | "pct70"
  | "pct75"
  | "pct80"
  | "pct85"
  | "pct87"
  | "pct90"
  | "pct95";

/**
 * Common text emphasis marks as string literal union.
 * Used for East Asian text emphasis.
 * @see ST_Em for complete OOXML specification
 */
export type EmphasisMarkString = "dot" | "comma" | "circle" | "underDot";

/**
 * Common paragraph alignment values as string literal union.
 * Uses proper OOXML values (start/end/both).
 * @see ST_Jc for complete OOXML specification
 */
export type ParagraphAlignmentString =
  | "start"
  | "center"
  | "end"
  | "both"
  | "distribute"
  | "highKashida"
  | "lowKashida"
  | "mediumKashida"
  | "thaiDistribute";

/**
 * Common underline style values as string literal union.
 * @see ST_Underline for complete OOXML specification
 */
export type UnderlineStyleString =
  | "single"
  | "words"
  | "double"
  | "thick"
  | "dotted"
  | "dottedHeavy"
  | "dash"
  | "dashedHeavy"
  | "dashLong"
  | "dashLongHeavy"
  | "dotDash"
  | "dashDotHeavy"
  | "dotDotDash"
  | "dashDotDotHeavy"
  | "wave"
  | "wavyHeavy"
  | "wavyDouble"
  | "none";

/**
 * Helper type to extract string values from enum types.
 * Usage: EnumValues<typeof ST_Border>
 */
export type EnumValues<T> = T[keyof T];

/**
 * Type guards for OOXML enum values
 */
export const isBorderStyle = (value: string): value is BorderStyleString => {
  return [
    "single",
    "double",
    "thick",
    "dashed",
    "dotted",
    "dashDot",
    "dashDotDot",
    "triple",
    "wave",
    "doubleWave",
    "dashSmall",
    "dashDotStroked",
    "threeDEmboss",
    "threeDEngrave",
    "outset",
    "inset",
    "none",
  ].includes(value);
};

export const isShadingPattern = (value: string): value is ShadingPatternString => {
  return (
    value.startsWith("pct") ||
    [
      "clear",
      "solid",
      "horzStripe",
      "vertStripe",
      "reverseDiagStripe",
      "diagStripe",
      "horzCross",
      "diagCross",
      "thinHorzStripe",
      "thinVertStripe",
      "thinReverseDiagStripe",
      "thinDiagStripe",
      "thinHorzCross",
      "thinDiagCross",
    ].includes(value)
  );
};

/**
 * Line spacing rule values from OOXML.
 * @see ST_LineSpacingRule
 */
export type LineSpacingRuleString = "auto" | "exact" | "atLeast";

/**
 * Text direction values from OOXML.
 * @see ST_TextDirection
 */
export type TextDirectionString = "ltr" | "rtl" | "lrV" | "tbV" | "lrTbV" | "tbLrV";

/**
 * Vertical alignment for table cells.
 * @see ST_VerticalJc
 */
export type VerticalAlignmentString = "top" | "center" | "bottom";

/**
 * Merge type for table cells.
 * @see ST_Merge
 */
export type MergeTypeString = "restart" | "continue";

/**
 * Convert legacy alignment values to OOXML alignment values.
 * Maps 'left' -> 'start', 'right' -> 'end', 'justify' -> 'both'.
 */
export function toOoxmlAlignment(alignment: string): ParagraphAlignmentString {
  switch (alignment) {
    case "left":
      return "start";
    case "right":
      return "end";
    case "justify":
      return "both";
    default:
      return alignment as ParagraphAlignmentString;
  }
}

/**
 * Convert OOXML alignment values to legacy alignment values (if needed).
 * Maps 'start' -> 'left', 'end' -> 'right', 'both' -> 'justify'.
 */
export function fromOoxmlAlignment(alignment: ParagraphAlignmentString): string {
  switch (alignment) {
    case "start":
      return "left";
    case "end":
      return "right";
    case "both":
      return "justify";
    default:
      return alignment;
  }
}

/**
 * Common measurement units used in OOXML.
 */

/**
 * Convert twips to points (1 twip = 1/20 of a point).
 * @param twips - Value in twips
 * @returns Value in points
 */
export function twipsToPoints(twips: number): number {
  return twips / 20;
}

/**
 * Convert points to twips (1 point = 20 twips).
 * @param points - Value in points
 * @returns Value in twips
 */
export function pointsToTwips(points: number): number {
  return points * 20;
}

/**
 * Convert EMUs (English Metric Units) to points.
 * 1 point = 12700 EMUs
 * @param emus - Value in EMUs
 * @returns Value in points
 */
export function emusToPoints(emus: number): number {
  return emus / 12700;
}

/**
 * Convert points to EMUs (English Metric Units).
 * 1 point = 12700 EMUs
 * @param points - Value in points
 * @returns Value in EMUs
 */
export function pointsToEmus(points: number): number {
  return points * 12700;
}

/**
 * Convert EMUs to pixels at 96 DPI.
 * @param emus - Value in EMUs
 * @returns Value in pixels
 */
export function emusToPixels(emus: number): number {
  // 1 inch = 914400 EMUs, 1 inch = 96 pixels at 96 DPI
  return (emus / 914400) * 96;
}

/**
 * Convert half-points to points.
 * @param halfPoints - Value in half-points
 * @returns Value in points
 */
export function halfPointsToPoints(halfPoints: number | string): number {
  const value = typeof halfPoints === "string" ? parseInt(halfPoints, 10) : halfPoints;
  return value / 2;
}

/**
 * Convert eighth-points to points.
 * Used for border widths in OOXML.
 * @param eighthPoints - Value in eighth-points
 * @returns Value in points
 */
export function eighthPointsToPoints(eighthPoints: number): number {
  return eighthPoints / 8;
}

/**
 * Convert percentage string to number.
 * Handles formats like "50%" or "50.5%".
 * @param percentage - Percentage string
 * @returns Numeric percentage (0-100)
 */
export function parsePercentage(percentage: string): number {
  const match = percentage.match(/^(-?\d+(?:\.\d+)?)%?$/);
  return match ? parseFloat(match[1]!) : 0;
}

/**
 * Convert hex color to RGB format.
 * Handles both 3 and 6 character hex colors.
 * @param hex - Hex color string (with or without #)
 * @returns RGB color string
 */
export function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Handle 3-character hex
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgb(${r}, ${g}, ${b})`;
}
