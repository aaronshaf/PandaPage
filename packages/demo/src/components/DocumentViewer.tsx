import { useState, useEffect } from 'react';
import { marked } from 'marked';

interface DocumentViewerProps {
  result: string | null;
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
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  result,
  loading,
  showSpinner,
  viewMode,
  printScale,
  showPrimaryNav,
  removeFrontmatter,
  splitIntoPages,
  countWords,
  showOutline,
  setShowOutline,
  extractHeadings
}) => {
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPageIndicator, setShowPageIndicator] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false);

  // Calculate print scale
  const calculatePrintScale = () => {
    if (typeof window === 'undefined') return 1;
    
    const containerWidth = window.innerWidth - 320; // Account for potential sidebar
    const pageWidth = 8.5 * 96; // 8.5 inches at 96 DPI
    const maxScale = Math.min(containerWidth / pageWidth, 1.2); // Max 120%
    return Math.max(0.4, maxScale * 0.9); // Use 90% of available width, min 40%
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

    // Find the scrollable container (the document content area)
    const scrollContainer = document.querySelector('.document-scroll-container');
    if (!scrollContainer) return;

    const handleScroll = (event: Event) => {
      const container = event.target as HTMLElement;
      const pages = container.querySelectorAll('.print-page');
      let currentVisiblePage = 1;
      
      const containerRect = container.getBoundingClientRect();
      const containerMiddle = containerRect.top + containerRect.height / 2;
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
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
      
      // Show page indicator temporarily when manually scrolling (but not in top 100px or programmatic scroll)
      const shouldShowIndicator = scrollTop > 100 && !isProgrammaticScroll;
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
    
    // Initial call with fake event
    handleScroll({ target: scrollContainer } as any);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      clearTimeout(window.pageIndicatorTimeout);
    };
  }, [viewMode, result]);

  if (!result) {
    return loading && showSpinner ? (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-gray-400 mb-4 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500">{result ? 'Converting document to Markdown...' : 'Loading document...'}</p>
        </div>
      </div>
    ) : null;
  }

  // Calculate headings and top-level count
  const headings = result ? extractHeadings(removeFrontmatter(result)) : [];
  const headingCount = headings.length;
  const hasMultipleHeadings = headingCount === 0 || headingCount > 1; // Loading state or multiple headings
  const topLevelHeadingCount = headings.filter(h => h.level === 1).length || headingCount; // Fall back to total if no H1s

  return (
    <div className={`relative ${viewMode === 'print' ? '' : 'p-6'}`}>
      {/* Floating Outline Button */}
      <button
        data-testid="document-outline-button"
        onClick={() => hasMultipleHeadings && setShowOutline(!showOutline)}
        disabled={!hasMultipleHeadings}
        aria-label={`Toggle document outline${!showOutline && headingCount > 0 ? ` (${topLevelHeadingCount} sections)` : ''}`}
        className={`fixed z-50 flex items-center gap-1 px-2 py-2 text-sm font-medium rounded-lg shadow-sm transition-all ${
          !hasMultipleHeadings
            ? 'text-gray-400 cursor-not-allowed bg-gray-50 border border-gray-200'
            : showOutline 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
        style={{
          // More accurate positioning below both nav bars
          top: (() => {
            const primaryNavHeight = showPrimaryNav ? 64 : 0;
            const secondaryNavHeight = 48;
            const padding = 16;
            return `${primaryNavHeight + secondaryNavHeight + padding}px`;
          })(),
          left: '16px'
        }}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
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

      {viewMode === 'read' ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div 
              className="rendered-markdown prose prose-gray prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: marked(removeFrontmatter(result)) }}
            />
          </div>
        </div>
      ) : (
        // Print view
        <div className="print-view relative">
          {/* Page Indicator */}
          {showPageIndicator && totalPages > 1 && (
            <div 
              data-testid="page-indicator"
              className="absolute bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg transition-opacity duration-300 z-30"
              style={{
                // Position relative to the document container
                right: '40px', // Account for scrollbar width + padding
                top: (() => {
                  if (typeof window === 'undefined') return '20px';
                  
                  // Get the scrollable container's height
                  const container = document.querySelector('.document-scroll-container');
                  if (!container) return '20px';
                  
                  const containerHeight = container.clientHeight;
                  const indicatorHeight = 60; // Approximate height of the indicator
                  const padding = 20;
                  const travelSpace = Math.max(0, containerHeight - indicatorHeight - (padding * 2));
                  
                  // Calculate position based on scroll progress
                  const calculatedTop = padding + (scrollProgress * travelSpace);
                  
                  return `${calculatedTop}px`;
                })(),
                transform: 'translateY(-50%)'
              }}
            >
              <div className="text-sm font-medium font-sans">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
          
          <div className="print-page-container" style={{
            '--print-scale': printScale,
          } as React.CSSProperties & { '--print-scale': number }}>
            {(() => {
              const htmlContent = marked(removeFrontmatter(result));
              const pages = splitIntoPages(htmlContent);
              
              // Update total pages when pages change
              if (pages.length !== totalPages) {
                setTimeout(() => setTotalPages(pages.length), 0);
              }
              
              return pages.map((pageContent, index) => (
                <div key={index} className="print-page" data-page={index + 1}>
                  <div 
                    className="print-content"
                    dangerouslySetInnerHTML={{ __html: pageContent }}
                  />
                  {/* Page number - only show in screen view */}
                  <div className="absolute bottom-6 right-6 text-xs text-gray-400 print:hidden font-sans">
                    Page {index + 1} of {pages.length}
                  </div>
                </div>
              ));
            })()}
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