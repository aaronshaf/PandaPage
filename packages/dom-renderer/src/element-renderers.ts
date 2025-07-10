import type { Paragraph, Heading, Table, Image } from '@browser-document-viewer/parser';
import { renderTextRun } from './text-renderer';
import { twipsToPt, convertLineSpacing } from './units';

// Safe base64 encoding to prevent stack overflow with large images
function safeBase64Encode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const maxSize = 10 * 1024 * 1024; // 10MB limit
  
  if (bytes.length > maxSize) {
    console.warn(`Image too large (${bytes.length} bytes), truncating to ${maxSize} bytes`);
    return btoa(String.fromCharCode(...Array.from(bytes.slice(0, maxSize))));
  }
  
  // Process in chunks to avoid stack overflow
  const chunkSize = 65536; // 64KB chunks
  let result = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    result += String.fromCharCode(...Array.from(chunk));
  }
  
  return btoa(result);
}

export function renderParagraph(
  paragraph: Paragraph, 
  doc: Document, 
  currentPageNumber: number, 
  totalPages: number,
  context?: { inTableCell?: boolean }
): HTMLElement {
  const p = doc.createElement('p');
  
  // Apply spacing
  if (paragraph.spacing) {
    if (paragraph.spacing.before !== undefined) {
      p.style.marginTop = twipsToPt(paragraph.spacing.before);
    }
    if (paragraph.spacing.after !== undefined) {
      p.style.marginBottom = twipsToPt(paragraph.spacing.after);
    }
    if (paragraph.spacing.line !== undefined) {
      p.style.lineHeight = convertLineSpacing(paragraph.spacing.line, paragraph.spacing.lineRule);
    }
  } else if (!context?.inTableCell) {
    // Default spacing if not specified and not in table
    p.style.marginBottom = '12pt';
  }
  
  // Apply indentation
  if (paragraph.indentation) {
    if (paragraph.indentation.left !== undefined) {
      p.style.marginLeft = twipsToPt(paragraph.indentation.left);
    }
    if (paragraph.indentation.right !== undefined) {
      p.style.marginRight = twipsToPt(paragraph.indentation.right);
    }
    if (paragraph.indentation.firstLine !== undefined) {
      p.style.textIndent = twipsToPt(paragraph.indentation.firstLine);
    } else if (paragraph.indentation.hanging !== undefined) {
      // Hanging indent: negative text-indent with positive padding-left
      p.style.textIndent = `-${twipsToPt(paragraph.indentation.hanging)}`;
      p.style.paddingLeft = twipsToPt(paragraph.indentation.hanging);
    }
  }
  
  // Add alignment
  if (paragraph.alignment) {
    switch (paragraph.alignment) {
      case 'distribute':
        p.style.textAlign = 'justify';
        (p.style as any).textJustify = 'distribute';
        break;
      case 'highKashida':
      case 'lowKashida':
      case 'mediumKashida':
        p.style.textAlign = 'justify';
        (p.style as any).textJustify = 'kashida';
        break;
      case 'thaiDistribute':
        p.style.textAlign = 'justify';
        (p.style as any).textJustify = 'distribute';
        break;
      default:
        p.style.textAlign = paragraph.alignment;
    }
  }
  
  // Add text direction
  if ('textDirection' in paragraph && paragraph.textDirection) {
    switch (paragraph.textDirection) {
      case 'rtl':
        p.style.direction = 'rtl';
        break;
      case 'ltr':
        p.style.direction = 'ltr';
        break;
      case 'lrV':
      case 'tbV':
      case 'lrTbV':
      case 'tbLrV':
        // Vertical text requires writing-mode CSS
        p.style.writingMode = 'vertical-rl';
        if (paragraph.textDirection === 'tbLrV') {
          p.style.writingMode = 'vertical-lr';
        }
        break;
    }
  }
  
  // Add vertical alignment (for inline content)
  if ('verticalAlignment' in paragraph && paragraph.verticalAlignment && paragraph.verticalAlignment !== 'auto' && typeof paragraph.verticalAlignment === 'string') {
    p.style.verticalAlign = paragraph.verticalAlignment;
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
  
  // Apply spacing first (to match test expectations)
  if (heading.spacing) {
    if (heading.spacing.before !== undefined) {
      h.style.marginTop = twipsToPt(heading.spacing.before);
    }
    if (heading.spacing.after !== undefined) {
      h.style.marginBottom = twipsToPt(heading.spacing.after);
    }
    if (heading.spacing.line !== undefined) {
      h.style.lineHeight = convertLineSpacing(heading.spacing.line, heading.spacing.lineRule);
    }
  } else {
    // Default heading spacing
    h.style.marginBottom = '12pt';
  }
  
  // Apply indentation
  if (heading.indentation) {
    if (heading.indentation.left !== undefined) {
      h.style.marginLeft = twipsToPt(heading.indentation.left);
    }
    if (heading.indentation.right !== undefined) {
      h.style.marginRight = twipsToPt(heading.indentation.right);
    }
    if (heading.indentation.firstLine !== undefined) {
      h.style.textIndent = twipsToPt(heading.indentation.firstLine);
    } else if (heading.indentation.hanging !== undefined) {
      // Hanging indent: negative text-indent with positive padding-left
      h.style.textIndent = `-${twipsToPt(heading.indentation.hanging)}`;
      h.style.paddingLeft = twipsToPt(heading.indentation.hanging);
    }
  }
  
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
    switch (heading.alignment) {
      case 'distribute':
        h.style.textAlign = 'justify';
        (h.style as any).textJustify = 'distribute';
        break;
      case 'highKashida':
      case 'lowKashida':
      case 'mediumKashida':
        h.style.textAlign = 'justify';
        (h.style as any).textJustify = 'kashida';
        break;
      case 'thaiDistribute':
        h.style.textAlign = 'justify';
        (h.style as any).textJustify = 'distribute';
        break;
      default:
        h.style.textAlign = heading.alignment;
    }
  }
  
  // Add text direction
  if ('textDirection' in heading && heading.textDirection) {
    switch (heading.textDirection) {
      case 'rtl':
        h.style.direction = 'rtl';
        break;
      case 'ltr':
        h.style.direction = 'ltr';
        break;
      case 'lrV':
      case 'tbV':
      case 'lrTbV':
      case 'tbLrV':
        // Vertical text requires writing-mode CSS
        h.style.writingMode = 'vertical-rl';
        if (heading.textDirection === 'tbLrV') {
          h.style.writingMode = 'vertical-lr';
        }
        break;
    }
  }
  
  // Add vertical alignment (for inline content)
  if ('verticalAlignment' in heading && heading.verticalAlignment && heading.verticalAlignment !== 'auto' && typeof heading.verticalAlignment === 'string') {
    h.style.verticalAlign = heading.verticalAlignment;
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
      
      // Add vertical alignment
      if (cell.verticalAlignment) {
        td.style.verticalAlign = cell.verticalAlignment;
      }
      
      // Add text direction
      if (cell.textDirection) {
        switch (cell.textDirection) {
          case 'rtl':
            td.style.direction = 'rtl';
            break;
          case 'ltr':
            td.style.direction = 'ltr';
            break;
          case 'lrV':
          case 'tbV':
          case 'lrTbV':
          case 'tbLrV':
            // Vertical text requires writing-mode CSS
            td.style.writingMode = 'vertical-rl';
            if (cell.textDirection === 'tbLrV') {
              td.style.writingMode = 'vertical-lr';
            }
            break;
        }
      }
      
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

export function renderImage(image: Image, doc: Document, options?: { currentPageNumber?: number, totalPages?: number, lazy?: boolean }): HTMLElement {
  const img = doc.createElement('img');
  
  const shouldLazyLoad = options?.lazy !== false && options?.currentPageNumber && options?.totalPages;
  
  // Create placeholder image for lazy loading
  const placeholderSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y5ZmFmYiIgc3Ryb2tlPSIjZTFlNWU5Ii8+PHRleHQgeD0iMTAwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Loading...</vdGV4dD48L3N2Zz4=';
  
  try {
    // Convert ArrayBuffer to base64 safely
    const imgData = safeBase64Encode(image.data);
    const realSrc = `data:${image.mimeType};base64,${imgData}`;
    
    if (shouldLazyLoad) {
      // Set up lazy loading
      img.src = placeholderSrc;
      img.setAttribute('data-src', realSrc);
      img.loading = 'lazy';
      img.className = 'lazy-image';
      
      // Add intersection observer for better lazy loading control
      if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const lazyImg = entry.target as HTMLImageElement;
              const src = lazyImg.getAttribute('data-src');
              if (src) {
                lazyImg.src = src;
                lazyImg.removeAttribute('data-src');
                lazyImg.classList.remove('lazy-image');
                observer.unobserve(lazyImg);
              }
            }
          });
        }, {
          rootMargin: '100px' // Start loading 100px before the image comes into view
        });
        
        // Observe the image after a short delay to allow DOM insertion
        setTimeout(() => observer.observe(img), 100);
      } else {
        // Fallback for browsers without IntersectionObserver
        img.src = realSrc;
      }
    } else {
      img.src = realSrc;
    }
  } catch (error) {
    console.error('Error encoding image data:', error);
    // Create a placeholder for failed images
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1ZjVmNSIgc3Ryb2tlPSIjZGRkIi8+PHRleHQgeD0iMTAwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBFcnJvcjwvdGV4dD48L3N2Zz4=';
    img.alt = image.alt || 'Image failed to load';
  }
  
  if (image.width) img.width = image.width;
  if (image.height) img.height = image.height;
  if (image.alt) img.alt = image.alt;
  
  img.style.maxWidth = '100%';
  img.style.height = 'auto';
  img.style.marginBottom = '12pt';
  
  return img;
}

