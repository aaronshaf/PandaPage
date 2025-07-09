// chart-types.ts
import type { ST_String, ST_Lang, ST_PositiveUniversalMeasure, ST_Xstring } from './shared-types';
import type { CT_ShapeProperties, CT_TextBody, CT_Color } from './dml-main';

// Forward declarations for types that might be referenced before they are fully defined
export interface CT_EmbeddedWAVAudioFile {}
export interface CT_Connection {}

// Define missing types that were being imported from dml-main
export interface CT_Layout {}
export interface CT_Tx {}
export interface CT_Marker {}
export interface CT_DLbl {}
export interface CT_UnsignedInt { val: number; }
export interface CT_ExtensionList {}
export interface CT_Double { val: number; }
export interface CT_NumFmt {}
export interface CT_ChartLines {}
export interface CT_PictureOptions {}

export interface CT_Boolean {
  val?: boolean;
}

export interface CT_Double {
  val: number;
}

export interface CT_UnsignedInt {
  val: number;
}

export interface CT_RelId {
  id: string; // r:id
}

export interface CT_Extension {
  any?: any; // xsd:any
  uri?: string; // xsd:token
}

export interface CT_ExtensionList {
  ext?: CT_Extension[];
}

export interface CT_NumVal {
  v: ST_Xstring;
  idx: number; // xsd:unsignedInt
  formatCode?: ST_Xstring;
}

export interface CT_NumData {
  formatCode?: ST_Xstring;
  ptCount?: CT_UnsignedInt;
  pt?: CT_NumVal[];
  extLst?: CT_ExtensionList;
}

export interface CT_NumRef {
  f: string;
  numCache?: CT_NumData;
  extLst?: CT_ExtensionList;
}

export interface CT_NumDataSource {
  numRef?: CT_NumRef;
  numLit?: CT_NumData;
}

export interface CT_StrVal {
  v: ST_Xstring;
  idx: number; // xsd:unsignedInt
}

export interface CT_StrData {
  ptCount?: CT_UnsignedInt;
  pt?: CT_StrVal[];
  extLst?: CT_ExtensionList;
}

export interface CT_StrRef {
  f: string;
  strCache?: CT_StrData;
  extLst?: CT_ExtensionList;
}

export interface CT_Tx {
  strRef?: CT_StrRef;
  rich?: CT_TextBody;
}

export interface CT_TextLanguageID {
  val: ST_Lang;
}

export interface CT_Lvl {
  pt?: CT_StrVal[];
}

export interface CT_MultiLvlStrData {
  ptCount?: CT_UnsignedInt;
  lvl?: CT_Lvl[];
  extLst?: CT_ExtensionList;
}

export interface CT_MultiLvlStrRef {
  f: string;
  multiLvlStrCache?: CT_MultiLvlStrData;
  extLst?: CT_ExtensionList;
}

export interface CT_AxDataSource {
  multiLvlStrRef?: CT_MultiLvlStrRef;
  numRef?: CT_NumRef;
  numLit?: CT_NumData;
  strRef?: CT_StrRef;
  strLit?: CT_StrData;
}

export interface CT_SerTx {
  strRef?: CT_StrRef;
  v?: ST_Xstring;
}

export enum ST_LayoutTarget {
  Inner = "inner",
  Outer = "outer",
}
export interface CT_LayoutTarget {
  val?: ST_LayoutTarget;
}

export enum ST_LayoutMode {
  Edge = "edge",
  Factor = "factor",
}
export interface CT_LayoutMode {
  val?: ST_LayoutMode;
}

export interface CT_ManualLayout {
  layoutTarget?: CT_LayoutTarget;
  xMode?: CT_LayoutMode;
  yMode?: CT_LayoutMode;
  wMode?: CT_LayoutMode;
  hMode?: CT_LayoutMode;
  x?: CT_Double;
  y?: CT_Double;
  w?: CT_Double;
  h?: CT_Double;
  extLst?: CT_ExtensionList;
}

export interface CT_Layout {
  manualLayout?: CT_ManualLayout;
  extLst?: CT_ExtensionList;
}

export interface CT_Title {
  tx?: CT_Tx;
  layout?: CT_Layout;
  overlay?: CT_Boolean;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  extLst?: CT_ExtensionList;
}

