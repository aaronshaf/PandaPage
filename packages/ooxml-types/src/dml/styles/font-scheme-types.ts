/**
 * DrawingML Font Scheme Types
 * Based on dml-main.xsd font scheme definitions
 */

/**
 * Text font
 */
export interface CT_DMLTextFont {
  /** Typeface */
  typeface?: string;
  /** Panose */
  panose?: string;
  /** Pitch family */
  pitchFamily?: number;
  /** Character set */
  charset?: number;
}

/**
 * Supplemental font
 */
export interface CT_DMLSupplementalFont {
  /** Script */
  script: string;
  /** Typeface */
  typeface: string;
}

/**
 * Font scheme
 */
export interface CT_DMLFontScheme {
  /** Major font */
  majorFont?: CT_DMLFontCollection;
  /** Minor font */
  minorFont?: CT_DMLFontCollection;
  /** Name */
  name: string;
}

/**
 * Font collection
 */
export interface CT_DMLFontCollection {
  /** Latin font */
  latin?: CT_DMLTextFont;
  /** East Asian font */
  ea?: CT_DMLTextFont;
  /** Complex script font */
  cs?: CT_DMLTextFont;
  /** Supplemental fonts */
  font?: CT_DMLSupplementalFont[];
  /** Extension list */
  extLst?: any; // CT_OfficeArtExtensionList
}