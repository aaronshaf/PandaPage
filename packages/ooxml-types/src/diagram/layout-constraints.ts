// layout-constraints.ts - Layout constraint types for diagrams
import type { CT_OfficeArtExtensionList } from '../dml-main';
import type { ST_BoolOperator } from './layout-enums';

// Axis types
export enum ST_AxisType {
  Self = "self",
  Ch = "ch",
  Des = "des",
  DesOrSelf = "desOrSelf",
  Par = "par",
  Ancst = "ancst",
  AncstOrSelf = "ancstOrSelf",
  FollowSib = "followSib",
  PrecedSib = "precedSib",
  Follow = "follow",
  Preced = "preced",
  Root = "root",
  None = "none",
}
export type ST_AxisTypes = ST_AxisType[];

// Element types
export enum ST_ElementTypes {
  All = "all",
  Doc = "doc",
  Node = "node",
  Norm = "norm",
  NonNorm = "nonNorm",
  Asst = "asst",
  NonAsst = "nonAsst",
  ParTrans = "parTrans",
  Pres = "pres",
  SibTrans = "sibTrans",
}

export enum ST_ElementType {
  All = "all",
  Doc = "doc",
  Node = "node",
  Norm = "norm",
  NonNorm = "nonNorm",
  Asst = "asst",
  NonAsst = "nonAsst",
  ParTrans = "parTrans",
  Pres = "pres",
  SibTrans = "sibTrans",
}

// Constraint types
export enum ST_ConstraintType {
  None = "none",
  AlignOff = "alignOff",
  BegMarg = "begMarg",
  BendDist = "bendDist",
  BegPad = "begPad",
  B = "b",
  BMarg = "bMarg",
  BOff = "bOff",
  CtrX = "ctrX",
  CtrXOff = "ctrXOff",
  CtrY = "ctrY",
  CtrYOff = "ctrYOff",
  ConnDist = "connDist",
  Diam = "diam",
  EndMarg = "endMarg",
  EndPad = "endPad",
  H = "h",
  HArH = "hArH",
  HOff = "hOff",
  L = "l",
  LMarg = "lMarg",
  LOff = "lOff",
  R = "r",
  RMarg = "rMarg",
  ROff = "rOff",
  PrimFontSz = "primFontSz",
  PyraAcctRatio = "pyraAcctRatio",
  SecFontSz = "secFontSz",
  SibSp = "sibSp",
  SecSibSp = "secSibSp",
  Sp = "sp",
  StemThick = "stemThick",
  T = "t",
  TMarg = "tMarg",
  TOff = "tOff",
  UserA = "userA",
  UserB = "userB",
  UserC = "userC",
  UserD = "userD",
  UserE = "userE",
  UserF = "userF",
  UserG = "userG",
  UserH = "userH",
  UserI = "userI",
  UserJ = "userJ",
  UserK = "userK",
  UserL = "userL",
  UserM = "userM",
  UserN = "userN",
  UserO = "userO",
  UserP = "userP",
  UserQ = "userQ",
  UserR = "userR",
  UserS = "userS",
  UserT = "userT",
  UserU = "userU",
  UserV = "userV",
  UserW = "userW",
  UserX = "userX",
  UserY = "userY",
  UserZ = "userZ",
  W = "w",
  WArH = "wArH",
  WOff = "wOff",
}

export enum ST_ConstraintRelationship {
  Self = "self",
  Ch = "ch",
  Des = "des",
}

// Iterator attributes
export interface AG_IteratorAttributes {
  axis?: ST_AxisTypes;
  ptType?: ST_ElementTypes;
  hideLastTrans?: boolean;
  st?: number; // xsd:int
  cnt?: number; // xsd:unsignedInt
  step?: number; // xsd:int
}

// Constraint attributes
export interface AG_ConstraintAttributes {
  type: ST_ConstraintType;
  for?: ST_ConstraintRelationship;
  forName?: string;
  ptType?: ST_ElementType;
}

export interface AG_ConstraintRefAttributes {
  refType?: ST_ConstraintType;
  refFor?: ST_ConstraintRelationship;
  refForName?: string;
  refPtType?: ST_ElementType;
}

// Constraint
export interface CT_Constraint extends AG_ConstraintAttributes, AG_ConstraintRefAttributes {
  extLst?: CT_OfficeArtExtensionList;
  op?: ST_BoolOperator;
  val?: number; // xsd:double
  fact?: number; // xsd:double
}

export interface CT_Constraints {
  constr?: CT_Constraint[];
}

// Numeric rule
export interface CT_NumericRule extends AG_ConstraintAttributes {
  extLst?: CT_OfficeArtExtensionList;
  val?: number; // xsd:double
  fact?: number; // xsd:double
  max?: number; // xsd:double
}

export interface CT_Rules {
  rule?: CT_NumericRule[];
}

// Presentation of
export interface CT_PresentationOf extends AG_IteratorAttributes {
  extLst?: CT_OfficeArtExtensionList;
}

// Type arrays
export type ST_Ints = number[]; // xsd:int list
export type ST_UnsignedInts = number[]; // xsd:unsignedInt list
export type ST_Booleans = boolean[]; // xsd:boolean list