// chart-data.ts - Chart data and data source types
import type { ST_String, ST_Lang, ST_Xstring } from "./shared-types";
import type { CT_TextBody } from "./dml-main";

// Basic data types
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

export interface CT_Tx {
  strRef?: CT_StrRef;
  rich?: CT_TextBody;
}

export interface CT_TextLanguageID {
  val: ST_Lang;
}

// Multi-level string data types
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
