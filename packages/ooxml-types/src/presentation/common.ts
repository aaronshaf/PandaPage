// common.ts - Common types used across presentation modules
import type { ST_RelationshipId, ST_Guid } from "../shared-types";
import type {
  EG_Media,
  CT_TextFont,
  ST_BlackWhiteMode,
  CT_StyleMatrixReference,
  EG_FillProperties,
  EG_EffectProperties,
} from "../dml-main";
import type { CT_GroupShape } from "./shapes";
import type { CT_ExtensionListModify } from "./transitions";
import type { CT_IndexRange } from "./timing-animation";

// Common empty type
export type CT_Empty = Record<string, never>;

export type ST_Name = string;
export type ST_Index = number; // xsd:unsignedInt

export interface CT_Extension {
  any?: any[]; // xsd:any
  uri: string; // xsd:token
}

export interface CT_ExtensionList {
  ext?: CT_Extension[];
}

export interface CT_CustomerData {
  id: ST_RelationshipId;
}

export interface CT_TagsData {
  id: ST_RelationshipId;
}

export interface CT_CustomerDataList {
  custData?: CT_CustomerData[];
  tags?: CT_TagsData;
}

export interface CT_CustomShowId {
  id: number; // xsd:unsignedInt
}

export type EG_SlideListChoice =
  | { sldAll: CT_Empty }
  | { sldRg: CT_IndexRange }
  | { custShow: CT_CustomShowId };

export interface CT_CommentAuthor {
  extLst?: CT_ExtensionList;
  id: number; // xsd:unsignedInt
  name: ST_Name;
  initials: ST_Name;
  lastIdx: number; // xsd:unsignedInt
  clrIdx: number; // xsd:unsignedInt
}

export interface CT_CommentAuthorList {
  cmAuthor?: CT_CommentAuthor[];
}

export interface CT_Comment {
  pos: import("../dml-main").CT_Point2D;
  text: string;
  extLst?: CT_ExtensionListModify;
  authorId: number; // xsd:unsignedInt
  dt?: string; // xsd:dateTime
  idx: ST_Index;
}

export interface CT_CommentList {
  cm?: CT_Comment[];
}

export interface CT_EmbeddedFontDataId {
  id: ST_RelationshipId;
}

export interface CT_EmbeddedFontListEntry {
  font: CT_TextFont;
  regular?: CT_EmbeddedFontDataId;
  bold?: CT_EmbeddedFontDataId;
  italic?: CT_EmbeddedFontDataId;
  boldItalic?: CT_EmbeddedFontDataId;
}

export interface CT_EmbeddedFontList {
  embeddedFont?: CT_EmbeddedFontListEntry[];
}

export interface CT_SmartTags {
  id: ST_RelationshipId;
}

export interface CT_CustomShow {
  sldLst: import("./slides").CT_SlideRelationshipList;
  extLst?: CT_ExtensionList;
  name: ST_Name;
  id: number; // xsd:unsignedInt
}

export interface CT_CustomShowList {
  custShow?: CT_CustomShow[];
}

export interface CT_HeaderFooter {
  extLst?: CT_ExtensionListModify;
  sldNum?: boolean;
  hdr?: boolean;
  ftr?: boolean;
  dt?: boolean;
}

export enum ST_PlaceholderType {
  Title = "title",
  Body = "body",
  CtrTitle = "ctrTitle",
  SubTitle = "subTitle",
  Dt = "dt",
  SldNum = "sldNum",
  Ftr = "ftr",
  Hdr = "hdr",
  Obj = "obj",
  Chart = "chart",
  Tbl = "tbl",
  ClipArt = "clipArt",
  Dgm = "dgm",
  Media = "media",
  SldImg = "sldImg",
  Pic = "pic",
}

export enum ST_PlaceholderSize {
  Full = "full",
  Half = "half",
  Quarter = "quarter",
}

export interface CT_Placeholder {
  extLst?: CT_ExtensionListModify;
  type?: ST_PlaceholderType;
  orient?: import("./transitions").ST_Direction;
  sz?: ST_PlaceholderSize;
  idx?: number; // xsd:unsignedInt
  hasCustomPrompt?: boolean;
}

export interface CT_ApplicationNonVisualDrawingProps {
  ph?: CT_Placeholder;
  media?: EG_Media;
  custDataLst?: CT_CustomerDataList;
  extLst?: CT_ExtensionList;
  isPhoto?: boolean;
  userDrawn?: boolean;
}

export interface CT_BackgroundProperties {
  fillProperties: EG_FillProperties;
  effectProperties?: EG_EffectProperties;
  extLst?: CT_ExtensionList;
  shadeToTitle?: boolean;
}

export type EG_Background = { bgPr: CT_BackgroundProperties } | { bgRef: CT_StyleMatrixReference };

export interface CT_Background {
  background: EG_Background;
  bwMode?: ST_BlackWhiteMode;
}

export interface CT_CommonSlideData {
  bg?: CT_Background;
  spTree: CT_GroupShape;
  custDataLst?: CT_CustomerDataList;
  controls?: CT_ControlList;
  extLst?: CT_ExtensionList;
  name?: string;
}

export interface CT_StringTag {
  name: string;
  val: string;
}

export interface CT_TagList {
  tag?: CT_StringTag[];
}

// Control-related types
export interface AG_Ole {
  name?: string;
  showAsIcon?: boolean;
  id?: ST_RelationshipId;
  imgW?: import("../dml-main").CT_PositiveSize2D;
  imgH?: import("../dml-main").CT_PositiveSize2D;
}

export enum ST_OleObjectFollowColorScheme {
  None = "none",
  Full = "full",
  TextAndBackground = "textAndBackground",
}

export interface CT_OleObjectEmbed {
  extLst?: CT_ExtensionList;
  followColorScheme?: ST_OleObjectFollowColorScheme;
}

export interface CT_OleObjectLink {
  extLst?: CT_ExtensionList;
  updateAutomatic?: boolean;
}

export interface CT_OleObject extends AG_Ole {
  embed?: CT_OleObjectEmbed;
  link?: CT_OleObjectLink;
  pic: import("./shapes").CT_PresentationPicture;
  progId?: string;
}

export interface CT_Control extends AG_Ole {
  extLst?: CT_ExtensionList;
  pic?: import("./shapes").CT_PresentationPicture;
}

export interface CT_ControlList {
  control?: CT_Control[];
}
