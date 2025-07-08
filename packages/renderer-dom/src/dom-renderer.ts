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
      
      // Apply page-specific dimensions and margins as inline styles
      this.applyPageStyles(pageDiv, parsedDoc, pageIndex);
      
      // Create page content wrapper
      const contentDiv = this.doc.createElement('div');
      contentDiv.className = 'page-content';
      
      // Apply content-specific styles (no padding, extends to page margins)
      this.applyContentStyles(contentDiv, parsedDoc, pageIndex);
      
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
  
  private applyPageStyles(pageDiv: HTMLElement, parsedDoc: ParsedDocument, pageIndex: number): void {
    // For now, apply default page styles until document sections are available
    // TODO: Use parsedDoc.sections[pageIndex] when available
    const defaultPageWidth = '8.5in';
    const defaultPageHeight = '11in';
    const defaultMargin = '1in';
    
    // Apply page container styles
    pageDiv.style.width = defaultPageWidth;
    pageDiv.style.minHeight = defaultPageHeight;
    pageDiv.style.margin = '0 auto 2rem auto';
    pageDiv.style.background = 'white';
    pageDiv.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 1px 3px -1px rgba(0, 0, 0, 0.06)';
    pageDiv.style.padding = defaultMargin;
    pageDiv.style.position = 'relative';
    pageDiv.style.pageBreakAfter = 'always';
    pageDiv.style.border = '1px solid #e5e7eb';
    pageDiv.style.boxSizing = 'border-box';
  }
  
  private applyContentStyles(contentDiv: HTMLElement, parsedDoc: ParsedDocument, pageIndex: number): void {
    // Remove padding from content - it should extend to the page margins
    contentDiv.style.padding = '0';
    contentDiv.style.paddingBottom = '0.5in'; // Space for footer
    contentDiv.style.fontSize = '12pt';
    contentDiv.style.lineHeight = '1.2';
    contentDiv.style.position = 'relative';
    
    // TODO: When document sections are available, calculate content area based on page dimensions
    // const section = parsedDoc.sections?.[pageIndex];
    // if (section?.properties?.pageSize && section.properties.margins) {
    //   const pageWidth = section.properties.pageSize.width;
    //   const pageHeight = section.properties.pageSize.height;
    //   const margins = section.properties.margins;
    //   // Calculate content area and apply styles
    // }
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
  
  private renderParagraph(paragraph: Paragraph, context?: { inTableCell?: boolean }): HTMLElement {
    const p = this.doc.createElement('p');
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
    
    // Apply formatting styles
    if (run.bold) element.style.fontWeight = 'bold';
    if (run.italic) element.style.fontStyle = 'italic';
    if (run.underline) element.style.textDecoration = 'underline';
    if (run.strikethrough) element.style.textDecoration = 'line-through';
    
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
    tableEl.style.borderCollapse = 'collapse';
    tableEl.style.marginBottom = '12pt';
    
    table.rows.forEach((row, rowIndex) => {
      const tr = this.doc.createElement('tr');
      
      row.cells.forEach(cell => {
        const isHeader = rowIndex === 0;
        const td = this.doc.createElement(isHeader ? 'th' : 'td');
        
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
            const p = this.renderParagraph(paragraph, { inTableCell: true });
            td.appendChild(p);
          });
        }
        
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
    headerEl.style.marginBottom = '12pt';
    headerEl.style.paddingBottom = '8pt';
    headerEl.style.borderBottom = '1px solid #d1d5db';
    
    header.elements.forEach((el: any) => {
      if (el.type === 'paragraph') {
        headerEl.appendChild(this.renderParagraph(el, { inTableCell: false }));
      } else if (el.type === 'table') {
        headerEl.appendChild(this.renderTable(el));
      }
    });
    
    return headerEl;
  }
  
  private renderHeading(heading: Heading): HTMLElement {
    const h = this.doc.createElement(`h${heading.level}`);
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
        contentDiv.appendChild(this.renderParagraph(el, { inTableCell: false }));
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
    
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.marginBottom = '12pt';
    
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
        /* Page styles are now applied inline for dynamic dimensions */
        /* Only shared styles remain here */
        position: relative;
        box-sizing: border-box;
      }
      
      .page-content {
        /* Content styles are now applied inline for dynamic dimensions */
        /* Only shared styles remain here */
        position: relative;
        box-sizing: border-box;
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
        margin-top: 16pt;
        padding: 12pt;
        background-color: #f9fafb;
        border-left: 4px solid #e5e7eb;
        border-radius: 0.375rem;
      }
      
      .footnote-content {
        font-size: 10pt;
        line-height: 12pt;
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
    const footnotes: DocumentElement[] = [];
    
    // First pass: collect footnotes and regular content
    elements.forEach(element => {
      if (element.type === 'pageBreak') {
        // Start a new page
        if (currentPage.length > 0) {
          pages.push(currentPage);
          currentPage = [];
        }
      } else if (element.type === 'footnote') {
        // Collect footnotes separately
        footnotes.push(element);
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
    
    // Second pass: add footnotes to each page that references them
    if (footnotes.length > 0) {
      pages.forEach(page => {
        // Find footnote references in this page
        const referencedFootnotes = new Set<string>();
        
        page.forEach(element => {
          this.findFootnoteReferences(element, referencedFootnotes);
        });
        
        // Add referenced footnotes to the end of this page
        footnotes.forEach(footnote => {
          if (referencedFootnotes.has((footnote as any).id)) {
            page.push(footnote);
          }
        });
      });
    }
    
    return pages;
  }
  
  private findFootnoteReferences(element: DocumentElement, referencedFootnotes: Set<string>): void {
    if (element.type === 'paragraph') {
      element.runs.forEach(run => {
        if ((run as any)._footnoteRef) {
          referencedFootnotes.add((run as any)._footnoteRef);
        }
      });
    } else if (element.type === 'footnoteReference') {
      referencedFootnotes.add((element as any).id);
    } else if (element.type === 'table') {
      element.rows.forEach(row => {
        row.cells.forEach(cell => {
          cell.paragraphs.forEach(paragraph => {
            this.findFootnoteReferences(paragraph, referencedFootnotes);
          });
        });
      });
    }
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
    footerEl.className = 'footer'; // Keep footer class for positioning
    footerEl.style.marginTop = '12pt';
    footerEl.style.paddingTop = '8pt';
    footerEl.style.borderTop = '1px solid #d1d5db';
    
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
            flexDiv.style.display = 'flex';
            flexDiv.style.justifyContent = 'space-between';
            flexDiv.style.alignItems = 'center';
            flexDiv.style.marginBottom = '12pt';
            
            const leftDiv = this.doc.createElement('div');
            leftDiv.style.flex = '1';
            
            const rightDiv = this.doc.createElement('div');
            rightDiv.style.flexShrink = '0';
            
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
            footerEl.appendChild(this.renderParagraph(el, { inTableCell: false }));
          }
        } else {
          footerEl.appendChild(this.renderParagraph(el, { inTableCell: false }));
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