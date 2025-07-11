/**
 * WordprocessingML Types - Compatibility Re-export
 * This file maintains backward compatibility.
 * New code should import from specific modules in the wml/ directory.
 */

// Re-export all types from organized modules
export * from "./wml/index";

// Import types needed for remaining complex types
import type {
  ST_OnOff,
  ST_String,
  ST_DecimalNumber,
  ST_RelationshipId,
  ST_CalendarType,
} from "./shared-types";
import type { CT_Inline, CT_Anchor } from "./wordprocessing-drawing-types";
import type {
  CT_DecimalNumber,
  CT_String as CT_StringWml,
  CT_OnOff,
  CT_Lang,
} from "./wml/basic-types";

// ========================================
// Object and Drawing Types
// ========================================

/**
 * Object draw aspect.
 * @see ECMA-376 Part 1, §17.18.56 ST_ObjectDrawAspect
 */
export enum ST_ObjectDrawAspect {
  Content = "content",
  Icon = "icon",
}

/**
 * Object update mode.
 * @see ECMA-376 Part 1, §17.18.57 ST_ObjectUpdateMode
 */
export enum ST_ObjectUpdateMode {
  Always = "always",
  OnCall = "onCall",
}

/**
 * Object embed.
 * @see ECMA-376 Part 1, §17.3.3.18 CT_ObjectEmbed
 */
export interface CT_ObjectEmbed {
  drawAspect?: ST_ObjectDrawAspect;
  id: ST_RelationshipId; // r:id
  progId?: ST_String;
  shapeId?: ST_String;
  fieldCodes?: ST_String;
}

/**
 * Object link.
 * @see ECMA-376 Part 1, §17.3.3.19 CT_ObjectLink
 */
export interface CT_ObjectLink extends CT_ObjectEmbed {
  updateMode: ST_ObjectUpdateMode;
  lockedField?: ST_OnOff;
}

/**
 * Control.
 * @see ECMA-376 Part 1, §17.3.3.7 CT_Control
 */
export interface CT_Control {
  name?: ST_String;
  shapeid?: ST_String;
  id: ST_RelationshipId; // r:id
}

/**
 * Object.
 * @see ECMA-376 Part 1, §17.3.3.17 CT_Object
 */
export interface CT_Object {
  drawing?: any; // CT_Drawing
  control?: CT_Control;
  objectLink?: CT_ObjectLink;
  objectEmbed?: CT_ObjectEmbed;
  movie?: any; // CT_Rel
  dxaOrig?: any; // ST_TwipsMeasure
  dyaOrig?: any; // ST_TwipsMeasure
}

/**
 * Drawing.
 * @see ECMA-376 Part 1, §17.3.3.9 CT_Drawing
 */
export interface CT_Drawing {
  anchor?: CT_Anchor;
  inline?: CT_Inline;
}

// ========================================
// Structured Document Tag Types
// ========================================

/**
 * Lock type.
 * @see ECMA-376 Part 1, §17.18.49 ST_Lock
 */
export enum ST_Lock {
  SdtLocked = "sdtLocked",
  ContentLocked = "contentLocked",
  Unlocked = "unlocked",
  SdtContentLocked = "sdtContentLocked",
}

/**
 * Lock.
 * @see ECMA-376 Part 1, §17.5.2.21 CT_Lock
 */
export interface CT_Lock {
  val?: ST_Lock;
}

/**
 * SDT list item.
 * @see ECMA-376 Part 1, §17.5.2.20 CT_SdtListItem
 */
export interface CT_SdtListItem {
  displayText?: ST_String;
  value?: ST_String;
}

/**
 * SDT date mapping type.
 * @see ECMA-376 Part 1, §17.18.76 ST_SdtDateMappingType
 */
export enum ST_SdtDateMappingType {
  Text = "text",
  Date = "date",
  DateTime = "dateTime",
}

/**
 * SDT date mapping type.
 * @see ECMA-376 Part 1, §17.5.2.7 CT_SdtDateMappingType
 */
export interface CT_SdtDateMappingType {
  val?: ST_SdtDateMappingType;
}

/**
 * Calendar type.
 * @see ECMA-376 Part 1, §17.5.1.2 CT_CalendarType
 */
export interface CT_CalendarType {
  val?: ST_CalendarType;
}

