// color-transform.ts - Color transformation types for diagrams
import type { CT_OfficeArtExtensionList, EG_ColorChoice } from '../dml-main';

// Color transformation name and description
export interface CT_CTName {
  lang?: string;
  val: string;
}

export interface CT_CTDescription {
  lang?: string;
  val: string;
}

// Color transformation category
export interface CT_CTCategory {
  type: string; // xsd:anyURI
  pri: number; // xsd:unsignedInt
}

export interface CT_CTCategories {
  cat?: CT_CTCategory[];
}

// Color application methods
export enum ST_ClrAppMethod {
  Span = "span",
  Cycle = "cycle",
  Repeat = "repeat",
}

export enum ST_HueDir {
  Cw = "cw",
  Ccw = "ccw",
}

// Colors definition
export interface CT_Colors {
  colorChoice?: EG_ColorChoice[];
  meth?: ST_ClrAppMethod;
  hueDir?: ST_HueDir;
}

// Style label
export interface CT_CTStyleLabel {
  fillClrLst?: CT_Colors;
  linClrLst?: CT_Colors;
  effectClrLst?: CT_Colors;
  txLinClrLst?: CT_Colors;
  txFillClrLst?: CT_Colors;
  txEffectClrLst?: CT_Colors;
  extLst?: CT_OfficeArtExtensionList;
  name: string;
}

// Color transform
export interface CT_ColorTransform {
  title?: CT_CTName[];
  desc?: CT_CTDescription[];
  catLst?: CT_CTCategories;
  styleLbl?: CT_CTStyleLabel[];
  extLst?: CT_OfficeArtExtensionList;
  uniqueId?: string;
  minVer?: string;
}

// Color transform header
export interface CT_ColorTransformHeader {
  title: CT_CTName[];
  desc: CT_CTDescription[];
  catLst?: CT_CTCategories;
  extLst?: CT_OfficeArtExtensionList;
  uniqueId: string;
  minVer?: string;
  resId?: number; // xsd:int
}

export interface CT_ColorTransformHeaderLst {
  colorsDefHdr?: CT_ColorTransformHeader[];
}