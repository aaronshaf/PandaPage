/**
 * DrawingML Drawing Types
 * Based on dml-main.xsd drawing definitions
 */

/**
 * Non-visual drawing properties
 */
export interface CT_DMLNonVisualDrawingProps {
  /** ID */
  id: number;
  /** Name */
  name: string;
  /** Description */
  descr?: string;
  /** Hidden */
  hidden?: boolean;
  /** Title */
  title?: string;
  /** Hyperlink click */
  hlinkClick?: any; // CT_Hyperlink
  /** Hyperlink hover */
  hlinkHover?: any; // CT_Hyperlink
  /** Extension list */
  extLst?: any; // CT_OfficeArtExtensionList
}

/**
 * Non-visual group drawing properties
 */
export interface CT_DMLNonVisualGroupDrawingShapeProps {
  /** Group shape locks */
  grpSpLocks?: any; // CT_GroupShapeLocks
  /** Extension list */
  extLst?: any; // CT_OfficeArtExtensionList
}

/**
 * Non-visual connector properties
 */
export interface CT_DMLNonVisualConnectorProperties {
  /** Connector locks */
  cxnSpLocks?: any; // CT_ConnectorLocks
  /** Start connection */
  stCxn?: CT_DMLConnection;
  /** End connection */
  endCxn?: CT_DMLConnection;
  /** Extension list */
  extLst?: any; // CT_OfficeArtExtensionList
}

/**
 * Connection
 */
export interface CT_DMLConnection {
  /** ID */
  id: number;
  /** Index */
  idx: number;
}

/**
 * Non-visual picture properties
 */
export interface CT_DMLNonVisualPictureProperties {
  /** Picture locks */
  picLocks?: any; // CT_PictureLocks
  /** Extension list */
  extLst?: any; // CT_OfficeArtExtensionList
  /** Prefer relative resize */
  preferRelativeResize?: boolean;
}
