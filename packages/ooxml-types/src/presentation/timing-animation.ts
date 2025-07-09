// timing-animation.ts - Timing and animation-related types for presentations
import type { ST_PositivePercentage, ST_Percentage, ST_PositiveFixedPercentage, ST_FixedPercentage } from '../shared-types';
import type { CT_EmbeddedWAVAudioFile, CT_AnimationElementChoice, CT_AnimationGraphicalObjectBuildProperties, ST_Angle, CT_Color, CT_Point2D } from '../dml-main';
import type { CT_Empty } from './common';
import type { CT_ExtensionListModify } from './transitions';

export type ST_TLTimeIndefinite = "indefinite";
export type ST_TLTime = number | ST_TLTimeIndefinite;
export type ST_TLTimeNodeID = number; // xsd:unsignedInt

export interface CT_TLIterateIntervalTime {
  val: ST_TLTime;
}

export interface CT_TLIterateIntervalPercentage {
  val: ST_PositivePercentage;
}

export enum ST_IterateType {
  El = "el",
  Wd = "wd",
  Lt = "lt",
}

export interface CT_TLIterateData {
  tmAbs?: CT_TLIterateIntervalTime;
  tmPct?: CT_TLIterateIntervalPercentage;
  type?: ST_IterateType;
  backwards?: boolean;
}

export interface CT_TLSubShapeId {
  spid: string; // a:ST_ShapeID
}

export interface CT_IndexRange {
  st: number; // ST_Index
  end: number; // ST_Index
}

export enum ST_TLChartSubelementType {
  GridLegend = "gridLegend",
  Series = "series",
  Category = "category",
  PtInSeries = "ptInSeries",
  PtInCategory = "ptInCategory",
}

export interface CT_TLOleChartTargetElement {
  type: ST_TLChartSubelementType;
  lvl?: number; // xsd:unsignedInt
}

export interface CT_TLTextTargetElement {
  charRg?: CT_IndexRange;
  pRg?: CT_IndexRange;
}

export interface CT_TLShapeTargetElement {
  bg?: CT_Empty;
  subSp?: CT_TLSubShapeId;
  oleChartEl?: CT_TLOleChartTargetElement;
  txEl?: CT_TLTextTargetElement;
  graphicEl?: CT_AnimationElementChoice;
  spid: number; // a:ST_DrawingElementId
}

export interface CT_TLTimeTargetElement {
  sldTgt?: CT_Empty;
  sndTgt?: CT_EmbeddedWAVAudioFile;
  spTgt?: CT_TLShapeTargetElement;
  inkTgt?: CT_TLSubShapeId;
}

export interface CT_TLTriggerTimeNodeID {
  val: ST_TLTimeNodeID;
}

export enum ST_TLTriggerRuntimeNode {
  First = "first",
  Last = "last",
  All = "all",
}

export interface CT_TLTriggerRuntimeNode {
  val: ST_TLTriggerRuntimeNode;
}

export enum ST_TLTriggerEvent {
  OnBegin = "onBegin",
  OnEnd = "onEnd",
  Begin = "begin",
  End = "end",
  OnClick = "onClick",
  OnDblClick = "onDblClick",
  OnMouseOver = "onMouseOver",
  OnMouseOut = "onMouseOut",
  OnNext = "onNext",
  OnPrev = "onPrev",
  OnStopAudio = "onStopAudio",
}

export interface CT_TLTimeCondition {
  tgtEl?: CT_TLTimeTargetElement;
  tn?: CT_TLTriggerTimeNodeID;
  rtn?: CT_TLTriggerRuntimeNode;
  evt?: ST_TLTriggerEvent;
  delay?: ST_TLTime;
}

export interface CT_TLTimeConditionList {
  cond: CT_TLTimeCondition[];
}

export enum ST_TLTimeNodePresetClassType {
  Entr = "entr",
  Exit = "exit",
  Emph = "emph",
  Path = "path",
  Verb = "verb",
  Mediacall = "mediacall",
}

export enum ST_TLTimeNodeRestartType {
  Always = "always",
  WhenNotActive = "whenNotActive",
  Never = "never",
}

export enum ST_TLTimeNodeFillType {
  Remove = "remove",
  Freeze = "freeze",
  Hold = "hold",
  Transition = "transition",
}

