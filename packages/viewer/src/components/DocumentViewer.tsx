import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { DocxRenderer } from './DocxRenderer';
import { renderToHtml } from '@browser-document-viewer/dom-renderer';
import type { EnhancedDocxDocument, ParsedDocument } from '@browser-document-viewer/core';

interface DocumentViewerProps {
  result: string | null;
  structuredDocument?: EnhancedDocxDocument | null;
  parsedDocument?: ParsedDocument | null;
  loading: boolean;
  showSpinner: boolean;
  viewMode: 'read' | 'print';
  printScale: number;
  showPrimaryNav: boolean;
  removeFrontmatter: (markdown: string) => string;
  splitIntoPages: (html: string) => string[];
  countWords: (text: string) => number;
  showOutline: boolean;
  setShowOutline: (show: boolean) => void;
  extractHeadings: (markdown: string) => Array<{level: number, text: string, id: string}>;
  extractContent: (html: string) => string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  result,
  structuredDocument,
  parsedDocument,
  loading,
  showSpinner,
  viewMode,
  printScale,
  showPrimaryNav,
  removeFrontmatter,
  splitIntoPages,
  showOutline,
  setShowOutline,
  extractHeadings,
  extractContent
}) => {
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPageIndicator, setShowPageIndicator] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false);
  const [navHeight, setNavHeight] = useState(140);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate print scale
  const calculatePrintScale = () => {
    if (typeof window === 'undefined') return 1;
    
    const containerWidth = window.innerWidth - 320; // Account for potential sidebar
    const pageWidth = 8.5 * 96; // 8.5 inches at 96 DPI
    const maxScale = Math.min(containerWidth / pageWidth, 1.2); // Max 120%
    return Math.max(0.4, maxScale * 0.83); // Use 83% of available width for 100% default scale, min 40%
  };

  useEffect(() => {
    if (viewMode === 'print') {
      const newScale = calculatePrintScale();
      // Only update if significantly different to avoid infinite loops
      if (Math.abs(newScale - printScale) > 0.05) {
        // Use a small delay to avoid updating during render
        setTimeout(() => {
          // Re-check if we're still in print mode
          if (viewMode === 'print') {
            // Note: This would need to be passed up to parent or managed differently
            // For now, we'll use the passed printScale
          }
        }, 100);
      }
    }
  }, [viewMode, printScale]);

  // Expose function to signal programmatic scroll
  useEffect(() => {
    (window as any).signalProgrammaticScroll = () => {
      setIsProgrammaticScroll(true);
    };
    
    return () => {
      delete (window as any).signalProgrammaticScroll;
    };
  }, []);

  // Page tracking for print view
  useEffect(() => {
    if (viewMode !== 'print') return;

    // Small delay to ensure DOM is updated after page elements are created
    const setupScrollTracking = () => {
      // Find the scrollable container (the document content area)
      const scrollContainer = document.querySelector('.document-scroll-container');
      if (!scrollContainer) {
        console.warn('No .document-scroll-container found for page tracking');
        return;
      }

      const handleScroll = (event: Event) => {
        const container = event.target as HTMLElement;
        const pages = container.querySelectorAll('.print-page');
        let currentVisiblePage = 1;
        
        // Debug logging
        if (pages.length === 0) {
          console.warn('No .print-page elements found for page tracking');
          return;
        }
        
        const containerRect = container.getBoundingClientRect();
        const containerMiddle = containerRect.top + containerRect.height / 2;
        
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          if (!page) continue;
          const rect = page.getBoundingClientRect();
          
          // Consider a page "current" if its center is closest to container center
          if (rect.top <= containerMiddle && rect.bottom > containerMiddle) {
            currentVisiblePage = i + 1;
            break;
          }
          
          // If we're past the container middle, this is probably the current page
          if (rect.top <= containerMiddle) {
            currentVisiblePage = i + 1;
          }
        }
        
        setCurrentPage(currentVisiblePage);
        
        // Update scroll progress for page indicator positioning
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight - container.clientHeight;
        const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
        setScrollProgress(progress);
        
        // Show page indicator temporarily when manually scrolling (but not programmatic scroll)
        const shouldShowIndicator = !isProgrammaticScroll;
        setShowPageIndicator(shouldShowIndicator);
        
        if (shouldShowIndicator) {
          clearTimeout(window.pageIndicatorTimeout);
          window.pageIndicatorTimeout = window.setTimeout(() => {
            setShowPageIndicator(false);
          }, 2000);
        }
        
        // Reset programmatic scroll flag after a short delay
        if (isProgrammaticScroll) {
          setTimeout(() => {
            setIsProgrammaticScroll(false);
          }, 100);
        }
      };

      scrollContainer.addEventListener('scroll', handleScroll);
      
      // Initial call with fake event - mark as programmatic to avoid showing page indicator
      setIsProgrammaticScroll(true);
      handleScroll({ target: scrollContainer } as any);
      // Reset programmatic flag after initial setup
      setTimeout(() => setIsProgrammaticScroll(false), 100);

      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        clearTimeout(window.pageIndicatorTimeout);
      };
    };

    // Small delay to ensure DOM elements are rendered
    const timeoutId = setTimeout(setupScrollTracking, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [viewMode, result, totalPages]);

  // Update nav height when primary nav visibility changes
  useEffect(() => {
    const updateNavHeight = () => {
      const header = document.querySelector('[data-testid="app-header"]');
      if (header) {
        const headerRect = header.getBoundingClientRect();
        setNavHeight(headerRect.height + 16); // Add padding
      }
    };

    // Update immediately
    updateNavHeight();

    // Also update after a short delay to catch any animations
    const timer = setTimeout(updateNavHeight, 350);

    return () => clearTimeout(timer);
  }, [showPrimaryNav]);

  if (!result) {
    return loading && showSpinner ? (
      <div data-testid="loading-spinner" className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg data-testid="spinner-icon" className="animate-spin h-8 w-8 text-gray-400 mb-4 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p data-testid="loading-text" className="text-gray-500">{result ? 'Converting document to Markdown...' : 'Loading document...'}</p>
        </div>
      </div>
    ) : null;
  }

  // Calculate headings and top-level count
  const headings = result ? extractHeadings(removeFrontmatter(result)) : [];
  const headingCount = headings.length;
  const hasMultipleHeadings = headingCount > 1; // Only show button if more than 1 heading
  const topLevelHeadingCount = headings.filter(h => h.level === 1).length || headingCount; // Fall back to total if no H1s

  return (
    <div 
      data-testid="document-viewer"
      className={`relative ${viewMode === 'print' ? '' : 'p-6'}`}
    >
      {/* Floating Outline Button - only show if multiple headings and not on mobile */}
      {hasMultipleHeadings && !isMobile && (
        <button
        data-testid="document-outline-button"
        onClick={() => hasMultipleHeadings && setShowOutline(!showOutline)}
        disabled={!hasMultipleHeadings}
        aria-label={`Toggle document outline${!showOutline && headingCount > 0 ? ` (${topLevelHeadingCount} sections)` : ''}`}
        className={`fixed z-50 flex items-center gap-1 px-2 py-2 text-sm font-medium rounded-lg shadow-sm ${
          !hasMultipleHeadings
            ? 'text-gray-400 cursor-not-allowed bg-gray-50 border border-gray-200'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
        style={{
          top: `${navHeight}px`,
          left: '16px'
        }}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {showOutline ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          )}
        </svg>
        {!showOutline && headingCount > 0 && (
          <span className="ml-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center">
            {topLevelHeadingCount}
          </span>
        )}
        <span className="sr-only">
          {showOutline ? 'Close outline' : `Open outline (${topLevelHeadingCount} sections)`}
        </span>
      </button>
      )}

      {viewMode === 'read' ? (
        <div data-testid="read-view" className="max-w-2xl mx-auto">
          <div 
            data-testid="reading-mode-container"
            className="bg-white p-6"
          >
            {/* Read mode should always use markdown for simplified rendering */}
            <div 
              data-testid="markdown-content"
              className="rendered-markdown prose prose-gray prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: marked(removeFrontmatter(result)) }}
            />
          </div>
        </div>
      ) : (
        // Print view
        <div data-testid="print-view" className="print-view relative">
          {/* Page Indicator */}
          {showPageIndicator && totalPages > 1 && (
            <div 
              data-testid="page-indicator"
              className="fixed bg-gray-800 text-white px-3 py-2 rounded-lg shadow-sm transition-opacity duration-300 z-30"
              style={{
                // Position relative to viewport
                right: '24px', // Account for scrollbar width + padding
                top: (() => {
                  if (typeof window === 'undefined') return `${navHeight + 20}px`;
                  
                  // Calculate available space from nav to bottom of viewport
                  const viewportHeight = window.innerHeight;
                  const indicatorHeight = 60; // Approximate height of the indicator
                  const padding = 20;
                  const availableSpace = viewportHeight - navHeight - indicatorHeight - (padding * 2);
                  const travelSpace = Math.max(0, availableSpace);
                  
                  // Calculate position based on scroll progress
                  const calculatedTop = navHeight + padding + (scrollProgress * travelSpace);
                  
                  return `${calculatedTop}px`;
                })(),
                transform: 'translateY(-50%)'
              }}
            >
              <div 
                className="text-sm font-medium font-sans"
                aria-label={`Page ${currentPage} of ${totalPages}`}
                role="status"
                aria-live="polite"
              >
                {currentPage} of {totalPages}
              </div>
            </div>
          )}
          
          <div 
            data-testid="print-page-container"
            className="print-page-container" 
            style={{
              '--print-scale': printScale,
            } as React.CSSProperties & { '--print-scale': number }}
          >
            {parsedDocument ? (
              // For new parser documents, use DOM renderer - it already includes pagination
              (() => {
                const htmlContent = renderToHtml(parsedDocument, { includeStyles: false });
                
                // The DOM renderer already splits content into pages with proper structure
                // We need to extract the individual page divs instead of re-paginating
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;
                const pageElements = tempDiv.querySelectorAll('.page');
                
                // Update total pages when pages change
                if (pageElements.length !== totalPages) {
                  setTimeout(() => setTotalPages(pageElements.length), 0);
                }
                
                return Array.from(pageElements).map((pageElement, index) => (
                  <div 
                    key={index} 
                    className="print-page"
                    data-testid={`parsed-document-page-${index + 1}`}
                    data-page-number={index + 1}
                    data-page-type="parsed-document"
                    data-content-type="dom-rendered"
                    data-total-pages={pageElements.length}
                    dangerouslySetInnerHTML={{ __html: pageElement.innerHTML }}
                  />
                ));
              })()
            ) : structuredDocument?.elements ? (
              // For structured documents, split by page breaks if available
              (() => {
                const allElements = structuredDocument.elements;
                const pages: any[][] = [];
                let currentPage: any[] = [];
                
                // Split elements by page breaks
                for (const element of allElements) {
                  if (element.type === 'pageBreak') {
                    // Found a page break - finish current page
                    if (currentPage.length > 0) {
                      pages.push(currentPage);
                      currentPage = [];
                    }
                  } else {
                    currentPage.push(element);
                  }
                }
                
                // Add the last page if it has content
                if (currentPage.length > 0) {
                  pages.push(currentPage);
                }
                
                // If no pages or page breaks found, treat as single page
                if (pages.length === 0) {
                  pages.push(allElements);
                }
                
                if (pages.length !== totalPages) {
                  setTimeout(() => setTotalPages(pages.length), 0);
                }
                
                return pages.map((pageElements, index) => (
                  <div 
                    key={index} 
                    className="print-page"
                    data-testid={`print-page-${index}`}
                    data-page-number={index + 1}
                    data-page-type="structured-document"
                    data-content-type="docx-rendered"
                    data-total-pages={pages.length}
                  >
                    <DocxRenderer 
                      elements={pageElements} 
                      viewMode={viewMode}
                    />
                  </div>
                ));
              })()
            ) : (
              // For markdown, use the existing pagination
              (() => {
                const htmlContent = marked.parse(removeFrontmatter(result));
                const pages = splitIntoPages(htmlContent as string);
                
                // Update total pages when pages change
                if (pages.length !== totalPages) {
                  setTimeout(() => setTotalPages(pages.length), 0);
                }
                
                return pages.map((pageContent, index) => (
                  <div key={index} data-testid={`markdown-page-container-${index + 1}`} style={{ position: 'relative' }}>
                    <div 
                      className="print-page"
                      data-testid={`markdown-page-${index + 1}`}
                      data-page-number={index + 1}
                      data-page-type="markdown"
                      data-content-type="markdown-rendered"
                      data-total-pages={pages.length}
                      dangerouslySetInnerHTML={{ __html: pageContent }}
                    />
                    {/* Page number - only show in screen view */}
                    <div 
                      data-testid={`page-number-${index + 1}`}
                      style={{
                        position: 'absolute',
                        bottom: '24px',
                        right: '24px',
                        fontSize: '12px',
                        color: '#9ca3af',
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}
                      className="print:hidden"
                      aria-label={`Page ${index + 1} of ${pages.length}`}
                    >
                      {index + 1} of {pages.length}
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    pageIndicatorTimeout: number;
  }
}