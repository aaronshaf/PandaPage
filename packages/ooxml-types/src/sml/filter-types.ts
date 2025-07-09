/**
 * SpreadsheetML Filter and AutoFilter Types
 * @see ECMA-376 Part 1, §18.3 (Filters)
 */

import type { ST_Xstring, ST_CalendarType } from '../shared/common-types';
import type { CT_ExtensionList } from '../spreadsheet-drawing-types';

/**
 * Reference to a cell or range.
 * @see ECMA-376 Part 1, §18.18.62 ST_Ref
 */
export type ST_Ref = string; // pattern: [A-Z]+[1-9][0-9]*\:[A-Z]+[1-9][0-9]*

/**
 * DXF identifier.
 * @see ECMA-376 Part 1, §18.3.1.26 ST_DxfId
 */
export type ST_DxfId = number; // xsd:unsignedInt

/**
 * Icon set type.
 * @see ECMA-376 Part 1, §18.18.42 ST_IconSetType
 */
export enum ST_IconSetType {
  ThreeArrows = "3Arrows",
  ThreeArrowsGray = "3ArrowsGray",
  ThreeFlags = "3Flags",
  ThreeTrafficLights1 = "3TrafficLights1",
  ThreeTrafficLights2 = "3TrafficLights2",
  ThreeSigns = "3Signs",
  ThreeSymbols = "3Symbols",
  ThreeSymbols2 = "3Symbols2",
  FourArrows = "4Arrows",
  FourArrowsGray = "4ArrowsGray",
  FourRedToBlack = "4RedToBlack",
  FourRating = "4Rating",
  FourTrafficLights = "4TrafficLights",
  FiveArrows = "5Arrows",
  FiveArrowsGray = "5ArrowsGray",
  FiveRating = "5Rating",
  FiveQuarters = "5Quarters",
}

/**
 * Filter operator.
 * @see ECMA-376 Part 1, §18.18.33 ST_FilterOperator
 */
export enum ST_FilterOperator {
  Equal = "equal",
  LessThan = "lessThan",
  LessThanOrEqual = "lessThanOrEqual",
  NotEqual = "notEqual",
  GreaterThanOrEqual = "greaterThanOrEqual",
  GreaterThan = "greaterThan",
}

/**
 * Dynamic filter type.
 * @see ECMA-376 Part 1, §18.18.26 ST_DynamicFilterType
 */
export enum ST_DynamicFilterType {
  Null = "null",
  AboveAverage = "aboveAverage",
  BelowAverage = "belowAverage",
  Tomorrow = "tomorrow",
  Today = "today",
  Yesterday = "yesterday",
  NextWeek = "nextWeek",
  ThisWeek = "thisWeek",
  LastWeek = "lastWeek",
  NextMonth = "nextMonth",
  ThisMonth = "thisMonth",
  LastMonth = "lastMonth",
  NextQuarter = "nextQuarter",
  ThisQuarter = "thisQuarter",
  LastQuarter = "lastQuarter",
  NextYear = "nextYear",
  ThisYear = "thisYear",
  LastYear = "lastYear",
  YearToDate = "yearToDate",
  Q1 = "Q1",
  Q2 = "Q2",
  Q3 = "Q3",
  Q4 = "Q4",
  M1 = "M1",
  M2 = "M2",
  M3 = "M3",
  M4 = "M4",
  M5 = "M5",
  M6 = "M6",
  M7 = "M7",
  M8 = "M8",
  M9 = "M9",
  M10 = "M10",
  M11 = "M11",
  M12 = "M12",
}

/**
 * Date/time grouping.
 * @see ECMA-376 Part 1, §18.18.21 ST_DateTimeGrouping
 */
export enum ST_DateTimeGrouping {
  Year = "year",
  Month = "month",
  Day = "day",
  Hour = "hour",
  Minute = "minute",
  Second = "second",
}

/**
 * Sort method.
 * @see ECMA-376 Part 1, §18.18.73 ST_SortMethod
 */
export enum ST_SortMethod {
  Stroke = "stroke",
  PinYin = "pinYin",
  None = "none",
}

/**
 * Sort by.
 * @see ECMA-376 Part 1, §18.18.72 ST_SortBy
 */
export enum ST_SortBy {
  Value = "value",
  CellColor = "cellColor",
  FontColor = "fontColor",
  Icon = "icon",
}

