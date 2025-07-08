// DOM-based renderer using proper DOM APIs instead of string concatenation
import type {
  ParsedDocument,
  DocumentElement,
  Paragraph,
  Heading,
  Table,
  TextRun,
  Image
} from '@browser-document-viewer/parser';

export interface DOMRenderOptions {
  document?: Document;
  includeStyles?: boolean;
  pageSize?: 'letter' | 'a4';
}

export class DOMRenderer {
  private doc: Document;
  private currentPageNumber: number = 1;
  private totalPages: number = 1;
  
  constructor(options: DOMRenderOptions = {}) {
    this.doc = options.document || (typeof document !== 'undefined' ? document : this.createDocument());
  }
  
  private createDocument(): Document {
    // For server-side or test environments, use happy-dom or jsdom
    try {
      // Try happy-dom first (since it's in dev dependencies)
      const { Window } = require('happy-dom');
      const window = new Window();
      return window.document;
    } catch {
      try {
        // Try jsdom as fallback
        const { JSDOM } = require('jsdom');
        const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
        return dom.window.document;
      } catch {
        // Final fallback - create minimal mock document
        throw new Error('DOM environment not available. Please install happy-dom or jsdom for server-side rendering.');
      }
    }
  }
  
  renderDocument(parsedDoc: ParsedDocument, options: { addContainer?: boolean } = {}): HTMLElement {
    const container = this.doc.createElement('div');
    if (options.addContainer !== false) {
      container.className = 'document-container';
    }
    
    // Add styles
    if (typeof document !== 'undefined') {
      this.addStyles();
    }
    
    // Split content into pages based on page breaks
    const pages = this.splitIntoPages(parsedDoc.elements);
    this.totalPages = pages.length;
    
    // Render each page with appropriate footers
    pages.forEach((pageElements, pageIndex) => {
      this.currentPageNumber = pageIndex + 1;
      const pageDiv = this.doc.createElement('div');
      pageDiv.className = 'page';
      pageDiv.setAttribute('data-page-number', this.currentPageNumber.toString());
      
      // Create page content wrapper
      const contentDiv = this.doc.createElement('div');
      contentDiv.className = 'page-content';
      
      // Render page content
      pageElements.forEach(element => {
        const rendered = this.renderElement(element);
        if (rendered) {
          contentDiv.appendChild(rendered);
        }
      });
      
      pageDiv.appendChild(contentDiv);
      
      // Add footer to page if available
      if (parsedDoc.footers) {
        const footer = this.getFooterForPage(this.currentPageNumber, this.totalPages, parsedDoc.footers);
        if (footer) {
          const footerEl = this.renderFooterWithPageNumber(footer, this.currentPageNumber, this.totalPages);
          pageDiv.appendChild(footerEl);
        }
      }
      
      container.appendChild(pageDiv);
    });
    
    return container;
  }
  
  renderElement(element: DocumentElement): HTMLElement | null {
    switch (element.type) {
      case 'paragraph':
        return this.renderParagraph(element);
      case 'heading':
        return this.renderHeading(element);
      case 'table':
        return this.renderTable(element);
      case 'footer':
        return this.renderFooter(element);
      case 'header':
        return this.renderHeader(element);
      case 'footnote':
        return this.renderFootnote(element);
      case 'footnoteReference':
        return this.renderFootnoteReference(element);
      case 'bookmark':
        return this.renderBookmark(element);
      case 'image':
        return this.renderImage(element);
      case 'pageBreak':
        return this.renderPageBreak();
      default:
        return null;
    }
  }
  
  private renderParagraph(paragraph: Paragraph): HTMLElement {
    const p = this.doc.createElement('p');
    p.className = 'mb-4';
    
    // Add alignment
    if (paragraph.alignment) {
      p.classList.add(`text-${paragraph.alignment}`);
    }
    
    // Render runs
    paragraph.runs.forEach(run => {
      const span = this.renderTextRun(run);
      p.appendChild(span);
    });
    
    // Add images if present
    if (paragraph.images) {
      paragraph.images.forEach(image => {
        const img = this.renderImage(image);
        if (img) p.appendChild(img);
      });
    }
    
    return p;
  }
  
