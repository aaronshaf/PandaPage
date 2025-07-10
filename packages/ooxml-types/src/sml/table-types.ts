/**
 * SpreadsheetML Table Types
 * @see ECMA-376 Part 1, §18.5 (Tables)
 */

import type { ST_Xstring } from "../shared/common-types";
import type { ST_DxfId } from "./filter-types";
import type { ST_Ref } from "./cell-types";
import type { CT_AutoFilter, CT_SortState } from "./filter-types";
import type { CT_ExtensionList } from "../chart-types";

/**
 * Table type.
 * @see ECMA-376 Part 1, §18.18.82 ST_TableType
 */
export enum ST_TableType {
  Worksheet = "worksheet",
  Xml = "xml",
  QueryTable = "queryTable",
}

/**
 * Totals row function.
 * @see ECMA-376 Part 1, §18.18.77 ST_TotalsRowFunction
 */
export enum ST_TotalsRowFunction {
  None = "none",
  Sum = "sum",
  Min = "min",
  Max = "max",
  Average = "average",
  Count = "count",
  CountNums = "countNums",
  StdDev = "stdDev",
  Var = "var",
  Custom = "custom",
}

/**
 * Table style type.
 * @see ECMA-376 Part 1, §18.18.81 ST_TableStyleType
 */
export enum ST_TableStyleType {
  WholeTable = "wholeTable",
  HeaderRow = "headerRow",
  TotalRow = "totalRow",
  FirstColumn = "firstColumn",
  LastColumn = "lastColumn",
  FirstRowStripe = "firstRowStripe",
  SecondRowStripe = "secondRowStripe",
  FirstColumnStripe = "firstColumnStripe",
  SecondColumnStripe = "secondColumnStripe",
  FirstHeaderCell = "firstHeaderCell",
  LastHeaderCell = "lastHeaderCell",
  FirstTotalCell = "firstTotalCell",
  LastTotalCell = "lastTotalCell",
  FirstSubtotalColumn = "firstSubtotalColumn",
  SecondSubtotalColumn = "secondSubtotalColumn",
  ThirdSubtotalColumn = "thirdSubtotalColumn",
  FirstSubtotalRow = "firstSubtotalRow",
  SecondSubtotalRow = "secondSubtotalRow",
  ThirdSubtotalRow = "thirdSubtotalRow",
  BlankRow = "blankRow",
  FirstColumnSubheading = "firstColumnSubheading",
  SecondColumnSubheading = "secondColumnSubheading",
  ThirdColumnSubheading = "thirdColumnSubheading",
  FirstRowSubheading = "firstRowSubheading",
  SecondRowSubheading = "secondRowSubheading",
  ThirdRowSubheading = "thirdRowSubheading",
  PageFieldLabels = "pageFieldLabels",
  PageFieldValues = "pageFieldValues",
}

/**
 * XML column properties.
 * @see ECMA-376 Part 1, §18.5.1.21 CT_XmlColumnPr
 */
export interface CT_XmlColumnPr {
  extLst?: CT_ExtensionList;
  mapId: number; // xsd:unsignedInt
  xpath: ST_Xstring;
  denormalized?: boolean;
  xmlDataType: ST_Xstring;
}

/**
 * Table calculated column formula.
 * @see ECMA-376 Part 1, §18.5.1.1 CT_TableFormula
 */
export interface CT_TableFormula {
  _formula?: ST_Xstring; // content
  array?: boolean;
}

/**
 * Table column.
 * @see ECMA-376 Part 1, §18.5.1.4 CT_TableColumn
 */
export interface CT_TableColumn {
  calculatedColumnFormula?: CT_TableFormula;
  totalsRowFormula?: CT_TableFormula;
  xmlColumnPr?: CT_XmlColumnPr;
  extLst?: CT_ExtensionList;
  id: number; // xsd:unsignedInt
  uniqueName?: ST_Xstring;
  name: ST_Xstring;
  totalsRowFunction?: ST_TotalsRowFunction;
  totalsRowLabel?: ST_Xstring;
  queryTableFieldId?: number; // xsd:unsignedInt
  headerRowDxfId?: ST_DxfId;
  dataDxfId?: ST_DxfId;
  totalsRowDxfId?: ST_DxfId;
  headerRowCellStyle?: ST_Xstring;
  dataCellStyle?: ST_Xstring;
  totalsRowCellStyle?: ST_Xstring;
}

/**
 * Table columns.
 * @see ECMA-376 Part 1, §18.5.1.5 CT_TableColumns
 */
export interface CT_TableColumns {
  tableColumn?: CT_TableColumn[];
  count?: number; // xsd:unsignedInt
}

/**
 * Table style info.
 * @see ECMA-376 Part 1, §18.5.1.12 CT_TableStyleInfo
 */
export interface CT_TableStyleInfo {
  name?: ST_Xstring;
  showFirstColumn?: boolean;
  showLastColumn?: boolean;
  showRowStripes?: boolean;
  showColumnStripes?: boolean;
}

/**
 * Table style element.
 * @see ECMA-376 Part 1, §18.8.40 CT_TableStyleElement
 */
export interface CT_TableStyleElement {
  type: ST_TableStyleType;
  size?: number; // xsd:unsignedInt
  dxfId?: ST_DxfId;
}

/**
 * Table style.
 * @see ECMA-376 Part 1, §18.8.39 CT_TableStyle
 */
export interface CT_TableStyle {
  tableStyleElement?: CT_TableStyleElement[];
  name: ST_Xstring;
  pivot?: boolean;
  table?: boolean;
  count?: number; // xsd:unsignedInt
}

/**
 * Table styles.
 * @see ECMA-376 Part 1, §18.8.41 CT_TableStyles
 */
export interface CT_TableStyles {
  tableStyle?: CT_TableStyle[];
  count?: number; // xsd:unsignedInt
  defaultTableStyle?: ST_Xstring;
  defaultPivotStyle?: ST_Xstring;
}

/**
 * Table.
 * @see ECMA-376 Part 1, §18.5.1.2 CT_Table
 */
export interface CT_Table {
  autoFilter?: CT_AutoFilter;
  sortState?: CT_SortState;
  tableColumns?: CT_TableColumns;
  tableStyleInfo?: CT_TableStyleInfo;
  extLst?: CT_ExtensionList;
  id: number; // xsd:unsignedInt
  name?: ST_Xstring;
  displayName: ST_Xstring;
  comment?: ST_Xstring;
  ref: ST_Ref;
  tableType?: ST_TableType;
  headerRowCount?: number; // xsd:unsignedInt
  insertRow?: boolean;
  insertRowShift?: boolean;
  totalsRowCount?: number; // xsd:unsignedInt
  totalsRowShown?: boolean;
  published?: boolean;
  headerRowDxfId?: ST_DxfId;
  dataDxfId?: ST_DxfId;
  totalsRowDxfId?: ST_DxfId;
  headerRowBorderDxfId?: ST_DxfId;
  tableBorderDxfId?: ST_DxfId;
  totalsRowBorderDxfId?: ST_DxfId;
  headerRowCellStyle?: ST_Xstring;
  dataCellStyle?: ST_Xstring;
  totalsRowCellStyle?: ST_Xstring;
  connectionId?: number; // xsd:unsignedInt
}

/**
 * Table parts.
 * @see ECMA-376 Part 1, §18.3.1.79 CT_TableParts
 */
export interface CT_TableParts {
  tablePart?: any[]; // CT_TablePart[]
  count?: number; // xsd:unsignedInt
}
