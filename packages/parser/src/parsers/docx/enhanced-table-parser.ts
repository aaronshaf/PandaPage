/**
 * Enhanced table parsing with comprehensive OOXML types support for 005.docx fidelity
 */

import type {
  Table,
  TableRow,
  TableCell,
  Paragraph,
  TableBorders,
  TableShading,
  TableCellBorders,
  TableBorder,
} from "../../types/document";
import type { ProcessingTableCell } from "@browser-document-viewer/document-types";
import type {
  CT_TblPr,
  CT_TblBorders,
  CT_TcPr,
  CT_TcBorders,
  CT_VMerge,
  ST_Merge,
  ST_VerticalJc,
  CT_Border,
  CT_Shd,
  ST_Border,
  ST_Shd,
} from "@browser-document-viewer/ooxml-types";
import { parseParagraph } from "./paragraph-parser";
import type { DocxTheme } from "./theme-parser";
import type { DocxStylesheet } from "./style-parser";
import { getElementByTagNameNSFallback, getElementsByTagNameNSFallback } from "./xml-utils";

/**
 * Calculate rowspans for cells with vMerge properties
 * This processes the table after parsing to properly set rowspan values
 */
export function calculateRowSpans(table: Table): void {
  const numCols = Math.max(...table.rows.map((row) => row.cells.length));

  // Track which cells are part of a vertical merge
  const mergedCells = new Set<string>();

  // Process each column
  for (let colIndex = 0; colIndex < numCols; colIndex++) {
    let rowspanStart = -1;
    let rowspanCount = 0;

    // Process each row in the column
    for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
      const row = table.rows[rowIndex];
      if (!row || !row.cells[colIndex]) continue;

      const cell = row.cells[colIndex] as ProcessingTableCell;
      const vMerge = cell._vMerge;

      if (vMerge === "restart") {
        // Start of a new merged region
        rowspanStart = rowIndex;
        rowspanCount = 1;
      } else if (vMerge === "continue" && rowspanStart !== -1) {
        // Continuation of a merged region
        rowspanCount++;
        // Mark this cell as merged (it should not be rendered)
        mergedCells.add(`${rowIndex}-${colIndex}`);
        // Hide this cell by marking it
        (cell as ProcessingTableCell)._merged = true;
      } else if (rowspanStart !== -1) {
        // End of merged region (cell without vMerge after a merge)
        if (rowspanCount > 1) {
          // Set the rowspan on the starting cell
          const startCell = table.rows[rowspanStart]?.cells[colIndex];
          if (startCell) {
            startCell.rowspan = rowspanCount;
          }
        }
        rowspanStart = -1;
        rowspanCount = 0;
      }
    }

    // Handle case where merge extends to the last row
    if (rowspanStart !== -1 && rowspanCount > 1) {
      const startCell = table.rows[rowspanStart]?.cells[colIndex];
      if (startCell) {
        startCell.rowspan = rowspanCount;
      }
    }
  }

  // Clean up temporary vMerge properties but keep _merged for rendering
  for (const row of table.rows) {
    for (const cell of row.cells) {
      const processingCell = cell as ProcessingTableCell;
      delete processingCell._vMerge;
    }
  }
}

/**
 * Parse enhanced table border element with full OOXML type support
 */
export function parseEnhancedTableBorder(borderElement: Element | null): TableBorder | undefined {
  if (!borderElement) return undefined;

  const border: TableBorder = {};

  // Border style using OOXML ST_Border enum
  const val = borderElement.getAttribute("w:val") as ST_Border | null;
  if (val && val !== "nil" && val !== "none") {
    border.style = val;
  }

  // Border color
  const color = borderElement.getAttribute("w:color");
  if (color && color !== "auto") {
    border.color = color.startsWith("#") ? color : `#${color}`;
  }

  // Border size (in eighths of a point) - OOXML specification
  const size = borderElement.getAttribute("w:sz");
  if (size) {
    const sizeValue = parseInt(size, 10);
    border.width = sizeValue > 0 ? sizeValue / 8 : undefined; // Convert to points
  }

  return Object.keys(border).length > 0 ? border : undefined;
}

/**
 * Parse enhanced table borders with comprehensive support
 */
function parseEnhancedTableBorders(tblBordersElement: Element | null): TableBorders | undefined {
  if (!tblBordersElement) return undefined;

  const borders: TableBorders = {};

  // Parse all border types with proper OOXML support
  const borderMappings = [
    { name: "top", prop: "top" as keyof TableBorders },
    { name: "bottom", prop: "bottom" as keyof TableBorders },
    { name: "left", prop: "left" as keyof TableBorders },
    { name: "start", prop: "left" as keyof TableBorders }, // start maps to left
    { name: "right", prop: "right" as keyof TableBorders },
    { name: "end", prop: "right" as keyof TableBorders }, // end maps to right
    { name: "insideH", prop: "insideH" as keyof TableBorders },
    { name: "insideV", prop: "insideV" as keyof TableBorders },
  ];

  for (const { name, prop } of borderMappings) {
    const borderElement = getElementByTagNameNSFallback(tblBordersElement, "w", name);
    const border = parseEnhancedTableBorder(borderElement);
    if (border) {
      borders[prop] = border;
    }
  }

  return Object.keys(borders).length > 0 ? borders : undefined;
}

