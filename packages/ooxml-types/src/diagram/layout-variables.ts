// layout-variables.ts - Layout variable types for diagrams
import type { ST_Direction, ST_HierBranchStyle, ST_AnimOneStr, ST_AnimLvlStr, ST_ResizeHandlesStr } from './layout-enums';

// Node count type
export type ST_NodeCount = number; // xsd:int, minInclusive -1

// Organization chart
export interface CT_OrgChart {
  val?: boolean;
}

// Child preferences
export interface CT_ChildMax {
  val?: ST_NodeCount;
}

export interface CT_ChildPref {
  val?: ST_NodeCount;
}

// Bullet enabled
export interface CT_BulletEnabled {
  val?: boolean;
}

// Direction
export interface CT_Direction {
  val?: ST_Direction;
}

// Hierarchy branch style
export interface CT_HierBranchStyle {
  val?: ST_HierBranchStyle;
}

// Animation
export interface CT_AnimOne {
  val?: ST_AnimOneStr;
}

export interface CT_AnimLvl {
  val?: ST_AnimLvlStr;
}

// Resize handles
export interface CT_ResizeHandles {
  val?: ST_ResizeHandlesStr;
}

// Layout variable property set
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