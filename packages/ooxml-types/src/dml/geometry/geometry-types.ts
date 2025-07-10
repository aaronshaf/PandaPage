/**
 * DrawingML Geometry Types
 * Based on dml-main.xsd geometry definitions
 */

/**
 * Coordinate point
 */
export interface CT_Point2D {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
}

/**
 * Size definition
 */
export interface CT_PositiveSize2D {
  /** Width (positive coordinate) */
  cx: number;
  /** Height (positive coordinate) */
  cy: number;
}

/**
 * Rectangle geometry
 */
export interface CT_Rect {
  /** Left coordinate */
  l?: number;
  /** Top coordinate */
  t?: number;
  /** Right coordinate */
  r?: number;
  /** Bottom coordinate */
  b?: number;
}

/**
 * Preset geometry type
 */
export type ST_ShapeType =
  | "line"
  | "lineInv"
  | "triangle"
  | "rtTriangle"
  | "rect"
  | "diamond"
  | "parallelogram"
  | "trapezoid"
  | "nonIsoscelesTrapezoid"
  | "pentagon"
  | "hexagon"
  | "heptagon"
  | "octagon"
  | "decagon"
  | "dodecagon"
  | "star4"
  | "star5"
  | "star6"
  | "star7"
  | "star8"
  | "star10"
  | "star12"
  | "star16"
  | "star24"
  | "star32"
  | "roundRect"
  | "round1Rect"
  | "round2SameRect"
  | "round2DiagRect"
  | "snipRoundRect"
  | "snip1Rect"
  | "snip2SameRect"
  | "snip2DiagRect"
  | "plaque"
  | "ellipse"
  | "teardrop"
  | "homePlate"
  | "chevron"
  | "pieWedge"
  | "pie"
  | "blockArc"
  | "donut"
  | "noSmoking"
  | "rightArrow"
  | "leftArrow"
  | "upArrow"
  | "downArrow"
  | "stripedRightArrow"
  | "notchedRightArrow"
  | "bentUpArrow"
  | "leftRightArrow"
  | "upDownArrow"
  | "leftUpArrow"
  | "leftRightUpArrow"
  | "quadArrow"
  | "leftArrowCallout"
  | "rightArrowCallout"
  | "upArrowCallout"
  | "downArrowCallout"
  | "leftRightArrowCallout"
  | "upDownArrowCallout"
  | "quadArrowCallout"
  | "bentArrow"
  | "uturnArrow"
  | "circularArrow"
  | "leftCircularArrow"
  | "leftRightCircularArrow"
  | "curvedRightArrow"
  | "curvedLeftArrow"
  | "curvedUpArrow"
  | "curvedDownArrow"
  | "swooshArrow"
  | "cube"
  | "can"
  | "lightningBolt"
  | "heart"
  | "sun"
  | "moon"
  | "smileyFace"
  | "irregularSeal1"
  | "irregularSeal2"
  | "foldedCorner"
  | "bevel"
  | "frame"
  | "halfFrame"
  | "corner"
  | "diagStripe"
  | "chord"
  | "arc"
  | "leftBracket"
  | "rightBracket"
  | "leftBrace"
  | "rightBrace"
  | "bracketPair"
  | "bracePair"
  | "straightConnector1"
  | "bentConnector2"
  | "bentConnector3"
  | "bentConnector4"
  | "bentConnector5"
  | "curvedConnector2"
  | "curvedConnector3"
  | "curvedConnector4"
  | "curvedConnector5"
  | "callout1"
  | "callout2"
  | "callout3"
  | "accentCallout1"
  | "accentCallout2"
  | "accentCallout3"
  | "borderCallout1"
  | "borderCallout2"
  | "borderCallout3"
  | "accentBorderCallout1"
  | "accentBorderCallout2"
  | "accentBorderCallout3"
  | "wedgeRectCallout"
  | "wedgeRoundRectCallout"
  | "wedgeEllipseCallout"
  | "cloudCallout"
  | "cloud"
  | "ribbon"
  | "ribbon2"
  | "ellipseRibbon"
  | "ellipseRibbon2"
  | "leftRightRibbon"
  | "verticalScroll"
  | "horizontalScroll"
  | "wave"
  | "doubleWave"
  | "plus"
  | "flowChartProcess"
  | "flowChartDecision"
  | "flowChartInputOutput"
  | "flowChartPredefinedProcess"
  | "flowChartInternalStorage"
  | "flowChartDocument"
  | "flowChartMultidocument"
  | "flowChartTerminator"
  | "flowChartPreparation"
  | "flowChartManualInput"
  | "flowChartManualOperation"
  | "flowChartConnector"
  | "flowChartPunchedCard"
  | "flowChartPunchedTape"
  | "flowChartSummingJunction"
  | "flowChartOr"
  | "flowChartCollate"
  | "flowChartSort"
  | "flowChartExtract"
  | "flowChartMerge"
  | "flowChartOfflineStorage"
  | "flowChartOnlineStorage"
  | "flowChartMagneticTape"
  | "flowChartMagneticDisk"
  | "flowChartMagneticDrum"
  | "flowChartDisplay"
  | "flowChartDelay"
  | "flowChartAlternateProcess"
  | "flowChartOffpageConnector"
  | "actionButtonBlank"
  | "actionButtonHome"
  | "actionButtonHelp"
  | "actionButtonInformation"
  | "actionButtonForwardNext"
  | "actionButtonBackPrevious"
  | "actionButtonEnd"
  | "actionButtonBeginning"
  | "actionButtonReturn"
  | "actionButtonDocument"
  | "actionButtonSound"
  | "actionButtonMovie"
  | "gear6"
  | "gear9"
  | "funnel"
  | "mathPlus"
  | "mathMinus"
  | "mathMultiply"
  | "mathDivide"
  | "mathEqual"
  | "mathNotEqual"
  | "cornerTabs"
  | "squareTabs"
  | "plaqueTabs"
  | "chartX"
  | "chartStar"
  | "chartPlus";

