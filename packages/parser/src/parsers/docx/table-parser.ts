// Table parsing functions
import type { Table, TableRow, TableCell, Paragraph } from '../../types/document';
import { parseParagraph } from './paragraph-parser';
import { WORD_NAMESPACE } from './types';

/**
 * Parse a table element
 * @param tableElement - The table element to parse
 * @param relationships - Map of relationship IDs to URLs
 * @returns Parsed table or null
 */
export function parseTable(tableElement: Element, relationships?: Map<string, string>): Table | null {
  const ns = WORD_NAMESPACE;
  const rows: TableRow[] = [];
  
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
        const paragraph = parseParagraph(pElement, relationships, undefined, undefined);
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
      
      // Check for cell spanning properties
      const tcPr = cellElement ? cellElement.getElementsByTagNameNS(ns, "tcPr")[0] : undefined;
      let colspan: number | undefined;
      let rowspan: number | undefined;
      
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
      }
      
      const cell: TableCell = {
        paragraphs,
        colspan,
        rowspan
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
    rows
  };
}