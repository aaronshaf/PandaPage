// presentation-types.ts
import type { ST_Coordinate, CT_PositiveSize2D, CT_EmbeddedWAVAudioFile, CT_OfficeArtExtensionList, CT_Percentage, CT_PositiveFixedPercentage, ST_Angle, CT_Color, CT_Point2D, CT_TextListStyle, CT_TextFont, CT_NonVisualDrawingProps, CT_NonVisualDrawingShapeProps, CT_ShapeProperties, CT_ShapeStyle, CT_TextBody, CT_NonVisualConnectorProperties, CT_BlipFillProperties, CT_NonVisualGraphicFrameProperties, CT_GraphicalObject, CT_Transform2D, ST_BlackWhiteMode, CT_NonVisualGroupDrawingShapeProps, CT_GroupShapeProperties, CT_BackgroundFormatting, CT_WholeE2oFormatting, EG_Media } from './dml-main';
import type { ST_RelationshipId, ST_Guid } from './shared-types';
import type { CT_Picture } from './picture-types';
import type { EG_BlockLevelElts } from './wml';

export enum ST_TransitionSideDirectionType {
  L = "l",
  U = "u",
  R = "r",
  D = "d",
}

export enum ST_TransitionCornerDirectionType {
  Lu = "lu",
  Ru = "ru",
  Ld = "ld",
  Rd = "rd",
}

export enum ST_TransitionInOutDirectionType {
  Out = "out",
  In = "in",
}

export interface CT_SideDirectionTransition {
  dir?: ST_TransitionSideDirectionType;
}

export interface CT_CornerDirectionTransition {
  dir?: ST_TransitionCornerDirectionType;
}

export type ST_TransitionEightDirectionType = ST_TransitionSideDirectionType | ST_TransitionCornerDirectionType;

export interface CT_EightDirectionTransition {
  dir?: ST_TransitionEightDirectionType;
}

export enum ST_Direction {
  Horz = "horz",
  Vert = "vert",
}

export interface CT_OrientationTransition {
  dir?: ST_Direction;
}

export interface CT_InOutTransition {
  dir?: ST_TransitionInOutDirectionType;
}

export interface CT_OptionalBlackTransition {
  thruBlk?: boolean;
}

export interface CT_SplitTransition {
  orient?: ST_Direction;
  dir?: ST_TransitionInOutDirectionType;
}

export interface CT_WheelTransition {
  spokes?: number; // xsd:unsignedInt
}

export interface CT_TransitionStartSoundAction {
  snd: CT_EmbeddedWAVAudioFile;
  loop?: boolean;
}

export interface CT_Empty {}

export interface CT_TransitionSoundAction {
  stSnd?: CT_TransitionStartSoundAction;
  endSnd?: CT_Empty;
}

export enum ST_TransitionSpeed {
  Slow = "slow",
  Med = "med",
  Fast = "fast",
}

export interface CT_ExtensionListModify {
  ext?: CT_OfficeArtExtensionList;
  mod?: boolean;
}

export interface CT_SlideTransition {
  blinds?: CT_OrientationTransition;
  checker?: CT_OrientationTransition;
  circle?: CT_Empty;
  dissolve?: CT_Empty;
  comb?: CT_OrientationTransition;
  cover?: CT_EightDirectionTransition;
  cut?: CT_OptionalBlackTransition;
  diamond?: CT_Empty;
  fade?: CT_OptionalBlackTransition;
  newsflash?: CT_Empty;
  plus?: CT_Empty;
  pull?: CT_EightDirectionTransition;
  push?: CT_SideDirectionTransition;
  random?: CT_Empty;
  randomBar?: CT_OrientationTransition;
  split?: CT_SplitTransition;
  strips?: CT_CornerDirectionTransition;
  wedge?: CT_Empty;
  wheel?: CT_WheelTransition;
  wipe?: CT_SideDirectionTransition;
  zoom?: CT_InOutTransition;
  sndAc?: CT_TransitionSoundAction;
  extLst?: CT_ExtensionListModify;
  spd?: ST_TransitionSpeed;
  advClick?: boolean;
  advTm?: number; // xsd:unsignedInt
}

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

export type ST_Name = string;
export type ST_Index = number; // xsd:unsignedInt

export interface CT_SlideRelationshipListEntry {
  id: ST_RelationshipId;
}

export interface CT_SlideRelationshipList {
  sld?: CT_SlideRelationshipListEntry[];
}

export interface CT_CustomShowId {
  id: number; // xsd:unsignedInt
}

