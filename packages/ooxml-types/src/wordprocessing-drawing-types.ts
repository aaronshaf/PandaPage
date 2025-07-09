// wordprocessing-drawing-types.ts
import type { ST_Coordinate, CT_PositiveSize2D, CT_NonVisualDrawingProps, CT_NonVisualGraphicFrameProperties, CT_GraphicalObject, CT_Point2D, CT_NonVisualDrawingShapeProps, CT_NonVisualConnectorProperties, CT_ShapeProperties, CT_ShapeStyle, CT_TextBodyProperties, CT_OfficeArtExtensionList, CT_NonVisualContentPartProperties, CT_Transform2D, ST_BlackWhiteMode, CT_NonVisualGroupDrawingShapeProps, CT_GroupShapeProperties, CT_BackgroundFormatting, CT_WholeE2oFormatting } from './dml-main';
import type { CT_Picture } from './picture-types';
import type { EG_BlockLevelElts } from './wml';
import type { ST_RelationshipId } from './shared-types';

export interface CT_EffectExtent {
  l: ST_Coordinate;
  t: ST_Coordinate;
  r: ST_Coordinate;
  b: ST_Coordinate;
}

export type ST_WrapDistance = number; // xsd:unsignedInt

export interface CT_Inline {
  extent: CT_PositiveSize2D;
  effectExtent?: CT_EffectExtent;
  docPr: CT_NonVisualDrawingProps;
  cNvGraphicFramePr?: CT_NonVisualGraphicFrameProperties;
  graphic: CT_GraphicalObject;
  distT?: ST_WrapDistance;
  distB?: ST_WrapDistance;
  distL?: ST_WrapDistance;
  distR?: ST_WrapDistance;
}

export enum ST_WrapText {
  BothSides = "bothSides",
  Left = "left",
  Right = "right",
  Largest = "largest",
}

export interface CT_WrapPath {
  start: CT_Point2D;
  lineTo: CT_Point2D[];
  edited?: boolean;
}

export type CT_WrapNone = Record<string, never>

export interface CT_WrapSquare {
  effectExtent?: CT_EffectExtent;
  wrapText: ST_WrapText;
  distT?: ST_WrapDistance;
  distB?: ST_WrapDistance;
  distL?: ST_WrapDistance;
  distR?: ST_WrapDistance;
}

export interface CT_WrapTight {
  wrapPolygon: CT_WrapPath;
  wrapText: ST_WrapText;
  distL?: ST_WrapDistance;
  distR?: ST_WrapDistance;
}

export interface CT_WrapThrough {
  wrapPolygon: CT_WrapPath;
  wrapText: ST_WrapText;
  distL?: ST_WrapDistance;
  distR?: ST_WrapDistance;
}

export interface CT_WrapTopBottom {
  effectExtent?: CT_EffectExtent;
  distT?: ST_WrapDistance;
  distB?: ST_WrapDistance;
}

export type EG_WrapType = 
  | { wrapNone: CT_WrapNone }
  | { wrapSquare: CT_WrapSquare }
  | { wrapTight: CT_WrapTight }
  | { wrapThrough: CT_WrapThrough }
  | { wrapTopAndBottom: CT_WrapTopBottom };

export type ST_PositionOffset = number; // xsd:int

export enum ST_AlignH {
  Left = "left",
  Right = "right",
  Center = "center",
  Inside = "inside",
  Outside = "outside",
}

export enum ST_RelFromH {
  Margin = "margin",
  Page = "page",
  Column = "column",
  Character = "character",
  LeftMargin = "leftMargin",
  RightMargin = "rightMargin",
  InsideMargin = "insideMargin",
  OutsideMargin = "outsideMargin",
}

export interface CT_PosH {
  align?: ST_AlignH;
  posOffset?: ST_PositionOffset;
  relativeFrom: ST_RelFromH;
}

export enum ST_AlignV {
  Top = "top",
  Bottom = "bottom",
  Center = "center",
  Inside = "inside",
  Outside = "outside",
}

