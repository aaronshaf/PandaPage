// transitions.ts - Transition-related types for presentations
import type { CT_OfficeArtExtensionList, CT_EmbeddedWAVAudioFile } from '../dml-main';
import type { CT_Empty } from './common';

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