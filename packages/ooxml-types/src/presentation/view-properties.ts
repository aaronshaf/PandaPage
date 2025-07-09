// view-properties.ts - View and display-related types for presentations
import type { ST_PositiveFixedPercentage, ST_RelationshipId } from '../shared-types';
import type { CT_PositiveSize2D, CT_Point2D, CT_Scale2D, ST_Coordinate } from '../dml-main';
import type { CT_ExtensionList } from './common';
import type { ST_Direction } from './transitions';

export enum ST_SplitterBarState {
  Minimized = "minimized",
  Restored = "restored",
  Maximized = "maximized",
}

export enum ST_ViewType {
  SldView = "sldView",
  SldMasterView = "sldMasterView",
  NotesView = "notesView",
  HandoutView = "handoutView",
  NotesMasterView = "notesMasterView",
  OutlineView = "outlineView",
  SldSorterView = "sldSorterView",
  SldThumbnailView = "sldThumbnailView",
}

export interface CT_NormalViewPortion {
  sz: ST_PositiveFixedPercentage;
  autoAdjust?: boolean;
}

export interface CT_NormalViewProperties {
  restoredLeft: CT_NormalViewPortion;
  restoredTop: CT_NormalViewPortion;
  extLst?: CT_ExtensionList;
  showOutlineIcons?: boolean;
  snapVertSplitter?: boolean;
  vertBarState?: ST_SplitterBarState;
  horzBarState?: ST_SplitterBarState;
  preferSingleView?: boolean;
}

export interface CT_CommonViewProperties {
  scale: CT_Scale2D;
  origin: CT_Point2D;
  varScale?: boolean;
}

export interface CT_NotesTextViewProperties {
  cViewPr: CT_CommonViewProperties;
  extLst?: CT_ExtensionList;
}

export interface CT_OutlineViewSlideEntry {
  rId: ST_RelationshipId;
  collapse?: boolean;
}

export interface CT_OutlineViewSlideList {
  sld?: CT_OutlineViewSlideEntry[];
}

export interface CT_OutlineViewProperties {
  cViewPr: CT_CommonViewProperties;
  sldLst?: CT_OutlineViewSlideList;
  extLst?: CT_ExtensionList;
}

export interface CT_SlideSorterViewProperties {
  cViewPr: CT_CommonViewProperties;
  extLst?: CT_ExtensionList;
  showFormatting?: boolean;
}

export interface CT_Guide {
  orient?: ST_Direction;
  pos?: ST_Coordinate;
}

export interface CT_GuideList {
  guide?: CT_Guide[];
}

export interface CT_CommonSlideViewProperties {
  cViewPr: CT_CommonViewProperties;
  guideLst?: CT_GuideList;
  snapToGrid?: boolean;
  snapToObjects?: boolean;
  showGuides?: boolean;
}

export interface CT_SlideViewProperties {
  cSldViewPr: CT_CommonSlideViewProperties;
  extLst?: CT_ExtensionList;
}

export interface CT_NotesViewProperties {
  cSldViewPr: CT_CommonSlideViewProperties;
  extLst?: CT_ExtensionList;
}

export interface CT_ViewProperties {
  normalViewPr?: CT_NormalViewProperties;
  slideViewPr?: CT_SlideViewProperties;
  outlineViewPr?: CT_OutlineViewProperties;
  notesTextViewPr?: CT_NotesTextViewProperties;
  sorterViewPr?: CT_SlideSorterViewProperties;
  notesViewPr?: CT_NotesViewProperties;
  gridSpacing?: CT_PositiveSize2D;
  extLst?: CT_ExtensionList;
  lastView?: ST_ViewType;
  showComments?: boolean;
}