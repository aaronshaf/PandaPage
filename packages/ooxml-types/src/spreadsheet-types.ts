/**
 * SpreadsheetML Types - Compatibility Re-export
 * This file maintains backward compatibility.
 * New code should import from specific modules in the sml/ directory.
 */

// Re-export all types from organized modules
export * from "./sml/index";

// Import types needed for remaining complex types
import type { ST_Xstring } from "./shared-types";
import type { CT_ExtensionList } from "./chart-types";
import type { ST_CellRef } from "./sml/cell-types";
import type { ST_DxfId } from "./sml/filter-types";

// ========================================
// Workbook Types
// ========================================

/**
 * Visibility.
 * @see ECMA-376 Part 1, §18.18.88 ST_Visibility
 */
export enum ST_Visibility {
  Visible = "visible",
  Hidden = "hidden",
  VeryHidden = "veryHidden",
}

/**
 * Sheet state.
 * @see ECMA-376 Part 1, §18.18.68 ST_SheetState
 */
export enum ST_SheetState {
  Visible = "visible",
  Hidden = "hidden",
  VeryHidden = "veryHidden",
}

/**
 * Calc mode.
 * @see ECMA-376 Part 1, §18.18.5 ST_CalcMode
 */
export enum ST_CalcMode {
  Manual = "manual",
  Auto = "auto",
  AutoNoTable = "autoNoTable",
}

/**
 * Ref mode.
 * @see ECMA-376 Part 1, §18.18.62 ST_RefMode
 */
export enum ST_RefMode {
  A1 = "A1",
  R1C1 = "R1C1",
}

/**
 * Comments.
 * @see ECMA-376 Part 1, §18.18.15 ST_Comments
 */
export enum ST_Comments {
  CommNone = "commNone",
  CommIndicator = "commIndicator",
  CommIndAndComment = "commIndAndComment",
}

/**
 * Update links.
 * @see ECMA-376 Part 1, §18.18.85 ST_UpdateLinks
 */
export enum ST_UpdateLinks {
  UserSet = "userSet",
  Never = "never",
  Always = "always",
}

/**
 * Sheet.
 * @see ECMA-376 Part 1, §18.2.19 CT_Sheet
 */
export interface CT_Sheet {
  name: ST_Xstring;
  sheetId: number; // xsd:unsignedInt
  state?: ST_SheetState;
  id: string; // r:id (ST_RelationshipId)
}

/**
 * Sheets.
 * @see ECMA-376 Part 1, §18.2.20 CT_Sheets
 */
export interface CT_Sheets {
  sheet?: CT_Sheet[];
}

/**
 * Workbook protection.
 * @see ECMA-376 Part 1, §18.2.29 CT_WorkbookProtection
 */
export interface CT_WorkbookProtection {
  workbookAlgorithmName?: ST_Xstring;
  workbookHashValue?: string; // xsd:base64Binary
  workbookSaltValue?: string; // xsd:base64Binary
  workbookSpinCount?: number; // xsd:unsignedInt
  lockStructure?: boolean;
  lockWindows?: boolean;
  lockRevision?: boolean;
  revisionsAlgorithmName?: ST_Xstring;
  revisionsHashValue?: string; // xsd:base64Binary
  revisionsSaltValue?: string; // xsd:base64Binary
  revisionsSpinCount?: number; // xsd:unsignedInt
  workbookPassword?: ST_UnsignedShortHex;
  revisionsPassword?: ST_UnsignedShortHex;
}

/**
 * Workbook views.
 * @see ECMA-376 Part 1, §18.2.1 CT_BookViews
 */
export interface CT_BookViews {
  workbookView?: CT_BookView[];
}

/**
 * Workbook view.
 * @see ECMA-376 Part 1, §18.2.30 CT_BookView
 */
export interface CT_BookView {
  extLst?: CT_ExtensionList;
  visibility?: ST_Visibility;
  minimized?: boolean;
  showHorizontalScroll?: boolean;
  showVerticalScroll?: boolean;
  showSheetTabs?: boolean;
  xWindow?: number; // xsd:int
  yWindow?: number; // xsd:int
  windowWidth?: number; // xsd:unsignedInt
  windowHeight?: number; // xsd:unsignedInt
  tabRatio?: number; // xsd:unsignedInt
  firstSheet?: number; // xsd:unsignedInt
  activeTab?: number; // xsd:unsignedInt
  autoFilterDateGrouping?: boolean;
}

/**
 * Calc properties.
 * @see ECMA-376 Part 1, §18.2.2 CT_CalcPr
 */
