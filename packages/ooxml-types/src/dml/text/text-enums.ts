/**
 * DrawingML Text Enumeration Types
 * @see ECMA-376 Part 1, §20.1.10 (Text Simple Types)
 */

/**
 * Text vertical alignment types.
 * @see ECMA-376 Part 1, §20.1.10.81 ST_TextVerticalType
 */
export enum ST_TextVerticalType {
  Horz = "horz",
  Vert = "vert",
  Vert270 = "vert270",
  WordArtVert = "wordArtVert",
  EaVert = "eaVert",
  MongolianVert = "mongolianVert",
  WordArtVertRtl = "wordArtVertRtl",
}

/**
 * Text vertical overflow types.
 * @see ECMA-376 Part 1, §20.1.10.83 ST_TextVerticalOverflowType
 */
export enum ST_TextVerticalOverflowType {
  Overflow = "overflow",
  Ellipsis = "ellipsis",
  Clip = "clip",
}

/**
 * Text horizontal overflow types.
 * @see ECMA-376 Part 1, §20.1.10.40 ST_TextHorizontalOverflowType
 */
export enum ST_TextHorizontalOverflowType {
  Overflow = "overflow",
  Clip = "clip",
}

/**
 * Text anchoring types.
 * @see ECMA-376 Part 1, §20.1.10.60 ST_TextAnchoringType
 */
export enum ST_TextAnchoringType {
  T = "t",
  Ctr = "ctr",
  B = "b",
  Just = "just",
  JustLow = "justLow",
  Dist = "dist",
  ThaiDist = "thaiDist",
}

/**
 * Text wrapping types.
 * @see ECMA-376 Part 1, §20.1.10.84 ST_TextWrappingType
 */
export enum ST_TextWrappingType {
  Square = "square",
  None = "none",
}

/**
 * Text auto-numbering schemes.
 * @see ECMA-376 Part 1, §20.1.10.61 ST_TextAutonumberScheme
 */
export enum ST_TextAutonumberScheme {
  AlphaLcParenthesis = "alphaLcParenthesis",
  AlphaUcParenthesis = "alphaUcParenthesis",
  AlphaLcPeriod = "alphaLcPeriod",
  AlphaUcPeriod = "alphaUcPeriod",
  ArabicPeriod = "arabicPeriod",
  ArabicParenthesis = "arabicParenthesis",
  RomanLcParenthesis = "romanLcParenthesis",
  RomanUcParenthesis = "romanUcParenthesis",
  RomanLcPeriod = "romanLcPeriod",
  RomanUcPeriod = "romanUcPeriod",
  CircleNum = "circleNum",
  DblCircleNum = "dblCircleNum",
  SquareNum = "squareNum",
  ZeroDotNum = "zeroDotNum",
  Bullet = "bullet",
  Korean = "korean",
  KoreanBracket = "koreanBracket",
  KoreanPeriod = "koreanPeriod",
  Arabic1 = "arabic1",
  Arabic2 = "arabic2",
  Hebrew1 = "hebrew1",
  JpnChsDec = "jpnChsDec",
  JpnBidi = "jpnBidi",
  JpnTrad = "jpnTrad",
  ChsAlpha = "chsAlpha",
  ChsNew = "chsNew",
  ChsBidi = "chsBidi",
  Cns = "cns",
  ChsCns = "chsCns",
  JpnEa = "jpnEa",
  JpnAp = "jpnAp",
  JpnCs = "jpnCs",
}

/**
 * Text alignment types.
 * @see ECMA-376 Part 1, §20.1.10.59 ST_TextAlignType
 */
export enum ST_TextAlignType {
  L = "l",
  Ctr = "ctr",
  R = "r",
  Just = "just",
  JustLow = "justLow",
  Dist = "dist",
  ThaiDist = "thaiDist",
}

/**
 * Text font alignment types.
 * @see ECMA-376 Part 1, §20.1.10.66 ST_TextFontAlignType
 */
