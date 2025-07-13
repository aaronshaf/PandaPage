// Conditional formatting (cnfStyle) utilities for DOCX parsing
import type { DocxConditionalFormatting } from "./types";
import { getElementByTagNameNSFallback } from "./xml-utils";

/**
 * Parse conditional formatting (cnfStyle) from a 12-digit binary pattern
 * @param val - The 12-digit binary string (e.g., "100000000000")
 * @returns Parsed conditional formatting object
 */
export function parseConditionalFormatting(val: string): DocxConditionalFormatting {
  // Ensure we have exactly 12 digits, pad with zeros if needed
  const binaryPattern = val.padStart(12, '0');
  
  return {
    val,
    firstRow: binaryPattern[0] === '1',
    lastRow: binaryPattern[1] === '1', 
    firstCol: binaryPattern[2] === '1',
    lastCol: binaryPattern[3] === '1',
    bandedRows: binaryPattern[6] === '1', // Position 6 for banded rows (000000100000)
    bandedCols: binaryPattern[7] === '1', // Position 7 for banded columns
    // Other positions are for additional conditional formatting flags
  };
}

/**
 * Parse cnfStyle element and return conditional formatting
 * @param element - The element containing cnfStyle (trPr, tcPr, or pPr)
 * @param ns - The namespace string
 * @returns Parsed conditional formatting or undefined
 */
export function parseCnfStyle(element: Element, ns: string): DocxConditionalFormatting | undefined {
  const cnfStyleElement = getElementByTagNameNSFallback(element, ns, "cnfStyle");
  if (!cnfStyleElement) return undefined;
  
  const val = cnfStyleElement.getAttribute("w:val");
  if (!val) return undefined;
  
  return parseConditionalFormatting(val);
}