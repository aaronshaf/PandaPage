import type { Table } from "@browser-document-viewer/parser";
import { renderEnhancedTable as renderEnhancedTableWithVisualFidelity } from "./enhanced-table-utils";

/**
 * Render table with enhanced visual fidelity for complex OOXML features
 * This function should be used for tables with borders, shading, or complex cell formatting
 */
export function renderComplexTable(
  table: Table,
  doc: Document,
  renderParagraph: (paragraph: any) => HTMLElement,
): HTMLElement {
  // Check if table has complex formatting that requires enhanced rendering
  if (table.borders || table.shading || hasComplexCellFormatting(table)) {
    // Create a temporary container to hold the HTML string result
    const tempDiv = doc.createElement('div');
    tempDiv.innerHTML = renderEnhancedTableWithVisualFidelity(table);
    const enhancedTable = tempDiv.querySelector('table');
    
    if (enhancedTable) {
      // Replace simplified paragraph rendering with proper DOM-based rendering
      const cells = enhancedTable.querySelectorAll('td, th');
      cells.forEach((cell, index) => {
        // Find corresponding cell in original table structure
        const { rowIndex, cellIndex } = getCellIndices(index, table);
        const originalCell = table.rows[rowIndex]?.cells[cellIndex];
        
        if (originalCell?.paragraphs) {
          // Clear the cell and re-render with proper DOM
          cell.innerHTML = '';
          originalCell.paragraphs.forEach((para) => {
            const p = renderParagraph(para);
            cell.appendChild(p);
          });
        }
      });
      
      return enhancedTable as HTMLElement;
    }
  }
  
  // Fallback to simple table rendering
  return renderEnhancedTable(table, doc, renderParagraph);
}

export function renderEnhancedTable(
  table: Table,
  doc: Document,
  renderParagraph: (paragraph: any) => HTMLElement,
): HTMLElement {
  // Always use the original DOM-based renderer for compatibility with existing tests and functionality
  // The enhanced table renderer can be used separately for documents with complex table formatting
  const tableEl = doc.createElement("table");
  tableEl.className = "table-fancy";

  // Track merged cells to avoid rendering them multiple times
  const mergedCells = new Set<string>();

  table.rows.forEach((row, rowIndex) => {
    const tr = doc.createElement("tr");

    row.cells.forEach((cell, cellIndex) => {
      const cellKey = `${rowIndex}-${cellIndex}`;

      // Skip if this cell is part of a merged cell
      if (mergedCells.has(cellKey)) return;

      const isHeader = rowIndex === 0;
      const cellEl = doc.createElement(isHeader ? "th" : "td");

      // Handle cell merging
      if (cell.rowspan && cell.rowspan > 1) {
        cellEl.rowSpan = cell.rowspan;
        cellEl.classList.add("cell-merged");

        // Mark cells that are covered by this merged cell
        for (let i = 1; i < cell.rowspan; i++) {
          mergedCells.add(`${rowIndex + i}-${cellIndex}`);
        }
      }

      if (cell.colspan && cell.colspan > 1) {
        cellEl.colSpan = cell.colspan;
        cellEl.classList.add("cell-merged");

        // Mark cells that are covered by this merged cell
        for (let j = 1; j < cell.colspan; j++) {
          mergedCells.add(`${rowIndex}-${cellIndex + j}`);
        }
      }

      // Handle cells merged both horizontally and vertically
      if (cell.rowspan && cell.rowspan > 1 && cell.colspan && cell.colspan > 1) {
        for (let i = 0; i < cell.rowspan; i++) {
          for (let j = 0; j < cell.colspan; j++) {
            if (i > 0 || j > 0) {
              mergedCells.add(`${rowIndex + i}-${cellIndex + j}`);
            }
          }
        }
      }

      // Apply cell-specific styles
      if (cell.verticalAlignment) {
        // Map document vertical alignment to CSS vertical-align values
        const verticalAlignMap: Record<string, string> = {
          top: "top",
          center: "middle", // CSS uses 'middle' not 'center'
          bottom: "bottom",
        };
        cellEl.style.verticalAlign =
          verticalAlignMap[cell.verticalAlignment] || cell.verticalAlignment;
      }

      // Render cell content
      if (cell.paragraphs) {
        cell.paragraphs.forEach((para) => {
          const p = renderParagraph(para);
          cellEl.appendChild(p);
        });
      }

      tr.appendChild(cellEl);
    });

    tableEl.appendChild(tr);
  });

  return tableEl;
}

/**
 * Check if table has complex cell formatting that requires enhanced rendering
 */
function hasComplexCellFormatting(table: Table): boolean {
  return table.rows.some(row => 
    row.cells.some(cell => 
      cell.borders || cell.shading || cell.colspan || cell.rowspan
    )
  );
}

/**
 * Get row and cell indices from flat cell index
 */
function getCellIndices(flatIndex: number, table: Table): { rowIndex: number; cellIndex: number } {
  let currentIndex = 0;
  
  for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
    const row = table.rows[rowIndex];
    if (!row) continue;
    for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
      if (currentIndex === flatIndex) {
        return { rowIndex, cellIndex };
      }
      currentIndex++;
    }
  }
  
  return { rowIndex: 0, cellIndex: 0 };
}
