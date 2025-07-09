// diagram-types.ts
import type { CT_OfficeArtExtensionList, EG_ColorChoice, CT_ShapeProperties, CT_TextBody, CT_Scene3D, CT_Shape3D, CT_ShapeStyle, CT_BackgroundFormatting, CT_WholeE2oFormatting } from './dml-main';
import type { ST_String, ST_Guid, ST_Percentage } from './shared-types';

export interface CT_CTName {
  lang?: string;
  val: string;
}

export interface CT_CTDescription {
  lang?: string;
  val: string;
}

export interface CT_CTCategory {
  type: string; // xsd:anyURI
  pri: number; // xsd:unsignedInt
}

export interface CT_CTCategories {
  cat?: CT_CTCategory[];
}

export enum ST_ClrAppMethod {
  Span = "span",
  Cycle = "cycle",
  Repeat = "repeat",
}

export enum ST_HueDir {
  Cw = "cw",
  Ccw = "ccw",
}

export interface CT_Colors {
  colorChoice?: EG_ColorChoice[];
  meth?: ST_ClrAppMethod;
  hueDir?: ST_HueDir;
}

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

export interface CT_ColorTransform {
  title?: CT_CTName[];
  desc?: CT_CTDescription[];
  catLst?: CT_CTCategories;
  styleLbl?: CT_CTStyleLabel[];
  extLst?: CT_OfficeArtExtensionList;
  uniqueId?: string;
  minVer?: string;
}

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

export enum ST_PtType {
  Node = "node",
  Asst = "asst",
  Doc = "doc",
  Pres = "pres",
  ParTrans = "parTrans",
  SibTrans = "sibTrans",
}

export type ST_ModelId = number | ST_Guid; // xsd:int or s:ST_Guid

export interface CT_ElemPropSet {
  presLayoutVars?: CT_LayoutVariablePropertySet;
  style?: CT_ShapeStyle;
  presAssocID?: ST_ModelId;
  presName?: string;
  presStyleLbl?: string;
  presStyleIdx?: number; // xsd:int
  presStyleCnt?: number; // xsd:int
  loTypeId?: string;
  loCatId?: string;
  qsTypeId?: string;
  qsCatId?: string;
  csTypeId?: string;
  csCatId?: string;
  coherent3DOff?: boolean;
  phldrT?: string;
  phldr?: boolean;
  custAng?: number; // xsd:int
  custFlipVert?: boolean;
  custFlipHor?: boolean;
  custSzX?: number; // xsd:int
  custSzY?: number; // xsd:int
  custScaleX?: ST_Percentage;
  custScaleY?: ST_Percentage;
  custT?: boolean;
  custLinFactX?: ST_Percentage;
  custLinFactY?: ST_Percentage;
  custLinFactNeighborX?: ST_Percentage;
  custLinFactNeighborY?: ST_Percentage;
  custRadScaleRad?: ST_Percentage;
  custRadScaleInc?: ST_Percentage;
}

export interface CT_Pt {
  prSet?: CT_ElemPropSet;
  spPr?: CT_ShapeProperties;
  t?: CT_TextBody;
  extLst?: CT_OfficeArtExtensionList;
  modelId: ST_ModelId;
  type?: ST_PtType;
  cxnId?: ST_ModelId;
}

export interface CT_PtList {
  pt?: CT_Pt[];
}

export enum ST_CxnType {
  ParOf = "parOf",
  PresOf = "presOf",
  PresParOf = "presParOf",
  UnknownRelationship = "unknownRelationship",
}

export interface CT_Cxn {
  extLst?: CT_OfficeArtExtensionList;
  modelId: ST_ModelId;
  type?: ST_CxnType;
  srcId: ST_ModelId;
  destId: ST_ModelId;
  srcOrd: number; // xsd:unsignedInt
  destOrd: number; // xsd:unsignedInt
  parTransId?: ST_ModelId;
  sibTransId?: ST_ModelId;
  presId?: string;
}

export interface CT_CxnList {
  cxn?: CT_Cxn[];
}

export interface CT_DataModel {
  ptLst: CT_PtList;
  cxnLst?: CT_CxnList;
  bg?: CT_BackgroundFormatting;
  whole?: CT_WholeE2oFormatting;
  extLst?: CT_OfficeArtExtensionList;
}

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

export enum ST_BooleanValue {
  True = "true",
  False = "false",
}

export enum ST_ChildOrderType {
  B = "b",
  T = "t",
}