/**
 * Filter.
 * @see ECMA-376 Part 1, §18.3.1.35 CT_Filter
 */
export interface CT_Filter {
  val?: ST_Xstring;
}

/**
 * Custom filter.
 * @see ECMA-376 Part 1, §18.3.1.20 CT_CustomFilter
 */
export interface CT_CustomFilter {
  operator?: ST_FilterOperator;
  val?: ST_Xstring;
}

/**
 * Custom filters.
 * @see ECMA-376 Part 1, §18.3.1.21 CT_CustomFilters
 */
export interface CT_CustomFilters {
  customFilter: CT_CustomFilter[];
  and?: boolean;
}

/**
 * Top 10 filter.
 * @see ECMA-376 Part 1, §18.3.1.80 CT_Top10
 */
export interface CT_Top10 {
  top?: boolean;
  percent?: boolean;
  val: number; // xsd:double
  filterVal?: number; // xsd:double
}

/**
 * Color filter.
 * @see ECMA-376 Part 1, §18.3.1.14 CT_ColorFilter
 */
export interface CT_ColorFilter {
  dxfId?: ST_DxfId;
  cellColor?: boolean;
}

/**
 * Icon filter.
 * @see ECMA-376 Part 1, §18.3.1.49 CT_IconFilter
 */
export interface CT_IconFilter {
  iconSet: ST_IconSetType;
  iconId?: number; // xsd:unsignedInt
}

/**
 * Dynamic filter.
 * @see ECMA-376 Part 1, §18.3.1.28 CT_DynamicFilter
 */
export interface CT_DynamicFilter {
  type: ST_DynamicFilterType;
  val?: number; // xsd:double
  maxVal?: number; // xsd:double
}

/**
 * Date group item.
 * @see ECMA-376 Part 1, §18.3.1.23 CT_DateGroupItem
 */
export interface CT_DateGroupItem {
  year: number; // xsd:unsignedShort
  month?: number; // xsd:unsignedShort, 1-12
  day?: number; // xsd:unsignedShort, 1-31
  hour?: number; // xsd:unsignedShort, 0-23
  minute?: number; // xsd:unsignedShort, 0-59
  second?: number; // xsd:unsignedShort, 0-59
  dateTimeGrouping: ST_DateTimeGrouping;
}

/**
 * Filters.
 * @see ECMA-376 Part 1, §18.3.1.36 CT_Filters
 */
export interface CT_Filters {
  filter?: CT_Filter[];
  dateGroupItem?: CT_DateGroupItem[];
  blank?: boolean;
  calendarType?: ST_CalendarType;
}

/**
 * Filter column.
 * @see ECMA-376 Part 1, §18.3.1.37 CT_FilterColumn
 */
export interface CT_FilterColumn {
  filters?: CT_Filters;
  top10?: CT_Top10;
  customFilters?: CT_CustomFilters;
  dynamicFilter?: CT_DynamicFilter;
  colorFilter?: CT_ColorFilter;
  iconFilter?: CT_IconFilter;
  extLst?: CT_ExtensionList;
  colId: number; // xsd:unsignedInt
  hiddenButton?: boolean;
  showButton?: boolean;
}

/**
 * Sort condition.
 * @see ECMA-376 Part 1, §18.3.1.76 CT_SortCondition
 */
export interface CT_SortCondition {
  descending?: boolean;
  sortBy?: ST_SortBy;
  ref: ST_Ref;
  customList?: ST_Xstring;
  dxfId?: ST_DxfId;
  iconSet?: ST_IconSetType;
  iconId?: number; // xsd:unsignedInt
}

/**
 * Sort state.
 * @see ECMA-376 Part 1, §18.3.1.78 CT_SortState
 */
export interface CT_SortState {
  sortCondition?: CT_SortCondition[];
  extLst?: CT_ExtensionList;
  columnSort?: boolean;
  caseSensitive?: boolean;
  sortMethod?: ST_SortMethod;
  ref: ST_Ref;
}

/**
 * AutoFilter.
 * @see ECMA-376 Part 1, §18.3.1.2 CT_AutoFilter
 */
export interface CT_AutoFilter {
  filterColumn?: CT_FilterColumn[];
  sortState?: CT_SortState;
  extLst?: CT_ExtensionList;
  ref?: ST_Ref;
}