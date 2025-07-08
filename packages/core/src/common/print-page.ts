/**
 * CSS print page utilities for document rendering
 * Based on CSS Paged Media specifications
 */

import { twipsToCss, parseUniversalMeasure, PAGE_SIZES } from './units.js';

/**
 * CSS page size keywords
 */
export type PageSizeKeyword = 'letter' | 'a4' | 'legal' | 'a3' | 'a5' | 'ledger' | 'tabloid';

/**
 * Page orientation
 */
export type PageOrientation = 'portrait' | 'landscape';

/**
 * Page margin configuration
 */
export interface PageMargins {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

/**
 * Page size configuration
 */
export interface PageSize {
  width: string;
  height: string;
}

/**
 * Page configuration for CSS @page rule
 */
export interface PageConfig {
  size: PageSize;
  margins: PageMargins;
  orientation?: PageOrientation;
  bleed?: string;
  marks?: 'crop' | 'cross' | 'crop cross' | 'none';
}

/**
 * Print page container configuration
 */
export interface PrintPageContainerConfig {
  pageSize: PageSizeKeyword | PageSize;
  margins: PageMargins | string;
  orientation?: PageOrientation;
  scale?: number;
  showPageBreaks?: boolean;
  containerClass?: string;
  pageClass?: string;
}

/**
 * Create CSS @page rule string
 */
export function createPageRule(config: PageConfig): string {
  const parts: string[] = [];

  // Size
  if (config.size) {
    parts.push(`size: ${config.size.width} ${config.size.height}`);
  }

  // Orientation
  if (config.orientation && config.orientation !== 'portrait') {
    parts.push(`size: ${config.orientation}`);
  }

  // Margins
  if (config.margins) {
    const { top, right, bottom, left } = config.margins;
    parts.push(`margin: ${top} ${right} ${bottom} ${left}`);
  }

  // Bleed
  if (config.bleed) {
    parts.push(`bleed: ${config.bleed}`);
  }

  // Marks
  if (config.marks && config.marks !== 'none') {
    parts.push(`marks: ${config.marks}`);
  }

  return `@page {\n  ${parts.join(';\n  ')};\n}`;
}

/**
 * Get page size from keyword or custom dimensions
 */
export function getPageSize(size: PageSizeKeyword | PageSize, orientation: PageOrientation = 'portrait'): PageSize {
  if (typeof size === 'object') {
    return size;
  }

  const sizeData = PAGE_SIZES[size];
  if (!sizeData) {
    throw new Error(`Unknown page size: ${size}`);
  }

  const { width, height } = sizeData.points;
  
  if (orientation === 'landscape') {
    return {
      width: `${height}pt`,
      height: `${width}pt`
    };
  }

  return {
    width: `${width}pt`,
    height: `${height}pt`
  };
}

/**
 * Normalize margins to individual values
 */
export function normalizeMargins(margins: PageMargins | string): PageMargins {
  if (typeof margins === 'object') {
    return margins;
  }

  // Handle CSS shorthand: "10pt" or "10pt 20pt" or "10pt 20pt 30pt 40pt"
  const parts = margins.trim().split(/\s+/);
  
  switch (parts.length) {
    case 1:
      return { top: parts[0]!, right: parts[0]!, bottom: parts[0]!, left: parts[0]! };
    case 2:
      return { top: parts[0]!, right: parts[1]!, bottom: parts[0]!, left: parts[1]! };
    case 3:
      return { top: parts[0]!, right: parts[1]!, bottom: parts[2]!, left: parts[1]! };
    case 4:
      return { top: parts[0]!, right: parts[1]!, bottom: parts[2]!, left: parts[3]! };
    default:
      throw new Error(`Invalid margin format: ${margins}`);
  }
}

/**
 * Create print page container CSS
 */
export function createPrintPageContainerCSS(config: PrintPageContainerConfig): string {
  const pageSize = getPageSize(config.pageSize, config.orientation);
  const margins = normalizeMargins(config.margins);
  const scale = config.scale || 1;
  const containerClass = config.containerClass || 'document-container';
  const pageClass = config.pageClass || 'page';

  // Calculate content area
  const pageWidthPt = parseFloat(pageSize.width);
  const pageHeightPt = parseFloat(pageSize.height);
  const marginTopPt = parseUniversalMeasure(margins.top, 'points');
  const marginRightPt = parseUniversalMeasure(margins.right, 'points');
  const marginBottomPt = parseUniversalMeasure(margins.bottom, 'points');
  const marginLeftPt = parseUniversalMeasure(margins.left, 'points');

  const contentWidth = pageWidthPt - marginLeftPt - marginRightPt;
  const contentHeight = pageHeightPt - marginTopPt - marginBottomPt;

  return `
/* Print page container styles */
.${containerClass} {
  font-size: 12pt;
  line-height: 1.2;
  color: #000;
  background: #f5f5f5;
  padding: 20pt;
  box-sizing: border-box;
}

.${pageClass} {
  position: relative;
  width: ${pageWidthPt * scale}pt;
  height: ${pageHeightPt * scale}pt;
  margin: 0 auto 20pt auto;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  box-sizing: border-box;
  overflow: hidden;
  transform: scale(${scale});
  transform-origin: top center;
}

.${pageClass}-content {
  position: absolute;
  top: ${marginTopPt * scale}pt;
  left: ${marginLeftPt * scale}pt;
  right: ${marginRightPt * scale}pt;
  bottom: ${marginBottomPt * scale}pt;
  width: ${contentWidth * scale}pt;
  height: ${contentHeight * scale}pt;
  overflow: hidden;
}

/* Page break handling */
${config.showPageBreaks ? `
.${pageClass}:not(:last-child):after {
  content: '';
  position: absolute;
  bottom: -10pt;
  left: 50%;
  transform: translateX(-50%);
  width: 100pt;
  height: 1px;
  background: #ccc;
  opacity: 0.5;
}
` : ''}

/* Print styles */
@media print {
  .${containerClass} {
    background: white;
    padding: 0;
  }
  
  .${pageClass} {
    width: ${pageWidthPt}pt;
    height: ${pageHeightPt}pt;
    margin: 0;
    box-shadow: none;
    page-break-after: always;
    transform: none;
  }
  
  .${pageClass}-content {
    top: ${marginTopPt}pt;
    left: ${marginLeftPt}pt;
    right: ${marginRightPt}pt;
    bottom: ${marginBottomPt}pt;
    width: ${contentWidth}pt;
    height: ${contentHeight}pt;
  }
  
  .${pageClass}:last-child {
    page-break-after: avoid;
  }
}

/* Responsive scaling */
@media screen and (max-width: ${pageWidthPt * scale + 40}pt) {
  .${pageClass} {
    transform: scale(${Math.min(scale, 0.8)});
  }
}

@media screen and (max-width: ${pageWidthPt * 0.8 + 40}pt) {
  .${pageClass} {
    transform: scale(${Math.min(scale, 0.6)});
  }
}`;
}

/**
 * Create page break CSS utilities
 */
export function createPageBreakCSS(): string {
  return `
/* Page break utilities */
.page-break-before {
  page-break-before: always;
}

.page-break-after {
  page-break-after: always;
}

.page-break-inside-avoid {
  page-break-inside: avoid;
}

.page-break-inside-auto {
  page-break-inside: auto;
}

/* Widow and orphan control */
.avoid-orphans {
  orphans: 3;
}

.avoid-widows {
  widows: 3;
}

/* Table page breaking */
.table-page-break {
  page-break-inside: avoid;
}

.table-row-page-break {
  page-break-inside: avoid;
}

.table-header-repeat {
  display: table-header-group;
}

.table-footer-repeat {
  display: table-footer-group;
}

/* Print-specific hiding */
@media print {
  .print-hidden {
    display: none !important;
  }
}

@media screen {
  .screen-hidden {
    display: none !important;
  }
}`;
}

/**
 * Calculate optimal page scale for container
 */
export function calculateOptimalScale(
  containerWidth: number,
  pageSize: PageSizeKeyword | PageSize,
  orientation: PageOrientation = 'portrait',
  maxScale: number = 1
): number {
  const size = getPageSize(pageSize, orientation);
  const pageWidthPt = parseFloat(size.width);
  
  // Convert container width to points (assuming 96 DPI)
  const containerWidthPt = containerWidth * 0.75; // 96 DPI to points
  
  // Calculate scale to fit with some padding
  const availableWidth = containerWidthPt - 40; // 20pt padding on each side
  const optimalScale = Math.min(maxScale, availableWidth / pageWidthPt);
  
  return Math.max(0.1, optimalScale); // Minimum scale of 10%
}

/**
 * Generate CSS for specific page size
 */
export function generatePageCSS(
  pageSize: PageSizeKeyword,
  margins: string = '1in',
  orientation: PageOrientation = 'portrait'
): string {
  const size = getPageSize(pageSize, orientation);
  const normalizedMargins = normalizeMargins(margins);
  
  const pageRule = createPageRule({
    size,
    margins: normalizedMargins,
    orientation
  });
  
  const containerCSS = createPrintPageContainerCSS({
    pageSize,
    margins,
    orientation,
    scale: 1,
    showPageBreaks: true
  });
  
  const pageBreakCSS = createPageBreakCSS();
  
  return `${pageRule}\n\n${containerCSS}\n\n${pageBreakCSS}`;
}

/**
 * Convert DOCX page settings to CSS page config
 */
export function docxPageToCSS(
  widthTwips: number,
  heightTwips: number,
  marginsTwips: { top: number; right: number; bottom: number; left: number }
): PageConfig {
  return {
    size: {
      width: twipsToCss(widthTwips),
      height: twipsToCss(heightTwips)
    },
    margins: {
      top: twipsToCss(marginsTwips.top),
      right: twipsToCss(marginsTwips.right),
      bottom: twipsToCss(marginsTwips.bottom),
      left: twipsToCss(marginsTwips.left)
    }
  };
}

/**
 * Page size detection from dimensions
 */
export function detectPageSize(widthPt: number, heightPt: number): PageSizeKeyword | null {
  const tolerance = 5; // 5pt tolerance
  
  for (const [name, size] of Object.entries(PAGE_SIZES)) {
    const { width, height } = size.points;
    
    // Check portrait
    if (Math.abs(widthPt - width) <= tolerance && Math.abs(heightPt - height) <= tolerance) {
      return name as PageSizeKeyword;
    }
    
    // Check landscape
    if (Math.abs(widthPt - height) <= tolerance && Math.abs(heightPt - width) <= tolerance) {
      return name as PageSizeKeyword;
    }
  }
  
  return null;
}

/**
 * Create viewport meta tag for responsive page display
 */
export function createViewportMeta(pageSize: PageSizeKeyword, scale: number = 1): string {
  const size = getPageSize(pageSize);
  const widthPt = parseFloat(size.width);
  
  // Convert to CSS pixels (assuming 96 DPI)
  const widthPx = Math.round(widthPt * 96 / 72);
  const scaledWidth = Math.round(widthPx * scale);
  
  return `<meta name="viewport" content="width=${scaledWidth}, initial-scale=1.0, user-scalable=yes">`;
}