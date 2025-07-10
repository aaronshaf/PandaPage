// dml-effects.ts
// Types related to effects, fills, shadows, glows, and styles from DrawingML

import type { 
  ST_RelationshipId, 
  ST_String, 
  ST_Percentage, 
  ST_FixedPercentage, 
  ST_PositiveFixedPercentage 
} from './shared-types';

// Import from specific modules to avoid circular dependency
import type {
  ST_Coordinate,
  ST_PositiveCoordinate,
  ST_Angle,
  ST_FixedAngle,
  ST_PositiveFixedAngle,
  ST_RectAlignment,
  CT_RelativeRect
} from './dml-shapes';

import type {
  ST_BlackWhiteMode,
  EG_ColorChoice,
  CT_Color,
  CT_ColorScheme
} from './dml-colors';

import type {
  CT_OfficeArtExtensionList
} from './dml-media';

import type {
  ST_FontCollectionIndex,
  CT_TextFont,
  CT_SupplementalFont
} from './dml-fonts';

import type {
  ST_StyleMatrixColumnIndex
} from './dml-shapes';

// These types are defined locally in this module to avoid circular dependency
export interface CT_Point3D {
  x: ST_Coordinate;
  y: ST_Coordinate;
  z: ST_Coordinate;
}

export interface CT_Vector3D {
  dx: ST_Coordinate;
  dy: ST_Coordinate;
  dz: ST_Coordinate;
}

export interface CT_Camera {
  prst: string; // ST_PresetCameraType
  fov?: ST_Angle;
  zoom?: ST_Percentage;
  rot?: any; // CT_SphereCoords
}

export interface CT_LightRig {
  rig: string; // ST_LightRigType
  dir: string; // ST_LightRigDirection
  rot?: any; // CT_SphereCoords
}

export interface CT_Scene3D {
  camera: CT_Camera;
  lightRig: CT_LightRig;
  backdrop?: any; // CT_Backdrop
  extLst?: CT_OfficeArtExtensionList;
}

// Style Matrix and Style Lists
export interface CT_EffectStyleItem {
  // EG_EffectProperties is a group, will define later
  scene3d?: CT_Scene3D;
  sp3d?: CT_Shape3D;
}

export interface CT_FillStyleList {
  // EG_FillProperties is a group, will define later
  fillProperties: any[]; // Placeholder
}

export interface CT_LineProperties {
  // This type is referenced but not defined in dml-main.xsd, assuming it's a complex type for line formatting
  // Will define as any for now
  lineProperties: any;
}

export interface CT_LineStyleList {
  ln: CT_LineProperties[];
}

export interface CT_EffectStyleList {
  effectStyle: CT_EffectStyleItem[];
}

export interface CT_BackgroundFillStyleList {
  // EG_FillProperties is a group, will define later
  fillProperties: any[]; // Placeholder
}

export interface CT_StyleMatrix {
  fillStyleLst: CT_FillStyleList;
  lnStyleLst: CT_LineStyleList;
  effectStyleLst: CT_EffectStyleList;
  bgFillStyleLst: CT_BackgroundFillStyleList;
  name?: ST_String;
}

export interface CT_FontCollection {
  latin: CT_TextFont;
  ea: CT_TextFont;
  cs: CT_TextFont;
  font?: CT_SupplementalFont[];
  extLst?: CT_OfficeArtExtensionList;
}

export interface CT_FontScheme {
  majorFont: CT_FontCollection;
  minorFont: CT_FontCollection;
  extLst?: CT_OfficeArtExtensionList;
  name: ST_String;
}

export interface CT_BaseStyles {
  clrScheme: CT_ColorScheme;
  fontScheme: CT_FontScheme;
  fmtScheme: CT_StyleMatrix;
  extLst?: CT_OfficeArtExtensionList;
}

// 3D Effects
export interface CT_Backdrop {
  anchor: CT_Point3D;
  norm: CT_Vector3D;
  up: CT_Vector3D;
  extLst?: CT_OfficeArtExtensionList;
}