export interface CT_CalcPr {
  calcId?: number; // xsd:unsignedInt
  calcMode?: ST_CalcMode;
  fullCalcOnLoad?: boolean;
  refMode?: ST_RefMode;
  iterate?: boolean;
  iterateCount?: number; // xsd:unsignedInt
  iterateDelta?: number; // xsd:double
  fullPrecision?: boolean;
  calcCompleted?: boolean;
  calcOnSave?: boolean;
  concurrentCalc?: boolean;
  concurrentManualCount?: number; // xsd:unsignedInt
  forceFullCalc?: boolean;
}

/**
 * Workbook properties.
 * @see ECMA-376 Part 1, §18.2.28 CT_WorkbookPr
 */
export interface CT_WorkbookPr {
  date1904?: boolean;
  showObjects?: ST_Objects;
  showBorderUnselectedTables?: boolean;
  filterPrivacy?: boolean;
  promptedSolutions?: boolean;
  showInkAnnotation?: boolean;
  backupFile?: boolean;
  saveExternalLinkValues?: boolean;
  updateLinks?: ST_UpdateLinks;
  codeName?: ST_Xstring;
  hidePivotFieldList?: boolean;
  showPivotChartFilter?: boolean;
  allowRefreshQuery?: boolean;
  publishItems?: boolean;
  checkCompatibility?: boolean;
  autoCompressPictures?: boolean;
  refreshAllConnections?: boolean;
  defaultThemeVersion?: number; // xsd:unsignedInt
}

/**
 * External reference.
 * @see ECMA-376 Part 1, §18.2.6 CT_ExternalReference
 */
export interface CT_ExternalReference {
  id: string; // r:id (ST_RelationshipId)
}

/**
 * External references.
 * @see ECMA-376 Part 1, §18.2.7 CT_ExternalReferences
 */
export interface CT_ExternalReferences {
  externalReference?: CT_ExternalReference[];
}

/**
 * Defined name.
 * @see ECMA-376 Part 1, §18.2.5 CT_DefinedName
 */
export interface CT_DefinedName {
  _formula?: ST_Xstring; // content
  name: ST_Xstring;
  comment?: ST_Xstring;
  customMenu?: ST_Xstring;
  description?: ST_Xstring;
  help?: ST_Xstring;
  statusBar?: ST_Xstring;
  localSheetId?: number; // xsd:unsignedInt
  hidden?: boolean;
  function?: boolean;
  vbProcedure?: boolean;
  xlm?: boolean;
  functionGroupId?: number; // xsd:unsignedInt
  shortcutKey?: string; // xsd:unsignedByte
  publishToServer?: boolean;
  workbookParameter?: boolean;
}

/**
 * Defined names.
 * @see ECMA-376 Part 1, §18.2.4 CT_DefinedNames
 */
export interface CT_DefinedNames {
  definedName?: CT_DefinedName[];
}

/**
 * Workbook.
 * @see ECMA-376 Part 1, §18.2.27 CT_Workbook
 */
export interface CT_Workbook {
  fileVersion?: any; // CT_FileVersion
  fileSharing?: any; // CT_FileSharing
  workbookPr?: CT_WorkbookPr;
  workbookProtection?: CT_WorkbookProtection;
  bookViews?: CT_BookViews;
  sheets: CT_Sheets;
  functionGroups?: any; // CT_FunctionGroups
  externalReferences?: CT_ExternalReferences;
  definedNames?: CT_DefinedNames;
  calcPr?: CT_CalcPr;
  oleSize?: any; // CT_OleSize
  customWorkbookViews?: any; // CT_CustomWorkbookViews
  pivotCaches?: any; // CT_PivotCaches
  smartTagPr?: any; // CT_SmartTagPr
  smartTagTypes?: any; // CT_SmartTagTypes
  webPublishing?: any; // CT_WebPublishing
  fileRecoveryPr?: any; // CT_FileRecoveryPr[]
  webPublishObjects?: any; // CT_WebPublishObjects
  extLst?: CT_ExtensionList;
  conformance?: ST_ConformanceClass;
}

// ========================================
// Worksheet Types
// ========================================

/**
 * Pane.
 * @see ECMA-376 Part 1, §18.3.1.60 CT_Pane
 */
export interface CT_Pane {
  xSplit?: number; // xsd:double
  ySplit?: number; // xsd:double
  topLeftCell?: ST_CellRef;
  activePane?: ST_Pane;
  state?: ST_PaneState;
}

/**
 * Selection.
 * @see ECMA-376 Part 1, §18.3.1.66 CT_Selection
 */
export interface CT_Selection {
  pane?: ST_Pane;
  activeCell?: ST_CellRef;
  activeCellId?: number; // xsd:unsignedInt
  sqref?: any; // ST_Sqref
}

/**
 * Sheet view.
 * @see ECMA-376 Part 1, §18.3.1.87 CT_SheetView
 */
