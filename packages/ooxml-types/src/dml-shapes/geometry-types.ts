// geometry-types.ts
// Geometry types for DrawingML shapes

import type {
  ST_GeomGuideName,
  ST_GeomGuideFormula,
  ST_AdjCoordinate,
  ST_AdjAngle,
  ST_PositiveCoordinate,
  CT_AdjPoint2D,
} from "./coordinate-types";

// Shape type enum
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

// Path fill mode enum
export enum ST_PathFillMode {
  None = "none",
  Norm = "norm",
  Lighten = "lighten",
  LightenLess = "lightenLess",
  Darken = "darken",
  DarkenLess = "darkenLess",
}

// Geometry guide
export interface CT_GeomGuide {
  name: ST_GeomGuideName;
  fmla: ST_GeomGuideFormula;
}

// Geometry guide list
export interface CT_GeomGuideList {
  gd?: CT_GeomGuide[];
}

// Geometry rectangle
export interface CT_GeomRect {
  l: ST_AdjCoordinate;
  t: ST_AdjCoordinate;
  r: ST_AdjCoordinate;
  b: ST_AdjCoordinate;
}

// XY adjust handle
export interface CT_XYAdjustHandle {
  pos: CT_AdjPoint2D;
  gdRefX?: ST_GeomGuideName;
  minX?: ST_AdjCoordinate;
  maxX?: ST_AdjCoordinate;
  gdRefY?: ST_GeomGuideName;
  minY?: ST_AdjCoordinate;
  maxY?: ST_AdjCoordinate;
}

// Polar adjust handle
export interface CT_PolarAdjustHandle {
  pos: CT_AdjPoint2D;
  gdRefR?: ST_GeomGuideName;
  minR?: ST_AdjCoordinate;
  maxR?: ST_AdjCoordinate;
  gdRefAng?: ST_GeomGuideName;
  minAng?: ST_AdjAngle;
  maxAng?: ST_AdjAngle;
}

// Adjust handle list
export interface CT_AdjustHandleList {
  adjustHandles?: (CT_XYAdjustHandle | CT_PolarAdjustHandle)[];
}

// Connection site
export interface CT_ConnectionSite {
  pos: CT_AdjPoint2D;
  ang: ST_AdjAngle;
}

// Connection site list
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
  pathCmd?: (
    | CT_Path2DMoveTo
    | CT_Path2DLineTo
    | CT_Path2DArcTo
    | CT_Path2DQuadBezierTo
    | CT_Path2DCubicBezierTo
    | CT_Path2DClose
  )[];
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

export type CT_Path2DClose = Record<string, never>;

// Preset geometry 2D
export interface CT_PresetGeometry2D {
  avLst?: CT_GeomGuideList;
  gdLst?: CT_GeomGuideList;
  ahLst?: CT_AdjustHandleList;
  cxnLst?: CT_ConnectionSiteList;
  rect?: CT_GeomRect;
  pathLst?: CT_Path2DList;
  prst: ST_ShapeType;
}

// Custom geometry 2D
export interface CT_CustomGeometry2D {
  avLst?: CT_GeomGuideList;
  gdLst?: CT_GeomGuideList;
  ahLst?: CT_AdjustHandleList;
  cxnLst?: CT_ConnectionSiteList;
  rect?: CT_GeomRect;
  pathLst: CT_Path2DList;
}

// Geometry choice
export type EG_Geometry = { prstGeom: CT_PresetGeometry2D } | { custGeom: CT_CustomGeometry2D };
