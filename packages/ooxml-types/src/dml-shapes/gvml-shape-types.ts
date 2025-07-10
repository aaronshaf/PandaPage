// gvml-shape-types.ts
// GVML (Graphics VML) shape types for DrawingML

import type { CT_Transform2D } from './transform-types';
import type { CT_ShapeProperties, CT_GroupShapeProperties, CT_ShapeStyle } from './shape-properties';
import type {
  CT_NonVisualDrawingProps,
  CT_NonVisualDrawingShapeProps,
  CT_NonVisualGroupDrawingShapeProps,
  CT_NonVisualGraphicFrameProperties,
  CT_TextBody,
  CT_GvmlUseShapeRectangle,
  CT_GraphicalObject,
  CT_NonVisualConnectorProperties,
  CT_NonVisualPictureProperties
} from './locking-properties';
import type { CT_OfficeArtExtensionList } from '../dml-media';
import type { CT_BlipFillProperties } from '../dml-effects';

// GVML text shape
export interface CT_GvmlTextShape {
  txBody: CT_TextBody;
  useSpRect?: CT_GvmlUseShapeRectangle;
  xfrm?: CT_Transform2D;
  extLst?: CT_OfficeArtExtensionList;
}

// GVML shape non-visual
export interface CT_GvmlShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvSpPr: CT_NonVisualDrawingShapeProps;
}

// GVML shape
export interface CT_GvmlShape {
  nvSpPr: CT_GvmlShapeNonVisual;
  spPr: CT_ShapeProperties;
  txSp?: CT_GvmlTextShape;
  style?: CT_ShapeStyle;
  extLst?: CT_OfficeArtExtensionList;
}

// GVML group shape non-visual
export interface CT_GvmlGroupShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGrpSpPr: CT_NonVisualGroupDrawingShapeProps;
}

// GVML group shape
export interface CT_GvmlGroupShape {
  nvGrpSpPr: CT_GvmlGroupShapeNonVisual;
  grpSpPr: CT_GroupShapeProperties;
  txSp?: CT_GvmlTextShape;
  sp?: CT_GvmlShape;
  cxnSp?: CT_GvmlConnector;
  pic?: CT_GvmlPicture;
  graphicFrame?: CT_GvmlGraphicalObjectFrame;
  grpSp?: CT_GvmlGroupShape;
  extLst?: CT_OfficeArtExtensionList;
}

// GVML connector non-visual
export interface CT_GvmlConnectorNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvCxnSpPr: CT_NonVisualConnectorProperties;
}

// GVML connector
export interface CT_GvmlConnector {
  nvCxnSpPr: CT_GvmlConnectorNonVisual;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  extLst?: CT_OfficeArtExtensionList;
}

// GVML picture non-visual
export interface CT_GvmlPictureNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvPicPr: CT_NonVisualPictureProperties;
}

// GVML picture
export interface CT_GvmlPicture {
  nvPicPr: CT_GvmlPictureNonVisual;
  blipFill: CT_BlipFillProperties;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  extLst?: CT_OfficeArtExtensionList;
}

// GVML graphic frame non-visual
export interface CT_GvmlGraphicFrameNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGraphicFramePr: CT_NonVisualGraphicFrameProperties;
}

// GVML graphical object frame
export interface CT_GvmlGraphicalObjectFrame {
  nvGraphicFramePr: CT_GvmlGraphicFrameNonVisual;
  graphic: CT_GraphicalObject;
  xfrm: CT_Transform2D;
  extLst?: CT_OfficeArtExtensionList;
}