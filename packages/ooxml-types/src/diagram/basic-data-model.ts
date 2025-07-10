// basic-data-model.ts - Core data model types for diagrams
import type { CT_OfficeArtExtensionList, CT_ShapeProperties, CT_TextBody, CT_BackgroundFormatting, CT_WholeE2oFormatting } from '../dml-main';
import type { ST_Guid, ST_Percentage } from '../shared-types';

// Basic type definitions
export type ST_ModelId = number | ST_Guid; // xsd:int or s:ST_Guid

export enum ST_PtType {
  Node = "node",
  Asst = "asst",
  Doc = "doc",
  Pres = "pres",
  ParTrans = "parTrans",
  SibTrans = "sibTrans",
}

export enum ST_CxnType {
  ParOf = "parOf",
  PresOf = "presOf",
  PresParOf = "presParOf",
  UnknownRelationship = "unknownRelationship",
}

// Element property set
export interface CT_ElemPropSet {
  presLayoutVars?: CT_LayoutVariablePropertySet;
  style?: CT_ShapeStyle;
  presAssocID?: ST_ModelId;
  presName?: string;
  presStyleLbl?: string;
  presStyleIdx?: number; // xsd:int
  presStyleCnt?: number; // xsd:int
  loTypeId?: string;
  loCatId?: string;
  qsTypeId?: string;
  qsCatId?: string;
  csTypeId?: string;
  csCatId?: string;
  coherent3DOff?: boolean;
  phldrT?: string;
  phldr?: boolean;
  custAng?: number; // xsd:int
  custFlipVert?: boolean;
  custFlipHor?: boolean;
  custSzX?: number; // xsd:int
  custSzY?: number; // xsd:int
  custScaleX?: ST_Percentage;
  custScaleY?: ST_Percentage;
  custT?: boolean;
  custLinFactX?: ST_Percentage;
  custLinFactY?: ST_Percentage;
  custLinFactNeighborX?: ST_Percentage;
  custLinFactNeighborY?: ST_Percentage;
  custRadScaleRad?: ST_Percentage;
  custRadScaleInc?: ST_Percentage;
}

// Point definition
export interface CT_Pt {
  prSet?: CT_ElemPropSet;
  spPr?: CT_ShapeProperties;
  t?: CT_TextBody;
  extLst?: CT_OfficeArtExtensionList;
  modelId: ST_ModelId;
  type?: ST_PtType;
  cxnId?: ST_ModelId;
}

export interface CT_PtList {
  pt?: CT_Pt[];
}

// Connection definition
export interface CT_Cxn {
  extLst?: CT_OfficeArtExtensionList;
  modelId: ST_ModelId;
  type?: ST_CxnType;
  srcId: ST_ModelId;
  destId: ST_ModelId;
  srcOrd: number; // xsd:unsignedInt
  destOrd: number; // xsd:unsignedInt
  parTransId?: ST_ModelId;
  sibTransId?: ST_ModelId;
  presId?: string;
}

export interface CT_CxnList {
  cxn?: CT_Cxn[];
}

// Data model
export interface CT_DataModel {
  ptLst: CT_PtList;
  cxnLst?: CT_CxnList;
  bg?: CT_BackgroundFormatting;
  whole?: CT_WholeE2oFormatting;
  extLst?: CT_OfficeArtExtensionList;
}

// Sample data
export interface CT_SampleData {
  dataModel?: CT_DataModel;
  useDef?: boolean;
}

// Categories
export interface CT_Category {
  type: string; // xsd:anyURI
  pri: number; // xsd:unsignedInt
}

export interface CT_Categories {
  cat?: CT_Category[];
}

// Names and descriptions
export interface CT_Name {
  lang?: string;
  val: string;
}

export interface CT_Description {
  lang?: string;
  val: string;
}

// Diagram definition header
export interface CT_DiagramDefinitionHeader {
  title: CT_Name[];
  desc: CT_Description[];
  catLst?: CT_Categories;
  extLst?: CT_OfficeArtExtensionList;
  uniqueId: string;
  minVer?: string;
  resId?: number; // xsd:int
}

export interface CT_DiagramDefinitionHeaderLst {
  layoutDefHdr?: CT_DiagramDefinitionHeader[];
}

// Relation IDs
export interface CT_RelIds {
  dm: string; // r:dm
  lo: string; // r:lo
  qs: string; // r:qs
  cs: string; // r:cs
}

// Import types needed from other modules
import type { CT_LayoutVariablePropertySet } from './layout-variables';
import type { CT_ShapeStyle } from '../dml-main';