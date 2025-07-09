// spreadsheet-types.ts
import type { ST_Xstring, ST_Guid, ST_CalendarType } from './shared-types';
import type { CT_ExtensionList, CT_Marker } from './spreadsheet-drawing-types';
import type { CT_ShapeProperties, CT_TextBody } from './dml-main';

export interface CT_AutoFilter {
  filterColumn?: CT_FilterColumn[];
  sortState?: CT_SortState;
  extLst?: CT_ExtensionList;
  ref?: ST_Ref;
}

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

export interface CT_Filters {
  filter?: CT_Filter[];
  dateGroupItem?: CT_DateGroupItem[];
  blank?: boolean;
  calendarType?: ST_CalendarType;
}

export interface CT_Filter {
  val?: ST_Xstring;
}

export interface CT_CustomFilters {
  customFilter: CT_CustomFilter[];
  and?: boolean;
}

export interface CT_CustomFilter {
  operator?: ST_FilterOperator;
  val?: ST_Xstring;
}

export interface CT_Top10 {
  top?: boolean;
  percent?: boolean;
  val: number; // xsd:double
  filterVal?: number; // xsd:double
}

export type ST_DxfId = number; // Placeholder, actual type might be more complex

export interface CT_ColorFilter {
  dxfId?: ST_DxfId;
  cellColor?: boolean;
}

export type ST_IconSetType = string; // Placeholder, actual type is enum

export interface CT_IconFilter {
  iconSet: ST_IconSetType;
  iconId?: number; // xsd:unsignedInt
}

export enum ST_FilterOperator {
  Equal = "equal",
  LessThan = "lessThan",
  LessThanOrEqual = "lessThanOrEqual",
  NotEqual = "notEqual",
  GreaterThanOrEqual = "greaterThanOrEqual",
  GreaterThan = "greaterThan",
}

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

export interface CT_DynamicFilter {
  type: ST_DynamicFilterType;
  val?: number; // xsd:double
  valIso?: string; // xsd:dateTime
  maxValIso?: string; // xsd:dateTime
}

export interface CT_SortState {
  sortCondition?: CT_SortCondition[];
  extLst?: CT_ExtensionList;
  columnSort?: boolean;
  caseSensitive?: boolean;
  sortMethod?: ST_SortMethod;
  ref: ST_Ref;
}

export interface CT_SortCondition {
  descending?: boolean;
  sortBy?: ST_SortBy;
  ref: ST_Ref;
  customList?: ST_Xstring;
  dxfId?: ST_DxfId;
  iconSet?: ST_IconSetType;
  iconId?: number; // xsd:unsignedInt
}

export enum ST_SortBy {
  Value = "value",
  CellColor = "cellColor",
  FontColor = "fontColor",
  Icon = "icon",
}

export enum ST_SortMethod {
  Stroke = "stroke",
  PinYin = "pinYin",
  None = "none",
}

export interface CT_DateGroupItem {
  year: number; // xsd:unsignedShort
  month?: number; // xsd:unsignedShort
  day?: number; // xsd:unsignedShort
  hour?: number; // xsd:unsignedShort
  minute?: number; // xsd:unsignedShort
  second?: number; // xsd:unsignedShort
  dateTimeGrouping: ST_DateTimeGrouping;
}

export enum ST_DateTimeGrouping {
  Year = "year",
  Month = "month",
  Day = "day",
  Hour = "hour",
  Minute = "minute",
  Second = "second",
}

export type ST_CellRef = string;
export type ST_Ref = string;
export type ST_RefA = string;
export type ST_Sqref = ST_Ref[];
export type ST_Formula = ST_Xstring;
export type ST_UnsignedIntHex = string; // xsd:hexBinary with length 4

export interface CT_XStringElement {
  v: ST_Xstring;
}

export interface CT_ObjectAnchor {
  from: CT_Marker;
  to: CT_Marker;
  moveWithCells?: boolean;
  sizeWithCells?: boolean;
}

export interface CT_CalcChain {
  c: CT_CalcCell[];
  extLst?: CT_ExtensionList;
}

export interface CT_CalcCell {
  r: ST_CellRef;
  i?: number; // xsd:int
  s?: boolean;
  l?: boolean;
  t?: boolean;
  a?: boolean;
}

export interface CT_Comments {
  authors: CT_Authors;
  commentList: CT_CommentList;
  extLst?: CT_ExtensionList;
}

export interface CT_Authors {
  author?: ST_Xstring[];
}

export interface CT_CommentList {
  comment?: CT_Comment[];
}

export interface CT_Comment {
  text: CT_Rst;
  commentPr?: CT_CommentPr;
  ref: ST_Ref;
  authorId: number; // xsd:unsignedInt
  guid?: ST_Guid;
  shapeId?: number; // xsd:unsignedInt
}

export interface CT_CommentPr {
  anchor: CT_ObjectAnchor;
  locked?: boolean;
  defaultSize?: boolean;
  print?: boolean;
  disabled?: boolean;
  autoFill?: boolean;
  autoLine?: boolean;
  altText?: ST_Xstring;
  textHAlign?: ST_TextHAlign;
  textVAlign?: ST_TextVAlign;
  lockText?: boolean;
  justLastX?: boolean;
  autoScale?: boolean;
}

export enum ST_TextHAlign {
  Left = "left",
  Center = "center",
  Right = "right",
  Justify = "justify",
  Distributed = "distributed",
}

export enum ST_TextVAlign {
  Top = "top",
  Center = "center",
  Bottom = "bottom",
  Justify = "justify",
  Distributed = "distributed",
}

export interface CT_MapInfo {
  Schema: CT_Schema[];
  Map: CT_Map[];
  SelectionNamespaces: string;
}

export interface CT_Schema {
  ID: string;
  SchemaRef?: string;
  Namespace?: string;
  SchemaLanguage?: string;
  any?: any; // xsd:any
}

export interface CT_Map {
  DataBinding?: CT_DataBinding;
  ID: number; // xsd:unsignedInt
  Name: string;
  RootElement: string;
  SchemaID: string;
  ShowImportExportValidationErrors: boolean;
  AutoFit: boolean;
  Append: boolean;
  PreserveSortAFLayout: boolean;
  PreserveFormat: boolean;
}