export enum ST_BevelPresetType {
  RelaxedInset = "relaxedInset",
  Circle = "circle",
  Slope = "slope",
  Cross = "cross",
  Angle = "angle",
  SoftRound = "softRound",
  Convex = "convex",
  CoolSlant = "coolSlant",
  Divot = "divot",
  Riblet = "riblet",
  HardEdge = "hardEdge",
  ArtDeco = "artDeco",
}

export interface CT_Bevel {
  w?: ST_PositiveCoordinate;
  h?: ST_PositiveCoordinate;
  prst?: ST_BevelPresetType;
}

export enum ST_PresetMaterialType {
  LegacyMatte = "legacyMatte",
  LegacyPlastic = "legacyPlastic",
  LegacyMetal = "legacyMetal",
  LegacyWireframe = "legacyWireframe",
  Matte = "matte",
  Plastic = "plastic",
  Metal = "metal",
  WarmMatte = "warmMatte",
  TranslucentPowder = "translucentPowder",
  Powder = "powder",
  DkEdge = "dkEdge",
  SoftEdge = "softEdge",
  Clear = "clear",
  Flat = "flat",
  Softmetal = "softmetal",
}

export interface CT_Shape3D {
  bevelT?: CT_Bevel;
  bevelB?: CT_Bevel;
  extrusionClr?: CT_Color;
  contourClr?: CT_Color;
  extLst?: CT_OfficeArtExtensionList;
  z?: ST_Coordinate;
  extrusionH?: ST_PositiveCoordinate;
  contourW?: ST_PositiveCoordinate;
  prstMaterial?: ST_PresetMaterialType;
}

export interface CT_FlatText {
  z?: ST_Coordinate;
}

export type EG_Text3D = 
  | { sp3d: CT_Shape3D }
  | { flatTx: CT_FlatText };

// Alpha Effects
export interface CT_AlphaBiLevelEffect {
  thresh: ST_PositiveFixedPercentage;
}

export type CT_AlphaCeilingEffect = Record<string, never>

export type CT_AlphaFloorEffect = Record<string, never>

export interface CT_AlphaInverseEffect {
  colorChoice?: EG_ColorChoice;
}

export interface CT_AlphaModulateFixedEffect {
  amt?: ST_PositiveFixedPercentage;
}

export interface CT_AlphaOutsetEffect {
  rad?: ST_Coordinate;
}

export interface CT_AlphaReplaceEffect {
  a: ST_PositiveFixedPercentage;
}

// Color Effects
export interface CT_BiLevelEffect {
  thresh: ST_PositiveFixedPercentage;
}

export interface CT_ColorChangeEffect {
  clrFrom: CT_Color;
  clrTo: CT_Color;
  useA?: boolean;
}

export interface CT_ColorReplaceEffect {
  colorChoice: EG_ColorChoice;
}

export interface CT_DuotoneEffect {
  colorChoice: [EG_ColorChoice, EG_ColorChoice];
}

export type CT_GrayscaleEffect = Record<string, never>

export interface CT_HSLEffect {
  hue?: ST_PositiveFixedAngle;
  sat?: ST_FixedPercentage;
  lum?: ST_FixedPercentage;
}

export interface CT_LuminanceEffect {
  bright?: ST_FixedPercentage;
  contrast?: ST_FixedPercentage;
}

export interface CT_TintEffect {
  hue?: ST_PositiveFixedAngle;
  amt?: ST_FixedPercentage;
}

// Blur and Glow Effects
export interface CT_BlurEffect {
  rad?: ST_PositiveCoordinate;
  grow?: boolean;
}

export interface CT_GlowEffect {
  colorChoice: EG_ColorChoice;
  rad?: ST_PositiveCoordinate;
}

export interface CT_SoftEdgesEffect {
  rad: ST_PositiveCoordinate;
}

// Shadow Effects
export interface CT_InnerShadowEffect {
  colorChoice: EG_ColorChoice;
  blurRad?: ST_PositiveCoordinate;
  dist?: ST_PositiveCoordinate;
  dir?: ST_PositiveFixedAngle;
}

