// presentation.ts - Main presentation types
import type { ST_Percentage, ST_RelationshipId, ST_ConformanceClass } from '../shared-types';
import type { CT_PositiveSize2D, CT_TextListStyle, CT_TextFont, CT_Color } from '../dml-main';
import type { CT_Empty } from './common';
import type { CT_SlideIdList, CT_SlideMasterIdList, CT_NotesMasterIdList, CT_HandoutMasterIdList } from './slides';
import type { CT_ExtensionList, CT_CustomShowList, CT_CustomerDataList, CT_EmbeddedFontList, CT_SmartTags, EG_SlideListChoice } from './common';

export type ST_SlideSizeCoordinate = number; // a:ST_PositiveCoordinate32, minInclusive 914400, maxInclusive 51206400
export type ST_BookmarkIdSeed = number; // xsd:unsignedInt, minInclusive 1, maxExclusive 2147483648

export enum ST_SlideSizeType {
  Screen4x3 = "screen4x3",
  Letter = "letter",
  A4 = "A4",
  Three5mm = "35mm",
  Overhead = "overhead",
  Banner = "banner",
  Custom = "custom",
  Ledger = "ledger",
  A3 = "A3",
  B4ISO = "B4ISO",
  B5ISO = "B5ISO",
  B4JIS = "B4JIS",
  B5JIS = "B5JIS",
  HagakiCard = "hagakiCard",
  Screen16x9 = "screen16x9",
  Screen16x10 = "screen16x10",
}

export interface CT_SlideSize {
  cx: ST_SlideSizeCoordinate;
  cy: ST_SlideSizeCoordinate;
  type?: ST_SlideSizeType;
}

export interface CT_Kinsoku {
  lang?: string;
  invalStChars: string;
  invalEndChars: string;
}

export interface CT_ModifyVerifier {
  algorithmName?: string;
  hashValue?: string; // xsd:base64Binary
  saltValue?: string; // xsd:base64Binary
  spinValue?: number; // xsd:unsignedInt
}

export enum ST_PhotoAlbumLayout {
  FitToSlide = "fitToSlide",
  OnePic = "1pic",
  TwoPic = "2pic",
  FourPic = "4pic",
  OnePicTitle = "1picTitle",
  TwoPicTitle = "2picTitle",
  FourPicTitle = "4picTitle",
}

export enum ST_PhotoAlbumFrameShape {
  FrameStyle1 = "frameStyle1",
  FrameStyle2 = "frameStyle2",
  FrameStyle3 = "frameStyle3",
  FrameStyle4 = "frameStyle4",
  FrameStyle5 = "frameStyle5",
  FrameStyle6 = "frameStyle6",
  FrameStyle7 = "frameStyle7",
}

export interface CT_PhotoAlbum {
  extLst?: CT_ExtensionList;
  bw?: boolean;
  showCaptions?: boolean;
  layout?: ST_PhotoAlbumLayout;
  frame?: ST_PhotoAlbumFrameShape;
}

export interface CT_Presentation {
  sldMasterIdLst?: CT_SlideMasterIdList;
  notesMasterIdLst?: CT_NotesMasterIdList;
  handoutMasterIdLst?: CT_HandoutMasterIdList;
  sldIdLst?: CT_SlideIdList;
  sldSz?: CT_SlideSize;
  notesSz: CT_PositiveSize2D;
  smartTags?: CT_SmartTags;
  embeddedFontLst?: CT_EmbeddedFontList;
  custShowLst?: CT_CustomShowList;
  photoAlbum?: CT_PhotoAlbum;
  custDataLst?: CT_CustomerDataList;
  kinsoku?: CT_Kinsoku;
  defaultTextStyle?: CT_TextListStyle;
  modifyVerifier?: CT_ModifyVerifier;
  extLst?: CT_ExtensionList;
  serverZoom?: ST_Percentage;
  firstSlideNum?: number; // xsd:int
  showSpecialPlsOnTitleSld?: boolean;
  rtl?: boolean;
  removePersonalInfoOnSave?: boolean;
  compatMode?: boolean;
  strictFirstAndLastChars?: boolean;
  embedTrueTypeFonts?: boolean;
  saveSubsetFonts?: boolean;
  autoCompressPictures?: boolean;
  bookmarkIdSeed?: ST_BookmarkIdSeed;
  conformance?: ST_ConformanceClass;
}

export interface CT_HtmlPublishProperties {
  slideListChoice: EG_SlideListChoice;
  extLst?: CT_ExtensionList;
  showSpeakerNotes?: boolean;
  target?: string;
  title?: string;
  id: ST_RelationshipId;
}

export enum ST_PrintWhat {
  Slides = "slides",
  Handouts1 = "handouts1",
  Handouts2 = "handouts2",
  Handouts3 = "handouts3",
  Handouts4 = "handouts4",
  Handouts6 = "handouts6",
  Handouts9 = "handouts9",
  Notes = "notes",
  Outline = "outline",
}

export enum ST_PrintColorMode {
  Bw = "bw",
  Gray = "gray",
  Clr = "clr",
}

export interface CT_PrintProperties {
  extLst?: CT_ExtensionList;
  prnWhat?: ST_PrintWhat;
  clrMode?: ST_PrintColorMode;
  hiddenSlides?: boolean;
  scaleToFitPaper?: boolean;
  frameSlides?: boolean;
}

export interface CT_ShowInfoBrowse {
  showScrollbar?: boolean;
}

export interface CT_ShowInfoKiosk {
  restart?: number; // xsd:unsignedInt
}

export type EG_ShowType = 
  | { present: CT_Empty }
  | { browse: CT_ShowInfoBrowse }
  | { kiosk: CT_ShowInfoKiosk };

export interface CT_ShowProperties {
  showType?: EG_ShowType;
  slideListChoice?: EG_SlideListChoice;
  penClr?: CT_Color;
  extLst?: CT_ExtensionList;
  loop?: boolean;
  showNarration?: boolean;
  showAnimation?: boolean;
  useTimings?: boolean;
}

export interface CT_PresentationProperties {
  prnPr?: CT_PrintProperties;
  showPr?: CT_ShowProperties;
  clrMru?: CT_Color;
  extLst?: CT_ExtensionList;
}