// slides.ts - Slide-related types for presentations
import type { ST_RelationshipId } from '../shared-types';
import type { CT_ColorMapping, CT_ColorMappingOverride, CT_TextListStyle, CT_PositiveSize2D, ST_BlackWhiteMode } from '../dml-main';
import type { CT_Empty } from './common';
import type { CT_ExtensionListModify, CT_SlideTransition } from './transitions';
import type { CT_SlideTiming } from './timing-animation';
import type { CT_CommonSlideData } from './common';
import type { CT_HeaderFooter } from './common';
import type { CT_ExtensionList } from './common';

export type ST_SlideId = number; // xsd:unsignedInt, minInclusive 256, maxExclusive 2147483648
export type ST_SlideMasterId = number; // xsd:unsignedInt, minInclusive 2147483648
export type ST_SlideLayoutId = number; // xsd:unsignedInt, minInclusive 2147483648

export interface CT_SlideRelationshipListEntry {
  id: ST_RelationshipId;
}

export interface CT_SlideRelationshipList {
  sld?: CT_SlideRelationshipListEntry[];
}

export interface CT_SlideIdListEntry {
  extLst?: CT_ExtensionList;
  id: ST_SlideId;
  rId: ST_RelationshipId;
}

export interface CT_SlideIdList {
  sldId?: CT_SlideIdListEntry[];
}

export interface CT_SlideMasterIdListEntry {
  extLst?: CT_ExtensionList;
  id?: ST_SlideMasterId;
  rId: ST_RelationshipId;
}

export interface CT_SlideMasterIdList {
  sldMasterId?: CT_SlideMasterIdListEntry[];
}

export interface CT_NotesMasterIdListEntry {
  extLst?: CT_ExtensionList;
  rId: ST_RelationshipId;
}

export interface CT_NotesMasterIdList {
  notesMasterId?: CT_NotesMasterIdListEntry;
}

export interface CT_HandoutMasterIdListEntry {
  extLst?: CT_ExtensionList;
  rId: ST_RelationshipId;
}

export interface CT_HandoutMasterIdList {
  handoutMasterId?: CT_HandoutMasterIdListEntry;
}

export interface EG_TopLevelSlide {
  clrMap: CT_ColorMapping;
}

export interface EG_ChildSlide {
  clrMapOvr?: CT_ColorMappingOverride;
}

export interface AG_ChildSlide {
  showMasterSp?: boolean;
  showMasterPhAnim?: boolean;
}

export interface CT_Slide {
  cSld: CT_CommonSlideData;
  childSlide?: EG_ChildSlide;
  transition?: CT_SlideTransition;
  timing?: CT_SlideTiming;
  extLst?: CT_ExtensionListModify;
  show?: boolean;
}

export enum ST_SlideLayoutType {
  Title = "title",
  Tx = "tx",
  TwoColTx = "twoColTx",
  Tbl = "tbl",
  TxAndChart = "txAndChart",
  ChartAndTx = "chartAndTx",
  Dgm = "dgm",
  Chart = "chart",
  TxAndClipArt = "txAndClipArt",
  ClipArtAndTx = "clipArtAndTx",
  TitleOnly = "titleOnly",
  Blank = "blank",
  TxAndObj = "txAndObj",
  ObjAndTx = "objAndTx",
  ObjOnly = "objOnly",
  Obj = "obj",
  TxAndMedia = "txAndMedia",
  MediaAndTx = "mediaAndTx",
  ObjOverTx = "objOverTx",
  TxOverObj = "txOverObj",
  TxAndTwoObj = "txAndTwoObj",
  TwoObjAndTx = "twoObjAndTx",
  TwoObjOverTx = "twoObjOverTx",
  FourObj = "fourObj",
  VertTx = "vertTx",
  ClipArtAndVertTx = "clipArtAndVertTx",
  VertTitleAndTx = "vertTitleAndTx",
  VertTitleAndTxOverChart = "vertTitleAndTxOverChart",
  TwoObj = "twoObj",
  ObjAndTwoObj = "objAndTwoObj",
  TwoObjAndObj = "twoObjAndObj",
  Cust = "cust",
  SecHead = "secHead",
  TwoTxTwoObj = "twoTxTwoObj",
  ObjTx = "objTx",
  PicTx = "picTx",
}

export interface CT_SlideLayout {
  cSld: CT_CommonSlideData;
  childSlide?: EG_ChildSlide;
  transition?: CT_SlideTransition;
  timing?: CT_SlideTiming;
  hf?: CT_HeaderFooter;
  extLst?: CT_ExtensionListModify;
  matchingName?: string;
  type?: ST_SlideLayoutType;
  preserve?: boolean;
  userDrawn?: boolean;
}

export interface CT_SlideMasterTextStyles {
  titleStyle?: CT_TextListStyle;
  bodyStyle?: CT_TextListStyle;
  otherStyle?: CT_TextListStyle;
  extLst?: CT_ExtensionList;
}

export interface CT_SlideLayoutIdListEntry {
  extLst?: CT_ExtensionList;
  id?: ST_SlideLayoutId;
  rId: ST_RelationshipId;
}

export interface CT_SlideLayoutIdList {
  sldLayoutId?: CT_SlideLayoutIdListEntry[];
}

export interface CT_SlideMaster {
  cSld: CT_CommonSlideData;
  topLevelSlide: EG_TopLevelSlide;
  sldLayoutIdLst?: CT_SlideLayoutIdList;
  transition?: CT_SlideTransition;
  timing?: CT_SlideTiming;
  hf?: CT_HeaderFooter;
  txStyles?: CT_SlideMasterTextStyles;
  extLst?: CT_ExtensionListModify;
  preserve?: boolean;
}

export interface CT_HandoutMaster {
  cSld: CT_CommonSlideData;
  topLevelSlide: EG_TopLevelSlide;
  hf?: CT_HeaderFooter;
  extLst?: CT_ExtensionListModify;
}

export interface CT_NotesMaster {
  cSld: CT_CommonSlideData;
  topLevelSlide: EG_TopLevelSlide;
  hf?: CT_HeaderFooter;
  notesStyle?: CT_TextListStyle;
  extLst?: CT_ExtensionListModify;
}

export interface CT_NotesSlide {
  cSld: CT_CommonSlideData;
  childSlide?: EG_ChildSlide;
  extLst?: CT_ExtensionListModify;
}

export interface CT_SlideSyncProperties {
  extLst?: CT_ExtensionList;
  serverSldId: string;
  serverSldModifiedTime: string; // xsd:dateTime
  clientInsertedTime: string; // xsd:dateTime
}