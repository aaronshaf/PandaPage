// wml.ts
import type { ST_OnOff, ST_String, ST_TwipsMeasure, ST_UnsignedDecimalNumber, ST_DecimalNumber, ST_HexColorRGB, ST_Lang, ST_Guid, ST_RelationshipId, ST_CalendarType } from './shared-types';
import type { CT_GvmlGroupShape, CT_GvmlGraphicalObjectFrame, CT_Inline, CT_Anchor } from './wordprocessing-drawing-types';
import type { EG_OMathMathElements } from './math-types';

export interface CT_Empty {}

export interface CT_OnOff {
  val?: ST_OnOff;
}

export type ST_LongHexNumber = string; // xsd:hexBinary with length 4
export interface CT_LongHexNumber {
  val: ST_LongHexNumber;
}

export type ST_ShortHexNumber = string; // xsd:hexBinary with length 2
export type ST_UcharHexNumber = string; // xsd:hexBinary with length 1

export interface CT_Charset {
  characterSet?: ST_String;
}

export type ST_DecimalNumberOrPercent = ST_String; // union of s:ST_Percentage and xsd:integer
export interface CT_DecimalNumber {
  val: ST_DecimalNumber;
}
export interface CT_UnsignedDecimalNumber {
  val: ST_UnsignedDecimalNumber;
}
export interface CT_DecimalNumberOrPrecent {
  val: ST_DecimalNumberOrPercent;
}

export interface CT_TwipsMeasure {
  val: ST_TwipsMeasure;
}

export type ST_SignedTwipsMeasure = number | ST_String; // union of xsd:integer and s:ST_UniversalMeasure
export interface CT_SignedTwipsMeasure {
  val: ST_SignedTwipsMeasure;
}

export type ST_PixelsMeasure = ST_UnsignedDecimalNumber;
export interface CT_PixelsMeasure {
  val: ST_PixelsMeasure;
}

export type ST_HpsMeasure = ST_UnsignedDecimalNumber | ST_String; // union of s:ST_UnsignedDecimalNumber and s:ST_PositiveUniversalMeasure
export interface CT_HpsMeasure {
  val: ST_HpsMeasure;
}

export type ST_SignedHpsMeasure = number | ST_String; // union of xsd:integer and s:ST_UniversalMeasure
export interface CT_SignedHpsMeasure {
  val: ST_SignedHpsMeasure;
}

export type ST_DateTime = string; // xsd:dateTime

export type ST_MacroName = string; // xsd:string with maxLength 33
export interface CT_MacroName {
  val: ST_MacroName;
}

export type ST_EighthPointMeasure = ST_UnsignedDecimalNumber;
export type ST_PointMeasure = ST_UnsignedDecimalNumber;

export interface CT_String {
  val: ST_String;
}

export type ST_TextScale = ST_String; // union of ST_TextScalePercent
export type ST_TextScalePercent = string; // pattern "0*(600|([0-5]?[0-9]?[0-9]))%"
export interface CT_TextScale {
  val?: ST_TextScale;
}

