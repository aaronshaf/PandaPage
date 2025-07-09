// shared-types.ts
import type { VariantValue } from './variant-types';

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
 * Measurement in twips (1/20th of a point) or universal measure.
 * Twips are the standard unit for precise measurements in OOXML.
 * @see ECMA-376 Part 1, §17.18.87 ST_TwipsMeasure
 */
export type ST_TwipsMeasure = ST_UnsignedDecimalNumber | ST_PositiveUniversalMeasure;
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
export type ST_Panose = string; // Hex binary with length 10
export type ST_XmlName = string; // NCName with minLength 1, maxLength 255
export type ST_Xstring = string; // xsd:string

export enum ST_VerticalAlignRun {
  Baseline = "baseline",
  Superscript = "superscript",
  Subscript = "subscript",
}

export enum ST_XAlign {
  Left = "left",
  Center = "center",
  Right = "right",
  Inside = "inside",
  Outside = "outside",
}

export enum ST_YAlign {
  Inline = "inline",
  Top = "top",
  Center = "center",
  Bottom = "bottom",
  Inside = "inside",
  Outside = "outside",
}

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

export enum ST_ConformanceClass {
  Strict = "strict",
  Transitional = "transitional",
}

export enum ST_Relation {
  Ge = "ge",
  Le = "le",
  Gt = "gt",
  Lt = "lt",
  Eq = "eq",
}

export interface CT_Characteristic {
  name: ST_String;
  relation: ST_Relation;
  val: ST_String;
  vocabulary?: ST_String; // xsd:anyURI
}

export interface CT_AdditionalCharacteristics {
  characteristic?: CT_Characteristic[];
}

export interface CT_DatastoreSchemaRef {
  uri: ST_String;
}

export interface CT_DatastoreSchemaRefs {
  schemaRef?: CT_DatastoreSchemaRef[];
}

export interface CT_DatastoreItem {
  schemaRefs?: CT_DatastoreSchemaRefs;
  itemID: ST_Guid;
}

export interface CT_Schema {
  uri?: ST_String;
  manifestLocation?: ST_String;
  schemaLocation?: ST_String;
  schemaLanguage?: ST_String; // xsd:token
}

export interface CT_SchemaLibrary {
  schema?: CT_Schema[];
}

export interface CT_Property extends VariantValue {
  fmtid: ST_Guid;
  pid: number; // xsd:int
  name?: ST_String;
  linkTarget?: ST_String;
}

export interface CT_Properties {
  property?: CT_Property[];
}

export type ST_RelationshipId = string;
