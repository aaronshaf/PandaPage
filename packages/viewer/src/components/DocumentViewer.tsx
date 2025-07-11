import { useState, useEffect } from "react";
import { marked } from "marked";
import {
  setupPageTracking,
  calculatePrintScale,
  checkMobile,
  calculatePageIndicatorTop,
} from "./page-tracking-utils";
import { renderPrintPages } from "./page-render-utils";
import type { EnhancedDocxDocument, ParsedDocument } from "@browser-document-viewer/core";

interface DocumentViewerProps {
  result: string | null;
  structuredDocument?: EnhancedDocxDocument | null;
  parsedDocument?: ParsedDocument | null;
  loading: boolean;
  showSpinner: boolean;
  viewMode: "read" | "print";
  printScale: number;
  showPrimaryNav: boolean;
  removeFrontmatter: (markdown: string) => string;
  splitIntoPages: (html: string) => string[];
  countWords: (text: string) => number;
  showOutline: boolean;
  setShowOutline: (show: boolean) => void;
  extractHeadings: (markdown: string) => Array<{ level: number; text: string; id: string }>;
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
}) => {
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPageIndicator, setShowPageIndicator] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false);
  const [navHeight, setNavHeight] = useState(140);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollbarHeight, setScrollbarHeight] = useState(0);
  const [scrollbarOffset, setScrollbarOffset] = useState(0);

  // Check if mobile on mount and resize
  useEffect(() => {
    const updateMobile = () => setIsMobile(checkMobile());
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  useEffect(() => {
    if (viewMode === "print") {
      const newScale = calculatePrintScale();
      // Only update if significantly different to avoid infinite loops
      if (Math.abs(newScale - printScale) > 0.05) {
        // Use a small delay to avoid updating during render
        setTimeout(() => {
          // Re-check if we're still in print mode
          if (viewMode === "print") {
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
    return setupPageTracking({
      viewMode,
      setCurrentPage,
      setScrollProgress,
      setShowPageIndicator,
      setScrollbarHeight,
      setScrollbarOffset,
      isProgrammaticScroll,
      setIsProgrammaticScroll,
    });
  }, [viewMode, result, totalPages, isProgrammaticScroll]);

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
          <svg
            data-testid="spinner-icon"
            className="animate-spin h-8 w-8 text-gray-400 mb-4 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p data-testid="loading-text" className="text-gray-500">
            {result ? "Converting document to Markdown..." : "Loading document..."}
          </p>
        </div>
      </div>
    ) : null;
  }

  // Calculate headings and top-level count
  const headings = result ? extractHeadings(removeFrontmatter(result)) : [];
  const headingCount = headings.length;
  const hasMultipleHeadings = headingCount > 1; // Only show button if more than 1 heading
  const topLevelHeadingCount = headings.filter((h) => h.level === 1).length || headingCount; // Fall back to total if no H1s

  return (
    <div data-testid="document-viewer" className={`relative ${viewMode === "print" ? "" : "p-6"}`}>
      {/* Floating Outline Button - only show if multiple headings and not on mobile */}
      {hasMultipleHeadings && !isMobile && (
        <button
          data-testid="document-outline-button"
          onClick={() => hasMultipleHeadings && setShowOutline(!showOutline)}
          disabled={!hasMultipleHeadings}
          aria-label={`Toggle document outline${!showOutline && headingCount > 0 ? ` (${topLevelHeadingCount} sections)` : ""}`}
          className={`fixed z-50 flex items-center gap-1 px-2 py-2 text-sm font-medium rounded-lg shadow-sm ${
            !hasMultipleHeadings
              ? "text-gray-400 cursor-not-allowed bg-gray-50 border border-gray-200"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
          }`}
          style={{
            top: `${navHeight}px`,
            left: "16px",
          }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {showOutline ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h7"
              />
            )}
          </svg>
          {!showOutline && headingCount > 0 && (
            <span className="ml-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center">
              {topLevelHeadingCount}
            </span>
          )}
          <span className="sr-only">
            {showOutline ? "Close outline" : `Open outline (${topLevelHeadingCount} sections)`}
          </span>
        </button>
      )}

      {viewMode === "read" ? (
        <div data-testid="read-view" className="max-w-2xl mx-auto">
          <div data-testid="reading-mode-container" className="bg-white p-6">
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
              className="fixed bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg transition-all duration-200 z-30 pointer-events-none"
              style={{
                // Position relative to viewport, centered in scrollbar area
                right: "8px", // Close to scrollbar
                top: calculatePageIndicatorTop({
                  scrollProgress,
                  scrollbarHeight,
                  scrollbarOffset,
                  navHeight,
                }),
                transform: "translateY(-50%)",
                // Add visual improvements
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                className="text-sm font-medium font-sans whitespace-nowrap"
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
            style={
              {
                "--print-scale": printScale,
              } as React.CSSProperties & { "--print-scale": number }
            }
          >
            {renderPrintPages({
              parsedDocument,
              structuredDocument,
              result,
              viewMode,
              removeFrontmatter,
              splitIntoPages,
              setTotalPages,
              totalPages,
            })}
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