/**
 * Text highlighting colors for character runs.
 * Used to apply background highlighting to text.
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
export interface CT_Highlight {
  val: ST_HighlightColor;
}

export enum ST_HexColorAuto {
  Auto = "auto",
}
export type ST_HexColor = ST_HexColorAuto | ST_HexColorRGB;
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
}
export interface CT_Color {
  val: ST_HexColor;
  themeColor?: ST_ThemeColor;
  themeTint?: ST_UcharHexNumber;
  themeShade?: ST_UcharHexNumber;
}

export interface CT_Lang {
  val: ST_Lang;
}

export interface CT_Guid {
  val?: ST_Guid;
}

/**
 * Underline styles for character runs.
 * Defines various underlining patterns and styles for text.
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
export interface CT_Underline {
  val?: ST_Underline;
  color?: ST_HexColor;
  themeColor?: ST_ThemeColor;
  themeTint?: ST_UcharHexNumber;
  themeShade?: ST_UcharHexNumber;
}

export enum ST_TextEffect {
  BlinkBackground = "blinkBackground",
  Lights = "lights",
  AntsBlack = "antsBlack",
  AntsRed = "antsRed",
  Shimmer = "shimmer",
  Sparkle = "sparkle",
  None = "none",
}
export interface CT_TextEffect {
  val: ST_TextEffect;
}

/**
 * Border styles for table borders, paragraph borders, and character borders.
 * Defines the visual appearance of borders in Word documents.
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
  DecoArch = "decoArch",
  DecoArchColor = "decoArchColor",
  DecoBlocks = "decoBlocks",
  DiamondsGray = "diamondsGray",
  DoubleD = "doubleD",
  DoubleDiamonds = "doubleDiamonds",
  Earth1 = "earth1",
  Earth2 = "earth2",
  Earth3 = "earth3",
  EclipsingSquares1 = "eclipsingSquares1",
  EclipsingSquares2 = "eclipsingSquares2",
  EggsBlack = "eggsBlack",
  Fans = "fans",
  Film = "film",
  Firecrackers = "firecrackers",
  FlowersBlockPrint = "flowersBlockPrint",
  FlowersDaisies = "flowersDaisies",
  FlowersModern1 = "flowersModern1",
  FlowersModern2 = "flowersModern2",
  FlowersPansy = "flowersPansy",
  FlowersRedRose = "flowersRedRose",
  FlowersRoses = "flowersRoses",
  FlowersTeacup = "flowersTeacup",
  FlowersTiny = "flowersTiny",
  Gems = "gems",
  GingerbreadMan = "gingerbreadMan",
  Gradient = "gradient",
  Handmade1 = "handmade1",
  Handmade2 = "handmade2",
  HeartBalloon = "heartBalloon",
  HeartGray = "heartGray",
  Hearts = "hearts",
  HeebieJeebies = "heebieJeebies",
  Holly = "holly",
  HouseFunky = "houseFunky",
  Hypnotic = "hypnotic",
  IceCreamCones = "iceCreamCones",
  LightBulb = "lightBulb",
  Lightning1 = "lightning1",
  Lightning2 = "lightning2",
  MapPins = "mapPins",
  MapleLeaf = "mapleLeaf",
  MapleMuffins = "mapleMuffins",
  Marquee = "marquee",
  MarqueeToothed = "marqueeToothed",
  Moons = "moons",
  Mosaic = "mosaic",
  MusicNotes = "musicNotes",
  Northwest = "northwest",
  Ovals = "ovals",
  Packages = "packages",
  PalmsBlack = "palmsBlack",
  PalmsColor = "palmsColor",
  PaperClips = "paperClips",
  Papyrus = "papyrus",
  PartyFavor = "partyFavor",
  PartyGlass = "partyGlass",
  Pencils = "pencils",
  People = "people",
  PeopleWaving = "peopleWaving",
  PeopleHats = "peopleHats",
  Poinsettias = "poinsettias",
  PostageStamp = "postageStamp",
  Pumpkin1 = "pumpkin1",
  PushPinNote2 = "pushPinNote2",
  PushPinNote1 = "pushPinNote1",
  Pyramids = "pyramids",
  PyramidsAbove = "pyramidsAbove",
  Quadrants = "quadrants",
  Rings = "rings",
  Safari = "safari",
  Sawtooth = "sawtooth",
  SawtoothGray = "sawtoothGray",
  ScaredCat = "scaredCat",
  Seattle = "seattle",
  ShadowedSquares = "shadowedSquares",
  SharksTeeth = "sharksTeeth",
  ShorebirdTracks = "shorebirdTracks",
  Skyrocket = "skyrocket",
  SnowflakeFancy = "snowflakeFancy",
  Snowflakes = "snowflakes",
  Sombrero = "sombrero",
  Southwest = "southwest",
  Stars = "stars",
  StarsTop = "starsTop",
  Stars3d = "stars3d",
  StarsBlack = "starsBlack",
  StarsShadowed = "starsShadowed",
  Sun = "sun",
  Swirligig = "swirligig",
  TornPaper = "tornPaper",
  TornPaperBlack = "tornPaperBlack",
  Trees = "trees",
  TriangleParty = "triangleParty",
  Triangles = "triangles",
  Triangle1 = "triangle1",
  Triangle2 = "triangle2",
  TriangleCircle1 = "triangleCircle1",
  TriangleCircle2 = "triangleCircle2",
  Shapes1 = "shapes1",
  Shapes2 = "shapes2",
  TwistedLines1 = "twistedLines1",
  TwistedLines2 = "twistedLines2",
  Vine = "vine",
  Waveline = "waveline",
  WeavingAngles = "weavingAngles",
  WeavingBraid = "weavingBraid",
  WeavingRibbon = "weavingRibbon",
  WeavingStrips = "weavingStrips",
  WhiteFlowers = "whiteFlowers",
  Woodwork = "woodwork",
  XIllusions = "xIllusions",
  ZanyTriangles = "zanyTriangles",
  ZigZag = "zigZag",
  ZigZagStitch = "zigZagStitch",
  Custom = "custom",
}
export interface CT_Border {
  val: ST_Border;
  color?: ST_HexColor;
  themeColor?: ST_ThemeColor;
  themeTint?: ST_UcharHexNumber;
  themeShade?: ST_UcharHexNumber;
  sz?: ST_EighthPointMeasure;
  space?: ST_PointMeasure;
  shadow?: ST_OnOff;
  frame?: ST_OnOff;
}

/**
 * Shading patterns for paragraphs, table cells, and character runs.
 * Controls background fill and pattern for text and content areas.
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
export interface CT_Shd {
  val: ST_Shd;
  color?: ST_HexColor;
  themeColor?: ST_ThemeColor;
  themeTint?: ST_UcharHexNumber;
  themeShade?: ST_UcharHexNumber;
  fill?: ST_HexColor;
  themeFill?: ST_ThemeColor;
  themeFillTint?: ST_UcharHexNumber;
  themeFillShade?: ST_UcharHexNumber;
}

export interface CT_VerticalAlignRun {
  val: ST_String; // s:ST_VerticalAlignRun
}

export interface CT_FitText {
  val: ST_TwipsMeasure;
  id?: ST_DecimalNumber;
}

export enum ST_Em {
  None = "none",
  Dot = "dot",
  Comma = "comma",
  Circle = "circle",
  UnderDot = "underDot",
}
export interface CT_Em {
  val: ST_Em;
}

export interface CT_Language {
  val?: ST_Lang;
  eastAsia?: ST_Lang;
  bidi?: ST_Lang;
}

export enum ST_CombineBrackets {
  None = "none",
  Round = "round",
  Square = "square",
  Angle = "angle",
  Curly = "curly",
}
export interface CT_EastAsianLayout {
  id?: ST_DecimalNumber;
  combine?: ST_OnOff;
  combineBrackets?: ST_CombineBrackets;
  vert?: ST_OnOff;
  vertCompress?: ST_OnOff;
}

export enum ST_HeightRule {
  Auto = "auto",
  Exact = "exact",
  AtLeast = "atLeast",
}

export enum ST_Wrap {
  Auto = "auto",
  NotBeside = "notBeside",
  Around = "around",
  Tight = "tight",
  Through = "through",
  None = "none",
}

export enum ST_VAnchor {
  Text = "text",
  Margin = "margin",
  Page = "page",
}

export enum ST_HAnchor {
  Text = "text",
  Margin = "margin",
  Page = "page",
}

export enum ST_DropCap {
  None = "none",
  Drop = "drop",
  Margin = "margin",
}
export interface CT_FramePr {
  dropCap?: ST_DropCap;
  lines?: ST_DecimalNumber;
  w?: ST_TwipsMeasure;
  h?: ST_TwipsMeasure;
  vSpace?: ST_TwipsMeasure;
  hSpace?: ST_TwipsMeasure;
  wrap?: ST_Wrap;
  hAnchor?: ST_HAnchor;
  vAnchor?: ST_VAnchor;
  x?: ST_SignedTwipsMeasure;
  xAlign?: ST_String; // s:ST_XAlign
  y?: ST_SignedTwipsMeasure;
  yAlign?: ST_String; // s:ST_YAlign
  hRule?: ST_HeightRule;
  anchorLock?: ST_OnOff;
}

export enum ST_TabJc {
  Clear = "clear",
  Start = "start",
  Center = "center",
  End = "end",
  Decimal = "decimal",
  Bar = "bar",
  Num = "num",
}

export enum ST_TabTlc {
  None = "none",
  Dot = "dot",
  Hyphen = "hyphen",
  Underscore = "underscore",
  Heavy = "heavy",
  MiddleDot = "middleDot",
}
export interface CT_TabStop {
  val: ST_TabJc;
  leader?: ST_TabTlc;
  pos: ST_SignedTwipsMeasure;
}

export enum ST_LineSpacingRule {
  Auto = "auto",
  Exact = "exact",
  AtLeast = "atLeast",
}
export interface CT_Spacing {
  before?: ST_TwipsMeasure;
  beforeLines?: ST_DecimalNumber;
  beforeAutospacing?: ST_OnOff;
  after?: ST_TwipsMeasure;
  afterLines?: ST_DecimalNumber;
  afterAutospacing?: ST_OnOff;
  line?: ST_SignedTwipsMeasure;
  lineRule?: ST_LineSpacingRule;
}

export interface CT_Ind {
  start?: ST_SignedTwipsMeasure;
  startChars?: ST_DecimalNumber;
  end?: ST_SignedTwipsMeasure;
  endChars?: ST_DecimalNumber;
  hanging?: ST_TwipsMeasure;
  hangingChars?: ST_DecimalNumber;
  firstLine?: ST_TwipsMeasure;
  firstLineChars?: ST_DecimalNumber;
}

/**
 * Paragraph justification/alignment.
 * Controls horizontal alignment of paragraph text.
 * @see ECMA-376 Part 1, §17.18.44 ST_Jc
 */
