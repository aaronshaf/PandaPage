import React from "react";
import { DocxRenderer } from "./DocxRenderer";
import { renderToHtml } from "@browser-document-viewer/dom-renderer";
import { marked } from "marked";
import type { EnhancedDocxDocument, ParsedDocument } from "@browser-document-viewer/core";

interface PageRenderOptions {
  parsedDocument?: ParsedDocument | null;
  structuredDocument?: EnhancedDocxDocument | null;
  result: string;
  viewMode: "read" | "print";
  removeFrontmatter: (markdown: string) => string;
  splitIntoPages: (html: string) => string[];
}

interface PageRenderResult {
  pages: React.ReactElement[];
  totalPages: number;
}

export function renderPrintPages(options: PageRenderOptions): PageRenderResult {
  const {
    parsedDocument,
    structuredDocument,
    result,
    viewMode,
    removeFrontmatter,
    splitIntoPages,
  } = options;

  if (parsedDocument) {
    // For new parser documents, use DOM renderer - it already includes pagination
    const htmlContent = renderToHtml(parsedDocument, { includeStyles: false });

    // The DOM renderer already splits content into pages with proper structure
    // We need to extract the individual page divs instead of re-paginating
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const pageElements = tempDiv.querySelectorAll(".page");

    // If no page elements found, treat the entire content as a single page
    if (pageElements.length === 0) {
      // Check if there's actually no content or just no pagination
      const hasContent =
        htmlContent.trim().length > 0 && htmlContent !== '<div class="document-container"></div>';

      // Log warning to help debug rendering issues
      console.warn(
        "No .page elements found in DOM-rendered content. This may indicate a rendering issue.",
      );

      const singlePage = (
        <article
          key={0}
          className="print-page"
          data-testid="parsed-document-page-1"
          data-page-number={1}
          data-page-type="parsed-document"
          data-content-type="dom-rendered"
          data-total-pages={1}
          id="page-1"
          aria-label="Page 1 of 1"
          role="document"
        >
          {!hasContent && (
            <div
              className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4"
              role="alert"
            >
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-medium">Document Rendering Warning</h3>
                  <p className="text-sm mt-1">
                    The document appears to be empty or could not be rendered properly.
                  </p>
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer font-medium">Debug Information</summary>
                    <pre className="mt-2 bg-yellow-100 p-2 rounded overflow-x-auto">
                      {`Content length: ${htmlContent.length} characters
HTML content: ${htmlContent.substring(0, 200)}${htmlContent.length > 200 ? "..." : ""}
Renderer: DOM (parsed document)`}
                    </pre>
                  </details>
                </div>
              </div>
            </div>
          )}
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </article>
      );

      return { pages: [singlePage], totalPages: 1 };
    }

    // Return pages without updating state during render
    const pageList = Array.from(pageElements).map((pageElement, index) => (
      <article
        key={index}
        className="print-page"
        data-testid={`parsed-document-page-${index + 1}`}
        data-page-number={index + 1}
        data-page-type="parsed-document"
        data-content-type="dom-rendered"
        data-total-pages={pageElements.length}
        id={`page-${index + 1}`}
        aria-label={`Page ${index + 1} of ${pageElements.length}`}
        role="document"
        dangerouslySetInnerHTML={{ __html: pageElement.innerHTML }}
      />
    ));

    return { pages: pageList, totalPages: pageElements.length };
  }

  if (structuredDocument?.elements) {
    // For structured documents, split by page breaks if available
    const allElements = structuredDocument.elements;
    const pages: any[][] = [];
    let currentPage: any[] = [];

    // Split elements by page breaks
    for (const element of allElements) {
      // For now, put all elements on one page since DocxElement doesn't include pageBreak
      currentPage.push(element);
    }

    // Add the last page if it has content
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    // If no pages or page breaks found, treat as single page
    if (pages.length === 0) {
      pages.push(allElements);
    }

    const pageList = pages.map((pageElements, index) => (
      <article
        key={index}
        className="print-page"
        data-testid={`print-page-${index}`}
        data-page-number={index + 1}
        data-page-type="structured-document"
        data-content-type="docx-rendered"
        data-total-pages={pages.length}
        id={`page-${index + 1}`}
        aria-label={`Page ${index + 1} of ${pages.length}`}
        role="document"
      >
        <DocxRenderer elements={pageElements} viewMode={viewMode} />
      </article>
    ));

    return { pages: pageList, totalPages: pages.length };
  }

  // For markdown, use the existing pagination
  const htmlContent = marked.parse(removeFrontmatter(result));
  const pages = splitIntoPages(htmlContent as string);

  const pageList = pages.map((pageContent, index) => (
    <article
      key={index}
      data-testid={`markdown-page-container-${index + 1}`}
      className="print-page relative"
      data-page-number={index + 1}
      data-page-type="markdown"
      data-content-type="markdown-rendered"
      data-total-pages={pages.length}
      id={`page-${index + 1}`}
      aria-label={`Page ${index + 1} of ${pages.length}`}
      role="document"
    >
      <section
        className="page-content"
        data-testid={`markdown-page-${index + 1}`}
        dangerouslySetInnerHTML={{ __html: pageContent }}
      />
      {/* Page number - only show in screen view */}
      <footer
        data-testid={`page-number-${index + 1}`}
        style={{
          position: "absolute",
          bottom: "24px",
          right: "24px",
          fontSize: "12px",
          color: "#9ca3af",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
        className="print:hidden page-footer"
        aria-label={`Page ${index + 1} of ${pages.length}`}
      >
        {index + 1} of {pages.length}
      </footer>
    </article>
  ));

  return { pages: pageList, totalPages: pages.length };
}
