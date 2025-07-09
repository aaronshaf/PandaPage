// dml-fonts.ts - Font-related types from DrawingML
import type { ST_String } from "./shared-types";

// Import extension types from dml-media
import type { CT_OfficeArtExtension, CT_OfficeArtExtensionList } from "./dml-media";

// Import color types from dml-colors  
import type { EG_ColorChoice } from "./dml-colors";

// 
// Font collection index enum
export enum ST_FontCollectionIndex {
  Major = "major",
  Minor = "minor",
  None = "none",
}

// Text font alignment type enum
export enum ST_TextFontAlignType {
  Auto = "auto",
  T = "t",
  Ctr = "ctr",
  B = "b",
  Base = "base",
}

// Font-related interfaces
export interface CT_SupplementalFont {
  script: ST_String;
  typeface: ST_String; // ST_TextTypeface
}

export interface CT_TextFont {
  // This type is referenced but not defined in dml-main.xsd, assuming it's a simple string for typeface
  typeface: ST_String;
}

export interface CT_FontCollection {
  latin: CT_TextFont;
  ea: CT_TextFont;
  cs: CT_TextFont;
  font?: CT_SupplementalFont[];
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_FontScheme {
  majorFont: CT_FontCollection;
  minorFont: CT_FontCollection;
  extLst?: CT_OfficeArtExtensionList;
  name: ST_String;
}

export interface CT_FontReference {
  idx: ST_FontCollectionIndex;
  colorChoice?: EG_ColorChoice;
}