export enum ST_Jc {
  Start = "start",
  Center = "center",
  End = "end",
  Both = "both",
  MediumKashida = "mediumKashida",
  Distribute = "distribute",
  NumTab = "numTab",
  HighKashida = "highKashida",
  LowKashida = "lowKashida",
  ThaiDistribute = "thaiDistribute",
}

export enum ST_JcTable {
  Center = "center",
  End = "end",
  Start = "start",
}
export interface CT_Jc {
  val: ST_Jc;
}
export interface CT_JcTable {
  val: ST_JcTable;
}

export enum ST_View {
  None = "none",
  Print = "print",
  Outline = "outline",
  MasterPages = "masterPages",
  Normal = "normal",
  Web = "web",
}
export interface CT_View {
  val: ST_View;
}

export enum ST_Zoom {
  None = "none",
  FullPage = "fullPage",
  BestFit = "bestFit",
  TextFit = "textFit",
}
export interface CT_Zoom {
  val?: ST_Zoom;
  percent: ST_DecimalNumberOrPercent;
}

export interface CT_WritingStyle {
  lang: ST_Lang;
  vendorID: ST_String;
  dllVersion: ST_String;
  nlCheck?: ST_OnOff;
  checkStyle: ST_OnOff;
  appName: ST_String;
}

export enum ST_Proof {
  Clean = "clean",
  Dirty = "dirty",
}
export interface CT_Proof {
  spelling?: ST_Proof;
  grammar?: ST_Proof;
}

export type ST_DocType = ST_String;
export interface CT_DocType {
  val: ST_DocType;
}

export enum ST_DocProtect {
  None = "none",
  ReadOnly = "readOnly",
  Comments = "comments",
  TrackedChanges = "trackedChanges",
  Forms = "forms",
}
export interface AG_Password {
  algorithmName?: ST_String;
  hashValue?: string; // xsd:base64Binary
  saltValue?: string; // xsd:base64Binary
  spinCount?: ST_DecimalNumber;
}
export interface CT_DocProtect extends AG_Password {
  edit?: ST_DocProtect;
  formatting?: ST_OnOff;
  enforcement?: ST_OnOff;
}

export enum ST_MailMergeDocType {
  Catalog = "catalog",
  Envelopes = "envelopes",
  MailingLabels = "mailingLabels",
  FormLetters = "formLetters",
  Email = "email",
  Fax = "fax",
}
export interface CT_MailMergeDocType {
  val: ST_MailMergeDocType;
}

export type ST_MailMergeDataType = ST_String;
export interface CT_MailMergeDataType {
  val: ST_MailMergeDataType;
}

export enum ST_MailMergeDest {
  NewDocument = "newDocument",
  Printer = "printer",
  Email = "email",
  Fax = "fax",
}
export interface CT_MailMergeDest {
  val: ST_MailMergeDest;
}

export enum ST_MailMergeOdsoFMDFieldType {
  Null = "null",
  DbColumn = "dbColumn",
}
export interface CT_MailMergeOdsoFMDFieldType {
  val: ST_MailMergeOdsoFMDFieldType;
}

export interface CT_TrackChangesView {
  markup?: ST_OnOff;
  comments?: ST_OnOff;
  insDel?: ST_OnOff;
  formatting?: ST_OnOff;
  inkAnnotations?: ST_OnOff;
}

export interface CT_Kinsoku {
  lang: ST_Lang;
  val: ST_String;
}

export enum ST_TextDirection {
  Tb = "tb",
  Rl = "rl",
  Lr = "lr",
  TbV = "tbV",
  RlV = "rlV",
  LrV = "lrV",
}
export interface CT_TextDirection {
  val: ST_TextDirection;
}

