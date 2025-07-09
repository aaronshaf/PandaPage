/**
 * DrawingML Style Matrix Types
 * Based on dml-main.xsd style matrix definitions
 */

/**
 * Style matrix
 */
export interface CT_DMLStyleMatrix {
  /** Fill style list */
  fillStyleLst?: CT_DMLFillStyleList;
  /** Line style list */
  lnStyleLst?: CT_DMLLineStyleList;
  /** Effect style list */
  effectStyleLst?: CT_DMLEffectStyleList;
  /** Background fill style list */
  bgFillStyleLst?: CT_DMLBackgroundFillStyleList;
  /** Name */
  name?: string;
}

/**
 * Fill style list
 */
export interface CT_DMLFillStyleList {
  /** Fill styles */
  fills?: any[]; // Various fill types
}

/**
 * Line style list
 */
export interface CT_DMLLineStyleList {
  /** Line styles */
  lines?: any[]; // CT_LineProperties variations
}

/**
 * Effect style list
 */
export interface CT_DMLEffectStyleList {
  /** Effect styles */
  effectStyles?: CT_DMLEffectStyle[];
}

/**
 * Effect style
 */
export interface CT_DMLEffectStyle {
  /** Effect list */
  effectLst?: any; // CT_EffectList
  /** Effect DAG */
  effectDag?: any; // CT_EffectContainer
  /** Scene 3D */
  scene3d?: any; // CT_Scene3D
  /** Shape 3D */
  sp3d?: any; // CT_Shape3D
}

/**
 * Background fill style list
 */
export interface CT_DMLBackgroundFillStyleList {
  /** Background fills */
  bgFills?: any[]; // Various fill types
}