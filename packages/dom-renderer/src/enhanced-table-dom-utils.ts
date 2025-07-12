/**
 * Enhanced table DOM rendering utilities with comprehensive OOXML support
 * Provides visual fidelity for complex table features using proper DOM construction
 */

import type { Table, TableCell, TableBorder, TableShading } from "@browser-document-viewer/parser";
import type { ProcessingTableCell } from "@browser-document-viewer/document-types";
import type { ST_Border, ST_Shd } from "@browser-document-viewer/ooxml-types";
import { validateColor, validateCSSValue, validateNumeric, validateBorderStyle } from "./css-validation";
import { convertBorderStyleToCSS, convertShadingToCSS, generateBorderCSS } from "./enhanced-table-utils";

/**
 * Apply table-level styles to a table element
 */
export function applyTableStyles(
  tableEl: HTMLTableElement,
  table: Table,
  doc: Document
): void {
  // Add CSS classes
  tableEl.classList.add("doc-table", "doc-table-enhanced");
  if (table.borders || table.shading) {
    tableEl.classList.add("doc-table-fancy");
  }

  // Apply base styles
  tableEl.style.borderCollapse = "separate";
  tableEl.style.borderSpacing = "0";
  tableEl.style.tableLayout = "auto";

  // Apply table width with proper validation
  if (table.width && table.width > 0) {
    const validatedWidth = validateNumeric(table.width, 100, 10000, 800);
    tableEl.style.width = `${validatedWidth}px`;
  } else {
    tableEl.style.width = "100%";
  }

  // Apply table cell margins as border-spacing
  if (table.cellMargin) {
    const marginTop = table.cellMargin.top ? table.cellMargin.top / 20 : 0;
    const marginBottom = table.cellMargin.bottom ? table.cellMargin.bottom / 20 : 0;
    const marginLeft = table.cellMargin.left ? table.cellMargin.left / 20 : 0;
    const marginRight = table.cellMargin.right ? table.cellMargin.right / 20 : 0;
    
    if (marginTop > 0 || marginLeft > 0) {
      const validatedSpacingV = validateNumeric(marginTop, 0, 20, 0);
      const validatedSpacingH = validateNumeric(marginLeft, 0, 20, 0);
      tableEl.style.borderSpacing = `${validatedSpacingH}pt ${validatedSpacingV}pt`;
    }
  }

  // Apply table borders
  if (table.borders) {
    if (table.borders.top) {
      tableEl.style.borderTop = generateBorderCSS(table.borders.top);
    }
    if (table.borders.bottom) {
      tableEl.style.borderBottom = generateBorderCSS(table.borders.bottom);
    }
    if (table.borders.left) {
      tableEl.style.borderLeft = generateBorderCSS(table.borders.left);
    }
    if (table.borders.right) {
      tableEl.style.borderRight = generateBorderCSS(table.borders.right);
    }
  }

  // Apply table shading
  if (table.shading) {
    const shadingCSS = convertShadingToCSS(table.shading);
    if (shadingCSS) {
      // Parse the CSS string and apply properties
      const match = shadingCSS.match(/^([^:]+):\s*(.+)$/);
      if (match && match[1] && match[2]) {
        const property = match[1].trim();
        const value = match[2].trim();
        (tableEl.style as any)[property] = value;
      }
    }
  }

  // Add style element for inside borders if present
  if (table.borders?.insideH || table.borders?.insideV) {
    const styleEl = doc.createElement("style");
    const tableId = `table-${Math.random().toString(36).substring(2, 11)}`;
    tableEl.id = tableId;
    
    let css = "";
    if (table.borders.insideH) {
      const hBorder = generateBorderCSS(table.borders.insideH);
      css += `
        #${tableId} tr:not(:last-child) td {
          border-bottom: ${hBorder};
        }
      `;
    }
    
    if (table.borders.insideV) {
      const vBorder = generateBorderCSS(table.borders.insideV);
      css += `
        #${tableId} td:not(:last-child) {
          border-right: ${vBorder};
        }
      `;
    }
    
    styleEl.textContent = css;
    tableEl.appendChild(styleEl);
  }
}

/**
 * Apply cell-level styles to a table cell element
 */