export enum ST_TextAlignment {
  Top = "top",
  Center = "center",
  Baseline = "baseline",
  Bottom = "bottom",
  Auto = "auto",
}
export interface CT_TextAlignment {
  val: ST_TextAlignment;
}

export enum ST_DisplacedByCustomXml {
  Next = "next",
  Prev = "prev",
}

export enum ST_AnnotationVMerge {
  Cont = "cont",
  Rest = "rest",
}

export interface CT_Markup {
  id: ST_DecimalNumber;
}

export interface CT_TrackChange extends CT_Markup {
  author: ST_String;
  date?: ST_DateTime;
}

export interface CT_CellMergeTrackChange extends CT_TrackChange {
  vMerge?: ST_AnnotationVMerge;
  vMergeOrig?: ST_AnnotationVMerge;
}

export interface CT_TrackChangeRange extends CT_TrackChange {
  displacedByCustomXml?: ST_DisplacedByCustomXml;
}

export interface CT_MarkupRange extends CT_Markup {
  displacedByCustomXml?: ST_DisplacedByCustomXml;
}

export interface CT_BookmarkRange extends CT_MarkupRange {
  colFirst?: ST_DecimalNumber;
  colLast?: ST_DecimalNumber;
}

export interface CT_Bookmark extends CT_BookmarkRange {
  name: ST_String;
}

export interface CT_MoveBookmark extends CT_Bookmark {
  author: ST_String;
  date: ST_DateTime;
}

export interface CT_Comment extends CT_TrackChange {
  // EG_BlockLevelElts group is complex, will represent as any for now or define later
  // EG_BlockLevelElts?: any[];
  initials?: ST_String;
}

// Placeholder for complex types that are extended or contain other complex types
// These will be defined as needed when their full structure is clear or when they are directly used.
export interface CT_TblPrExChange extends CT_TrackChange {
  tblPrEx: any; // CT_TblPrExBase
}
export interface CT_TcPrChange extends CT_TrackChange {
  tcPr: any; // CT_TcPrInner
}
export interface CT_TrPrChange extends CT_TrackChange {
  trPr: any; // CT_TrPrBase
}
export interface CT_TblGridChange extends CT_Markup {
  tblGrid: any; // CT_TblGridBase
}
export interface CT_TblPrChange extends CT_TrackChange {
  tblPr: any; // CT_TblPrBase
}
export interface CT_SectPrChange extends CT_TrackChange {
  sectPr?: any; // CT_SectPrBase
}
export interface CT_PPrChange extends CT_TrackChange {
  pPr: any; // CT_PPrBase
}
export interface CT_RPrChange extends CT_TrackChange {
  rPr: any; // CT_RPrOriginal
}
export interface CT_ParaRPrChange extends CT_TrackChange {
  rPr: any; // CT_ParaRPrOriginal
}
export interface CT_RunTrackChange extends CT_TrackChange {
  // EG_ContentRunContent or m:EG_OMathMathElements
  content?: any[];
}

export type EG_PContentMath = any; // Placeholder for now
export type EG_PContentBase = any; // Placeholder for now
export type EG_ContentRunContentBase = any; // Placeholder for now
export type EG_CellMarkupElements = any; // Placeholder for now
export type EG_RangeMarkupElements = any; // Placeholder for now

export interface CT_NumPr {
  ilvl?: CT_DecimalNumber;
  numId?: CT_DecimalNumber;
  ins?: CT_TrackChange;
}

export interface CT_PBdr {
  top?: CT_Border;
  left?: CT_Border;
  bottom?: CT_Border;
  right?: CT_Border;
  between?: CT_Border;
  bar?: CT_Border;
}

export interface CT_Tabs {
  tab: CT_TabStop[];
}

export enum ST_TextboxTightWrap {
  None = "none",
  AllLines = "allLines",
  FirstAndLastLine = "firstAndLastLine",
  FirstLineOnly = "firstLineOnly",
  LastLineOnly = "lastLineOnly",
}
export interface CT_TextboxTightWrap {
  val: ST_TextboxTightWrap;
}

export interface CT_PPrBase {
  pStyle?: CT_String;
  keepNext?: CT_OnOff;
  keepLines?: CT_OnOff;
  pageBreakBefore?: CT_OnOff;
  framePr?: CT_FramePr;
  widowControl?: CT_OnOff;
  numPr?: CT_NumPr;
  suppressLineNumbers?: CT_OnOff;
  pBdr?: CT_PBdr;
  shd?: CT_Shd;
  tabs?: CT_Tabs;
  suppressAutoHyphens?: CT_OnOff;
  kinsoku?: CT_OnOff;
  wordWrap?: CT_OnOff;
  overflowPunct?: CT_OnOff;
  topLinePunct?: CT_OnOff;
  autoSpaceDE?: CT_OnOff;
  autoSpaceDN?: CT_OnOff;
  bidi?: CT_OnOff;
  adjustRightInd?: CT_OnOff;
  snapToGrid?: CT_OnOff;
  spacing?: CT_Spacing;
  ind?: CT_Ind;
  contextualSpacing?: CT_OnOff;
  mirrorIndents?: CT_OnOff;
  suppressOverlap?: CT_OnOff;
  jc?: CT_Jc;
  textDirection?: CT_TextDirection;
  textAlignment?: CT_TextAlignment;
  textboxTightWrap?: CT_TextboxTightWrap;
  outlineLvl?: CT_DecimalNumber;
  divId?: CT_DecimalNumber;
  cnfStyle?: any; // CT_Cnf
}

export interface CT_PPr extends CT_PPrBase {
  rPr?: any; // CT_ParaRPr
  sectPr?: any; // CT_SectPr
  pPrChange?: CT_PPrChange;
}

export interface CT_PPrGeneral extends CT_PPrBase {
  pPrChange?: CT_PPrChange;
}

