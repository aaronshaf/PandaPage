/**
 * Enhanced table rendering utilities with comprehensive OOXML support
 * Provides visual fidelity for complex table features from 005.docx
 */

import type { Table, TableCell, TableBorder, TableShading } from "@browser-document-viewer/parser";
import type { ST_Border, ST_Shd } from "@browser-document-viewer/ooxml-types";

/**
 * Convert OOXML border style to CSS border style
 */
export function convertBorderStyleToCSS(borderStyle: ST_Border): string {
  const styleMap: Record<ST_Border, string> = {
    // Basic border styles
    nil: "none",
    none: "none", 
    single: "solid",
    thick: "solid",
    double: "double",
    dotted: "dotted",
    dashed: "dashed",
    dotDash: "dashed",
    dotDotDash: "dashed",
    triple: "solid", // Fallback to solid for complex styles
    
    // Complex border styles - fallback to simpler CSS equivalents
    thinThickSmallGap: "solid",
    thickThinSmallGap: "solid", 
    thinThickThinSmallGap: "solid",
    thinThickMediumGap: "solid",
    thickThinMediumGap: "solid",
    thinThickThinMediumGap: "solid",
    thinThickLargeGap: "solid",
    thickThinLargeGap: "solid",
    thinThickThinLargeGap: "solid",
    wave: "solid",
    doubleWave: "solid",
    dashSmallGap: "dashed",
    dashDotStroked: "dashed",
    
    // 3D effects - fallback to basic styles
    threeDEmboss: "ridge",
    threeDEngrave: "groove", 
    outset: "outset",
    inset: "inset",
    
    // Decorative borders - fallback to solid
    apples: "solid",
    archedScallops: "solid",
    babyPacifier: "solid",
    babyRattle: "solid",
    balloons3Colors: "solid",
    balloonsHotAir: "solid",
    basicBlackDashes: "dashed",
    basicBlackDots: "dotted",
    basicBlackSquares: "solid",
    basicThinLines: "solid",
    basicWhiteDashes: "dashed",
    basicWhiteDots: "dotted",
    basicWhiteSquares: "solid",
    basicWideInline: "solid",
    basicWideMidline: "solid",
    basicWideOutline: "solid",
    bats: "solid",
    birds: "solid",
    birdsFlight: "solid",
    cabins: "solid",
    cakeSlice: "solid",
    candyCorn: "solid",
    celticKnotwork: "solid",
    certificateBanner: "solid",
    chainLink: "solid",
    champagneBottle: "solid",
    checkedBarBlack: "solid",
    checkedBarColor: "solid",
    checkered: "solid",
    christmasTree: "solid",
    circlesLines: "solid",
    circlesRectangles: "solid",
    classicalWave: "solid",
    clocks: "solid",
    compass: "solid",
    confetti: "solid",
    confettiGrays: "solid",
    confettiOutline: "solid",
    confettiStreamers: "solid",
    confettiWhite: "solid",
    cornerTriangles: "solid",
    couponCutoutDashes: "dashed",
    couponCutoutDots: "dotted",
    crazyMaze: "solid",
    creaturesButterfly: "solid",
    creaturesFish: "solid",
    creaturesInsects: "solid",
    creaturesLadyBug: "solid",
    crossStitch: "solid",
    cup: "solid",
    custom: "solid",
  };

  return styleMap[borderStyle] || "solid";
}

/**
 * Convert OOXML shading pattern to CSS background
 */
