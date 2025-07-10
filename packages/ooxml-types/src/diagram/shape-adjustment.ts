// shape-adjustment.ts - Shape adjustment types for diagrams
import type { CT_OfficeArtExtensionList } from '../dml-main';

// Layout shape type
export enum ST_LayoutShapeType {
  None = "none",
  Conn = "conn",
  // ... other a:ST_ShapeType values
}

export enum ST_OutputShapeType {
  None = "none",
  Conn = "conn",
}

// Index type
export type ST_Index1 = number; // xsd:unsignedInt, minInclusive 1

// Shape adjustment
export interface CT_Adj {
  idx: ST_Index1;
  val: number; // xsd:double
}

export interface CT_AdjLst {
  adj?: CT_Adj[];
}

// Shape definition
export interface CT_Shape {
  adjLst?: CT_AdjLst;
  extLst?: CT_OfficeArtExtensionList;
  rot?: number; // xsd:double
  type?: ST_LayoutShapeType;
  blip?: string; // r:blip
  zOrderOff?: number; // xsd:int
  hideGeom?: boolean;
  lkTxEntry?: boolean;
  blipPhldr?: boolean;
}