export interface CT_Control {
  name?: ST_String;
  shapeid?: ST_String;
  id?: ST_RelationshipId; // r:id
}

export interface CT_Background {
  drawing?: any; // CT_Drawing
  color?: ST_HexColor;
  themeColor?: ST_ThemeColor;
  themeTint?: ST_UcharHexNumber;
  themeShade?: ST_UcharHexNumber;
}

export interface CT_Rel {
  id: ST_RelationshipId; // r:id
}

export interface CT_Object {
  drawing?: any; // CT_Drawing
  control?: CT_Control;
  objectLink?: CT_ObjectLink;
  objectEmbed?: CT_ObjectEmbed;
  movie?: CT_Rel;
  dxaOrig?: ST_TwipsMeasure;
  dyaOrig?: ST_TwipsMeasure;
}

export interface CT_ObjectEmbed {
  drawAspect?: ST_ObjectDrawAspect;
  id: ST_RelationshipId; // r:id
  progId?: ST_String;
  shapeId?: ST_String;
  fieldCodes?: ST_String;
}

export enum ST_ObjectDrawAspect {
  Content = "content",
  Icon = "icon",
}

export interface CT_ObjectLink extends CT_ObjectEmbed {
  updateMode: ST_ObjectUpdateMode;
  lockedField?: ST_OnOff;
}

export enum ST_ObjectUpdateMode {
  Always = "always",
  OnCall = "onCall",
}

export interface CT_Drawing {
  anchor?: CT_Anchor;
  inline?: CT_Inline;
}

export interface CT_SimpleField {
  // EG_PContent group is complex, will represent as any for now or define later
  // EG_PContent?: any[];
  instr: ST_String;
  fldLock?: ST_OnOff;
  dirty?: ST_OnOff;
}

export enum ST_FldCharType {
  Begin = "begin",
  Separate = "separate",
  End = "end",
}

export enum ST_InfoTextType {
  Text = "text",
  AutoText = "autoText",
}

export type ST_FFHelpTextVal = string; // maxLength 256
export type ST_FFStatusTextVal = string; // maxLength 140
export type ST_FFName = string; // maxLength 65

export enum ST_FFTextType {
  Regular = "regular",
  Number = "number",
  Date = "date",
  CurrentTime = "currentTime",
  CurrentDate = "currentDate",
  Calculated = "calculated",
}
export interface CT_FFTextType {
  val: ST_FFTextType;
}

export interface CT_FFName {
  val?: ST_FFName;
}

export interface CT_FldChar {
  ffData?: any; // CT_FFData
  fldCharType: ST_FldCharType;
  fldLock?: ST_OnOff;
  dirty?: ST_OnOff;
}

export interface CT_Hyperlink {
  // EG_PContent group is complex, will represent as any for now or define later
  // EG_PContent?: any[];
  tgtFrame?: ST_String;
  tooltip?: ST_String;
  docLocation?: ST_String;
  history?: ST_OnOff;
  anchor?: ST_String;
  id?: ST_RelationshipId; // r:id
}

export interface CT_FFData {
  name?: CT_FFName;
  label?: CT_DecimalNumber;
  tabIndex?: CT_UnsignedDecimalNumber;
  enabled?: CT_OnOff;
  calcOnExit?: CT_OnOff;
  entryMacro?: CT_MacroName;
  exitMacro?: CT_MacroName;
  helpText?: any; // CT_FFHelpText
  statusText?: any; // CT_FFStatusText
  checkBox?: any; // CT_FFCheckBox
  ddList?: any; // CT_FFDDList
  textInput?: any; // CT_FFTextInput
}

export interface CT_FFHelpText {
  type?: ST_InfoTextType;
  val?: ST_FFHelpTextVal;
}

export interface CT_FFStatusText {
  type?: ST_InfoTextType;
  val?: ST_FFStatusTextVal;
}

export interface CT_FFCheckBox {
  size?: CT_HpsMeasure;
  sizeAuto?: CT_OnOff;
  default?: CT_OnOff;
  checked?: CT_OnOff;
}

export interface CT_FFDDList {
  result?: CT_DecimalNumber;
  default?: CT_DecimalNumber;
  listEntry?: CT_String[];
}

export interface CT_FFTextInput {
  type?: CT_FFTextType;
  default?: CT_String;
  maxLength?: CT_DecimalNumber;
  format?: CT_String;
}

export enum ST_SectionMark {
  NextPage = "nextPage",
  NextColumn = "nextColumn",
  Continuous = "continuous",
  EvenPage = "evenPage",
  OddPage = "oddPage",
}
export interface CT_SectType {
  val?: ST_SectionMark;
}

export interface CT_PaperSource {
  first?: ST_DecimalNumber;
  other?: ST_DecimalNumber;
}

