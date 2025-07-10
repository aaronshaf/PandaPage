// chart-formatting-types.ts
// Formatting and style types for charts

import type { ST_Xstring } from './shared-types';
import type { CT_ShapeProperties, CT_TextBody } from './dml-main';
import type { 
  CT_UnsignedInt, 
  CT_Boolean, 
  CT_Double, 
  CT_ExtensionList,
  CT_NumDataSource,
  CT_AxDataSource
} from './chart-data-types';

// Number formatting
export interface CT_NumFmt {
  formatCode: ST_Xstring;
  sourceLinked?: boolean;
}

// Marker styles and properties
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

// Data point
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

// Data label positioning
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

// Label alignment
export enum ST_LblAlgn {
  Ctr = "ctr",
  L = "l",
  R = "r",
}

export interface CT_LblAlgn {
  val: ST_LblAlgn;
}

// Data label shared properties
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

// Data label groups
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

// Chart lines
export interface CT_ChartLines {
  spPr?: CT_ShapeProperties;
}

// Trendline types
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

// Error bars
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

// Up/Down bars
export interface CT_UpDownBar {
  spPr?: CT_ShapeProperties;
}

export interface CT_UpDownBars {
  gapWidth?: CT_GapAmount;
  upBars?: CT_UpDownBar;
  downBars?: CT_UpDownBar;
  extLst?: CT_ExtensionList;
}

// Gap amount
export type ST_GapAmount = string; // union of ST_GapAmountPercent
export type ST_GapAmountPercent = string; // pattern "0*(([0-9])|([1-9][0-9])|([1-4][0-9][0-9])|500)%"

export interface CT_GapAmount {
  val?: ST_GapAmount;
}

// Overlap
export type ST_Overlap = string; // union of ST_OverlapPercent
export type ST_OverlapPercent = string; // pattern "(-?0*(([0-9])|([1-9][0-9])|100))%"

export interface CT_Overlap {
  val?: ST_Overlap;
}

// Shape types
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

// Picture formatting
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

// Surface formatting
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

// Band formatting
export interface CT_BandFmt {
  idx: CT_UnsignedInt;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  marker?: CT_Marker;
  dLbl?: CT_DLbl;
  extLst?: CT_ExtensionList;
}

export interface CT_BandFmts {
  bandFmt?: CT_BandFmt[];
}

// Style
export type ST_Style = number; // xsd:unsignedByte, minInclusive 1, maxInclusive 48

export interface CT_Style {
  val: ST_Style;
}

// Import types from other modules
import type { CT_Layout, CT_Tx } from './chart-legend-types';