export interface CT_DataBinding {
  any?: any; // xsd:any
  DataBindingName?: string;
  FileBinding?: boolean;
  ConnectionID?: number; // xsd:unsignedInt
  FileBindingName?: string;
  DataBindingLoadMode: number; // xsd:unsignedInt
}

export interface CT_Connections {
  connection: CT_Connection[];
}

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

export enum ST_CredMethod {
  Integrated = "integrated",
  None = "none",
  Stored = "stored",
  Prompt = "prompt",
}

export interface CT_DbPr {
  connection: ST_Xstring;
  command?: ST_Xstring;
  serverCommand?: ST_Xstring;
  commandType?: number; // xsd:unsignedInt
}

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

export interface CT_WebPr {
  tables?: CT_Tables;
  xml?: boolean;
  sourceData?: boolean;
  parsePre?: boolean;
  consecutive?: boolean;
  firstRow?: boolean;
  xl97?: boolean;
  textDates?: boolean;
  xl2000?: boolean;
  url?: ST_Xstring;
  post?: ST_Xstring;
  htmlTables?: boolean;
  htmlFormat?: ST_HtmlFmt;
  editPage?: ST_Xstring;
}

export enum ST_HtmlFmt {
  None = "none",
  Rtf = "rtf",
  All = "all",
}

export interface CT_Parameters {
  parameter: CT_Parameter[];
  count?: number; // xsd:unsignedInt
}

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

export enum ST_ParameterType {
  Prompt = "prompt",
  Value = "value",
  Cell = "cell",
}

export interface CT_Tables {
  tableChoice: (
    | { m: CT_TableMissing }
    | { s: CT_XStringElement }
    | { x: CT_Index }
  )[];
  count?: number; // xsd:unsignedInt
}

export interface CT_TableMissing {}

export interface CT_TextPr {
  textFields?: CT_TextFields;
  prompt?: boolean;
  fileType?: ST_FileType;
  characterSet?: string;
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
  qualifier?: ST_Qualifier;
  delimiter?: ST_Xstring;
}

export enum ST_FileType {
  Mac = "mac",
  Win = "win",
  Dos = "dos",
  Lin = "lin",
  Other = "other",
}

export enum ST_Qualifier {
  DoubleQuote = "doubleQuote",
  SingleQuote = "singleQuote",
  None = "none",
}

export interface CT_TextFields {
  textField: CT_TextField[];
  count?: number; // xsd:unsignedInt
}

export interface CT_TextField {
  type?: ST_ExternalConnectionType;
  position?: number; // xsd:unsignedInt
}

export enum ST_ExternalConnectionType {
  General = "general",
  Text = "text",
  Mdy = "MDY",
  Dmy = "DMY",
  Ymd = "YMD",
  Myd = "MYD",
  Dym = "DYM",
  Ydm = "YDM",
  Skip = "skip",
  Emd = "EMD",
}

export interface CT_PivotCacheDefinition {
  cacheSource: CT_CacheSource;
  cacheFields: CT_CacheFields;
  cacheHierarchies?: CT_CacheHierarchies;
  kpis?: CT_PCDKPIs;
  tupleCache?: CT_TupleCache;
  calculatedItems?: CT_CalculatedItems;
  calculatedMembers?: CT_CalculatedMembers;
  dimensions?: CT_Dimensions;
  measureGroups?: CT_MeasureGroups;
  maps?: CT_MeasureDimensionMaps;
  extLst?: CT_ExtensionList;
  id?: string; // r:id
  invalid?: boolean;
  saveData?: boolean;
  refreshOnLoad?: boolean;
  optimizeMemory?: boolean;
  enableRefresh?: boolean;
  refreshedBy?: ST_Xstring;
  refreshedDateIso?: string; // xsd:dateTime
  backgroundQuery?: boolean;
  missingItemsLimit?: number; // xsd:unsignedInt
  createdVersion?: number; // xsd:unsignedByte
  refreshedVersion?: number; // xsd:unsignedByte
  minRefreshableVersion?: number; // xsd:unsignedByte
  recordCount?: number; // xsd:unsignedInt
  upgradeOnRefresh?: boolean;
  tupleCacheAttr?: boolean;
  supportSubquery?: boolean;
  supportAdvancedDrill?: boolean;
}

export interface CT_CacheFields {
  cacheField?: CT_CacheField[];
  count: number; // xsd:unsignedInt
}

export type ST_NumFmtId = number; // Placeholder, actual type might be more complex

export interface CT_CacheField {
  sharedItems?: CT_SharedItems;
  fieldGroup?: CT_FieldGroup;
  mpMap?: CT_X[];
  extLst?: CT_ExtensionList;
  name: ST_Xstring;
  caption?: ST_Xstring;
  propertyName?: ST_Xstring;
  serverField?: boolean;
  uniqueList?: boolean;
  numFmtId?: ST_NumFmtId;
  formula?: ST_Xstring;
  sqlType?: number; // xsd:int
  hierarchy?: number; // xsd:int
  level?: number; // xsd:unsignedInt
  databaseField?: boolean;
  mappingCount?: number; // xsd:unsignedInt
  memberPropertyField?: boolean;
}

export interface CT_CacheSource {
  worksheetSource?: CT_WorksheetSource;
  consolidation?: CT_Consolidation;
  extLst?: CT_ExtensionList;
  type: ST_SourceType;
  connectionId?: number; // xsd:unsignedInt
}

export enum ST_SourceType {
  Worksheet = "worksheet",
  External = "external",
  Consolidation = "consolidation",
  Scenario = "scenario",
}

export interface CT_WorksheetSource {
  ref?: ST_Ref;
  name?: ST_Xstring;
  sheet?: ST_Xstring;
  id?: string; // r:id
}

export interface CT_Consolidation {
  pages?: CT_Pages;
  rangeSets: CT_RangeSets;
  autoPage?: boolean;
}

export interface CT_Pages {
  page: CT_PCDSCPage[];
  count?: number; // xsd:unsignedInt
}

export interface CT_PCDSCPage {
  pageItem?: CT_PageItem[];
  count?: number; // xsd:unsignedInt
}

export interface CT_PageItem {
  name: ST_Xstring;
}

export interface CT_RangeSets {
  rangeSet: CT_RangeSet[];
  count?: number; // xsd:unsignedInt
}