  private renderTextRun(run: TextRun): HTMLElement {
    // Handle field codes
    if ((run as any)._fieldCode) {
      const fieldCode = (run as any)._fieldCode;
      let modifiedRun = { ...run };
      
      switch (fieldCode) {
        case 'PAGE':
          modifiedRun.text = this.currentPageNumber.toString();
          break;
        case 'NUMPAGES':
          modifiedRun.text = this.totalPages.toString();
          break;
      }
      
      run = modifiedRun;
    }
    // Check for footnote reference first
    if ((run as any)._footnoteRef) {
      const footnoteId = (run as any)._footnoteRef;
      const link = this.doc.createElement('a');
      link.href = `#footnote-${footnoteId}`;
      link.className = 'footnote-reference';
      link.setAttribute('data-footnote-id', footnoteId);
      
      const sup = this.doc.createElement('sup');
      sup.textContent = run.text;
      link.appendChild(sup);
      
      return link;
    }
    
    let element: HTMLElement;
    
    // Handle links
    if (run.link) {
      element = this.doc.createElement('a');
      (element as HTMLAnchorElement).href = run.link;
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noopener noreferrer');
      // Only add onclick in browser environment
      if (typeof window !== 'undefined') {
        element.setAttribute('onclick', 'return confirmDocumentLink(this.href)');
      }
    } else {
      element = this.doc.createElement('span');
    }
    
    // Apply formatting classes
    const classes: string[] = [];
    if (run.bold) classes.push('font-bold');
    if (run.italic) classes.push('italic');
    if (run.underline) classes.push('underline');
    if (run.strikethrough) classes.push('line-through');
    
    if (classes.length > 0) {
      element.className = classes.join(' ');
    }
    
    // Apply inline styles
    const styles: string[] = [];
    if (run.fontSize) styles.push(`font-size: ${run.fontSize}pt`);
    if (run.fontFamily) styles.push(`font-family: ${run.fontFamily}`);
    if (run.color) styles.push(`color: ${run.color}`);
    if (run.backgroundColor) styles.push(`background-color: ${run.backgroundColor}`);
    
    if (styles.length > 0) {
      element.style.cssText = styles.join('; ');
    }
    
    // Handle superscript/subscript
    if (run.superscript) {
      const sup = this.doc.createElement('sup');
      sup.textContent = run.text;
      element.appendChild(sup);
    } else if (run.subscript) {
      const sub = this.doc.createElement('sub');
      sub.textContent = run.text;
      element.appendChild(sub);
    } else {
      element.textContent = run.text;
    }
    
    return element;
  }
  
  private renderTable(table: Table): HTMLElement {
    const tableEl = this.doc.createElement('table');
    tableEl.className = 'border-collapse mb-4';
    
    table.rows.forEach((row, rowIndex) => {
      const tr = this.doc.createElement('tr');
      
      row.cells.forEach(cell => {
        const isHeader = rowIndex === 0;
        const td = this.doc.createElement(isHeader ? 'th' : 'td');
        
        // Base classes
        let classes = 'border px-4 py-2';
        if (isHeader) {
          classes += ' font-semibold';
          
          // Check if content has white text and add dark background
          const hasWhiteText = cell.paragraphs.some(p => 
            p.runs.some(r => r.color === '#FFFFFF' || r.color === '#ffffff')
          );
          
          if (hasWhiteText) {
            classes += ' bg-gray-800 text-white';
          } else {
            classes += ' bg-gray-100';
          }
        }
        
        td.className = classes;
        
        // Add cell attributes
        if (cell.colspan) td.setAttribute('colspan', cell.colspan.toString());
        if (cell.rowspan) td.setAttribute('rowspan', cell.rowspan.toString());
        
        // Render cell content
        cell.paragraphs.forEach(paragraph => {
          const p = this.renderParagraph(paragraph);
          td.appendChild(p);
        });
        
        tr.appendChild(td);
      });
      
      tableEl.appendChild(tr);
    });
    
    return tableEl;
  }
  
  private renderFooter(footer: any): HTMLElement {
    // This is now only used for inline footers in the document
    // For page footers, use renderFooterWithPageNumber
    return this.renderFooterWithPageNumber(footer, this.currentPageNumber, this.totalPages);
  }
  
  private renderHeader(header: any): HTMLElement {
    const headerEl = this.doc.createElement('header');
    headerEl.className = 'header mb-4 pb-2 border-b border-gray-300';
    
    header.elements.forEach((el: any) => {
      if (el.type === 'paragraph') {
        headerEl.appendChild(this.renderParagraph(el));
      } else if (el.type === 'table') {
        headerEl.appendChild(this.renderTable(el));
      }
    });
    
    return headerEl;
  }
  