export type ST_RotX = number; // xsd:byte, minInclusive -90, maxInclusive 90
export interface CT_RotX {
  val?: ST_RotX;
}

export type ST_HPercent = string; // union of ST_HPercentWithSymbol
export type ST_HPercentWithSymbol = string; // pattern "0*(([5-9])|([1-9][0-9])|([1-4][0-9][0-9])|500)%"
export interface CT_HPercent {
  val?: ST_HPercent;
}

export type ST_RotY = number; // xsd:unsignedShort, minInclusive 0, maxInclusive 360
export interface CT_RotY {
  val?: ST_RotY;
}

export type ST_DepthPercent = string; // union of ST_DepthPercentWithSymbol
export type ST_DepthPercentWithSymbol = string; // pattern "0*(([2-9][0-9])|([1-9][0-9][0-9])|(1[0-9][0-9][0-9])|2000)%"
export interface CT_DepthPercent {
  val?: ST_DepthPercent;
}

export type ST_Perspective = number; // xsd:unsignedByte, minInclusive 0, maxInclusive 240
export interface CT_Perspective {
  val?: ST_Perspective;
}

export interface CT_View3D {
  rotX?: CT_RotX;
  hPercent?: CT_HPercent;
  rotY?: CT_RotY;
  depthPercent?: CT_DepthPercent;
  rAngAx?: CT_Boolean;
  perspective?: CT_Perspective;
  extLst?: CT_ExtensionList;
}

export interface CT_Surface {
  thickness?: CT_Thickness;
  spPr?: CT_ShapeProperties;
  pictureOptions?: CT_PictureOptions;
  extLst?: CT_ExtensionList;
}

export type ST_Thickness = string; // union of ST_ThicknessPercent
export type ST_ThicknessPercent = string; // pattern "([0-9]+)%"
export interface CT_Thickness {
  val: ST_Thickness;
}

export interface CT_DTable {
  showHorzBorder?: CT_Boolean;
  showVertBorder?: CT_Boolean;
  showOutline?: CT_Boolean;
  showKeys?: CT_Boolean;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  extLst?: CT_ExtensionList;
}

export type ST_GapAmount = string; // union of ST_GapAmountPercent
export type ST_GapAmountPercent = string; // pattern "0*(([0-9])|([1-9][0-9])|([1-4][0-9][0-9])|500)%"
export interface CT_GapAmount {
  val?: ST_GapAmount;
}

export type ST_Overlap = string; // union of ST_OverlapPercent
export type ST_OverlapPercent = string; // pattern "(-?0*(([0-9])|([1-9][0-9])|100))%"
export interface CT_Overlap {
  val?: ST_Overlap;
}

export type ST_BubbleScale = string; // union of ST_BubbleScalePercent
export type ST_BubbleScalePercent = string; // pattern "0*(([0-9])|([1-9][0-9])|([1-2][0-9][0-9])|300)%"
export interface CT_BubbleScale {
  val?: ST_BubbleScale;
}

export enum ST_SizeRepresents {
  Area = "area",
  W = "w",
}
export interface CT_SizeRepresents {
  val?: ST_SizeRepresents;
}

export type ST_FirstSliceAng = number; // xsd:unsignedShort, minInclusive 0, maxInclusive 360
export interface CT_FirstSliceAng {
  val?: ST_FirstSliceAng;
}

export type ST_HoleSize = string; // union of ST_HoleSizePercent
export type ST_HoleSizePercent = string; // pattern "0*([1-9]|([1-8][0-9])|90)%"
export interface CT_HoleSize {
  val?: ST_HoleSize;
}

export enum ST_SplitType {
  Auto = "auto",
  Cust = "cust",
  Percent = "percent",
  Pos = "pos",
  Val = "val",
}
export interface CT_SplitType {
  val?: ST_SplitType;
}

export interface CT_CustSplit {
  secondPiePt?: CT_UnsignedInt[];
}

export type ST_SecondPieSize = string; // union of ST_SecondPieSizePercent
export type ST_SecondPieSizePercent = string; // pattern "0*(([5-9])|([1-9][0-9])|(1[0-9][0-9])|200)%"
export interface CT_SecondPieSize {
  val?: ST_SecondPieSize;
}