/**
 * Preset geometry
 */
export interface CT_PresetGeometry2D {
  /** Preset shape type */
  prst: ST_ShapeType;
  /** Adjust values */
  avLst?: Array<{
    /** Guide name */
    name: string;
    /** Formula value */
    fmla: string;
  }>;
}

/**
 * Custom geometry
 */
export interface CT_CustomGeometry2D {
  /** Adjust value list */
  avLst?: Array<{
    /** Guide name */
    name: string;
    /** Formula value */
    fmla: string;
  }>;
  /** Guide list */
  gdLst?: Array<{
    /** Guide name */
    name: string;
    /** Formula value */
    fmla: string;
  }>;
  /** Adjust handle list */
  ahLst?: Array<{
    /** Position */
    pos: CT_AdjPoint2D;
    /** Polar adjust handle (optional) */
    polar?: CT_PolarAdjustHandle;
    /** XY adjust handle (optional) */
    xy?: CT_XYAdjustHandle;
  }>;
  /** Connection site list */
  cxnLst?: Array<{
    /** Angle */
    ang: string;
    /** Position */
    pos: CT_AdjPoint2D;
  }>;
  /** Rectangle */
  rect?: CT_Rect;
  /** Path list */
  pathLst?: Array<{
    /** Width */
    w?: number;
    /** Height */
    h?: number;
    /** Fill */
    fill?: "norm" | "lighten" | "lightenLess" | "darken" | "darkenLess";
    /** Stroke */
    stroke?: boolean;
    /** Extrusion okay */
    extrusionOk?: boolean;
    /** Commands */
    commands?: any[]; // Path commands
  }>;
}

/**
 * Adjust point 2D
 */
export interface CT_AdjPoint2D {
  /** X coordinate */
  x: string;
  /** Y coordinate */
  y: string;
}

/**
 * Polar adjust handle
 */
export interface CT_PolarAdjustHandle {
  /** Minimum radius */
  minR?: string;
  /** Maximum radius */
  maxR?: string;
  /** Minimum angle */
  minAng?: string;
  /** Maximum angle */
  maxAng?: string;
}

/**
 * XY adjust handle
 */
export interface CT_XYAdjustHandle {
  /** Minimum X */
  minX?: string;
  /** Maximum X */
  maxX?: string;
  /** Minimum Y */
  minY?: string;
  /** Maximum Y */
  maxY?: string;
}