/**
 * SDT date.
 * @see ECMA-376 Part 1, §17.5.2.6 CT_SdtDate
 */
export interface CT_SdtDate {
  dateFormat?: CT_StringWml;
  lid?: CT_Lang;
  storeMappedDataAs?: CT_SdtDateMappingType;
  calendar?: CT_CalendarType;
  fullDate?: any; // ST_DateTime
}

/**
 * SDT combo box.
 * @see ECMA-376 Part 1, §17.5.2.5 CT_SdtComboBox
 */
export interface CT_SdtComboBox {
  listItem?: CT_SdtListItem[];
  lastValue?: ST_String;
}

/**
 * SDT document part.
 * @see ECMA-376 Part 1, §17.5.2.12 CT_SdtDocPart
 */
export interface CT_SdtDocPart {
  docPartGallery?: CT_StringWml;
  docPartCategory?: CT_StringWml;
  docPartUnique?: CT_OnOff;
}

/**
 * SDT dropdown list.
 * @see ECMA-376 Part 1, §17.5.2.15 CT_SdtDropDownList
 */
export interface CT_SdtDropDownList {
  listItem?: CT_SdtListItem[];
  lastValue?: ST_String;
}

/**
 * Placeholder.
 * @see ECMA-376 Part 1, §17.5.2.26 CT_Placeholder
 */
export interface CT_Placeholder {
  docPart: CT_StringWml;
}

/**
 * SDT text.
 * @see ECMA-376 Part 1, §17.5.2.38 CT_SdtText
 */
export interface CT_SdtText {
  multiLine?: ST_OnOff;
}

/**
 * Data binding.
 * @see ECMA-376 Part 1, §17.5.2.4 CT_DataBinding
 */
export interface CT_DataBinding {
  prefixMappings?: ST_String;
  xpath: ST_String;
  storeItemID: ST_String;
}

/**
 * SDT properties.
 * @see ECMA-376 Part 1, §17.5.2.34 CT_SdtPr
 */
export interface CT_SdtPr {
  rPr?: any; // CT_RPr
  alias?: CT_StringWml;
  tag?: CT_StringWml;
  id?: CT_DecimalNumber;
  lock?: CT_Lock;
  placeholder?: CT_Placeholder;
  temporary?: CT_OnOff;
  showingPlcHdr?: CT_OnOff;
  dataBinding?: CT_DataBinding;
  label?: CT_DecimalNumber;
  tabIndex?: any; // CT_UnsignedDecimalNumber
  sdtType?:
    | { equation: any } // CT_Empty
    | { comboBox: CT_SdtComboBox }
    | { date: CT_SdtDate }
    | { docPartObj: CT_SdtDocPart }
    | { docPartList: CT_SdtDocPart }
    | { dropDownList: CT_SdtDropDownList }
    | { picture: any } // CT_Empty
    | { richText: any } // CT_Empty
    | { text: CT_SdtText }
    | { citation: any } // CT_Empty
    | { group: any } // CT_Empty
    | { bibliography: any }; // CT_Empty
}

// ========================================
// Ruby Types
// ========================================

/**
 * Ruby alignment.
 * @see ECMA-376 Part 1, §17.18.75 ST_RubyAlign
 */
export enum ST_RubyAlign {
  Center = "center",
  DistributeLetter = "distributeLetter",
  DistributeSpace = "distributeSpace",
  Left = "left",
  Right = "right",
  RightVertical = "rightVertical",
}

/**
 * Ruby alignment.
 * @see ECMA-376 Part 1, §17.3.3.25 CT_RubyAlign
 */
export interface CT_RubyAlign {
  val: ST_RubyAlign;
}

/**
 * Ruby properties.
 * @see ECMA-376 Part 1, §17.3.3.28 CT_RubyPr
 */
export interface CT_RubyPr {
  rubyAlign: CT_RubyAlign;
  hps: any; // CT_HpsMeasure
  hpsRaise: any; // CT_HpsMeasure
  hpsBaseText: any; // CT_HpsMeasure
  lid: CT_Lang;
  dirty?: CT_OnOff;
}

/**
 * Ruby content type.
 * @see ECMA-376 Part 1, §17.3.3.27 EG_RubyContent
 */
export type EG_RubyContent =
  | { r: any } // CT_R
  | any[]; // EG_RunLevelElts[]