export interface AG_IteratorAttributes {
  axis?: ST_AxisTypes;
  ptType?: ST_ElementTypes;
  hideLastTrans?: boolean;
  st?: number; // xsd:int
  cnt?: number; // xsd:unsignedInt
  step?: number; // xsd:int
}

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

export enum ST_BoolOperator {
  None = "none",
  Equ = "equ",
  Gte = "gte",
  Lte = "lte",
}

export interface CT_Constraint extends AG_ConstraintAttributes, AG_ConstraintRefAttributes {
  extLst?: CT_OfficeArtExtensionList;
  op?: ST_BoolOperator;
  val?: number; // xsd:double
  fact?: number; // xsd:double
}

export interface CT_Constraints {
  constr?: CT_Constraint[];
}

export interface CT_NumericRule extends AG_ConstraintAttributes {
  extLst?: CT_OfficeArtExtensionList;
  val?: number; // xsd:double
  fact?: number; // xsd:double
  max?: number; // xsd:double
}

export interface CT_Rules {
  rule?: CT_NumericRule[];
}

export interface CT_PresentationOf extends AG_IteratorAttributes {
  extLst?: CT_OfficeArtExtensionList;
}

export enum ST_LayoutShapeType {
  None = "none",
  Conn = "conn",
  // ... other a:ST_ShapeType values
}

export type ST_Index1 = number; // xsd:unsignedInt, minInclusive 1

export interface CT_Adj {
  idx: ST_Index1;
  val: number; // xsd:double
}

export interface CT_AdjLst {
  adj?: CT_Adj[];
}

export interface CT_Shape {
  adjLst?: CT_AdjLst;
  extLst?: CT_OfficeArtExtensionList;
  rot?: number; // xsd:double
  type?: ST_LayoutShapeType;
  blip?: string; // r:blip
  zOrderOff?: number; // xsd:int
  hideGeom?: boolean;
  lkTxEntry?: boolean;
  blipPhldr?: boolean;
}

export enum ST_ParameterId {
  HorzAlign = "horzAlign",
  VertAlign = "vertAlign",
  ChDir = "chDir",
  ChAlign = "chAlign",
  SecChAlign = "secChAlign",
  LinDir = "linDir",
  SecLinDir = "secLinDir",
  StElem = "stElem",
  BendPt = "bendPt",
  ConnRout = "connRout",
  BegSty = "begSty",
  EndSty = "endSty",
  Dim = "dim",
  RotPath = "rotPath",
  CtrShpMap = "ctrShpMap",
  NodeHorzAlign = "nodeHorzAlign",
  NodeVertAlign = "nodeVertAlign",
  Fallback = "fallback",
  TxDir = "txDir",
  PyraAcctPos = "pyraAcctPos",
  PyraAcctTxMar = "pyraAcctTxMar",
  TxBlDir = "txBlDir",
  TxAnchorHorz = "txAnchorHorz",
  TxAnchorVert = "txAnchorVert",
  TxAnchorHorzCh = "txAnchorHorzCh",
  TxAnchorVertCh = "txAnchorVertCh",
  ParTxLTRAlign = "parTxLTRAlign",
  ParTxRTLAlign = "parTxRTLAlign",
  ShpTxLTRAlignCh = "shpTxLTRAlignCh",
  ShpTxRTLAlignCh = "shpTxRTLAlignCh",
  AutoTxRot = "autoTxRot",
  GrDir = "grDir",
  FlowDir = "flowDir",
  ContDir = "contDir",
  Bkpt = "bkpt",
  Off = "off",
  HierAlign = "hierAlign",
  BkPtFixedVal = "bkPtFixedVal",
  StBulletLvl = "stBulletLvl",
  StAng = "stAng",
  SpanAng = "spanAng",
  Ar = "ar",
  LnSpPar = "lnSpPar",
  LnSpAfParP = "lnSpAfParP",
  LnSpCh = "lnSpCh",
  LnSpAfChP = "lnSpAfChP",
  RtShortDist = "rtShortDist",
  AlignTx = "alignTx",
  PyraLvlNode = "pyraLvlNode",
  PyraAcctBkgdNode = "pyraAcctBkgdNode",
  PyraAcctTxNode = "pyraAcctTxNode",
  SrcNode = "srcNode",
  DstNode = "dstNode",
  BegPts = "begPts",
  EndPts = "endPts",
}

export type ST_Ints = number[]; // xsd:int list
export type ST_UnsignedInts = number[]; // xsd:unsignedInt list
export type ST_Booleans = boolean[]; // xsd:boolean list

