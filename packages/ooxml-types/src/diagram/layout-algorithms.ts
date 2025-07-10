// layout-algorithms.ts - Layout algorithm types for diagrams
import type { CT_OfficeArtExtensionList } from '../dml-main';
import type { 
  ST_DiagramHorizontalAlignment,
  ST_VerticalAlignment,
  ST_ChildDirection,
  ST_ChildAlignment,
  ST_SecondaryChildAlignment,
  ST_LinearDirection,
  ST_SecondaryLinearDirection,
  ST_StartingElement,
  ST_BendPoint,
  ST_ConnectorRouting,
  ST_ArrowheadStyle,
  ST_ConnectorDimension,
  ST_RotationPath,
  ST_CenterShapeMapping,
  ST_NodeHorizontalAlignment,
  ST_NodeVerticalAlignment,
  ST_FallbackDimension,
  ST_TextDirection,
  ST_PyramidAccentPosition,
  ST_PyramidAccentTextMargin,
  ST_TextBlockDirection,
  ST_TextAnchorHorizontal,
  ST_TextAnchorVertical,
  ST_DiagramTextAlignment,
  ST_AutoTextRotation,
  ST_GrowDirection,
  ST_FlowDirection,
  ST_ContinueDirection,
  ST_Breakpoint,
  ST_Offset,
  ST_HierarchyAlignment,
  ST_ConnectorPoint,
  ST_Direction,
  ST_HierBranchStyle,
  ST_AnimOneStr,
  ST_AnimLvlStr,
  ST_ResizeHandlesStr
} from './layout-enums';

// Algorithm types
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

// Parameter ID
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

// Parameter value types
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

// Parameter
export interface CT_Parameter {
  type: ST_ParameterId;
  val: ST_ParameterVal;
}

// Algorithm
export interface CT_Algorithm {
  param?: CT_Parameter[];
  extLst?: CT_OfficeArtExtensionList;
  type: ST_AlgorithmType;
  rev?: number; // xsd:unsignedInt
}

// Function types
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

// Variable type
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

export type ST_FunctionArgument = ST_VariableType;