export type EG_SlideListChoice = 
  | { sldAll: CT_Empty }
  | { sldRg: CT_IndexRange }
  | { custShow: CT_CustomShowId };

export interface CT_CustomerData {
  id: ST_RelationshipId;
}

export interface CT_TagsData {
  id: ST_RelationshipId;
}

export interface CT_CustomerDataList {
  custData?: CT_CustomerData[];
  tags?: CT_TagsData;
}

export interface CT_Extension {
  any?: any[]; // xsd:any
  uri: string; // xsd:token
}

export interface CT_ExtensionList {
  ext?: CT_Extension[];
}

export interface CT_CommentAuthor {
  extLst?: CT_ExtensionList;
  id: number; // xsd:unsignedInt
  name: ST_Name;
  initials: ST_Name;
  lastIdx: number; // xsd:unsignedInt
  clrIdx: number; // xsd:unsignedInt
}

export interface CT_CommentAuthorList {
  cmAuthor?: CT_CommentAuthor[];
}

export interface CT_Comment {
  pos: CT_Point2D;
  text: string;
  extLst?: CT_ExtensionListModify;
  authorId: number; // xsd:unsignedInt
  dt?: string; // xsd:dateTime
  idx: ST_Index;
}

export interface CT_CommentList {
  cm?: CT_Comment[];
}

export interface AG_Ole {
  name?: string;
  showAsIcon?: boolean;
  id?: ST_RelationshipId;
  imgW?: CT_PositiveSize2D;
  imgH?: CT_PositiveSize2D;
}

export enum ST_OleObjectFollowColorScheme {
  None = "none",
  Full = "full",
  TextAndBackground = "textAndBackground",
}

export interface CT_OleObjectEmbed {
  extLst?: CT_ExtensionList;
  followColorScheme?: ST_OleObjectFollowColorScheme;
}

export interface CT_OleObjectLink {
  extLst?: CT_ExtensionList;
  updateAutomatic?: boolean;
}

export interface CT_OleObject extends AG_Ole {
  embed?: CT_OleObjectEmbed;
  link?: CT_OleObjectLink;
  pic: CT_Picture;
  progId?: string;
}

export interface CT_Control extends AG_Ole {
  extLst?: CT_ExtensionList;
  pic?: CT_Picture;
}

export interface CT_ControlList {
  control?: CT_Control[];
}

export type ST_SlideId = number; // xsd:unsignedInt, minInclusive 256, maxExclusive 2147483648

export interface CT_SlideIdListEntry {
  extLst?: CT_ExtensionList;
  id: ST_SlideId;
  rId: ST_RelationshipId;
}

export interface CT_SlideIdList {
  sldId?: CT_SlideIdListEntry[];
}

export type ST_SlideMasterId = number; // xsd:unsignedInt, minInclusive 2147483648

export interface CT_SlideMasterIdListEntry {
  extLst?: CT_ExtensionList;
  id?: ST_SlideMasterId;
  rId: ST_RelationshipId;
}

export interface CT_SlideMasterIdList {
  sldMasterId?: CT_SlideMasterIdListEntry[];
}

export interface CT_NotesMasterIdListEntry {
  extLst?: CT_ExtensionList;
  rId: ST_RelationshipId;
}

export interface CT_NotesMasterIdList {
  notesMasterId?: CT_NotesMasterIdListEntry;
}

export interface CT_HandoutMasterIdListEntry {
  extLst?: CT_ExtensionList;
  rId: ST_RelationshipId;
}

export interface CT_HandoutMasterIdList {
  handoutMasterId?: CT_HandoutMasterIdListEntry;
}

export interface CT_EmbeddedFontDataId {
  id: ST_RelationshipId;
}

export interface CT_EmbeddedFontListEntry {
  font: CT_TextFont;
  regular?: CT_EmbeddedFontDataId;
  bold?: CT_EmbeddedFontDataId;
  italic?: CT_EmbeddedFontDataId;
  boldItalic?: CT_EmbeddedFontDataId;
}

export interface CT_EmbeddedFontList {
  embeddedFont?: CT_EmbeddedFontListEntry[];
}

export interface CT_SmartTags {
  id: ST_RelationshipId;
}

export interface CT_CustomShow {
  sldLst: CT_SlideRelationshipList;
  extLst?: CT_ExtensionList;
  name: ST_Name;
  id: number; // xsd:unsignedInt
}

export interface CT_CustomShowList {
  custShow?: CT_CustomShow[];
}

