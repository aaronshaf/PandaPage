/**
 * Unit conversion utilities for DOCX document processing
 * Based on official OOXML specification units
 */

import type { 
  ST_OnOff, 
  ST_String, 
  ST_TwipsMeasure, 
  ST_UnsignedDecimalNumber,
  ST_DecimalNumber,
  ST_UniversalMeasure,
  ST_PositiveUniversalMeasure,
  ST_Lang
} from '@browser-document-viewer/ooxml-types';

// Core unit constants from official OOXML schema
export const TWIPS_PER_INCH = 1440;
export const TWIPS_PER_POINT = 20;
export const TWIPS_PER_CM = 567; // Approximate: 1440 / 2.54
export const EMUS_PER_INCH = 914400;
export const EMUS_PER_CM = 360000;
export const EMUS_PER_POINT = 12700;
export const EMUS_PER_TWIP = 635;
export const POINTS_PER_INCH = 72;

/**
 * Supported universal measure units from ST_UniversalMeasure
 */
export type UniversalMeasureUnit = 'mm' | 'cm' | 'in' | 'pt' | 'pc' | 'pi';

/**
 * Target unit for conversions
 */
export type TargetUnit = 'twips' | 'emus' | 'points' | 'inches' | 'cm' | 'mm';

/**
 * Parse universal measure value according to OOXML ST_UniversalMeasure pattern
 * Pattern: -?[0-9]+(\.[0-9]+)?(mm|cm|in|pt|pc|pi)
 */