export enum ST_TLTimeNodeSyncType {
  CanSlip = "canSlip",
  Locked = "locked",
}

export enum ST_TLTimeNodeMasterRelation {
  SameClick = "sameClick",
  LastClick = "lastClick",
  NextClick = "nextClick",
}

export enum ST_TLTimeNodeType {
  ClickEffect = "clickEffect",
  WithEffect = "withEffect",
  AfterEffect = "afterEffect",
  MainSeq = "mainSeq",
  InteractiveSeq = "interactiveSeq",
  ClickPar = "clickPar",
  WithGroup = "withGroup",
  AfterGroup = "afterGroup",
  TmRoot = "tmRoot",
}

export interface CT_TLCommonTimeNodeData {
  stCondLst?: CT_TLTimeConditionList;
  endCondLst?: CT_TLTimeConditionList;
  endSync?: CT_TLTimeCondition;
  iterate?: CT_TLIterateData;
  childTnLst?: CT_TimeNodeList;
  subTnLst?: CT_TimeNodeList;
  id?: ST_TLTimeNodeID;
  presetID?: number; // xsd:int
  presetClass?: ST_TLTimeNodePresetClassType;
  presetSubtype?: number; // xsd:int
  dur?: ST_TLTime;
  repeatCount?: ST_TLTime;
  repeatDur?: ST_TLTime;
  spd?: ST_Percentage;
  accel?: ST_PositiveFixedPercentage;
  decel?: ST_PositiveFixedPercentage;
  autoRev?: boolean;
  restart?: ST_TLTimeNodeRestartType;
  fill?: ST_TLTimeNodeFillType;
  syncBehavior?: ST_TLTimeNodeSyncType;
  tmFilter?: string;
  evtFilter?: string;
  display?: boolean;
  masterRel?: ST_TLTimeNodeMasterRelation;
  bldLvl?: number; // xsd:int
  grpId?: number; // xsd:unsignedInt
  afterEffect?: boolean;
  nodeType?: ST_TLTimeNodeType;
  nodePh?: boolean;
}

export interface CT_TimeNodeList {
  timeNodes: (
    | { par: CT_TLTimeNodeParallel }
    | { seq: CT_TLTimeNodeSequence }
    | { excl: CT_TLTimeNodeExclusive }
    | { anim: CT_TLAnimateBehavior }
    | { animClr: CT_TLAnimateColorBehavior }
    | { animEffect: CT_TLAnimateEffectBehavior }
    | { animMotion: CT_TLAnimateMotionBehavior }
    | { animRot: CT_TLAnimateRotationBehavior }
    | { animScale: CT_TLAnimateScaleBehavior }
    | { cmd: CT_TLCommandBehavior }
    | { set: CT_TLSetBehavior }
    | { audio: CT_TLMediaNodeAudio }
    | { video: CT_TLMediaNodeVideo }
  )[];
}

export interface CT_TLTimeNodeParallel {
  cTn: CT_TLCommonTimeNodeData;
}

export enum ST_TLNextActionType {
  None = "none",
  Seek = "seek",
}

export enum ST_TLPreviousActionType {
  None = "none",
  SkipTimed = "skipTimed",
}

export interface CT_TLTimeNodeSequence {
  cTn: CT_TLCommonTimeNodeData;
  prevCondLst?: CT_TLTimeConditionList;
  nextCondLst?: CT_TLTimeConditionList;
  concurrent?: boolean;
  prevAc?: ST_TLPreviousActionType;
  nextAc?: ST_TLNextActionType;
}

export interface CT_TLTimeNodeExclusive {
  cTn: CT_TLCommonTimeNodeData;
}

export interface CT_TLBehaviorAttributeNameList {
  attrName: string[];
}

export enum ST_TLBehaviorAdditiveType {
  Base = "base",
  Sum = "sum",
  Repl = "repl",
  Mult = "mult",
  None = "none",
}

export enum ST_TLBehaviorAccumulateType {
  None = "none",
  Always = "always",
}

export enum ST_TLBehaviorTransformType {
  Pt = "pt",
  Img = "img",
}

export enum ST_TLBehaviorOverrideType {
  Normal = "normal",
  ChildStyle = "childStyle",
}

