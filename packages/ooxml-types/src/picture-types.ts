// picture-types.ts
import type { CT_NonVisualDrawingProps, CT_NonVisualPictureProperties, CT_BlipFillProperties, CT_ShapeProperties } from './dml-main';

export interface CT_PictureNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvPicPr: CT_NonVisualPictureProperties;
}

export interface CT_Picture {
  nvPicPr: CT_PictureNonVisual;
  blipFill: CT_BlipFillProperties;
  spPr: CT_ShapeProperties;
}
