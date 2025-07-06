import { Effect } from "effect";
import { debug } from "../../common/debug";
import type { 
  DocxTable, 
  DocxTableRow, 
  DocxTableCell,
  DocxTableCellProperties 
} from "./types";
import { DocxParseError } from "./types";

/**
 * Enhanced table cell properties including merge information
 */
export interface EnhancedDocxTableCellProperties extends DocxTableCellProperties {
  gridSpan?: number;  // Horizontal merge (colspan)
  vMerge?: "restart" | "continue";  // Vertical merge
  rowSpan?: number;  // Calculated from vMerge
}

/**
 * Enhanced table cell with merge information
 */
export interface EnhancedDocxTableCell extends DocxTableCell {
  properties?: EnhancedDocxTableCellProperties;
}

/**
 * Parse grid span (horizontal merge) from cell properties
 */
export const parseGridSpan = (tcPr: Element): number => {
  const gridSpan = tcPr.querySelector("gridSpan");
  if (gridSpan) {
    const val = gridSpan.getAttribute("w:val") || gridSpan.getAttribute("val");
    if (val) {
      const span = parseInt(val, 10);
      return isNaN(span) ? 1 : span;
    }
  }
  return 1;
};

/**
 * Parse vertical merge from cell properties
 */
export const parseVMerge = (tcPr: Element): "restart" | "continue" | undefined => {
  const vMerge = tcPr.querySelector("vMerge");
  if (vMerge) {
    const val = vMerge.getAttribute("w:val") || vMerge.getAttribute("val");
    if (val === "continue") {
      return "continue";
    }
    // If vMerge exists without val or val="restart", it's a restart
    return "restart";
  }
  return undefined;
};

/**
 * Calculate row spans for vertically merged cells
 */
export const calculateRowSpans = (table: DocxTable): Effect.Effect<DocxTable, DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Calculating row spans for merged cells");
    
    const enhancedTable = { ...table };
    const rowCount = table.rows.length;
    
    // Track vertical merge states by column index
    const vMergeStates: Map<number, { startRow: number; count: number }> = new Map();
    
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const row = table.rows[rowIndex];
      if (!row) continue;
      
      let colIndex = 0;
      
      for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
        const cell = row.cells[cellIndex] as EnhancedDocxTableCell;
        if (!cell) continue;
        
        const vMerge = cell.properties?.vMerge;
        const gridSpan = cell.properties?.gridSpan || 1;
        
        if (vMerge === "restart") {
          // Start tracking a new vertical merge
          vMergeStates.set(colIndex, { startRow: rowIndex, count: 1 });
        } else if (vMerge === "continue") {
          // Continue existing vertical merge
          const state = vMergeStates.get(colIndex);
          if (state) {
            state.count++;
            // Mark this cell as merged (could be hidden in rendering)
            if (cell.properties) {
              cell.properties.rowSpan = 0; // Indicates this cell is merged with above
            }
          }
        } else {
          // No vertical merge - finalize any existing merge
          const state = vMergeStates.get(colIndex);
          if (state && state.count > 1) {
            // Update the starting cell with the total row span
            const startRow = enhancedTable.rows[state.startRow];
            if (startRow && startRow.cells[cellIndex]) {
              const startCell = startRow.cells[cellIndex] as EnhancedDocxTableCell;
              if (startCell.properties) {
                startCell.properties.rowSpan = state.count;
              }
            }
          }
          vMergeStates.delete(colIndex);
        }
        
        colIndex += gridSpan;
      }
    }
    
    // Finalize any remaining merges
    for (const [colIndex, state] of vMergeStates.entries()) {
      if (state.count > 1) {
        const startRow = enhancedTable.rows[state.startRow];
        if (startRow) {
          // Find the cell at this column index
          let currentCol = 0;
          for (const cell of startRow.cells) {
            const enhancedCell = cell as EnhancedDocxTableCell;
            const span = enhancedCell.properties?.gridSpan || 1;
            if (currentCol === colIndex) {
              if (enhancedCell.properties) {
                enhancedCell.properties.rowSpan = state.count;
              }
              break;
            }
            currentCol += span;
          }
        }
      }
    }
    
    return enhancedTable;
  });