/**
 * Parse enhanced table cell borders
 */
function parseEnhancedTableCellBorders(
  tcBordersElement: Element | null,
): TableCellBorders | undefined {
  if (!tcBordersElement) return undefined;

  const borders: TableCellBorders = {};

  // Parse all cell border types
  const borderMappings = [
    { name: "top", prop: "top" as keyof TableCellBorders },
    { name: "bottom", prop: "bottom" as keyof TableCellBorders },
    { name: "left", prop: "left" as keyof TableCellBorders },
    { name: "start", prop: "left" as keyof TableCellBorders },
    { name: "right", prop: "right" as keyof TableCellBorders },
    { name: "end", prop: "right" as keyof TableCellBorders },
    { name: "tl2br", prop: "tl2br" as keyof TableCellBorders },
    { name: "tr2bl", prop: "tr2bl" as keyof TableCellBorders },
  ];

  for (const { name, prop } of borderMappings) {
    const borderElement = getElementByTagNameNSFallback(tcBordersElement, "w", name);
    const border = parseEnhancedTableBorder(borderElement);
    if (border) {
      borders[prop] = border;
    }
  }

  return Object.keys(borders).length > 0 ? borders : undefined;
}

/**
 * Parse enhanced shading with full OOXML type support
 */
function parseEnhancedShading(shdElement: Element | null): TableShading | undefined {
  if (!shdElement) return undefined;

  const shading: TableShading = {};

  // Shading pattern using OOXML ST_Shd enum
  const val = shdElement.getAttribute("w:val") as ST_Shd | null;
  if (val) {
    shading.pattern = val;
  }

  // Fill color (background)
  const fill = shdElement.getAttribute("w:fill");
  if (fill && fill !== "auto") {
    shading.fill = fill.startsWith("#") ? fill : `#${fill}`;
  }

  // Pattern color (foreground)
  const color = shdElement.getAttribute("w:color");
  if (color && color !== "auto") {
    shading.color = color.startsWith("#") ? color : `#${color}`;
  }

  return Object.keys(shading).length > 0 ? shading : undefined;
}

/**
 * Parse enhanced table cell with comprehensive OOXML support
 */
export function parseEnhancedTableCell(
  cellElement: Element,
  relationships: Map<string, string>,
  theme: DocxTheme | undefined,
  stylesheet: DocxStylesheet | undefined,
): TableCell {
  const cell: TableCell = {
    paragraphs: [],
  };

  // Parse paragraphs in the cell
  const paragraphElements = getElementsByTagNameNSFallback(cellElement, "w", "p");
  for (const pElement of paragraphElements) {
    const paragraph = parseParagraph(
      pElement,
      relationships,
      undefined,
      undefined,
      stylesheet,
      theme,
    );
    if (paragraph) {
      // Convert DocxParagraph to Paragraph type
      const convertedParagraph: Paragraph = {
        type: "paragraph",
        runs: paragraph.runs.map((run) => ({
          text: run.text,
          bold: run.bold,
          italic: run.italic,
          underline: run.underline,
          strikethrough: run.strikethrough,
          superscript: run.superscript,
          subscript: run.subscript,
          fontSize: run.fontSize ? Math.round(parseInt(run.fontSize) / 2) : undefined,
          fontFamily: run.fontFamily,
          color: run.color ? `#${run.color}` : undefined,
          backgroundColor: run.backgroundColor,
          link: run.link,
        })),
        style: paragraph.style,
        alignment: paragraph.alignment,
        ...(paragraph.framePr && { framePr: paragraph.framePr }),
      };
      cell.paragraphs.push(convertedParagraph);
    }
  }

  // Parse table cell properties (tcPr) with enhanced OOXML support
  const tcPrElement = getElementByTagNameNSFallback(cellElement, "w", "tcPr");
  if (tcPrElement) {
    // Grid span (column spanning)
    const gridSpanElement = getElementByTagNameNSFallback(tcPrElement, "w", "gridSpan");
    if (gridSpanElement) {
      const gridSpanVal = gridSpanElement.getAttribute("w:val");
      if (gridSpanVal) {
        cell.colspan = parseInt(gridSpanVal, 10);
      }
    }

    // Vertical merge (row spanning)
    const vMergeElement = getElementByTagNameNSFallback(tcPrElement, "w", "vMerge");
    if (vMergeElement) {
      const vMergeVal = vMergeElement.getAttribute("w:val") as ST_Merge | null;
      // Mark the cell with vMerge info for post-processing
      (cell as ProcessingTableCell)._vMerge = vMergeVal || "continue"; // If no val attribute, it's implicitly "continue"
    }

    // Vertical alignment
    const vAlignElement = getElementByTagNameNSFallback(tcPrElement, "w", "vAlign");
    if (vAlignElement) {
      const vAlignVal = vAlignElement.getAttribute("w:val") as ST_VerticalJc | null;
      if (vAlignVal) {
        cell.verticalAlignment = vAlignVal === "center" ? "center" : vAlignVal;
      }
    }

    // Table cell width
    const tcWElement = getElementByTagNameNSFallback(tcPrElement, "w", "tcW");
    if (tcWElement) {
      const tcWVal = tcWElement.getAttribute("w:w");
      const tcWType = tcWElement.getAttribute("w:type");
      if (tcWVal) {
        const width = parseInt(tcWVal, 10);
        if (tcWType === "dxa") {
          // Width in twentieths of a point (twips)
          cell.width = width;
        } else if (tcWType === "pct") {
          // Width as percentage (multiply by 50 to convert to basis points)
          cell.width = width; // Store as percentage value
        }
      }
    }

    // Cell borders
    const tcBordersElement = getElementByTagNameNSFallback(tcPrElement, "w", "tcBorders");
    if (tcBordersElement) {
      cell.borders = parseEnhancedTableCellBorders(tcBordersElement);
    }

    // Cell shading
    const shdElement = getElementByTagNameNSFallback(tcPrElement, "w", "shd");
    if (shdElement) {
      cell.shading = parseEnhancedShading(shdElement);
    }
  }

  return cell;
}