export function convertShadingToCSS(shading: TableShading): string {
  if (!shading.fill && !shading.color) return "";

  const backgroundColor = shading.fill || "#FFFFFF";
  const foregroundColor = shading.color || "#000000";
  const pattern = shading.pattern || "clear";

  // Handle different shading patterns
  switch (pattern) {
    case "clear":
    case "solid":
      return `background-color: ${backgroundColor}`;
      
    case "pct5":
      return `background: linear-gradient(45deg, ${backgroundColor} 95%, ${foregroundColor} 5%)`;
    case "pct10":
      return `background: linear-gradient(45deg, ${backgroundColor} 90%, ${foregroundColor} 10%)`;
    case "pct25":
      return `background: linear-gradient(45deg, ${backgroundColor} 75%, ${foregroundColor} 25%)`;
    case "pct50":
      return `background: linear-gradient(45deg, ${backgroundColor} 50%, ${foregroundColor} 50%)`;
    case "pct75":
      return `background: linear-gradient(45deg, ${backgroundColor} 25%, ${foregroundColor} 75%)`;
      
    case "horzStripe":
      return `background: repeating-linear-gradient(0deg, ${backgroundColor} 0px, ${backgroundColor} 4px, ${foregroundColor} 4px, ${foregroundColor} 8px)`;
    case "vertStripe":
      return `background: repeating-linear-gradient(90deg, ${backgroundColor} 0px, ${backgroundColor} 4px, ${foregroundColor} 4px, ${foregroundColor} 8px)`;
    case "diagStripe":
      return `background: repeating-linear-gradient(45deg, ${backgroundColor} 0px, ${backgroundColor} 4px, ${foregroundColor} 4px, ${foregroundColor} 8px)`;
    case "reverseDiagStripe":
      return `background: repeating-linear-gradient(-45deg, ${backgroundColor} 0px, ${backgroundColor} 4px, ${foregroundColor} 4px, ${foregroundColor} 8px)`;
      
    default:
      // Fallback to solid background for complex patterns
      return `background-color: ${backgroundColor}`;
  }
}

/**
 * Generate CSS border declaration from TableBorder
 */
export function generateBorderCSS(border: TableBorder): string {
  if (!border.style || border.style === "nil" || border.style === "none") {
    return "none";
  }

  const style = convertBorderStyleToCSS(border.style);
  const width = border.width ? `${border.width}pt` : "1pt";
  const color = border.color || "#000000";

  return `${width} ${style} ${color}`;
}

/**
 * Enhanced table rendering with comprehensive visual support
 */
export function renderEnhancedTable(table: Table): string {
  const tableId = `table-${Math.random().toString(36).substr(2, 9)}`;
  
  // Generate table-level styles
  const tableStyles: string[] = [
    "border-collapse: separate", // Use separate for better border control
    "border-spacing: 0",
    "width: 100%",
  ];

  // Apply table borders
  if (table.borders) {
    if (table.borders.top) {
      tableStyles.push(`border-top: ${generateBorderCSS(table.borders.top)}`);
    }
    if (table.borders.bottom) {
      tableStyles.push(`border-bottom: ${generateBorderCSS(table.borders.bottom)}`);
    }
    if (table.borders.left) {
      tableStyles.push(`border-left: ${generateBorderCSS(table.borders.left)}`);
    }
    if (table.borders.right) {
      tableStyles.push(`border-right: ${generateBorderCSS(table.borders.right)}`);
    }
  }

  // Apply table shading
  if (table.shading) {
    const shadingCSS = convertShadingToCSS(table.shading);
    if (shadingCSS) {
      tableStyles.push(shadingCSS);
    }
  }

  // Apply table width
  if (table.width) {
    tableStyles.push(`width: ${table.width}px`);
  }

  let html = `<table id="${tableId}" style="${tableStyles.join("; ")}">`;

  // Generate CSS for inside borders if present
  let insideBorderCSS = "";
  if (table.borders?.insideH || table.borders?.insideV) {
    insideBorderCSS = `<style>`;
    
    if (table.borders.insideH) {
      const hBorder = generateBorderCSS(table.borders.insideH);
      insideBorderCSS += `
        #${tableId} tr:not(:last-child) td {
          border-bottom: ${hBorder};
        }
      `;
    }
    
    if (table.borders.insideV) {
      const vBorder = generateBorderCSS(table.borders.insideV);
      insideBorderCSS += `
        #${tableId} td:not(:last-child) {
          border-right: ${vBorder};
        }
      `;
    }
    
    insideBorderCSS += `</style>`;
  }

  // Render table rows
  for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
    const row = table.rows[rowIndex];
    if (!row) continue;
    html += `<tr>`;

    for (const cell of row.cells) {
      html += renderEnhancedTableCell(cell, rowIndex === 0);
    }

    html += `</tr>`;
  }

  html += `</table>`;

  return insideBorderCSS + html;
}

