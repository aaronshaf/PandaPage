/**
 * WordprocessingML Document Settings Types
 * @see ECMA-376 Part 1, §17.15 (Settings)
 */

import type { ST_OnOff, ST_String, ST_DecimalNumber, ST_Lang } from '../shared/common-types';
import type { CT_OnOff, CT_String as CT_StringWml, ST_DecimalNumber as ST_DecimalNumberWml } from './basic-types';

/**
 * View type.
 * @see ECMA-376 Part 1, §17.18.102 ST_View
 */
export enum ST_View {
  None = "none",
  Print = "print",
  Outline = "outline",
  MasterPages = "masterPages",
  Normal = "normal",
  Web = "web",
}

/**
 * View.
 * @see ECMA-376 Part 1, §17.15.1.94 CT_View
 */
export interface CT_View {
  val: ST_View;
}

/**
 * Zoom type.
 * @see ECMA-376 Part 1, §17.18.107 ST_Zoom
 */
export enum ST_Zoom {
  None = "none",
  FullPage = "fullPage",
  BestFit = "bestFit",
  TextFit = "textFit",
}

/**
 * Decimal number or percent.
 * @see ECMA-376 Part 1, §17.18.11 ST_DecimalNumberOrPercent
 */
export type ST_DecimalNumberOrPercent = ST_String; // union of s:ST_Percentage and xsd:integer

/**
 * Zoom.
 * @see ECMA-376 Part 1, §17.15.1.96 CT_Zoom
 */
export interface CT_Zoom {
  val?: ST_Zoom;
  percent: ST_DecimalNumberOrPercent;
}

/**
 * Writing style.
 * @see ECMA-376 Part 1, §17.15.1.93 CT_WritingStyle
 */
export interface CT_WritingStyle {
  lang: ST_Lang;
  vendorID: ST_String;
  dllVersion: ST_String;
  nlCheck?: ST_OnOff;
  checkStyle: ST_OnOff;
  appName: ST_String;
}

/**
 * Proof state.
 * @see ECMA-376 Part 1, §17.18.69 ST_Proof
 */
export enum ST_Proof {
  Clean = "clean",
  Dirty = "dirty",
}

/**
 * Proofing state.
 * @see ECMA-376 Part 1, §17.15.1.65 CT_Proof
 */
export interface CT_Proof {
  spelling?: ST_Proof;
  grammar?: ST_Proof;
}

/**
 * Document type.
 * @see ECMA-376 Part 1, §17.18.15 ST_DocType
 */
export type ST_DocType = ST_String;

/**
 * Document type.
 * @see ECMA-376 Part 1, §17.15.1.26 CT_DocType
 */
export interface CT_DocType {
  val: ST_DocType;
}

/**
 * Document protection type.
 * @see ECMA-376 Part 1, §17.18.13 ST_DocProtect
 */
export enum ST_DocProtect {
  None = "none",
  ReadOnly = "readOnly",
  Comments = "comments",
  TrackedChanges = "trackedChanges",
  Forms = "forms",
}

/**
 * Password attributes group.
 * @see ECMA-376 Part 1, §17.15.1.44 AG_Password
 */
export interface AG_Password {
  algorithmName?: ST_String;
  hashValue?: string; // xsd:base64Binary
  saltValue?: string; // xsd:base64Binary
  spinCount?: ST_DecimalNumber;
}

/**
 * Document protection.
 * @see ECMA-376 Part 1, §17.15.1.29 CT_DocProtect
 */
export interface CT_DocProtect extends AG_Password {
  edit?: ST_DocProtect;
  formatting?: ST_OnOff;
  enforcement?: ST_OnOff;
}

/**
 * Mail merge document type.
 * @see ECMA-376 Part 1, §17.18.52 ST_MailMergeDocType
 */
export enum ST_MailMergeDocType {
  Catalog = "catalog",
  Envelopes = "envelopes",
  MailingLabels = "mailingLabels",
  FormLetters = "formLetters",
  Email = "email",
  Fax = "fax",
}

/**
 * Mail merge document type.
 * @see ECMA-376 Part 1, §17.14.23 CT_MailMergeDocType
 */