  private renderHeading(heading: Heading): HTMLElement {
    const h = this.doc.createElement(`h${heading.level}`);
    h.className = 'mb-4 font-bold';
    
    // Add size classes based on level
    const sizeClasses = {
      1: 'text-4xl',
      2: 'text-3xl',
      3: 'text-2xl',
      4: 'text-xl',
      5: 'text-lg',
      6: 'text-base'
    };
    h.classList.add(sizeClasses[heading.level] || 'text-base');
    
    // Add alignment
    if (heading.alignment) {
      h.classList.add(`text-${heading.alignment}`);
    }
    
    // Render runs
    heading.runs.forEach(run => {
      h.appendChild(this.renderTextRun(run));
    });
    
    return h;
  }
  
  private renderFootnote(footnote: any): HTMLElement {
    const div = this.doc.createElement('div');
    div.className = 'footnote';
    div.id = `footnote-${footnote.id}`;
    div.setAttribute('data-footnote-id', footnote.id);
    
    const contentDiv = this.doc.createElement('div');
    contentDiv.className = 'footnote-content';
    
    const numberSpan = this.doc.createElement('span');
    numberSpan.className = 'footnote-number';
    numberSpan.textContent = footnote.id;
    contentDiv.appendChild(numberSpan);
    
    footnote.elements.forEach((el: any) => {
      if (el.type === 'paragraph') {
        contentDiv.appendChild(this.renderParagraph(el));
      } else if (el.type === 'table') {
        contentDiv.appendChild(this.renderTable(el));
      }
    });
    
    div.appendChild(contentDiv);
    return div;
  }
  
  private renderFootnoteReference(footnoteRef: any): HTMLElement {
    const link = this.doc.createElement('a');
    link.href = `#footnote-${footnoteRef.id}`;
    link.className = 'footnote-reference';
    link.setAttribute('data-footnote-id', footnoteRef.id);
    
    const sup = this.doc.createElement('sup');
    sup.textContent = footnoteRef.text;
    link.appendChild(sup);
    
    return link;
  }
  
  private renderBookmark(bookmark: any): HTMLElement {
    const span = this.doc.createElement('span');
    span.id = bookmark.name;
    span.className = 'bookmark-anchor';
    span.setAttribute('data-bookmark-id', bookmark.id);
    return span;
  }
  
  private renderImage(image: Image): HTMLElement {
    const img = this.doc.createElement('img');
    
    // Convert ArrayBuffer to base64
    const imgData = btoa(String.fromCharCode(...new Uint8Array(image.data)));
    img.src = `data:${image.mimeType};base64,${imgData}`;
    
    if (image.width) img.width = image.width;
    if (image.height) img.height = image.height;
    if (image.alt) img.alt = image.alt;
    
    img.className = 'max-w-full h-auto mb-4';
    
    return img;
  }
  
  private renderPageBreak(): HTMLElement {
    const div = this.doc.createElement('div');
    div.className = 'page-break';
    div.style.pageBreakAfter = 'always';
    return div;
  }
  