export enum ST_NumberFormat {
  Decimal = "decimal",
  UpperRoman = "upperRoman",
  LowerRoman = "lowerRoman",
  UpperLetter = "upperLetter",
  LowerLetter = "lowerLetter",
  Ordinal = "ordinal",
  CardinalText = "cardinalText",
  OrdinalText = "ordinalText",
  Hex = "hex",
  Chicago = "chicago",
  IdeographDigital = "ideographDigital",
  JapaneseCounting = "japaneseCounting",
  Aiueo = "aiueo",
  Iroha = "iroha",
  DecimalFullWidth = "decimalFullWidth",
  DecimalHalfWidth = "decimalHalfWidth",
  JapaneseLegal = "japaneseLegal",
  JapaneseDigitalTenThousand = "japaneseDigitalTenThousand",
  DecimalEnclosedCircle = "decimalEnclosedCircle",
  DecimalFullWidth2 = "decimalFullWidth2",
  AiueoFullWidth = "aiueoFullWidth",
  IrohaFullWidth = "irohaFullWidth",
  DecimalZero = "decimalZero",
  Bullet = "bullet",
  Ganada = "ganada",
  Chosung = "chosung",
  DecimalEnclosedFullstop = "decimalEnclosedFullstop",
  DecimalEnclosedParen = "decimalEnclosedParen",
  DecimalEnclosedCircleChinese = "decimalEnclosedCircleChinese",
  IdeographEnclosedCircle = "ideographEnclosedCircle",
  IdeographTraditional = "ideographTraditional",
  IdeographZodiac = "ideographZodiac",
  IdeographZodiacTraditional = "ideographZodiacTraditional",
  TaiwaneseCounting = "taiwaneseCounting",
  IdeographLegalTraditional = "ideographLegalTraditional",
  TaiwaneseCountingThousand = "taiwaneseCountingThousand",
  TaiwaneseDigital = "taiwaneseDigital",
  ChineseCounting = "chineseCounting",
  ChineseLegalSimplified = "chineseLegalSimplified",
  ChineseCountingThousand = "chineseCountingThousand",
  KoreanDigital = "koreanDigital",
  KoreanCounting = "koreanCounting",
  KoreanLegal = "koreanLegal",
  KoreanDigital2 = "koreanDigital2",
  VietnameseCounting = "vietnameseCounting",
  RussianLower = "russianLower",
  RussianUpper = "russianUpper",
  None = "none",
  NumberInDash = "numberInDash",
  Hebrew1 = "hebrew1",
  Hebrew2 = "hebrew2",
  ArabicAlpha = "arabicAlpha",
  ArabicAbjad = "arabicAbjad",
  HindiVowels = "hindiVowels",
  HindiConsonants = "hindiConsonants",
  HindiNumbers = "hindiNumbers",
  HindiCounting = "hindiCounting",
  ThaiLetters = "thaiLetters",
  ThaiNumbers = "thaiNumbers",
  ThaiCounting = "thaiCounting",
  BahtText = "bahtText",
  DollarText = "dollarText",
  Custom = "custom",
}

export enum ST_PageOrientation {
  Portrait = "portrait",
  Landscape = "landscape",
}
export interface CT_PageSz {
  w?: ST_TwipsMeasure;
  h?: ST_TwipsMeasure;
  orient?: ST_PageOrientation;
  code?: ST_DecimalNumber;
}

export interface CT_PageMar {
  top: ST_SignedTwipsMeasure;
  right: ST_TwipsMeasure;
  bottom: ST_SignedTwipsMeasure;
  left: ST_TwipsMeasure;
  header: ST_TwipsMeasure;
  footer: ST_TwipsMeasure;
  gutter: ST_TwipsMeasure;
}

export enum ST_PageBorderZOrder {
  Front = "front",
  Back = "back",
}

export enum ST_PageBorderDisplay {
  AllPages = "allPages",
  FirstPage = "firstPage",
  NotFirstPage = "notFirstPage",
}

export enum ST_PageBorderOffset {
  Page = "page",
  Text = "text",
}
export interface CT_PageBorders {
  top?: CT_TopPageBorder;
  left?: CT_PageBorder;
  bottom?: CT_BottomPageBorder;
  right?: CT_PageBorder;
  zOrder?: ST_PageBorderZOrder;
  display?: ST_PageBorderDisplay;
  offsetFrom?: ST_PageBorderOffset;
}

export interface CT_PageBorder extends CT_Border {
  id?: ST_RelationshipId; // r:id
}

export interface CT_BottomPageBorder extends CT_PageBorder {
  bottomLeft?: ST_RelationshipId; // r:bottomLeft
  bottomRight?: ST_RelationshipId; // r:bottomRight
}

export interface CT_TopPageBorder extends CT_PageBorder {
  topLeft?: ST_RelationshipId; // r:topLeft
  topRight?: ST_RelationshipId; // r:topRight
}

export enum ST_ChapterSep {
  Hyphen = "hyphen",
  Period = "period",
  Colon = "colon",
  EmDash = "emDash",
  EnDash = "enDash",
}

export enum ST_LineNumberRestart {
  NewPage = "newPage",
  NewSection = "newSection",
  Continuous = "continuous",
}
export interface CT_LineNumber {
  countBy?: ST_DecimalNumber;
  start?: ST_DecimalNumber;
  distance?: ST_TwipsMeasure;
  restart?: ST_LineNumberRestart;
}

export interface CT_PageNumber {
  fmt?: ST_NumberFormat;
  start?: ST_DecimalNumber;
  chapStyle?: ST_DecimalNumber;
  chapSep?: ST_ChapterSep;
}

export interface CT_Column {
  w?: ST_TwipsMeasure;
  space?: ST_TwipsMeasure;
}

export interface CT_Columns {
  col?: CT_Column[];
  equalWidth?: ST_OnOff;
  space?: ST_TwipsMeasure;
  num?: ST_DecimalNumber;
  sep?: ST_OnOff;
}

export enum ST_VerticalJc {
  Top = "top",
  Center = "center",
  Both = "both",
  Bottom = "bottom",
}
export interface CT_VerticalJc {
  val: ST_VerticalJc;
}

export enum ST_DocGrid {
  Default = "default",
  Lines = "lines",
  LinesAndChars = "linesAndChars",
  SnapToChars = "snapToChars",
}
export interface CT_DocGrid {
  type?: ST_DocGrid;
  linePitch?: ST_DecimalNumber;
  charSpace?: ST_DecimalNumber;
}

export enum ST_HdrFtr {
  Even = "even",
  Default = "default",
  First = "first",
}

export enum ST_FtnEdn {
  Normal = "normal",
  Separator = "separator",
  ContinuationSeparator = "continuationSeparator",
  ContinuationNotice = "continuationNotice",
}
export interface CT_HdrFtrRef extends CT_Rel {
  type: ST_HdrFtr;
}

export interface CT_HdrFtr {
  // EG_BlockLevelElts: any[];
}