export enum ST_PhotoAlbumLayout {
  FitToSlide = "fitToSlide",
  OnePic = "1pic",
  TwoPic = "2pic",
  FourPic = "4pic",
  OnePicTitle = "1picTitle",
  TwoPicTitle = "2picTitle",
  FourPicTitle = "4picTitle",
}

export enum ST_PhotoAlbumFrameShape {
  FrameStyle1 = "frameStyle1",
  FrameStyle2 = "frameStyle2",
  FrameStyle3 = "frameStyle3",
  FrameStyle4 = "frameStyle4",
  FrameStyle5 = "frameStyle5",
  FrameStyle6 = "frameStyle6",
  FrameStyle7 = "frameStyle7",
}

export interface CT_PhotoAlbum {
  extLst?: CT_ExtensionList;
  bw?: boolean;
  showCaptions?: boolean;
  layout?: ST_PhotoAlbumLayout;
  frame?: ST_PhotoAlbumFrameShape;
}

export type ST_SlideSizeCoordinate = number; // a:ST_PositiveCoordinate32, minInclusive 914400, maxInclusive 51206400

export enum ST_SlideSizeType {
  Screen4x3 = "screen4x3",
  Letter = "letter",
  A4 = "A4",
  Three5mm = "35mm",
  Overhead = "overhead",
  Banner = "banner",
  Custom = "custom",
  Ledger = "ledger",
  A3 = "A3",
  B4ISO = "B4ISO",
  B5ISO = "B5ISO",
  B4JIS = "B4JIS",
  B5JIS = "B5JIS",
  HagakiCard = "hagakiCard",
  Screen16x9 = "screen16x9",
  Screen16x10 = "screen16x10",
}

export interface CT_SlideSize {
  cx: ST_SlideSizeCoordinate;
  cy: ST_SlideSizeCoordinate;
  type?: ST_SlideSizeType;
}

export interface CT_Kinsoku {
  lang?: string;
  invalStChars: string;
  invalEndChars: string;
}

export type ST_BookmarkIdSeed = number; // xsd:unsignedInt, minInclusive 1, maxExclusive 2147483648

export interface CT_ModifyVerifier {
  algorithmName?: string;
  hashValue?: string; // xsd:base64Binary
  saltValue?: string; // xsd:base64Binary
  spinValue?: number; // xsd:unsignedInt
}

export interface CT_Presentation {
  sldMasterIdLst?: CT_SlideMasterIdList;
  notesMasterIdLst?: CT_NotesMasterIdList;
  handoutMasterIdLst?: CT_HandoutMasterIdList;
  sldIdLst?: CT_SlideIdList;
  sldSz?: CT_SlideSize;
  notesSz: CT_PositiveSize2D;
  smartTags?: CT_SmartTags;
  embeddedFontLst?: CT_EmbeddedFontList;
  custShowLst?: CT_CustomShowList;
  photoAlbum?: CT_PhotoAlbum;
  custDataLst?: CT_CustomerDataList;
  kinsoku?: CT_Kinsoku;
  defaultTextStyle?: CT_TextListStyle;
  modifyVerifier?: CT_ModifyVerifier;
  extLst?: CT_ExtensionList;
  serverZoom?: ST_Percentage;
  firstSlideNum?: number; // xsd:int
  showSpecialPlsOnTitleSld?: boolean;
  rtl?: boolean;
  removePersonalInfoOnSave?: boolean;
  compatMode?: boolean;
  strictFirstAndLastChars?: boolean;
  embedTrueTypeFonts?: boolean;
  saveSubsetFonts?: boolean;
  autoCompressPictures?: boolean;
  bookmarkIdSeed?: ST_BookmarkIdSeed;
  conformance?: ST_ConformanceClass;
}

export interface CT_HtmlPublishProperties {
  slideListChoice: EG_SlideListChoice;
  extLst?: CT_ExtensionList;
  showSpeakerNotes?: boolean;
  target?: string;
  title?: string;
  id: ST_RelationshipId;
}

export enum ST_PrintWhat {
  Slides = "slides",
  Handouts1 = "handouts1",
  Handouts2 = "handouts2",
  Handouts3 = "handouts3",
  Handouts4 = "handouts4",
  Handouts6 = "handouts6",
  Handouts9 = "handouts9",
  Notes = "notes",
  Outline = "outline",
}

export enum ST_PrintColorMode {
  Bw = "bw",
  Gray = "gray",
  Clr = "clr",
}