export function parseUniversalMeasure(
  value: ST_UniversalMeasure | number,
  targetUnit: TargetUnit = 'twips'
): number {
  // Handle raw numbers (already in base unit)
  if (typeof value === 'number') {
    return value;
  }

  // Parse string with units
  const match = value.match(/^(-?[0-9]+(?:\.[0-9]+)?)(mm|cm|in|pt|pc|pi)$/);
  if (!match) {
    // Fallback: try parsing as raw number
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  const [, numStr, unit] = match;
  const num = parseFloat(numStr || '0');
  
  if (!unit) {
    return isNaN(num) ? 0 : num;
  }
  
  const unitStr = unit as UniversalMeasureUnit;

  // Convert to target unit
  switch (targetUnit) {
    case 'twips':
      return convertToTwips(num, unitStr);
    case 'emus':
      return convertToEmus(num, unitStr);
    case 'points':
      return convertToPoints(num, unitStr);
    case 'inches':
      return convertToInches(num, unitStr);
    case 'cm':
      return convertToCentimeters(num, unitStr);
    case 'mm':
      return convertToMillimeters(num, unitStr);
    default:
      return 0;
  }
}

/**
 * Convert value with unit to twips
 */
function convertToTwips(value: number, unit: UniversalMeasureUnit): number {
  switch (unit) {
    case 'in':
      return Math.round(value * TWIPS_PER_INCH);
    case 'pt':
      return Math.round(value * TWIPS_PER_POINT);
    case 'pc':
    case 'pi':
      return Math.round(value * 12 * TWIPS_PER_POINT); // 1 pica = 12 points
    case 'mm':
      return Math.round(value * TWIPS_PER_INCH / 25.4);
    case 'cm':
      return Math.round(value * TWIPS_PER_CM);
    default:
      return 0;
  }
}

/**
 * Convert value with unit to EMUs
 */
function convertToEmus(value: number, unit: UniversalMeasureUnit): number {
  switch (unit) {
    case 'in':
      return Math.round(value * EMUS_PER_INCH);
    case 'pt':
      return Math.round(value * EMUS_PER_POINT);
    case 'pc':
    case 'pi':
      return Math.round(value * 12 * EMUS_PER_POINT); // 1 pica = 12 points
    case 'mm':
      return Math.round(value * EMUS_PER_INCH / 25.4);
    case 'cm':
      return Math.round(value * EMUS_PER_CM);
    default:
      return 0;
  }
}

/**
 * Convert value with unit to points
 */
function convertToPoints(value: number, unit: UniversalMeasureUnit): number {
  switch (unit) {
    case 'in':
      return value * POINTS_PER_INCH;
    case 'pt':
      return value;
    case 'pc':
    case 'pi':
      return value * 12; // 1 pica = 12 points
    case 'mm':
      return value * POINTS_PER_INCH / 25.4;
    case 'cm':
      return value * POINTS_PER_INCH / 2.54;
    default:
      return 0;
  }
}

/**
 * Convert value with unit to inches
 */
function convertToInches(value: number, unit: UniversalMeasureUnit): number {
  switch (unit) {
    case 'in':
      return value;
    case 'pt':
      return value / POINTS_PER_INCH;
    case 'pc':
    case 'pi':
      return (value * 12) / POINTS_PER_INCH; // 1 pica = 12 points
    case 'mm':
      return value / 25.4;
    case 'cm':
      return value / 2.54;
    default:
      return 0;
  }
}

/**
 * Convert value with unit to centimeters
 */
function convertToCentimeters(value: number, unit: UniversalMeasureUnit): number {
  switch (unit) {
    case 'in':
      return value * 2.54;
    case 'pt':
      return (value / POINTS_PER_INCH) * 2.54;
    case 'pc':
    case 'pi':
      return ((value * 12) / POINTS_PER_INCH) * 2.54;
    case 'mm':
      return value / 10;
    case 'cm':
      return value;
    default:
      return 0;
  }
}

/**
 * Convert value with unit to millimeters
 */
function convertToMillimeters(value: number, unit: UniversalMeasureUnit): number {
  switch (unit) {
    case 'in':
      return value * 25.4;
    case 'pt':
      return (value / POINTS_PER_INCH) * 25.4;
    case 'pc':
    case 'pi':
      return ((value * 12) / POINTS_PER_INCH) * 25.4;
    case 'mm':
      return value;
    case 'cm':
      return value * 10;
    default:
      return 0;
  }
}

/**
 * Unit conversion functions
 */

// Twips conversions
export function twipsToInches(twips: number): number {
  return twips / TWIPS_PER_INCH;
}

export function twipsToPoints(twips: number): number {
  return twips / TWIPS_PER_POINT;
}

export function twipsToCentimeters(twips: number): number {
  return twips / TWIPS_PER_CM;
}

export function twipsToMillimeters(twips: number): number {
  return (twips / TWIPS_PER_INCH) * 25.4;
}

// EMU conversions
export function emusToInches(emus: number): number {
  return emus / EMUS_PER_INCH;
}

export function emusToPoints(emus: number): number {
  return emus / EMUS_PER_POINT;
}

export function emusToCentimeters(emus: number): number {
  return emus / EMUS_PER_CM;
}

export function emusToMillimeters(emus: number): number {
  return (emus / EMUS_PER_INCH) * 25.4;
}

// Cross-unit conversions
export function twipsToEmus(twips: number): number {
  return Math.round(twips * EMUS_PER_TWIP);
}

export function emusToTwips(emus: number): number {
  return Math.round(emus / EMUS_PER_TWIP);
}

// Points conversions
export function pointsToTwips(points: number): number {
  return Math.round(points * TWIPS_PER_POINT);
}

export function pointsToEmus(points: number): number {
  return Math.round(points * EMUS_PER_POINT);
}

export function pointsToInches(points: number): number {
  return points / POINTS_PER_INCH;
}

// Inches conversions
export function inchesToTwips(inches: number): number {
  return Math.round(inches * TWIPS_PER_INCH);
}

export function inchesToEmus(inches: number): number {
  return Math.round(inches * EMUS_PER_INCH);
}

export function inchesToPoints(inches: number): number {
  return inches * POINTS_PER_INCH;
}

// Font size helpers (half-points to points)
export function halfPointsToPoints(halfPoints: number): number {
  return halfPoints / 2;
}

export function pointsToHalfPoints(points: number): number {
  return points * 2;
}

// CSS output helpers
export function twipsToCss(twips: number): string {
  return `${twipsToPoints(twips)}pt`;
}

export function emusToCss(emus: number): string {
  return `${emusToPoints(emus)}pt`;
}

export function pointsToCss(points: number): string {
  return `${points}pt`;
}

export function inchesToCss(inches: number): string {
  return `${inches}in`;
}

export function centimetersToCss(cm: number): string {
  return `${cm}cm`;
}

/**
 * Parse OOXML boolean properties (ST_OnOff)
 * Handles: true/1/on = true, false/0/off = false, empty = true
 */
export function parseOnOff(value: ST_OnOff | string | null | undefined, defaultValue: boolean = false): boolean {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  // Empty string means true (e.g., <w:b/>)
  if (value === '') {
    return true;
  }

  // Parse string value
  const lowered = value.toLowerCase();
  switch (lowered) {
    case 'true':
    case '1':
    case 'on':
      return true;
    case 'false':
    case '0':
    case 'off':
      return false;
    default:
      return true; // Unknown values default to true per OOXML spec
  }
}

/**
 * Parse OOXML font size (half-points to points)
 */
export function parseFontSize(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const halfPoints = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(halfPoints)) {
    return undefined;
  }

  return halfPoints / 2; // Convert half-points to points
}