export type ST_ParameterVal = 
  | ST_DiagramHorizontalAlignment
  | ST_VerticalAlignment
  | ST_ChildDirection
  | ST_ChildAlignment
  | ST_SecondaryChildAlignment
  | ST_LinearDirection
  | ST_SecondaryLinearDirection
  | ST_StartingElement
  | ST_BendPoint
  | ST_ConnectorRouting
  | ST_ArrowheadStyle
  | ST_ConnectorDimension
  | ST_RotationPath
  | ST_CenterShapeMapping
  | ST_NodeHorizontalAlignment
  | ST_NodeVerticalAlignment
  | ST_FallbackDimension
  | ST_TextDirection
  | ST_PyramidAccentPosition
  | ST_PyramidAccentTextMargin
  | ST_TextBlockDirection
  | ST_TextAnchorHorizontal
  | ST_TextAnchorVertical
  | ST_DiagramTextAlignment
  | ST_AutoTextRotation
  | ST_GrowDirection
  | ST_FlowDirection
  | ST_ContinueDirection
  | ST_Breakpoint
  | ST_Offset
  | ST_HierarchyAlignment
  | number // xsd:int
  | number // xsd:double
  | boolean // xsd:boolean
  | string // xsd:string
  | ST_ConnectorPoint;

export interface CT_Parameter {
  type: ST_ParameterId;
  val: ST_ParameterVal;
}

export enum ST_AlgorithmType {
  Composite = "composite",
  Conn = "conn",
  Cycle = "cycle",
  HierChild = "hierChild",
  HierRoot = "hierRoot",
  Pyra = "pyra",
  Lin = "lin",
  Sp = "sp",
  Tx = "tx",
  Snake = "snake",
}

export interface CT_Algorithm {
  param?: CT_Parameter[];
  extLst?: CT_OfficeArtExtensionList;
  type: ST_AlgorithmType;
  rev?: number; // xsd:unsignedInt
}

export interface CT_LayoutNode {
  alg?: CT_Algorithm;
  shape?: CT_Shape;
  presOf?: CT_PresentationOf;
  constrLst?: CT_Constraints;
  ruleLst?: CT_Rules;
  varLst?: CT_LayoutVariablePropertySet;
  forEach?: CT_ForEach;
  layoutNode?: CT_LayoutNode;
  choose?: CT_Choose;
  extLst?: CT_OfficeArtExtensionList;
  name?: string;
  styleLbl?: string;
  chOrder?: ST_ChildOrderType;
  moveWith?: string;
}

export interface CT_ForEach extends AG_IteratorAttributes {
  alg?: CT_Algorithm;
  shape?: CT_Shape;
  presOf?: CT_PresentationOf;
  constrLst?: CT_Constraints;
  ruleLst?: CT_Rules;
  forEach?: CT_ForEach;
  layoutNode?: CT_LayoutNode;
  choose?: CT_Choose;
  extLst?: CT_OfficeArtExtensionList;
  name?: string;
  ref?: string;
}

export enum ST_FunctionType {
  Cnt = "cnt",
  Pos = "pos",
  RevPos = "revPos",
  PosEven = "posEven",
  PosOdd = "posOdd",
  Var = "var",
  Depth = "depth",
  MaxDepth = "maxDepth",
}

export enum ST_FunctionOperator {
  Equ = "equ",
  Neq = "neq",
  Gt = "gt",
  Lt = "lt",
  Gte = "gte",
  Lte = "lte",
}

export type ST_FunctionValue = 
  | number // xsd:int
  | boolean // xsd:boolean
  | ST_Direction
  | ST_HierBranchStyle
  | ST_AnimOneStr
  | ST_AnimLvlStr
  | ST_ResizeHandlesStr;

export interface CT_When extends AG_IteratorAttributes {
  alg?: CT_Algorithm;
  shape?: CT_Shape;
  presOf?: CT_PresentationOf;
  constrLst?: CT_Constraints;
  ruleLst?: CT_Rules;
  forEach?: CT_ForEach;
  layoutNode?: CT_LayoutNode;
  choose?: CT_Choose;
  extLst?: CT_OfficeArtExtensionList;
  name?: string;
  func: ST_FunctionType;
  arg?: ST_FunctionArgument;
  op: ST_FunctionOperator;
  val: ST_FunctionValue;
}

export interface CT_Otherwise {
  alg?: CT_Algorithm;
  shape?: CT_Shape;
  presOf?: CT_PresentationOf;
  constrLst?: CT_Constraints;
  ruleLst?: CT_Rules;
  forEach?: CT_ForEach;
  layoutNode?: CT_LayoutNode;
  choose?: CT_Choose;
  extLst?: CT_OfficeArtExtensionList;
  name?: string;
}

