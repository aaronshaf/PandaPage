import { useState, useEffect } from 'react';
import { marked } from 'marked';

interface DocumentViewerProps {
  result: string | null;
  loading: boolean;
  showSpinner: boolean;
  viewMode: 'read' | 'print';
  printScale: number;
  removeFrontmatter: (markdown: string) => string;
  splitIntoPages: (html: string) => string[];
  countWords: (text: string) => number;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  result,
  loading,
  showSpinner,
  viewMode,
  printScale,
  removeFrontmatter,
  splitIntoPages,
  countWords
}) => {
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPageIndicator, setShowPageIndicator] = useState(false);

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

  // Page tracking for print view
  useEffect(() => {
    if (viewMode !== 'print') return;

    const handleScroll = () => {
      const pages = document.querySelectorAll('.print-page');
      let currentVisiblePage = 1;
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const rect = page.getBoundingClientRect();
        
        // Consider a page "current" if its top is within viewport or if it's the closest to center
        if (rect.top <= window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
          currentVisiblePage = i + 1;
          break;
        }
        
        // If we're past halfway through viewport, this is probably the current page
        if (rect.top <= window.innerHeight / 2) {
          currentVisiblePage = i + 1;
        }
      }
      
      setCurrentPage(currentVisiblePage);
      
      // Show page indicator temporarily when scrolling
      setShowPageIndicator(true);
      clearTimeout(window.pageIndicatorTimeout);
      window.pageIndicatorTimeout = window.setTimeout(() => {
        setShowPageIndicator(false);
      }, 2000);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
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

  return (
    <div className={viewMode === 'print' ? '' : 'p-6'}>
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
          {showPageIndicator && totalPages > 0 && (
            <div className="fixed top-1/2 right-8 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg transition-opacity duration-300 z-30">
              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
          
          <div className="print-page-container" style={{
            transform: `scale(${printScale})`,
            transformOrigin: 'top center',
            marginBottom: `${(1 - printScale) * 11 * 96}px` // Adjust margin for scaled height
          }}>
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
                  <div className="absolute bottom-6 right-6 text-xs text-gray-400 print:hidden">
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