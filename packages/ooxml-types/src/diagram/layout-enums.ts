// layout-enums.ts - Layout enumeration types for diagrams

// Alignment enums
export enum ST_DiagramHorizontalAlignment {
  L = "l",
  Ctr = "ctr",
  R = "r",
  None = "none",
}

export enum ST_VerticalAlignment {
  T = "t",
  Mid = "mid",
  B = "b",
  None = "none",
}

export enum ST_NodeHorizontalAlignment {
  L = "l",
  Ctr = "ctr",
  R = "r",
}

export enum ST_NodeVerticalAlignment {
  T = "t",
  Mid = "mid",
  B = "b",
}

// Child layout enums
export enum ST_ChildDirection {
  Horz = "horz",
  Vert = "vert",
}

export enum ST_ChildAlignment {
  T = "t",
  B = "b",
  L = "l",
  R = "r",
}

export enum ST_SecondaryChildAlignment {
  None = "none",
  T = "t",
  B = "b",
  L = "l",
  R = "r",
}

export enum ST_ChildOrderType {
  B = "b",
  T = "t",
}

// Direction enums
export enum ST_LinearDirection {
  FromL = "fromL",
  FromR = "fromR",
  FromT = "fromT",
  FromB = "fromB",
}

export enum ST_SecondaryLinearDirection {
  None = "none",
  FromL = "fromL",
  FromR = "fromR",
  FromT = "fromT",
  FromB = "fromB",
}

export enum ST_Direction {
  Norm = "norm",
  Rev = "rev",
}

// Text enums
export enum ST_TextDirection {
  FromT = "fromT",
  FromB = "fromB",
}

export enum ST_TextBlockDirection {
  Horz = "horz",
  Vert = "vert",
}

export enum ST_TextAnchorHorizontal {
  None = "none",
  Ctr = "ctr",
}

export enum ST_TextAnchorVertical {
  T = "t",
  Mid = "mid",
  B = "b",
}

export enum ST_DiagramTextAlignment {
  L = "l",
  Ctr = "ctr",
  R = "r",
}

export enum ST_AutoTextRotation {
  None = "none",
  Upr = "upr",
  Grav = "grav",
}

// Connector enums
export enum ST_ConnectorRouting {
  Stra = "stra",
  Bend = "bend",
  Curve = "curve",
  LongCurve = "longCurve",
}

export enum ST_ConnectorDimension {
  OneD = "1D",
  TwoD = "2D",
  Cust = "cust",
}

export enum ST_ConnectorPoint {
  Auto = "auto",
  BCtr = "bCtr",
  Ctr = "ctr",
  MidL = "midL",
  MidR = "midR",
  TCtr = "tCtr",
  BL = "bL",
  BR = "bR",
  TL = "tL",
  TR = "tR",
  Radial = "radial",
}

export enum ST_ArrowheadStyle {
  Auto = "auto",
  Arr = "arr",
  NoArr = "noArr",
}

// Layout enums
export enum ST_StartingElement {
  Node = "node",
  Trans = "trans",
}

export enum ST_BendPoint {
  Beg = "beg",
  Def = "def",
  End = "end",
}

export enum ST_RotationPath {
  None = "none",
  AlongPath = "alongPath",
}

export enum ST_CenterShapeMapping {
  None = "none",
  FNode = "fNode",
}

export enum ST_FallbackDimension {
  OneD = "1D",
  TwoD = "2D",
}

// Pyramid enums
export enum ST_PyramidAccentPosition {
  Bef = "bef",
  Aft = "aft",
}

export enum ST_PyramidAccentTextMargin {
  Step = "step",
  Stack = "stack",
}

// Growth and flow enums
export enum ST_GrowDirection {
  TL = "tL",
  TR = "tR",
  BL = "bL",
  BR = "bR",
}

export enum ST_FlowDirection {
  Row = "row",
  Col = "col",
}

export enum ST_ContinueDirection {
  RevDir = "revDir",
  SameDir = "sameDir",
}

export enum ST_Breakpoint {
  EndCnv = "endCnv",
  Bal = "bal",
  Fixed = "fixed",
}

export enum ST_Offset {
  Ctr = "ctr",
  Off = "off",
}

// Hierarchy enums
export enum ST_HierarchyAlignment {
  TL = "tL",
  TR = "tR",
  TCtrCh = "tCtrCh",
  TCtrDes = "tCtrDes",
  BL = "bL",
  BR = "bR",
  BCtrCh = "bCtrCh",
  BCtrDes = "bCtrDes",
  LT = "lT",
  LB = "lB",
  LCtrCh = "lCtrCh",
  LCtrDes = "lCtrDes",
  RT = "rT",
  RB = "rB",
  RCtrCh = "rCtrCh",
  RCtrDes = "rCtrDes",
}

export enum ST_HierBranchStyle {
  L = "l",
  R = "r",
  Hang = "hang",
  Std = "std",
  Init = "init",
}

// Animation enums
export enum ST_AnimOneStr {
  None = "none",
  One = "one",
  Branch = "branch",
}

export enum ST_AnimLvlStr {
  None = "none",
  Lvl = "lvl",
  Ctr = "ctr",
}

export enum ST_ResizeHandlesStr {
  Exact = "exact",
  Rel = "rel",
}

// Boolean enums
export enum ST_BooleanValue {
  True = "true",
  False = "false",
}

// Boolean operators
export enum ST_BoolOperator {
  None = "none",
  Equ = "equ",
  Gte = "gte",
  Lte = "lte",
}