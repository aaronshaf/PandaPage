/**
 * DrawingML Chart Types
 * Based on dml-chart.xsd definitions
 */

/**
 * Chart space
 */
export interface CT_DMLChartSpace {
  /** Date 1904 */
  date1904?: boolean;
  /** Language */
  lang?: string;
  /** Rounding in chart */
  roundedCorners?: boolean;
  /** Alternative content */
  AlternateContent?: any;
  /** Style */
  style?: number;
  /** Color map override */
  clrMapOvr?: any; // CT_ColorMapping
  /** Pivot source */
  pivotSource?: any; // CT_PivotSource
  /** Protection */
  protection?: any; // CT_Protection
  /** Chart */
  chart?: CT_DMLChart;
  /** Shape properties */
  spPr?: any; // CT_ShapeProperties
  /** Text properties */
  txPr?: any; // CT_TextBody
  /** External data */
  externalData?: any; // CT_ExternalData
  /** Print settings */
  printSettings?: any; // CT_PrintSettings
  /** User shapes */
  userShapes?: any; // CT_RelId
  /** Extension list */
  extLst?: any; // CT_ExtensionList
}

/**
 * Chart
 */
export interface CT_DMLChart {
  /** Title */
  title?: any; // CT_Title
  /** Auto title deleted */
  autoTitleDeleted?: boolean;
  /** Pivot formats */
  pivotFmts?: any; // CT_PivotFmts
  /** View 3D */
  view3D?: any; // CT_View3D
  /** Floor */
  floor?: any; // CT_Surface
  /** Side wall */
  sideWall?: any; // CT_Surface
  /** Back wall */
  backWall?: any; // CT_Surface
  /** Plot area */
  plotArea?: CT_DMLPlotArea;
  /** Legend */
  legend?: any; // CT_Legend
  /** Plot visible only */
  plotVisOnly?: boolean;
  /** Display blanks as */
  dispBlanksAs?: ST_DMLDispBlanksAs;
  /** Show data labels over maximum */
  showDLblsOverMax?: boolean;
  /** Extension list */
  extLst?: any; // CT_ExtensionList
}

/**
 * Plot area
 */
export interface CT_DMLPlotArea {
  /** Layout */
  layout?: any; // CT_Layout
  /** Charts */
  charts?: any[]; // Various chart types
  /** Value axes */
  valAx?: any[]; // CT_ValAx
  /** Category axes */
  catAx?: any[]; // CT_CatAx
  /** Date axes */
  dateAx?: any[]; // CT_DateAx
  /** Series axes */
  serAx?: any[]; // CT_SerAx
  /** Data table */
  dTable?: any; // CT_DTable
  /** Shape properties */
  spPr?: any; // CT_ShapeProperties
  /** Extension list */
  extLst?: any; // CT_ExtensionList
}

/**
 * Display blanks as
 */
export type ST_DMLDispBlanksAs = "span" | "gap" | "zero";