export interface CT_NumFmt {
  formatCode: ST_Xstring;
  sourceLinked?: boolean;
}

export enum ST_LblAlgn {
  Ctr = "ctr",
  L = "l",
  R = "r",
}
export interface CT_LblAlgn {
  val: ST_LblAlgn;
}

export enum ST_DLblPos {
  BestFit = "bestFit",
  B = "b",
  Ctr = "ctr",
  InBase = "inBase",
  InEnd = "inEnd",
  L = "l",
  OutEnd = "outEnd",
  R = "r",
  T = "t",
}
export interface CT_DLblPos {
  val: ST_DLblPos;
}

export interface EG_DLblShared {
  numFmt?: CT_NumFmt;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  dLblPos?: CT_DLblPos;
  showLegendKey?: CT_Boolean;
  showVal?: CT_Boolean;
  showCatName?: CT_Boolean;
  showSerName?: CT_Boolean;
  showPercent?: CT_Boolean;
  showBubbleSize?: CT_Boolean;
  separator?: string;
}

export interface Group_DLbl {
  layout?: CT_Layout;
  tx?: CT_Tx;
  dLblShared: EG_DLblShared;
}

export interface CT_DLbl {
  idx: CT_UnsignedInt;
  delete?: CT_Boolean;
  dLblGroup?: Group_DLbl;
  extLst?: CT_ExtensionList;
}

export interface Group_DLbls {
  dLblShared: EG_DLblShared;
  showLeaderLines?: CT_Boolean;
  leaderLines?: CT_ChartLines;
}