export interface CT_Choose {
  if: CT_When[];
  else?: CT_Otherwise;
  name?: string;
}

export interface CT_SampleData {
  dataModel?: CT_DataModel;
  useDef?: boolean;
}

export interface CT_Category {
  type: string; // xsd:anyURI
  pri: number; // xsd:unsignedInt
}

export interface CT_Categories {
  cat?: CT_Category[];
}

export interface CT_Name {
  lang?: string;
  val: string;
}

export interface CT_Description {
  lang?: string;
  val: string;
}

export interface CT_DiagramDefinition {
  title?: CT_Name[];
  desc?: CT_Description[];
  catLst?: CT_Categories;
  sampData?: CT_SampleData;
  styleData?: CT_SampleData;
  clrData?: CT_SampleData;
  layoutNode: CT_LayoutNode;
  extLst?: CT_OfficeArtExtensionList;
  uniqueId?: string;
  minVer?: string;
  defStyle?: string;
}

export interface CT_DiagramDefinitionHeader {
  title: CT_Name[];
  desc: CT_Description[];
  catLst?: CT_Categories;
  extLst?: CT_OfficeArtExtensionList;
  uniqueId: string;
  minVer?: string;
  resId?: number; // xsd:int
}

export interface CT_DiagramDefinitionHeaderLst {
  layoutDefHdr?: CT_DiagramDefinitionHeader[];
}

export interface CT_RelIds {
  dm: string; // r:dm
  lo: string; // r:lo
  qs: string; // r:qs
  cs: string; // r:cs
}

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

export enum ST_StartingElement {
  Node = "node",
  Trans = "trans",
}

export enum ST_RotationPath {
  None = "none",
  AlongPath = "alongPath",
}

export enum ST_CenterShapeMapping {
  None = "none",
  FNode = "fNode",
}

export enum ST_BendPoint {
  Beg = "beg",
  Def = "def",
  End = "end",
}

export enum ST_ConnectorRouting {
  Stra = "stra",
  Bend = "bend",
  Curve = "curve",
  LongCurve = "longCurve",
}

export enum ST_ArrowheadStyle {
  Auto = "auto",
  Arr = "arr",
  NoArr = "noArr",
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

export enum ST_FallbackDimension {
  OneD = "1D",
  TwoD = "2D",
}

export enum ST_TextDirection {
  FromT = "fromT",
  FromB = "fromB",
}

export enum ST_PyramidAccentPosition {
  Bef = "bef",
  Aft = "aft",
}

export enum ST_PyramidAccentTextMargin {
  Step = "step",
  Stack = "stack",
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

export enum ST_Direction {
  Norm = "norm",
  Rev = "rev",
}

export enum ST_HierBranchStyle {
  L = "l",
  R = "r",
  Hang = "hang",
  Std = "std",
  Init = "init",
}

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

export interface CT_OrgChart {
  val?: boolean;
}

export type ST_NodeCount = number; // xsd:int, minInclusive -1

export interface CT_ChildMax {
  val?: ST_NodeCount;
}

export interface CT_ChildPref {
  val?: ST_NodeCount;
}

export interface CT_BulletEnabled {
  val?: boolean;
}

export interface CT_Direction {
  val?: ST_Direction;
}

export interface CT_HierBranchStyle {
  val?: ST_HierBranchStyle;
}

export interface CT_AnimOne {
  val?: ST_AnimOneStr;
}

export interface CT_AnimLvl {
  val?: ST_AnimLvlStr;
}

export interface CT_ResizeHandles {
  val?: ST_ResizeHandlesStr;
}

export interface CT_LayoutVariablePropertySet {
  orgChart?: CT_OrgChart;
  chMax?: CT_ChildMax;
  chPref?: CT_ChildPref;
  bulletEnabled?: CT_BulletEnabled;
  dir?: CT_Direction;
  hierBranch?: CT_HierBranchStyle;
  animOne?: CT_AnimOne;
  animLvl?: CT_AnimLvl;
  resizeHandles?: CT_ResizeHandles;
}

export type ST_FunctionArgument = ST_VariableType;

export enum ST_VariableType {
  None = "none",
  OrgChart = "orgChart",
  ChMax = "chMax",
  ChPref = "chPref",
  BulEnabled = "bulEnabled",
  Dir = "dir",
  HierBranch = "hierBranch",
  AnimOne = "animOne",
  AnimLvl = "animLvl",
  ResizeHandles = "resizeHandles",
}

export enum ST_OutputShapeType {
  None = "none",
  Conn = "conn",
}
