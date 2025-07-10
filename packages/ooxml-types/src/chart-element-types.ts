// chart-element-types.ts
// Chart element types including various chart types and plot areas

import type { CT_ShapeProperties } from './dml-main';
import type { 
  CT_Boolean, 
  CT_Double, 
  CT_UnsignedInt, 
  CT_ExtensionList,
  CT_LineSer,
  CT_ScatterSer,
  CT_RadarSer,
  CT_BarSer,
  CT_AreaSer,
  CT_PieSer,
  CT_BubbleSer,
  CT_SurfaceSer
} from './chart-data-types';
import type { 
  CT_DLbls,
  CT_ChartLines,
  CT_UpDownBars,
  CT_GapAmount,
  CT_Overlap,
  CT_Shape,
  CT_BandFmts,
  CT_Surface
} from './chart-formatting-types';
import type { 
  CT_Layout,
  CT_Title,
  CT_DTable,
  CT_Legend,
  CT_PivotFmts
} from './chart-legend-types';
import type {
  CT_ValAx,
  CT_CatAx,
  CT_DateAx,
  CT_SerAx
} from './chart-axes-types';

// Grouping types
export enum ST_Grouping {
  PercentStacked = "percentStacked",
  Standard = "standard",
  Stacked = "stacked",
}

export interface CT_Grouping {
  val?: ST_Grouping;
}

// Bar grouping
export enum ST_BarGrouping {
  PercentStacked = "percentStacked",
  Clustered = "clustered",
  Standard = "standard",
  Stacked = "stacked",
}

export interface CT_BarGrouping {
  val?: ST_BarGrouping;
}

// Bar direction
export enum ST_BarDir {
  Bar = "bar",
  Col = "col",
}

export interface CT_BarDir {
  val?: ST_BarDir;
}

// Scatter style
export enum ST_ScatterStyle {
  None = "none",
  Line = "line",
  LineMarker = "lineMarker",
  Marker = "marker",
  Smooth = "smooth",
  SmoothMarker = "smoothMarker",
}

export interface CT_ScatterStyle {
  val?: ST_ScatterStyle;
}

// Radar style
export enum ST_RadarStyle {
  Standard = "standard",
  Marker = "marker",
  Filled = "filled",
}

export interface CT_RadarStyle {
  val?: ST_RadarStyle;
}

// Of pie type
export enum ST_OfPieType {
  Pie = "pie",
  Bar = "bar",
}

export interface CT_OfPieType {
  val?: ST_OfPieType;
}

// Shared chart properties
export interface EG_LineChartShared {
  grouping: CT_Grouping;
  varyColors?: CT_Boolean;
  ser?: CT_LineSer[];
  dLbls?: CT_DLbls;
  dropLines?: CT_ChartLines;
}

export interface EG_BarChartShared {
  barDir: CT_BarDir;
  grouping?: CT_BarGrouping;
  varyColors?: CT_Boolean;
  ser?: CT_BarSer[];
  dLbls?: CT_DLbls;
}

export interface EG_AreaChartShared {
  grouping?: CT_Grouping;
  varyColors?: CT_Boolean;
  ser?: CT_AreaSer[];
  dLbls?: CT_DLbls;
  dropLines?: CT_ChartLines;
}

export interface EG_PieChartShared {
  varyColors?: CT_Boolean;
  ser?: CT_PieSer[];
  dLbls?: CT_DLbls;
}

export interface EG_SurfaceChartShared {
  wireframe?: CT_Boolean;
  ser?: CT_SurfaceSer[];
  bandFmts?: CT_BandFmts;
}

