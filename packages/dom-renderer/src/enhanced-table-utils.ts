/**
 * Enhanced table rendering utilities with comprehensive OOXML support
 * Provides visual fidelity for complex table features from 005.docx
 */

import type { Table, TableCell, TableBorder, TableShading } from "@browser-document-viewer/parser";
import type { ProcessingTableCell } from "@browser-document-viewer/document-types";
import type { ST_Border, ST_Shd } from "@browser-document-viewer/ooxml-types";
import {
  validateColor,
  validateCSSValue,
  validateNumeric,
  validateBorderStyle,
} from "./css-validation";

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

    // Additional percentage patterns
    case "pct12":
      return `background: linear-gradient(45deg, ${backgroundColor} 88%, ${foregroundColor} 12%)`;
    case "pct15":
      return `background: linear-gradient(45deg, ${backgroundColor} 85%, ${foregroundColor} 15%)`;
    case "pct20":
      return `background: linear-gradient(45deg, ${backgroundColor} 80%, ${foregroundColor} 20%)`;
    case "pct30":
      return `background: linear-gradient(45deg, ${backgroundColor} 70%, ${foregroundColor} 30%)`;
    case "pct35":
      return `background: linear-gradient(45deg, ${backgroundColor} 65%, ${foregroundColor} 35%)`;
    case "pct37":
      return `background: linear-gradient(45deg, ${backgroundColor} 63%, ${foregroundColor} 37%)`;
    case "pct40":
      return `background: linear-gradient(45deg, ${backgroundColor} 60%, ${foregroundColor} 40%)`;
    case "pct45":
      return `background: linear-gradient(45deg, ${backgroundColor} 55%, ${foregroundColor} 45%)`;
    case "pct55":
      return `background: linear-gradient(45deg, ${backgroundColor} 45%, ${foregroundColor} 55%)`;
    case "pct60":
      return `background: linear-gradient(45deg, ${backgroundColor} 40%, ${foregroundColor} 60%)`;
    case "pct62":
      return `background: linear-gradient(45deg, ${backgroundColor} 38%, ${foregroundColor} 62%)`;
    case "pct65":
      return `background: linear-gradient(45deg, ${backgroundColor} 35%, ${foregroundColor} 65%)`;
    case "pct70":
      return `background: linear-gradient(45deg, ${backgroundColor} 30%, ${foregroundColor} 70%)`;
    case "pct80":
      return `background: linear-gradient(45deg, ${backgroundColor} 20%, ${foregroundColor} 80%)`;
    case "pct85":
      return `background: linear-gradient(45deg, ${backgroundColor} 15%, ${foregroundColor} 85%)`;
    case "pct87":
      return `background: linear-gradient(45deg, ${backgroundColor} 13%, ${foregroundColor} 87%)`;
    case "pct90":
      return `background: linear-gradient(45deg, ${backgroundColor} 10%, ${foregroundColor} 90%)`;
    case "pct95":
      return `background: linear-gradient(45deg, ${backgroundColor} 5%, ${foregroundColor} 95%)`;

    // Cross and grid patterns using CSS background images
    case "horzCross":
      return `background: 
        repeating-linear-gradient(0deg, ${foregroundColor} 0px, ${foregroundColor} 1px, ${backgroundColor} 1px, ${backgroundColor} 8px),
        repeating-linear-gradient(90deg, ${foregroundColor} 0px, ${foregroundColor} 1px, ${backgroundColor} 1px, ${backgroundColor} 8px)`;
    case "diagCross":
      return `background: 
        repeating-linear-gradient(45deg, ${foregroundColor} 0px, ${foregroundColor} 1px, ${backgroundColor} 1px, ${backgroundColor} 8px),
        repeating-linear-gradient(-45deg, ${foregroundColor} 0px, ${foregroundColor} 1px, ${backgroundColor} 1px, ${backgroundColor} 8px)`;

    // Dot patterns using radial gradients
    case "dotGrid" as any:
      return `background: 
        radial-gradient(circle at 2px 2px, ${foregroundColor} 1px, ${backgroundColor} 1px);
        background-size: 8px 8px`;

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
  const validatedWidth = validateNumeric(border.width, 0.5, 20, 1);
  const width = `${validatedWidth}pt`;
  const validatedColor = validateColor(border.color || "#000000");
  const color = validatedColor || "#000000";

  return `${width} ${style} ${color}`;
}

// Note: The HTML string concatenation functions have been removed.
// Use the DOM-based functions from enhanced-table-dom-utils.ts instead:
// - renderEnhancedTableDOM
// - applyTableStyles
// - applyCellStyles
// These provide proper DOM construction without HTML string concatenation.