export interface CT_OuterShadowEffect {
  colorChoice: EG_ColorChoice;
  blurRad?: ST_PositiveCoordinate;
  dist?: ST_PositiveCoordinate;
  dir?: ST_PositiveFixedAngle;
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  kx?: ST_FixedAngle;
  ky?: ST_FixedAngle;
  algn?: ST_RectAlignment;
  rotWithShape?: boolean;
}

export enum ST_PresetShadowVal {
  Shdw1 = "shdw1",
  Shdw2 = "shdw2",
  Shdw3 = "shdw3",
  Shdw4 = "shdw4",
  Shdw5 = "shdw5",
  Shdw6 = "shdw6",
  Shdw7 = "shdw7",
  Shdw8 = "shdw8",
  Shdw9 = "shdw9",
  Shdw10 = "shdw10",
  Shdw11 = "shdw11",
  Shdw12 = "shdw12",
  Shdw13 = "shdw13",
  Shdw14 = "shdw14",
  Shdw15 = "shdw15",
  Shdw16 = "shdw16",
  Shdw17 = "shdw17",
  Shdw18 = "shdw18",
  Shdw19 = "shdw19",
  Shdw20 = "shdw20",
}

export interface CT_PresetShadowEffect {
  colorChoice: EG_ColorChoice;
  prst: ST_PresetShadowVal;
  dist?: ST_PositiveCoordinate;
  dir?: ST_PositiveFixedAngle;
}

// Reflection Effect
export interface CT_ReflectionEffect {
  blurRad?: ST_PositiveCoordinate;
  stA?: ST_PositiveFixedPercentage;
  stPos?: ST_PositiveFixedPercentage;
  endA?: ST_PositiveFixedPercentage;
  endPos?: ST_PositiveFixedPercentage;
  dist?: ST_PositiveCoordinate;
  dir?: ST_PositiveFixedAngle;
  fadeDir?: ST_PositiveFixedAngle;
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  kx?: ST_FixedAngle;
  ky?: ST_FixedAngle;
  algn?: ST_RectAlignment;
  rotWithShape?: boolean;
}

// Transform Effects
export interface CT_RelativeOffsetEffect {
  tx?: ST_Percentage;
  ty?: ST_Percentage;
}

export interface CT_TransformEffect {
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  kx?: ST_FixedAngle;
  ky?: ST_FixedAngle;
  tx?: ST_Coordinate;
  ty?: ST_Coordinate;
}

// Fill Properties
export type CT_NoFillProperties = Record<string, never>

export interface CT_SolidColorFillProperties {
  colorChoice?: EG_ColorChoice;
}

export interface CT_LinearShadeProperties {
  ang?: ST_PositiveFixedAngle;
  scaled?: boolean;
}

export enum ST_PathShadeType {
  Shape = "shape",
  Circle = "circle",
  Rect = "rect",
}

export interface CT_PathShadeProperties {
  fillToRect?: CT_RelativeRect;
  path?: ST_PathShadeType;
}

export type EG_ShadeProperties = 
  | { lin: CT_LinearShadeProperties }
  | { path: CT_PathShadeProperties };

export enum ST_TileFlipMode {
  None = "none",
  X = "x",
  Y = "y",
  Xy = "xy",
}

export interface CT_GradientStop {
  colorChoice: EG_ColorChoice;
  pos: ST_PositiveFixedPercentage;
}

export interface CT_GradientStopList {
  gs: CT_GradientStop[];
}

export interface CT_GradientFillProperties {
  gsLst?: CT_GradientStopList;
  shadeProperties?: EG_ShadeProperties;
  tileRect?: CT_RelativeRect;
  flip?: ST_TileFlipMode;
  rotWithShape?: boolean;
}

export interface CT_TileInfoProperties {
  tx?: ST_Coordinate;
  ty?: ST_Coordinate;
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  flip?: ST_TileFlipMode;
  algn?: ST_RectAlignment;
}

export interface CT_StretchInfoProperties {
  fillRect?: CT_RelativeRect;
}

