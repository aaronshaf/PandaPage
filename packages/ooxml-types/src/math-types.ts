// math-types.ts
import type { ST_OnOff, ST_String, ST_TwipsMeasure, ST_XAlign, ST_YAlign } from "./shared-types";
import type { CT_OnOff, CT_String } from "./wml/basic-types";

// Re-export common types for backward compatibility
export type { CT_OnOff, CT_String } from "./wml/basic-types";
export type { CT_Text } from "./wml/run-types";

export type ST_Integer255 = number; // xsd:integer, minInclusive 1, maxInclusive 255
export interface CT_Integer255 {
  val: ST_Integer255;
}

export type ST_Integer2 = number; // xsd:integer, minInclusive -2, maxInclusive 2
export interface CT_Integer2 {
  val: ST_Integer2;
}

export type ST_SpacingRule = number; // xsd:integer, minInclusive 0, maxInclusive 4
export interface CT_SpacingRule {
  val: ST_SpacingRule;
}

export type ST_UnSignedInteger = number; // xsd:unsignedInt
export interface CT_UnSignedInteger {
  val: ST_UnSignedInteger;
}

export type ST_Char = string; // xsd:string, maxLength 1
export interface CT_Char {
  val: ST_Char;
}

export interface CT_XAlign {
  val: ST_XAlign;
}

export interface CT_YAlign {
  val: ST_YAlign;
}

export interface CT_TwipsMeasure {
  val: ST_TwipsMeasure;
}

export enum ST_Shp {
  Centered = "centered",
  Match = "match",
}
export interface CT_Shp {
  val: ST_Shp;
}

export enum ST_FType {
  Bar = "bar",
  Skw = "skw",
  Lin = "lin",
  NoBar = "noBar",
}
export interface CT_FType {
  val: ST_FType;
}

export enum ST_LimLoc {
  UndOvr = "undOvr",
  SubSup = "subSup",
}
export interface CT_LimLoc {
  val: ST_LimLoc;
}

export enum ST_TopBot {
  Top = "top",
  Bot = "bot",
}
export interface CT_TopBot {
  val: ST_TopBot;
}

export enum ST_Script {
  Roman = "roman",
  Script = "script",
  Fraktur = "fraktur",
  DoubleStruck = "double-struck",
  SansSerif = "sans-serif",
  Monospace = "monospace",
}
export interface CT_Script {
  val?: ST_Script;
}

export enum ST_Style {
  P = "p",
  B = "b",
  I = "i",
  Bi = "bi",
}
export interface CT_Style {
  val?: ST_Style;
}

export interface CT_ManualBreak {
  alnAt?: ST_Integer255;
}

export interface CT_RPR {
  lit?: CT_OnOff;
  nor?: CT_OnOff;
  scr?: CT_Script;
  sty?: CT_Style;
  brk?: CT_ManualBreak;
  aln?: CT_OnOff;
}

export interface CT_R {
  rPr?: CT_RPR;
  // EG_RPr and EG_RunInnerContent are complex, will represent as any for now
  content?: any[];
}

export interface CT_CtrlPr {
  // EG_RPrMath is complex, will represent as any for now
  rPrMath?: any;
}

export interface CT_AccPr {
  chr?: CT_Char;
  ctrlPr?: CT_CtrlPr;
}

export interface CT_Acc {
  accPr?: CT_AccPr;
  e: CT_OMathArg;
}

export interface CT_BarPr {
  pos?: CT_TopBot;
  ctrlPr?: CT_CtrlPr;
}

export interface CT_Bar {
  barPr?: CT_BarPr;
  e: CT_OMathArg;
}

export interface CT_BoxPr {
  opEmu?: CT_OnOff;
  noBreak?: CT_OnOff;
  diff?: CT_OnOff;
  brk?: CT_ManualBreak;
  aln?: CT_OnOff;
  ctrlPr?: CT_CtrlPr;
}

export interface CT_Box {
  boxPr?: CT_BoxPr;
  e: CT_OMathArg;
}