export interface CT_RangeSet {
  i1?: number; // xsd:unsignedInt
  i2?: number; // xsd:unsignedInt
  i3?: number; // xsd:unsignedInt
  i4?: number; // xsd:unsignedInt
  ref?: ST_Ref;
  name?: ST_Xstring;
  sheet?: ST_Xstring;
  id?: string; // r:id
}

export interface CT_SharedItems {
  items?: (
    | { m: CT_Missing }
    | { n: CT_Number }
    | { b: CT_Boolean }
    | { e: CT_Error }
    | { s: CT_String }
    | { d: CT_DateTime }
  )[];
  containsSemiMixedTypes?: boolean;
  containsNonDate?: boolean;
  containsDate?: boolean;
  containsString?: boolean;
  containsBlank?: boolean;
  containsMixedTypes?: boolean;
  containsNumber?: boolean;
  containsInteger?: boolean;
  minValue?: number; // xsd:double
  maxValue?: number; // xsd:double
  minDate?: string; // xsd:dateTime
  maxDate?: string; // xsd:dateTime
  count?: number; // xsd:unsignedInt
  longText?: boolean;
}

export interface CT_Missing {
  tpls?: CT_Tuples[];
  x?: CT_X[];
  u: boolean;
  f: boolean;
  c: ST_Xstring;
  cp: number; // xsd:unsignedInt
  in?: number; // xsd:unsignedInt
  bc?: ST_UnsignedIntHex;
  fc?: ST_UnsignedIntHex;
  i?: boolean;
  un?: boolean;
  st?: boolean;
  b?: boolean;
}

export interface CT_Number {
  tpls?: CT_Tuples[];
  x?: CT_X[];
  v: number; // xsd:double
  u: boolean;
  f: boolean;
  c: ST_Xstring;
  cp: number; // xsd:unsignedInt
  in?: number; // xsd:unsignedInt
  bc?: ST_UnsignedIntHex;
  fc?: ST_UnsignedIntHex;
  i?: boolean;
  un?: boolean;
  st?: boolean;
  b?: boolean;
}

export interface CT_Boolean {
  x?: CT_X[];
  v: boolean;
  u: boolean;
  f: boolean;
  c: ST_Xstring;
  cp: number; // xsd:unsignedInt
}

export interface CT_Error {
  tpls?: CT_Tuples;
  x?: CT_X[];
  v: ST_Xstring;
  u: boolean;
  f: boolean;
  c: ST_Xstring;
  cp: number; // xsd:unsignedInt
  in?: number; // xsd:unsignedInt
  bc?: ST_UnsignedIntHex;
  fc?: ST_UnsignedIntHex;
  i?: boolean;
  un?: boolean;
  st?: boolean;
  b?: boolean;
}

export interface CT_String {
  tpls?: CT_Tuples[];
  x?: CT_X[];
  v: ST_Xstring;
  u: boolean;
  f: boolean;
  c: ST_Xstring;
  cp: number; // xsd:unsignedInt
  in?: number; // xsd:unsignedInt
  bc?: ST_UnsignedIntHex;
  fc?: ST_UnsignedIntHex;
  i?: boolean;
  un?: boolean;
  st?: boolean;
  b?: boolean;
}

export interface CT_DateTime {
  x?: CT_X[];
  v: string; // xsd:dateTime
  u: boolean;
  f: boolean;
  c: ST_Xstring;
  cp: number; // xsd:unsignedInt
}

export interface CT_FieldGroup {
  rangePr?: CT_RangePr;
  discretePr?: CT_DiscretePr;
  groupItems?: CT_GroupItems;
  par?: number; // xsd:unsignedInt
  base?: number; // xsd:unsignedInt
}

export interface CT_RangePr {
  autoStart?: boolean;
  autoEnd?: boolean;
  groupBy?: ST_GroupBy;
  startNum?: number; // xsd:double
  endNum?: number; // xsd:double
  startDate?: string; // xsd:dateTime
  endDate?: string; // xsd:dateTime
  groupInterval?: number; // xsd:double
}

export enum ST_GroupBy {
  Range = "range",
  Seconds = "seconds",
  Minutes = "minutes",
  Hours = "hours",
  Days = "days",
  Months = "months",
  Quarters = "quarters",
  Years = "years",
}

export interface CT_DiscretePr {
  x: CT_Index[];
  count?: number; // xsd:unsignedInt
}

export interface CT_GroupItems {
  items: (
    | { m: CT_Missing }
    | { n: CT_Number }
    | { b: CT_Boolean }
    | { e: CT_Error }
    | { s: CT_String }
    | { d: CT_DateTime }
  )[];
  count?: number; // xsd:unsignedInt
}

export interface CT_PivotCacheRecords {
  r?: CT_Record[];
  extLst?: CT_ExtensionList;
  count?: number; // xsd:unsignedInt
}

export interface CT_Record {
  items: (
    | { m: CT_Missing }
    | { n: CT_Number }
    | { b: CT_Boolean }
    | { e: CT_Error }
    | { s: CT_String }
    | { d: CT_DateTime }
    | { x: CT_Index }
  )[];
}

export interface CT_PCDKPIs {
  kpi?: CT_PCDKPI[];
  count?: number; // xsd:unsignedInt
}

export interface CT_PCDKPI {
  uniqueName: ST_Xstring;
  caption?: ST_Xstring;
  displayFolder?: ST_Xstring;
  measureGroup?: ST_Xstring;
  parent?: ST_Xstring;
  value: ST_Xstring;
  goal?: ST_Xstring;
  status?: ST_Xstring;
  trend?: ST_Xstring;
  weight?: ST_Xstring;
  time?: ST_Xstring;
}

export interface CT_CacheHierarchies {
  cacheHierarchy?: CT_CacheHierarchy[];
  count?: number; // xsd:unsignedInt
}

