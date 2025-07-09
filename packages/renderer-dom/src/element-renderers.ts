import type { Paragraph, Heading, Table, Image } from '@browser-document-viewer/parser';
import { renderTextRun } from './text-renderer';

export function renderParagraph(
  paragraph: Paragraph, 
  doc: Document, 
  currentPageNumber: number, 
  totalPages: number,
  context?: { inTableCell?: boolean }
): HTMLElement {
  const p = doc.createElement('p');
  // Only add margin if not in a table cell
  if (!context?.inTableCell) {
    p.style.marginBottom = '12pt'; // Standard paragraph spacing
  }
  
  // Add alignment
  if (paragraph.alignment) {
    p.style.textAlign = paragraph.alignment;
  }
  
  // Render runs
  paragraph.runs.forEach(run => {
    const span = renderTextRun(run, doc, currentPageNumber, totalPages);
    p.appendChild(span);
  });
  
  // Add images if present
  if (paragraph.images) {
    paragraph.images.forEach(image => {
      const img = renderImage(image, doc);
      if (img) p.appendChild(img);
    });
  }
  
  return p;
}

export function renderHeading(
  heading: Heading, 
  doc: Document, 
  currentPageNumber: number, 
  totalPages: number
): HTMLElement {
  const h = doc.createElement(`h${heading.level}`);
  h.style.marginBottom = '12pt'; // Standard heading spacing
  h.style.fontWeight = 'bold';
  
  // Add size styles based on level (using points for document consistency)
  const fontSizes = {
    1: '24pt',  // Heading 1
    2: '20pt',  // Heading 2
    3: '16pt',  // Heading 3
    4: '14pt',  // Heading 4
    5: '12pt',  // Heading 5
    6: '11pt'   // Heading 6
  };
  h.style.fontSize = fontSizes[heading.level] || '12pt';
  
  // Add alignment
  if (heading.alignment) {
    h.style.textAlign = heading.alignment;
  }
  
  // Render runs
  heading.runs.forEach(run => {
    h.appendChild(renderTextRun(run, doc, currentPageNumber, totalPages));
  });
  
  return h;
}

export function renderTable(
  table: Table, 
  doc: Document, 
  currentPageNumber: number, 
  totalPages: number
): HTMLElement {
  const tableEl = doc.createElement('table');
  tableEl.style.borderCollapse = 'collapse';
  tableEl.style.marginBottom = '12pt';
  
  table.rows.forEach((row, rowIndex) => {
    const tr = doc.createElement('tr');
    
    row.cells.forEach(cell => {
      const isHeader = rowIndex === 0;
      const td = doc.createElement(isHeader ? 'th' : 'td');
      
      // Add border and padding styles
      td.style.border = '1px solid #ccc';
      td.style.padding = '4pt'; // Standard cell padding
      
      if (isHeader) {
        td.style.fontWeight = '600';
        
        // Check if content has white text and add dark background
        const hasWhiteText = cell.paragraphs.some(p => 
          p.runs.some(r => r.color === '#FFFFFF' || r.color === '#ffffff')
        );
        
        if (hasWhiteText) {
          td.style.backgroundColor = '#1f2937';
          td.style.color = 'white';
        } else {
          td.style.backgroundColor = '#f3f4f6';
        }
      }
      
      // Add cell attributes
      if (cell.colspan) td.setAttribute('colspan', cell.colspan.toString());
      if (cell.rowspan) td.setAttribute('rowspan', cell.rowspan.toString());
      
      // Render cell content
      if (cell.paragraphs.length === 0 || 
          (cell.paragraphs.length === 1 && 
           cell.paragraphs[0] && 
           cell.paragraphs[0].runs.length === 0)) {
        // Empty cell - don't create empty paragraph
        td.innerHTML = '&nbsp;';
      } else {
        cell.paragraphs.forEach(paragraph => {
          const p = renderParagraph(paragraph, doc, currentPageNumber, totalPages, { inTableCell: true });
          td.appendChild(p);
        });
      }
      
      tr.appendChild(td);
    });
    
    tableEl.appendChild(tr);
  });
  
  return tableEl;
}

export function renderImage(image: Image, doc: Document): HTMLElement {
  const img = doc.createElement('img');
  
  // Convert ArrayBuffer to base64
  const imgData = btoa(String.fromCharCode(...new Uint8Array(image.data)));
  img.src = `data:${image.mimeType};base64,${imgData}`;
  
  if (image.width) img.width = image.width;
  if (image.height) img.height = image.height;
  if (image.alt) img.alt = image.alt;
  
  img.style.maxWidth = '100%';
  img.style.height = 'auto';
  img.style.marginBottom = '12pt';
  
  return img;
}

export function renderFootnote(footnote: any, doc: Document, currentPageNumber: number, totalPages: number): HTMLElement {
  const div = doc.createElement('div');
  div.className = 'footnote';
  div.id = `footnote-${footnote.id}`;
  div.setAttribute('data-footnote-id', footnote.id);
  
  const contentDiv = doc.createElement('div');
  contentDiv.className = 'footnote-content';
  
  const numberSpan = doc.createElement('span');
  numberSpan.className = 'footnote-number';
  numberSpan.textContent = footnote.id;
  contentDiv.appendChild(numberSpan);
  
  const textDiv = doc.createElement('div');
  textDiv.className = 'footnote-text';
  
  footnote.elements.forEach((el: any) => {
    if (el.type === 'paragraph') {
      textDiv.appendChild(renderParagraph(el, doc, currentPageNumber, totalPages, { inTableCell: false }));
    } else if (el.type === 'table') {
      textDiv.appendChild(renderTable(el, doc, currentPageNumber, totalPages));
    }
  });
  
  contentDiv.appendChild(textDiv);
  div.appendChild(contentDiv);
  return div;
}

export function renderFootnoteReference(footnoteRef: any, doc: Document): HTMLElement {
  const link = doc.createElement('a');
  link.href = `#footnote-${footnoteRef.id}`;
  link.className = 'footnote-reference';
  link.setAttribute('data-footnote-id', footnoteRef.id);
  
  const sup = doc.createElement('sup');
  sup.textContent = footnoteRef.text;
  link.appendChild(sup);
  
  return link;
}

export function renderBookmark(bookmark: any, doc: Document): HTMLElement {
  const span = doc.createElement('span');
  span.id = bookmark.name;
  span.className = 'bookmark-anchor';
  span.setAttribute('data-bookmark-id', bookmark.id);
  return span;
}

export function renderPageBreak(doc: Document): HTMLElement {
  const div = doc.createElement('div');
  div.className = 'page-break';
  div.style.pageBreakAfter = 'always';
  return div;
}