export interface CT_BorderBoxPr {
  hideTop?: CT_OnOff;
  hideBot?: CT_OnOff;
  hideLeft?: CT_OnOff;
  hideRight?: CT_OnOff;
  strikeH?: CT_OnOff;
  strikeV?: CT_OnOff;
  strikeBLTR?: CT_OnOff;
  strikeTLBR?: CT_OnOff;
  ctrlPr?: CT_CtrlPr;
}

export interface CT_BorderBox {
  borderBoxPr?: CT_BorderBoxPr;
  e: CT_OMathArg;
}

export interface CT_DPr {
  begChr?: CT_Char;
  sepChr?: CT_Char;
  endChr?: CT_Char;
  grow?: CT_OnOff;
  shp?: CT_Shp;
  ctrlPr?: CT_CtrlPr;
}

export interface CT_D {
  dPr?: CT_DPr;
  e: CT_OMathArg[];
}

export interface CT_EqArrPr {
  baseJc?: CT_YAlign;
  maxDist?: CT_OnOff;
  objDist?: CT_OnOff;
  rSpRule?: CT_SpacingRule;
  rSp?: CT_UnSignedInteger;
  ctrlPr?: CT_CtrlPr;
}

export interface CT_EqArr {
  eqArrPr?: CT_EqArrPr;
  e: CT_OMathArg[];
}

export interface CT_FPr {
  type?: CT_FType;
  ctrlPr?: CT_CtrlPr;
}

export interface CT_F {
  fPr?: CT_FPr;
  num: CT_OMathArg;
  den: CT_OMathArg;
}

export interface CT_FuncPr {
  ctrlPr?: CT_CtrlPr;
}

export interface CT_Func {
  funcPr?: CT_FuncPr;
  fName: CT_OMathArg;
  e: CT_OMathArg;
}

export interface CT_GroupChrPr {
  chr?: CT_Char;
  pos?: CT_TopBot;
  vertJc?: CT_TopBot;
  ctrlPr?: CT_CtrlPr;
}

export interface CT_GroupChr {
  groupChrPr?: CT_GroupChrPr;
  e: CT_OMathArg;
}

export interface CT_LimLowPr {
  ctrlPr?: CT_CtrlPr;
}

export interface CT_LimLow {
  limLowPr?: CT_LimLowPr;
  e: CT_OMathArg;
  lim: CT_OMathArg;
}

export interface CT_LimUppPr {
  ctrlPr?: CT_CtrlPr;
}

export interface CT_LimUpp {
  limUppPr?: CT_LimUppPr;
  e: CT_OMathArg;
  lim: CT_OMathArg;
}

export interface CT_MCPr {
  count?: CT_Integer255;
  mcJc?: CT_XAlign;
}

export interface CT_MC {
  mcPr?: CT_MCPr;
}

export interface CT_MCS {
  mc: CT_MC[];
}

export interface CT_MPr {
  baseJc?: CT_YAlign;
  plcHide?: CT_OnOff;
  rSpRule?: CT_SpacingRule;
  cGpRule?: CT_SpacingRule;
  rSp?: CT_UnSignedInteger;
  cSp?: CT_UnSignedInteger;
  cGp?: CT_UnSignedInteger;
  mcs?: CT_MCS;
  ctrlPr?: CT_CtrlPr;
}

export interface CT_MR {
  e: CT_OMathArg[];
}

export interface CT_M {
  mPr?: CT_MPr;
  mr: CT_MR[];
}

export interface CT_NaryPr {
  chr?: CT_Char;
  limLoc?: CT_LimLoc;
  grow?: CT_OnOff;
  subHide?: CT_OnOff;
  supHide?: CT_OnOff;
  ctrlPr?: CT_CtrlPr;
}

export interface CT_Nary {
  naryPr?: CT_NaryPr;
  sub: CT_OMathArg;
  sup: CT_OMathArg;
  e: CT_OMathArg;
}

export interface CT_PhantPr {
  show?: CT_OnOff;
  zeroWid?: CT_OnOff;
  zeroAsc?: CT_OnOff;
  zeroDesc?: CT_OnOff;
  transp?: CT_OnOff;
  ctrlPr?: CT_CtrlPr;
}

export interface CT_Phant {
  phantPr?: CT_PhantPr;
  e: CT_OMathArg;
}

