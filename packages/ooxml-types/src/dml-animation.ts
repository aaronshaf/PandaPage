/**
 * Animation types for DrawingML
 * Extracted from dml-main.ts
 */

import type { ST_Guid } from "./shared-types";

// Chart and Diagram Build Steps
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

// Animation Elements
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

// Animation Build Types
export enum ST_AnimationBuildType {
  AllAtOnce = "allAtOnce",
}

export enum ST_AnimationDgmOnlyBuildType {
  One = "one",
  LvlOne = "lvlOne",
  LvlAtOnce = "lvlAtOnce",
}

export type ST_AnimationDgmBuildType = ST_AnimationBuildType | ST_AnimationDgmOnlyBuildType;

export enum ST_AnimationChartOnlyBuildType {
  Series = "series",
  Category = "category",
  SeriesEl = "seriesEl",
  CategoryEl = "categoryEl",
}

export type ST_AnimationChartBuildType = ST_AnimationBuildType | ST_AnimationChartOnlyBuildType;

// Animation Build Properties
export interface CT_AnimationDgmBuildProperties {
  bld?: ST_AnimationDgmBuildType;
  rev?: boolean;
}

export interface CT_AnimationChartBuildProperties {
  bld?: ST_AnimationChartBuildType;
  animBg?: boolean;
}

export type CT_AnimationGraphicalObjectBuildProperties =
  | { bldDgm: CT_AnimationDgmBuildProperties }
  | { bldChart: CT_AnimationChartBuildProperties };
