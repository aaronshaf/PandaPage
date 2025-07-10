// Main index file for ooxml-types
// Explicit re-exports to resolve ambiguity

// ===== SHARED TYPES (Base layer) =====
export * from "./shared-types";
export * from "./utility-types";

// ===== PRIMARY MODULE TYPES =====

// Bibliography types (no conflicts)
export * from "./bibliography-types";

// Variant types (no conflicts)
export * from "./variant-types";

// Extended properties with renamed conflict
export type { CT_Properties as CT_ExtendedProperties } from "./extended-properties-types";

// ===== MAIN DOCUMENT TYPES WITH CONFLICT RESOLUTION =====

// WordprocessingML - Export everything, this will be the canonical source for shared types
export * from "./wml";

// DrawingML - Export only non-conflicting types, rename conflicts
export type {
  // All DML types except those that conflict with WML
  CT_OfficeArtExtensionList,
  CT_AudioFile,
  CT_VideoFile,
  CT_QuickTimeFile,
  CT_AudioCDTime,
  CT_AudioCD,
  EG_Media,
  ST_StyleMatrixColumnIndex,
  ST_FontCollectionIndex,
  ST_ColorSchemeIndex,
  CT_ColorScheme,
  CT_CustomColor,
  CT_SupplementalFont,
  CT_CustomColorList,
  CT_TextFont,
  // Add more specific exports as needed
} from "./dml-main";

// Rename DML conflicts
export type { CT_Color as CT_DMLColor } from "./dml-main";
export type { CT_Empty as CT_DMLEmpty } from "./dml-main";
export type { CT_Hyperlink as CT_DMLHyperlink } from "./dml-main";

// SpreadsheetML - Export only non-conflicting types
export type {} from // Add specific SML exports here
"./sml";

// PresentationML - Export only non-conflicting types
export type {} from // Add specific PML exports here
"./pml";

// Math types - Export only non-conflicting types, rename conflicts
export type { CT_R as CT_MathRun } from "./math-types";
export type { CT_TwipsMeasure as CT_MathTwipsMeasure } from "./math-types";

// Chart types with renamed conflict
export type { CT_Shape as CT_ChartShape } from "./chart-formatting-types";

// Specialized drawing types with renamed conflicts
export type {
  CT_Picture as CT_ChartDrawingPicture,
  CT_PictureNonVisual as CT_ChartDrawingPictureNonVisual,
  CT_Connector as CT_ChartDrawingConnector,
  CT_ConnectorNonVisual as CT_ChartDrawingConnectorNonVisual,
  CT_GroupShape as CT_ChartDrawingGroupShape,
  CT_GroupShapeNonVisual as CT_ChartDrawingGroupShapeNonVisual,
  CT_ShapeNonVisual as CT_ChartDrawingShapeNonVisual,
} from "./chart-drawing-types";

// Diagram types with renamed conflict
export type { ST_TextDirection as ST_DiagramTextDirection } from "./diagram-types";

// Picture types
export * from "./picture-types";

// Spreadsheet drawing types with renamed conflicts
export type {
  CT_Picture as CT_SpreadsheetDrawingPicture,
  CT_Connector as CT_SpreadsheetDrawingConnector,
  CT_ConnectorNonVisual as CT_SpreadsheetDrawingConnectorNonVisual,
  CT_GroupShape as CT_SpreadsheetDrawingGroupShape,
  CT_GroupShapeNonVisual as CT_SpreadsheetDrawingGroupShapeNonVisual,
  CT_ShapeNonVisual as CT_SpreadsheetDrawingShapeNonVisual,
  CT_GraphicalObjectFrame as CT_SpreadsheetDrawingGraphicalObjectFrame,
  CT_GraphicalObjectFrameNonVisual as CT_SpreadsheetDrawingGraphicalObjectFrameNonVisual,
} from "./spreadsheet-drawing-types";

// Wordprocessing drawing types
export * from "./wordprocessing-drawing-types";

// Spreadsheet types with renamed conflicts
export type {
  CT_CommentList as CT_SpreadsheetCommentList,
  CT_Comment as CT_SpreadsheetComment,
} from "./spreadsheet-types";

// Presentation types with renamed conflicts
export type {
  CT_Comment as CT_PresentationComment,
  CT_HeaderFooter as CT_PresentationHeaderFooter,
  ST_Direction as ST_SlideDirection,
  CT_Shape as CT_PresentationShape,
} from "./presentation-types";
