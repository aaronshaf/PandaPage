/**
 * WordprocessingML Field and Form Types
 * @see ECMA-376 Part 1, §17.16 (Fields and Hyperlinks)
 */

import type { ST_OnOff, ST_String, ST_DecimalNumber, ST_RelationshipId } from '../shared/common-types';
import type { CT_DecimalNumber, CT_UnsignedDecimalNumber, CT_MacroName, CT_OnOff, CT_HpsMeasure, CT_String as CT_StringWml } from './basic-types';

/**
 * Field character type.
 * @see ECMA-376 Part 1, §17.18.31 ST_FldCharType
 */
export enum ST_FldCharType {
  Begin = "begin",
  Separate = "separate",
  End = "end",
}

/**
 * Info text type.
 * @see ECMA-376 Part 1, §17.18.43 ST_InfoTextType
 */
export enum ST_InfoTextType {
  Text = "text",
  AutoText = "autoText",
}

/**
 * Form field help text value.
 * @see ECMA-376 Part 1, §17.18.29 ST_FFHelpTextVal
 */
export type ST_FFHelpTextVal = string; // maxLength 256

/**
 * Form field status text value.
 * @see ECMA-376 Part 1, §17.18.32 ST_FFStatusTextVal
 */
export type ST_FFStatusTextVal = string; // maxLength 140

/**
 * Form field name.
 * @see ECMA-376 Part 1, §17.18.28 ST_FFName
 */
export type ST_FFName = string; // maxLength 65

/**
 * Form field text type.
 * @see ECMA-376 Part 1, §17.18.33 ST_FFTextType
 */
export enum ST_FFTextType {
  Regular = "regular",
  Number = "number",
  Date = "date",
  CurrentTime = "currentTime",
  CurrentDate = "currentDate",
  Calculated = "calculated",
}

/**
 * Form field text type.
 * @see ECMA-376 Part 1, §17.16.32 CT_FFTextType
 */
export interface CT_FFTextType {
  val: ST_FFTextType;
}

/**
 * Form field name.
 * @see ECMA-376 Part 1, §17.16.23 CT_FFName
 */
export interface CT_FFName {
  val?: ST_FFName;
}

/**
 * Field character.
 * @see ECMA-376 Part 1, §17.16.18 CT_FldChar
 */
export interface CT_FldChar {
  ffData?: CT_FFData;
  fldCharType: ST_FldCharType;
  fldLock?: ST_OnOff;
  dirty?: ST_OnOff;
}

/**
 * Simple field.
 * @see ECMA-376 Part 1, §17.16.19 CT_SimpleField
 */
export interface CT_SimpleField {
  // EG_PContent?: any[]; // Content elements
  instr: ST_String;
  fldLock?: ST_OnOff;
  dirty?: ST_OnOff;
}

/**
 * Hyperlink.
 * @see ECMA-376 Part 1, §17.16.22 CT_Hyperlink
 */
export interface CT_Hyperlink {
  // EG_PContent?: any[]; // Content elements
  tgtFrame?: ST_String;
  tooltip?: ST_String;
  docLocation?: ST_String;
  history?: ST_OnOff;
  anchor?: ST_String;
  id?: ST_RelationshipId; // r:id
}

/**
 * Form field data.
 * @see ECMA-376 Part 1, §17.16.17 CT_FFData
 */
export interface CT_FFData {
  name?: CT_FFName;
  label?: CT_DecimalNumber;
  tabIndex?: CT_UnsignedDecimalNumber;
  enabled?: CT_OnOff;
  calcOnExit?: CT_OnOff;
  entryMacro?: CT_MacroName;
  exitMacro?: CT_MacroName;
  helpText?: CT_FFHelpText;
  statusText?: CT_FFStatusText;
  checkBox?: CT_FFCheckBox;
  ddList?: CT_FFDDList;
  textInput?: CT_FFTextInput;
}

/**
 * Form field help text.
 * @see ECMA-376 Part 1, §17.16.20 CT_FFHelpText
 */
export interface CT_FFHelpText {
  type?: ST_InfoTextType;
  val?: ST_FFHelpTextVal;
}

/**
 * Form field status text.
 * @see ECMA-376 Part 1, §17.16.31 CT_FFStatusText
 */
export interface CT_FFStatusText {
  type?: ST_InfoTextType;
  val?: ST_FFStatusTextVal;
}

/**
 * Form field checkbox.
 * @see ECMA-376 Part 1, §17.16.14 CT_FFCheckBox
 */
export interface CT_FFCheckBox {
  size?: CT_HpsMeasure;
  sizeAuto?: CT_OnOff;
  default?: CT_OnOff;
  checked?: CT_OnOff;
}

/**
 * Form field dropdown list.
 * @see ECMA-376 Part 1, §17.16.15 CT_FFDDList
 */
export interface CT_FFDDList {
  result?: CT_DecimalNumber;
  default?: CT_DecimalNumber;
  listEntry?: CT_StringWml[];
}

/**
 * Form field text input.
 * @see ECMA-376 Part 1, §17.16.33 CT_FFTextInput
 */
export interface CT_FFTextInput {
  type?: CT_FFTextType;
  default?: CT_StringWml;
  maxLength?: CT_DecimalNumber;
  format?: CT_StringWml;
}