export interface CT_DLbls {
  dLbl?: CT_DLbl[];
  delete?: CT_Boolean;
  dLblsGroup?: Group_DLbls;
  extLst?: CT_ExtensionList;
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
export interface CT_MarkerStyle {
  val: ST_MarkerStyle;
}

export type ST_MarkerSize = number; // xsd:unsignedByte, minInclusive 2, maxInclusive 72
export interface CT_MarkerSize {
  val?: ST_MarkerSize;
}

export interface CT_Marker {
  symbol?: CT_MarkerStyle;
  size?: CT_MarkerSize;
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
  pictureOptions?: CT_PictureOptions;
  extLst?: CT_ExtensionList;
}

export enum ST_TrendlineType {
  Exp = "exp",
  Linear = "linear",
  Log = "log",
  MovingAvg = "movingAvg",
  Poly = "poly",
  Power = "power",
}
export interface CT_TrendlineType {
  val?: ST_TrendlineType;
}

export type ST_Order = number; // xsd:unsignedByte, minInclusive 2, maxInclusive 6
export interface CT_Order {
  val?: ST_Order;
}

export type ST_Period = number; // xsd:unsignedInt, minInclusive 2
export interface CT_Period {
  val?: ST_Period;
}

export interface CT_TrendlineLbl {
  layout?: CT_Layout;
  tx?: CT_Tx;
  numFmt?: CT_NumFmt;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  extLst?: CT_ExtensionList;
}

export interface CT_Trendline {
  name?: string;
  spPr?: CT_ShapeProperties;
  trendlineType: CT_TrendlineType;
  order?: CT_Order;
  period?: CT_Period;
  forward?: CT_Double;
  backward?: CT_Double;
  intercept?: CT_Double;
  dispRSqr?: CT_Boolean;
  dispEq?: CT_Boolean;
  trendlineLbl?: CT_TrendlineLbl;
  extLst?: CT_ExtensionList;
}

export enum ST_ErrDir {
  X = "x",
  Y = "y",
}
export interface CT_ErrDir {
  val: ST_ErrDir;
}

export enum ST_ErrBarType {
  Both = "both",
  Minus = "minus",
  Plus = "plus",
}
export interface CT_ErrBarType {
  val?: ST_ErrBarType;
}

export enum ST_ErrValType {
  Cust = "cust",
  FixedVal = "fixedVal",
  Percentage = "percentage",
  StdDev = "stdDev",
  StdErr = "stdErr",
}
export interface CT_ErrValType {
  val?: ST_ErrValType;
}

export interface CT_ErrBars {
  errDir?: CT_ErrDir;
  errBarType: CT_ErrBarType;
  errValType: CT_ErrValType;
  noEndCap?: CT_Boolean;
  plus?: CT_NumDataSource;
  minus?: CT_NumDataSource;
  val?: CT_Double;
  spPr?: CT_ShapeProperties;
  extLst?: CT_ExtensionList;
}

export interface CT_UpDownBar {
  spPr?: CT_ShapeProperties;
}

export interface CT_UpDownBars {
  gapWidth?: CT_GapAmount;
  upBars?: CT_UpDownBar;
  downBars?: CT_UpDownBar;
  extLst?: CT_ExtensionList;
}

export interface EG_SerShared {
  idx: CT_UnsignedInt;
  order: CT_UnsignedInt;
  tx?: CT_SerTx;
  spPr?: CT_ShapeProperties;
}

export interface CT_LineSer {
  serShared: EG_SerShared;
  marker?: CT_Marker;
  dPt?: CT_DPt[];
  dLbls?: CT_DLbls;
  trendline?: CT_Trendline[];
  errBars?: CT_ErrBars;
  cat?: CT_AxDataSource;
  val?: CT_NumDataSource;
  smooth?: CT_Boolean;
  extLst?: CT_ExtensionList;
}

export interface CT_ScatterSer {
  serShared: EG_SerShared;
  marker?: CT_Marker;
  dPt?: CT_DPt[];
  dLbls?: CT_DLbls;
  trendline?: CT_Trendline[];
  errBars?: CT_ErrBars[];
  xVal?: CT_AxDataSource;
  yVal?: CT_NumDataSource;
  smooth?: CT_Boolean;
  extLst?: CT_ExtensionList;
}

export interface CT_RadarSer {
  serShared: EG_SerShared;
  marker?: CT_Marker;
  dPt?: CT_DPt[];
  dLbls?: CT_DLbls;
  cat?: CT_AxDataSource;
  val?: CT_NumDataSource;
  extLst?: CT_ExtensionList;
}

export interface CT_BarSer {
  serShared: EG_SerShared;
  invertIfNegative?: CT_Boolean;
  pictureOptions?: CT_PictureOptions;
  dPt?: CT_DPt[];
  dLbls?: CT_DLbls;
  trendline?: CT_Trendline[];
  errBars?: CT_ErrBars;
  cat?: CT_AxDataSource;
  val?: CT_NumDataSource;
  shape?: CT_Shape;
  extLst?: CT_ExtensionList;
}

export interface CT_AreaSer {
  serShared: EG_SerShared;
  pictureOptions?: CT_PictureOptions;
  dPt?: CT_DPt[];
  dLbls?: CT_DLbls;
  trendline?: CT_Trendline[];
  errBars?: CT_ErrBars[];
  cat?: CT_AxDataSource;
  val?: CT_NumDataSource;
  extLst?: CT_ExtensionList;
}

export interface CT_PieSer {
  serShared: EG_SerShared;
  explosion?: CT_UnsignedInt;
  dPt?: CT_DPt[];
  dLbls?: CT_DLbls;
  cat?: CT_AxDataSource;
  val?: CT_NumDataSource;
  extLst?: CT_ExtensionList;
}

export interface CT_BubbleSer {
  serShared: EG_SerShared;
  invertIfNegative?: CT_Boolean;
  dPt?: CT_DPt[];
  dLbls?: CT_DLbls;
  trendline?: CT_Trendline[];
  errBars?: CT_ErrBars[];
  xVal?: CT_AxDataSource;
  yVal?: CT_NumDataSource;
  bubbleSize?: CT_NumDataSource;
  bubble3D?: CT_Boolean;
  extLst?: CT_ExtensionList;
}

export interface CT_SurfaceSer {
  serShared: EG_SerShared;
  cat?: CT_AxDataSource;
  val?: CT_NumDataSource;
  extLst?: CT_ExtensionList;
}

export enum ST_Grouping {
  PercentStacked = "percentStacked",
  Standard = "standard",
  Stacked = "stacked",
}
export interface CT_Grouping {
  val?: ST_Grouping;
}

export interface CT_ChartLines {
  spPr?: CT_ShapeProperties;
}

export interface EG_LineChartShared {
  grouping: CT_Grouping;
  varyColors?: CT_Boolean;
  ser?: CT_LineSer[];
  dLbls?: CT_DLbls;
  dropLines?: CT_ChartLines;
}

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

export interface CT_StockChart {
  ser: CT_LineSer[];
  dLbls?: CT_DLbls;
  dropLines?: CT_ChartLines;
  hiLowLines?: CT_ChartLines;
  upDownBars?: CT_UpDownBars;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

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

export interface CT_ScatterChart {
  scatterStyle: CT_ScatterStyle;
  varyColors?: CT_Boolean;
  ser?: CT_ScatterSer[];
  dLbls?: CT_DLbls;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

export enum ST_RadarStyle {
  Standard = "standard",
  Marker = "marker",
  Filled = "filled",
}
export interface CT_RadarStyle {
  val?: ST_RadarStyle;
}

export interface CT_RadarChart {
  radarStyle: CT_RadarStyle;
  varyColors?: CT_Boolean;
  ser?: CT_RadarSer[];
  dLbls?: CT_DLbls;
  axId: CT_UnsignedInt[];
  extLst?: CT_ExtensionList;
}

export enum ST_BarGrouping {
  PercentStacked = "percentStacked",
  Clustered = "clustered",
  Standard = "standard",
  Stacked = "stacked",
}
export interface CT_BarGrouping {
  val?: ST_BarGrouping;
}

export enum ST_BarDir {
  Bar = "bar",
  Col = "col",
}
export interface CT_BarDir {
  val?: ST_BarDir;
}

export enum ST_Shape {
  Cone = "cone",
  ConeToMax = "coneToMax",
  Box = "box",
  Cylinder = "cylinder",
  Pyramid = "pyramid",
  PyramidToMax = "pyramidToMax",
}
export interface CT_Shape {
  val?: ST_Shape;
}

export interface EG_BarChartShared {
  barDir: CT_BarDir;
  grouping?: CT_BarGrouping;
  varyColors?: CT_Boolean;
  ser?: CT_BarSer[];
  dLbls?: CT_DLbls;
}

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

export interface EG_AreaChartShared {
  grouping?: CT_Grouping;
  varyColors?: CT_Boolean;
  ser?: CT_AreaSer[];
  dLbls?: CT_DLbls;
  dropLines?: CT_ChartLines;
}

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

export interface EG_PieChartShared {
  varyColors?: CT_Boolean;
  ser?: CT_PieSer[];
  dLbls?: CT_DLbls;
}

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

export enum ST_OfPieType {
  Pie = "pie",
  Bar = "bar",
}
export interface CT_OfPieType {
  val?: ST_OfPieType;
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

export interface CT_BandFmt {
  idx: CT_UnsignedInt;
  spPr?: CT_ShapeProperties;
}

export interface CT_BandFmts {
  bandFmt?: CT_BandFmt[];
}

export interface EG_SurfaceChartShared {
  wireframe?: CT_Boolean;
  ser?: CT_SurfaceSer[];
  bandFmts?: CT_BandFmts;
}

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

export enum ST_AxPos {
  B = "b",
  L = "l",
  R = "r",
  T = "t",
}
export interface CT_AxPos {
  val: ST_AxPos;
}

export enum ST_Crosses {
  AutoZero = "autoZero",
  Max = "max",
  Min = "min",
}
export interface CT_Crosses {
  val: ST_Crosses;
}

export enum ST_CrossBetween {
  Between = "between",
  MidCat = "midCat",
}
export interface CT_CrossBetween {
  val: ST_CrossBetween;
}

export enum ST_TickMark {
  Cross = "cross",
  In = "in",
  None = "none",
  Out = "out",
}
export interface CT_TickMark {
  val?: ST_TickMark;
}

export enum ST_TickLblPos {
  High = "high",
  Low = "low",
  NextTo = "nextTo",
  None = "none",
}
export interface CT_TickLblPos {
  val?: ST_TickLblPos;
}

export type ST_Skip = number; // xsd:unsignedInt, minInclusive 1
export interface CT_Skip {
  val: ST_Skip;
}

export enum ST_TimeUnit {
  Days = "days",
  Months = "months",
  Years = "years",
}
export interface CT_TimeUnit {
  val?: ST_TimeUnit;
}

export type ST_AxisUnit = number; // xsd:double, minExclusive 0
export interface CT_AxisUnit {
  val: ST_AxisUnit;
}

export enum ST_BuiltInUnit {
  Hundreds = "hundreds",
  Thousands = "thousands",
  TenThousands = "tenThousands",
  HundredThousands = "hundredThousands",
  Millions = "millions",
  TenMillions = "tenMillions",
  HundredMillions = "hundredMillions",
  Billions = "billions",
  Trillions = "trillions",
}
export interface CT_BuiltInUnit {
  val?: ST_BuiltInUnit;
}

export enum ST_PictureFormat {
  Stretch = "stretch",
  Stack = "stack",
  StackScale = "stackScale",
}
export interface CT_PictureFormat {
  val: ST_PictureFormat;
}

export type ST_PictureStackUnit = number; // xsd:double, minExclusive 0
export interface CT_PictureStackUnit {
  val: ST_PictureStackUnit;
}

export interface CT_PictureOptions {
  applyToFront?: CT_Boolean;
  applyToSides?: CT_Boolean;
  applyToEnd?: CT_Boolean;
  pictureFormat?: CT_PictureFormat;
  pictureStackUnit?: CT_PictureStackUnit;
}

export interface CT_DispUnitsLbl {
  layout?: CT_Layout;
  tx?: CT_Tx;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
}

export interface CT_DispUnits {
  custUnit?: CT_Double;
  builtInUnit?: CT_BuiltInUnit;
  dispUnitsLbl?: CT_DispUnitsLbl;
  extLst?: CT_ExtensionList;
}

export enum ST_Orientation {
  MaxMin = "maxMin",
  MinMax = "minMax",
}
export interface CT_Orientation {
  val?: ST_Orientation;
}

export type ST_LogBase = number; // xsd:double, minInclusive 2, maxInclusive 1000
export interface CT_LogBase {
  val: ST_LogBase;
}

export interface CT_Scaling {
  logBase?: CT_LogBase;
  orientation?: CT_Orientation;
  max?: CT_Double;
  min?: CT_Double;
  extLst?: CT_ExtensionList;
}

export type ST_LblOffset = string; // union of ST_LblOffsetPercent
export type ST_LblOffsetPercent = string; // pattern "0*(([0-9])|([1-9][0-9])|([1-9][0-9][0-9])|1000)%"
export interface CT_LblOffset {
  val?: ST_LblOffset;
}

export interface EG_AxShared {
  axId: CT_UnsignedInt;
  scaling: CT_Scaling;
  delete?: CT_Boolean;
  axPos: CT_AxPos;
  majorGridlines?: CT_ChartLines;
  minorGridlines?: CT_ChartLines;
  title?: CT_Title;
  numFmt?: CT_NumFmt;
  majorTickMark?: CT_TickMark;
  minorTickMark?: CT_TickMark;
  tickLblPos?: CT_TickLblPos;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  crossAx: CT_UnsignedInt;
  crosses?: CT_Crosses;
  crossesAt?: CT_Double;
}

export interface CT_CatAx {
  axShared: EG_AxShared;
  auto?: CT_Boolean;
  lblAlgn?: CT_LblAlgn;
  lblOffset?: CT_LblOffset;
  tickLblSkip?: CT_Skip;
  tickMarkSkip?: CT_Skip;
  noMultiLvlLbl?: CT_Boolean;
  extLst?: CT_ExtensionList;
}

export interface CT_DateAx {
  axShared: EG_AxShared;
  auto?: CT_Boolean;
  lblOffset?: CT_LblOffset;
  baseTimeUnit?: CT_TimeUnit;
  majorUnit?: CT_AxisUnit;
  majorTimeUnit?: CT_TimeUnit;
  minorUnit?: CT_AxisUnit;
  minorTimeUnit?: CT_TimeUnit;
  extLst?: CT_ExtensionList;
}

export interface CT_SerAx {
  axShared: EG_AxShared;
  tickLblSkip?: CT_Skip;
  tickMarkSkip?: CT_Skip;
  extLst?: CT_ExtensionList;
}

export interface CT_ValAx {
  axShared: EG_AxShared;
  crossBetween?: CT_CrossBetween;
  majorUnit?: CT_AxisUnit;
  minorUnit?: CT_AxisUnit;
  dispUnits?: CT_DispUnits;
  extLst?: CT_ExtensionList;
}

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

export interface CT_PivotFmt {
  idx: CT_UnsignedInt;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  marker?: CT_Marker;
  dLbl?: CT_DLbl;
  extLst?: CT_ExtensionList;
}

export interface CT_PivotFmts {
  pivotFmt?: CT_PivotFmt[];
}

export enum ST_LegendPos {
  B = "b",
  Tr = "tr",
  L = "l",
  R = "r",
  T = "t",
}
export interface CT_LegendPos {
  val?: ST_LegendPos;
}

export interface EG_LegendEntryData {
  txPr?: CT_TextBody;
}

export interface CT_LegendEntry {
  idx: CT_UnsignedInt;
  delete?: CT_Boolean;
  legendEntryData?: EG_LegendEntryData;
  extLst?: CT_ExtensionList;
}

export interface CT_Legend {
  legendPos?: CT_LegendPos;
  legendEntry?: CT_LegendEntry[];
  layout?: CT_Layout;
  overlay?: CT_Boolean;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  extLst?: CT_ExtensionList;
}

export enum ST_DispBlanksAs {
  Span = "span",
  Gap = "gap",
  Zero = "zero",
}
export interface CT_DispBlanksAs {
  val?: ST_DispBlanksAs;
}

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

export type ST_Style = number; // xsd:unsignedByte, minInclusive 1, maxInclusive 48
export interface CT_Style {
  val: ST_Style;
}

export interface CT_PivotSource {
  name: ST_Xstring;
  fmtId: CT_UnsignedInt;
  extLst?: CT_ExtensionList[];
}

export interface CT_Protection {
  chartObject?: CT_Boolean;
  data?: CT_Boolean;
  formatting?: CT_Boolean;
  selection?: CT_Boolean;
  userInterface?: CT_Boolean;
}

export interface CT_HeaderFooter {
  oddHeader?: ST_Xstring;
  oddFooter?: ST_Xstring;
  evenHeader?: ST_Xstring;
  evenFooter?: ST_Xstring;
  firstHeader?: ST_Xstring;
  firstFooter?: ST_Xstring;
  alignWithMargins?: boolean;
  differentOddEven?: boolean;
  differentFirst?: boolean;
}

export interface CT_PageMargins {
  l: number; // xsd:double
  r: number; // xsd:double
  t: number; // xsd:double
  b: number; // xsd:double
  header: number; // xsd:double
  footer: number; // xsd:double
}

export enum ST_PageSetupOrientation {
  Default = "default",
  Portrait = "portrait",
  Landscape = "landscape",
}

export interface CT_ExternalData {
  autoUpdate?: CT_Boolean;
  id: string; // r:id
}

export interface CT_PageSetup {
  paperSize?: number; // xsd:unsignedInt
  paperHeight?: ST_PositiveUniversalMeasure;
  paperWidth?: ST_PositiveUniversalMeasure;
  firstPageNumber?: number; // xsd:unsignedInt
  orientation?: ST_PageSetupOrientation;
  blackAndWhite?: boolean;
  draft?: boolean;
  useFirstPageNumber?: boolean;
  horizontalDpi?: number; // xsd:int
  verticalDpi?: number; // xsd:int
  copies?: number; // xsd:unsignedInt
}

export interface CT_PrintSettings {
  headerFooter?: CT_HeaderFooter;
  pageMargins?: CT_PageMargins;
  pageSetup?: CT_PageSetup;
}

export interface CT_ChartSpace {
  date1904?: CT_Boolean;
  lang?: CT_TextLanguageID;
  roundedCorners?: CT_Boolean;
  style?: CT_Style;
  clrMapOvr?: any; // a:CT_ColorMapping - placeholder
  pivotSource?: CT_PivotSource;
  protection?: CT_Protection;
  chart: CT_Chart;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  externalData?: CT_ExternalData;
  printSettings?: CT_PrintSettings;
  userShapes?: CT_RelId;
  extLst?: CT_ExtensionList;
}
