// layout-definition.ts - Layout definition types for diagrams
import type { CT_OfficeArtExtensionList } from '../dml-main';
import type { CT_Algorithm } from './layout-algorithms';
import type { CT_Shape } from './shape-adjustment';
import type { CT_PresentationOf, CT_Constraints, CT_Rules, AG_IteratorAttributes } from './layout-constraints';
import type { CT_LayoutVariablePropertySet } from './layout-variables';
import type { ST_ChildOrderType } from './layout-enums';
import type { ST_FunctionType, ST_FunctionOperator, ST_FunctionValue, ST_FunctionArgument } from './layout-algorithms';
import type { CT_SampleData, CT_Categories, CT_Name, CT_Description } from './basic-data-model';

// Layout node
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

// For each
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

// When condition
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

// Otherwise
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

// Choose
export interface CT_Choose {
  if: CT_When[];
  else?: CT_Otherwise;
  name?: string;
}

// Diagram definition
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