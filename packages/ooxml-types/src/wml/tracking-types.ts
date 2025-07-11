/**
 * WordprocessingML Tracking and Revision Types
 * @see ECMA-376 Part 1, §17.13 (Annotations)
 */

import type { ST_String } from "../shared/common-types";
import type { ST_DecimalNumber } from "../shared/measurement-types";
import type { ST_DateTime } from "./basic-types";

/**
 * Displaced by custom XML.
 * @see ECMA-376 Part 1, §17.18.12 ST_DisplacedByCustomXml
 */
export enum ST_DisplacedByCustomXml {
  Next = "next",
  Prev = "prev",
}

/**
 * Annotation vertical merge.
 * @see ECMA-376 Part 1, §17.18.1 ST_AnnotationVMerge
 */
export enum ST_AnnotationVMerge {
  Cont = "cont",
  Rest = "rest",
}

/**
 * Markup.
 * @see ECMA-376 Part 1, §17.13.5 CT_Markup
 */
export interface CT_Markup {
  id: ST_DecimalNumber;
}

/**
 * Track change.
 * @see ECMA-376 Part 1, §17.13.4.2 CT_TrackChange
 */
export interface CT_TrackChange extends CT_Markup {
  author: ST_String;
  date?: ST_DateTime;
}

/**
 * Cell merge track change.
 * @see ECMA-376 Part 1, §17.13.5.4 CT_CellMergeTrackChange
 */
export interface CT_CellMergeTrackChange extends CT_TrackChange {
  vMerge?: ST_AnnotationVMerge;
  vMergeOrig?: ST_AnnotationVMerge;
}

/**
 * Track change range.
 * @see ECMA-376 Part 1, §17.13.5.38 CT_TrackChangeRange
 */
export interface CT_TrackChangeRange extends CT_TrackChange {
  displacedByCustomXml?: ST_DisplacedByCustomXml;
}

/**
 * Markup range.
 * @see ECMA-376 Part 1, §17.13.5.21 CT_MarkupRange
 */
export interface CT_MarkupRange extends CT_Markup {
  displacedByCustomXml?: ST_DisplacedByCustomXml;
}

/**
 * Bookmark range.
 * @see ECMA-376 Part 1, §17.13.6.1 CT_BookmarkRange
 */
export interface CT_BookmarkRange extends CT_MarkupRange {
  colFirst?: ST_DecimalNumber;
  colLast?: ST_DecimalNumber;
}

/**
 * Bookmark.
 * @see ECMA-376 Part 1, §17.13.6.2 CT_Bookmark
 */
export interface CT_Bookmark extends CT_BookmarkRange {
  name: ST_String;
}

/**
 * Move bookmark.
 * @see ECMA-376 Part 1, §17.13.7.1 CT_MoveBookmark
 */
export interface CT_MoveBookmark extends CT_Bookmark {
  author: ST_String;
  date: ST_DateTime;
}

/**
 * Comment.
 * @see ECMA-376 Part 1, §17.13.4.5 CT_Comment
 */
export interface CT_Comment extends CT_TrackChange {
  // EG_BlockLevelElts?: any[]; // Block level elements
  initials?: ST_String;
}

/**
 * Table properties change.
 * @see ECMA-376 Part 1, §17.13.5.36 CT_TblPrChange
 */
export interface CT_TblPrChange extends CT_TrackChange {
  tblPr: any; // CT_TblPrBase
}

/**
 * Table cell properties change.
 * @see ECMA-376 Part 1, §17.13.5.35 CT_TcPrChange
 */
export interface CT_TcPrChange extends CT_TrackChange {
  tcPr: any; // CT_TcPrInner
}

/**
 * Table row properties change.
 * @see ECMA-376 Part 1, §17.13.5.39 CT_TrPrChange
 */
export interface CT_TrPrChange extends CT_TrackChange {
  trPr: any; // CT_TrPrBase
}

/**
 * Table grid change.
 * @see ECMA-376 Part 1, §17.13.5.33 CT_TblGridChange
 */
export interface CT_TblGridChange extends CT_Markup {
  tblGrid: any; // CT_TblGridBase
}

/**
 * Table properties extended change.
 * @see ECMA-376 Part 1, §17.13.5.34 CT_TblPrExChange
 */
export interface CT_TblPrExChange extends CT_TrackChange {
  tblPrEx: any; // CT_TblPrExBase
}

/**
 * Section properties change.
 * @see ECMA-376 Part 1, §17.13.5.32 CT_SectPrChange
 */
export interface CT_SectPrChange extends CT_TrackChange {
  sectPr?: any; // CT_SectPrBase
}

/**
 * Paragraph properties change.
 * @see ECMA-376 Part 1, §17.13.5.23 CT_PPrChange
 */
export interface CT_PPrChange extends CT_TrackChange {
  pPr: any; // CT_PPrBase
}

/**
 * Run properties change.
 * @see ECMA-376 Part 1, §17.13.5.25 CT_RPrChange
 */
export interface CT_RPrChange extends CT_TrackChange {
  rPr: any; // CT_RPrOriginal
}

/**
 * Paragraph run properties change.
 * @see ECMA-376 Part 1, §17.13.5.22 CT_ParaRPrChange
 */
export interface CT_ParaRPrChange extends CT_TrackChange {
  rPr: any; // CT_ParaRPrOriginal
}

/**
 * Run track change.
 * @see ECMA-376 Part 1, §17.13.5.28 CT_RunTrackChange
 */
export interface CT_RunTrackChange extends CT_TrackChange {
  // EG_ContentRunContent or m:EG_OMathMathElements
  content?: any[];
}

/**
 * Proof error type.
 * @see ECMA-376 Part 1, §17.18.70 ST_ProofErr
 */
export enum ST_ProofErr {
  SpellStart = "spellStart",
  SpellEnd = "spellEnd",
  GramStart = "gramStart",
  GramEnd = "gramEnd",
}

/**
 * Proofing error.
 * @see ECMA-376 Part 1, §17.16.24 CT_ProofErr
 */
export interface CT_ProofErr {
  type: ST_ProofErr;
}

/**
 * Edit group.
 * @see ECMA-376 Part 1, §17.18.23 ST_EdGrp
 */
export enum ST_EdGrp {
  None = "none",
  Everyone = "everyone",
  Administrators = "administrators",
  Contributors = "contributors",
  Editors = "editors",
  Owners = "owners",
  Current = "current",
}

/**
 * Permission.
 * @see ECMA-376 Part 1, §17.13.7.4 CT_Perm
 */
export interface CT_Perm {
  id: ST_String;
  displacedByCustomXml?: ST_DisplacedByCustomXml;
}

/**
 * Permission start.
 * @see ECMA-376 Part 1, §17.13.7.5 CT_PermStart
 */
export interface CT_PermStart extends CT_Perm {
  edGrp?: ST_EdGrp;
  ed?: ST_String;
  colFirst?: ST_DecimalNumber;
  colLast?: ST_DecimalNumber;
}
