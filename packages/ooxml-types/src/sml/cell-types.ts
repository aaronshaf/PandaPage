/**
 * SpreadsheetML Cell Reference and Basic Types
 * @see ECMA-376 Part 1, §18.18 (Simple Types)
 */

import type { ST_Xstring } from "../shared/common-types";

/**
 * Cell reference.
 * @see ECMA-376 Part 1, §18.18.7 ST_CellRef
 */
export type ST_CellRef = string; // pattern: [A-Z]+[1-9][0-9]*

/**
 * Range reference.
 * @see ECMA-376 Part 1, §18.18.62 ST_Ref
 */
export type ST_Ref = string; // pattern: [A-Z]+[1-9][0-9]*\:[A-Z]+[1-9][0-9]*

/**
 * Reference (single cell or range).
 * @see ECMA-376 Part 1, §18.18.63 ST_RefA
 */
export type ST_RefA = string; // Union of ST_CellRef and ST_Ref

/**
 * Sequence of references.
 * @see ECMA-376 Part 1, §18.18.76 ST_Sqref
 */
export type ST_Sqref = string; // List of ST_Ref

/**
 * Formula string.
 * @see ECMA-376 Part 1, §18.18.35 ST_Formula
 */
export type ST_Formula = ST_Xstring;

/**
 * Unsigned integer (hex).
 * @see ECMA-376 Part 1, §18.18.86 ST_UnsignedIntHex
 */
export type ST_UnsignedIntHex = string; // xsd:hexBinary with length 4

/**
 * Cell type.
 * @see ECMA-376 Part 1, §18.18.11 ST_CellType
 */
export enum ST_CellType {
  Boolean = "b",
  Date = "d",
  Error = "e",
  InlineStr = "inlineStr",
  Number = "n",
  SharedString = "s",
  Str = "str",
}

/**
 * Cell error value.
 * @see ECMA-376 Part 1, §18.18.10 ST_CellErrorType
 */
export enum ST_CellErrorType {
  Null = "#NULL!",
  Div0 = "#DIV/0!",
  Value = "#VALUE!",
  Ref = "#REF!",
  Name = "#NAME?",
  Num = "#NUM!",
  NA = "#N/A",
  GettingData = "#GETTING_DATA",
}

/**
 * Cell formula type.
 * @see ECMA-376 Part 1, §18.18.6 ST_CellFormulaType
 */
export enum ST_CellFormulaType {
  Normal = "normal",
  Array = "array",
  DataTable = "dataTable",
  Shared = "shared",
}

/**
 * XString element.
 * @see ECMA-376 Part 1, §18.3.1.96 CT_XStringElement
 */
export interface CT_XStringElement {
  v?: ST_Xstring;
}

/**
 * Calculation cell.
 * @see ECMA-376 Part 1, §18.14.1 CT_CalcCell
 */
export interface CT_CalcCell {
  r?: ST_CellRef;
  i?: number; // xsd:int
  s?: boolean;
  l?: boolean;
  t?: boolean;
  a?: boolean;
}

/**
 * Calculation chain.
 * @see ECMA-376 Part 1, §18.14.2 CT_CalcChain
 */
export interface CT_CalcChain {
  c?: CT_CalcCell[];
  extLst?: any; // CT_ExtensionList
}

/**
 * Cell formula.
 * @see ECMA-376 Part 1, §18.3.1.40 CT_CellFormula
 */
export interface CT_CellFormula {
  _formula?: ST_Formula; // content
  t?: ST_CellFormulaType;
  aca?: boolean;
  ref?: ST_Ref;
  dt2D?: boolean;
  dtr?: boolean;
  del1?: boolean;
  del2?: boolean;
  r1?: ST_CellRef;
  r2?: ST_CellRef;
  ca?: boolean;
  si?: number; // xsd:unsignedInt
  bx?: boolean;
}

/**
 * Cell value.
 * @see ECMA-376 Part 1, §18.3.1.4 CT_Cell
 */
export interface CT_Cell {
  f?: CT_CellFormula;
  v?: ST_Xstring;
  is?: any; // CT_Rst - inline string
  extLst?: any; // CT_ExtensionList
  r?: ST_CellRef;
  s?: number; // xsd:unsignedInt - style index
  t?: ST_CellType;
  cm?: number; // xsd:unsignedInt
  vm?: number; // xsd:unsignedInt
  ph?: boolean;
}
