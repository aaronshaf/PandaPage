/**
 * Processing types for internal document manipulation
 * These interfaces extend the base types with temporary properties
 * used during parsing and rendering operations
 */

import type { TableCell } from "./index";

/**
 * Internal interface for table cells during processing
 * Extends TableCell with temporary properties used during vMerge calculation
 */
export interface ProcessingTableCell extends TableCell {
  /** Temporary property to track vMerge state during parsing */
  _vMerge?: "restart" | "continue";
  /** Temporary property to mark cells that should be hidden due to merging */
  _merged?: boolean;
}