export function renderFootnote(footnote: any, doc: Document, currentPageNumber: number, totalPages: number, options?: { footnoteMap?: Map<string, any> }): HTMLElement {
  const div = doc.createElement('div');
  div.className = 'footnote';
  div.id = `footnote-${footnote.id}`;
  div.setAttribute('data-footnote-id', footnote.id);
  
  const contentDiv = doc.createElement('div');
  contentDiv.className = 'footnote-content';
  
  const numberSpan = doc.createElement('span');
  numberSpan.className = 'footnote-number';
  
  // Convert footnote ID to 1-based numbering for display
  const displayNumber = getFootnoteDisplayNumber(footnote.id, options?.footnoteMap);
  numberSpan.textContent = displayNumber.toString();
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

export function renderFootnoteReference(footnoteRef: any, doc: Document, options?: { footnoteMap?: Map<string, any> }): HTMLElement {
  const link = doc.createElement('a');
  link.href = `#footnote-${footnoteRef.id}`;
  link.className = 'footnote-reference';
  link.setAttribute('data-footnote-id', footnoteRef.id);
  
  const sup = doc.createElement('sup');
  // Convert footnote ID to 1-based numbering for display
  const displayNumber = getFootnoteDisplayNumber(footnoteRef.id, options?.footnoteMap);
  sup.textContent = displayNumber.toString();
  link.appendChild(sup);
  
  return link;
}

// Helper function to get 1-based footnote numbering
function getFootnoteDisplayNumber(footnoteId: string, footnoteMap?: Map<string, any>): number {
  if (!footnoteMap) {
    // Fallback: try to parse the ID as a number and add 1
    const numId = parseInt(footnoteId, 10);
    return isNaN(numId) ? 1 : numId + 1;
  }
  
  // Create a sorted list of footnote IDs for consistent numbering
  const sortedIds = Array.from(footnoteMap.keys()).sort((a, b) => {
    // Try to parse as numbers first, fall back to string comparison
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    
    return a.localeCompare(b);
  });
  
  const index = sortedIds.indexOf(footnoteId);
  return index >= 0 ? index + 1 : 1; // 1-based numbering
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