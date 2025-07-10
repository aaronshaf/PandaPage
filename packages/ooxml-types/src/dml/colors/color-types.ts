/**
 * DrawingML Color Types
 * @see ECMA-376 Part 1, Section 20.1.2 (Colors)
 */

import type { ST_String } from "../../shared/common-types";
import type { CT_OfficeArtExtensionList } from "../core/extension-types";
import type {
  CT_ScRgbColor,
  CT_SRgbColor,
  CT_HslColor,
  CT_SystemColor,
  CT_SchemeColor,
  CT_PresetColor,
} from "./color-models";

/**
 * Color Scheme Index
 * @see ECMA-376 Part 1, §20.1.2.3.49
 */
export enum ST_ColorSchemeIndex {
  Dk1 = "dk1",
  Lt1 = "lt1",
  Dk2 = "dk2",
  Lt2 = "lt2",
  Accent1 = "accent1",
  Accent2 = "accent2",
  Accent3 = "accent3",
  Accent4 = "accent4",
  Accent5 = "accent5",
  Accent6 = "accent6",
  Hlink = "hlink",
  FolHlink = "folHlink",
}

/**
 * Color Choice Group
 * Union of different color model types.
 * @see ECMA-376 Part 1, §20.1.2.3.1 EG_ColorChoice
 */
export type EG_ColorChoice =
  | { scrgbClr: CT_ScRgbColor }
  | { srgbClr: CT_SRgbColor }
  | { hslClr: CT_HslColor }
  | { sysClr: CT_SystemColor }
  | { schemeClr: CT_SchemeColor }
  | { prstClr: CT_PresetColor };

/**
 * Base color interface.
 * @see ECMA-376 Part 1, §20.1.2.3.3 CT_Color
 */
export interface CT_Color {
  colorChoice: EG_ColorChoice;
}

/**
 * Color Most Recently Used
 * @see ECMA-376 Part 1, §20.1.2.3.4 CT_ColorMRU
 */
export interface CT_ColorMRU {
  colorChoice?: EG_ColorChoice[];
}

/**
 * Color Scheme
 * @see ECMA-376 Part 1, §20.1.2.3.6
 */
export interface CT_ColorScheme {
  dk1: CT_Color;
  lt1: CT_Color;
  dk2: CT_Color;
  lt2: CT_Color;
  accent1: CT_Color;
  accent2: CT_Color;
  accent3: CT_Color;
  accent4: CT_Color;
  accent5: CT_Color;
  accent6: CT_Color;
  hlink: CT_Color;
  folHlink: CT_Color;
  extLst?: CT_OfficeArtExtensionList;
  name: ST_String;
}

/**
 * Custom Color
 * @see ECMA-376 Part 1, §20.1.2.3.12
 */
export interface CT_CustomColor {
  colorChoice: EG_ColorChoice;
  name?: ST_String;
}

/**
 * Custom Color List
 * @see ECMA-376 Part 1, §20.1.2.3.13
 */
export interface CT_CustomColorList {
  custClr?: CT_CustomColor[];
}

/**
 * Color Mapping
 * Maps theme colors to specific color scheme colors.
 * @see ECMA-376 Part 1, §20.1.2.3.5 CT_ColorMapping
 */
export interface CT_ColorMapping {
  bg1?: string;
  tx1?: string;
  bg2?: string;
  tx2?: string;
  accent1?: string;
  accent2?: string;
  accent3?: string;
  accent4?: string;
  accent5?: string;
  accent6?: string;
  hlink?: string;
  folHlink?: string;
  extLst?: CT_OfficeArtExtensionList;
}

/**
 * Color Mapping Override
 * @see ECMA-376 Part 1, §20.1.2.3.9 CT_ColorMappingOverride
 */
export interface CT_ColorMappingOverride {
  masterClrMapping?: CT_ColorMapping;
  overrideClrMapping?: CT_ColorMapping;
}

/**
 * Color Change Effect
 * Effect that changes one color to another.
 * @see ECMA-376 Part 1, §20.1.2.3.2 CT_ColorChangeEffect
 */
export interface CT_ColorChangeEffect {
  clrFrom: CT_Color;
  clrTo: CT_Color;
  useA?: boolean;
}

/**
 * Color Replace Effect
 * Effect that replaces colors.
 * @see ECMA-376 Part 1, §20.1.2.3.8 CT_ColorReplaceEffect
 */
export interface CT_ColorReplaceEffect {
  colorChoice: EG_ColorChoice;
}

/**
 * Black and White Mode
 * Controls how colors are rendered in black and white mode.
 * @see ECMA-376 Part 1, §20.1.10.10 ST_BlackWhiteMode
 */
export enum ST_BlackWhiteMode {
  Clr = "clr",
  Auto = "auto",
  Gray = "gray",
  LtGray = "ltGray",
  InvGray = "invGray",
  GrayWhite = "grayWhite",
  BlackGray = "blackGray",
  BlackWhite = "blackWhite",
  Black = "black",
  White = "white",
  Hidden = "hidden",
}
