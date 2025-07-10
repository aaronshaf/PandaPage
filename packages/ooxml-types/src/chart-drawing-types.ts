// chart-drawing-types.ts
import type {
  CT_NonVisualDrawingProps,
  CT_NonVisualDrawingShapeProps,
  CT_ShapeProperties,
  CT_ShapeStyle,
  CT_TextBody,
  CT_NonVisualConnectorProperties,
  CT_BlipFillProperties,
  CT_NonVisualPictureProperties,
  CT_NonVisualGraphicFrameProperties,
  CT_Transform2D,
  CT_GraphicalObject,
  CT_NonVisualGroupDrawingShapeProps,
  CT_GroupShapeProperties,
  CT_PositiveSize2D,
} from "./dml-main";

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

export interface CT_GraphicFrameNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGraphicFramePr: CT_NonVisualGraphicFrameProperties;
}

export interface CT_GraphicFrame {
  nvGraphicFramePr: CT_GraphicFrameNonVisual;
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
    | { graphicFrame: CT_GraphicFrame }
    | { cxnSp: CT_Connector }
    | { pic: CT_Picture }
  )[];
}

export type EG_ObjectChoices =
  | { sp: CT_Shape }
  | { grpSp: CT_GroupShape }
  | { graphicFrame: CT_GraphicFrame }
  | { cxnSp: CT_Connector }
  | { pic: CT_Picture };

export type ST_MarkerCoordinate = number; // xsd:double, minInclusive 0.0, maxInclusive 1.0
export interface CT_Marker {
  x: ST_MarkerCoordinate;
  y: ST_MarkerCoordinate;
}

export interface CT_RelSizeAnchor {
  from: CT_Marker;
  to: CT_Marker;
  objectChoice: EG_ObjectChoices;
}

export interface CT_AbsSizeAnchor {
  from: CT_Marker;
  ext: CT_PositiveSize2D;
  objectChoice: EG_ObjectChoices;
}

export type EG_Anchor = { relSizeAnchor: CT_RelSizeAnchor } | { absSizeAnchor: CT_AbsSizeAnchor };

export interface CT_Drawing {
  anchors?: EG_Anchor[];
}
