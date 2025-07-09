/**
 * Common Simple Types used throughout OOXML
 * @see ECMA-376 Part 1, §22.9 (Shared Simple Types)
 * Based on shared-commonSimpleTypes.xsd
 */

/**
 * Boolean property type used throughout OOXML.
 * Can be 'on'/'off' strings or boolean values.
 * Empty attribute means true (e.g., `<w:b/>` = bold is on).
 * @see ECMA-376 Part 1, §22.9.2.13 ST_OnOff
 */
export type ST_OnOff = 'on' | 'off' | boolean;

/**
 * Simple string type used throughout OOXML schemas.
 * @see ECMA-376 Part 1, §22.9.2.13 ST_String
 */
export type ST_String = string;

/**
 * Language identifier (RFC 3066 language tags).
 * Examples: "en-US", "fr-FR", "zh-CN"
 * @see ECMA-376 Part 1, §22.9.2.6 ST_Lang
 */
export type ST_Lang = string;

/**
 * GUID string identifier.
 * Format: {XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}
 * @see ECMA-376 Part 1, §22.9.2.5 ST_Guid
 */
export type ST_Guid = string;

/**
 * RGB color in hexadecimal format (6 hex digits).
 * Examples: "FF0000" (red), "00FF00" (green), "0000FF" (blue)
 * @see ECMA-376 Part 1, §22.9.2.7 ST_HexColorRGB
 */
export type ST_HexColorRGB = string;

/**
 * Panose-1 font classification (10 bytes hex).
 * @see ECMA-376 Part 1, §22.9.2.8 ST_Panose
 */
export type ST_Panose = string;

/**
 * Decimal number.
 * @see ECMA-376 Part 1, §22.9.2.2 ST_DecimalNumber
 */
export type ST_DecimalNumber = number;

/**
 * Unsigned decimal number.
 * @see ECMA-376 Part 1, §22.9.2.16 ST_UnsignedDecimalNumber
 */
export type ST_UnsignedDecimalNumber = number;

/**
 * Relationship identifier (for parts relationships).
 * @see ECMA-376 Part 1, §22.8.2.1 ST_RelationshipId
 */
export type ST_RelationshipId = string;

/**
 * XML name type (NCName with constraints).
 * @see ECMA-376 Part 1, §22.9.2.19 ST_XmlName
 */
export type ST_XmlName = string;

/**
 * Extended string type.
 * @see ECMA-376 Part 1, §22.9.2.18 ST_Xstring
 */
export type ST_Xstring = string;

/**
 * Calendar type enumeration.
 * @see ECMA-376 Part 1, §22.9.2.1 ST_CalendarType
 */
export enum ST_CalendarType {
  Gregorian = "gregorian",
  GregorianUs = "gregorianUs",
  GregorianMeFrench = "gregorianMeFrench",
  GregorianArabic = "gregorianArabic",
  Hijri = "hijri",
  Hebrew = "hebrew",
  Taiwan = "taiwan",
  Japan = "japan",
  Thai = "thai",
  Korea = "korea",
  Saka = "saka",
  GregorianXlitEnglish = "gregorianXlitEnglish",
  GregorianXlitFrench = "gregorianXlitFrench",
  None = "none",
}

/**
 * Conformance class for OOXML documents.
 * @see ECMA-376 Part 1, §22.9.2.2 ST_ConformanceClass
 */
export enum ST_ConformanceClass {
  Strict = "strict",
  Transitional = "transitional",
}