export type EG_FillModeProperties = 
  | { tile: CT_TileInfoProperties }
  | { stretch: CT_StretchInfoProperties };

export enum ST_BlipCompression {
  Email = "email",
  Screen = "screen",
  Print = "print",
  Hqprint = "hqprint",
  None = "none",
}

export interface CT_Blip {
  alphaBiLevel?: CT_AlphaBiLevelEffect;
  alphaCeiling?: CT_AlphaCeilingEffect;
  alphaFloor?: CT_AlphaFloorEffect;
  alphaInv?: CT_AlphaInverseEffect;
  alphaMod?: CT_AlphaModulateEffect;
  alphaModFix?: CT_AlphaModulateFixedEffect;
  alphaRepl?: CT_AlphaReplaceEffect;
  biLevel?: CT_BiLevelEffect;
  blur?: CT_BlurEffect;
  clrChange?: CT_ColorChangeEffect;
  clrRepl?: CT_ColorReplaceEffect;
  duotone?: CT_DuotoneEffect;
  fillOverlay?: CT_FillOverlayEffect;
  grayscl?: CT_GrayscaleEffect;
  hsl?: CT_HSLEffect;
  lum?: CT_LuminanceEffect;
  tint?: CT_TintEffect;
  extLst?: CT_OfficeArtExtensionList;
  embed?: ST_RelationshipId;
  link?: ST_RelationshipId;
  cstate?: ST_BlipCompression;
}

export interface CT_BlipFillProperties {
  blip?: CT_Blip;
  srcRect?: CT_RelativeRect;
  fillModeProperties?: EG_FillModeProperties;
  dpi?: number; // xsd:unsignedInt
  rotWithShape?: boolean;
}

export enum ST_PresetPatternVal {
  Pct5 = "pct5",
  Pct10 = "pct10",
  Pct20 = "pct20",
  Pct25 = "pct25",
  Pct30 = "pct30",
  Pct40 = "pct40",
  Pct50 = "pct50",
  Pct60 = "pct60",
  Pct70 = "pct70",
  Pct75 = "pct75",
  Pct80 = "pct80",
  Pct90 = "pct90",
  Horz = "horz",
  Vert = "vert",
  LtHorz = "ltHorz",
  LtVert = "ltVert",
  DkHorz = "dkHorz",
  DkVert = "dkVert",
  NarHorz = "narHorz",
  NarVert = "narVert",
  DashHorz = "dashHorz",
  DashVert = "dashVert",
  Cross = "cross",
  DnDiag = "dnDiag",
  UpDiag = "upDiag",
  LtDnDiag = "ltDnDiag",
  LtUpDiag = "ltUpDiag",
  DkDnDiag = "dkDnDiag",
  DkUpDiag = "dkUpDiag",
  WdDnDiag = "wdDnDiag",
  WdUpDiag = "wdUpDiag",
  DashDnDiag = "dashDnDiag",
  DashUpDiag = "dashUpDiag",
  DiagCross = "diagCross",
  SmCheck = "smCheck",
  LgCheck = "lgCheck",
  SmGrid = "smGrid",
  LgGrid = "lgGrid",
  DotGrid = "dotGrid",
  SmConfetti = "smConfetti",
  LgConfetti = "lgConfetti",
  HorzBrick = "horzBrick",
  DiagBrick = "diagBrick",
  SolidDmnd = "solidDmnd",
  OpenDmnd = "openDmnd",
  DotDmnd = "dotDmnd",
  Plaid = "plaid",
  Sphere = "sphere",
  Weave = "weave",
  Divot = "divot",
  Shingle = "shingle",
  Wave = "wave",
  Trellis = "trellis",
  ZigZag = "zigZag",
}

export interface CT_PatternFillProperties {
  fgClr?: CT_Color;
  bgClr?: CT_Color;
  prst?: ST_PresetPatternVal;
}

export type CT_GroupFillProperties = Record<string, never>