/**
 * Validate coordinate within OOXML EMU range
 */
export function validateEmuCoordinate(value: number): number {
  const MIN_EMU = -27273042329600;
  const MAX_EMU = 27273042316900;
  return Math.max(MIN_EMU, Math.min(MAX_EMU, value));
}

/**
 * Validate coordinate within reasonable twips range
 */
export function validateTwipsCoordinate(value: number): number {
  // Reasonable range: approximately ±19 inches
  const MIN_TWIPS = -27360;
  const MAX_TWIPS = 27360;
  return Math.max(MIN_TWIPS, Math.min(MAX_TWIPS, value));
}

/**
 * Standard page sizes in different units
 */
export const PAGE_SIZES = {
  letter: {
    twips: { width: 12240, height: 15840 },
    inches: { width: 8.5, height: 11 },
    points: { width: 612, height: 792 },
    mm: { width: 215.9, height: 279.4 }
  },
  a4: {
    twips: { width: 11907, height: 16839 },
    inches: { width: 8.27, height: 11.69 },
    points: { width: 595, height: 842 },
    mm: { width: 210, height: 297 }
  },
  legal: {
    twips: { width: 12240, height: 20160 },
    inches: { width: 8.5, height: 14 },
    points: { width: 612, height: 1008 },
    mm: { width: 215.9, height: 355.6 }
  },
  a3: {
    twips: { width: 16839, height: 23814 },
    inches: { width: 11.69, height: 16.54 },
    points: { width: 842, height: 1191 },
    mm: { width: 297, height: 420 }
  },
  a5: {
    twips: { width: 8419, height: 11907 },
    inches: { width: 5.83, height: 8.27 },
    points: { width: 420, height: 595 },
    mm: { width: 148, height: 210 }
  },
  ledger: {
    twips: { width: 15840, height: 24480 },
    inches: { width: 11, height: 17 },
    points: { width: 792, height: 1224 },
    mm: { width: 279.4, height: 431.8 }
  },
  tabloid: {
    twips: { width: 15840, height: 24480 },
    inches: { width: 11, height: 17 },
    points: { width: 792, height: 1224 },
    mm: { width: 279.4, height: 431.8 }
  }
} as const;

/**
 * Default margin values in twips
 */
export const DEFAULT_MARGINS = {
  normal: 1440,    // 1 inch
  narrow: 720,     // 0.5 inch
  moderate: 1080,  // 0.75 inch
  wide: 2160       // 1.5 inch
} as const;

/**
 * Typography defaults from OOXML spec
 */
export const TYPOGRAPHY_DEFAULTS = {
  fontSize: 22,           // 11pt (half-points)
  lineSpacing: 240,       // Single spacing (240ths)
  paragraphSpacing: 200,  // 10pt after (twips)
  tabStop: 720,          // 0.5 inch default tabs
  characterSpacing: 0     // No extra spacing (twips)
} as const;