export interface CT_MailMergeDocType {
  val: ST_MailMergeDocType;
}

/**
 * Mail merge data type.
 * @see ECMA-376 Part 1, §17.18.51 ST_MailMergeDataType
 */
export type ST_MailMergeDataType = ST_String;

/**
 * Mail merge data type.
 * @see ECMA-376 Part 1, §17.14.22 CT_MailMergeDataType
 */
export interface CT_MailMergeDataType {
  val: ST_MailMergeDataType;
}

/**
 * Mail merge destination.
 * @see ECMA-376 Part 1, §17.18.53 ST_MailMergeDest
 */
export enum ST_MailMergeDest {
  NewDocument = "newDocument",
  Printer = "printer",
  Email = "email",
  Fax = "fax",
}

/**
 * Mail merge destination.
 * @see ECMA-376 Part 1, §17.14.24 CT_MailMergeDest
 */
export interface CT_MailMergeDest {
  val: ST_MailMergeDest;
}

/**
 * Mail merge field type.
 * @see ECMA-376 Part 1, §17.18.55 ST_MailMergeOdsoFMDFieldType
 */
export enum ST_MailMergeOdsoFMDFieldType {
  Null = "null",
  DbColumn = "dbColumn",
}

/**
 * Mail merge field type.
 * @see ECMA-376 Part 1, §17.14.26 CT_MailMergeOdsoFMDFieldType
 */
export interface CT_MailMergeOdsoFMDFieldType {
  val: ST_MailMergeOdsoFMDFieldType;
}

/**
 * Track changes view.
 * @see ECMA-376 Part 1, §17.15.1.81 CT_TrackChangesView
 */
export interface CT_TrackChangesView {
  markup?: ST_OnOff;
  comments?: ST_OnOff;
  insDel?: ST_OnOff;
  formatting?: ST_OnOff;
  inkAnnotations?: ST_OnOff;
}

/**
 * Kinsoku.
 * @see ECMA-376 Part 1, §17.15.1.46 CT_Kinsoku
 */
export interface CT_Kinsoku {
  lang: ST_Lang;
  val: ST_String;
}

/**
 * Height rule.
 * @see ECMA-376 Part 1, §17.18.37 ST_HeightRule
 */
export enum ST_HeightRule {
  Auto = "auto",
  Exact = "exact",
  AtLeast = "atLeast",
}

/**
 * Text wrapping.
 * @see ECMA-376 Part 1, §17.18.104 ST_Wrap
 */
export enum ST_Wrap {
  Auto = "auto",
  NotBeside = "notBeside",
  Around = "around",
  Tight = "tight",
  Through = "through",
  None = "none",
}

/**
 * Vertical anchor.
 * @see ECMA-376 Part 1, §17.18.100 ST_VAnchor
 */
export enum ST_VAnchor {
  Text = "text",
  Margin = "margin",
  Page = "page",
}

/**
 * Horizontal anchor.
 * @see ECMA-376 Part 1, §17.18.35 ST_HAnchor
 */
export enum ST_HAnchor {
  Text = "text",
  Margin = "margin",
  Page = "page",
}

/**
 * Drop cap.
 * @see ECMA-376 Part 1, §17.18.17 ST_DropCap
 */
export enum ST_DropCap {
  None = "none",
  Drop = "drop",
  Margin = "margin",
}

/**
 * Frame properties.
 * @see ECMA-376 Part 1, §17.3.1.11 CT_FramePr
 */
export interface CT_FramePr {
  dropCap?: ST_DropCap;
  lines?: ST_DecimalNumber;
  w?: any; // ST_TwipsMeasure
  h?: any; // ST_TwipsMeasure
  vSpace?: any; // ST_TwipsMeasure
  hSpace?: any; // ST_TwipsMeasure
  wrap?: ST_Wrap;
  hAnchor?: ST_HAnchor;
  vAnchor?: ST_VAnchor;
  x?: any; // ST_SignedTwipsMeasure
  xAlign?: ST_String; // s:ST_XAlign
  y?: any; // ST_SignedTwipsMeasure
  yAlign?: ST_String; // s:ST_YAlign
  hRule?: ST_HeightRule;
  anchorLock?: ST_OnOff;
}