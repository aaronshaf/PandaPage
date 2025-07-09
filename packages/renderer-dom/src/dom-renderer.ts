// DOM-based renderer using proper DOM APIs instead of string concatenation
import type {
  ParsedDocument,
  DocumentElement,
  Header,
  Footer,
} from '@browser-document-viewer/parser';

import { getHeaderForPage, getFooterForPage } from './utils';
import { applyPageStyles, applyContentStyles } from './page-layout';
import { 
  renderParagraph, 
  renderHeading, 
  renderTable, 
  renderImage, 
  renderFootnote, 
  renderFootnoteReference, 
  renderBookmark, 
  renderPageBreak 
} from './element-renderers';
import { splitIntoPages } from './page-splitter';
import { renderHeader, renderHeaderWithPageNumber, renderFooter, renderFooterWithPageNumber } from './header-footer-renderer';
import { addStyles } from './styles';

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
      addStyles();
    }
    
    // Split content into pages based on page breaks
    const pages = splitIntoPages(parsedDoc.elements);
    this.totalPages = pages.length;
    
    // Render each page with appropriate footers
    pages.forEach((pageElements, pageIndex) => {
      this.currentPageNumber = pageIndex + 1;
      const pageDiv = this.doc.createElement('div');
      pageDiv.className = 'page';
      pageDiv.setAttribute('data-page-number', this.currentPageNumber.toString());
      
      // Apply page-specific dimensions and margins as inline styles
      applyPageStyles(pageDiv, parsedDoc, pageIndex);
      
      // Create page content wrapper
      const contentDiv = this.doc.createElement('div');
      contentDiv.className = 'page-content';
      
      // Apply content-specific styles (no padding, extends to page margins)
      applyContentStyles(contentDiv, parsedDoc, pageIndex);
      
      // Add header to page if available (skip first page for Chicago style)
      if (parsedDoc.headers && this.currentPageNumber > 1) {
        const header = getHeaderForPage(this.currentPageNumber, parsedDoc.headers);
        if (header) {
          const headerEl = renderHeaderWithPageNumber(header, this.currentPageNumber, this.totalPages, this.doc);
          pageDiv.appendChild(headerEl);
        }
      }
      
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
        const footer = getFooterForPage(this.currentPageNumber, parsedDoc.footers);
        if (footer) {
          const footerEl = renderFooterWithPageNumber(footer, this.currentPageNumber, this.totalPages, this.doc);
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
        return renderParagraph(element, this.doc, this.currentPageNumber, this.totalPages);
      case 'heading':
        return renderHeading(element, this.doc, this.currentPageNumber, this.totalPages);
      case 'table':
        return renderTable(element, this.doc, this.currentPageNumber, this.totalPages);
      case 'footer':
        return renderFooter(element, this.doc, this.currentPageNumber, this.totalPages);
      case 'header':
        return renderHeader(element, this.doc, this.currentPageNumber, this.totalPages);
      case 'footnote':
        return renderFootnote(element, this.doc, this.currentPageNumber, this.totalPages);
      case 'footnoteReference':
        return renderFootnoteReference(element, this.doc);
      case 'bookmark':
        return renderBookmark(element, this.doc);
      case 'image':
        return renderImage(element, this.doc);
      case 'pageBreak':
        return renderPageBreak(this.doc);
      default:
        return null;
    }
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