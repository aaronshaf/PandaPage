// Border and shading parsing functions
import type { DocxBorder, DocxShading, DocxParagraphBorders } from './types';
import { getElementByTagNameNSFallback } from './xml-utils';
import { mapBorderStyle, mapShadingPattern } from './ooxml-mappers';

/**
 * Parse a border element
 */
export function parseBorder(borderElement: Element | null): DocxBorder | undefined {
  if (!borderElement) return undefined;
  
  const border: DocxBorder = {};
  
  // Border style
  const val = borderElement.getAttribute('w:val');
  if (val) {
    border.style = mapBorderStyle(val);
  }
  
  // Border color
  const color = borderElement.getAttribute('w:color');
  if (color && color !== 'auto') {
    border.color = color.startsWith('#') ? color : `#${color}`;
  }
  
  // Border size (in eighth-points)
  const sz = borderElement.getAttribute('w:sz');
  if (sz) {
    border.size = parseInt(sz, 10);
  }
  
  // Space from text (in points)
  const space = borderElement.getAttribute('w:space');
  if (space) {
    border.space = parseInt(space, 10);
  }
  
  return Object.keys(border).length > 0 ? border : undefined;
}

/**
 * Parse paragraph borders
 */
export function parseParagraphBorders(pBdrElement: Element, ns: string): DocxParagraphBorders | undefined {
  const borders: DocxParagraphBorders = {};
  
  // Top border
  const top = getElementByTagNameNSFallback(pBdrElement, ns, 'top');
  const topBorder = parseBorder(top);
  if (topBorder) borders.top = topBorder;
  
  // Bottom border
  const bottom = getElementByTagNameNSFallback(pBdrElement, ns, 'bottom');
  const bottomBorder = parseBorder(bottom);
  if (bottomBorder) borders.bottom = bottomBorder;
  
  // Left border
  const left = getElementByTagNameNSFallback(pBdrElement, ns, 'left');
  const leftBorder = parseBorder(left);
  if (leftBorder) borders.left = leftBorder;
  
  // Right border
  const right = getElementByTagNameNSFallback(pBdrElement, ns, 'right');
  const rightBorder = parseBorder(right);
  if (rightBorder) borders.right = rightBorder;
  
  // Between border (for consecutive paragraphs with same style)
  const between = getElementByTagNameNSFallback(pBdrElement, ns, 'between');
  const betweenBorder = parseBorder(between);
  if (betweenBorder) borders.between = betweenBorder;
  
  return Object.keys(borders).length > 0 ? borders : undefined;
}

/**
 * Parse shading element
 */
export function parseShading(shdElement: Element): DocxShading | undefined {
  const shading: DocxShading = {};
  
  // Shading pattern
  const val = shdElement.getAttribute('w:val');
  if (val) {
    shading.val = mapShadingPattern(val);
  }
  
  // Fill color (background)
  const fill = shdElement.getAttribute('w:fill');
  if (fill && fill !== 'auto') {
    shading.fill = fill.startsWith('#') ? fill : `#${fill}`;
  }
  
  // Pattern color
  const color = shdElement.getAttribute('w:color');
  if (color && color !== 'auto') {
    shading.color = color.startsWith('#') ? color : `#${color}`;
  }
  
  return Object.keys(shading).length > 0 ? shading : undefined;
}