export interface CT_PrintProperties {
  extLst?: CT_ExtensionList;
  prnWhat?: ST_PrintWhat;
  clrMode?: ST_PrintColorMode;
  hiddenSlides?: boolean;
  scaleToFitPaper?: boolean;
  frameSlides?: boolean;
}

export interface CT_ShowInfoBrowse {
  showScrollbar?: boolean;
}

export interface CT_ShowInfoKiosk {
  restart?: number; // xsd:unsignedInt
}

export type EG_ShowType = 
  | { present: CT_Empty }
  | { browse: CT_ShowInfoBrowse }
  | { kiosk: CT_ShowInfoKiosk };

export interface CT_ShowProperties {
  showType?: EG_ShowType;
  slideListChoice?: EG_SlideListChoice;
  penClr?: CT_Color;
  extLst?: CT_ExtensionList;
  loop?: boolean;
  showNarration?: boolean;
  showAnimation?: boolean;
  useTimings?: boolean;
}

export interface CT_PresentationProperties {
  prnPr?: CT_PrintProperties;
  showPr?: CT_ShowProperties;
  clrMru?: CT_Color;
  extLst?: CT_ExtensionList;
}

export interface CT_HeaderFooter {
  extLst?: CT_ExtensionListModify;
  sldNum?: boolean;
  hdr?: boolean;
  ftr?: boolean;
  dt?: boolean;
}

export enum ST_PlaceholderType {
  Title = "title",
  Body = "body",
  CtrTitle = "ctrTitle",
  SubTitle = "subTitle",
  Dt = "dt",
  SldNum = "sldNum",
  Ftr = "ftr",
  Hdr = "hdr",
  Obj = "obj",
  Chart = "chart",
  Tbl = "tbl",
  ClipArt = "clipArt",
  Dgm = "dgm",
  Media = "media",
  SldImg = "sldImg",
  Pic = "pic",
}

export enum ST_PlaceholderSize {
  Full = "full",
  Half = "half",
  Quarter = "quarter",
}

export interface CT_Placeholder {
  extLst?: CT_ExtensionListModify;
  type?: ST_PlaceholderType;
  orient?: ST_Direction;
  sz?: ST_PlaceholderSize;
  idx?: number; // xsd:unsignedInt
  hasCustomPrompt?: boolean;
}

export interface CT_ApplicationNonVisualDrawingProps {
  ph?: CT_Placeholder;
  media?: EG_Media;
  custDataLst?: CT_CustomerDataList;
  extLst?: CT_ExtensionList;
  isPhoto?: boolean;
  userDrawn?: boolean;
}

export interface CT_ShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvSpPr: CT_NonVisualDrawingShapeProps;
  nvPr: CT_ApplicationNonVisualDrawingProps;
}

export interface CT_Shape {
  nvSpPr: CT_ShapeNonVisual;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  txBody?: CT_TextBody;
  extLst?: CT_ExtensionListModify;
  useBgFill?: boolean;
}

export interface CT_ConnectorNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvCxnSpPr: CT_NonVisualConnectorProperties;
  nvPr: CT_ApplicationNonVisualDrawingProps;
}

export interface CT_Connector {
  nvCxnSpPr: CT_ConnectorNonVisual;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  extLst?: CT_ExtensionListModify;
}

export interface CT_PictureNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvPicPr: CT_NonVisualPictureProperties;
  nvPr: CT_ApplicationNonVisualDrawingProps;
}

export interface CT_Picture {
  nvPicPr: CT_PictureNonVisual;
  blipFill: CT_BlipFillProperties;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  extLst?: CT_ExtensionListModify;
}

export interface CT_GraphicalObjectFrameNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGraphicFramePr: CT_NonVisualGraphicFrameProperties;
  nvPr: CT_ApplicationNonVisualDrawingProps;
}

export interface CT_GraphicalObjectFrame {
  nvGraphicFramePr: CT_GraphicalObjectFrameNonVisual;
  xfrm: CT_Transform2D;
  graphic: CT_GraphicalObject;
  extLst?: CT_ExtensionListModify;
  bwMode?: ST_BlackWhiteMode;
}

export interface CT_GroupShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGrpSpPr: CT_NonVisualGroupDrawingShapeProps;
  nvPr: CT_ApplicationNonVisualDrawingProps;
}