export interface AG_SectPrAttributes {
  rsidRPr?: ST_LongHexNumber;
  rsidDel?: ST_LongHexNumber;
  rsidR?: ST_LongHexNumber;
  rsidSect?: ST_LongHexNumber;
}

export interface CT_SectPrBase extends AG_SectPrAttributes {
  // EG_SectPrContents?: any;
}

export interface CT_SectPr extends CT_SectPrBase {
  // EG_HdrFtrReferences?: any[];
  // EG_SectPrContents?: any;
  sectPrChange?: CT_SectPrChange;
}

export enum ST_BrType {
  Page = "page",
  Column = "column",
  TextWrapping = "textWrapping",
}

export enum ST_BrClear {
  None = "none",
  Left = "left",
  Right = "right",
  All = "all",
}
export interface CT_Br {
  type?: ST_BrType;
  clear?: ST_BrClear;
}

export enum ST_PTabAlignment {
  Left = "left",
  Center = "center",
  Right = "right",
}

export enum ST_PTabRelativeTo {
  Margin = "margin",
  Indent = "indent",
}

export enum ST_PTabLeader {
  None = "none",
  Dot = "dot",
  Hyphen = "hyphen",
  Underscore = "underscore",
  Heavy = "heavy",
  MiddleDot = "middleDot",
}
export interface CT_PTab {
  alignment: ST_PTabAlignment;
  relativeTo: ST_PTabRelativeTo;
  leader: ST_PTabLeader;
}

export interface CT_Sym {
  font?: ST_String;
  char?: ST_ShortHexNumber;
}

export enum ST_ProofErr {
  SpellStart = "spellStart",
  SpellEnd = "spellEnd",
  GramStart = "gramStart",
  GramEnd = "gramEnd",
}
export interface CT_ProofErr {
  type: ST_ProofErr;
}

export enum ST_EdGrp {
  None = "none",
  Everyone = "everyone",
  Administrators = "administrators",
  Contributors = "contributors",
  Editors = "editors",
  Owners = "owners",
  Current = "current",
}

export interface CT_Perm {
  id: ST_String;
  displacedByCustomXml?: ST_DisplacedByCustomXml;
}

export interface CT_PermStart extends CT_Perm {
  edGrp?: ST_EdGrp;
  ed?: ST_String;
  colFirst?: ST_DecimalNumber;
  colLast?: ST_DecimalNumber;
}

export interface CT_Text {
  _text: ST_String; // Content of the element
  "xml:space"?: ST_String; // xml:space attribute
}

export type EG_RunInnerContent = 
  | { br: CT_Br }
  | { t: CT_Text }
  | { contentPart: CT_Rel }
  | { delText: CT_Text }
  | { instrText: CT_Text }
  | { delInstrText: CT_Text }
  | { noBreakHyphen: CT_Empty }
  | { softHyphen: CT_Empty }
  | { dayShort: CT_Empty }
  | { monthShort: CT_Empty }
  | { yearShort: CT_Empty }
  | { dayLong: CT_Empty }
  | { monthLong: CT_Empty }
  | { yearLong: CT_Empty }
  | { annotationRef: CT_Empty }
  | { footnoteRef: CT_Empty }
  | { endnoteRef: CT_Empty }
  | { separator: CT_Empty }
  | { continuationSeparator: CT_Empty }
  | { sym: CT_Sym }
  | { pgNum: CT_Empty }
  | { cr: CT_Empty }
  | { tab: CT_Empty }
  | { object: CT_Object }
  | { fldChar: CT_FldChar }
  | { ruby: CT_Ruby }
  | { footnoteReference: CT_FtnEdnRef }
  | { endnoteReference: CT_FtnEdnRef }
  | { commentReference: CT_Markup }
  | { drawing: CT_Drawing }
  | { ptab: CT_PTab }
  | { lastRenderedPageBreak: CT_Empty };

export interface CT_R {
  rPr?: EG_RPr;
  content?: EG_RunInnerContent[];
  rsidRPr?: ST_LongHexNumber;
  rsidDel?: ST_LongHexNumber;
  rsidR?: ST_LongHexNumber;
}

export enum ST_Hint {
  Default = "default",
  EastAsia = "eastAsia",
}

export enum ST_Theme {
  MajorEastAsia = "majorEastAsia",
  MajorBidi = "majorBidi",
  MajorAscii = "majorAscii",
  MajorHAnsi = "majorHAnsi",
  MinorEastAsia = "minorEastAsia",
  MinorBidi = "minorBidi",
  MinorAscii = "minorAscii",
  MinorHAnsi = "minorHAnsi",
}

export interface CT_Fonts {
  hint?: ST_Hint;
  ascii?: ST_String;
  hAnsi?: ST_String;
  eastAsia?: ST_String;
  cs?: ST_String;
  asciiTheme?: ST_Theme;
  hAnsiTheme?: ST_Theme;
  eastAsiaTheme?: ST_Theme;
  cstheme?: ST_Theme;
}

export type EG_RPrBase = 
  | { rStyle: CT_String }
  | { rFonts: CT_Fonts }
  | { b: CT_OnOff }
  | { bCs: CT_OnOff }
  | { i: CT_OnOff }
  | { iCs: CT_OnOff }
  | { caps: CT_OnOff }
  | { smallCaps: CT_OnOff }
  | { strike: CT_OnOff }
  | { dstrike: CT_OnOff }
  | { outline: CT_OnOff }
  | { shadow: CT_OnOff }
  | { emboss: CT_OnOff }
  | { imprint: CT_OnOff }
  | { noProof: CT_OnOff }
  | { snapToGrid: CT_OnOff }
  | { vanish: CT_OnOff }
  | { webHidden: CT_OnOff }
  | { color: CT_Color }
  | { spacing: CT_SignedTwipsMeasure }
  | { w: CT_TextScale }
  | { kern: CT_HpsMeasure }
  | { position: CT_SignedHpsMeasure }
  | { sz: CT_HpsMeasure }
  | { szCs: CT_HpsMeasure }
  | { highlight: CT_Highlight }
  | { u: CT_Underline }
  | { effect: CT_TextEffect }
  | { bdr: CT_Border }
  | { shd: CT_Shd }
  | { fitText: CT_FitText }
  | { vertAlign: CT_VerticalAlignRun }
  | { rtl: CT_OnOff }
  | { cs: CT_OnOff }
  | { em: CT_Em }
  | { lang: CT_Language }
  | { eastAsianLayout: CT_EastAsianLayout }
  | { specVanish: CT_OnOff }
  | { oMath: CT_OnOff };

