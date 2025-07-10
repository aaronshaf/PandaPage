// chart-data-types.ts
// Data-related types for charts including data sources, series, and values

import type { ST_Xstring, ST_Lang } from "./shared-types";
import type { CT_ShapeProperties, CT_TextBody } from "./dml-main";

// Basic data types
export interface CT_UnsignedInt {
  val: number;
}

export interface CT_Double {
  val: number;
}

export interface CT_Boolean {
  val?: boolean;
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

// Numeric data types
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

// String data types
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

// Text types
export interface CT_Tx {
  strRef?: CT_StrRef;
  rich?: CT_TextBody;
}

export interface CT_TextLanguageID {
  val: ST_Lang;
}

// Multi-level string data
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

// Axis data source
export interface CT_AxDataSource {
  multiLvlStrRef?: CT_MultiLvlStrRef;
  numRef?: CT_NumRef;
  numLit?: CT_NumData;
  strRef?: CT_StrRef;
  strLit?: CT_StrData;
}

// Series text
export interface CT_SerTx {
  strRef?: CT_StrRef;
  v?: ST_Xstring;
}

// Shared series properties
export interface EG_SerShared {
  idx: CT_UnsignedInt;
  order: CT_UnsignedInt;
  tx?: CT_SerTx;
  spPr?: CT_ShapeProperties;
}

// Series types
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

// Import types that are defined in other modules
import type {
  CT_Marker,
  CT_DPt,
  CT_DLbls,
  CT_Trendline,
  CT_ErrBars,
  CT_PictureOptions,
  CT_Shape,
} from "./chart-formatting-types";
