/**
 * DrawingML Color Model Types
 * @see ECMA-376 Part 1, §20.1.2.3 (Color Models)
 */

import type { ST_Percentage, ST_HexColorRGB } from '../../shared/index';
import type { ST_PositiveFixedAngle } from '../core/coordinate-types';
import type { EG_ColorTransform } from './color-transforms';

/**
 * scRGB Color (Scientific RGB).
 * RGB values as percentages.
 * @see ECMA-376 Part 1, §20.1.2.3.30 CT_ScRgbColor
 */
export interface CT_ScRgbColor {
  transforms?: EG_ColorTransform[];
  r: ST_Percentage;
  g: ST_Percentage;
  b: ST_Percentage;
}

/**
 * sRGB Color.
 * Standard RGB using hex values.
 * @see ECMA-376 Part 1, §20.1.2.3.32 CT_SRgbColor
 */
export interface CT_SRgbColor {
  transforms?: EG_ColorTransform[];
  val: ST_HexColorRGB;
}

/**
 * HSL Color (Hue, Saturation, Lightness).
 * @see ECMA-376 Part 1, §20.1.2.3.19 CT_HslColor
 */
export interface CT_HslColor {
  transforms?: EG_ColorTransform[];
  hue: ST_PositiveFixedAngle;
  sat: ST_Percentage;
  lum: ST_Percentage;
}

/**
 * System color values.
 * @see ECMA-376 Part 1, §20.1.10.58 ST_SystemColorVal
 */
export enum ST_SystemColorVal {
  ScrollBar = "scrollBar",
  Background = "background",
  ActiveCaption = "activeCaption",
  InactiveCaption = "inactiveCaption",
  Menu = "menu",
  Window = "window",
  WindowFrame = "windowFrame",
  MenuText = "menuText",
  WindowText = "windowText",
  CaptionText = "captionText",
  ActiveBorder = "activeBorder",
  InactiveBorder = "inactiveBorder",
  AppWorkspace = "appWorkspace",
  Highlight = "highlight",
  HighlightText = "highlightText",
  BtnFace = "btnFace",
  BtnShadow = "btnShadow",
  GrayText = "grayText",
  BtnText = "btnText",
  InactiveCaptionText = "inactiveCaptionText",
  BtnHighlight = "btnHighlight",
  ThreeDDkShadow = "3dDkShadow",
  ThreeDLight = "3dLight",
  InfoText = "infoText",
  InfoBk = "infoBk",
  HotLight = "hotLight",
  GradientActiveCaption = "gradientActiveCaption",
  GradientInactiveCaption = "gradientInactiveCaption",
  MenuHighlight = "menuHighlight",
  MenuBar = "menuBar",
}

/**
 * System Color.
 * @see ECMA-376 Part 1, §20.1.2.3.33 CT_SystemColor
 */
export interface CT_SystemColor {
  transforms?: EG_ColorTransform[];
  val: ST_SystemColorVal;
  lastClr?: ST_HexColorRGB;
}

/**
 * Scheme color values.
 * @see ECMA-376 Part 1, §20.1.10.54 ST_SchemeColorVal
 */
export enum ST_SchemeColorVal {
  Bg1 = "bg1",
  Tx1 = "tx1",
  Bg2 = "bg2",
  Tx2 = "tx2",
  Accent1 = "accent1",
  Accent2 = "accent2",
  Accent3 = "accent3",
  Accent4 = "accent4",
  Accent5 = "accent5",
  Accent6 = "accent6",
  Hlink = "hlink",
  FolHlink = "folHlink",
  PhClr = "phClr",
  Dk1 = "dk1",
  Lt1 = "lt1",
  Dk2 = "dk2",
  Lt2 = "lt2",
}

/**
 * Scheme Color.
 * @see ECMA-376 Part 1, §20.1.2.3.29 CT_SchemeColor
 */
export interface CT_SchemeColor {
  transforms?: EG_ColorTransform[];
  val: ST_SchemeColorVal;
}

/**
 * Preset color values (standard color names).
 * @see ECMA-376 Part 1, §20.1.10.47 ST_PresetColorVal
 */
