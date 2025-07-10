/**
 * WordprocessingML Run Properties Types
 * Based on wml.xsd run property definitions
 */

/**
 * WML underline type
 */
export type ST_WMLUnderline =
  | "single"
  | "words"
  | "double"
  | "thick"
  | "dotted"
  | "dottedHeavy"
  | "dash"
  | "dashedHeavy"
  | "dashLong"
  | "dashLongHeavy"
  | "dotDash"
  | "dashDotHeavy"
  | "dotDotDash"
  | "dashDotDotHeavy"
  | "wave"
  | "wavyHeavy"
  | "wavyDouble"
  | "none";

/**
 * Vertical alignment for WML runs
 */
export type ST_WMLVerticalAlignRun = "baseline" | "superscript" | "subscript";

/**
 * WML highlight color
 */
export type ST_WMLHighlightColor =
  | "black"
  | "blue"
  | "cyan"
  | "green"
  | "magenta"
  | "red"
  | "yellow"
  | "white"
  | "darkBlue"
  | "darkCyan"
  | "darkGreen"
  | "darkMagenta"
  | "darkRed"
  | "darkYellow"
  | "darkGray"
  | "lightGray"
  | "none";

/**
 * WML theme color
 */
export type ST_WMLThemeColor =
  | "dark1"
  | "light1"
  | "dark2"
  | "light2"
  | "accent1"
  | "accent2"
  | "accent3"
  | "accent4"
  | "accent5"
  | "accent6"
  | "hyperlink"
  | "followedHyperlink"
  | "none"
  | "background1"
  | "text1"
  | "background2"
  | "text2";

/**
 * WML text effect
 */
export type ST_WMLTextEffect =
  | "blinkBackground"
  | "lights"
  | "antsBlack"
  | "antsRed"
  | "shimmer"
  | "sparkle"
  | "none";

/**
 * Emphasis mark
 */
export type ST_Em = "none" | "dot" | "comma" | "circle" | "underDot";

/**
 * Font definition
 */
export interface CT_Fonts {
  /** ASCII font */
  ascii?: string;
  /** High ANSI font */
  hAnsi?: string;
  /** East Asian font */
  eastAsia?: string;
  /** Complex script font */
  cs?: string;
  /** Font hint */
  hint?: "default" | "eastAsia" | "cs";
}

/**
 * WML color definition
 */
export interface CT_WMLColor {
  /** Color value (hex) */
  val?: string;
  /** Theme color */
  themeColor?: ST_WMLThemeColor;
  /** Theme tint */
  themeTint?: string;
  /** Theme shade */
  themeShade?: string;
}

/**
 * WML underline definition
 */
export interface CT_WMLUnderline {
  /** Underline type */
  val?: ST_WMLUnderline;
  /** Underline color */
  color?: string;
  /** Theme color */
  themeColor?: ST_WMLThemeColor;
  /** Theme tint */
  themeTint?: string;
  /** Theme shade */
  themeShade?: string;
}

/**
 * WML highlight definition
 */
export interface CT_WMLHighlight {
  /** Highlight color */
  val: ST_WMLHighlightColor;
}

/**
 * Vertical alignment for WML runs
 */
export interface CT_WMLVerticalAlignRun {
  /** Vertical alignment value */
  val: ST_WMLVerticalAlignRun;
}

/**
 * WML text effect
 */
export interface CT_WMLTextEffect {
  /** Text effect value */
  val: ST_WMLTextEffect;
}

/**
 * Emphasis mark
 */
export interface CT_Em {
  /** Emphasis mark value */
  val: ST_Em;
}

/**
 * Language definition
 */
export interface CT_Language {
  /** Language value */
  val?: string;
  /** East Asian language */
  eastAsia?: string;
  /** Bidirectional language */
  bidi?: string;
}

/**
 * WML font size (half-points)
 */
export interface CT_WMLHpsMeasure {
  /** Font size value */
  val: number;
}

/**
 * Run properties
 */
export interface CT_RPr {
  /** Run style */
  rStyle?: string;
  /** Run fonts */
  rFonts?: CT_Fonts;
  /** Bold */
  b?: boolean;
  /** Bold complex script */
  bCs?: boolean;
  /** Italic */
  i?: boolean;
  /** Italic complex script */
  iCs?: boolean;
  /** Small caps */
  caps?: boolean;
  /** Small caps */
  smallCaps?: boolean;
  /** Strike through */
  strike?: boolean;
  /** Double strike through */
  dstrike?: boolean;
  /** Outline */
  outline?: boolean;
  /** Shadow */
  shadow?: boolean;
  /** Emboss */
  emboss?: boolean;
  /** Imprint */
  imprint?: boolean;
  /** No proofing */
  noProof?: boolean;
  /** Snap to grid */
  snapToGrid?: boolean;
  /** Vanish */
  vanish?: boolean;
  /** Web hidden */
  webHidden?: boolean;
  /** Color */
  color?: CT_WMLColor;
  /** Character spacing */
  spacing?: number;
  /** Character width scaling */
  w?: number;
  /** Kerning */
  kern?: number;
  /** Position */
  position?: number;
  /** Font size */
  sz?: CT_WMLHpsMeasure;
  /** Font size complex script */
  szCs?: CT_WMLHpsMeasure;
  /** Highlight */
  highlight?: CT_WMLHighlight;
  /** Underline */
  u?: CT_WMLUnderline;
  /** Text effect */
  effect?: CT_WMLTextEffect;
  /** Border */
  bdr?: any; // CT_Border
  /** Shading */
  shd?: any; // CT_Shd
  /** Fit text */
  fitText?: number;
  /** Vertical alignment */
  vertAlign?: CT_WMLVerticalAlignRun;
  /** Right to left */
  rtl?: boolean;
  /** Complex script */
  cs?: boolean;
  /** Emphasis mark */
  em?: CT_Em;
  /** Language */
  lang?: CT_Language;
  /** East Asian layout */
  eastAsianLayout?: any; // CT_EastAsianLayout
  /** Special vanish */
  specVanish?: boolean;
  /** Math */
  oMath?: boolean;
}