export type EG_FillProperties = 
  | { noFill: CT_NoFillProperties }
  | { solidFill: CT_SolidColorFillProperties }
  | { gradFill: CT_GradientFillProperties }
  | { blipFill: CT_BlipFillProperties }
  | { pattFill: CT_PatternFillProperties }
  | { grpFill: CT_GroupFillProperties };

export interface CT_FillProperties {
  fillProperties: EG_FillProperties;
}

export interface CT_FillEffect {
  fillProperties: EG_FillProperties;
}

export enum ST_BlendMode {
  Over = "over",
  Mult = "mult",
  Screen = "screen",
  Darken = "darken",
  Lighten = "lighten",
}

export interface CT_FillOverlayEffect {
  fillProperties: EG_FillProperties;
  blend: ST_BlendMode;
}

// Effect Container and Lists
export interface CT_EffectReference {
  ref: string; // xsd:token
}

export interface CT_AlphaModulateEffect {
  cont: CT_EffectContainer;
}

export interface CT_BlendEffect {
  cont: CT_EffectContainer;
  blend: ST_BlendMode;
}

export type EG_Effect = 
  | { cont: CT_EffectContainer }
  | { effect: CT_EffectReference }
  | { alphaBiLevel: CT_AlphaBiLevelEffect }
  | { alphaCeiling: CT_AlphaCeilingEffect }
  | { alphaFloor: CT_AlphaFloorEffect }
  | { alphaInv: CT_AlphaInverseEffect }
  | { alphaMod: CT_AlphaModulateEffect }
  | { alphaModFix: CT_AlphaModulateFixedEffect }
  | { alphaOutset: CT_AlphaOutsetEffect }
  | { alphaRepl: CT_AlphaReplaceEffect }
  | { biLevel: CT_BiLevelEffect }
  | { blend: CT_BlendEffect }
  | { blur: CT_BlurEffect }
  | { clrChange: CT_ColorChangeEffect }
  | { clrRepl: CT_ColorReplaceEffect }
  | { duotone: CT_DuotoneEffect }
  | { fill: CT_FillEffect }
  | { fillOverlay: CT_FillOverlayEffect }
  | { glow: CT_GlowEffect }
  | { grayscl: CT_GrayscaleEffect }
  | { hsl: CT_HSLEffect }
  | { innerShdw: CT_InnerShadowEffect }
  | { lum: CT_LuminanceEffect }
  | { outerShdw: CT_OuterShadowEffect }
  | { prstShdw: CT_PresetShadowEffect }
  | { reflection: CT_ReflectionEffect }
  | { relOff: CT_RelativeOffsetEffect }
  | { softEdge: CT_SoftEdgesEffect }
  | { tint: CT_TintEffect }
  | { xfrm: CT_TransformEffect };

export enum ST_EffectContainerType {
  Sib = "sib",
  Tree = "tree",
}

export interface CT_EffectContainer {
  effects?: EG_Effect[];
  type?: ST_EffectContainerType;
  name?: string; // xsd:token
}

export interface CT_EffectList {
  blur?: CT_BlurEffect;
  fillOverlay?: CT_FillOverlayEffect;
  glow?: CT_GlowEffect;
  innerShdw?: CT_InnerShadowEffect;
  outerShdw?: CT_OuterShadowEffect;
  prstShdw?: CT_PresetShadowEffect;
  reflection?: CT_ReflectionEffect;
  softEdge?: CT_SoftEdgesEffect;
}

export type EG_EffectProperties = 
  | { effectLst: CT_EffectList }
  | { effectDag: CT_EffectContainer };

export interface CT_EffectProperties {
  effectProperties: EG_EffectProperties;
}

// Shape Style
export interface CT_StyleMatrixReference {
  idx: ST_StyleMatrixColumnIndex;
  colorChoice?: EG_ColorChoice;
}

export interface CT_FontReference {
  idx: ST_FontCollectionIndex;
  colorChoice?: EG_ColorChoice;
}

export interface CT_ShapeStyle {
  lnRef?: CT_StyleMatrixReference;
  fillRef?: CT_StyleMatrixReference;
  effectRef?: CT_StyleMatrixReference;
  fontRef?: CT_FontReference;
}