/**
 * WordprocessingML Border and Shading Types
 * @see ECMA-376 Part 1, §17.18 (Borders and Shading)
 */

import type { ST_UcharHexNumber } from './basic-types';
import type { ST_HexColor, ST_ThemeColor } from './text-formatting-types';

/**
 * Border styles.
 * @see ECMA-376 Part 1, §17.18.2 ST_Border
 */
export enum ST_Border {
  Nil = "nil",
  None = "none",
  Single = "single",
  Thick = "thick",
  Double = "double",
  Dotted = "dotted",
  Dashed = "dashed",
  DotDash = "dotDash",
  DotDotDash = "dotDotDash",
  Triple = "triple",
  ThinThickSmallGap = "thinThickSmallGap",
  ThickThinSmallGap = "thickThinSmallGap",
  ThinThickThinSmallGap = "thinThickThinSmallGap",
  ThinThickMediumGap = "thinThickMediumGap",
  ThickThinMediumGap = "thickThinMediumGap",
  ThinThickThinMediumGap = "thinThickThinMediumGap",
  ThinThickLargeGap = "thinThickLargeGap",
  ThickThinLargeGap = "thickThinLargeGap",
  ThinThickThinLargeGap = "thinThickThinLargeGap",
  Wave = "wave",
  DoubleWave = "doubleWave",
  DashSmallGap = "dashSmallGap",
  DashDotStroked = "dashDotStroked",
  ThreeDEmboss = "threeDEmboss",
  ThreeDEngrave = "threeDEngrave",
  Outset = "outset",
  Inset = "inset",
  Apples = "apples",
  ArchedScallops = "archedScallops",
  BabyPacifier = "babyPacifier",
  BabyRattle = "babyRattle",
  Balloons3Colors = "balloons3Colors",
  BalloonsHotAir = "balloonsHotAir",
  BasicBlackDashes = "basicBlackDashes",
  BasicBlackDots = "basicBlackDots",
  BasicBlackSquares = "basicBlackSquares",
  BasicThinLines = "basicThinLines",
  BasicWhiteDashes = "basicWhiteDashes",
  BasicWhiteDots = "basicWhiteDots",
  BasicWhiteSquares = "basicWhiteSquares",
  BasicWideInline = "basicWideInline",
  BasicWideMidline = "basicWideMidline",
  BasicWideOutline = "basicWideOutline",
  Bats = "bats",
  Birds = "birds",
  BirdsFlight = "birdsFlight",
  Cabins = "cabins",
  CakeSlice = "cakeSlice",
  CandyCorn = "candyCorn",
  CelticKnotwork = "celticKnotwork",
  CertificateBanner = "certificateBanner",
  ChainLink = "chainLink",
  ChampagneBottle = "champagneBottle",
  CheckedBarBlack = "checkedBarBlack",
  CheckedBarColor = "checkedBarColor",
  Checkered = "checkered",
  ChristmasTree = "christmasTree",
  CirclesLines = "circlesLines",
  CirclesRectangles = "circlesRectangles",
  ClassicalWave = "classicalWave",
  Clocks = "clocks",
  Compass = "compass",
  Confetti = "confetti",
  ConfettiGrays = "confettiGrays",
  ConfettiOutline = "confettiOutline",
  ConfettiStreamers = "confettiStreamers",
  ConfettiWhite = "confettiWhite",
  CornerTriangles = "cornerTriangles",
  CouponCutoutDashes = "couponCutoutDashes",
  CouponCutoutDots = "couponCutoutDots",
  CrazyMaze = "crazyMaze",
  CreaturesButterfly = "creaturesButterfly",
  CreaturesFish = "creaturesFish",
  CreaturesInsects = "creaturesInsects",
  CreaturesLadyBug = "creaturesLadyBug",
  CrossStitch = "crossStitch",
  Cup = "cup",
  // ... additional border patterns omitted for brevity
  Custom = "custom",
}

/**
 * Border definition.
 * @see ECMA-376 Part 1, §17.3.2.3 CT_Border
 */
export interface CT_Border {
  val?: ST_Border;
  color?: ST_HexColor;
  themeColor?: ST_ThemeColor;
  themeTint?: ST_UcharHexNumber;
  themeShade?: ST_UcharHexNumber;
  sz?: number; // Eighths of a point (xsd:unsignedLong)
  space?: number; // Points (xsd:unsignedLong)
  shadow?: boolean;
  frame?: boolean;
}

/**
 * Shading patterns.
 * @see ECMA-376 Part 1, §17.18.78 ST_Shd
 */
export enum ST_Shd {
  Nil = "nil",
  Clear = "clear",
  Solid = "solid",
  HorzStripe = "horzStripe",
  VertStripe = "vertStripe",
  ReverseDiagStripe = "reverseDiagStripe",
  DiagStripe = "diagStripe",
  HorzCross = "horzCross",
  DiagCross = "diagCross",
  ThinHorzStripe = "thinHorzStripe",
  ThinVertStripe = "thinVertStripe",
  ThinReverseDiagStripe = "thinReverseDiagStripe",
  ThinDiagStripe = "thinDiagStripe",
  ThinHorzCross = "thinHorzCross",
  ThinDiagCross = "thinDiagCross",
  Pct5 = "pct5",
  Pct10 = "pct10",
  Pct12 = "pct12",
  Pct15 = "pct15",
  Pct20 = "pct20",
  Pct25 = "pct25",
  Pct30 = "pct30",
  Pct35 = "pct35",
  Pct37 = "pct37",
  Pct40 = "pct40",
  Pct45 = "pct45",
  Pct50 = "pct50",
  Pct55 = "pct55",
  Pct60 = "pct60",
  Pct62 = "pct62",
  Pct65 = "pct65",
  Pct70 = "pct70",
  Pct75 = "pct75",
  Pct80 = "pct80",
  Pct85 = "pct85",
  Pct87 = "pct87",
  Pct90 = "pct90",
  Pct95 = "pct95",
}

/**
 * Shading.
 * @see ECMA-376 Part 1, §17.3.2.32 CT_Shd
 */
export interface CT_Shd {
  val?: ST_Shd;
  color?: ST_HexColor;
  fill?: ST_HexColor;
  themeColor?: ST_ThemeColor;
  themeTint?: ST_UcharHexNumber;
  themeShade?: ST_UcharHexNumber;
  themeFill?: ST_ThemeColor;
  themeFillTint?: ST_UcharHexNumber;
  themeFillShade?: ST_UcharHexNumber;
}