export interface CT_GroupShape {
  nvGrpSpPr: CT_GroupShapeNonVisual;
  grpSpPr: CT_GroupShapeProperties;
  elements?: (
    | { sp: CT_Shape }
    | { grpSp: CT_GroupShape }
    | { graphicFrame: CT_GraphicalObjectFrame }
    | { cxnSp: CT_Connector }
    | { pic: CT_Picture }
    | { contentPart: CT_Rel }
  )[];
  extLst?: CT_ExtensionListModify;
}

export interface CT_Rel {
  id: ST_RelationshipId;
}

export interface EG_TopLevelSlide {
  clrMap: CT_ColorMapping;
}

export interface EG_ChildSlide {
  clrMapOvr?: CT_ColorMappingOverride;
}

export interface AG_ChildSlide {
  showMasterSp?: boolean;
  showMasterPhAnim?: boolean;
}

export interface CT_BackgroundProperties {
  fillProperties: EG_FillProperties;
  effectProperties?: EG_EffectProperties;
  extLst?: CT_ExtensionList;
  shadeToTitle?: boolean;
}

export type EG_Background = 
  | { bgPr: CT_BackgroundProperties }
  | { bgRef: CT_StyleMatrixReference };

export interface CT_Background {
  background: EG_Background;
  bwMode?: ST_BlackWhiteMode;
}

export interface CT_CommonSlideData {
  bg?: CT_Background;
  spTree: CT_GroupShape;
  custDataLst?: CT_CustomerDataList;
  controls?: CT_ControlList;
  extLst?: CT_ExtensionList;
  name?: string;
}

export interface CT_Slide {
  cSld: CT_CommonSlideData;
  childSlide?: EG_ChildSlide;
  transition?: CT_SlideTransition;
  timing?: CT_SlideTiming;
  extLst?: CT_ExtensionListModify;
  show?: boolean;
}

export enum ST_SlideLayoutType {
  Title = "title",
  Tx = "tx",
  TwoColTx = "twoColTx",
  Tbl = "tbl",
  TxAndChart = "txAndChart",
  ChartAndTx = "chartAndTx",
  Dgm = "dgm",
  Chart = "chart",
  TxAndClipArt = "txAndClipArt",
  ClipArtAndTx = "clipArtAndTx",
  TitleOnly = "titleOnly",
  Blank = "blank",
  TxAndObj = "txAndObj",
  ObjAndTx = "objAndTx",
  ObjOnly = "objOnly",
  Obj = "obj",
  TxAndMedia = "txAndMedia",
  MediaAndTx = "mediaAndTx",
  ObjOverTx = "objOverTx",
  TxOverObj = "txOverObj",
  TxAndTwoObj = "txAndTwoObj",
  TwoObjAndTx = "twoObjAndTx",
  TwoObjOverTx = "twoObjOverTx",
  FourObj = "fourObj",
  VertTx = "vertTx",
  ClipArtAndVertTx = "clipArtAndVertTx",
  VertTitleAndTx = "vertTitleAndTx",
  VertTitleAndTxOverChart = "vertTitleAndTxOverChart",
  TwoObj = "twoObj",
  ObjAndTwoObj = "objAndTwoObj",
  TwoObjAndObj = "twoObjAndObj",
  Cust = "cust",
  SecHead = "secHead",
  TwoTxTwoObj = "twoTxTwoObj",
  ObjTx = "objTx",
  PicTx = "picTx",
}

export interface CT_SlideLayout {
  cSld: CT_CommonSlideData;
  childSlide?: EG_ChildSlide;
  transition?: CT_SlideTransition;
  timing?: CT_SlideTiming;
  hf?: CT_HeaderFooter;
  extLst?: CT_ExtensionListModify;
  matchingName?: string;
  type?: ST_SlideLayoutType;
  preserve?: boolean;
  userDrawn?: boolean;
}

export interface CT_SlideMasterTextStyles {
  titleStyle?: CT_TextListStyle;
  bodyStyle?: CT_TextListStyle;
  otherStyle?: CT_TextListStyle;
  extLst?: CT_ExtensionList;
}

export type ST_SlideLayoutId = number; // xsd:unsignedInt, minInclusive 2147483648

export interface CT_SlideLayoutIdListEntry {
  extLst?: CT_ExtensionList;
  id?: ST_SlideLayoutId;
  rId: ST_RelationshipId;
}

export interface CT_SlideLayoutIdList {
  sldLayoutId?: CT_SlideLayoutIdListEntry[];
}

