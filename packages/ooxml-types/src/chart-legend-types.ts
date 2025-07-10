// chart-legend-types.ts
// Legend, title, and layout types for charts

import type { CT_ShapeProperties, CT_TextBody } from './dml-main';
import type { 
  CT_Boolean, 
  CT_Double, 
  CT_UnsignedInt, 
  CT_ExtensionList,
  CT_StrRef,
  CT_Tx as CT_TxImport
} from './chart-data-types';

// Re-export CT_Tx to avoid circular dependency
export type CT_Tx = CT_TxImport;

// Layout target and mode
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

// Manual layout
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

// Layout
export interface CT_Layout {
  manualLayout?: CT_ManualLayout;
  extLst?: CT_ExtensionList;
}

// Title
export interface CT_Title {
  tx?: CT_Tx;
  layout?: CT_Layout;
  overlay?: CT_Boolean;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  extLst?: CT_ExtensionList;
}

// Legend position
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

// Legend entry data
export interface EG_LegendEntryData {
  txPr?: CT_TextBody;
}

// Legend entry
export interface CT_LegendEntry {
  idx: CT_UnsignedInt;
  delete?: CT_Boolean;
  legendEntryData?: EG_LegendEntryData;
  extLst?: CT_ExtensionList;
}

// Legend
export interface CT_Legend {
  legendPos?: CT_LegendPos;
  legendEntry?: CT_LegendEntry[];
  layout?: CT_Layout;
  overlay?: CT_Boolean;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  extLst?: CT_ExtensionList;
}

// Data table
export interface CT_DTable {
  showHorzBorder?: CT_Boolean;
  showVertBorder?: CT_Boolean;
  showOutline?: CT_Boolean;
  showKeys?: CT_Boolean;
  spPr?: CT_ShapeProperties;
  txPr?: CT_TextBody;
  extLst?: CT_ExtensionList;
}

// Pivot format
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

// Import types from other modules
import type { CT_Marker, CT_DLbl } from './chart-formatting-types';