/**
 * DrawingML Color Types
 * @see ECMA-376 Part 1, Section 20.1.2 (Colors)
 */

import type { ST_String } from '../../shared/common-types';
import type { CT_OfficeArtExtensionList } from '../core/extension-types';
import type { 
  CT_ScRgbColor,
  CT_SRgbColor,
  CT_HslColor,
  CT_SystemColor,
  CT_SchemeColor,
  CT_PresetColor
} from './color-models';

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
 * Base color interface.
 * Will be expanded with EG_ColorChoice group.
 * @see ECMA-376 Part 1, §20.1.2.3.3 CT_Color
 */
export interface CT_Color {
  // Placeholder - will be union of color types
  scrgbClr?: CT_ScRgbColor;
  srgbClr?: CT_SRgbColor;
  hslClr?: CT_HslColor;
  sysClr?: CT_SystemColor;
  schemeClr?: CT_SchemeColor;
  prstClr?: CT_PresetColor;
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
  // EG_ColorChoice is a group, will define later
  name?: ST_String;
}

/**
 * Custom Color List
 * @see ECMA-376 Part 1, §20.1.2.3.13
 */
export interface CT_CustomColorList {
  custClr?: CT_CustomColor[];
}