// Line charts
export interface CT_LineChart {
  lineChartShared: EG_LineChartShared;
  hiLowLines?: CT_ChartLines;
  upDownBars?: CT_UpDownBars;
  marker?: CT_Boolean;
  smooth?: CT_Boolean;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

export interface CT_Line3DChart {
  lineChartShared: EG_LineChartShared;
  gapDepth?: CT_GapAmount;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

// Stock chart
export interface CT_StockChart {
  ser: CT_LineSer[];
  dLbls?: CT_DLbls;
  dropLines?: CT_ChartLines;
  hiLowLines?: CT_ChartLines;
  upDownBars?: CT_UpDownBars;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

// Scatter chart
export interface CT_ScatterChart {
  scatterStyle: CT_ScatterStyle;
  varyColors?: CT_Boolean;
  ser?: CT_ScatterSer[];
  dLbls?: CT_DLbls;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

// Radar chart
export interface CT_RadarChart {
  radarStyle: CT_RadarStyle;
  varyColors?: CT_Boolean;
  ser?: CT_RadarSer[];
  dLbls?: CT_DLbls;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

// Bar charts
export interface CT_BarChart {
  barChartShared: EG_BarChartShared;
  gapWidth?: CT_GapAmount;
  overlap?: CT_Overlap;
  serLines?: CT_ChartLines[];
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

export interface CT_Bar3DChart {
  barChartShared: EG_BarChartShared;
  gapWidth?: CT_GapAmount;
  gapDepth?: CT_GapAmount;
  shape?: CT_Shape;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

// Area charts
export interface CT_AreaChart {
  areaChartShared: EG_AreaChartShared;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

export interface CT_Area3DChart {
  areaChartShared: EG_AreaChartShared;
  gapDepth?: CT_GapAmount;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

// Pie charts
export interface CT_PieChart {
  pieChartShared: EG_PieChartShared;
  firstSliceAng?: CT_FirstSliceAng;
  extLst?: CT_ExtensionList;
}

export interface CT_Pie3DChart {
  pieChartShared: EG_PieChartShared;
  extLst?: CT_ExtensionList;
}

export interface CT_DoughnutChart {
  pieChartShared: EG_PieChartShared;
  firstSliceAng?: CT_FirstSliceAng;
  holeSize?: CT_HoleSize;
  extLst?: CT_ExtensionList;
}

export interface CT_OfPieChart {
  ofPieType: CT_OfPieType;
  pieChartShared: EG_PieChartShared;
  gapWidth?: CT_GapAmount;
  splitType?: CT_SplitType;
  splitPos?: CT_Double;
  custSplit?: CT_CustSplit;
  secondPieSize?: CT_SecondPieSize;
  serLines?: CT_ChartLines[];
  extLst?: CT_ExtensionList;
}

// Bubble chart
export interface CT_BubbleChart {
  varyColors?: CT_Boolean;
  ser?: CT_BubbleSer[];
  dLbls?: CT_DLbls;
  bubble3D?: CT_Boolean;
  bubbleScale?: CT_BubbleScale;
  showNegBubbles?: CT_Boolean;
  sizeRepresents?: CT_SizeRepresents;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

// Surface charts
export interface CT_SurfaceChart {
  surfaceChartShared: EG_SurfaceChartShared;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

export interface CT_Surface3DChart {
  surfaceChartShared: EG_SurfaceChartShared;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

// Plot area
export interface CT_PlotArea {
  layout?: CT_Layout;
  charts: (
    | { areaChart: CT_AreaChart }
    | { area3DChart: CT_Area3DChart }
    | { lineChart: CT_LineChart }
    | { line3DChart: CT_Line3DChart }
    | { stockChart: CT_StockChart }
    | { radarChart: CT_RadarChart }
    | { scatterChart: CT_ScatterChart }
    | { pieChart: CT_PieChart }
    | { pie3DChart: CT_Pie3DChart }
    | { doughnutChart: CT_DoughnutChart }
    | { barChart: CT_BarChart }
    | { bar3DChart: CT_Bar3DChart }
    | { ofPieChart: CT_OfPieChart }
    | { surfaceChart: CT_SurfaceChart }
    | { surface3DChart: CT_Surface3DChart }
    | { bubbleChart: CT_BubbleChart }
  )[];
  axes?: (
    | { valAx: CT_ValAx }
    | { catAx: CT_CatAx }
    | { dateAx: CT_DateAx }
    | { serAx: CT_SerAx }
  )[];
  dTable?: CT_DTable;
  spPr?: CT_ShapeProperties;
  extLst?: CT_ExtensionList;
}

// Display blanks as
export enum ST_DispBlanksAs {
  Span = "span",
  Gap = "gap",
  Zero = "zero",
}

export interface CT_DispBlanksAs {
  val?: ST_DispBlanksAs;
}

// Main chart
export interface CT_Chart {
  title?: CT_Title;
  autoTitleDeleted?: CT_Boolean;
  pivotFmts?: CT_PivotFmts;
  view3D?: CT_View3D;
  floor?: CT_Surface;
  sideWall?: CT_Surface;
  backWall?: CT_Surface;
  plotArea: CT_PlotArea;
  legend?: CT_Legend;
  plotVisOnly?: CT_Boolean;
  dispBlanksAs?: CT_DispBlanksAs;
  showDLblsOverMax?: CT_Boolean;
  extLst?: CT_ExtensionList;
}

// Import additional types
import type {
  CT_FirstSliceAng,
  CT_HoleSize,
  CT_SplitType,
  CT_CustSplit,
  CT_SecondPieSize,
  CT_BubbleScale,
  CT_SizeRepresents,
  CT_View3D
} from './chart-misc-types';