export interface CT_TLCommonBehaviorData {
  cTn: CT_TLCommonTimeNodeData;
  tgtEl: CT_TLTimeTargetElement;
  attrNameLst?: CT_TLBehaviorAttributeNameList;
  additive?: ST_TLBehaviorAdditiveType;
  accumulate?: ST_TLBehaviorAccumulateType;
  xfrmType?: ST_TLBehaviorTransformType;
  from?: string;
  to?: string;
  by?: string;
  rctx?: string;
  override?: ST_TLBehaviorOverrideType;
}

export interface CT_TLAnimVariantBooleanVal {
  val: boolean;
}

export interface CT_TLAnimVariantIntegerVal {
  val: number; // xsd:int
}

export interface CT_TLAnimVariantFloatVal {
  val: number; // xsd:float
}

export interface CT_TLAnimVariantStringVal {
  val: string;
}

export interface CT_TLAnimVariant {
  val: (
    | { boolVal: CT_TLAnimVariantBooleanVal }
    | { intVal: CT_TLAnimVariantIntegerVal }
    | { fltVal: CT_TLAnimVariantFloatVal }
    | { strVal: CT_TLAnimVariantStringVal }
    | { clrVal: CT_Color }
  );
}

export type ST_TLTimeAnimateValueTime = ST_PositiveFixedPercentage | ST_TLTimeIndefinite;

export interface CT_TLTimeAnimateValue {
  val?: CT_TLAnimVariant;
  tm?: ST_TLTimeAnimateValueTime;
  fmla?: string;
}

export interface CT_TLTimeAnimateValueList {
  tav?: CT_TLTimeAnimateValue[];
}

export enum ST_TLAnimateBehaviorCalcMode {
  Discrete = "discrete",
  Lin = "lin",
  Fmla = "fmla",
}

export enum ST_TLAnimateBehaviorValueType {
  Str = "str",
  Num = "num",
  Clr = "clr",
}

export interface CT_TLAnimateBehavior {
  cBhvr: CT_TLCommonBehaviorData;
  tavLst?: CT_TLTimeAnimateValueList;
  by?: string;
  from?: string;
  to?: string;
  calcmode?: ST_TLAnimateBehaviorCalcMode;
  valueType?: ST_TLAnimateBehaviorValueType;
}

export interface CT_TLByRgbColorTransform {
  r: ST_FixedPercentage;
  g: ST_FixedPercentage;
  b: ST_FixedPercentage;
}

export interface CT_TLByHslColorTransform {
  h: ST_Angle;
  s: ST_FixedPercentage;
  l: ST_FixedPercentage;
}

export interface CT_TLByAnimateColorTransform {
  rgb?: CT_TLByRgbColorTransform;
  hsl?: CT_TLByHslColorTransform;
}

export enum ST_TLAnimateColorSpace {
  Rgb = "rgb",
  Hsl = "hsl",
}

export enum ST_TLAnimateColorDirection {
  Cw = "cw",
  Ccw = "ccw",
}

export interface CT_TLAnimateColorBehavior {
  cBhvr: CT_TLCommonBehaviorData;
  by?: CT_TLByAnimateColorTransform;
  from?: CT_Color;
  to?: CT_Color;
  clrSpc?: ST_TLAnimateColorSpace;
  dir?: ST_TLAnimateColorDirection;
}

export enum ST_TLAnimateEffectTransition {
  In = "in",
  Out = "out",
  None = "none",
}

export interface CT_TLAnimateEffectBehavior {
  cBhvr: CT_TLCommonBehaviorData;
  progress?: CT_TLAnimVariant;
  transition?: ST_TLAnimateEffectTransition;
  filter?: string;
  prLst?: string;
}

export enum ST_TLAnimateMotionBehaviorOrigin {
  Parent = "parent",
  Layout = "layout",
}

export enum ST_TLAnimateMotionPathEditMode {
  Relative = "relative",
  Fixed = "fixed",
}

export interface CT_TLPoint {
  x: ST_Percentage;
  y: ST_Percentage;
}

export interface CT_TLAnimateMotionBehavior {
  cBhvr: CT_TLCommonBehaviorData;
  by?: CT_TLPoint;
  from?: CT_TLPoint;
  to?: CT_TLPoint;
  rCtr?: CT_TLPoint;
  origin?: ST_TLAnimateMotionBehaviorOrigin;
  path?: string;
  pathEditMode?: ST_TLAnimateMotionPathEditMode;
  rAng?: ST_Angle;
  ptsTypes?: string;
}