export function applyCellStyles(
  cellEl: HTMLTableCellElement,
  cell: TableCell,
  isHeaderRow: boolean = false
): void {
  // Base styles
  cellEl.style.verticalAlign = "top";

  // Apply cell margins as padding (converted from twips to points)
  let paddingTop = 8;
  let paddingBottom = 8;
  let paddingLeft = 8;
  let paddingRight = 8;

  if (cell.margin) {
    // Convert twips to points (1 point = 20 twips)
    if (cell.margin.top !== undefined) paddingTop = cell.margin.top / 20;
    if (cell.margin.bottom !== undefined) paddingBottom = cell.margin.bottom / 20;
    if (cell.margin.left !== undefined) paddingLeft = cell.margin.left / 20;
    if (cell.margin.right !== undefined) paddingRight = cell.margin.right / 20;
  }

  // Apply validated padding
  const validatedPaddingTop = validateNumeric(paddingTop, 0, 50, 8);
  const validatedPaddingBottom = validateNumeric(paddingBottom, 0, 50, 8);
  const validatedPaddingLeft = validateNumeric(paddingLeft, 0, 50, 8);
  const validatedPaddingRight = validateNumeric(paddingRight, 0, 50, 8);

  cellEl.style.padding = `${validatedPaddingTop}pt ${validatedPaddingRight}pt ${validatedPaddingBottom}pt ${validatedPaddingLeft}pt`;

  // Apply cell spanning
  if (cell.colspan && cell.colspan > 1) {
    cellEl.colSpan = cell.colspan;
    cellEl.classList.add("cell-merged");
  }
  if (cell.rowspan && cell.rowspan > 1) {
    cellEl.rowSpan = cell.rowspan;
    cellEl.classList.add("cell-merged");
  }

  // Apply vertical alignment
  if (cell.verticalAlignment) {
    const alignMap = {
      top: "top",
      center: "middle", 
      bottom: "bottom",
    };
    cellEl.style.verticalAlign = alignMap[cell.verticalAlignment] || "top";
  }

  // Apply cell borders
  if (cell.borders) {
    const borderNames = ["top", "bottom", "left", "right"] as const;
    for (const borderName of borderNames) {
      const border = cell.borders[borderName];
      if (border) {
        const borderCSS = generateBorderCSS(border);
        (cellEl.style as any)[`border${borderName.charAt(0).toUpperCase() + borderName.slice(1)}`] = borderCSS;
      }
    }

    // Apply diagonal borders using pseudo-elements
    if (cell.borders.tl2br || cell.borders.tr2bl) {
      cellEl.style.position = "relative";
      
      // Create diagonal border overlays
      if (cell.borders.tl2br) {
        const diagonalEl = cellEl.ownerDocument.createElement("div");
        diagonalEl.style.position = "absolute";
        diagonalEl.style.top = "0";
        diagonalEl.style.left = "0";
        diagonalEl.style.width = "100%";
        diagonalEl.style.height = "100%";
        diagonalEl.style.background = `linear-gradient(to bottom right, transparent 49%, ${cell.borders.tl2br.color || "#000000"} 49%, ${cell.borders.tl2br.color || "#000000"} 51%, transparent 51%)`;
        diagonalEl.style.pointerEvents = "none";
        cellEl.appendChild(diagonalEl);
      }
    }
  }

  // Apply cell shading
  if (cell.shading) {
    const shadingCSS = convertShadingToCSS(cell.shading);
    if (shadingCSS) {
      // Parse and apply the CSS
      const match = shadingCSS.match(/^([^:]+):\s*(.+)$/);
      if (match && match[1] && match[2]) {
        const property = match[1].trim();
        const value = match[2].trim();
        (cellEl.style as any)[property] = value;
      }
    }
  }

  // Apply cell width
  if (cell.width) {
    let width = cell.width;
    if (typeof width === 'number') {
      width = width / 20; // Convert twips to points
      const validatedWidth = validateNumeric(width, 10, 1000, 100);
      cellEl.style.width = `${validatedWidth}pt`;
    } else {
      const validatedWidth = validateCSSValue(width);
      if (validatedWidth) {
        cellEl.style.width = validatedWidth;
      }
    }
  }

  // Apply text direction with proper vertical text support
  if (cell.textDirection) {
    switch (cell.textDirection) {
      case "ltr":
        cellEl.style.direction = "ltr";
        break;
      case "rtl":
        cellEl.style.direction = "rtl";
        break;
      case "lrV":
        cellEl.style.writingMode = "vertical-lr";
        cellEl.style.textOrientation = "mixed";
        cellEl.classList.add("vertical-text");
        break;
      case "tbV":
        cellEl.style.writingMode = "vertical-rl";
        cellEl.style.textOrientation = "upright";
        cellEl.classList.add("vertical-text");
        break;
      case "lrTbV":
        cellEl.style.writingMode = "vertical-lr";
        cellEl.style.textOrientation = "upright";
        cellEl.classList.add("vertical-text-lr");
        break;
      case "tbLrV":
        cellEl.style.writingMode = "vertical-rl";
        cellEl.style.textOrientation = "mixed";
        cellEl.classList.add("vertical-text");
        break;
      default:
        cellEl.style.direction = "ltr";
    }
  }
}

/**
 * Create a responsive table wrapper
 */
export function createTableWrapper(doc: Document): HTMLDivElement {
  const wrapper = doc.createElement("div");
  wrapper.classList.add("doc-table-wrapper");
  return wrapper;
}

/**
 * Render an enhanced table with DOM construction
 */
export function renderEnhancedTableDOM(
  table: Table,
  doc: Document,
  renderParagraph: (paragraph: any) => HTMLElement
): HTMLElement {
  // Create wrapper for responsive behavior
  const wrapper = createTableWrapper(doc);
  
  // Create table element
  const tableEl = doc.createElement("table");
  applyTableStyles(tableEl, table, doc);
  
  // Create table body
  const tbody = doc.createElement("tbody");
  
  // Track merged cells
  const mergedCells = new Set<string>();
  
  // Render rows
  for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
    const row = table.rows[rowIndex];
    if (!row) continue;
    
    const tr = doc.createElement("tr");
    
    let cellIndex = 0;
    for (const cell of row.cells) {
      // Skip cells marked as merged
      if ((cell as ProcessingTableCell)._merged) continue;
      
      const cellKey = `${rowIndex}-${cellIndex}`;
      if (mergedCells.has(cellKey)) {
        cellIndex++;
        continue;
      }
      
      // Create cell element
      const isHeader = rowIndex === 0;
      const cellEl = doc.createElement(isHeader ? "th" : "td");
      
      // Apply cell styles
      applyCellStyles(cellEl, cell, isHeader);
      
      // Track merged cells for rowspan
      if (cell.rowspan && cell.rowspan > 1) {
        for (let i = 1; i < cell.rowspan; i++) {
          mergedCells.add(`${rowIndex + i}-${cellIndex}`);
        }
      }
      
      // Render cell content
      for (const paragraph of cell.paragraphs) {
        const p = renderParagraph(paragraph);
        cellEl.appendChild(p);
      }
      
      tr.appendChild(cellEl);
      cellIndex++;
    }
    
    tbody.appendChild(tr);
  }
  
  tableEl.appendChild(tbody);
  wrapper.appendChild(tableEl);
  
  return wrapper;
}