/**
 * Ruby content.
 * @see ECMA-376 Part 1, §17.3.3.26 CT_RubyContent
 */
export interface CT_RubyContent {
  rubyContent?: EG_RubyContent[];
}

/**
 * Ruby.
 * @see ECMA-376 Part 1, §17.3.3.24 CT_Ruby
 */
export interface CT_Ruby {
  rubyPr: CT_RubyPr;
  rt: CT_RubyContent;
  rubyBase: CT_RubyContent;
}

// ========================================
// Footnote/Endnote Types
// ========================================

/**
 * Footnote/endnote type.
 * @see ECMA-376 Part 1, §17.18.33 ST_FtnEdn
 */
export enum ST_FtnEdn {
  Normal = "normal",
  Separator = "separator",
  ContinuationSeparator = "continuationSeparator",
  ContinuationNotice = "continuationNotice",
}

/**
 * Footnote/endnote reference.
 * @see ECMA-376 Part 1, §17.16.21 CT_FtnEdnRef
 */
export interface CT_FtnEdnRef {
  customMarkFollows?: ST_OnOff;
  id: ST_DecimalNumber;
}

/**
 * Relationship reference.
 * @see ECMA-376 Part 1, §22.8.2.1 CT_Rel
 */
export interface CT_Rel {
  id: ST_RelationshipId;
}

/**
 * Header/footer reference.
 * @see ECMA-376 Part 1, §17.10.4 CT_HdrFtrRef
 */
export interface CT_HdrFtrRef extends CT_Rel {
  type: any; // ST_HdrFtr
}

/**
 * Header/footer.
 * @see ECMA-376 Part 1, §17.10.5 CT_HdrFtr
 */
export type CT_HdrFtr = Record<string, never>;

// ========================================
// Position Tab Types
// ========================================

/**
 * Position tab alignment.
 * @see ECMA-376 Part 1, §17.18.71 ST_PTabAlignment
 */
export enum ST_PTabAlignment {
  Left = "left",
  Center = "center",
  Right = "right",
}

/**
 * Position tab relative to.
 * @see ECMA-376 Part 1, §17.18.73 ST_PTabRelativeTo
 */
export enum ST_PTabRelativeTo {
  Margin = "margin",
  Indent = "indent",
}

/**
 * Position tab leader.
 * @see ECMA-376 Part 1, §17.18.72 ST_PTabLeader
 */
export enum ST_PTabLeader {
  None = "none",
  Dot = "dot",
  Hyphen = "hyphen",
  Underscore = "underscore",
  Heavy = "heavy",
  MiddleDot = "middleDot",
}

/**
 * Position tab.
 * @see ECMA-376 Part 1, §17.3.1.31 CT_PTab
 */
export interface CT_PTab {
  alignment: ST_PTabAlignment;
  relativeTo: ST_PTabRelativeTo;
  leader: ST_PTabLeader;
}

// ========================================
// Alternative Format Import Types
// ========================================

/**
 * Alternative format import properties.
 * @see ECMA-376 Part 1, §17.17.2.2 CT_AltChunkPr
 */
export interface CT_AltChunkPr {
  matchSrc?: CT_OnOff;
}

/**
 * Alternative format import.
 * @see ECMA-376 Part 1, §17.17.2.1 CT_AltChunk
 */
export interface CT_AltChunk {
  altChunkPr?: CT_AltChunkPr;
  id?: ST_RelationshipId; // r:id
}

// ========================================
// Complex type groups (placeholder)
// These are used in multiple places but have complex definitions
// ========================================

export type EG_PContentMath = any; // Placeholder for math content
export type EG_PContentBase = any; // Placeholder for paragraph content
export type EG_ContentRunContentBase = any; // Placeholder for run content
export type EG_CellMarkupElements = any; // Placeholder for cell markup
export type EG_RangeMarkupElements = any; // Placeholder for range markup
export type EG_RunLevelElts = any; // Placeholder for run level elements
export type EG_BlockLevelElts = any; // Placeholder for block level elements

// ========================================
// Other complex types
// ========================================

/**
 * Character set.
 * @see ECMA-376 Part 1, §17.3.2.5 CT_Charset
 */
export interface CT_Charset {
  characterSet?: ST_String;
}

// ST_Guid is imported from shared/common-types in basic-types module
