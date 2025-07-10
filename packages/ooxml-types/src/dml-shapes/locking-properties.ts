// locking-properties.ts
// Locking and non-visual properties for DrawingML

import type { ST_String } from '../shared-types';
import type { ST_DrawingElementId } from './coordinate-types';
import type { CT_OfficeArtExtensionList } from '../dml-media';

// Forward declarations for complex types not yet defined
export type CT_Hyperlink = any; // Hyperlink type
export type CT_TextBody = any; // Text body
export type CT_GvmlUseShapeRectangle = any; // Use shape rectangle
export type CT_GraphicalObject = any; // Graphical object
export type CT_NonVisualConnectorProperties = any; // Non-visual connector properties
export type CT_NonVisualPictureProperties = any; // Non-visual picture properties

// Locking attributes group
export interface AG_Locking {
  noGrp?: boolean;
  noSelect?: boolean;
  noRot?: boolean;
  noChangeAspect?: boolean;
  noMove?: boolean;
  noResize?: boolean;
  noEditPoints?: boolean;
  noAdjustHandles?: boolean;
  noChangeArrowheads?: boolean;
  noChangeShapeType?: boolean;
}

// Shape locking
export interface CT_ShapeLocking extends AG_Locking {
  extLst?: CT_OfficeArtExtensionList;
  noTextEdit?: boolean;
}

// Group locking
export interface CT_GroupLocking {
  extLst?: CT_OfficeArtExtensionList;
  noGrp?: boolean;
  noUngrp?: boolean;
  noSelect?: boolean;
  noRot?: boolean;
  noChangeAspect?: boolean;
  noMove?: boolean;
  noResize?: boolean;
}

// Graphical object frame locking
export interface CT_GraphicalObjectFrameLocking {
  extLst?: CT_OfficeArtExtensionList;
  noGrp?: boolean;
  noDrilldown?: boolean;
  noSelect?: boolean;
  noChangeAspect?: boolean;
  noMove?: boolean;
  noResize?: boolean;
}

// Non-visual drawing properties
export interface CT_NonVisualDrawingProps {
  hlinkClick?: CT_Hyperlink;
  hlinkHover?: CT_Hyperlink;
  extLst?: CT_OfficeArtExtensionList;
  id: ST_DrawingElementId;
  name: ST_String;
  descr?: ST_String;
  hidden?: boolean;
  title?: ST_String;
}

// Non-visual drawing shape properties
export interface CT_NonVisualDrawingShapeProps {
  spLocks?: CT_ShapeLocking;
  extLst?: CT_OfficeArtExtensionList;
  txBox?: boolean;
}

// Non-visual group drawing shape properties
export interface CT_NonVisualGroupDrawingShapeProps {
  grpSpLocks?: CT_GroupLocking;
  extLst?: CT_OfficeArtExtensionList;
}

// Non-visual graphic frame properties
export interface CT_NonVisualGraphicFrameProperties {
  graphicFrameLocks?: CT_GraphicalObjectFrameLocking;
  extLst?: CT_OfficeArtExtensionList;
}