export interface CT_TLAnimateRotationBehavior {
  cBhvr: CT_TLCommonBehaviorData;
  by?: ST_Angle;
  from?: ST_Angle;
  to?: ST_Angle;
}

export interface CT_TLAnimateScaleBehavior {
  cBhvr: CT_TLCommonBehaviorData;
  by?: CT_TLPoint;
  from?: CT_TLPoint;
  to?: CT_TLPoint;
  zoomContents?: boolean;
}

export enum ST_TLCommandType {
  Evt = "evt",
  Call = "call",
  Verb = "verb",
}

export interface CT_TLCommandBehavior {
  cBhvr: CT_TLCommonBehaviorData;
  type?: ST_TLCommandType;
  cmd?: string;
}

export interface CT_TLSetBehavior {
  cBhvr: CT_TLCommonBehaviorData;
  to?: CT_TLAnimVariant;
}

export interface CT_TLCommonMediaNodeData {
  cTn: CT_TLCommonTimeNodeData;
  tgtEl: CT_TLTimeTargetElement;
  vol?: ST_PositiveFixedPercentage;
  mute?: boolean;
  numSld?: number; // xsd:unsignedInt
  showWhenStopped?: boolean;
}

export interface CT_TLMediaNodeAudio {
  cMediaNode: CT_TLCommonMediaNodeData;
  isNarration?: boolean;
}

export interface CT_TLMediaNodeVideo {
  cMediaNode: CT_TLCommonMediaNodeData;
  fullScrn?: boolean;
}

export interface AG_TLBuild {
  spid: number; // a:ST_DrawingElementId
  grpId: number; // xsd:unsignedInt
  uiExpand?: boolean;
}

export interface CT_TLTemplate {
  tnLst: CT_TimeNodeList;
  lvl?: number; // xsd:unsignedInt
}

export interface CT_TLTemplateList {
  tmpl?: CT_TLTemplate[];
}

export enum ST_TLParaBuildType {
  AllAtOnce = "allAtOnce",
  P = "p",
  Cust = "cust",
  Whole = "whole",
}

export interface CT_TLBuildParagraph extends AG_TLBuild {
  tmplLst?: CT_TLTemplateList;
  build?: ST_TLParaBuildType;
  bldLvl?: number; // xsd:unsignedInt
  animBg?: boolean;
  autoUpdateAnimBg?: boolean;
  rev?: boolean;
  advAuto?: ST_TLTime;
}

export enum ST_TLDiagramBuildType {
  Whole = "whole",
  DepthByNode = "depthByNode",
  DepthByBranch = "depthByBranch",
  BreadthByNode = "breadthByNode",
  BreadthByLvl = "breadthByLvl",
  Cw = "cw",
  CwIn = "cwIn",
  CwOut = "cwOut",
  Ccw = "ccw",
  CcwIn = "ccwIn",
  CcwOut = "ccwOut",
  InByRing = "inByRing",
  OutByRing = "outByRing",
  Up = "up",
  Down = "down",
  AllAtOnce = "allAtOnce",
  Cust = "cust",
}

export interface CT_TLBuildDiagram extends AG_TLBuild {
  bld?: ST_TLDiagramBuildType;
}

export enum ST_TLOleChartBuildType {
  AllAtOnce = "allAtOnce",
  Series = "series",
  Category = "category",
  SeriesEl = "seriesEl",
  CategoryEl = "categoryEl",
}

export interface CT_TLOleBuildChart extends AG_TLBuild {
  bld?: ST_TLOleChartBuildType;
  animBg?: boolean;
}

export interface CT_TLGraphicalObjectBuild extends AG_TLBuild {
  bldAsOne?: CT_Empty;
  bldSub?: CT_AnimationGraphicalObjectBuildProperties;
}

export interface CT_BuildList {
  builds: (
    | { bldP: CT_TLBuildParagraph }
    | { bldDgm: CT_TLBuildDiagram }
    | { bldOleChart: CT_TLOleBuildChart }
    | { bldGraphic: CT_TLGraphicalObjectBuild }
  )[];
}

export interface CT_SlideTiming {
  tnLst?: CT_TimeNodeList;
  bldLst?: CT_BuildList;
  extLst?: CT_ExtensionListModify;
}