export interface CT_CacheHierarchy {
  fieldsUsage?: CT_FieldsUsage;
  groupLevels?: CT_GroupLevels;
  extLst?: CT_ExtensionList;
  uniqueName: ST_Xstring;
  caption?: ST_Xstring;
  measure?: boolean;
  set?: boolean;
  parentSet?: number; // xsd:unsignedInt
  iconSet?: number; // xsd:int
  attribute?: boolean;
  time?: boolean;
  keyAttribute?: boolean;
  defaultMemberUniqueName?: ST_Xstring;
  allUniqueName?: ST_Xstring;
  allCaption?: ST_Xstring;
  dimensionUniqueName?: ST_Xstring;
  displayFolder?: ST_Xstring;
  measureGroup?: ST_Xstring;
  measures?: boolean;
  count: number; // xsd:unsignedInt
  oneField?: boolean;
  memberValueDatatype?: number; // xsd:unsignedShort
  unbalanced?: boolean;
  unbalancedGroup?: boolean;
  hidden?: boolean;
}

export interface CT_FieldsUsage {
  fieldUsage?: CT_FieldUsage[];
  count?: number; // xsd:unsignedInt
}

export interface CT_FieldUsage {
  x: number; // xsd:int
}

export interface CT_GroupLevels {
  groupLevel: CT_GroupLevel[];
  count?: number; // xsd:unsignedInt
}

export interface CT_GroupLevel {
  groups?: CT_Groups;
  extLst?: CT_ExtensionList;
  uniqueName: ST_Xstring;
  caption: ST_Xstring;
  user?: boolean;
  customRollUp?: boolean;
}

export interface CT_Groups {
  group: CT_LevelGroup[];
  count?: number; // xsd:unsignedInt
}

export interface CT_LevelGroup {
  groupMembers: CT_GroupMembers;
  name: ST_Xstring;
  uniqueName: ST_Xstring;
  caption: ST_Xstring;
  uniqueParent?: ST_Xstring;
  id: number; // xsd:int
}

export interface CT_GroupMembers {
  groupMember: CT_GroupMember[];
  count?: number; // xsd:unsignedInt
}

export interface CT_GroupMember {
  uniqueName: ST_Xstring;
  group?: boolean;
}

export interface CT_TupleCache {
  entries?: CT_PCDSDTCEntries;
  sets?: CT_Sets;
  queryCache?: CT_QueryCache;
  serverFormats?: CT_ServerFormats;
  extLst?: CT_ExtensionList;
}

export interface CT_ServerFormat {
  culture?: ST_Xstring;
  format?: ST_Xstring;
}

export interface CT_ServerFormats {
  serverFormat?: CT_ServerFormat[];
  count?: number; // xsd:unsignedInt
}

export interface CT_PCDSDTCEntries {
  items: (
    | { m: CT_Missing }
    | { n: CT_Number }
    | { e: CT_Error }
    | { s: CT_String }
  )[];
  count?: number; // xsd:unsignedInt
}

export interface CT_Tuples {
  tpl: CT_Tuple[];
  c?: number; // xsd:unsignedInt
}

export interface CT_Tuple {
  fld?: number; // xsd:unsignedInt
  hier?: number; // xsd:unsignedInt
  item: number; // xsd:unsignedInt
}

export interface CT_Sets {
  set: CT_Set[];
  count?: number; // xsd:unsignedInt
}

export enum ST_SortType {
  None = "none",
  Ascending = "ascending",
  Descending = "descending",
  AscendingAlpha = "ascendingAlpha",
  DescendingAlpha = "descendingAlpha",
  AscendingNatural = "ascendingNatural",
  DescendingNatural = "descendingNatural",
}

export interface CT_Set {
  tpls?: CT_Tuples[];
  sortByTuple?: CT_Tuples;
  count?: number; // xsd:unsignedInt
  maxRank: number; // xsd:int
  setDefinition: ST_Xstring;
  sortType?: ST_SortType;
  queryFailed?: boolean;
}

export interface CT_QueryCache {
  query: CT_Query[];
  count?: number; // xsd:unsignedInt
}

export interface CT_Query {
  tpls?: CT_Tuples;
  mdx: ST_Xstring;
}

export interface CT_CalculatedItems {
  calculatedItem: CT_CalculatedItem[];
  count?: number; // xsd:unsignedInt
}

export interface CT_CalculatedItem {
  pivotArea: CT_PivotArea;
  extLst?: CT_ExtensionList;
  field?: number; // xsd:unsignedInt
  formula: ST_Xstring;
}

export interface CT_CalculatedMembers {
  calculatedMember: CT_CalculatedMember[];
  count?: number; // xsd:unsignedInt
}

export interface CT_CalculatedMember {
  extLst?: CT_ExtensionList;
  name: ST_Xstring;
  mdx: ST_Xstring;
  memberName?: ST_Xstring;
  hierarchy?: ST_Xstring;
  parent?: ST_Xstring;
  solveOrder?: number; // xsd:int
  set?: boolean;
}

export interface CT_pivotTableDefinition {
  location: CT_Location;
  pivotFields?: CT_PivotFields;
  rowFields?: CT_RowFields;
  rowItems?: CT_rowItems;
  colFields?: CT_ColFields;
  colItems?: CT_colItems;
  pageFields?: CT_PageFields;
  dataFields?: CT_DataFields;
  formats?: CT_Formats;
  conditionalFormats?: CT_ConditionalFormats;
  chartFormats?: CT_ChartFormats;
  pivotHierarchies?: CT_PivotHierarchies;
  pivotTableStyleInfo?: CT_PivotTableStyle;
  filters?: CT_PivotFilters;
  rowHierarchiesUsage?: CT_RowHierarchiesUsage;
  colHierarchiesUsage?: CT_ColHierarchiesUsage;
  extLst?: CT_ExtensionList;
  name: ST_Xstring;
  cacheId: number; // xsd:unsignedInt
  dataOnRows?: boolean;
  dataPosition?: number; // xsd:unsignedInt
  autoFormat?: boolean; // AG_AutoFormat
  dataCaption: ST_Xstring;
  grandTotalCaption?: ST_Xstring;
  errorCaption?: ST_Xstring;
  showError?: boolean;
  missingCaption?: ST_Xstring;
  showMissing?: boolean;
  pageStyle?: ST_Xstring;
  pivotTableStyle?: ST_Xstring;
  vacatedStyle?: ST_Xstring;
  tag?: ST_Xstring;
  updatedVersion?: number; // xsd:unsignedByte
  minRefreshableVersion?: number; // xsd:unsignedByte
  asteriskTotals?: boolean;
  showItems?: boolean;
  editData?: boolean;
  disableFieldList?: boolean;
  showCalcMbrs?: boolean;
  visualTotals?: boolean;
  showMultipleLabel?: boolean;
  showDataDropDown?: boolean;
  showDrill?: boolean;
  printDrill?: boolean;
  showMemberPropertyTips?: boolean;
  showDataTips?: boolean;
  enableWizard?: boolean;
  enableDrill?: boolean;
  enableFieldProperties?: boolean;
  preserveFormatting?: boolean;
  useAutoFormatting?: boolean;
  pageWrap?: number; // xsd:unsignedInt
  pageOverThenDown?: boolean;
  subtotalHiddenItems?: boolean;
  rowGrandTotals?: boolean;
  colGrandTotals?: boolean;
  fieldPrintTitles?: boolean;
  itemPrintTitles?: boolean;
  mergeItem?: boolean;
  showDropZones?: boolean;
  createdVersion?: number; // xsd:unsignedByte
  indent?: number; // xsd:unsignedInt
  showEmptyRow?: boolean;
  showEmptyCol?: boolean;
  showHeaders?: boolean;
  compact?: boolean;
  outline?: boolean;
  outlineData?: boolean;
  compactData?: boolean;
  published?: boolean;
  gridDropZones?: boolean;
  immersive?: boolean;
  multipleFieldFilters?: boolean;
  chartFormat?: number; // xsd:unsignedInt
  rowHeaderCaption?: ST_Xstring;
  colHeaderCaption?: ST_Xstring;
  fieldListSortAscending?: boolean;
  mdxSubqueries?: boolean;
  customListSort?: boolean;
}

