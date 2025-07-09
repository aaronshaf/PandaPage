// spreadsheet-drawing-types.ts
import type { CT_NonVisualDrawingProps, CT_NonVisualDrawingShapeProps, CT_ShapeProperties, CT_ShapeStyle, CT_TextBody, CT_NonVisualConnectorProperties, CT_BlipFillProperties, CT_NonVisualPictureProperties, CT_NonVisualGraphicFrameProperties, CT_Transform2D, CT_GraphicalObject, CT_NonVisualGroupDrawingShapeProps, CT_GroupShapeProperties, CT_Point2D, CT_PositiveSize2D, ST_Coordinate } from './dml-main';
import type { ST_RelationshipId } from './shared-types';

export type ST_ColID = number; // xsd:int, minInclusive 0
export type ST_RowID = number; // xsd:int, minInclusive 0

export interface CT_Marker {
  col: ST_ColID;
  colOff: ST_Coordinate;
  row: ST_RowID;
  rowOff: ST_Coordinate;
}

export interface CT_AnchorClientData {
  fLocksWithSheet?: boolean;
  fPrintsWithSheet?: boolean;
}

export interface CT_ShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvSpPr: CT_NonVisualDrawingShapeProps;
}

export interface CT_Shape {
  nvSpPr: CT_ShapeNonVisual;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  txBody?: CT_TextBody;
  macro?: string;
  textlink?: string;
  fLocksText?: boolean;
  fPublished?: boolean;
}

export interface CT_ConnectorNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvCxnSpPr: CT_NonVisualConnectorProperties;
}

export interface CT_Connector {
  nvCxnSpPr: CT_ConnectorNonVisual;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  macro?: string;
  fPublished?: boolean;
}

export interface CT_PictureNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvPicPr: CT_NonVisualPictureProperties;
}

export interface CT_Picture {
  nvPicPr: CT_PictureNonVisual;
  blipFill: CT_BlipFillProperties;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  macro?: string;
  fPublished?: boolean;
}

export interface CT_GraphicalObjectFrameNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGraphicFramePr: CT_NonVisualGraphicFrameProperties;
}

export interface CT_GraphicalObjectFrame {
  nvGraphicFramePr: CT_GraphicalObjectFrameNonVisual;
  xfrm: CT_Transform2D;
  graphic: CT_GraphicalObject;
  macro?: string;
  fPublished?: boolean;
}

export interface CT_GroupShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGrpSpPr: CT_NonVisualGroupDrawingShapeProps;
}

export interface CT_GroupShape {
  nvGrpSpPr: CT_GroupShapeNonVisual;
  grpSpPr: CT_GroupShapeProperties;
  shapes?: (
    | { sp: CT_Shape }
    | { grpSp: CT_GroupShape }
    | { graphicFrame: CT_GraphicalObjectFrame }
    | { cxnSp: CT_Connector }
    | { pic: CT_Picture }
  )[];
}

export interface CT_Rel {
  id: ST_RelationshipId;
}

export type EG_ObjectChoices = 
  | { sp: CT_Shape }
  | { grpSp: CT_GroupShape }
  | { graphicFrame: CT_GraphicalObjectFrame }
  | { cxnSp: CT_Connector }
  | { pic: CT_Picture }
  | { contentPart: CT_Rel };

export enum ST_EditAs {
  TwoCell = "twoCell",
  OneCell = "oneCell",
  Absolute = "absolute",
}

export interface CT_TwoCellAnchor {
  from: CT_Marker;
  to: CT_Marker;
  objectChoice: EG_ObjectChoices;
  clientData: CT_AnchorClientData;
  editAs?: ST_EditAs;
}

export interface CT_OneCellAnchor {
  from: CT_Marker;
  ext: CT_PositiveSize2D;
  objectChoice: EG_ObjectChoices;
  clientData: CT_AnchorClientData;
}

export interface CT_AbsoluteAnchor {
  pos: CT_Point2D;
  ext: CT_PositiveSize2D;
  objectChoice: EG_ObjectChoices;
  clientData: CT_AnchorClientData;
}

export type EG_Anchor = 
  | { twoCellAnchor: CT_TwoCellAnchor }
  | { oneCellAnchor: CT_OneCellAnchor }
  | { absoluteAnchor: CT_AbsoluteAnchor };

export interface CT_Drawing {
  anchors?: EG_Anchor[];
}