/**
 * Check if a table contains nested tables
 * Note: Current implementation doesn't support nested tables in cell content
 * This is a placeholder for future enhancement
 */
export const hasNestedTables = (table: DocxTable): boolean => {
  // Currently, cell content only contains paragraphs
  // In a full implementation, we would need to extend DocxTableCell
  // to support both paragraphs and nested tables in content
  return false;
};

/**
 * Extract table style information
 */
export interface TableStyle {
  name?: string;
  firstRowFormatting?: boolean;
  lastRowFormatting?: boolean;
  firstColumnFormatting?: boolean;
  lastColumnFormatting?: boolean;
  rowBanding?: boolean;
  columnBanding?: boolean;
}

/**
 * Parse table style from table properties
 */
export const parseTableStyle = (tblPr: Element): TableStyle => {
  const style: TableStyle = {};
  
  // Get table style name
  const tblStyle = tblPr.querySelector("tblStyle");
  if (tblStyle) {
    const val = tblStyle.getAttribute("w:val") || tblStyle.getAttribute("val");
    if (val) {
      style.name = val;
    }
  }
  
  // Parse table look options
  const tblLook = tblPr.querySelector("tblLook");
  if (tblLook) {
    style.firstRowFormatting = tblLook.getAttribute("w:firstRow") === "1";
    style.lastRowFormatting = tblLook.getAttribute("w:lastRow") === "1";
    style.firstColumnFormatting = tblLook.getAttribute("w:firstColumn") === "1";
    style.lastColumnFormatting = tblLook.getAttribute("w:lastColumn") === "1";
    style.rowBanding = tblLook.getAttribute("w:noHBand") !== "1";
    style.columnBanding = tblLook.getAttribute("w:noVBand") !== "1";
  }
  
  return style;
};

/**
 * Convert table with enhanced features to markdown
 * This handles merged cells by adding HTML table syntax when needed
 */
export const convertEnhancedTableToMarkdown = (
  table: DocxTable, 
  useHtmlForComplexTables: boolean = true
): string => {
  // Check if table has complex features requiring HTML
  const hasMergedCells = table.rows.some(row => 
    row.cells.some(cell => {
      const props = cell.properties as EnhancedDocxTableCellProperties;
      return (props?.gridSpan && props.gridSpan > 1) || 
             (props?.rowSpan && props.rowSpan > 1);
    })
  );
  
  const hasNestedTable = hasNestedTables(table);
  
  if (useHtmlForComplexTables && (hasMergedCells || hasNestedTable)) {
    return convertTableToHtml(table);
  }
  
  // Otherwise use standard markdown (delegate to existing function)
  // This would use the existing convertTableToMarkdown function
  return "";
};

/**
 * Convert table to HTML for complex features
 */
const convertTableToHtml = (table: DocxTable): string => {
  const lines: string[] = ["<table>"];
  
  for (const row of table.rows) {
    lines.push("  <tr>");
    
    for (const cell of row.cells) {
      const props = cell.properties as EnhancedDocxTableCellProperties;
      const tag = row.properties?.isHeader ? "th" : "td";
      
      let attrs = "";
      if (props?.gridSpan && props.gridSpan > 1) {
        attrs += ` colspan="${props.gridSpan}"`;
      }
      if (props?.rowSpan && props.rowSpan > 1) {
        attrs += ` rowspan="${props.rowSpan}"`;
      }
      
      const content = cell.content
        .map(p => p.runs.map(r => r.text).join(""))
        .join("<br>");
      
      lines.push(`    <${tag}${attrs}>${content}</${tag}>`);
    }
    
    lines.push("  </tr>");
  }
  
  lines.push("</table>");
  return lines.join("\n");
};