// chart-axes-types.ts
// Axis-related types for charts

import type { CT_ShapeProperties, CT_TextBody } from "./dml-main";
import type {
  CT_Boolean,
  CT_Double,
  CT_UnsignedInt,
  CT_ExtensionList,
  CT_Tx,
} from "./chart-data-types";
import type { CT_NumFmt, CT_ChartLines } from "./chart-formatting-types";
import type { CT_Title, CT_Layout } from "./chart-legend-types";

// Axis position
export enum ST_AxPos {
  B = "b",
  L = "l",
  R = "r",
  T = "t",
}

export interface CT_AxPos {
  val: ST_AxPos;
}

// Crosses
export enum ST_Crosses {
  AutoZero = "autoZero",
  Max = "max",
  Min = "min",
}

export interface CT_Crosses {
  val: ST_Crosses;
}

// Cross between
export enum ST_CrossBetween {
  Between = "between",
  MidCat = "midCat",
}

export interface CT_CrossBetween {
  val: ST_CrossBetween;
}

// Tick marks
export enum ST_TickMark {
  Cross = "cross",
  In = "in",
  None = "none",
  Out = "out",
}

export interface CT_TickMark {
  val?: ST_TickMark;
}

// Tick label position
export enum ST_TickLblPos {
  High = "high",
  Low = "low",
  NextTo = "nextTo",
  None = "none",
}

export interface CT_TickLblPos {
  val?: ST_TickLblPos;
}

// Skip
export type ST_Skip = number; // xsd:unsignedInt, minInclusive 1

export interface CT_Skip {
  val: ST_Skip;
}

// Time unit
export enum ST_TimeUnit {
  Days = "days",
  Months = "months",
  Years = "years",
}

export interface CT_TimeUnit {
  val?: ST_TimeUnit;
}

// Axis unit
export type ST_AxisUnit = number; // xsd:double, minExclusive 0

export interface CT_AxisUnit {
  val: ST_AxisUnit;
}

// Built-in units
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

// Display units label
export interface CT_DispUnitsLbl {
  layout?: CT_Layout;
  tx?: CT_Tx;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
}

// Display units
export interface CT_DispUnits {
  custUnit?: CT_Double;
  builtInUnit?: CT_BuiltInUnit;
  dispUnitsLbl?: CT_DispUnitsLbl;
  extLst?: CT_ExtensionList;
}

// Orientation
export enum ST_Orientation {
  MaxMin = "maxMin",
  MinMax = "minMax",
}

export interface CT_Orientation {
  val?: ST_Orientation;
}

// Log base
export type ST_LogBase = number; // xsd:double, minInclusive 2, maxInclusive 1000

export interface CT_LogBase {
  val: ST_LogBase;
}

// Scaling
export interface CT_Scaling {
  logBase?: CT_LogBase;
  orientation?: CT_Orientation;
  max?: CT_Double;
  min?: CT_Double;
  extLst?: CT_ExtensionList;
}

// Label offset
export type ST_LblOffset = string; // union of ST_LblOffsetPercent
export type ST_LblOffsetPercent = string; // pattern "0*(([0-9])|([1-9][0-9])|([1-9][0-9][0-9])|1000)%"

export interface CT_LblOffset {
  val?: ST_LblOffset;
}

// Shared axis properties
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

// Category axis
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

// Date axis
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

// Series axis
export interface CT_SerAx {
  axShared: EG_AxShared;
  tickLblSkip?: CT_Skip;
  tickMarkSkip?: CT_Skip;
  extLst?: CT_ExtensionList;
}

// Value axis
export interface CT_ValAx {
  axShared: EG_AxShared;
  crossBetween?: CT_CrossBetween;
  majorUnit?: CT_AxisUnit;
  minorUnit?: CT_AxisUnit;
  dispUnits?: CT_DispUnits;
  extLst?: CT_ExtensionList;
}

// Import types from other modules
import type { CT_LblAlgn } from "./chart-formatting-types";