export type EG_RPrContent = 
  | EG_RPrBase[]
  | { rPrChange: CT_RPrChange };

export interface CT_RPr {
  rPrContent?: EG_RPrContent;
}

export type EG_RPr = 
  | { rPr: CT_RPr };

export type EG_RPrMath = 
  | EG_RPr
  | { ins: CT_MathCtrlIns }
  | { del: CT_MathCtrlDel };

export interface CT_MathCtrlIns extends CT_TrackChange {
  del?: CT_RPrChange;
  rPr?: CT_RPr;
}

export interface CT_MathCtrlDel extends CT_TrackChange {
  rPr?: CT_RPr;
}

export interface CT_RPrOriginal {
  rPrBase?: EG_RPrBase[];
}

export interface CT_ParaRPrOriginal {
  paraRPrTrackChanges?: EG_ParaRPrTrackChanges;
  rPrBase?: EG_RPrBase[];
}

export interface CT_ParaRPr {
  paraRPrTrackChanges?: EG_ParaRPrTrackChanges;
  rPrBase?: EG_RPrBase[];
  rPrChange?: CT_ParaRPrChange;
}

export interface EG_ParaRPrTrackChanges {
  ins?: CT_TrackChange;
  del?: CT_TrackChange;
  moveFrom?: CT_TrackChange;
  moveTo?: CT_TrackChange;
}

export interface CT_AltChunk {
  altChunkPr?: CT_AltChunkPr;
  id?: ST_RelationshipId; // r:id
}

export interface CT_AltChunkPr {
  matchSrc?: CT_OnOff;
}

export enum ST_RubyAlign {
  Center = "center",
  DistributeLetter = "distributeLetter",
  DistributeSpace = "distributeSpace",
  Left = "left",
  Right = "right",
  RightVertical = "rightVertical",
}
export interface CT_RubyAlign {
  val: ST_RubyAlign;
}

export interface CT_RubyPr {
  rubyAlign: CT_RubyAlign;
  hps: CT_HpsMeasure;
  hpsRaise: CT_HpsMeasure;
  hpsBaseText: CT_HpsMeasure;
  lid: CT_Lang;
  dirty?: CT_OnOff;
}

export type EG_RubyContent = 
  | { r: CT_R }
  | EG_RunLevelElts[];

export interface CT_RubyContent {
  rubyContent?: EG_RubyContent[];
}

export interface CT_Ruby {
  rubyPr: CT_RubyPr;
  rt: CT_RubyContent;
  rubyBase: CT_RubyContent;
}

export enum ST_Lock {
  SdtLocked = "sdtLocked",
  ContentLocked = "contentLocked",
  Unlocked = "unlocked",
  SdtContentLocked = "sdtContentLocked",
}
export interface CT_Lock {
  val?: ST_Lock;
}

export interface CT_SdtListItem {
  displayText?: ST_String;
  value?: ST_String;
}

export enum ST_SdtDateMappingType {
  Text = "text",
  Date = "date",
  DateTime = "dateTime",
}
export interface CT_SdtDateMappingType {
  val?: ST_SdtDateMappingType;
}

export interface CT_CalendarType {
  val?: ST_CalendarType;
}

export interface CT_SdtDate {
  dateFormat?: CT_String;
  lid?: CT_Lang;
  storeMappedDataAs?: CT_SdtDateMappingType;
  calendar?: CT_CalendarType;
  fullDate?: ST_DateTime;
}

export interface CT_SdtComboBox {
  listItem?: CT_SdtListItem[];
  lastValue?: ST_String;
}

export interface CT_SdtDocPart {
  docPartGallery?: CT_String;
  docPartCategory?: CT_String;
  docPartUnique?: CT_OnOff;
}

export interface CT_SdtDropDownList {
  listItem?: CT_SdtListItem[];
  lastValue?: ST_String;
}

export interface CT_Placeholder {
  docPart: CT_String;
}

export interface CT_SdtText {
  multiLine?: ST_OnOff;
}

export interface CT_DataBinding {
  prefixMappings?: ST_String;
  xpath: ST_String;
  storeItemID: ST_String;
}

export interface CT_SdtPr {
  rPr?: CT_RPr;
  alias?: CT_String;
  tag?: CT_String;
  id?: CT_DecimalNumber;
  lock?: CT_Lock;
  placeholder?: CT_Placeholder;
  temporary?: CT_OnOff;
  showingPlcHdr?: CT_OnOff;
  dataBinding?: CT_DataBinding;
  label?: CT_DecimalNumber;
  tabIndex?: CT_UnsignedDecimalNumber;
  sdtType?: (
    | { equation: CT_Empty }
    | { comboBox: CT_SdtComboBox }
    | { date: CT_SdtDate }
    | { docPartObj: CT_SdtDocPart }
    | { docPartList: CT_SdtDocPart }
    | { dropDownList: CT_SdtDropDownList }
    | { picture: CT_Empty }
    | { richText: CT_Empty }
    | { text: CT_SdtText }
    | { citation: CT_Empty }
    | { group: CT_Empty }
    | { bibliography: CT_Empty }
  );
}

export type EG_BlockLevelElts = any; // Placeholder for now
export type EG_RunLevelElts = any; // Placeholder for now
export interface CT_FtnEdnRef { // Placeholder for now
  id: ST_DecimalNumber;
}