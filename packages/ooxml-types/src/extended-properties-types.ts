// extended-properties-types.ts
import type { CT_Vector, VT_Blob } from './variant-types';
import type { ST_String } from './shared-types';

export interface CT_VectorVariant {
  vector: CT_Vector;
}

export interface CT_VectorLpstr {
  vector: CT_Vector;
}

export interface CT_DigSigBlob {
  blob: VT_Blob;
}

export interface CT_Properties {
  Template?: ST_String;
  Manager?: ST_String;
  Company?: ST_String;
  Pages?: number; // xsd:int
  Words?: number; // xsd:int
  Characters?: number; // xsd:int
  PresentationFormat?: ST_String;
  Lines?: number; // xsd:int
  Paragraphs?: number; // xsd:int
  Slides?: number; // xsd:int
  Notes?: number; // xsd:int
  TotalTime?: number; // xsd:int
  HiddenSlides?: number; // xsd:int
  MMClips?: number; // xsd:int
  ScaleCrop?: boolean; // xsd:boolean
  HeadingPairs?: CT_VectorVariant;
  TitlesOfParts?: CT_VectorLpstr;
  LinksUpToDate?: boolean; // xsd:boolean
  CharactersWithSpaces?: number; // xsd:int
  SharedDoc?: boolean; // xsd:boolean
  HyperlinkBase?: ST_String;
  HLinks?: CT_VectorVariant;
  HyperlinksChanged?: boolean; // xsd:boolean
  DigSig?: CT_DigSigBlob;
  Application?: ST_String;
  AppVersion?: ST_String;
  DocSecurity?: number; // xsd:int
}
