// Unit conversion utilities for DOCX parsing

/**
 * Convert half-points to points
 * @param halfPoints - Value in half-points (string or number)
 * @returns Value in points or undefined if invalid
 */
export function halfPointsToPoints(
  halfPoints: string | number | null | undefined,
): number | undefined {
  if (halfPoints == null) return undefined;

  const value = typeof halfPoints === "string" ? parseFloat(halfPoints) : halfPoints;
  if (isNaN(value)) return undefined;

  return value / 2;
}