export interface CT_Location {
  ref: ST_Ref;
  firstHeaderRow: number; // xsd:unsignedInt
  firstDataRow: number; // xsd:unsignedInt
  firstDataCol: number; // xsd:unsignedInt
  rowPageCount?: number; // xsd:unsignedInt
  colPageCount?: number; // xsd:unsignedInt
}

export interface CT_PivotFields {
  pivotField: CT_PivotField[];
  count?: number; // xsd:unsignedInt
}

export interface CT_PivotField {
  items?: CT_Items;
  autoSortScope?: CT_AutoSortScope;
  extLst?: CT_ExtensionList;
  name?: ST_Xstring;
  axis?: ST_Axis;
  dataField?: boolean;
  subtotalCaption?: ST_Xstring;
  showDropDowns?: boolean;
  hiddenLevel?: boolean;
  uniqueMemberProperty?: ST_Xstring;
  compact?: boolean;
  allDrilled?: boolean;
  numFmtId?: ST_NumFmtId;
  outline?: boolean;
  subtotalTop?: boolean;
  dragToRow?: boolean;
  dragToCol?: boolean;
  multipleItemSelectionAllowed?: boolean;
  dragToPage?: boolean;
  dragToData?: boolean;
  dragOff?: boolean;
  showAll?: boolean;
  insertBlankRow?: boolean;
  serverField?: boolean;
  insertPageBreak?: boolean;
  autoShow?: boolean;
  topAutoShow?: boolean;
  hideNewItems?: boolean;
  measureFilter?: boolean;
  includeNewItemsInFilter?: boolean;
  itemPageCount?: number; // xsd:unsignedInt
  sortType?: ST_FieldSortType;
  dataSourceSort?: boolean;
  nonAutoSortDefault?: boolean;
  rankBy?: number; // xsd:unsignedInt
  defaultSubtotal?: boolean;
  sumSubtotal?: boolean;
  countASubtotal?: boolean;
  avgSubtotal?: boolean;
  maxSubtotal?: boolean;
  minSubtotal?: boolean;
  productSubtotal?: boolean;
  countSubtotal?: boolean;
  stdDevSubtotal?: boolean;
  stdDevPSubtotal?: boolean;
  varSubtotal?: boolean;
  varPSubtotal?: boolean;
  showPropCell?: boolean;
  showPropTip?: boolean;
  showPropAsCaption?: boolean;
  defaultAttributeDrillState?: boolean;
}

export interface CT_AutoSortScope {
  pivotArea: CT_PivotArea;
}

export interface CT_Items {
  item: CT_Item[];
  count?: number; // xsd:unsignedInt
}

export enum ST_ItemType {
  Data = "data",
  Default = "default",
  Sum = "sum",
  CountA = "countA",
  Avg = "avg",
  Max = "max",
  Min = "min",
  Product = "product",
  Count = "count",
  StdDev = "stdDev",
  StdDevP = "stdDevP",
  Var = "var",
  VarP = "varP",
  Grand = "grand",
  Blank = "blank",
}

export interface CT_Item {
  n?: ST_Xstring;
  t?: ST_ItemType;
  h?: boolean;
  s?: boolean;
  sd?: boolean;
  f?: boolean;
  m?: boolean;
  c?: boolean;
  x?: number; // xsd:unsignedInt
  d?: boolean;
  e?: boolean;
}

export interface CT_PageFields {
  pageField: CT_PageField[];
  count?: number; // xsd:unsignedInt
}

export interface CT_PageField {
  extLst?: CT_ExtensionList;
  fld: number; // xsd:int
  item?: number; // xsd:unsignedInt
  hier?: number; // xsd:int
  name?: ST_Xstring;
  cap?: ST_Xstring;
}

export interface CT_DataFields {
  dataField: CT_DataField[];
  count?: number; // xsd:unsignedInt
}

export enum ST_DataConsolidateFunction {
  Sum = "sum",
  Count = "count",
  Average = "average",
  Max = "max",
  Min = "min",
  Product = "product",
  CountNums = "countNums",
  StdDev = "stdDev",
  StdDevp = "stdDevp",
  Var = "var",
  Varp = "varp",
}

export enum ST_ShowDataAs {
  Normal = "normal",
  Difference = "difference",
  Percent = "percent",
  PercentDiff = "percentDiff",
  RunTotal = "runTotal",
  PercentOfRow = "percentOfRow",
  PercentOfCol = "percentOfCol",
  PercentOfTotal = "percentOfTotal",
  Index = "index",
}

export interface CT_DataField {
  extLst?: CT_ExtensionList;
  name?: ST_Xstring;
  fld: number; // xsd:unsignedInt
  subtotal?: ST_DataConsolidateFunction;
  showDataAs?: ST_ShowDataAs;
  baseField?: number; // xsd:int
  baseItem?: number; // xsd:unsignedInt
  numFmtId?: ST_NumFmtId;
}