export interface CT_SlideMaster {
  cSld: CT_CommonSlideData;
  topLevelSlide: EG_TopLevelSlide;
  sldLayoutIdLst?: CT_SlideLayoutIdList;
  transition?: CT_SlideTransition;
  timing?: CT_SlideTiming;
  hf?: CT_HeaderFooter;
  txStyles?: CT_SlideMasterTextStyles;
  extLst?: CT_ExtensionListModify;
  preserve?: boolean;
}

export interface CT_HandoutMaster {
  cSld: CT_CommonSlideData;
  topLevelSlide: EG_TopLevelSlide;
  hf?: CT_HeaderFooter;
  extLst?: CT_ExtensionListModify;
}

export interface CT_NotesMaster {
  cSld: CT_CommonSlideData;
  topLevelSlide: EG_TopLevelSlide;
  hf?: CT_HeaderFooter;
  notesStyle?: CT_TextListStyle;
  extLst?: CT_ExtensionListModify;
}

export interface CT_NotesSlide {
  cSld: CT_CommonSlideData;
  childSlide?: EG_ChildSlide;
  extLst?: CT_ExtensionListModify;
}

export interface CT_SlideSyncProperties {
  extLst?: CT_ExtensionList;
  serverSldId: string;
  serverSldModifiedTime: string; // xsd:dateTime
  clientInsertedTime: string; // xsd:dateTime
}

export interface CT_StringTag {
  name: string;
  val: string;
}

export interface CT_TagList {
  tag?: CT_StringTag[];
}

export enum ST_SplitterBarState {
  Minimized = "minimized",
  Restored = "restored",
  Maximized = "maximized",
}

export enum ST_ViewType {
  SldView = "sldView",
  SldMasterView = "sldMasterView",
  NotesView = "notesView",
  HandoutView = "handoutView",
  NotesMasterView = "notesMasterView",
  OutlineView = "outlineView",
  SldSorterView = "sldSorterView",
  SldThumbnailView = "sldThumbnailView",
}

export interface CT_NormalViewPortion {
  sz: ST_PositiveFixedPercentage;
  autoAdjust?: boolean;
}

export interface CT_NormalViewProperties {
  restoredLeft: CT_NormalViewPortion;
  restoredTop: CT_NormalViewPortion;
  extLst?: CT_ExtensionList;
  showOutlineIcons?: boolean;
  snapVertSplitter?: boolean;
  vertBarState?: ST_SplitterBarState;
  horzBarState?: ST_SplitterBarState;
  preferSingleView?: boolean;
}

export interface CT_CommonViewProperties {
  scale: CT_Scale2D;
  origin: CT_Point2D;
  varScale?: boolean;
}

export interface CT_NotesTextViewProperties {
  cViewPr: CT_CommonViewProperties;
  extLst?: CT_ExtensionList;
}

export interface CT_OutlineViewSlideEntry {
  rId: ST_RelationshipId;
  collapse?: boolean;
}

export interface CT_OutlineViewSlideList {
  sld?: CT_OutlineViewSlideEntry[];
}

export interface CT_OutlineViewProperties {
  cViewPr: CT_CommonViewProperties;
  sldLst?: CT_OutlineViewSlideList;
  extLst?: CT_ExtensionList;
}

export interface CT_SlideSorterViewProperties {
  cViewPr: CT_CommonViewProperties;
  extLst?: CT_ExtensionList;
  showFormatting?: boolean;
}

export interface CT_Guide {
  orient?: ST_Direction;
  pos?: ST_Coordinate;
}

export interface CT_GuideList {
  guide?: CT_Guide[];
}

export interface CT_CommonSlideViewProperties {
  cViewPr: CT_CommonViewProperties;
  guideLst?: CT_GuideList;
  snapToGrid?: boolean;
  snapToObjects?: boolean;
  showGuides?: boolean;
}

export interface CT_SlideViewProperties {
  cSldViewPr: CT_CommonSlideViewProperties;
  extLst?: CT_ExtensionList;
}

export interface CT_NotesViewProperties {
  cSldViewPr: CT_CommonSlideViewProperties;
  extLst?: CT_ExtensionList;
}

export interface CT_ViewProperties {
  normalViewPr?: CT_NormalViewProperties;
  slideViewPr?: CT_SlideViewProperties;
  outlineViewPr?: CT_OutlineViewProperties;
  notesTextViewPr?: CT_NotesTextViewProperties;
  sorterViewPr?: CT_SlideSorterViewProperties;
  notesViewPr?: CT_NotesViewProperties;
  gridSpacing?: CT_PositiveSize2D;
  extLst?: CT_ExtensionList;
  lastView?: ST_ViewType;
  showComments?: boolean;
}
