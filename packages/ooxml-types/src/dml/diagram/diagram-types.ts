/**
 * DrawingML Diagram Types
 * Based on dml-diagram.xsd definitions
 */

/**
 * Diagram text direction (unique name to avoid conflicts)
 */
export type ST_DMLDiagramTextDirection = 'horz' | 'vert' | 'vert270';

/**
 * Diagram definition
 */
export interface CT_DMLDiagram {
  /** Unique identifier */
  id?: string;
  /** Minimum version */
  minVer?: string;
  /** Title */
  title?: string;
  /** Description */
  desc?: string;
  /** Categories */
  catLst?: CT_DMLCategories;
  /** Sample data */
  sampData?: any; // CT_SampleData
  /** Style data */
  styleData?: any; // CT_SampleData
  /** Color data */
  colorData?: any; // CT_SampleData
  /** Layout definition */
  layoutDef?: any; // CT_LayoutDef
}

/**
 * Diagram categories
 */
export interface CT_DMLCategories {
  /** Category */
  cat?: CT_DMLCategory[];
}

/**
 * Diagram category
 */
export interface CT_DMLCategory {
  /** Type */
  type?: string;
  /** Priority */
  pri?: number;
}