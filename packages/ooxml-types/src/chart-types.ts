// chart-types.ts - Re-export chart data types and define remaining chart types
export * from './chart-data';

import type { ST_String, ST_PositiveUniversalMeasure } from './shared-types';
import type { CT_ShapeProperties, CT_TextBody, CT_Color } from './dml-main';
import type { 
  CT_Boolean, CT_Double, CT_UnsignedInt, CT_ExtensionList, CT_NumDataSource, 
  CT_AxDataSource, CT_Tx, CT_TextLanguageID 
} from './chart-data';

// Forward declarations for types that might be referenced before they are fully defined
export type CT_EmbeddedWAVAudioFile = Record<string, never>;
export type CT_Connection = Record<string, never>;

// Chart series and data point types
export enum ST_ScatterStyle {
  None = "none",
  Line = "line",
  LineMarker = "lineMarker",
  Marker = "marker",
  Smooth = "smooth",
  SmoothMarker = "smoothMarker",
}

export enum ST_MarkerStyle {
  Circle = "circle",
  Dash = "dash",
  Diamond = "diamond",
  Dot = "dot",
  None = "none",
  Picture = "picture",
  Plus = "plus",
  Square = "square",
  Star = "star",
  Triangle = "triangle",
  X = "x",
  Auto = "auto",
}

export interface CT_Marker {
  symbol?: { val?: ST_MarkerStyle };
  size?: CT_UnsignedInt;
  spPr?: CT_ShapeProperties;
  extLst?: CT_ExtensionList;
}

export interface CT_DPt {
  idx: CT_UnsignedInt;
  invertIfNegative?: CT_Boolean;
  marker?: CT_Marker;
  bubble3D?: CT_Boolean;
  explosion?: CT_UnsignedInt;
  spPr?: CT_ShapeProperties;
  pictureOptions?: any; // CT_PictureOptions
  extLst?: CT_ExtensionList;
}

export interface CT_SerTx {
  strRef?: any; // CT_StrRef from chart-data
  v?: ST_String;
}

export interface CT_DLbls {
  dLbl?: any[]; // CT_DLbl[]
  delete?: CT_Boolean;
  numFmt?: any; // CT_NumFmt
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  dLblPos?: any; // CT_DLblPos
  showLegendKey?: CT_Boolean;
  showVal?: CT_Boolean;
  showCatName?: CT_Boolean;
  showSerName?: CT_Boolean;
  showPercent?: CT_Boolean;
  showBubbleSize?: CT_Boolean;
  separator?: ST_String;
  showLeaderLines?: CT_Boolean;
  leaderLines?: CT_ShapeProperties;
  extLst?: CT_ExtensionList;
}

export interface CT_ScatterSer {
  idx: CT_UnsignedInt;
  order: CT_UnsignedInt;
  tx?: CT_SerTx;
  spPr?: CT_ShapeProperties;
  marker?: CT_Marker;
  dPt?: CT_DPt[];
  dLbls?: CT_DLbls;
  trendline?: any[]; // CT_Trendline[]
  errBars?: any[]; // CT_ErrBars[]
  xVal?: CT_AxDataSource;
  yVal?: CT_NumDataSource;
  smooth?: CT_Boolean;
  extLst?: CT_ExtensionList;
}

// Basic chart types to keep file under 700 lines
export interface CT_ScatterChart {
  scatterStyle: { val?: ST_ScatterStyle };
  varyColors?: CT_Boolean;
  ser?: CT_ScatterSer[];
  dLbls?: CT_DLbls;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

export interface CT_Title {
  tx?: CT_Tx;
  layout?: any; // CT_Layout
  overlay?: CT_Boolean;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  extLst?: CT_ExtensionList;
}

export interface CT_Legend {
  legendPos?: { val?: string }; // ST_LegendPos
  legendEntry?: any[]; // CT_LegendEntry[]
  layout?: any; // CT_Layout
  overlay?: CT_Boolean;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  extLst?: CT_ExtensionList;
}

export interface CT_PlotArea {
  layout?: any; // CT_Layout
  areaChart?: any[]; // CT_AreaChart[]
  area3DChart?: any[]; // CT_Area3DChart[]
  lineChart?: any[]; // CT_LineChart[]
  line3DChart?: any[]; // CT_Line3DChart[]
  stockChart?: any[]; // CT_StockChart[]
  radarChart?: any[]; // CT_RadarChart[]
  scatterChart?: CT_ScatterChart[];
  pieChart?: any[]; // CT_PieChart[]
  pie3DChart?: any[]; // CT_Pie3DChart[]
  doughnutChart?: any[]; // CT_DoughnutChart[]
  barChart?: any[]; // CT_BarChart[]
  bar3DChart?: any[]; // CT_Bar3DChart[]
  ofPieChart?: any[]; // CT_OfPieChart[]
  surfaceChart?: any[]; // CT_SurfaceChart[]
  surface3DChart?: any[]; // CT_Surface3DChart[]
  bubbleChart?: any[]; // CT_BubbleChart[]
  valAx?: any[]; // CT_ValAx[]
  catAx?: any[]; // CT_CatAx[]
  dateAx?: any[]; // CT_DateAx[]
  serAx?: any[]; // CT_SerAx[]
  dTable?: any; // CT_DTable
  spPr?: CT_ShapeProperties;
  extLst?: CT_ExtensionList;
}

export interface CT_Chart {
  title?: CT_Title;
  autoTitleDeleted?: CT_Boolean;
  pivotFmts?: any; // CT_PivotFmts
  view3D?: any; // CT_View3D
  floor?: any; // CT_Surface
  sideWall?: any; // CT_Surface
  backWall?: any; // CT_Surface
  plotArea: CT_PlotArea;
  legend?: CT_Legend;
  plotVisOnly?: CT_Boolean;
  dispBlanksAs?: { val?: string }; // ST_DispBlanksAs
  showDLblsOverMax?: CT_Boolean;
  extLst?: CT_ExtensionList;
}

export interface CT_ChartSpace {
  date1904?: CT_Boolean;
  lang?: CT_TextLanguageID;
  roundedCorners?: CT_Boolean;
  style?: CT_UnsignedInt;
  clrMapOvr?: any; // CT_ColorMapping
  pivotSource?: any; // CT_PivotSource
  protection?: any; // CT_Protection
  chart: CT_Chart;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  externalData?: any; // CT_ExternalData
  printSettings?: any; // CT_PrintSettings
  userShapes?: any; // CT_RelId
  extLst?: CT_ExtensionList;
}

// Additional chart types
export interface CT_View3D {
  rotX?: { val?: number };
  hPercent?: { val?: number };
  rotY?: { val?: number };
  depthPercent?: { val?: number };
  rAngAx?: { val?: boolean };
  perspective?: { val?: number };
  extLst?: CT_ExtensionList;
}

export interface CT_BubbleScale {
  val?: number; // 0-300%
}

export interface CT_SizeRepresents {
  val?: "area" | "w";
}

export interface CT_FirstSliceAng {
  val?: number; // 0-360
}

export interface CT_HoleSize {
  val?: number; // 10-90%
}

export interface CT_SplitType {
  val?: "auto" | "cust" | "percent" | "pos" | "val";
}

export interface CT_CustSplit {
  secondPiePt?: { val?: number }[];
}

export interface CT_SecondPieSize {
  val?: number; // 5-200%
}