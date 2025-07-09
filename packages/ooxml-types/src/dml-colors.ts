/**
 * DrawingML Color Types - Complete Collection
 * Comprehensive export of all color-related types from DrawingML
 * @see ECMA-376 Part 1, Section 20.1.2 (Colors)
 */

// Re-export all color types from the organized dml/colors directory
export * from './dml/colors/color-types';
export * from './dml/colors/color-models';
export * from './dml/colors/color-transforms';

// Import shared types needed by color definitions
import type { ST_String, ST_HexColorRGB } from './shared/common-types';
import type { ST_Percentage, ST_FixedPercentage, ST_PositiveFixedPercentage } from './shared/measurement-types';
import type { CT_OfficeArtExtensionList } from './dml/core/extension-types';

// Import coordinate types
import type { 
  ST_Angle,
  ST_PositiveFixedAngle,
  CT_Angle,
  CT_PositiveFixedAngle,
  CT_Percentage,
  CT_FixedPercentage,
  CT_PositiveFixedPercentage,
  CT_PositivePercentage
} from './dml/core/coordinate-types';

// Import color model types
import type {
  CT_ScRgbColor,
  CT_SRgbColor,
  CT_HslColor,
  CT_SystemColor,
  CT_SchemeColor,
  CT_PresetColor,
  ST_SystemColorVal,
  ST_SchemeColorVal,
  ST_PresetColorVal
} from './dml/colors/color-models';

// Import color transform types
import type {
  EG_ColorTransform,
  CT_ComplementTransform,
  CT_InverseTransform,
  CT_GrayscaleTransform,
  CT_GammaTransform,
  CT_InverseGammaTransform
} from './dml/colors/color-transforms';

// Import main color types
import type {
  ST_ColorSchemeIndex,
  EG_ColorChoice,
  CT_Color,
  CT_ColorMRU,
  CT_ColorScheme,
  CT_CustomColor,
  CT_CustomColorList,
  CT_ColorMapping,
  CT_ColorMappingOverride,
  CT_ColorChangeEffect,
  CT_ColorReplaceEffect,
  ST_BlackWhiteMode
} from './dml/colors/color-types';

// Export all types as a convenience for consumers who want everything
export type {
  // Basic types
  ST_String,
  ST_HexColorRGB,
  ST_Percentage,
  ST_FixedPercentage,
  ST_PositiveFixedPercentage,
  ST_Angle,
  ST_PositiveFixedAngle,
  
  // Complex coordinate types
  CT_Angle,
  CT_PositiveFixedAngle,
  CT_Percentage,
  CT_FixedPercentage,
  CT_PositiveFixedPercentage,
  CT_PositivePercentage,
  
  // Extension types
  CT_OfficeArtExtensionList,
  
  // Color model enums
  ST_SystemColorVal,
  ST_SchemeColorVal,
  ST_PresetColorVal,
  
  // Color model types
  CT_ScRgbColor,
  CT_SRgbColor,
  CT_HslColor,
  CT_SystemColor,
  CT_SchemeColor,
  CT_PresetColor,
  
  // Color transform types
  EG_ColorTransform,
  CT_ComplementTransform,
  CT_InverseTransform,
  CT_GrayscaleTransform,
  CT_GammaTransform,
  CT_InverseGammaTransform,
  
  // Main color types
  ST_ColorSchemeIndex,
  EG_ColorChoice,
  CT_Color,
  CT_ColorMRU,
  CT_ColorScheme,
  CT_CustomColor,
  CT_CustomColorList,
  CT_ColorMapping,
  CT_ColorMappingOverride,
  CT_ColorChangeEffect,
  CT_ColorReplaceEffect,
  ST_BlackWhiteMode,
};