export interface CT_RadPr {
  degHide?: CT_OnOff;
  ctrlPr?: CT_CtrlPr;
}

export interface CT_Rad {
  radPr?: CT_RadPr;
  deg: CT_OMathArg;
  e: CT_OMathArg;
}

export interface CT_SPrePr {
  ctrlPr?: CT_CtrlPr;
}

export interface CT_SPre {
  sPrePr?: CT_SPrePr;
  sub: CT_OMathArg;
  sup: CT_OMathArg;
  e: CT_OMathArg;
}

export interface CT_SSubPr {
  ctrlPr?: CT_CtrlPr;
}

export interface CT_SSub {
  sSubPr?: CT_SSubPr;
  e: CT_OMathArg;
  sub: CT_OMathArg;
}

export interface CT_SSubSupPr {
  alnScr?: CT_OnOff;
  ctrlPr?: CT_CtrlPr;
}

export interface CT_SSubSup {
  sSubSupPr?: CT_SSubSupPr;
  e: CT_OMathArg;
  sub: CT_OMathArg;
  sup: CT_OMathArg;
}

export interface CT_SSupPr {
  ctrlPr?: CT_CtrlPr;
}

export interface CT_SSup {
  sSupPr?: CT_SSupPr;
  e: CT_OMathArg;
  sup: CT_OMathArg;
}

export type EG_OMathMathElements =
  | { acc: CT_Acc }
  | { bar: CT_Bar }
  | { box: CT_Box }
  | { borderBox: CT_BorderBox }
  | { d: CT_D }
  | { eqArr: CT_EqArr }
  | { f: CT_F }
  | { func: CT_Func }
  | { groupChr: CT_GroupChr }
  | { limLow: CT_LimLow }
  | { limUpp: CT_LimUpp }
  | { m: CT_M }
  | { nary: CT_Nary }
  | { phant: CT_Phant }
  | { rad: CT_Rad }
  | { sPre: CT_SPre }
  | { sSub: CT_SSub }
  | { sSubSup: CT_SSubSup }
  | { sSup: CT_SSup }
  | { r: CT_R };

export type EG_OMathElements = EG_OMathMathElements | { pContentMath: any }; // w:EG_PContentMath is complex, represent as any for now

export interface CT_OMathArgPr {
  argSz?: CT_Integer2;
}

export interface CT_OMathArg {
  argPr?: CT_OMathArgPr;
  content?: EG_OMathElements[];
  ctrlPr?: CT_CtrlPr;
}

export enum ST_Jc {
  Left = "left",
  Right = "right",
  Center = "center",
  CenterGroup = "centerGroup",
}
export interface CT_OMathJc {
  val?: ST_Jc;
}

export interface CT_OMathParaPr {
  jc?: CT_OMathJc;
}

export enum ST_BreakBin {
  Before = "before",
  After = "after",
  Repeat = "repeat",
}
export interface CT_BreakBin {
  val?: ST_BreakBin;
}

export enum ST_BreakBinSub {
  MinusMinus = "--",
  MinusPlus = "-+",
  PlusMinus = "+-",
}
export interface CT_BreakBinSub {
  val?: ST_BreakBinSub;
}

export interface CT_MathPr {
  mathFont?: CT_String;
  brkBin?: CT_BreakBin;
  brkBinSub?: CT_BreakBinSub;
  smallFrac?: CT_OnOff;
  dispDef?: CT_OnOff;
  lMargin?: CT_TwipsMeasure;
  rMargin?: CT_TwipsMeasure;
  defJc?: CT_OMathJc;
  preSp?: CT_TwipsMeasure;
  postSp?: CT_TwipsMeasure;
  interSp?: CT_TwipsMeasure;
  intraSp?: CT_TwipsMeasure;
  wrapIndent?: CT_TwipsMeasure;
  wrapRight?: CT_OnOff;
  intLim?: CT_LimLoc;
  naryLim?: CT_LimLoc;
}

export interface CT_OMathPara {
  oMathParaPr?: CT_OMathParaPr;
  oMath: CT_OMath[];
}

export interface CT_OMath {
  content?: EG_OMathElements[];
}
