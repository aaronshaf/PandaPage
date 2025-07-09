// dml-main.ts
import type { ST_RelationshipId, ST_Guid, ST_String, ST_HexColorRGB, ST_UniversalMeasure, ST_PositiveUniversalMeasure, ST_Percentage, ST_FixedPercentage, ST_PositiveFixedPercentage } from './shared-types';

// Forward declarations for types that might be referenced before they are fully defined
export interface CT_OfficeArtExtensionList {}
export interface CT_Color {}

export interface CT_AudioFile {
  extLst?: CT_OfficeArtExtensionList;
  link: ST_RelationshipId;
  contentType?: ST_String;
}

export interface CT_VideoFile {
  extLst?: CT_OfficeArtExtensionList;
  link: ST_RelationshipId;
  contentType?: ST_String;
}

export interface CT_QuickTimeFile {
  extLst?: CT_OfficeArtExtensionList;
  link: ST_RelationshipId;
}

export interface CT_AudioCDTime {
  track: number; // xsd:unsignedByte
  time?: number; // xsd:unsignedInt
}

export interface CT_AudioCD {
  st: CT_AudioCDTime;
  end: CT_AudioCDTime;
  extLst?: CT_OfficeArtExtensionList;
}

export type EG_Media = 
  | { audioCd: CT_AudioCD }
  | { wavAudioFile: CT_EmbeddedWAVAudioFile }
  | { audioFile: CT_AudioFile }
  | { videoFile: CT_VideoFile }
  | { quickTimeFile: CT_QuickTimeFile };

export type ST_StyleMatrixColumnIndex = number; // xsd:unsignedInt

export enum ST_FontCollectionIndex {
  Major = "major",
  Minor = "minor",
  None = "none",
}

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

export interface CT_CustomColor {
  // EG_ColorChoice is a group, will define later
  name?: ST_String;
}

export interface CT_SupplementalFont {
  script: ST_String;
  typeface: ST_String; // ST_TextTypeface
}

export interface CT_CustomColorList {
  custClr?: CT_CustomColor[];
}

export interface CT_TextFont {
  // This type is referenced but not defined in dml-main.xsd, assuming it's a simple string for typeface
  typeface: ST_String;
}