  private addStyles(): void {
    // Add CSS styles to document head if they don't exist
    const existingStyle = document.getElementById('browser-document-viewer-styles');
    if (existingStyle) return;
    
    const style = document.createElement('style');
    style.id = 'browser-document-viewer-styles';
    style.textContent = `
      .page {
        position: relative;
        margin-bottom: 2rem;
        min-height: 11in;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .page-content {
        padding: 1in;
        padding-bottom: 2in; /* Space for footer */
      }
      
      .footer {
        position: absolute;
        bottom: 0;
        left: 1in;
        right: 1in;
        padding-bottom: 0.5in;
      }
      
      .footnote-reference {
        color: #3b82f6;
        text-decoration: none;
        font-weight: 500;
      }
      
      .footnote-reference:hover {
        text-decoration: underline;
      }
      
      .footnote {
        margin-top: 2rem;
        padding: 1rem;
        background-color: #f9fafb;
        border-left: 4px solid #e5e7eb;
        border-radius: 0.375rem;
      }
      
      .footnote-content {
        font-size: 0.875rem;
        line-height: 1.25rem;
      }
      
      .footnote-number {
        font-weight: 600;
        color: #374151;
        margin-right: 0.5rem;
      }
      
      .bookmark-anchor {
        display: inline-block;
        width: 0;
        height: 0;
        overflow: hidden;
      }
      
      @media print {
        .page {
          page-break-after: always;
          margin: 0;
          box-shadow: none;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  private splitIntoPages(elements: DocumentElement[]): DocumentElement[][] {
    const pages: DocumentElement[][] = [];
    let currentPage: DocumentElement[] = [];
    
    elements.forEach(element => {
      if (element.type === 'pageBreak') {
        // Start a new page
        if (currentPage.length > 0) {
          pages.push(currentPage);
          currentPage = [];
        }
      } else if (element.type !== 'footer' && element.type !== 'header') {
        // Add non-footer/header elements to current page
        currentPage.push(element);
      }
    });
    
    // Add the last page if it has content
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }
    
    // If no pages were created, create at least one
    if (pages.length === 0) {
      pages.push([]);
    }
    
    return pages;
  }
  
  private getFooterForPage(pageNumber: number, totalPages: number, footers: any): any {
    // For first page, use first page footer if available
    if (pageNumber === 1 && footers.first) {
      return footers.first;
    }
    
    // For even pages, use even footer if available
    if (pageNumber % 2 === 0 && footers.even) {
      return footers.even;
    }
    
    // For odd pages, use odd footer if available
    if (pageNumber % 2 === 1 && footers.odd) {
      return footers.odd;
    }
    
    // Otherwise use default footer
    return footers.default;
  }
  
  private renderFooterWithPageNumber(footer: any, pageNumber: number, totalPages: number): HTMLElement {
    // Store current page context
    const prevPageNumber = this.currentPageNumber;
    const prevTotalPages = this.totalPages;
    this.currentPageNumber = pageNumber;
    this.totalPages = totalPages;
    
    const footerEl = this.doc.createElement('footer');
    footerEl.className = 'footer mt-4 pt-2 border-t border-gray-300';
    
    footer.elements.forEach((el: any) => {
      if (el.type === 'paragraph') {
        // Check if this is a footer with recipient name and page number
        const fullText = el.runs?.map((r: any) => r.text).join('') || '';
        
        if (fullText.includes('[Recipient') && fullText.includes('Recovery Plan')) {
          // Check if there's actually a tab character in the runs
          const hasTab = el.runs?.some((r: any) => r.text?.includes('\t')) || false;
          
          if (hasTab) {
            // Create flex container for left-right alignment
            const flexDiv = this.doc.createElement('div');
            flexDiv.className = 'flex justify-between items-center mb-4';
            
            const leftDiv = this.doc.createElement('div');
            leftDiv.className = 'flex-1';
            
            const rightDiv = this.doc.createElement('div');
            rightDiv.className = 'flex-none';
            
            let foundTab = false;
            const runs = el.runs || [];
            
            for (const run of runs) {
              const text = run.text || '';
              
              // Check if this run contains a tab
              if (text.includes('\t')) {
                // Split on tab
                const parts = text.split('\t');
                
                // Add pre-tab content to left
                if (parts[0]) {
                  const leftRun = { ...run, text: parts[0] };
                  leftDiv.appendChild(this.renderTextRun(leftRun));
                }
                
                // Add post-tab content to right
                if (parts[1]) {
                  const rightRun = { ...run, text: parts[1] };
                  rightDiv.appendChild(this.renderTextRun(rightRun));
                }
                
                foundTab = true;
              } else if (!foundTab) {
                // Before tab, add to left
                leftDiv.appendChild(this.renderTextRun(run));
              } else {
                // After tab, add to right
                rightDiv.appendChild(this.renderTextRun(run));
              }
            }
            
            flexDiv.appendChild(leftDiv);
            flexDiv.appendChild(rightDiv);
            footerEl.appendChild(flexDiv);
          } else {
            // No tab found, render normally
            footerEl.appendChild(this.renderParagraph(el));
          }
        } else {
          footerEl.appendChild(this.renderParagraph(el));
        }
      } else if (el.type === 'table') {
        footerEl.appendChild(this.renderTable(el));
      }
    });
    
    // Restore page context
    this.currentPageNumber = prevPageNumber;
    this.totalPages = prevTotalPages;
    
    return footerEl;
  }
  
  // Convert DOM element to HTML string
  renderToHTML(parsedDoc: ParsedDocument, options: { includeContainer?: boolean } = {}): string {
    const container = this.renderDocument(parsedDoc, { addContainer: options.includeContainer });
    
    if (options.includeContainer === false) {
      // Return just the inner HTML without the container div
      return container.innerHTML;
    }
    
    return container.outerHTML;
  }
}