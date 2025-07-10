// Table parsing functions
import type { Table, TableRow, TableCell, Paragraph, TableBorders, TableShading, TableCellBorders, TableBorder } from '../../types/document';
import { parseParagraph } from './paragraph-parser';
import { WORD_NAMESPACE, type DocxTableProperties, type DocxTableCellProperties, type DocxTableBorder, type DocxTableBorders, type DocxTableCellBorders, type DocxShading } from './types';
import type { DocxTheme } from './theme-parser';
import type { DocxStylesheet } from './style-parser';
import { getElementByTagNameNSFallback, getElementsByTagNameNSFallback } from './xml-utils';
import { mapBorderStyle, mapShadingPattern } from './ooxml-mappers';

/**
 * Parse a table element
 * @param tableElement - The table element to parse
 * @param relationships - Map of relationship IDs to URLs
 * @param theme - Document theme for color and font resolution
 * @param stylesheet - Document stylesheet for style resolution
 * @returns Parsed table or null
 */
/**
 * Parse a table border element
 */
function parseTableBorder(borderElement: Element | null): DocxTableBorder | undefined {
  if (!borderElement) return undefined;
  
  const border: DocxTableBorder = {};
  
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
 * Parse table borders
 */
function parseTableBorders(tblBordersElement: Element, ns: string): DocxTableBorders | undefined {
  const borders: DocxTableBorders = {};
  
  // Top border
  const top = getElementByTagNameNSFallback(tblBordersElement, ns, 'top');
  const topBorder = parseTableBorder(top);
  if (topBorder) borders.top = topBorder;
  
  // Bottom border
  const bottom = getElementByTagNameNSFallback(tblBordersElement, ns, 'bottom');
  const bottomBorder = parseTableBorder(bottom);
  if (bottomBorder) borders.bottom = bottomBorder;
  
  // Left border
  const left = getElementByTagNameNSFallback(tblBordersElement, ns, 'left');
  const leftBorder = parseTableBorder(left);
  if (leftBorder) borders.left = leftBorder;
  
  // Right border
  const right = getElementByTagNameNSFallback(tblBordersElement, ns, 'right');
  const rightBorder = parseTableBorder(right);
  if (rightBorder) borders.right = rightBorder;
  
  // Inside horizontal border
  const insideH = getElementByTagNameNSFallback(tblBordersElement, ns, 'insideH');
  const insideHBorder = parseTableBorder(insideH);
  if (insideHBorder) borders.insideH = insideHBorder;
  
  // Inside vertical border
  const insideV = getElementByTagNameNSFallback(tblBordersElement, ns, 'insideV');
  const insideVBorder = parseTableBorder(insideV);
  if (insideVBorder) borders.insideV = insideVBorder;
  
  return Object.keys(borders).length > 0 ? borders : undefined;
}

/**
 * Parse table cell borders
 */
function parseTableCellBorders(tcBordersElement: Element, ns: string): DocxTableCellBorders | undefined {
  const borders: DocxTableCellBorders = {};
  
  // Top border
  const top = getElementByTagNameNSFallback(tcBordersElement, ns, 'top');
  const topBorder = parseTableBorder(top);
  if (topBorder) borders.top = topBorder;
  
  // Bottom border
  const bottom = getElementByTagNameNSFallback(tcBordersElement, ns, 'bottom');
  const bottomBorder = parseTableBorder(bottom);
  if (bottomBorder) borders.bottom = bottomBorder;
  
  // Left border
  const left = getElementByTagNameNSFallback(tcBordersElement, ns, 'left');
  const leftBorder = parseTableBorder(left);
  if (leftBorder) borders.left = leftBorder;
  
  // Right border
  const right = getElementByTagNameNSFallback(tcBordersElement, ns, 'right');
  const rightBorder = parseTableBorder(right);
  if (rightBorder) borders.right = rightBorder;
  
  // Diagonal borders
  const tl2br = getElementByTagNameNSFallback(tcBordersElement, ns, 'tl2br');
  const tl2brBorder = parseTableBorder(tl2br);
  if (tl2brBorder) borders.tl2br = tl2brBorder;
  
  const tr2bl = getElementByTagNameNSFallback(tcBordersElement, ns, 'tr2bl');
  const tr2blBorder = parseTableBorder(tr2bl);
  if (tr2blBorder) borders.tr2bl = tr2blBorder;
  
  return Object.keys(borders).length > 0 ? borders : undefined;
}

/**
 * Parse shading element
 */
function parseTableShading(shdElement: Element): DocxShading | undefined {
  const shading: DocxShading = {};
  
  // Shading pattern
  const val = shdElement.getAttribute('w:val');
  if (val && val !== 'nil' && val !== 'clear') {
    shading.val = val as DocxShading['val'];
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

/**
 * Convert DOCX borders to document borders
 */
function convertToTableBorders(docxBorders: DocxTableBorders): TableBorders {
  const borders: TableBorders = {};
  
  if (docxBorders.top) {
    borders.top = {
      style: docxBorders.top.style,
      color: docxBorders.top.color,
      width: docxBorders.top.size ? docxBorders.top.size / 8 : undefined // Convert from eighth-points to points
    };
  }
  
  if (docxBorders.bottom) {
    borders.bottom = {
      style: docxBorders.bottom.style,
      color: docxBorders.bottom.color,
      width: docxBorders.bottom.size ? docxBorders.bottom.size / 8 : undefined
    };
  }
  
  if (docxBorders.left) {
    borders.left = {
      style: docxBorders.left.style,
      color: docxBorders.left.color,
      width: docxBorders.left.size ? docxBorders.left.size / 8 : undefined
    };
  }
  
  if (docxBorders.right) {
    borders.right = {
      style: docxBorders.right.style,
      color: docxBorders.right.color,
      width: docxBorders.right.size ? docxBorders.right.size / 8 : undefined
    };
  }
  
  if (docxBorders.insideH) {
    borders.insideH = {
      style: docxBorders.insideH.style,
      color: docxBorders.insideH.color,
      width: docxBorders.insideH.size ? docxBorders.insideH.size / 8 : undefined
    };
  }
  
  if (docxBorders.insideV) {
    borders.insideV = {
      style: docxBorders.insideV.style,
      color: docxBorders.insideV.color,
      width: docxBorders.insideV.size ? docxBorders.insideV.size / 8 : undefined
    };
  }
  
  return borders;
}

/**
 * Convert DOCX cell borders to document cell borders
 */
function convertToTableCellBorders(docxBorders: DocxTableCellBorders): TableCellBorders {
  const borders: TableCellBorders = {};
  
  if (docxBorders.top) {
    borders.top = {
      style: docxBorders.top.style,
      color: docxBorders.top.color,
      width: docxBorders.top.size ? docxBorders.top.size / 8 : undefined
    };
  }
  
  if (docxBorders.bottom) {
    borders.bottom = {
      style: docxBorders.bottom.style,
      color: docxBorders.bottom.color,
      width: docxBorders.bottom.size ? docxBorders.bottom.size / 8 : undefined
    };
  }
  
  if (docxBorders.left) {
    borders.left = {
      style: docxBorders.left.style,
      color: docxBorders.left.color,
      width: docxBorders.left.size ? docxBorders.left.size / 8 : undefined
    };
  }
  
  if (docxBorders.right) {
    borders.right = {
      style: docxBorders.right.style,
      color: docxBorders.right.color,
      width: docxBorders.right.size ? docxBorders.right.size / 8 : undefined
    };
  }
  
  if (docxBorders.tl2br) {
    borders.tl2br = {
      style: docxBorders.tl2br.style,
      color: docxBorders.tl2br.color,
      width: docxBorders.tl2br.size ? docxBorders.tl2br.size / 8 : undefined
    };
  }
  
  if (docxBorders.tr2bl) {
    borders.tr2bl = {
      style: docxBorders.tr2bl.style,
      color: docxBorders.tr2bl.color,
      width: docxBorders.tr2bl.size ? docxBorders.tr2bl.size / 8 : undefined
    };
  }
  
  return borders;
}

/**
 * Convert DOCX shading to document shading
 */
function convertToTableShading(docxShading: DocxShading): TableShading {
  return {
    fill: docxShading.fill,
    color: docxShading.color,
    pattern: docxShading.val
  };
}

/**
 * Parse a table element
 * 
 * Border Conflict Resolution Rules (per OOXML spec):
 * 1. Cell borders take precedence over table borders
 * 2. When two borders conflict (e.g., right border of cell 1 vs left border of cell 2):
 *    - The border with higher weight (width) wins
 *    - If weights are equal, border styles are ranked (double > single > dashed > dotted > none)
 *    - If still equal, darker colors take precedence
 * 3. Table inside borders (insideH, insideV) apply between cells unless overridden by cell borders
 * 
 * Note: The actual conflict resolution should be implemented in the renderer, as it depends
 * on the layout and positioning of cells. This parser preserves all border information
 * for the renderer to use.
 * 
 * @param tableElement - The table element to parse
 * @param relationships - Map of relationship IDs to URLs
 * @param theme - Document theme for color and font resolution
 * @param stylesheet - Document stylesheet for style resolution
 * @returns Parsed table or null
 */
export function parseTable(tableElement: Element, relationships?: Map<string, string>, theme?: DocxTheme, stylesheet?: DocxStylesheet): Table | null {
  const ns = WORD_NAMESPACE;
  const rows: TableRow[] = [];
  
  // Parse table properties
  let tableBorders: TableBorders | undefined;
  let tableShading: TableShading | undefined;
  let tableCellMargin: Table['cellMargin'] | undefined;
  let tableWidth: number | undefined;
  
  const tblPr = getElementByTagNameNSFallback(tableElement, ns, "tblPr");
  if (tblPr) {
    // Parse table borders
    const tblBorders = getElementByTagNameNSFallback(tblPr, ns, "tblBorders");
    if (tblBorders) {
      const docxBorders = parseTableBorders(tblBorders, ns);
      if (docxBorders) {
        tableBorders = convertToTableBorders(docxBorders);
      }
    }
    
    // Parse table shading
    const tblShd = getElementByTagNameNSFallback(tblPr, ns, "shd");
    if (tblShd) {
      const docxShading = parseTableShading(tblShd);
      if (docxShading) {
        tableShading = convertToTableShading(docxShading);
      }
    }
    
    // Parse table cell margin
    const tblCellMar = getElementByTagNameNSFallback(tblPr, ns, "tblCellMar");
    if (tblCellMar) {
      tableCellMargin = {};
      
      const top = getElementByTagNameNSFallback(tblCellMar, ns, "top");
      if (top) {
        const w = top.getAttribute("w:w");
        if (w) tableCellMargin.top = parseInt(w, 10);
      }
      
      const bottom = getElementByTagNameNSFallback(tblCellMar, ns, "bottom");
      if (bottom) {
        const w = bottom.getAttribute("w:w");
        if (w) tableCellMargin.bottom = parseInt(w, 10);
      }
      
      const left = getElementByTagNameNSFallback(tblCellMar, ns, "left");
      if (left) {
        const w = left.getAttribute("w:w");
        if (w) tableCellMargin.left = parseInt(w, 10);
      }
      
      const right = getElementByTagNameNSFallback(tblCellMar, ns, "right");
      if (right) {
        const w = right.getAttribute("w:w");
        if (w) tableCellMargin.right = parseInt(w, 10);
      }
    }
    
    // Parse table width
    const tblW = getElementByTagNameNSFallback(tblPr, ns, "tblW");
    if (tblW) {
      const w = tblW.getAttribute("w:w");
      const type = tblW.getAttribute("w:type");
      if (w && type === "dxa") {
        tableWidth = parseInt(w, 10);
      }
    }
  }
  
  // Get all table rows
  const rowElements = tableElement.getElementsByTagNameNS(ns, "tr");
  
  for (let i = 0; i < rowElements.length; i++) {
    const rowElement = rowElements[i];
    if (!rowElement) continue;
    const cells: TableCell[] = [];
    
    // Get all table cells in this row
    const cellElements = rowElement.getElementsByTagNameNS(ns, "tc");
    
    for (let j = 0; j < cellElements.length; j++) {
      const cellElement = cellElements[j];
      if (!cellElement) continue;
      const paragraphs: Paragraph[] = [];
      
      // Get all paragraphs in this cell
      const cellParagraphs = cellElement.getElementsByTagNameNS(ns, "p");
      
      for (let k = 0; k < cellParagraphs.length; k++) {
        const pElement = cellParagraphs[k];
        if (!pElement) continue;
        const paragraph = parseParagraph(pElement, relationships, undefined, undefined, stylesheet, theme);
        if (paragraph) {
          // Convert to Paragraph type (without list info for table cells)
          const cellParagraph: Paragraph = {
            type: 'paragraph',
            runs: paragraph.runs.map(run => ({
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
              link: run.link
            })),
            style: paragraph.style,
            alignment: paragraph.alignment
          };
          paragraphs.push(cellParagraph);
        }
      }
      
      // Check for cell properties
      const tcPr = cellElement ? cellElement.getElementsByTagNameNS(ns, "tcPr")[0] : undefined;
      let colspan: number | undefined;
      let rowspan: number | undefined;
      let verticalAlignment: TableCell['verticalAlignment'];
      let textDirection: TableCell['textDirection'];
      let cellBorders: TableCellBorders | undefined;
      let cellShading: TableShading | undefined;
      let cellMargin: TableCell['margin'] | undefined;
      
      if (tcPr) {
        const gridSpan = tcPr.getElementsByTagNameNS(ns, "gridSpan")[0];
        if (gridSpan) {
          const val = gridSpan.getAttribute("w:val");
          if (val) colspan = parseInt(val);
        }
        
        const vMerge = tcPr.getElementsByTagNameNS(ns, "vMerge")[0];
        if (vMerge) {
          // Note: DOCX vertical merge is complex, we'll handle basic cases
          const val = vMerge.getAttribute("w:val");
          if (val === "restart") rowspan = 1; // This is a simplification
        }
        
        // Vertical alignment
        const vAlign = tcPr.getElementsByTagNameNS(ns, "vAlign")[0];
        if (vAlign) {
          const val = vAlign.getAttribute("w:val");
          switch (val) {
            case 'top': verticalAlignment = 'top'; break;
            case 'center': verticalAlignment = 'center'; break;
            case 'bottom': verticalAlignment = 'bottom'; break;
          }
        }
        
        // Text direction
        const textDirectionEl = tcPr.getElementsByTagNameNS(ns, "textDirection")[0];
        if (textDirectionEl) {
          const val = textDirectionEl.getAttribute("w:val");
          switch (val) {
            case 'lr': textDirection = 'ltr'; break;
            case 'rl': textDirection = 'rtl'; break;
            case 'lrV': textDirection = 'lrV'; break;
            case 'tbV': textDirection = 'tbV'; break;
            case 'lrTbV': textDirection = 'lrTbV'; break;
            case 'tbLrV': textDirection = 'tbLrV'; break;
          }
        }
        
        // Parse cell borders
        const tcBorders = getElementByTagNameNSFallback(tcPr, ns, "tcBorders");
        if (tcBorders) {
          const docxBorders = parseTableCellBorders(tcBorders, ns);
          if (docxBorders) {
            cellBorders = convertToTableCellBorders(docxBorders);
          }
        }
        
        // Parse cell shading
        const tcShd = getElementByTagNameNSFallback(tcPr, ns, "shd");
        if (tcShd) {
          const docxShading = parseTableShading(tcShd);
          if (docxShading) {
            cellShading = convertToTableShading(docxShading);
          }
        }
        
        // Parse cell margin
        const tcMar = getElementByTagNameNSFallback(tcPr, ns, "tcMar");
        if (tcMar) {
          cellMargin = {};
          
          const top = getElementByTagNameNSFallback(tcMar, ns, "top");
          if (top) {
            const w = top.getAttribute("w:w");
            if (w) cellMargin.top = parseInt(w, 10);
          }
          
          const bottom = getElementByTagNameNSFallback(tcMar, ns, "bottom");
          if (bottom) {
            const w = bottom.getAttribute("w:w");
            if (w) cellMargin.bottom = parseInt(w, 10);
          }
          
          const left = getElementByTagNameNSFallback(tcMar, ns, "left");
          if (left) {
            const w = left.getAttribute("w:w");
            if (w) cellMargin.left = parseInt(w, 10);
          }
          
          const right = getElementByTagNameNSFallback(tcMar, ns, "right");
          if (right) {
            const w = right.getAttribute("w:w");
            if (w) cellMargin.right = parseInt(w, 10);
          }
        }
      }
      
      const cell: TableCell = {
        paragraphs,
        ...(colspan && { colspan }),
        ...(rowspan && { rowspan }),
        ...(verticalAlignment && { verticalAlignment }),
        ...(textDirection && { textDirection }),
        ...(cellBorders && { borders: cellBorders }),
        ...(cellShading && { shading: cellShading }),
        ...(cellMargin && { margin: cellMargin })
      };
      
      cells.push(cell);
    }
    
    if (cells.length > 0) {
      rows.push({ cells });
    }
  }
  
  if (rows.length === 0) return null;
  
  return {
    type: 'table',
    rows,
    ...(tableWidth && { width: tableWidth }),
    ...(tableBorders && { borders: tableBorders }),
    ...(tableShading && { shading: tableShading }),
    ...(tableCellMargin && { cellMargin: tableCellMargin })
  };
}