export interface CT_rowItems {
  i: CT_I[];
  count?: number; // xsd:unsignedInt
}

export interface CT_colItems {
  i: CT_I[];
  count?: number; // xsd:unsignedInt
}

export interface CT_I {
  x?: CT_X[];
  t?: ST_ItemType;
  r?: number; // xsd:unsignedInt
  i?: number; // xsd:unsignedInt
}

export interface CT_X {
  v?: number; // xsd:int
}

export interface CT_RowFields {
  field: CT_Field[];
  count?: number; // xsd:unsignedInt
}

export interface CT_ColFields {
  field: CT_Field[];
  count?: number; // xsd:unsignedInt
}

export interface CT_Field {
  x: number; // xsd:int
}

export interface CT_Formats {
  format: CT_Format[];
  count?: number; // xsd:unsignedInt
}

export enum ST_FormatAction {
  Blank = "blank",
  Formatting = "formatting",
  Drill = "drill",
  Formula = "formula",
}

export interface CT_Format {
  pivotArea: CT_PivotArea;
  extLst?: CT_ExtensionList;
  action?: ST_FormatAction;
  dxfId?: ST_DxfId;
}

export interface CT_ConditionalFormats {
  conditionalFormat: CT_ConditionalFormat[];
  count?: number; // xsd:unsignedInt
}

export enum ST_Scope {
  Selection = "selection",
  Data = "data",
  Field = "field",
}

export enum ST_Type {
  None = "none",
  All = "all",
  Row = "row",
  Column = "column",
}

export interface CT_ConditionalFormat {
  pivotAreas: CT_PivotAreas;
  extLst?: CT_ExtensionList;
  scope?: ST_Scope;
  type?: ST_Type;
  priority: number; // xsd:unsignedInt
}

export interface CT_PivotAreas {
  pivotArea?: CT_PivotArea[];
  count?: number; // xsd:unsignedInt
}

export enum ST_PivotAreaType {
  None = "none",
  Normal = "normal",
  Data = "data",
  All = "all",
  Origin = "origin",
  Button = "button",
  TopEnd = "topEnd",
}

export interface CT_PivotArea {
  references?: CT_PivotAreaReferences;
  extLst?: CT_ExtensionList;
  field?: number; // xsd:int
  type?: ST_PivotAreaType;
  dataOnly?: boolean;
  labelOnly?: boolean;
  grandRow?: boolean;
  grandCol?: boolean;
  cacheIndex?: boolean;
  outline?: boolean;
  offset?: ST_Ref;
  collapsedLevelsAreSubtotals?: boolean;
  axis?: ST_Axis;
  fieldPosition?: number; // xsd:unsignedInt
}

export interface CT_PivotAreaReferences {
  reference: CT_PivotAreaReference[];
  count?: number; // xsd:unsignedInt
}

export interface CT_PivotAreaReference {
  x?: CT_Index[];
  extLst?: CT_ExtensionList;
  field?: number; // xsd:unsignedInt
  count?: number; // xsd:unsignedInt
  selected?: boolean;
  byPosition?: boolean;
  relative?: boolean;
  defaultSubtotal?: boolean;
  sumSubtotal?: boolean;
  countASubtotal?: boolean;
  avgSubtotal?: boolean;
  maxSubtotal?: boolean;
  minSubtotal?: boolean;
  productSubtotal?: boolean;
  countSubtotal?: boolean;
  stdDevSubtotal?: boolean;
  stdDevPSubtotal?: boolean;
  varSubtotal?: boolean;
  varPSubtotal?: boolean;
}

export interface CT_Index {
  v: number; // xsd:unsignedInt
}

export enum ST_Axis {
  AxisRow = "axisRow",
  AxisCol = "axisCol",
  AxisPage = "axisPage",
  AxisValues = "axisValues",
}

export interface CT_ChartFormats {
  chartFormat: CT_ChartFormat[];
  count?: number; // xsd:unsignedInt
}

export interface CT_ChartFormat {
  pivotArea: CT_PivotArea;
  chart: number; // xsd:unsignedInt
  format: number; // xsd:unsignedInt
  series?: boolean;
}

export interface CT_PivotHierarchies {
  pivotHierarchy: CT_PivotHierarchy[];
  count?: number; // xsd:unsignedInt
}

export interface CT_PivotHierarchy {
  mps?: CT_MemberProperties;
  members?: CT_Members[];
  extLst?: CT_ExtensionList;
  outline?: boolean;
  multipleItemSelectionAllowed?: boolean;
  subtotalTop?: boolean;
  showInFieldList?: boolean;
  dragToRow?: boolean;
  dragToCol?: boolean;
  dragToPage?: boolean;
  dragToData?: boolean;
  dragOff?: boolean;
  includeNewItemsInFilter?: boolean;
  caption?: ST_Xstring;
}

export interface CT_RowHierarchiesUsage {
  rowHierarchyUsage: CT_HierarchyUsage[];
  count?: number; // xsd:unsignedInt
}

export interface CT_ColHierarchiesUsage {
  colHierarchyUsage: CT_HierarchyUsage[];
  count?: number; // xsd:unsignedInt
}

export interface CT_HierarchyUsage {
  hierarchyUsage: number; // xsd:int
}

export interface CT_MemberProperties {
  mp: CT_MemberProperty[];
  count?: number; // xsd:unsignedInt
}

export interface CT_MemberProperty {
  name?: ST_Xstring;
  showCell?: boolean;
  showTip?: boolean;
  showAsCaption?: boolean;
  nameLen?: number; // xsd:unsignedInt
  pPos?: number; // xsd:unsignedInt
  pLen?: number; // xsd:unsignedInt
  level?: number; // xsd:unsignedInt
  field: number; // xsd:unsignedInt
}

export interface CT_Members {
  member: CT_Member[];
  count?: number; // xsd:unsignedInt
  level?: number; // xsd:unsignedInt
}

export interface CT_Member {
  name: ST_Xstring;
}

export interface CT_Dimensions {
  dimension?: CT_PivotDimension[];
  count?: number; // xsd:unsignedInt
}

