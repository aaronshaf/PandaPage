// shape-properties.ts
// Shape properties and styles for DrawingML

import type { ST_Coordinate, ST_PositiveCoordinate } from "./coordinate-types";
import type { CT_Transform2D, CT_GroupTransform2D } from "./transform-types";
import type { CT_PresetGeometry2D, CT_CustomGeometry2D } from "./geometry-types";
import type { CT_LineProperties } from "./line-properties";
import type { CT_OfficeArtExtensionList } from "../dml-media";
import type { ST_FontCollectionIndex } from "../dml-fonts";
import type { EG_ColorChoice, CT_Color } from "../dml-colors";
import type {
  CT_NoFillProperties,
  CT_SolidColorFillProperties,
  CT_GradientFillProperties,
  CT_BlipFillProperties,
  CT_PatternFillProperties,
  CT_GroupFillProperties,
  CT_EffectList,
  CT_EffectContainer,
} from "../dml-effects";

// Black white mode enum
export enum ST_BlackWhiteMode {
  Clr = "clr",
  Auto = "auto",
  Gray = "gray",
  LtGray = "ltGray",
  InvGray = "invGray",
  GrayWhite = "grayWhite",
  BlackGray = "blackGray",
  BlackWhite = "blackWhite",
  Black = "black",
  White = "white",
  Hidden = "hidden",
}

// Preset material type enum
export enum ST_PresetMaterialType {
  LegacyMatte = "legacyMatte",
  LegacyPlastic = "legacyPlastic",
  LegacyMetal = "legacyMetal",
  LegacyWireframe = "legacyWireframe",
  Matte = "matte",
  Plastic = "plastic",
  Metal = "metal",
  WarmMatte = "warmMatte",
  TranslucentPowder = "translucentPowder",
  Powder = "powder",
  DkEdge = "dkEdge",
  SoftEdge = "softEdge",
  Clear = "clear",
  Flat = "flat",
  Softmetal = "softmetal",
}

// Forward declarations for complex types not yet defined
export type CT_Scene3D = any; // Scene 3D
export type CT_FlatText = any; // Flat text
export type CT_Bevel = any; // Bevel type

// Style matrix column index
export type ST_StyleMatrixColumnIndex = number; // xsd:unsignedInt

// Shape 3D
export interface CT_Shape3D {
  bevelT?: CT_Bevel;
  bevelB?: CT_Bevel;
  extrusionClr?: CT_Color;
  contourClr?: CT_Color;
  extLst?: CT_OfficeArtExtensionList;
  z?: ST_Coordinate;
  extrusionH?: ST_PositiveCoordinate;
  contourW?: ST_PositiveCoordinate;
  prstMaterial?: ST_PresetMaterialType;
}

// Shape properties
export interface CT_ShapeProperties {
  xfrm?: CT_Transform2D;
  noFill?: CT_NoFillProperties;
  solidFill?: CT_SolidColorFillProperties;
  gradFill?: CT_GradientFillProperties;
  blipFill?: CT_BlipFillProperties;
  pattFill?: CT_PatternFillProperties;
  grpFill?: CT_GroupFillProperties;
  ln?: CT_LineProperties;
  effectLst?: CT_EffectList;
  effectDag?: CT_EffectContainer;
  scene3d?: CT_Scene3D;
  sp3d?: CT_Shape3D;
  flatTx?: CT_FlatText;
  prstGeom?: CT_PresetGeometry2D;
  custGeom?: CT_CustomGeometry2D;
  extLst?: CT_OfficeArtExtensionList;
  bwMode?: ST_BlackWhiteMode;
}

// Group shape properties
export interface CT_GroupShapeProperties {
  xfrm?: CT_GroupTransform2D;
  noFill?: CT_NoFillProperties;
  solidFill?: CT_SolidColorFillProperties;
  gradFill?: CT_GradientFillProperties;
  blipFill?: CT_BlipFillProperties;
  pattFill?: CT_PatternFillProperties;
  grpFill?: CT_GroupFillProperties;
  effectLst?: CT_EffectList;
  effectDag?: CT_EffectContainer;
  scene3d?: CT_Scene3D;
  sp3d?: CT_Shape3D;
  flatTx?: CT_FlatText;
  extLst?: CT_OfficeArtExtensionList;
  bwMode?: ST_BlackWhiteMode;
}

// Style matrix reference
export interface CT_StyleMatrixReference {
  idx: ST_StyleMatrixColumnIndex;
  colorChoice?: EG_ColorChoice;
}

// Font reference
export interface CT_FontReference {
  idx: ST_FontCollectionIndex;
  colorChoice?: EG_ColorChoice;
}

// Shape style
export interface CT_ShapeStyle {
  lnRef?: CT_StyleMatrixReference;
  fillRef?: CT_StyleMatrixReference;
  effectRef?: CT_StyleMatrixReference;
  fontRef?: CT_FontReference;
}
