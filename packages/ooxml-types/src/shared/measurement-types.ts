/**
 * Measurement Types used throughout OOXML
 * @see ECMA-376 Part 1, §22.9 (Shared Simple Types)
 */

/**
 * Unsigned decimal number (non-negative integer).
 * @see ECMA-376 Part 1, §22.9.2.16 ST_UnsignedDecimalNumber
 */
export type ST_UnsignedDecimalNumber = number;

/**
 * Signed decimal number (positive or negative integer).
 * @see ECMA-376 Part 1, §22.9.2.3 ST_DecimalNumber
 */
export type ST_DecimalNumber = number;

/**
 * Measurement in twips (1/20th of a point) or universal measure.
 * Twips are the standard unit for precise measurements in OOXML.
 * @see ECMA-376 Part 1, §17.18.87 ST_TwipsMeasure
 */
export type ST_TwipsMeasure = ST_UnsignedDecimalNumber | ST_PositiveUniversalMeasure;

/**
 * Universal measure supporting various units (pt, in, cm, mm, pc, pi).
 * Pattern: -?[0-9]+(\.[0-9]+)?(mm|cm|in|pt|pc|pi)
 * @see ECMA-376 Part 1, §22.9.2.15 ST_UniversalMeasure
 */
export type ST_UniversalMeasure = string;

/**
 * Positive universal measure (no negative values).
 * Same units as ST_UniversalMeasure but positive only.
 * @see ECMA-376 Part 1, §22.9.2.12 ST_PositiveUniversalMeasure
 */
export type ST_PositiveUniversalMeasure = string;

/**
 * Percentage value as string (e.g., "100%", "-50%").
 * @see ECMA-376 Part 1, §22.9.2.9 ST_Percentage
 */
export type ST_Percentage = string;

/**
 * Fixed percentage with specific pattern constraints.
 * Pattern: -?((100)|([0-9][0-9]?))(\.[0-9][0-9]?)?%
 * @see ECMA-376 Part 1, §22.9.2.4 ST_FixedPercentage
 */
export type ST_FixedPercentage = string;

/**
 * Positive percentage value (no negative values allowed).
 * Pattern: [0-9]+(\.[0-9]+)?%
 * @see ECMA-376 Part 1, §22.9.2.10 ST_PositivePercentage
 */
export type ST_PositivePercentage = string;

/**
 * Positive fixed percentage with constraints (0-100%).
 * Pattern: ((100)|([0-9][0-9]?))(\.[0-9][0-9]?)?%
 * @see ECMA-376 Part 1, §22.9.2.11 ST_PositiveFixedPercentage
 */
export type ST_PositiveFixedPercentage = string;