/**
 * Enhanced table cell rendering with comprehensive formatting support
 */
export function renderEnhancedTableCell(cell: TableCell, isHeaderRow: boolean = false): string {
  const tagName = isHeaderRow ? "th" : "td";
  const cellStyles: string[] = [
    "padding: 8px",
    "vertical-align: top", // Default alignment
  ];

  // Apply cell spanning
  let spanAttributes = "";
  let hasMerging = false;
  if (cell.colspan && cell.colspan > 1) {
    spanAttributes += ` colspan="${cell.colspan}"`;
    hasMerging = true;
  }
  if (cell.rowspan && cell.rowspan > 1) {
    spanAttributes += ` rowspan="${cell.rowspan}"`;
    hasMerging = true;
  }
  
  // Add cell-merged class for compatibility with existing tests
  if (hasMerging) {
    spanAttributes += ` class="cell-merged"`;
  }

  // Apply vertical alignment
  if (cell.verticalAlignment) {
    const alignMap = {
      top: "top",
      center: "middle", 
      bottom: "bottom",
    };
    cellStyles.push(`vertical-align: ${alignMap[cell.verticalAlignment] || "top"}`);
  }

  // Apply cell borders
  if (cell.borders) {
    const borderNames = ["top", "bottom", "left", "right"] as const;
    for (const borderName of borderNames) {
      const border = cell.borders[borderName];
      if (border) {
        cellStyles.push(`border-${borderName}: ${generateBorderCSS(border)}`);
      }
    }

    // Apply diagonal borders if present (using CSS transforms)
    if (cell.borders.tl2br) {
      // Top-left to bottom-right diagonal border
      cellStyles.push(`position: relative`);
      cellStyles.push(`background-image: linear-gradient(45deg, transparent 49%, ${cell.borders.tl2br.color || "#000000"} 49%, ${cell.borders.tl2br.color || "#000000"} 51%, transparent 51%)`);
    }
    if (cell.borders.tr2bl) {
      // Top-right to bottom-left diagonal border  
      cellStyles.push(`position: relative`);
      cellStyles.push(`background-image: linear-gradient(-45deg, transparent 49%, ${cell.borders.tr2bl.color || "#000000"} 49%, ${cell.borders.tr2bl.color || "#000000"} 51%, transparent 51%)`);
    }
  }

  // Apply cell shading
  if (cell.shading) {
    const shadingCSS = convertShadingToCSS(cell.shading);
    if (shadingCSS) {
      cellStyles.push(shadingCSS);
    }
  }

  // Apply cell width
  if (cell.width) {
    cellStyles.push(`width: ${cell.width}px`);
  }

  // Apply text direction
  if (cell.textDirection) {
    const directionMap = {
      ltr: "ltr",
      rtl: "rtl", 
      lrV: "ltr", // Vertical text fallback to horizontal
      tbV: "ltr",
      lrTbV: "ltr",
      tbLrV: "ltr",
    };
    cellStyles.push(`direction: ${directionMap[cell.textDirection] || "ltr"}`);
  }

  let html = `<${tagName}${spanAttributes} style="${cellStyles.join("; ")}">`;

  // Render cell content (paragraphs)
  for (const paragraph of cell.paragraphs) {
    html += `<p style="margin: 0; padding: 0;">`;
    
    // Render paragraph content (simplified for now)
    if (paragraph.runs) {
      for (const run of paragraph.runs) {
        if (run.text) {
          html += run.text;
        }
      }
    }
    
    html += `</p>`;
  }

  html += `</${tagName}>`;

  return html;
}