export enum ST_PresetColorVal {
  AliceBlue = "aliceBlue",
  AntiqueWhite = "antiqueWhite",
  Aqua = "aqua",
  Aquamarine = "aquamarine",
  Azure = "azure",
  Beige = "beige",
  Bisque = "bisque",
  Black = "black",
  BlanchedAlmond = "blanchedAlmond",
  Blue = "blue",
  BlueViolet = "blueViolet",
  Brown = "brown",
  BurlyWood = "burlyWood",
  CadetBlue = "cadetBlue",
  Chartreuse = "chartreuse",
  Chocolate = "chocolate",
  Coral = "coral",
  CornflowerBlue = "cornflowerBlue",
  Cornsilk = "cornsilk",
  Crimson = "crimson",
  Cyan = "cyan",
  DarkBlue = "darkBlue",
  DarkCyan = "darkCyan",
  DarkGoldenrod = "darkGoldenrod",
  DarkGray = "darkGray",
  DarkGrey = "darkGrey",
  DarkGreen = "darkGreen",
  DarkKhaki = "darkKhaki",
  DarkMagenta = "darkMagenta",
  DarkOliveGreen = "darkOliveGreen",
  DarkOrange = "darkOrange",
  DarkOrchid = "darkOrchid",
  DarkRed = "darkRed",
  DarkSalmon = "darkSalmon",
  DarkSeaGreen = "darkSeaGreen",
  DarkSlateBlue = "darkSlateBlue",
  DarkSlateGray = "darkSlateGray",
  DarkSlateGrey = "darkSlateGrey",
  DarkTurquoise = "darkTurquoise",
  DarkViolet = "darkViolet",
  DeepPink = "deepPink",
  DeepSkyBlue = "deepSkyBlue",
  DimGray = "dimGray",
  DimGrey = "dimGrey",
  DodgerBlue = "dodgerBlue",
  Firebrick = "firebrick",
  FloralWhite = "floralWhite",
  ForestGreen = "forestGreen",
  Fuchsia = "fuchsia",
  Gainsboro = "gainsboro",
  GhostWhite = "ghostWhite",
  Gold = "gold",
  Goldenrod = "goldenrod",
  Gray = "gray",
  Grey = "grey",
  Green = "green",
  GreenYellow = "greenYellow",
  Honeydew = "honeydew",
  HotPink = "hotPink",
  IndianRed = "indianRed",
  Indigo = "indigo",
  Ivory = "ivory",
  Khaki = "khaki",
  Lavender = "lavender",
  LavenderBlush = "lavenderBlush",
  LawnGreen = "lawnGreen",
  LemonChiffon = "lemonChiffon",
  LightBlue = "lightBlue",
  LightCoral = "lightCoral",
  LightCyan = "lightCyan",
  LightGoldenrodYellow = "lightGoldenrodYellow",
  LightGray = "lightGray",
  LightGrey = "lightGrey",
  LightGreen = "lightGreen",
  LightPink = "lightPink",
  LightSalmon = "lightSalmon",
  LightSeaGreen = "lightSeaGreen",
  LightSkyBlue = "lightSkyBlue",
  LightSlateGray = "lightSlateGray",
  LightSlateGrey = "lightSlateGrey",
  LightSteelBlue = "lightSteelBlue",
  LightYellow = "lightYellow",
  Lime = "lime",
  LimeGreen = "limeGreen",
  Linen = "linen",
  Magenta = "magenta",
  Maroon = "maroon",
  MediumAquamarine = "mediumAquamarine",
  MediumBlue = "mediumBlue",
  MediumOrchid = "mediumOrchid",
  MediumPurple = "mediumPurple",
  MediumSeaGreen = "mediumSeaGreen",
  MediumSlateBlue = "mediumSlateBlue",
  MediumSpringGreen = "mediumSpringGreen",
  MediumTurquoise = "mediumTurquoise",
  MediumVioletRed = "mediumVioletRed",
  MidnightBlue = "midnightBlue",
  MintCream = "mintCream",
  MistyRose = "mistyRose",
  Moccasin = "moccasin",
  NavajoWhite = "navajoWhite",
  Navy = "navy",
  OldLace = "oldLace",
  Olive = "olive",
  OliveDrab = "oliveDrab",
  Orange = "orange",
  OrangeRed = "orangeRed",
  Orchid = "orchid",
  PaleGoldenrod = "paleGoldenrod",
  PaleGreen = "paleGreen",
  PaleTurquoise = "paleTurquoise",
  PaleVioletRed = "paleVioletRed",
  PapayaWhip = "papayaWhip",
  PeachPuff = "peachPuff",
  Peru = "peru",
  Pink = "pink",
  Plum = "plum",
  PowderBlue = "powderBlue",
  Purple = "purple",
  Red = "red",
  RosyBrown = "rosyBrown",
  RoyalBlue = "royalBlue",
  SaddleBrown = "saddleBrown",
  Salmon = "salmon",
  SandyBrown = "sandyBrown",
  SeaGreen = "seaGreen",
  SeaShell = "seaShell",
  Sienna = "sienna",
  Silver = "silver",
  SkyBlue = "skyBlue",
  SlateBlue = "slateBlue",
  SlateGray = "slateGray",
  SlateGrey = "slateGrey",
  Snow = "snow",
  SpringGreen = "springGreen",
  SteelBlue = "steelBlue",
  Tan = "tan",
  Teal = "teal",
  Thistle = "thistle",
  Tomato = "tomato",
  Turquoise = "turquoise",
  Violet = "violet",
  Wheat = "wheat",
  White = "white",
  WhiteSmoke = "whiteSmoke",
  Yellow = "yellow",
  YellowGreen = "yellowGreen",
}

/**
 * Preset Color.
 * @see ECMA-376 Part 1, §20.1.2.3.22 CT_PresetColor
 */
export interface CT_PresetColor {
  transforms?: EG_ColorTransform[];
  val: ST_PresetColorVal;
}