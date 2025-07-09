/**
 * DrawingML Text Property Types
 * @see ECMA-376 Part 1, §21.1 (Text)
 */

import type { ST_Coordinate32, ST_Percentage, ST_PositiveFixedPercentage } from '../core/coordinate-types';
import type { ST_TextVerticalType, ST_TextVerticalOverflowType, ST_TextHorizontalOverflowType, ST_TextAnchoringType, ST_TextWrappingType } from './text-enums';
import type { CT_OfficeArtExtensionList } from '../core/extension-types';

/**
 * Text Body Properties.
 * @see ECMA-376 Part 1, §21.1.2.1.1 CT_TextBodyProperties
 */
export interface CT_TextBodyProperties {
  flatTx?: CT_FlatText;
  extLst?: CT_OfficeArtExtensionList;
  rot?: number; // ST_Angle
  spcFirstLastPara?: boolean;
  upright?: boolean;
  anchor?: ST_TextAnchoringType;
  anchorCtr?: boolean;
  vert?: ST_TextVerticalType;
  wrap?: ST_TextWrappingType;
  lIns?: ST_Coordinate32;
  tIns?: ST_Coordinate32;
  rIns?: ST_Coordinate32;
  bIns?: ST_Coordinate32;
  numCol?: number; // xsd:int
  spcCol?: ST_Coordinate32;
  rtlCol?: boolean;
  fromWordArt?: boolean;
  forceAA?: boolean;
  compatLnSpc?: boolean;
  vertOverflow?: ST_TextVerticalOverflowType;
  horzOverflow?: ST_TextHorizontalOverflowType;
}

/**
 * Flat text properties.
 * @see ECMA-376 Part 1, §21.1.2.1.10 CT_FlatText
 */
export interface CT_FlatText {
  z?: ST_Coordinate32;
}

/**
 * Text spacing.
 * @see ECMA-376 Part 1, §21.1.2.2.11 CT_TextSpacing
 */
export interface CT_TextSpacing {
  spcPct?: ST_PositiveFixedPercentage;
  spcPts?: number; // ST_TextSpacingPoint
}

/**
 * Text spacing point.
 * Range: 0 to 15840000 (inclusive)
 * @see ECMA-376 Part 1, §20.1.10.77 ST_TextSpacingPoint
 */
export type ST_TextSpacingPoint = number;

/**
 * Text spacing percentage.
 * Range: 0% to 600%
 * @see ECMA-376 Part 1, §20.1.10.76 ST_TextSpacingPercentage
 */
export type ST_TextSpacingPercentage = ST_Percentage;