export enum ST_RelFromV {
  Margin = "margin",
  Page = "page",
  Paragraph = "paragraph",
  Line = "line",
  TopMargin = "topMargin",
  BottomMargin = "bottomMargin",
  InsideMargin = "insideMargin",
  OutsideMargin = "outsideMargin",
}

export interface CT_PosV {
  align?: ST_AlignV;
  posOffset?: ST_PositionOffset;
  relativeFrom: ST_RelFromV;
}

export interface CT_Anchor {
  simplePos?: CT_Point2D;
  positionH: CT_PosH;
  positionV: CT_PosV;
  extent: CT_PositiveSize2D;
  effectExtent?: CT_EffectExtent;
  wrapType: EG_WrapType;
  docPr: CT_NonVisualDrawingProps;
  cNvGraphicFramePr?: CT_NonVisualGraphicFrameProperties;
  graphic: CT_GraphicalObject;
  distT?: ST_WrapDistance;
  distB?: ST_WrapDistance;
  distL?: ST_WrapDistance;
  distR?: ST_WrapDistance;
  simplePosAttr?: boolean;
  relativeHeight: number; // xsd:unsignedInt
  behindDoc: boolean;
  locked: boolean;
  layoutInCell: boolean;
  hidden?: boolean;
  allowOverlap: boolean;
}

export interface CT_TxbxContent {
  blockLevelElts: EG_BlockLevelElts[];
}

export interface CT_TextboxInfo {
  txbxContent: CT_TxbxContent;
  extLst?: CT_OfficeArtExtensionList;
  id?: number; // xsd:unsignedShort
}

export interface CT_LinkedTextboxInformation {
  extLst?: CT_OfficeArtExtensionList;
  id: number; // xsd:unsignedShort
  seq: number; // xsd:unsignedShort
}

export interface CT_WordprocessingShape {
  cNvPr?: CT_NonVisualDrawingProps;
  cNvSpPr?: CT_NonVisualDrawingShapeProps;
  cNvCnPr?: CT_NonVisualConnectorProperties;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  extLst?: CT_OfficeArtExtensionList;
  txbx?: CT_TextboxInfo;
  linkedTxbx?: CT_LinkedTextboxInformation;
  bodyPr: CT_TextBodyProperties;
  normalEastAsianFlow?: boolean;
}

export interface CT_GraphicFrame {
  cNvPr: CT_NonVisualDrawingProps;
  cNvFrPr: CT_NonVisualGraphicFrameProperties;
  xfrm: CT_Transform2D;
  graphic: CT_GraphicalObject;
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_WordprocessingContentPartNonVisual {
  cNvPr?: CT_NonVisualDrawingProps;
  cNvContentPartPr?: CT_NonVisualContentPartProperties;
}

export interface CT_WordprocessingContentPart {
  nvContentPartPr?: CT_WordprocessingContentPartNonVisual;
  xfrm?: CT_Transform2D;
  extLst?: CT_OfficeArtExtensionList;
  bwMode?: ST_BlackWhiteMode;
  id: ST_RelationshipId;
}

export interface CT_WordprocessingGroup {
  cNvPr?: CT_NonVisualDrawingProps;
  cNvGrpSpPr: CT_NonVisualGroupDrawingShapeProps;
  grpSpPr: CT_GroupShapeProperties;
  elements?: (
    | { wsp: CT_WordprocessingShape }
    | { grpSp: CT_WordprocessingGroup }
    | { graphicFrame: CT_GraphicFrame }
    | { pic: CT_Picture }
    | { contentPart: CT_WordprocessingContentPart }
  )[];
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_WordprocessingCanvas {
  bg?: CT_BackgroundFormatting;
  whole?: CT_WholeE2oFormatting;
  elements?: (
    | { wsp: CT_WordprocessingShape }
    | { pic: CT_Picture }
    | { contentPart: CT_WordprocessingContentPart }
    | { wgp: CT_WordprocessingGroup }
    | { graphicFrame: CT_GraphicFrame }
  )[];
  extLst?: CT_OfficeArtExtensionList;
}


// Missing types that are imported by wml.ts
export type CT_GvmlGroupShape = Record<string, never>
export type CT_GvmlGraphicalObjectFrame = Record<string, never>
