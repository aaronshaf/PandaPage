/**
 * SpreadsheetML Connection and External Data Types
 * @see ECMA-376 Part 1, §18.13 (External Links)
 */

import type { ST_Xstring } from "../shared/common-types";
import type { CT_ExtensionList } from "../chart-types";

/**
 * Credential method.
 * @see ECMA-376 Part 1, §18.18.17 ST_CredMethod
 */
export enum ST_CredMethod {
  Integrated = "integrated",
  None = "none",
  Prompt = "prompt",
  Stored = "stored",
}

/**
 * HTML format.
 * @see ECMA-376 Part 1, §18.18.41 ST_HtmlFmt
 */
export enum ST_HtmlFmt {
  None = "none",
  Rtf = "rtf",
  All = "all",
}

/**
 * Parameter type.
 * @see ECMA-376 Part 1, §18.18.59 ST_ParameterType
 */
export enum ST_ParameterType {
  Prompt = "prompt",
  Value = "value",
  Cell = "cell",
}

/**
 * Connection type.
 * @see ECMA-376 Part 1, §18.12.3 ST_SourceType
 */
export enum ST_SourceType {
  Worksheet = "worksheet",
  External = "external",
  Anonymous = "anonymous",
  Scenario = "scenario",
}

/**
 * Database properties.
 * @see ECMA-376 Part 1, §18.13.4 CT_DbPr
 */
export interface CT_DbPr {
  connection: ST_Xstring;
  command?: ST_Xstring;
  serverCommand?: ST_Xstring;
  commandType?: number; // xsd:unsignedInt
}

/**
 * OLAP properties.
 * @see ECMA-376 Part 1, §18.13.7 CT_OlapPr
 */
export interface CT_OlapPr {
  local?: boolean;
  localConnection?: ST_Xstring;
  localRefresh?: boolean;
  sendLocale?: boolean;
  rowDrillCount?: number; // xsd:unsignedInt
  serverFill?: boolean;
  serverNumberFormat?: boolean;
  serverFont?: boolean;
  serverFontColor?: boolean;
}

/**
 * Web query properties.
 * @see ECMA-376 Part 1, §18.13.12 CT_WebPr
 */
export interface CT_WebPr {
  tables?: any; // CT_Tables
  url?: ST_Xstring;
  post?: ST_Xstring;
  htmlTables?: boolean;
  htmlFormat?: ST_HtmlFmt;
  editPage?: ST_Xstring;
  sourceData?: boolean;
  parsePre?: boolean;
  consecutive?: boolean;
  firstRow?: boolean;
  xl97?: boolean;
  textDates?: boolean;
  xl2000?: boolean;
}

/**
 * Text properties.
 * @see ECMA-376 Part 1, §18.13.10 CT_TextPr
 */
export interface CT_TextPr {
  textFields?: any; // CT_TextFields
  prompt?: boolean;
  fileType?: number; // xsd:unsignedInt
  codePage?: number; // xsd:unsignedInt
  characterSet?: ST_Xstring;
  firstRow?: number; // xsd:unsignedInt
  sourceFile?: ST_Xstring;
  delimited?: boolean;
  decimal?: ST_Xstring;
  thousands?: ST_Xstring;
  tab?: boolean;
  space?: boolean;
  comma?: boolean;
  semicolon?: boolean;
  consecutive?: boolean;
  qualifier?: ST_Xstring; // ST_Qualifier
  delimiter?: ST_Xstring;
}

/**
 * Parameter.
 * @see ECMA-376 Part 1, §18.13.8 CT_Parameter
 */
export interface CT_Parameter {
  name?: ST_Xstring;
  sqlType?: number; // xsd:int
  parameterType?: ST_ParameterType;
  refreshOnChange?: boolean;
  prompt?: ST_Xstring;
  boolean?: boolean;
  double?: number; // xsd:double
  integer?: number; // xsd:int
  string?: ST_Xstring;
  cell?: ST_Xstring;
}

/**
 * Parameters.
 * @see ECMA-376 Part 1, §18.13.9 CT_Parameters
 */