export interface CT_SheetView {
  pane?: CT_Pane;
  selection?: CT_Selection[];
  pivotSelection?: any[]; // CT_PivotSelection[]
  extLst?: CT_ExtensionList;
  windowProtection?: boolean;
  showFormulas?: boolean;
  showGridLines?: boolean;
  showRowColHeaders?: boolean;
  showZeros?: boolean;
  rightToLeft?: boolean;
  tabSelected?: boolean;
  showRuler?: boolean;
  showOutlineSymbols?: boolean;
  defaultGridColor?: boolean;
  showWhiteSpace?: boolean;
  view?: ST_SheetViewType;
  topLeftCell?: ST_CellRef;
  colorId?: number; // xsd:unsignedInt
  zoomScale?: number; // xsd:unsignedInt
  zoomScaleNormal?: number; // xsd:unsignedInt
  zoomScaleSheetLayoutView?: number; // xsd:unsignedInt
  zoomScalePageLayoutView?: number; // xsd:unsignedInt
  workbookViewId: number; // xsd:unsignedInt
}

/**
 * Sheet views.
 * @see ECMA-376 Part 1, §18.3.1.88 CT_SheetViews
 */
export interface CT_SheetViews {
  sheetView?: CT_SheetView[];
  extLst?: CT_ExtensionList;
}

/**
 * Row.
 * @see ECMA-376 Part 1, §18.3.1.73 CT_Row
 */
export interface CT_Row {
  c?: CT_Cell[];
  extLst?: CT_ExtensionList;
  r?: number; // xsd:unsignedInt
  spans?: string; // list of xsd:unsignedInt
  s?: number; // xsd:unsignedInt - style index
  customFormat?: boolean;
  ht?: number; // xsd:double
  hidden?: boolean;
  customHeight?: boolean;
  outlineLevel?: number; // xsd:unsignedByte
  collapsed?: boolean;
  thickTop?: boolean;
  thickBot?: boolean;
  ph?: boolean;
}

/**
 * Column.
 * @see ECMA-376 Part 1, §18.3.1.13 CT_Col
 */
export interface CT_Col {
  min: number; // xsd:unsignedInt
  max: number; // xsd:unsignedInt
  width?: number; // xsd:double
  style?: number; // xsd:unsignedInt
  hidden?: boolean;
  bestFit?: boolean;
  customWidth?: boolean;
  phonetic?: boolean;
  outlineLevel?: number; // xsd:unsignedByte
  collapsed?: boolean;
}

/**
 * Columns.
 * @see ECMA-376 Part 1, §18.3.1.17 CT_Cols
 */
export interface CT_Cols {
  col?: CT_Col[];
}

/**
 * Conditional formatting.
 * @see ECMA-376 Part 1, §18.3.1.18 CT_ConditionalFormatting
 */
export interface CT_ConditionalFormatting {
  cfRule?: CT_CfRule[];
  pivot?: boolean;
  sqref?: any; // ST_Sqref
  extLst?: CT_ExtensionList;
}

/**
 * Conditional formatting rule.
 * @see ECMA-376 Part 1, §18.3.1.10 CT_CfRule
 */
export interface CT_CfRule {
  formula?: ST_Formula[];
  colorScale?: any; // CT_ColorScale
  dataBar?: any; // CT_DataBar
  iconSet?: any; // CT_IconSet
  extLst?: CT_ExtensionList;
  type?: ST_CfType;
  dxfId?: ST_DxfId;
  priority: number; // xsd:int
  stopIfTrue?: boolean;
  aboveAverage?: boolean;
  percent?: boolean;
  bottom?: boolean;
  operator?: ST_ConditionalFormattingOperator;
  text?: ST_Xstring;
  timePeriod?: ST_TimePeriod;
  rank?: number; // xsd:unsignedInt
  stdDev?: number; // xsd:int
  equalAverage?: boolean;
}

// ========================================
// Other Simple Types
// ========================================

export type ST_UnsignedShortHex = string; // xsd:hexBinary with length 2
export type ST_Formula = ST_Xstring;
export type ST_Objects = string; // "all" | "placeholders" | "none"
export type ST_ConformanceClass = string; // "strict" | "transitional"
export type ST_Pane = string; // "bottomRight" | "topRight" | "bottomLeft" | "topLeft"
export type ST_PaneState = string; // "split" | "frozen" | "frozenSplit"
export type ST_SheetViewType = string; // "normal" | "pageBreakPreview" | "pageLayout"
export type ST_CfType = string; // Various conditional formatting types
export type ST_ConditionalFormattingOperator = string; // Comparison operators
export type ST_TimePeriod = string; // Time period for conditional formatting

// Placeholder interfaces for complex types
export type CT_Cell = Record<string, never>; // Defined in cell-types
export type CT_CellFormula = Record<string, never>; // Defined in cell-types
