// dml-shapes.ts
// Shape and drawing-related types extracted from dml-main.ts
import type { ST_RelationshipId, ST_String, ST_UniversalMeasure, ST_Percentage, ST_FixedPercentage, ST_PositiveFixedPercentage } from './shared-types';

// Simple types and enums
export type ST_Coordinate = ST_CoordinateUnqualified | ST_UniversalMeasure;
export type ST_CoordinateUnqualified = number; // xsd:long, minInclusive -27273042329600, maxInclusive 27273042316900
export type ST_Coordinate32 = ST_Coordinate32Unqualified | ST_UniversalMeasure;
export type ST_Coordinate32Unqualified = number; // xsd:int
export type ST_PositiveCoordinate = number; // xsd:long, minInclusive 0, maxInclusive 27273042316900
export type ST_PositiveCoordinate32 = number; // ST_Coordinate32Unqualified, minInclusive 0
export type ST_Angle = number; // xsd:int
export type ST_FixedAngle = number; // ST_Angle, minExclusive -5400000, maxExclusive 5400000
export type ST_PositiveFixedAngle = number; // ST_Angle, minInclusive 0, maxExclusive 21600000
export type ST_DrawingElementId = number; // xsd:unsignedInt
export type ST_GeomGuideName = string; // xsd:token
export type ST_AdjCoordinate = ST_Coordinate | ST_GeomGuideName;
export type ST_AdjAngle = ST_Angle | ST_GeomGuideName;

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

export enum ST_PathFillMode {
  None = "none",
  Norm = "norm",
  Lighten = "lighten",
  LightenLess = "lightenLess",
  Darken = "darken",
  DarkenLess = "darkenLess",
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

export enum ST_PathShadeType {
  Shape = "shape",
  Circle = "circle",
  Rect = "rect",
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

export enum ST_LineCap {
  Rnd = "rnd",
  Sq = "sq",
  Flat = "flat",
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

// Complex types
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

export interface CT_RelativeRect {
  l?: ST_Percentage;
  t?: ST_Percentage;
  r?: ST_Percentage;
  b?: ST_Percentage;
}

// Locking and non-visual properties
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

export interface CT_ShapeLocking extends AG_Locking {
  extLst?: CT_OfficeArtExtensionList;
  noTextEdit?: boolean;
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

export interface CT_NonVisualGroupDrawingShapeProps {
  grpSpLocks?: CT_GroupLocking;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_NonVisualGraphicFrameProperties {
  graphicFrameLocks?: CT_GraphicalObjectFrameLocking;
  extLst?: CT_OfficeArtExtensionList;
}

// Shape 3D
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

export interface CT_TransformEffect {
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  kx?: ST_FixedAngle;
  ky?: ST_FixedAngle;
  tx?: ST_Coordinate;
  ty?: ST_Coordinate;
}

export interface CT_RelativeOffsetEffect {
  tx?: ST_Percentage;
  ty?: ST_Percentage;
}

export interface CT_PathShadeProperties {
  fillToRect?: CT_RelativeRect;
  path?: ST_PathShadeType;
}

export interface CT_StretchInfoProperties {
  fillRect?: CT_RelativeRect;
}

// Geometry types
export interface CT_GeomGuide {
  name: ST_GeomGuideName;
  fmla: ST_GeomGuideFormula;
}

export interface CT_GeomGuideList {
  gd?: CT_GeomGuide[];
}

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

// Path types
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

export type CT_Path2DClose = Record<string, never>

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

// Line properties
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

export interface CT_CustomDashProperties {
  ds?: CT_DashStop[];
}

export interface CT_DashStop {
  d: ST_PositiveFixedPercentage;
  sp: ST_PositiveFixedPercentage;
}

export type CT_RoundLineCapProperties = Record<string, never>

export type CT_BevelLineCapProperties = Record<string, never>

export interface CT_MiterLimitProperties {
  val?: ST_PositiveFixedPercentage;
}

export interface CT_LineEndProperties {
  type?: ST_LineEndType;
  w?: ST_LineEndWidth;
  len?: ST_LineEndLength;
}

// Shape properties
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

// Gvml shape types
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

export interface CT_GvmlShape {
  nvSpPr: CT_GvmlShapeNonVisual;
  spPr: CT_ShapeProperties;
  txSp?: CT_GvmlTextShape;
  style?: CT_ShapeStyle;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_GvmlGroupShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGrpSpPr: CT_NonVisualGroupDrawingShapeProps;
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

export interface CT_TextPoint {
  val: number; // xsd:int
}

export interface CT_Connection {
  id: ST_DrawingElementId;
  idx: number; // xsd:unsignedInt
}

// Import from other modules
import type { EG_ColorChoice } from './dml-colors';
import type { CT_OfficeArtExtensionList } from './dml-media';
import type { ST_FontCollectionIndex } from './dml-fonts';
import type {
  CT_Color,
  CT_NoFillProperties,
  CT_SolidColorFillProperties,
  CT_GradientFillProperties,
  CT_BlipFillProperties,
  CT_PatternFillProperties,
  CT_GroupFillProperties,
  CT_EffectList,
  CT_EffectContainer
} from './dml-effects';

// Forward declarations and type aliases for missing types
// These types are referenced but not defined in the geometry section
export type ST_GeomGuideFormula = string; // xsd:string
export type ST_StyleMatrixColumnIndex = number; // xsd:unsignedInt
export type CT_Hyperlink = any; // Hyperlink type
export type CT_Bevel = any; // Bevel type
export type CT_Scene3D = any; // Scene 3D
export type CT_FlatText = any; // Flat text
export type CT_TextBody = any; // Text body
export type CT_GvmlUseShapeRectangle = any; // Use shape rectangle
export type CT_GraphicalObject = any; // Graphical object
export type CT_NonVisualConnectorProperties = any; // Non-visual connector properties
export type CT_NonVisualPictureProperties = any; // Non-visual picture properties