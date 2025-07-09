/**
 * WordprocessingML Text Formatting Types
 * @see ECMA-376 Part 1, §17.18 (Text Formatting)
 */

import type { ST_OnOff, ST_String, ST_HexColorRGB } from '../shared/common-types';
import type { ST_UniversalMeasure } from '../shared/measurement-types';
import type { ST_TwipsMeasure } from '../shared/measurement-types';
import type { ST_UcharHexNumber, ST_HpsMeasure, CT_HpsMeasure, CT_SignedTwipsMeasure } from './basic-types';
import type { ST_TextAlignment, CT_TextAlignment } from './paragraph-types';

/**
 * Highlight colors.
 * @see ECMA-376 Part 1, §17.18.40 ST_HighlightColor
 */
export enum ST_HighlightColor {
  Black = "black",
  Blue = "blue",
  Cyan = "cyan",
  Green = "green",
  Magenta = "magenta",
  Red = "red",
  Yellow = "yellow",
  White = "white",
  DarkBlue = "darkBlue",
  DarkCyan = "darkCyan",
  DarkGreen = "darkGreen",
  DarkMagenta = "darkMagenta",
  DarkRed = "darkRed",
  DarkYellow = "darkYellow",
  DarkGray = "darkGray",
  LightGray = "lightGray",
  None = "none",
}

/**
 * Highlighting.
 * @see ECMA-376 Part 1, §17.3.2.18 CT_Highlight
 */
export interface CT_Highlight {
  val: ST_HighlightColor;
}

/**
 * Color value.
 * @see ECMA-376 Part 1, §17.18.97 ST_HexColor
 */
export type ST_HexColor = ST_HexColorRGB | "auto";

/**
 * Theme color.
 * @see ECMA-376 Part 1, §17.18.97 ST_ThemeColor
 */
export enum ST_ThemeColor {
  Dark1 = "dark1",
  Light1 = "light1",
  Dark2 = "dark2",
  Light2 = "light2",
  Accent1 = "accent1",
  Accent2 = "accent2",
  Accent3 = "accent3",
  Accent4 = "accent4",
  Accent5 = "accent5",
  Accent6 = "accent6",
  Hyperlink = "hyperlink",
  FollowedHyperlink = "followedHyperlink",
  None = "none",
  Background1 = "background1",
  Text1 = "text1",
  Background2 = "background2",
  Text2 = "text2",
}

/**
 * Color.
 * @see ECMA-376 Part 1, §17.3.2.6 CT_Color
 */
export interface CT_Color {
  val?: ST_HexColor;
  themeColor?: ST_ThemeColor;
  themeTint?: ST_UcharHexNumber;
  themeShade?: ST_UcharHexNumber;
}

/**
 * Underline patterns.
 * @see ECMA-376 Part 1, §17.18.99 ST_Underline
 */
export enum ST_Underline {
  Single = "single",
  Words = "words",
  Double = "double",
  Thick = "thick",
  Dotted = "dotted",
  DottedHeavy = "dottedHeavy",
  Dash = "dash",
  DashedHeavy = "dashedHeavy",
  DashLong = "dashLong",
  DashLongHeavy = "dashLongHeavy",
  DotDash = "dotDash",
  DashDotHeavy = "dashDotHeavy",
  DotDotDash = "dotDotDash",
  DashDotDotHeavy = "dashDotDotHeavy",
  Wave = "wave",
  WavyHeavy = "wavyHeavy",
  WavyDouble = "wavyDouble",
  None = "none",
}

/**
 * Underline.
 * @see ECMA-376 Part 1, §17.3.2.39 CT_Underline
 */
export interface CT_Underline {
  val?: ST_Underline;
  color?: ST_HexColor;
  themeColor?: ST_ThemeColor;
  themeTint?: ST_UcharHexNumber;
  themeShade?: ST_UcharHexNumber;
}

/**
 * Animated text effects.
 * @see ECMA-376 Part 1, §17.18.95 ST_TextEffect
 */
export enum ST_TextEffect {
  BlinkBackground = "blinkBackground",
  Lights = "lights",
  AntsBlack = "antsBlack",
  AntsRed = "antsRed",
  Shimmer = "shimmer",
  SparkleText = "sparkleText",
  None = "none",
}

/**
 * Animated text effect.
 * @see ECMA-376 Part 1, §17.3.2.38 CT_TextEffect
 */
export interface CT_TextEffect {
  val?: ST_TextEffect;
}


/**
 * Font size in half-points.
 * @see ECMA-376 Part 1, §17.3.2.38 CT_HpsMeasure
 */
export type { CT_HpsMeasure };

/**
 * Text scale.
 * @see ECMA-376 Part 1, §17.18.94 ST_TextScale
 */
export type ST_TextScale = string; // pattern: 0*[1-9][0-9]*%?

/**
 * Text scale.
 * @see ECMA-376 Part 1, §17.3.2.42 CT_TextScale
 */
export interface CT_TextScale {
  val?: ST_TextScale;
}

/**
 * Character spacing.
 * @see ECMA-376 Part 1, §17.3.2.35 CT_SignedTwipsMeasure
 */

/**
 * Universal measure (imported from basic-types).
 */
export type { ST_UniversalMeasure } from './basic-types';

/**
 * Twips measure (imported from shared).
 */
export type { ST_TwipsMeasure } from '../shared/measurement-types';

/**
 * Fit text.
 * @see ECMA-376 Part 1, §17.3.2.13 CT_FitText
 */
export interface CT_FitText {
  val?: ST_TwipsMeasure;
  id?: number; // xsd:unsignedInt
}