export interface CT_Parameters {
  parameter?: CT_Parameter[];
  count?: number; // xsd:unsignedInt
}

/**
 * Connection.
 * @see ECMA-376 Part 1, §18.13.1 CT_Connection
 */
export interface CT_Connection {
  dbPr?: CT_DbPr;
  olapPr?: CT_OlapPr;
  webPr?: CT_WebPr;
  textPr?: CT_TextPr;
  parameters?: CT_Parameters;
  extLst?: CT_ExtensionList;
  id: number; // xsd:unsignedInt
  sourceFile?: ST_Xstring;
  odcFile?: ST_Xstring;
  keepAlive?: boolean;
  interval?: number; // xsd:unsignedInt
  name?: ST_Xstring;
  description?: ST_Xstring;
  type?: number; // xsd:unsignedInt
  reconnectionMethod?: number; // xsd:unsignedInt
  refreshedVersion: number; // xsd:unsignedByte
  minRefreshableVersion?: number; // xsd:unsignedByte
  savePassword?: boolean;
  new?: boolean;
  deleted?: boolean;
  onlyUseConnectionFile?: boolean;
  background?: boolean;
  refreshOnLoad?: boolean;
  saveData?: boolean;
  credentials?: ST_CredMethod;
  singleSignOnId?: ST_Xstring;
}

/**
 * Connections.
 * @see ECMA-376 Part 1, §18.13.2 CT_Connections
 */
export interface CT_Connections {
  connection?: CT_Connection[];
}

/**
 * Data consolidation.
 * @see ECMA-376 Part 1, §18.3.1.22 CT_DataConsolidate
 */
export interface CT_DataConsolidate {
  dataRefs?: any; // CT_DataRefs
  function?: any; // ST_DataConsolidateFunction
  startLabels?: boolean;
  topLabels?: boolean;
  link?: boolean;
}

/**
 * Data validation type.
 * @see ECMA-376 Part 1, §18.18.20 ST_DataValidationType
 */
export enum ST_DataValidationType {
  None = "none",
  Whole = "whole",
  Decimal = "decimal",
  List = "list",
  Date = "date",
  Time = "time",
  TextLength = "textLength",
  Custom = "custom",
}

/**
 * Data validation error style.
 * @see ECMA-376 Part 1, §18.18.19 ST_DataValidationErrorStyle
 */
export enum ST_DataValidationErrorStyle {
  Stop = "stop",
  Warning = "warning",
  Information = "information",
}

/**
 * Data validation operator.
 * @see ECMA-376 Part 1, §18.18.18 ST_DataValidationOperator
 */
export enum ST_DataValidationOperator {
  Between = "between",
  NotBetween = "notBetween",
  Equal = "equal",
  NotEqual = "notEqual",
  LessThan = "lessThan",
  LessThanOrEqual = "lessThanOrEqual",
  GreaterThan = "greaterThan",
  GreaterThanOrEqual = "greaterThanOrEqual",
}

/**
 * Data validation.
 * @see ECMA-376 Part 1, §18.3.1.32 CT_DataValidation
 */
export interface CT_DataValidation {
  formula1?: ST_Xstring;
  formula2?: ST_Xstring;
  type?: ST_DataValidationType;
  errorStyle?: ST_DataValidationErrorStyle;
  imeMode?: any; // ST_DataValidationImeMode
  operator?: ST_DataValidationOperator;
  allowBlank?: boolean;
  showDropDown?: boolean;
  showInputMessage?: boolean;
  showErrorMessage?: boolean;
  errorTitle?: ST_Xstring;
  error?: ST_Xstring;
  promptTitle?: ST_Xstring;
  prompt?: ST_Xstring;
  sqref: any; // ST_Sqref
}

/**
 * Data validations.
 * @see ECMA-376 Part 1, §18.3.1.33 CT_DataValidations
 */
export interface CT_DataValidations {
  dataValidation?: CT_DataValidation[];
  disablePrompts?: boolean;
  xWindow?: number; // xsd:unsignedInt
  yWindow?: number; // xsd:unsignedInt
  count?: number; // xsd:unsignedInt
}