/**
 * Parse enhanced table row with comprehensive support
 */
function parseEnhancedTableRow(
  rowElement: Element,
  relationships: Map<string, string>,
  theme: DocxTheme | undefined,
  stylesheet: DocxStylesheet | undefined,
): TableRow {
  const row: TableRow = {
    cells: [],
  };

  // Parse all table cells in the row
  const cellElements = getElementsByTagNameNSFallback(rowElement, "w", "tc");
  for (const cellElement of cellElements) {
    const cell = parseEnhancedTableCell(cellElement, relationships, theme, stylesheet);
    row.cells.push(cell);
  }

  return row;
}

/**
 * Enhanced table parser with comprehensive OOXML support for maximum fidelity
 */
export function parseEnhancedTable(
  tableElement: Element,
  relationships: Map<string, string>,
  theme: DocxTheme | undefined,
  stylesheet: DocxStylesheet | undefined,
): Table | null {
  const table: Table = {
    type: "table",
    rows: [],
  };

  // Parse table properties (tblPr) with enhanced OOXML support
  const tblPrElement = getElementByTagNameNSFallback(tableElement, "w", "tblPr");
  if (tblPrElement) {
    // Table borders
    const tblBordersElement = getElementByTagNameNSFallback(tblPrElement, "w", "tblBorders");
    if (tblBordersElement) {
      table.borders = parseEnhancedTableBorders(tblBordersElement);
    }

    // Table shading
    const shdElement = getElementByTagNameNSFallback(tblPrElement, "w", "shd");
    if (shdElement) {
      table.shading = parseEnhancedShading(shdElement);
    }

    // Table width
    const tblWElement = getElementByTagNameNSFallback(tblPrElement, "w", "tblW");
    if (tblWElement) {
      const tblWVal = tblWElement.getAttribute("w:w");
      const tblWType = tblWElement.getAttribute("w:type");
      if (tblWVal) {
        const width = parseInt(tblWVal, 10);
        if (tblWType === "dxa") {
          table.width = width; // Width in twips
        }
      }
    }

    // Table cell margins
    const tblCellMarElement = getElementByTagNameNSFallback(tblPrElement, "w", "tblCellMar");
    if (tblCellMarElement) {
      const margin: { top?: number; bottom?: number; left?: number; right?: number } = {};

      // Parse each margin direction
      const marginMappings = [
        { name: "top", prop: "top" as keyof typeof margin },
        { name: "bottom", prop: "bottom" as keyof typeof margin },
        { name: "left", prop: "left" as keyof typeof margin },
        { name: "start", prop: "left" as keyof typeof margin },
        { name: "right", prop: "right" as keyof typeof margin },
        { name: "end", prop: "right" as keyof typeof margin },
      ];

      for (const { name, prop } of marginMappings) {
        const marginElement = getElementByTagNameNSFallback(tblCellMarElement, "w", name);
        if (marginElement) {
          const marginW = marginElement.getAttribute("w:w");
          if (marginW) {
            margin[prop] = parseInt(marginW, 10); // Store in twips
          }
        }
      }

      if (Object.keys(margin).length > 0) {
        table.cellMargin = margin;
      }
    }
  }

  // Parse all table rows
  const rowElements = getElementsByTagNameNSFallback(tableElement, "w", "tr");
  for (const rowElement of rowElements) {
    const row = parseEnhancedTableRow(rowElement, relationships, theme, stylesheet);
    table.rows.push(row);
  }

  // Post-process to calculate rowspans for vMerge
  calculateRowSpans(table);

  return table.rows.length > 0 ? table : null;
}
