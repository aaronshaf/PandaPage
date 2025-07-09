// shapes.ts - Shape-related types for presentations
import type { CT_NonVisualDrawingProps, CT_NonVisualDrawingShapeProps, CT_ShapeProperties, CT_ShapeStyle, CT_TextBody, CT_NonVisualConnectorProperties, CT_BlipFillProperties, CT_NonVisualPictureProperties, CT_NonVisualGraphicFrameProperties, CT_GraphicalObject, CT_Transform2D, ST_BlackWhiteMode, CT_NonVisualGroupDrawingShapeProps, CT_GroupShapeProperties } from '../dml-main';
import type { CT_Picture } from '../picture-types';
import type { ST_RelationshipId } from '../shared-types';
import type { CT_ExtensionListModify } from './transitions';
import type { CT_ApplicationNonVisualDrawingProps } from './common';

export interface CT_ShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvSpPr: CT_NonVisualDrawingShapeProps;
  nvPr: CT_ApplicationNonVisualDrawingProps;
}

export interface CT_Shape {
  nvSpPr: CT_ShapeNonVisual;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  txBody?: CT_TextBody;
  extLst?: CT_ExtensionListModify;
  useBgFill?: boolean;
}

export interface CT_ConnectorNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvCxnSpPr: CT_NonVisualConnectorProperties;
  nvPr: CT_ApplicationNonVisualDrawingProps;
}

export interface CT_Connector {
  nvCxnSpPr: CT_ConnectorNonVisual;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  extLst?: CT_ExtensionListModify;
}

export interface CT_PictureNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvPicPr: CT_NonVisualPictureProperties;
  nvPr: CT_ApplicationNonVisualDrawingProps;
}

export interface CT_PresentationPicture {
  nvPicPr: CT_PictureNonVisual;
  blipFill: CT_BlipFillProperties;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  extLst?: CT_ExtensionListModify;
}

export interface CT_GraphicalObjectFrameNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGraphicFramePr: CT_NonVisualGraphicFrameProperties;
  nvPr: CT_ApplicationNonVisualDrawingProps;
}

export interface CT_GraphicalObjectFrame {
  nvGraphicFramePr: CT_GraphicalObjectFrameNonVisual;
  xfrm: CT_Transform2D;
  graphic: CT_GraphicalObject;
  extLst?: CT_ExtensionListModify;
  bwMode?: ST_BlackWhiteMode;
}

export interface CT_GroupShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGrpSpPr: CT_NonVisualGroupDrawingShapeProps;
  nvPr: CT_ApplicationNonVisualDrawingProps;
}

export interface CT_GroupShape {
  nvGrpSpPr: CT_GroupShapeNonVisual;
  grpSpPr: CT_GroupShapeProperties;
  elements?: (
    | { sp: CT_Shape }
    | { grpSp: CT_GroupShape }
    | { graphicFrame: CT_GraphicalObjectFrame }
    | { cxnSp: CT_Connector }
    | { pic: CT_Picture }
    | { contentPart: CT_Rel }
  )[];
  extLst?: CT_ExtensionListModify;
}

export interface CT_Rel {
  id: ST_RelationshipId;
}