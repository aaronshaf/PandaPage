import type { Table, TableRow, TableCell } from "@browser-document-viewer/parser";

export function renderEnhancedTable(
  table: Table,
  doc: Document,
  renderParagraph: (paragraph: any) => HTMLElement,
): HTMLElement {
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