export enum ST_TextFontAlignType {
  Auto = "auto",
  T = "t",
  Ctr = "ctr",
  B = "b",
  Base = "base",
}

/**
 * Text tab alignment types.
 * @see ECMA-376 Part 1, §20.1.10.79 ST_TextTabAlignType
 */
export enum ST_TextTabAlignType {
  L = "l",
  Ctr = "ctr",
  R = "r",
  Dec = "dec",
}

/**
 * Text underline types.
 * @see ECMA-376 Part 1, §20.1.10.82 ST_TextUnderlineType
 */
export enum ST_TextUnderlineType {
  None = "none",
  Words = "words",
  Single = "single",
  Double = "double",
  Heavy = "heavy",
  Dotted = "dotted",
  DottedHeavy = "dottedHeavy",
  Dash = "dash",
  DashHeavy = "dashHeavy",
  DashLong = "dashLong",
  DashLongHeavy = "dashLongHeavy",
  DotDash = "dotDash",
  DotDashHeavy = "dotDashHeavy",
  DotDotDash = "dotDotDash",
  DotDotDashHeavy = "dotDotDashHeavy",
  Wavy = "wavy",
  WavyHeavy = "wavyHeavy",
  DashDotDotHeavy = "dashDotDotHeavy",
  WavyDouble = "wavyDouble",
}

/**
 * Text strike-through types.
 * @see ECMA-376 Part 1, §20.1.10.78 ST_TextStrikeType
 */
export enum ST_TextStrikeType {
  NoStrike = "noStrike",
  SingleStrike = "singleStrike",
  DoubleStrike = "doubleStrike",
}

/**
 * Text capitalization types.
 * @see ECMA-376 Part 1, §20.1.10.64 ST_TextCapsType
 */
export enum ST_TextCapsType {
  None = "none",
  Small = "small",
  All = "all",
}

/**
 * Text shape types.
 * @see ECMA-376 Part 1, §20.1.10.76 ST_TextShapeType
 */
export enum ST_TextShapeType {
  TextNoShape = "textNoShape",
  TextPlain = "textPlain",
  TextStop = "textStop",
  TextTriangle = "textTriangle",
  TextTriangleInverted = "textTriangleInverted",
  TextChevron = "textChevron",
  TextChevronInverted = "textChevronInverted",
  TextRingInside = "textRingInside",
  TextRingOutside = "textRingOutside",
  TextArchUp = "textArchUp",
  TextArchDown = "textArchDown",
  TextCircle = "textCircle",
  TextButton = "textButton",
  TextArchUpPour = "textArchUpPour",
  TextArchDownPour = "textArchDownPour",
  TextCirclePour = "textCirclePour",
  TextButtonPour = "textButtonPour",
  TextCurveUp = "textCurveUp",
  TextCurveDown = "textCurveDown",
  TextCanUp = "textCanUp",
  TextCanDown = "textCanDown",
  TextWave1 = "textWave1",
  TextWave2 = "textWave2",
  TextDoubleWave1 = "textDoubleWave1",
  TextWave4 = "textWave4",
  TextInflate = "textInflate",
  TextDeflate = "textDeflate",
  TextInflateBottom = "textInflateBottom",
  TextDeflateBottom = "textDeflateBottom",
  TextInflateTop = "textInflateTop",
  TextDeflateTop = "textDeflateTop",
  TextDeflateInflate = "textDeflateInflate",
  TextDeflateInflateDeflate = "textDeflateInflateDeflate",
  TextFadeRight = "textFadeRight",
  TextFadeLeft = "textFadeLeft",
  TextFadeUp = "textFadeUp",
  TextFadeDown = "textFadeDown",
  TextSlantUp = "textSlantUp",
  TextSlantDown = "textSlantDown",
  TextCascadeUp = "textCascadeUp",
  TextCascadeDown = "textCascadeDown",
}
