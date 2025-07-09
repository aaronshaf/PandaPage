/**
 * WordprocessingML Basic Types
 * @see ECMA-376 Part 1, §17.18 (Simple Types)
 */

import type { ST_OnOff, ST_String, ST_Lang } from '../shared/common-types';
import type { ST_DecimalNumber, ST_UnsignedDecimalNumber } from '../shared/measurement-types';
import type { ST_TwipsMeasure } from '../shared/measurement-types';

/**
 * Empty element.
 * @see ECMA-376 Part 1, §17.18.3 CT_Empty
 */
export type CT_Empty = Record<string, never>;

/**
 * On/Off property.
 * @see ECMA-376 Part 1, §17.18.52 CT_OnOff
 */
export interface CT_OnOff {
  val?: ST_OnOff;
}

/**
 * Long hexadecimal number (4 bytes).
 * @see ECMA-376 Part 1, §17.18.50 ST_LongHexNumber
 */
export type ST_LongHexNumber = string; // pattern: [0-9A-Fa-f]{8}

/**
 * Short hexadecimal number (2 bytes).
 * @see ECMA-376 Part 1, §17.18.87 ST_ShortHexNumber
 */
export type ST_ShortHexNumber = string; // pattern: [0-9A-Fa-f]{4}

/**
 * Two-digit hexadecimal.
 * @see ECMA-376 Part 1, §17.18.105 ST_UcharHexNumber
 */
export type ST_UcharHexNumber = string; // pattern: [0-9A-Fa-f]{2}

/**
 * Decimal number.
 * @see ECMA-376 Part 1, §17.18.16 CT_DecimalNumber
 */
export interface CT_DecimalNumber {
  val: ST_DecimalNumber;
}

/**
 * Twips measure.
 * @see ECMA-376 Part 1, §17.18.105 CT_TwipsMeasure
 */
export interface CT_TwipsMeasure {
  val: ST_TwipsMeasure;
}

/**
 * Signed twips measure.
 * @see ECMA-376 Part 1, §17.18.81 CT_SignedTwipsMeasure
 */
export interface CT_SignedTwipsMeasure {
  val: ST_SignedTwipsMeasure;
}

/**
 * Signed twips measure type.
 * @see ECMA-376 Part 1, §17.18.88 ST_SignedTwipsMeasure
 */
export type ST_SignedTwipsMeasure = number | ST_UniversalMeasure;

/**
 * Universal measure.
 * Pattern: -?[0-9]+(\.[0-9]+)?(mm|cm|in|pt|pc|pi)
 * @see ECMA-376 Part 1, §22.9.2.15 ST_UniversalMeasure
 */
export type ST_UniversalMeasure = string;

/**
 * Pixel measure.
 * @see ECMA-376 Part 1, §17.18.67 CT_PixelsMeasure
 */
export interface CT_PixelsMeasure {
  val: number; // xsd:unsignedLong
}

/**
 * Half-point measurement.
 * @see ECMA-376 Part 1, §17.18.42 CT_HpsMeasure
 */
export interface CT_HpsMeasure {
  val: ST_HpsMeasure;
}

/**
 * Half-point measurement in positive integer.
 * @see ECMA-376 Part 1, §17.18.42 ST_HpsMeasure
 */
export type ST_HpsMeasure = ST_UnsignedDecimalNumber | ST_PositiveUniversalMeasure;

/**
 * Positive universal measure.
 * @see ECMA-376 Part 1, §22.9.2.12 ST_PositiveUniversalMeasure
 */
export type ST_PositiveUniversalMeasure = string;

/**
 * Signed half-point measurement.
 * @see ECMA-376 Part 1, §17.18.80 CT_SignedHpsMeasure
 */
export interface CT_SignedHpsMeasure {
  val: number | ST_UniversalMeasure;
}

/**
 * DateTime value.
 * @see ECMA-376 Part 1, §17.18.14 ST_DateTime
 */
export type ST_DateTime = string; // xsd:dateTime

/**
 * Macro name.
 * @see ECMA-376 Part 1, §17.18.51 ST_MacroName
 */
export type ST_MacroName = string;

/**
 * Escaped string.
 * @see ECMA-376 Part 1, §17.18.35 ST_EscapedString
 */
export type ST_EscapedString = string;

/**
 * Language reference.
 * @see ECMA-376 Part 1, §17.18.46 CT_Lang
 */
export interface CT_Lang {
  val: ST_Lang;
}

/**
 * GUID.
 * @see ECMA-376 Part 1, §17.18.41 CT_Guid
 */
export interface CT_Guid {
  val: ST_Guid;
}

/**
 * GUID string.
 * Pattern: \{[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}\}
 * @see ECMA-376 Part 1, §22.9.2.5 ST_Guid  
 */
export type ST_Guid = string;

/**
 * String value.
 * @see ECMA-376 Part 1, §17.3.2.36 CT_String
 */
export interface CT_String {
  val: ST_String;
}

/**
 * Unsigned decimal number.
 * @see ECMA-376 Part 1, §17.18.84 CT_UnsignedDecimalNumber
 */
export interface CT_UnsignedDecimalNumber {
  val: ST_UnsignedDecimalNumber;
}

/**
 * Macro name.
 * @see ECMA-376 Part 1, §17.18.51 CT_MacroName
 */
export interface CT_MacroName {
  val: ST_MacroName;
}