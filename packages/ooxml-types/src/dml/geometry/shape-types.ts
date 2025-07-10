/**
 * DrawingML Shape Types
 * Based on dml-main.xsd shape definitions
 */

import type {
  CT_PresetGeometry2D,
  CT_CustomGeometry2D,
  CT_Point2D,
  CT_PositiveSize2D,
} from "./geometry-types";
import type { CT_Path2DList } from "./path-types";

/**
 * Shape geometry container
 */
export interface CT_ShapeGeometry {
  /** Preset geometry */
  prstGeom?: CT_PresetGeometry2D;
  /** Custom geometry */
  custGeom?: CT_CustomGeometry2D;
}

/**
 * Shape properties
 */
export interface CT_ShapeProperties {
  /** Transform 2D */
  xfrm?: CT_Transform2D;
  /** Geometry */
  geometry?: CT_ShapeGeometry;
  /** Fill */
  fill?: any; // Various fill types
  /** Line */
  ln?: any; // CT_LineProperties
  /** Effect list */
  effectLst?: any; // CT_EffectList
  /** Effect DAG */
  effectDag?: any; // CT_EffectContainer
  /** Scene 3D */
  scene3d?: any; // CT_Scene3D
  /** Shape 3D */
  sp3d?: any; // CT_Shape3D
  /** Extension list */
  extLst?: any; // CT_OfficeArtExtensionList
  /** Black and white mode */
  bwMode?: ST_BlackWhiteMode;
}

/**
 * 2D transform
 */
export interface CT_Transform2D {
  /** Offset */
  off?: CT_Point2D;
  /** Extents */
  ext?: CT_PositiveSize2D;
  /** Rotation */
  rot?: number;
  /** Flip horizontal */
  flipH?: boolean;
  /** Flip vertical */
  flipV?: boolean;
}

/**
 * Black and white mode
 */
export type ST_BlackWhiteMode =
  | "clr"
  | "auto"
  | "gray"
  | "ltGray"
  | "invGray"
  | "grayWhite"
  | "blackGray"
  | "blackWhite"
  | "black"
  | "white"
  | "hidden";