export interface CT_FontCollection {
  latin: CT_TextFont;
  ea: CT_TextFont;
  cs: CT_TextFont;
  font?: CT_SupplementalFont[];
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_EffectStyleItem {
  // EG_EffectProperties is a group, will define later
  scene3d?: CT_Scene3D;
  sp3d?: CT_Shape3D;
}

export interface CT_FontScheme {
  majorFont: CT_FontCollection;
  minorFont: CT_FontCollection;
  extLst?: CT_OfficeArtExtensionList;
  name: ST_String;
}

export interface CT_FillStyleList {
  // EG_FillProperties is a group, will define later
  fillProperties: any[]; // Placeholder
}

export interface CT_LineProperties {
  // This type is referenced but not defined in dml-main.xsd, assuming it's a complex type for line formatting
  // Will define as any for now
  lineProperties: any;
}

export interface CT_LineStyleList {
  ln: CT_LineProperties[];
}

export interface CT_EffectStyleList {
  effectStyle: CT_EffectStyleItem[];
}

export interface CT_BackgroundFillStyleList {
  // EG_FillProperties is a group, will define later
  fillProperties: any[]; // Placeholder
}

export interface CT_StyleMatrix {
  fillStyleLst: CT_FillStyleList;
  lnStyleLst: CT_LineStyleList;
  effectStyleLst: CT_EffectStyleList;
  bgFillStyleLst: CT_BackgroundFillStyleList;
  name?: ST_String;
}

export interface CT_BaseStyles {
  clrScheme: CT_ColorScheme;
  fontScheme: CT_FontScheme;
  fmtScheme: CT_StyleMatrix;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_OfficeArtExtension {
  any?: any[]; // xsd:any
  uri: string; // xsd:token
}

export interface CT_OfficeArtExtensionList {
  ext?: CT_OfficeArtExtension[];
}

export type ST_Coordinate = ST_CoordinateUnqualified | ST_UniversalMeasure;
export type ST_CoordinateUnqualified = number; // xsd:long, minInclusive -27273042329600, maxInclusive 27273042316900
export type ST_Coordinate32 = ST_Coordinate32Unqualified | ST_UniversalMeasure;
export type ST_Coordinate32Unqualified = number; // xsd:int
export type ST_PositiveCoordinate = number; // xsd:long, minInclusive 0, maxInclusive 27273042316900
export type ST_PositiveCoordinate32 = number; // ST_Coordinate32Unqualified, minInclusive 0

export type ST_Angle = number; // xsd:int
export interface CT_Angle {
  val: ST_Angle;
}

export type ST_FixedAngle = number; // ST_Angle, minExclusive -5400000, maxExclusive 5400000
export type ST_PositiveFixedAngle = number; // ST_Angle, minInclusive 0, maxExclusive 21600000
export interface CT_PositiveFixedAngle {
  val: ST_PositiveFixedAngle;
}

// Redefinitions of shared percentage types as complex types with 'val' attribute
export interface CT_Percentage {
  val: ST_Percentage;
}
export interface CT_PositivePercentage {
  val: ST_PositiveFixedPercentage;
}
export interface CT_FixedPercentage {
  val: ST_FixedPercentage;
}
export interface CT_PositiveFixedPercentage {
  val: ST_PositiveFixedPercentage;
}

export interface CT_Ratio {
  n: number; // xsd:long
  d: number; // xsd:long
}

export interface CT_Point2D {
  x: ST_Coordinate;
  y: ST_Coordinate;
}

export interface CT_PositiveSize2D {
  cx: ST_PositiveCoordinate;
  cy: ST_PositiveCoordinate;
}

export interface CT_ComplementTransform {}
export interface CT_InverseTransform {}
export interface CT_GrayscaleTransform {}
export interface CT_GammaTransform {}
export interface CT_InverseGammaTransform {}

export type EG_ColorTransform = 
  | { tint: CT_PositiveFixedPercentage }
  | { shade: CT_PositiveFixedPercentage }
  | { comp: CT_ComplementTransform }
  | { inv: CT_InverseTransform }
  | { gray: CT_GrayscaleTransform }
  | { alpha: CT_PositiveFixedPercentage }
  | { alphaOff: CT_FixedPercentage }
  | { alphaMod: CT_PositivePercentage }
  | { hue: CT_PositiveFixedAngle }
  | { hueOff: CT_Angle }
  | { hueMod: CT_PositivePercentage }
  | { sat: CT_Percentage }
  | { satOff: CT_Percentage }
  | { satMod: CT_Percentage }
  | { lum: CT_Percentage }
  | { lumOff: CT_Percentage }
  | { lumMod: CT_Percentage }
  | { red: CT_Percentage }
  | { redOff: CT_Percentage }
  | { redMod: CT_Percentage }
  | { green: CT_Percentage }
  | { greenOff: CT_Percentage }
  | { greenMod: CT_Percentage }
  | { blue: CT_Percentage }
  | { blueOff: CT_Percentage }
  | { blueMod: CT_Percentage }
  | { gamma: CT_GammaTransform }
  | { invGamma: CT_InverseGammaTransform };

export interface CT_ScRgbColor {
  transforms?: EG_ColorTransform[];
  r: ST_Percentage;
  g: ST_Percentage;
  b: ST_Percentage;
}

export interface CT_SRgbColor {
  transforms?: EG_ColorTransform[];
  val: ST_HexColorRGB;
}

export interface CT_HslColor {
  transforms?: EG_ColorTransform[];
  hue: ST_PositiveFixedAngle;
  sat: ST_Percentage;
  lum: ST_Percentage;
}

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
export interface CT_SystemColor {
  transforms?: EG_ColorTransform[];
  val: ST_SystemColorVal;
  lastClr?: ST_HexColorRGB;
}

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
export interface CT_SchemeColor {
  transforms?: EG_ColorTransform[];
  val: ST_SchemeColorVal;
}

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
  DkBlue = "dkBlue",
  DkCyan = "dkCyan",
  DkGoldenrod = "dkGoldenrod",
  DkGray = "dkGray",
  DkGrey = "dkGrey",
  DkGreen = "dkGreen",
  DkKhaki = "dkKhaki",
  DkMagenta = "dkMagenta",
  DkOliveGreen = "dkOliveGreen",
  DkOrange = "dkOrange",
  DkOrchid = "dkOrchid",
  DkRed = "dkRed",
  DkSalmon = "dkSalmon",
  DkSeaGreen = "dkSeaGreen",
  DkSlateBlue = "dkSlateBlue",
  DkSlateGray = "dkSlateGray",
  DkSlateGrey = "dkSlateGrey",
  DkTurquoise = "dkTurquoise",
  DkViolet = "dkViolet",
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
  LtBlue = "ltBlue",
  LtCoral = "ltCoral",
  LtCyan = "ltCyan",
  LtGoldenrodYellow = "ltGoldenrodYellow",
  LtGray = "ltGray",
  LtGrey = "ltGrey",
  LtGreen = "ltGreen",
  LtPink = "ltPink",
  LtSalmon = "ltSalmon",
  LtSeaGreen = "ltSeaGreen",
  LtSkyBlue = "ltSkyBlue",
  LtSlateGray = "ltSlateGray",
  LtSlateGrey = "ltSlateGrey",
  LtSteelBlue = "ltSteelBlue",
  LtYellow = "ltYellow",
  Lime = "lime",
  LimeGreen = "limeGreen",
  Linen = "linen",
  Magenta = "magenta",
  Maroon = "maroon",
  MedAquamarine = "medAquamarine",
  MedBlue = "medBlue",
  MedOrchid = "medOrchid",
  MedPurple = "medPurple",
  MedSeaGreen = "medSeaGreen",
  MedSlateBlue = "medSlateBlue",
  MedSpringGreen = "medSpringGreen",
  MedTurquoise = "medTurquoise",
  MedVioletRed = "medVioletRed",
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
export interface CT_PresetColor {
  transforms?: EG_ColorTransform[];
  val: ST_PresetColorVal;
}

export type EG_OfficeArtExtensionList = {
  ext?: CT_OfficeArtExtension[];
};

export interface CT_Scale2D {
  sx: CT_Ratio;
  sy: CT_Ratio;
}

export interface CT_Transform2D {
  off?: CT_Point2D;
  ext?: CT_PositiveSize2D;
  rot?: ST_Angle;
  flipH?: boolean;
  flipV?: boolean;
}

export interface CT_GroupTransform2D {
  off?: CT_Point2D;
  ext?: CT_PositiveSize2D;
  chOff?: CT_Point2D;
  chExt?: CT_PositiveSize2D;
  rot?: ST_Angle;
  flipH?: boolean;
  flipV?: boolean;
}

export interface CT_Point3D {
  x: ST_Coordinate;
  y: ST_Coordinate;
  z: ST_Coordinate;
}

export interface CT_Vector3D {
  dx: ST_Coordinate;
  dy: ST_Coordinate;
  dz: ST_Coordinate;
}

export interface CT_SphereCoords {
  lat: ST_PositiveFixedAngle;
  lon: ST_PositiveFixedAngle;
  rev: ST_PositiveFixedAngle;
}

export interface CT_RelativeRect {
  l?: ST_Percentage;
  t?: ST_Percentage;
  r?: ST_Percentage;
  b?: ST_Percentage;
}

export enum ST_RectAlignment {
  Tl = "tl",
  T = "t",
  Tr = "tr",
  L = "l",
  Ctr = "ctr",
  R = "r",
  Bl = "bl",
  B = "b",
  Br = "br",
}

export type EG_ColorChoice = 
  | { scrgbClr: CT_ScRgbColor }
  | { srgbClr: CT_SRgbColor }
  | { hslClr: CT_HslColor }
  | { sysClr: CT_SystemColor }
  | { schemeClr: CT_SchemeColor }
  | { prstClr: CT_PresetColor };

export interface CT_Color {
  colorChoice: EG_ColorChoice;
}

export interface CT_ColorMRU {
  colorChoice?: EG_ColorChoice[];
}

export enum ST_BlackWhiteMode {
  Clr = "clr",
  Auto = "auto",
  Gray = "gray",
  LtGray = "ltGray",
  InvGray = "invGray",
  GrayWhite = "grayWhite",
  BlackGray = "blackGray",
  BlackWhite = "blackWhite",
  Black = "black",
  White = "white",
  Hidden = "hidden",
}

export interface AG_Blob {
  embed?: ST_RelationshipId;
  link?: ST_RelationshipId;
}

export interface CT_EmbeddedWAVAudioFile {
  embed: ST_RelationshipId;
  name?: ST_String;
}

export interface CT_Hyperlink {
  snd?: CT_EmbeddedWAVAudioFile;
  extLst?: CT_OfficeArtExtensionList;
  id?: ST_RelationshipId;
  invalidUrl?: ST_String;
  action?: ST_String;
  tgtFrame?: ST_String;
  tooltip?: ST_String;
  history?: boolean;
  highlightClick?: boolean;
  endSnd?: boolean;
}

export type ST_DrawingElementId = number; // xsd:unsignedInt

export interface AG_Locking {
  noGrp?: boolean;
  noSelect?: boolean;
  noRot?: boolean;
  noChangeAspect?: boolean;
  noMove?: boolean;
  noResize?: boolean;
  noEditPoints?: boolean;
  noAdjustHandles?: boolean;
  noChangeArrowheads?: boolean;
  noChangeShapeType?: boolean;
}

export interface CT_ConnectorLocking extends AG_Locking {
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_ShapeLocking extends AG_Locking {
  extLst?: CT_OfficeArtExtensionList;
  noTextEdit?: boolean;
}

export interface CT_PictureLocking extends AG_Locking {
  extLst?: CT_OfficeArtExtensionList;
  noCrop?: boolean;
}

export interface CT_GroupLocking {
  extLst?: CT_OfficeArtExtensionList;
  noGrp?: boolean;
  noUngrp?: boolean;
  noSelect?: boolean;
  noRot?: boolean;
  noChangeAspect?: boolean;
  noMove?: boolean;
  noResize?: boolean;
}

export interface CT_GraphicalObjectFrameLocking {
  extLst?: CT_OfficeArtExtensionList;
  noGrp?: boolean;
  noDrilldown?: boolean;
  noSelect?: boolean;
  noChangeAspect?: boolean;
  noMove?: boolean;
  noResize?: boolean;
}

export interface CT_ContentPartLocking extends AG_Locking {
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_NonVisualDrawingProps {
  hlinkClick?: CT_Hyperlink;
  hlinkHover?: CT_Hyperlink;
  extLst?: CT_OfficeArtExtensionList;
  id: ST_DrawingElementId;
  name: ST_String;
  descr?: ST_String;
  hidden?: boolean;
  title?: ST_String;
}

export interface CT_NonVisualDrawingShapeProps {
  spLocks?: CT_ShapeLocking;
  extLst?: CT_OfficeArtExtensionList;
  txBox?: boolean;
}

export interface CT_Connection {
  // This type is referenced but not defined in dml-main.xsd, assuming it's a complex type for connection properties
  // Will define as any for now
  connection: any;
}

export interface CT_NonVisualConnectorProperties {
  cxnSpLocks?: CT_ConnectorLocking;
  stCxn?: CT_Connection;
  endCxn?: CT_Connection;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_NonVisualPictureProperties {
  picLocks?: CT_PictureLocking;
  extLst?: CT_OfficeArtExtensionList;
  preferRelativeResize?: boolean;
}

export interface CT_NonVisualGroupDrawingShapeProps {
  grpSpLocks?: CT_GroupLocking;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_NonVisualGraphicFrameProperties {
  graphicFrameLocks?: CT_GraphicalObjectFrameLocking;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_NonVisualContentPartProperties {
  cpLocks?: CT_ContentPartLocking;
  extLst?: CT_OfficeArtExtensionList;
  isComment?: boolean;
}

export interface CT_GraphicalObjectData {
  any?: any[]; // xsd:any
  uri: string; // xsd:token
}

export interface CT_GraphicalObject {
  graphicData: CT_GraphicalObjectData;
}

export enum ST_ChartBuildStep {
  Category = "category",
  PtInCategory = "ptInCategory",
  Series = "series",
  PtInSeries = "ptInSeries",
  AllPts = "allPts",
  GridLegend = "gridLegend",
}

export enum ST_DgmBuildStep {
  Sp = "sp",
  Bg = "bg",
}

export interface CT_AnimationDgmElement {
  id?: ST_Guid;
  bldStep?: ST_DgmBuildStep;
}

export interface CT_AnimationChartElement {
  seriesIdx?: number; // xsd:int
  categoryIdx?: number; // xsd:int
  bldStep: ST_ChartBuildStep;
}

export type CT_AnimationElementChoice = 
  | { dgm: CT_AnimationDgmElement }
  | { chart: CT_AnimationChartElement };

export enum ST_AnimationBuildType {
  AllAtOnce = "allAtOnce",
}

export enum ST_AnimationDgmOnlyBuildType {
  One = "one",
  LvlOne = "lvlOne",
  LvlAtOnce = "lvlAtOnce",
}

export type ST_AnimationDgmBuildType = ST_AnimationBuildType | ST_AnimationDgmOnlyBuildType;

export interface CT_AnimationDgmBuildProperties {
  bld?: ST_AnimationDgmBuildType;
  rev?: boolean;
}

export enum ST_AnimationChartOnlyBuildType {
  Series = "series",
  Category = "category",
  SeriesEl = "seriesEl",
  CategoryEl = "categoryEl",
}

export type ST_AnimationChartBuildType = ST_AnimationBuildType | ST_AnimationChartOnlyBuildType;

export interface CT_AnimationChartBuildProperties {
  bld?: ST_AnimationChartBuildType;
  animBg?: boolean;
}

export type CT_AnimationGraphicalObjectBuildProperties = 
  | { bldDgm: CT_AnimationDgmBuildProperties }
  | { bldChart: CT_AnimationChartBuildProperties };

export interface CT_BackgroundFormatting {
  // EG_FillProperties and EG_EffectProperties are groups, will define later
  fillProperties?: any; // Placeholder
  effectProperties?: any; // Placeholder
}

export interface CT_WholeE2oFormatting {
  ln?: CT_LineProperties;
  effectProperties?: any; // Placeholder for EG_EffectProperties
}

export interface CT_GvmlUseShapeRectangle {}

export interface CT_TextBody {
  // This type is referenced but not defined in dml-main.xsd, assuming it's a complex type for text body
  // Will define as any for now
  textBody: any;
}

export interface CT_GvmlTextShape {
  txBody: CT_TextBody;
  useSpRect?: CT_GvmlUseShapeRectangle;
  xfrm?: CT_Transform2D;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_GvmlShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvSpPr: CT_NonVisualDrawingShapeProps;
}

export interface CT_ShapeProperties {
  // This type is referenced but not defined in dml-main.xsd, assuming it's a complex type for shape properties
  // Will define as any for now
  shapeProperties: any;
}

export interface CT_ShapeStyle {
  // This type is referenced but not defined in dml-main.xsd, assuming it's a complex type for shape style
  // Will define as any for now
  shapeStyle: any;
}

export interface CT_GvmlShape {
  nvSpPr: CT_GvmlShapeNonVisual;
  spPr: CT_ShapeProperties;
  txSp?: CT_GvmlTextShape;
  style?: CT_ShapeStyle;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_GvmlConnectorNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvCxnSpPr: CT_NonVisualConnectorProperties;
}

export interface CT_GvmlConnector {
  nvCxnSpPr: CT_GvmlConnectorNonVisual;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_BlipFillProperties {
  // This type is referenced but not defined in dml-main.xsd, assuming it's a complex type for blip fill properties
  // Will define as any for now
  blipFillProperties: any;
}

export interface CT_GvmlPictureNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvPicPr: CT_NonVisualPictureProperties;
}

export interface CT_GvmlPicture {
  nvPicPr: CT_GvmlPictureNonVisual;
  blipFill: CT_BlipFillProperties;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_GvmlGraphicFrameNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGraphicFramePr: CT_NonVisualGraphicFrameProperties;
}

export interface CT_GvmlGraphicalObjectFrame {
  nvGraphicFramePr: CT_GvmlGraphicFrameNonVisual;
  graphic: CT_GraphicalObject;
  xfrm: CT_Transform2D;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_GvmlGroupShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGrpSpPr: CT_NonVisualGroupDrawingShapeProps;
}

export interface CT_GroupShapeProperties {
  // This type is referenced but not defined in dml-main.xsd, assuming it's a complex type for group shape properties
  // Will define as any for now
  groupShapeProperties: any;
}

export interface CT_GvmlGroupShape {
  nvGrpSpPr: CT_GvmlGroupShapeNonVisual;
  grpSpPr: CT_GroupShapeProperties;
  txSp?: CT_GvmlTextShape;
  sp?: CT_GvmlShape;
  cxnSp?: CT_GvmlConnector;
  pic?: CT_GvmlPicture;
  graphicFrame?: CT_GvmlGraphicalObjectFrame;
  grpSp?: CT_GvmlGroupShape;
  extLst?: CT_OfficeArtExtensionList;
}

export enum ST_PresetCameraType {
  LegacyObliqueTopLeft = "legacyObliqueTopLeft",
  LegacyObliqueTop = "legacyObliqueTop",
  LegacyObliqueTopRight = "legacyObliqueTopRight",
  LegacyObliqueLeft = "legacyObliqueLeft",
  LegacyObliqueFront = "legacyObliqueFront",
  LegacyObliqueRight = "legacyObliqueRight",
  LegacyObliqueBottomLeft = "legacyObliqueBottomLeft",
  LegacyObliqueBottom = "legacyObliqueBottom",
  LegacyObliqueBottomRight = "legacyObliqueBottomRight",
  LegacyPerspectiveTopLeft = "legacyPerspectiveTopLeft",
  LegacyPerspectiveTop = "legacyPerspectiveTop",
  LegacyPerspectiveTopRight = "legacyPerspectiveTopRight",
  LegacyPerspectiveLeft = "legacyPerspectiveLeft",
  LegacyPerspectiveFront = "legacyPerspectiveFront",
  LegacyPerspectiveRight = "legacyPerspectiveRight",
  LegacyPerspectiveBottomLeft = "legacyPerspectiveBottomLeft",
  LegacyPerspectiveBottom = "legacyPerspectiveBottom",
  LegacyPerspectiveBottomRight = "legacyPerspectiveBottomRight",
  OrthographicFront = "orthographicFront",
  IsometricTopUp = "isometricTopUp",
  IsometricTopDown = "isometricTopDown",
  IsometricBottomUp = "isometricBottomUp",
  IsometricBottomDown = "isometricBottomDown",
  IsometricLeftUp = "isometricLeftUp",
  IsometricLeftDown = "isometricLeftDown",
  IsometricRightUp = "isometricRightUp",
  IsometricRightDown = "isometricRightDown",
  IsometricOffAxis1Left = "isometricOffAxis1Left",
  IsometricOffAxis1Right = "isometricOffAxis1Right",
  IsometricOffAxis1Top = "isometricOffAxis1Top",
  IsometricOffAxis2Left = "isometricOffAxis2Left",
  IsometricOffAxis2Right = "isometricOffAxis2Right",
  IsometricOffAxis2Top = "isometricOffAxis2Top",
  IsometricOffAxis3Left = "isometricOffAxis3Left",
  IsometricOffAxis3Right = "isometricOffAxis3Right",
  IsometricOffAxis3Bottom = "isometricOffAxis3Bottom",
  IsometricOffAxis4Left = "isometricOffAxis4Left",
  IsometricOffAxis4Right = "isometricOffAxis4Right",
  IsometricOffAxis4Bottom = "isometricOffAxis4Bottom",
  ObliqueTopLeft = "obliqueTopLeft",
  ObliqueTop = "obliqueTop",
  ObliqueTopRight = "obliqueTopRight",
  ObliqueLeft = "obliqueLeft",
  ObliqueRight = "obliqueRight",
  ObliqueBottomLeft = "obliqueBottomLeft",
  ObliqueBottom = "obliqueBottom",
  ObliqueBottomRight = "obliqueBottomRight",
  PerspectiveFront = "perspectiveFront",
  PerspectiveLeft = "perspectiveLeft",
  PerspectiveRight = "perspectiveRight",
  PerspectiveAbove = "perspectiveAbove",
  PerspectiveBelow = "perspectiveBelow",
  PerspectiveAboveLeftFacing = "perspectiveAboveLeftFacing",
  PerspectiveAboveRightFacing = "perspectiveAboveRightFacing",
  PerspectiveContrastingLeftFacing = "perspectiveContrastingLeftFacing",
  PerspectiveContrastingRightFacing = "perspectiveContrastingRightFacing",
  PerspectiveHeroicLeftFacing = "perspectiveHeroicLeftFacing",
  PerspectiveHeroicRightFacing = "perspectiveHeroicRightFacing",
  PerspectiveHeroicExtremeLeftFacing = "perspectiveHeroicExtremeLeftFacing",
  PerspectiveHeroicExtremeRightFacing = "perspectiveHeroicExtremeRightFacing",
  PerspectiveRelaxed = "perspectiveRelaxed",
  PerspectiveRelaxedModerately = "perspectiveRelaxedModerately",
}

export type ST_FOVAngle = number; // ST_Angle, minInclusive 0, maxInclusive 10800000

export interface CT_Camera {
  rot?: CT_SphereCoords;
  prst: ST_PresetCameraType;
  fov?: ST_FOVAngle;
  zoom?: ST_PositiveFixedPercentage;
}

export enum ST_LightRigDirection {
  Tl = "tl",
  T = "t",
  Tr = "tr",
  L = "l",
  R = "r",
  Bl = "bl",
  B = "b",
  Br = "br",
}

export enum ST_LightRigType {
  LegacyFlat1 = "legacyFlat1",
  LegacyFlat2 = "legacyFlat2",
  LegacyFlat3 = "legacyFlat3",
  LegacyFlat4 = "legacyFlat4",
  LegacyNormal1 = "legacyNormal1",
  LegacyNormal2 = "legacyNormal2",
  LegacyNormal3 = "legacyNormal3",
  LegacyNormal4 = "legacyNormal4",
  LegacyHarsh1 = "legacyHarsh1",
  LegacyHarsh2 = "legacyHarsh2",
  LegacyHarsh3 = "legacyHarsh3",
  LegacyHarsh4 = "legacyHarsh4",
  ThreePt = "threePt",
  Balanced = "balanced",
  Soft = "soft",
  Harsh = "harsh",
  Flood = "flood",
  Contrasting = "contrasting",
  Morning = "morning",
  Sunrise = "sunrise",
  Sunset = "sunset",
  Chilly = "chilly",
  Freezing = "freezing",
  Flat = "flat",
  TwoPt = "twoPt",
  Glow = "glow",
  BrightRoom = "brightRoom",
}

export interface CT_LightRig {
  rot?: CT_SphereCoords;
  rig: ST_LightRigType;
  dir: ST_LightRigDirection;
}

export interface CT_Scene3D {
  camera: CT_Camera;
  lightRig: CT_LightRig;
  backdrop?: CT_Backdrop;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_Backdrop {
  anchor: CT_Point3D;
  norm: CT_Vector3D;
  up: CT_Vector3D;
  extLst?: CT_OfficeArtExtensionList;
}

export enum ST_BevelPresetType {
  RelaxedInset = "relaxedInset",
  Circle = "circle",
  Slope = "slope",
  Cross = "cross",
  Angle = "angle",
  SoftRound = "softRound",
  Convex = "convex",
  CoolSlant = "coolSlant",
  Divot = "divot",
  Riblet = "riblet",
  HardEdge = "hardEdge",
  ArtDeco = "artDeco",
}

export interface CT_Bevel {
  w?: ST_PositiveCoordinate;
  h?: ST_PositiveCoordinate;
  prst?: ST_BevelPresetType;
}

export enum ST_PresetMaterialType {
  LegacyMatte = "legacyMatte",
  LegacyPlastic = "legacyPlastic",
  LegacyMetal = "legacyMetal",
  LegacyWireframe = "legacyWireframe",
  Matte = "matte",
  Plastic = "plastic",
  Metal = "metal",
  WarmMatte = "warmMatte",
  TranslucentPowder = "translucentPowder",
  Powder = "powder",
  DkEdge = "dkEdge",
  SoftEdge = "softEdge",
  Clear = "clear",
  Flat = "flat",
  Softmetal = "softmetal",
}

export interface CT_Shape3D {
  bevelT?: CT_Bevel;
  bevelB?: CT_Bevel;
  extrusionClr?: CT_Color;
  contourClr?: CT_Color;
  extLst?: CT_OfficeArtExtensionList;
  z?: ST_Coordinate;
  extrusionH?: ST_PositiveCoordinate;
  contourW?: ST_PositiveCoordinate;
  prstMaterial?: ST_PresetMaterialType;
}

export interface CT_FlatText {
  z?: ST_Coordinate;
}

export type EG_Text3D = 
  | { sp3d: CT_Shape3D }
  | { flatTx: CT_FlatText };

export interface CT_AlphaBiLevelEffect {
  thresh: ST_PositiveFixedPercentage;
}

export interface CT_AlphaCeilingEffect {}

export interface CT_AlphaFloorEffect {}

export interface CT_AlphaInverseEffect {
  colorChoice?: EG_ColorChoice;
}

export interface CT_AlphaModulateFixedEffect {
  amt?: ST_PositiveFixedPercentage;
}

export interface CT_AlphaOutsetEffect {
  rad?: ST_Coordinate;
}

export interface CT_AlphaReplaceEffect {
  a: ST_PositiveFixedPercentage;
}

export interface CT_BiLevelEffect {
  thresh: ST_PositiveFixedPercentage;
}

export interface CT_BlurEffect {
  rad?: ST_PositiveCoordinate;
  grow?: boolean;
}

export interface CT_ColorChangeEffect {
  clrFrom: CT_Color;
  clrTo: CT_Color;
  useA?: boolean;
}

export interface CT_ColorReplaceEffect {
  colorChoice: EG_ColorChoice;
}

export interface CT_DuotoneEffect {
  colorChoice: [EG_ColorChoice, EG_ColorChoice];
}

export interface CT_GlowEffect {
  colorChoice: EG_ColorChoice;
  rad?: ST_PositiveCoordinate;
}

export interface CT_GrayscaleEffect {}

export interface CT_HSLEffect {
  hue?: ST_PositiveFixedAngle;
  sat?: ST_FixedPercentage;
  lum?: ST_FixedPercentage;
}

export interface CT_InnerShadowEffect {
  colorChoice: EG_ColorChoice;
  blurRad?: ST_PositiveCoordinate;
  dist?: ST_PositiveCoordinate;
  dir?: ST_PositiveFixedAngle;
}

export interface CT_LuminanceEffect {
  bright?: ST_FixedPercentage;
  contrast?: ST_FixedPercentage;
}

export interface CT_OuterShadowEffect {
  colorChoice: EG_ColorChoice;
  blurRad?: ST_PositiveCoordinate;
  dist?: ST_PositiveCoordinate;
  dir?: ST_PositiveFixedAngle;
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  kx?: ST_FixedAngle;
  ky?: ST_FixedAngle;
  algn?: ST_RectAlignment;
  rotWithShape?: boolean;
}

export enum ST_PresetShadowVal {
  Shdw1 = "shdw1",
  Shdw2 = "shdw2",
  Shdw3 = "shdw3",
  Shdw4 = "shdw4",
  Shdw5 = "shdw5",
  Shdw6 = "shdw6",
  Shdw7 = "shdw7",
  Shdw8 = "shdw8",
  Shdw9 = "shdw9",
  Shdw10 = "shdw10",
  Shdw11 = "shdw11",
  Shdw12 = "shdw12",
  Shdw13 = "shdw13",
  Shdw14 = "shdw14",
  Shdw15 = "shdw15",
  Shdw16 = "shdw16",
  Shdw17 = "shdw17",
  Shdw18 = "shdw18",
  Shdw19 = "shdw19",
  Shdw20 = "shdw20",
}
export interface CT_PresetShadowEffect {
  colorChoice: EG_ColorChoice;
  prst: ST_PresetShadowVal;
  dist?: ST_PositiveCoordinate;
  dir?: ST_PositiveFixedAngle;
}

export interface CT_ReflectionEffect {
  blurRad?: ST_PositiveCoordinate;
  stA?: ST_PositiveFixedPercentage;
  stPos?: ST_PositiveFixedPercentage;
  endA?: ST_PositiveFixedPercentage;
  endPos?: ST_PositiveFixedPercentage;
  dist?: ST_PositiveCoordinate;
  dir?: ST_PositiveFixedAngle;
  fadeDir?: ST_PositiveFixedAngle;
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  kx?: ST_FixedAngle;
  ky?: ST_FixedAngle;
  algn?: ST_RectAlignment;
  rotWithShape?: boolean;
}

export interface CT_RelativeOffsetEffect {
  tx?: ST_Percentage;
  ty?: ST_Percentage;
}

export interface CT_SoftEdgesEffect {
  rad: ST_PositiveCoordinate;
}

export interface CT_TintEffect {
  hue?: ST_PositiveFixedAngle;
  amt?: ST_FixedPercentage;
}

export interface CT_TransformEffect {
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  kx?: ST_FixedAngle;
  ky?: ST_FixedAngle;
  tx?: ST_Coordinate;
  ty?: ST_Coordinate;
}

export interface CT_NoFillProperties {}

export interface CT_SolidColorFillProperties {
  colorChoice?: EG_ColorChoice;
}

export interface CT_LinearShadeProperties {
  ang?: ST_PositiveFixedAngle;
  scaled?: boolean;
}

export enum ST_PathShadeType {
  Shape = "shape",
  Circle = "circle",
  Rect = "rect",
}
export interface CT_PathShadeProperties {
  fillToRect?: CT_RelativeRect;
  path?: ST_PathShadeType;
}

export type EG_ShadeProperties = 
  | { lin: CT_LinearShadeProperties }
  | { path: CT_PathShadeProperties };

export enum ST_TileFlipMode {
  None = "none",
  X = "x",
  Y = "y",
  Xy = "xy",
}

export interface CT_GradientStop {
  colorChoice: EG_ColorChoice;
  pos: ST_PositiveFixedPercentage;
}

export interface CT_GradientStopList {
  gs: CT_GradientStop[];
}

export interface CT_GradientFillProperties {
  gsLst?: CT_GradientStopList;
  shadeProperties?: EG_ShadeProperties;
  tileRect?: CT_RelativeRect;
  flip?: ST_TileFlipMode;
  rotWithShape?: boolean;
}

export interface CT_TileInfoProperties {
  tx?: ST_Coordinate;
  ty?: ST_Coordinate;
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  flip?: ST_TileFlipMode;
  algn?: ST_RectAlignment;
}

export interface CT_StretchInfoProperties {
  fillRect?: CT_RelativeRect;
}

export type EG_FillModeProperties = 
  | { tile: CT_TileInfoProperties }
  | { stretch: CT_StretchInfoProperties };

export enum ST_BlipCompression {
  Email = "email",
  Screen = "screen",
  Print = "print",
  Hqprint = "hqprint",
  None = "none",
}

export interface CT_Blip {
  effects?: (
    | { alphaBiLevel: CT_AlphaBiLevelEffect }
    | { alphaCeiling: CT_AlphaCeilingEffect }
    | { alphaFloor: CT_AlphaFloorEffect }
    | { alphaInv: CT_AlphaInverseEffect }
    | { alphaMod: CT_AlphaModulateEffect }
    | { alphaModFix: CT_AlphaModulateFixedEffect }
    | { alphaRepl: CT_AlphaReplaceEffect }
    | { biLevel: CT_BiLevelEffect }
    | { blur: CT_BlurEffect }
    | { clrChange: CT_ColorChangeEffect }
    | { clrRepl: CT_ColorReplaceEffect }
    | { duotone: CT_DuotoneEffect }
    | { fillOverlay: CT_FillOverlayEffect }
    | { grayscl: CT_GrayscaleEffect }
    | { hsl: CT_HSLEffect }
    | { lum: CT_LuminanceEffect }
    | { tint: CT_TintEffect }
  )[];
  extLst?: CT_OfficeArtExtensionList;
  embed?: ST_RelationshipId;
  link?: ST_RelationshipId;
  cstate?: ST_BlipCompression;
}

export interface CT_BlipFillProperties {
  blip?: CT_Blip;
  srcRect?: CT_RelativeRect;
  fillModeProperties?: EG_FillModeProperties;
  dpi?: number; // xsd:unsignedInt
  rotWithShape?: boolean;
}

export enum ST_PresetPatternVal {
  Pct5 = "pct5",
  Pct10 = "pct10",
  Pct20 = "pct20",
  Pct25 = "pct25",
  Pct30 = "pct30",
  Pct40 = "pct40",
  Pct50 = "pct50",
  Pct60 = "pct60",
  Pct70 = "pct70",
  Pct75 = "pct75",
  Pct80 = "pct80",
  Pct90 = "pct90",
  Horz = "horz",
  Vert = "vert",
  LtHorz = "ltHorz",
  LtVert = "ltVert",
  DkHorz = "dkHorz",
  DkVert = "dkVert",
  NarHorz = "narHorz",
  NarVert = "narVert",
  DashHorz = "dashHorz",
  DashVert = "dashVert",
  Cross = "cross",
  DnDiag = "dnDiag",
  UpDiag = "upDiag",
  LtDnDiag = "ltDnDiag",
  LtUpDiag = "ltUpDiag",
  DkDnDiag = "dkDnDiag",
  DkUpDiag = "dkUpDiag",
  WdDnDiag = "wdDnDiag",
  WdUpDiag = "wdUpDiag",
  DashDnDiag = "dashDnDiag",
  DashUpDiag = "dashUpDiag",
  DiagCross = "diagCross",
  SmCheck = "smCheck",
  LgCheck = "lgCheck",
  SmGrid = "smGrid",
  LgGrid = "lgGrid",
  DotGrid = "dotGrid",
  SmConfetti = "smConfetti",
  LgConfetti = "lgConfetti",
  HorzBrick = "horzBrick",
  DiagBrick = "diagBrick",
  SolidDmnd = "solidDmnd",
  OpenDmnd = "openDmnd",
  DotDmnd = "dotDmnd",
  Plaid = "plaid",
  Sphere = "sphere",
  Weave = "weave",
  Divot = "divot",
  Shingle = "shingle",
  Wave = "wave",
  Trellis = "trellis",
  ZigZag = "zigZag",
}
export interface CT_PatternFillProperties {
  fgClr?: CT_Color;
  bgClr?: CT_Color;
  prst?: ST_PresetPatternVal;
}

export interface CT_GroupFillProperties {}

export type EG_FillProperties = 
  | { noFill: CT_NoFillProperties }
  | { solidFill: CT_SolidColorFillProperties }
  | { gradFill: CT_GradientFillProperties }
  | { blipFill: CT_BlipFillProperties }
  | { pattFill: CT_PatternFillProperties }
  | { grpFill: CT_GroupFillProperties };

export interface CT_FillProperties {
  fillProperties: EG_FillProperties;
}

export interface CT_FillEffect {
  fillProperties: EG_FillProperties;
}

export enum ST_BlendMode {
  Over = "over",
  Mult = "mult",
  Screen = "screen",
  Darken = "darken",
  Lighten = "lighten",
}
export interface CT_FillOverlayEffect {
  fillProperties: EG_FillProperties;
  blend: ST_BlendMode;
}

export interface CT_EffectReference {
  ref: string; // xsd:token
}

export type EG_Effect = 
  | { cont: CT_EffectContainer }
  | { effect: CT_EffectReference }
  | { alphaBiLevel: CT_AlphaBiLevelEffect }
  | { alphaCeiling: CT_AlphaCeilingEffect }
  | { alphaFloor: CT_AlphaFloorEffect }
  | { alphaInv: CT_AlphaInverseEffect }
  | { alphaMod: CT_AlphaModulateEffect }
  | { alphaModFix: CT_AlphaModulateFixedEffect }
  | { alphaOutset: CT_AlphaOutsetEffect }
  | { alphaRepl: CT_AlphaReplaceEffect }
  | { biLevel: CT_BiLevelEffect }
  | { blend: CT_BlendEffect }
  | { blur: CT_BlurEffect }
  | { clrChange: CT_ColorChangeEffect }
  | { clrRepl: CT_ColorReplaceEffect }
  | { duotone: CT_DuotoneEffect }
  | { fill: CT_FillEffect }
  | { fillOverlay: CT_FillOverlayEffect }
  | { glow: CT_GlowEffect }
  | { grayscl: CT_GrayscaleEffect }
  | { hsl: CT_HSLEffect }
  | { innerShdw: CT_InnerShadowEffect }
  | { lum: CT_LuminanceEffect }
  | { outerShdw: CT_OuterShadowEffect }
  | { prstShdw: CT_PresetShadowEffect }
  | { reflection: CT_ReflectionEffect }
  | { relOff: CT_RelativeOffsetEffect }
  | { softEdge: CT_SoftEdgesEffect }
  | { tint: CT_TintEffect }
  | { xfrm: CT_TransformEffect };

export enum ST_EffectContainerType {
  Sib = "sib",
  Tree = "tree",
}
export interface CT_EffectContainer {
  effects?: EG_Effect[];
  type?: ST_EffectContainerType;
  name?: string; // xsd:token
}

export interface CT_AlphaModulateEffect {
  cont: CT_EffectContainer;
}

export interface CT_BlendEffect {
  cont: CT_EffectContainer;
  blend: ST_BlendMode;
}

export interface CT_EffectList {
  blur?: CT_BlurEffect;
  fillOverlay?: CT_FillOverlayEffect;
  glow?: CT_GlowEffect;
  innerShdw?: CT_InnerShadowEffect;
  outerShdw?: CT_OuterShadowEffect;
  prstShdw?: CT_PresetShadowEffect;
  reflection?: CT_ReflectionEffect;
  softEdge?: CT_SoftEdgesEffect;
}

export type EG_EffectProperties = 
  | { effectLst: CT_EffectList }
  | { effectDag: CT_EffectContainer };

export interface CT_EffectProperties {
  effectProperties: EG_EffectProperties;
}

export enum ST_ShapeType {
  Line = "line",
  LineInv = "lineInv",
  Triangle = "triangle",
  RtTriangle = "rtTriangle",
  Rect = "rect",
  Diamond = "diamond",
  Parallelogram = "parallelogram",
  Trapezoid = "trapezoid",
  NonIsoscelesTrapezoid = "nonIsoscelesTrapezoid",
  Pentagon = "pentagon",
  Hexagon = "hexagon",
  Heptagon = "heptagon",
  Octagon = "octagon",
  Decagon = "decagon",
  Dodecagon = "dodecagon",
  Star4 = "star4",
  Star5 = "star5",
  Star6 = "star6",
  Star7 = "star7",
  Star8 = "star8",
  Star10 = "star10",
  Star12 = "star12",
  Star16 = "star16",
  Star24 = "star24",
  Star32 = "star32",
  RoundRect = "roundRect",
  Round1Rect = "round1Rect",
  Round2SameRect = "round2SameRect",
  Round2DiagRect = "round2DiagRect",
  SnipRoundRect = "snipRoundRect",
  Snip1Rect = "snip1Rect",
  Snip2SameRect = "snip2SameRect",
  Snip2DiagRect = "snip2DiagRect",
  Plaque = "plaque",
  Ellipse = "ellipse",
  Teardrop = "teardrop",
  HomePlate = "homePlate",
  Chevron = "chevron",
  PieWedge = "pieWedge",
  Pie = "pie",
  BlockArc = "blockArc",
  Donut = "donut",
  NoSmoking = "noSmoking",
  RightArrow = "rightArrow",
  LeftArrow = "leftArrow",
  UpArrow = "upArrow",
  DownArrow = "downArrow",
  StripedRightArrow = "stripedRightArrow",
  NotchedRightArrow = "notchedRightArrow",
  BentUpArrow = "bentUpArrow",
  LeftRightArrow = "leftRightArrow",
  UpDownArrow = "upDownArrow",
  LeftUpArrow = "leftUpArrow",
  LeftRightUpArrow = "leftRightUpArrow",
  QuadArrow = "quadArrow",
  LeftArrowCallout = "leftArrowCallout",
  RightArrowCallout = "rightArrowCallout",
  UpArrowCallout = "upArrowCallout",
  DownArrowCallout = "downArrowCallout",
  LeftRightArrowCallout = "leftRightArrowCallout",
  UpDownArrowCallout = "upDownArrowCallout",
  QuadArrowCallout = "quadArrowCallout",
  BentArrow = "bentArrow",
  UturnArrow = "uturnArrow",
  CircularArrow = "circularArrow",
  LeftCircularArrow = "leftCircularArrow",
  LeftRightCircularArrow = "leftRightCircularArrow",
  CurvedRightArrow = "curvedRightArrow",
  CurvedLeftArrow = "curvedLeftArrow",
  CurvedUpArrow = "curvedUpArrow",
  CurvedDownArrow = "curvedDownArrow",
  SwooshArrow = "swooshArrow",
  Cube = "cube",
  Can = "can",
  LightningBolt = "lightningBolt",
  Heart = "heart",
  Sun = "sun",
  Moon = "moon",
  SmileyFace = "smileyFace",
  IrregularSeal1 = "irregularSeal1",
  IrregularSeal2 = "irregularSeal2",
  FoldedCorner = "foldedCorner",
  Bevel = "bevel",
  Frame = "frame",
  HalfFrame = "halfFrame",
  Corner = "corner",
  DiagStripe = "diagStripe",
  Chord = "chord",
  Arc = "arc",
  LeftBracket = "leftBracket",
  RightBracket = "rightBracket",
  LeftBrace = "leftBrace",
  RightBrace = "rightBrace",
  BracketPair = "bracketPair",
  BracePair = "bracePair",
  StraightConnector1 = "straightConnector1",
  BentConnector2 = "bentConnector2",
  BentConnector3 = "bentConnector3",
  BentConnector4 = "bentConnector4",
  BentConnector5 = "bentConnector5",
  CurvedConnector2 = "curvedConnector2",
  CurvedConnector3 = "curvedConnector3",
  CurvedConnector4 = "curvedConnector4",
  CurvedConnector5 = "curvedConnector5",
  Callout1 = "callout1",
  Callout2 = "callout2",
  Callout3 = "callout3",
  AccentCallout1 = "accentCallout1",
  AccentCallout2 = "accentCallout2",
  AccentCallout3 = "accentCallout3",
  BorderCallout1 = "borderCallout1",
  BorderCallout2 = "borderCallout2",
  BorderCallout3 = "borderCallout3",
  AccentBorderCallout1 = "accentBorderCallout1",
  AccentBorderCallout2 = "accentBorderCallout2",
  AccentBorderCallout3 = "accentBorderCallout3",
  WedgeRectCallout = "wedgeRectCallout",
  WedgeRoundRectCallout = "wedgeRoundRectCallout",
  WedgeEllipseCallout = "wedgeEllipseCallout",
  CloudCallout = "cloudCallout",
  Cloud = "cloud",
  Ribbon = "ribbon",
  Ribbon2 = "ribbon2",
  EllipseRibbon = "ellipseRibbon",
  EllipseRibbon2 = "ellipseRibbon2",
  LeftRightRibbon = "leftRightRibbon",
  VerticalScroll = "verticalScroll",
  HorizontalScroll = "horizontalScroll",
  Wave = "wave",
  DoubleWave = "doubleWave",
  Plus = "plus",
  FlowChartProcess = "flowChartProcess",
  FlowChartDecision = "flowChartDecision",
  FlowChartInputOutput = "flowChartInputOutput",
  FlowChartPredefinedProcess = "flowChartPredefinedProcess",
  FlowChartInternalStorage = "flowChartInternalStorage",
  FlowChartDocument = "flowChartDocument",
  FlowChartMultidocument = "flowChartMultidocument",
  FlowChartTerminator = "flowChartTerminator",
  FlowChartPreparation = "flowChartPreparation",
  FlowChartManualInput = "flowChartManualInput",
  FlowChartManualOperation = "flowChartManualOperation",
  FlowChartConnector = "flowChartConnector",
  FlowChartPunchedCard = "flowChartPunchedCard",
  FlowChartPunchedTape = "flowChartPunchedTape",
  FlowChartSummingJunction = "flowChartSummingJunction",
  FlowChartOr = "flowChartOr",
  FlowChartCollate = "flowChartCollate",
  FlowChartSort = "flowChartSort",
  FlowChartExtract = "flowChartExtract",
  FlowChartMerge = "flowChartMerge",
  FlowChartOfflineStorage = "flowChartOfflineStorage",
  FlowChartOnlineStorage = "flowChartOnlineStorage",
  FlowChartMagneticTape = "flowChartMagneticTape",
  FlowChartMagneticDisk = "flowChartMagneticDisk",
  FlowChartMagneticDrum = "flowChartMagneticDrum",
  FlowChartDisplay = "flowChartDisplay",
  FlowChartDelay = "flowChartDelay",
  FlowChartAlternateProcess = "flowChartAlternateProcess",
  FlowChartOffpageConnector = "flowChartOffpageConnector",
  ActionButtonBlank = "actionButtonBlank",
  ActionButtonHome = "actionButtonHome",
  ActionButtonHelp = "actionButtonHelp",
  ActionButtonInformation = "actionButtonInformation",
  ActionButtonForwardNext = "actionButtonForwardNext",
  ActionButtonBackPrevious = "actionButtonBackPrevious",
  ActionButtonEnd = "actionButtonEnd",
  ActionButtonBeginning = "actionButtonBeginning",
  ActionButtonReturn = "actionButtonReturn",
  ActionButtonDocument = "actionButtonDocument",
  ActionButtonSound = "actionButtonSound",
  ActionButtonMovie = "actionButtonMovie",
  Gear6 = "gear6",
  Gear9 = "gear9",
  Funnel = "funnel",
  MathPlus = "mathPlus",
  MathMinus = "mathMinus",
  MathMultiply = "mathMultiply",
  MathDivide = "mathDivide",
  MathEqual = "mathEqual",
  MathNotEqual = "mathNotEqual",
  CornerTabs = "cornerTabs",
  SquareTabs = "squareTabs",
  PlaqueTabs = "plaqueTabs",
  ChartX = "chartX",
  ChartStar = "chartStar",
  ChartPlus = "chartPlus",
}

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

export type ST_GeomGuideName = string; // xsd:token
export type ST_GeomGuideFormula = string; // xsd:string

export interface CT_GeomGuide {
  name: ST_GeomGuideName;
  fmla: ST_GeomGuideFormula;
}

export interface CT_GeomGuideList {
  gd?: CT_GeomGuide[];
}

export type ST_AdjCoordinate = ST_Coordinate | ST_GeomGuideName;
export type ST_AdjAngle = ST_Angle | ST_GeomGuideName;

export interface CT_AdjPoint2D {
  x: ST_AdjCoordinate;
  y: ST_AdjCoordinate;
}

export interface CT_GeomRect {
  l: ST_AdjCoordinate;
  t: ST_AdjCoordinate;
  r: ST_AdjCoordinate;
  b: ST_AdjCoordinate;
}

export interface CT_XYAdjustHandle {
  pos: CT_AdjPoint2D;
  gdRefX?: ST_GeomGuideName;
  minX?: ST_AdjCoordinate;
  maxX?: ST_AdjCoordinate;
  gdRefY?: ST_GeomGuideName;
  minY?: ST_AdjCoordinate;
  maxY?: ST_AdjCoordinate;
}

export interface CT_PolarAdjustHandle {
  pos: CT_AdjPoint2D;
  gdRefR?: ST_GeomGuideName;
  minR?: ST_AdjCoordinate;
  maxR?: ST_AdjCoordinate;
  gdRefAng?: ST_GeomGuideName;
  minAng?: ST_AdjAngle;
  maxAng?: ST_AdjAngle;
}

export interface CT_AdjustHandleList {
  adjustHandles?: (CT_XYAdjustHandle | CT_PolarAdjustHandle)[];
}

export interface CT_ConnectionSite {
  pos: CT_AdjPoint2D;
  ang: ST_AdjAngle;
}

export interface CT_ConnectionSiteList {
  cxn?: CT_ConnectionSite[];
}

export interface CT_Path2DList {
  path?: CT_Path2D[];
}

export interface CT_Path2D {
  fill?: ST_PathFillMode;
  stroke?: boolean;
  extrusionOk?: boolean;
  w?: ST_PositiveCoordinate;
  h?: ST_PositiveCoordinate;
  pathCmd?: (CT_Path2DMoveTo | CT_Path2DLineTo | CT_Path2DArcTo | CT_Path2DQuadBezierTo | CT_Path2DCubicBezierTo | CT_Path2DClose)[];
}

export enum ST_PathFillMode {
  None = "none",
  Norm = "norm",
  Lighten = "lighten",
  LightenLess = "lightenLess",
  Darken = "darken",
  DarkenLess = "darkenLess",
}

export interface CT_Path2DMoveTo {
  pt: CT_AdjPoint2D;
}

export interface CT_Path2DLineTo {
  pt: CT_AdjPoint2D;
}

export interface CT_Path2DArcTo {
  wR: ST_AdjCoordinate;
  hR: ST_AdjCoordinate;
  stAng: ST_AdjAngle;
  swAng: ST_AdjAngle;
}

export interface CT_Path2DQuadBezierTo {
  pt: CT_AdjPoint2D[];
}

export interface CT_Path2DCubicBezierTo {
  pt: CT_AdjPoint2D[];
}

export interface CT_Path2DClose {}

export interface CT_PresetGeometry2D {
  avLst?: CT_GeomGuideList;
  gdLst?: CT_GeomGuideList;
  ahLst?: CT_AdjustHandleList;
  cxnLst?: CT_ConnectionSiteList;
  rect?: CT_GeomRect;
  pathLst?: CT_Path2DList;
  prst: ST_ShapeType;
}

export interface CT_CustomGeometry2D {
  avLst?: CT_GeomGuideList;
  gdLst?: CT_GeomGuideList;
  ahLst?: CT_AdjustHandleList;
  cxnLst?: CT_ConnectionSiteList;
  rect?: CT_GeomRect;
  pathLst: CT_Path2DList;
}

export type EG_Geometry = 
  | { prstGeom: CT_PresetGeometry2D }
  | { custGeom: CT_CustomGeometry2D };

export interface CT_ShapeProperties {
  xfrm?: CT_Transform2D;
  noFill?: CT_NoFillProperties;
  solidFill?: CT_SolidColorFillProperties;
  gradFill?: CT_GradientFillProperties;
  blipFill?: CT_BlipFillProperties;
  pattFill?: CT_PatternFillProperties;
  grpFill?: CT_GroupFillProperties;
  ln?: CT_LineProperties;
  effectLst?: CT_EffectList;
  effectDag?: CT_EffectContainer;
  scene3d?: CT_Scene3D;
  sp3d?: CT_Shape3D;
  flatTx?: CT_FlatText;
  prstGeom?: CT_PresetGeometry2D;
  custGeom?: CT_CustomGeometry2D;
  extLst?: CT_OfficeArtExtensionList;
  bwMode?: ST_BlackWhiteMode;
}

export interface CT_GroupShapeProperties {
  xfrm?: CT_GroupTransform2D;
  noFill?: CT_NoFillProperties;
  solidFill?: CT_SolidColorFillProperties;
  gradFill?: CT_GradientFillProperties;
  blipFill?: CT_BlipFillProperties;
  pattFill?: CT_PatternFillProperties;
  grpFill?: CT_GroupFillProperties;
  effectLst?: CT_EffectList;
  effectDag?: CT_EffectContainer;
  scene3d?: CT_Scene3D;
  sp3d?: CT_Shape3D;
  flatTx?: CT_FlatText;
  extLst?: CT_OfficeArtExtensionList;
  bwMode?: ST_BlackWhiteMode;
}

export interface CT_ShapeStyle {
  lnRef?: CT_StyleMatrixReference;
  fillRef?: CT_StyleMatrixReference;
  effectRef?: CT_StyleMatrixReference;
  fontRef?: CT_FontReference;
}

export interface CT_StyleMatrixReference {
  idx: ST_StyleMatrixColumnIndex;
  colorChoice?: EG_ColorChoice;
}

export interface CT_FontReference {
  idx: ST_FontCollectionIndex;
  colorChoice?: EG_ColorChoice;
}

export interface CT_Connection {
  id: ST_DrawingElementId;
  idx: number; // xsd:unsignedInt
}

export interface CT_TextBody {
  bodyPr: CT_TextBodyProperties;
  lstStyle?: CT_TextListStyle;
  p: CT_TextParagraph[];
}

export interface CT_TextBodyProperties {
  rot?: ST_Angle;
  spcFirstLastPara?: boolean;
  vert?: ST_TextVerticalType;
  vertOverflow?: ST_TextVerticalOverflowType;
  horzOverflow?: ST_TextHorizontalOverflowType;
  rtlCol?: boolean;
  fromWordArt?: boolean;
  anchor?: ST_TextAnchoringType;
  anchorCtr?: boolean;
  forceAA?: boolean;
  compatLnSpc?: boolean;
  withAnchor?: boolean;
  lIns?: ST_Coordinate32;
  tIns?: ST_Coordinate32;
  rIns?: ST_Coordinate32;
  bIns?: ST_Coordinate32;
  numCol?: number; // xsd:int
  spcCol?: ST_Coordinate32;
  rtlCol?: boolean;
  flatLn?: boolean;
  wrap?: ST_TextWrappingType;
  leftToRight?: boolean;
  rightToLeft?: boolean;
  upright?: boolean;
  extLst?: CT_OfficeArtExtensionList;
}

export enum ST_TextVerticalType {
  Horz = "horz",
  Vert = "vert",
  Vert270 = "vert270",
  WordArtVert = "wordArtVert",
  EaVert = "eaVert",
  MongolianVert = "mongolianVert",
  WordArtVertRtl = "wordArtVertRtl",
}

export enum ST_TextVerticalOverflowType {
  Overflow = "overflow",
  Ellipsis = "ellipsis",
  Clip = "clip",
}

export enum ST_TextHorizontalOverflowType {
  Overflow = "overflow",
  Clip = "clip",
}

export enum ST_TextAnchoringType {
  T = "t",
  Ctr = "ctr",
  B = "b",
  Just = "just",
  JustLow = "justLow",
  Dist = "dist",
  ThaiDist = "thaiDist",
}

export enum ST_TextWrappingType {
  Square = "square",
  None = "none",
}

export interface CT_TextListStyle {
  defPPr?: CT_TextParagraphProperties;
  lvl1pPr?: CT_TextParagraphProperties;
  lvl2pPr?: CT_TextParagraphProperties;
  lvl3pPr?: CT_TextParagraphProperties;
  lvl4pPr?: CT_TextParagraphProperties;
  lvl5pPr?: CT_TextParagraphProperties;
  lvl6pPr?: CT_TextParagraphProperties;
  lvl7pPr?: CT_TextParagraphProperties;
  lvl8pPr?: CT_TextParagraphProperties;
  lvl9pPr?: CT_TextParagraphProperties;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_TextParagraph {
  pPr?: CT_TextParagraphProperties;
  r?: CT_TextRun[];
  br?: CT_TextLineBreak[];
  fld?: CT_TextField[];
  endParaRPr?: CT_TextCharacterProperties;
}

export interface CT_TextParagraphProperties {
  lnSpc?: CT_TextSpacing;
  spcBef?: CT_TextSpacing;
  spcAfter?: CT_TextSpacing;
  buClr?: CT_Color;
  buFont?: CT_TextFont;
  buChar?: CT_Char;
  buAutoNum?: CT_TextAutonumberBullet;
  buBlip?: CT_Blip;
  buNone?: CT_Empty;
  algn?: ST_TextAlignType;
  defTabSz?: ST_Coordinate32;
  rtl?: boolean;
  eaLnBrk?: boolean;
  fontAlgn?: ST_TextFontAlignType;
  marL?: ST_Coordinate32;
  marR?: ST_Coordinate32;
  indent?: ST_Coordinate32;
  hangingPunct?: boolean;
  romNumLgcy?: boolean;
  noEndParaRPr?: boolean;
  lvl?: number; // xsd:unsignedByte
  tabLst?: CT_TextTabStopList;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_TextSpacing {
  spcPct?: CT_Percentage;
  spcPts?: CT_TextPoint;
}

export interface CT_TextPoint {
  val: number; // xsd:int
}

export interface CT_TextAutonumberBullet {
  type: ST_TextAutonumberScheme;
  startAt?: number; // xsd:int
}

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

export enum ST_TextAlignType {
  L = "l",
  Ctr = "ctr",
  R = "r",
  Just = "just",
  JustLow = "justLow",
  Dist = "dist",
  ThaiDist = "thaiDist",
}

export enum ST_TextFontAlignType {
  Auto = "auto",
  T = "t",
  Ctr = "ctr",
  B = "b",
  Base = "base",
}

export interface CT_TextTabStopList {
  tab?: CT_TextTabStop[];
}

export interface CT_TextTabStop {
  pos: ST_Coordinate32;
  algn: ST_TextTabAlignType;
}

export enum ST_TextTabAlignType {
  L = "l",
  Ctr = "ctr",
  R = "r",
  Dec = "dec",
}

export interface CT_TextRun {
  rPr?: CT_TextCharacterProperties;
  t: ST_String;
}

export interface CT_TextLineBreak {
  rPr?: CT_TextCharacterProperties;
}

export interface CT_TextField {
  rPr?: CT_TextCharacterProperties;
  t: ST_String;
  id?: ST_Guid;
  type?: ST_String;
}

export interface CT_TextCharacterProperties {
  ln?: CT_LineProperties;
  noFill?: CT_NoFillProperties;
  solidFill?: CT_SolidColorFillProperties;
  gradFill?: CT_GradientFillProperties;
  blipFill?: CT_BlipFillProperties;
  pattFill?: CT_PatternFillProperties;
  grpFill?: CT_GroupFillProperties;
  effectLst?: CT_EffectList;
  effectDag?: CT_EffectContainer;
  highlight?: CT_Color;
  latin?: CT_TextFont;
  ea?: CT_TextFont;
  cs?: CT_TextFont;
  sym?: CT_TextFont;
  hlinkClick?: CT_Hyperlink;
  hlinkMouseOver?: CT_Hyperlink;
  rtl?: boolean;
  kumimoji?: boolean;
  lang?: ST_String;
  altLang?: ST_String;
  sz?: number; // xsd:int
  b?: boolean;
  i?: boolean;
  u?: CT_TextUnderline;
  strike?: ST_TextStrikeType;
  kern?: number; // xsd:int
  cap?: ST_TextCapsType;
  spc?: number; // xsd:int
  normalizeH?: boolean;
  baseline?: ST_Percentage;
  noProof?: boolean;
  dirty?: boolean;
  err?: boolean;
  smtClean?: boolean;
  smtId?: number; // xsd:unsignedInt
  bmk?: ST_String;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_TextUnderline {
  ln?: CT_LineProperties;
  fill?: CT_FillProperties;
  u?: ST_TextUnderlineType;
}

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

export enum ST_TextStrikeType {
  NoStrike = "noStrike",
  SingleStrike = "singleStrike",
  DoubleStrike = "doubleStrike",
}

export enum ST_TextCapsType {
  None = "none",
  Small = "small",
  All = "all",
}

export interface CT_LineProperties {
  noFill?: CT_NoFillProperties;
  solidFill?: CT_SolidColorFillProperties;
  gradFill?: CT_GradientFillProperties;
  pattFill?: CT_PatternFillProperties;
  prstDash?: CT_PresetLineDashProperties;
  custDash?: CT_CustomDashProperties;
  round?: CT_RoundLineCapProperties;
  bevel?: CT_BevelLineCapProperties;
  miter?: CT_MiterLimitProperties;
  headEnd?: CT_LineEndProperties;
  tailEnd?: CT_LineEndProperties;
  extLst?: CT_OfficeArtExtensionList;
  w?: ST_PositiveCoordinate;
  cap?: ST_LineCap;
  cmpd?: ST_CompoundLine;
  algn?: ST_PenAlignment;
}

export interface CT_PresetLineDashProperties {
  val: ST_PresetLineDashVal;
}

export enum ST_PresetLineDashVal {
  Solid = "solid",
  Dot = "dot",
  Dash = "dash",
  LargeDash = "largeDash",
  DashDot = "dashDot",
  LargeDashDot = "largeDashDot",
  LargeDashDotDot = "largeDashDotDot",
  SystemDash = "sysDash",
  SystemDot = "sysDot",
  SystemDashDot = "sysDashDot",
  SystemDashDotDot = "sysDashDotDot",
}

export interface CT_CustomDashProperties {
  ds?: CT_DashStop[];
}

export interface CT_DashStop {
  d: ST_PositiveFixedPercentage;
  sp: ST_PositiveFixedPercentage;
}

export interface CT_RoundLineCapProperties {}

export interface CT_BevelLineCapProperties {}

export interface CT_MiterLimitProperties {
  val?: ST_PositiveFixedPercentage;
}

export interface CT_LineEndProperties {
  type?: ST_LineEndType;
  w?: ST_LineEndWidth;
  len?: ST_LineEndLength;
}

export enum ST_LineEndType {
  None = "none",
  Arrow = "arrow",
  Oval = "oval",
  StealthArrow = "stealthArrow",
  Diamond = "diamond",
  Triangle = "triangle",
}

export enum ST_LineEndWidth {
  Sm = "sm",
  Med = "med",
  Lg = "lg",
}

export enum ST_LineEndLength {
  Sm = "sm",
  Med = "med",
  Lg = "lg",
}

export enum ST_LineCap {
  Rnd = "rnd",
  Sq = "sq",
  Flat = "flat",
}

export enum ST_CompoundLine {
  Sng = "sng",
  Dbl = "dbl",
  ThickThin = "thickThin",
  ThinThick = "thinThick",
  Tri = "tri",
}

export enum ST_PenAlignment {
  Ctr = "ctr",
  In = "in",
}

export interface CT_ShapeProperties {
  xfrm?: CT_Transform2D;
  noFill?: CT_NoFillProperties;
  solidFill?: CT_SolidColorFillProperties;
  gradFill?: CT_GradientFillProperties;
  blipFill?: CT_BlipFillProperties;
  pattFill?: CT_PatternFillProperties;
  grpFill?: CT_GroupFillProperties;
  ln?: CT_LineProperties;
  effectLst?: CT_EffectList;
  effectDag?: CT_EffectContainer;
  scene3d?: CT_Scene3D;
  sp3d?: CT_Shape3D;
  flatTx?: CT_FlatText;
  prstGeom?: CT_PresetGeometry2D;
  custGeom?: CT_CustomGeometry2D;
  extLst?: CT_OfficeArtExtensionList;
  bwMode?: ST_BlackWhiteMode;
}

export interface CT_GroupShapeProperties {
  xfrm?: CT_GroupTransform2D;
  noFill?: CT_NoFillProperties;
  solidFill?: CT_SolidColorFillProperties;
  gradFill?: CT_GradientFillProperties;
  blipFill?: CT_BlipFillProperties;
  pattFill?: CT_PatternFillProperties;
  grpFill?: CT_GroupFillProperties;
  effectLst?: CT_EffectList;
  effectDag?: CT_EffectContainer;
  scene3d?: CT_Scene3D;
  sp3d?: CT_Shape3D;
  flatTx?: CT_FlatText;
  extLst?: CT_OfficeArtExtensionList;
  bwMode?: ST_BlackWhiteMode;
}

export interface CT_ShapeStyle {
  lnRef?: CT_StyleMatrixReference;
  fillRef?: CT_StyleMatrixReference;
  effectRef?: CT_StyleMatrixReference;
  fontRef?: CT_FontReference;
}

export interface CT_StyleMatrixReference {
  idx: ST_StyleMatrixColumnIndex;
  colorChoice?: EG_ColorChoice;
}

export interface CT_FontReference {
  idx: ST_FontCollectionIndex;
  colorChoice?: EG_ColorChoice;
}

export interface CT_Connection {
  id: ST_DrawingElementId;
  idx: number; // xsd:unsignedInt
}

export interface CT_TextBody {
  bodyPr: CT_TextBodyProperties;
  lstStyle?: CT_TextListStyle;
  p: CT_TextParagraph[];
}

export interface CT_TextBodyProperties {
  rot?: ST_Angle;
  spcFirstLastPara?: boolean;
  vert?: ST_TextVerticalType;
  vertOverflow?: ST_TextVerticalOverflowType;
  horzOverflow?: ST_TextHorizontalOverflowType;
  rtlCol?: boolean;
  fromWordArt?: boolean;
  anchor?: ST_TextAnchoringType;
  anchorCtr?: boolean;
  forceAA?: boolean;
  compatLnSpc?: boolean;
  withAnchor?: boolean;
  lIns?: ST_Coordinate32;
  tIns?: ST_Coordinate32;
  rIns?: ST_Coordinate32;
  bIns?: ST_Coordinate32;
  numCol?: number; // xsd:int
  spcCol?: ST_Coordinate32;
  rtlCol?: boolean;
  flatLn?: boolean;
  wrap?: ST_TextWrappingType;
  leftToRight?: boolean;
  rightToLeft?: boolean;
  upright?: boolean;
  extLst?: CT_OfficeArtExtensionList;
}

export enum ST_TextVerticalType {
  Horz = "horz",
  Vert = "vert",
  Vert270 = "vert270",
  WordArtVert = "wordArtVert",
  EaVert = "eaVert",
  MongolianVert = "mongolianVert",
  WordArtVertRtl = "wordArtVertRtl",
}

export enum ST_TextVerticalOverflowType {
  Overflow = "overflow",
  Ellipsis = "ellipsis",
  Clip = "clip",
}

export enum ST_TextHorizontalOverflowType {
  Overflow = "overflow",
  Clip = "clip",
}

export enum ST_TextAnchoringType {
  T = "t",
  Ctr = "ctr",
  B = "b",
  Just = "just",
  JustLow = "justLow",
  Dist = "dist",
  ThaiDist = "thaiDist",
}

export enum ST_TextWrappingType {
  Square = "square",
  None = "none",
}

export interface CT_TextListStyle {
  defPPr?: CT_TextParagraphProperties;
  lvl1pPr?: CT_TextParagraphProperties;
  lvl2pPr?: CT_TextParagraphProperties;
  lvl3pPr?: CT_TextParagraphProperties;
  lvl4pPr?: CT_TextParagraphProperties;
  lvl5pPr?: CT_TextParagraphProperties;
  lvl6pPr?: CT_TextParagraphProperties;
  lvl7pPr?: CT_TextParagraphProperties;
  lvl8pPr?: CT_TextParagraphProperties;
  lvl9pPr?: CT_TextParagraphProperties;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_TextParagraph {
  pPr?: CT_TextParagraphProperties;
  r?: CT_TextRun[];
  br?: CT_TextLineBreak[];
  fld?: CT_TextField[];
  endParaRPr?: CT_TextCharacterProperties;
}

export interface CT_TextParagraphProperties {
  lnSpc?: CT_TextSpacing;
  spcBef?: CT_TextSpacing;
  spcAfter?: CT_TextSpacing;
  buClr?: CT_Color;
  buFont?: CT_TextFont;
  buChar?: CT_Char;
  buAutoNum?: CT_TextAutonumberBullet;
  buBlip?: CT_Blip;
  buNone?: CT_Empty;
  algn?: ST_TextAlignType;
  defTabSz?: ST_Coordinate32;
  rtl?: boolean;
  eaLnBrk?: boolean;
  fontAlgn?: ST_TextFontAlignType;
  marL?: ST_Coordinate32;
  marR?: ST_Coordinate32;
  indent?: ST_Coordinate32;
  hangingPunct?: boolean;
  romNumLgcy?: boolean;
  noEndParaRPr?: boolean;
  lvl?: number; // xsd:unsignedByte
  tabLst?: CT_TextTabStopList;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_TextSpacing {
  spcPct?: CT_Percentage;
  spcPts?: CT_TextPoint;
}

export interface CT_TextPoint {
  val: number; // xsd:int
}

export interface CT_TextAutonumberBullet {
  type: ST_TextAutonumberScheme;
  startAt?: number; // xsd:int
}

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

export enum ST_TextAlignType {
  L = "l",
  Ctr = "ctr",
  R = "r",
  Just = "just",
  JustLow = "justLow",
  Dist = "dist",
  ThaiDist = "thaiDist",
}

export enum ST_TextFontAlignType {
  Auto = "auto",
  T = "t",
  Ctr = "ctr",
  B = "b",
  Base = "base",
}

export interface CT_TextTabStopList {
  tab?: CT_TextTabStop[];
}

export interface CT_TextTabStop {
  pos: ST_Coordinate32;
  algn: ST_TextTabAlignType;
}

export enum ST_TextTabAlignType {
  L = "l",
  Ctr = "ctr",
  R = "r",
  Dec = "dec",
}

export interface CT_TextRun {
  rPr?: CT_TextCharacterProperties;
  t: ST_String;
}

export interface CT_TextLineBreak {
  rPr?: CT_TextCharacterProperties;
}

export interface CT_TextField {
  rPr?: CT_TextCharacterProperties;
  t: ST_String;
  id?: ST_Guid;
  type?: ST_String;
}

export interface CT_TextCharacterProperties {
  ln?: CT_LineProperties;
  noFill?: CT_NoFillProperties;
  solidFill?: CT_SolidColorFillProperties;
  gradFill?: CT_GradientFillProperties;
  blipFill?: CT_BlipFillProperties;
  pattFill?: CT_PatternFillProperties;
  grpFill?: CT_GroupFillProperties;
  effectLst?: CT_EffectList;
  effectDag?: CT_EffectContainer;
  highlight?: CT_Color;
  latin?: CT_TextFont;
  ea?: CT_TextFont;
  cs?: CT_TextFont;
  sym?: CT_TextFont;
  hlinkClick?: CT_Hyperlink;
  hlinkMouseOver?: CT_Hyperlink;
  rtl?: boolean;
  kumimoji?: boolean;
  lang?: ST_String;
  altLang?: ST_String;
  sz?: number; // xsd:int
  b?: boolean;
  i?: boolean;
  u?: CT_TextUnderline;
  strike?: ST_TextStrikeType;
  kern?: number; // xsd:int
  cap?: ST_TextCapsType;
  spc?: number; // xsd:int
  normalizeH?: boolean;
  baseline?: ST_Percentage;
  noProof?: boolean;
  dirty?: boolean;
  err?: boolean;
  smtClean?: boolean;
  smtId?: number; // xsd:unsignedInt
  bmk?: ST_String;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_TextUnderline {
  ln?: CT_LineProperties;
  fill?: CT_FillProperties;
  u?: ST_TextUnderlineType;
}

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

export enum ST_TextStrikeType {
  NoStrike = "noStrike",
  SingleStrike = "singleStrike",
  DoubleStrike = "doubleStrike",
}

export enum ST_TextCapsType {
  None = "none",
  Small = "small",
  All = "all",
}

export interface CT_LineProperties {
  noFill?: CT_NoFillProperties;
  solidFill?: CT_SolidColorFillProperties;
  gradFill?: CT_GradientFillProperties;
  pattFill?: CT_PatternFillProperties;
  prstDash?: CT_PresetLineDashProperties;
  custDash?: CT_CustomDashProperties;
  round?: CT_RoundLineCapProperties;
  bevel?: CT_BevelLineCapProperties;
  miter?: CT_MiterLimitProperties;
  headEnd?: CT_LineEndProperties;
  tailEnd?: CT_LineEndProperties;
  extLst?: CT_OfficeArtExtensionList;
  w?: ST_PositiveCoordinate;
  cap?: ST_LineCap;
  cmpd?: ST_CompoundLine;
  algn?: ST_PenAlignment;
}

export interface CT_PresetLineDashProperties {
  val: ST_PresetLineDashVal;
}

export enum ST_PresetLineDashVal {
  Solid = "solid",
  Dot = "dot",
  Dash = "dash",
  LargeDash = "largeDash",
  DashDot = "dashDot",
  LargeDashDot = "largeDashDot",
  LargeDashDotDot = "largeDashDotDot",
  SystemDash = "sysDash",
  SystemDot = "sysDot",
  SystemDashDot = "sysDashDot",
  SystemDashDotDot = "sysDashDotDot",
}

export interface CT_CustomDashProperties {
  ds?: CT_DashStop[];
}

export interface CT_DashStop {
  d: ST_PositiveFixedPercentage;
  sp: ST_PositiveFixedPercentage;
}

export interface CT_RoundLineCapProperties {}

export interface CT_BevelLineCapProperties {}

export interface CT_MiterLimitProperties {
  val?: ST_PositiveFixedPercentage;
}

export interface CT_LineEndProperties {
  type?: ST_LineEndType;
  w?: ST_LineEndWidth;
  len?: ST_LineEndLength;
}

export enum ST_LineEndType {
  None = "none",
  Arrow = "arrow",
  Oval = "oval",
  StealthArrow = "stealthArrow",
  Diamond = "diamond",
  Triangle = "triangle",
}

export enum ST_LineEndWidth {
  Sm = "sm",
  Med = "med",
  Lg = "lg",
}

export enum ST_LineEndLength {
  Sm = "sm",
  Med = "med",
  Lg = "lg",
}

export enum ST_LineCap {
  Rnd = "rnd",
  Sq = "sq",
  Flat = "flat",
}

export enum ST_CompoundLine {
  Sng = "sng",
  Dbl = "dbl",
  ThickThin = "thickThin",
  ThinThick = "thinThick",
  Tri = "tri",
}

export enum ST_PenAlignment {
  Ctr = "ctr",
  In = "in",
}