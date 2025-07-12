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
 * Parse enhanced table border element with full OOXML type support
 */
function parseEnhancedTableBorder(borderElement: Element | null): TableBorder | undefined {
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
function parseEnhancedTableCellBorders(tcBordersElement: Element | null): TableCellBorders | undefined {
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
function parseEnhancedTableCell(
  cellElement: Element,
  relationships: Map<string, string>,
  theme: DocxTheme | null,
  stylesheet: DocxStylesheet | null,
): TableCell {
  const cell: TableCell = {
    paragraphs: [],
  };

  // Parse paragraphs in the cell
  const paragraphElements = getElementsByTagNameNSFallback(cellElement, "w", "p");
  for (const pElement of paragraphElements) {
    const paragraph = parseParagraph(pElement, relationships, theme, stylesheet);
    if (paragraph) {
      cell.paragraphs.push(paragraph);
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
      if (vMergeVal === "restart") {
        // This cell starts a new merged region
        // We need to calculate rowspan by counting subsequent cells with vMerge="continue"
        // For now, mark as spanning cell (implementation can be enhanced)
        cell.rowspan = 1; // Will be calculated properly in full implementation
      }
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
  theme: DocxTheme | null,
  stylesheet: DocxStylesheet | null,
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
  theme: DocxTheme | null,
  stylesheet: DocxStylesheet | null,
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

  return table.rows.length > 0 ? table : null;
}