export interface CT_PivotDimension {
  measure?: boolean;
  name: ST_Xstring;
  uniqueName: ST_Xstring;
  caption: ST_Xstring;
}

export interface CT_MeasureGroups {
  measureGroup?: CT_MeasureGroup[];
  count?: number; // xsd:unsignedInt
}

export interface CT_MeasureDimensionMaps {
  map?: CT_MeasureDimensionMap[];
  count?: number; // xsd:unsignedInt
}

export interface CT_MeasureGroup {
  name: ST_Xstring;
  caption: ST_Xstring;
}

export interface CT_MeasureDimensionMap {
  measureGroup?: number; // xsd:unsignedInt
  dimension?: number; // xsd:unsignedInt
}

export interface CT_PivotTableStyle {
  name?: string;
  showRowHeaders?: boolean;
  showColHeaders?: boolean;
  showRowStripes?: boolean;
  showColStripes?: boolean;
  showLastColumn?: boolean;
}

export interface CT_PivotFilters {
  filter?: CT_PivotFilter[];
  count?: number; // xsd:unsignedInt
}

export enum ST_PivotFilterType {
  Unknown = "unknown",
  Count = "count",
  Percent = "percent",
  Sum = "sum",
  CaptionEqual = "captionEqual",
  CaptionNotEqual = "captionNotEqual",
  CaptionBeginsWith = "captionBeginsWith",
  CaptionNotBeginsWith = "captionNotBeginsWith",
  CaptionEndsWith = "captionEndsWith",
  CaptionNotEndsWith = "captionNotEndsWith",
  CaptionContains = "captionContains",
  CaptionNotContains = "captionNotContains",
  CaptionGreaterThan = "captionGreaterThan",
  CaptionGreaterThanOrEqual = "captionGreaterThanOrEqual",
  CaptionLessThan = "captionLessThan",
  CaptionLessThanOrEqual = "captionLessThanOrEqual",
  CaptionBetween = "captionBetween",
  CaptionNotBetween = "captionNotBetween",
  ValueEqual = "valueEqual",
  ValueNotEqual = "valueNotEqual",
  ValueGreaterThan = "valueGreaterThan",
  ValueGreaterThanOrEqual = "valueGreaterThanOrEqual",
  ValueLessThan = "valueLessThan",
  ValueLessThanOrEqual = "valueLessThanOrEqual",
  ValueBetween = "valueBetween",
  ValueNotBetween = "valueNotBetween",
  DateEqual = "dateEqual",
  DateNotEqual = "dateNotEqual",
  DateOlderThan = "dateOlderThan",
  DateOlderThanOrEqual = "dateOlderThanOrEqual",
  DateNewerThan = "dateNewerThan",
  DateNewerThanOrEqual = "dateNewerThanOrEqual",
  DateBetween = "dateBetween",
  DateNotBetween = "dateNotBetween",
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

export interface CT_PivotFilter {
  autoFilter: CT_AutoFilter;
  extLst?: CT_ExtensionList;
  fld: number; // xsd:unsignedInt
  mpFld?: number; // xsd:unsignedInt
  type: ST_PivotFilterType;
  evalOrder?: number; // xsd:int
  id: number; // xsd:unsignedInt
  iMeasureHier?: number; // xsd:unsignedInt
  iMeasureFld?: number; // xsd:unsignedInt
  name?: ST_Xstring;
  description?: ST_Xstring;
  stringValue1?: ST_Xstring;
  stringValue2?: ST_Xstring;
}

export interface CT_QueryTable {
  queryTableRefresh?: CT_QueryTableRefresh;
  extLst?: CT_ExtensionList;
  name: ST_Xstring;
  headers?: boolean;
  rowNumbers?: boolean;
  disableRefresh?: boolean;
  backgroundRefresh?: boolean;
  firstBackgroundRefresh?: boolean;
  refreshOnLoad?: boolean;
  growShrinkType?: ST_GrowShrinkType;
  fillFormulas?: boolean;
  removeDataOnSave?: boolean;
  disableEdit?: boolean;
  preserveFormatting?: boolean;
  adjustColumnWidth?: boolean;
  intermediate?: boolean;
  connectionId: number; // xsd:unsignedInt
  autoFormat?: boolean; // AG_AutoFormat
}

export interface CT_QueryTableRefresh {
  queryTableFields: CT_QueryTableFields;
  queryTableDeletedFields?: CT_QueryTableDeletedFields;
  sortState?: CT_SortState;
  extLst?: CT_ExtensionList;
  preserveSortFilterLayout?: boolean;
  fieldIdWrapped?: boolean;
  headersInLastRefresh?: boolean;
  minimumVersion?: number; // xsd:unsignedByte
  nextId?: number; // xsd:unsignedInt
  unboundColumnsLeft?: number; // xsd:unsignedInt
  unboundColumnsRight?: number; // xsd:unsignedInt
}

export interface CT_QueryTableDeletedFields {
  deletedField: CT_DeletedField[];
  count?: number; // xsd:unsignedInt
}

export interface CT_DeletedField {
  name: ST_Xstring;
}

export interface CT_QueryTableFields {
  queryTableField?: CT_QueryTableField[];
  count?: number; // xsd:unsignedInt
}

export interface CT_QueryTableField {
  extLst?: CT_ExtensionList;
  id: number; // xsd:unsignedInt
  name?: ST_Xstring;
  dataBound?: boolean;
  rowNumbers?: boolean;
  fillFormulas?: boolean;
  clipped?: boolean;
  tableColumnId?: number; // xsd:unsignedInt
}

export enum ST_GrowShrinkType {
  InsertDelete = "insertDelete",
  InsertClear = "insertClear",
  OverwriteClear = "overwriteClear",
}

export interface CT_Sst {
  si?: CT_Rst[];
  extLst?: CT_ExtensionList;
  count?: number; // xsd:unsignedInt
  uniqueCount?: number; // xsd:unsignedInt
}

export enum ST_PhoneticType {
  HalfwidthKatakana = "halfwidthKatakana",
  FullwidthKatakana = "fullwidthKatakana",
  Hiragana = "Hiragana",
  NoConversion = "noConversion",
}

export enum ST_PhoneticAlignment {
  NoControl = "noControl",
  Left = "left",
  Center = "center",
  Distributed = "distributed",
}

export interface CT_PhoneticRun {
  t: ST_Xstring;
  sb: number; // xsd:unsignedInt
  eb: number; // xsd:unsignedInt
}

export interface CT_RElt {
  rPr?: CT_RPrElt;
  t: ST_Xstring;
}

export interface CT_RPrElt {
  rFont?: CT_FontName;
  charset?: CT_IntProperty;
  family?: CT_IntProperty;
  b?: CT_BooleanProperty;
  i?: CT_BooleanProperty;
  strike?: CT_BooleanProperty;
  outline?: CT_BooleanProperty;
  shadow?: CT_BooleanProperty;
  condense?: CT_BooleanProperty;
  extend?: CT_BooleanProperty;
  color?: CT_Color;
  sz?: CT_FontSize;
  u?: CT_UnderlineProperty;
  vertAlign?: CT_VerticalAlignFontProperty;
  scheme?: CT_FontScheme;
}

export interface CT_Rst {
  t?: ST_Xstring;
  r?: CT_RElt[];
  rPh?: CT_PhoneticRun[];
  phoneticPr?: CT_PhoneticPr;
}

export interface CT_PhoneticPr {
  fontId: number; // ST_FontId - placeholder
  type?: ST_PhoneticType;
  alignment?: ST_PhoneticAlignment;
}

export interface CT_RevisionHeaders {
  header: CT_RevisionHeader[];
  guid: ST_Guid;
  lastGuid?: ST_Guid;
  shared?: boolean;
  diskRevisions?: boolean;
  history?: boolean;
  trackRevisions?: boolean;
  exclusive?: boolean;
  revisionId?: number; // xsd:unsignedInt
  version?: number; // xsd:int
  keepChangeHistory?: boolean;
  protected?: boolean;
  preserveHistory?: number; // xsd:unsignedInt
}

export interface CT_Revisions {
  revisions: (
    | { rrc: CT_RevisionRowColumn[] }
    | { rm: CT_RevisionMove[] }
    | { rcv: CT_RevisionCustomView[] }
    | { rsnm: CT_RevisionSheetRename[] }
    | { ris: CT_RevisionInsertSheet[] }
    | { rcc: CT_RevisionCellChange[] }
    | { rfmt: CT_RevisionFormatting[] }
    | { raf: CT_RevisionAutoFormatting[] }
    | { rdn: CT_RevisionDefinedName[] }
    | { rcmt: CT_RevisionComment[] }
    | { rqt: CT_RevisionQueryTableField[] }
    | { rcft: CT_RevisionConflict[] }
  )[];
}

export interface AG_RevData {
  rId: number; // xsd:unsignedInt
  ua?: boolean;
  ra?: boolean;
}

export interface CT_RevisionHeader {
  sheetIdMap: CT_SheetIdMap;
  reviewedList?: CT_ReviewedRevisions;
  extLst?: CT_ExtensionList;
  guid: ST_Guid;
  dateTime: string; // xsd:dateTime
  maxSheetId: number; // xsd:unsignedInt
  userName: ST_Xstring;
  id: string; // r:id
  minRId?: number; // xsd:unsignedInt
  maxRId?: number; // xsd:unsignedInt
}

export interface CT_SheetIdMap {
  sheetId: CT_SheetId[];
  count?: number; // xsd:unsignedInt
}

export interface CT_SheetId {
  val: number; // xsd:unsignedInt
}

export interface CT_ReviewedRevisions {
  reviewed: CT_Reviewed[];
  count?: number; // xsd:unsignedInt
}

export interface CT_Reviewed {
  rId: number; // xsd:unsignedInt
}

export interface CT_UndoInfo {
  index: number; // xsd:unsignedInt
  exp: ST_FormulaExpression; // Placeholder
  ref3D?: boolean;
  array?: boolean;
  v?: boolean;
  nf?: boolean;
  cs?: boolean;
  dr: ST_RefA;
  dn?: ST_Xstring;
  r?: ST_CellRef;
  sId?: number; // xsd:unsignedInt
}

export interface CT_RevisionRowColumn extends AG_RevData {
  undo?: CT_UndoInfo[];
  rcc?: CT_RevisionCellChange[];
  rfmt?: CT_RevisionFormatting[];
  sId: number; // xsd:unsignedInt
  eol?: boolean;
  ref: ST_Ref;
  action: ST_rwColActionType; // Placeholder
  edge?: boolean;
}

export interface CT_RevisionMove extends AG_RevData {
  undo?: CT_UndoInfo[];
  rcc?: CT_RevisionCellChange[];
  rfmt?: CT_RevisionFormatting[];
  sheetId: number; // xsd:unsignedInt
  source: ST_Ref;
  destination: ST_Ref;
  sourceSheetId?: number; // xsd:unsignedInt
}

export enum ST_RevisionAction {
  // Placeholder, actual values are in XSD
}

export interface CT_RevisionCustomView {
  guid: ST_Guid;
  action: ST_RevisionAction;
}

export interface CT_RevisionSheetRename extends AG_RevData {
  extLst?: CT_ExtensionList;
  sheetId: number; // xsd:unsignedInt
  oldName: ST_Xstring;
  newName: ST_Xstring;
}

export interface CT_RevisionInsertSheet extends AG_RevData {
  sheetId: number; // xsd:unsignedInt
  name: ST_Xstring;
  sheetPosition: number; // xsd:unsignedInt
}

export interface CT_RevisionCellChange extends AG_RevData {
  oc?: CT_Cell; // Placeholder
  nc: CT_Cell; // Placeholder
  odxf?: CT_Dxf; // Placeholder
  ndxf?: CT_Dxf; // Placeholder
  extLst?: CT_ExtensionList;
  sId: number; // xsd:unsignedInt
  odxfAttr?: boolean; // Renamed to avoid conflict with element
  xfDxf?: boolean;
  s?: boolean;
  dxf?: boolean;
  numFmtId?: ST_NumFmtId;
  quotePrefix?: boolean;
  oldQuotePrefix?: boolean;
  ph?: boolean;
  oldPh?: boolean;
  endOfListFormulaUpdate?: boolean;
}

export interface CT_RevisionFormatting {
  dxf?: CT_Dxf; // Placeholder
  extLst?: CT_ExtensionList;
}
