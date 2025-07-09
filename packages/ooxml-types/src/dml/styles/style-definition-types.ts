/**
 * DrawingML Style Definition Types
 * Based on dml-main.xsd style definitions
 */

/**
 * Style matrix column index
 */
export type ST_DMLStyleMatrixColumnIndex = 0 | 1 | 2;

/**
 * Style matrix reference
 */
export interface CT_DMLStyleMatrixReference {
  /** Index */
  idx: ST_DMLStyleMatrixColumnIndex;
  /** Color */
  color?: any; // CT_Color variations
}

/**
 * Font collection index
 */
export type ST_DMLFontCollectionIndex = 'major' | 'minor' | 'none';

/**
 * Font reference
 */
export interface CT_DMLFontReference {
  /** Index */
  idx: ST_DMLFontCollectionIndex;
  /** Color */
  color?: any; // CT_Color variations
}

/**
 * Color scheme index
 */
export type ST_DMLColorSchemeIndex = 
  | 'dk1' | 'lt1' | 'dk2' | 'lt2' | 'accent1' | 'accent2' | 'accent3' 
  | 'accent4' | 'accent5' | 'accent6' | 'hlink' | 'folHlink';

/**
 * Color scheme reference
 */
export interface CT_DMLColorSchemeReference {
  /** Index */
  idx: ST_DMLColorSchemeIndex;
  /** Color */
  color?: any; // CT_Color variations
}

/**
 * Shape style
 */
export interface CT_DMLShapeStyle {
  /** Line reference */
  lnRef?: CT_DMLStyleMatrixReference;
  /** Fill reference */
  fillRef?: CT_DMLStyleMatrixReference;
  /** Effect reference */
  effectRef?: CT_DMLStyleMatrixReference;
  /** Font reference */
  fontRef?: CT_DMLFontReference;
}