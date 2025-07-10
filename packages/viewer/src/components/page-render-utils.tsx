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
  setTotalPages: (total: number) => void;
  totalPages: number;
}

export function renderPrintPages(options: PageRenderOptions): React.ReactElement[] {
  const {
    parsedDocument,
    structuredDocument,
    result,
    viewMode,
    removeFrontmatter,
    splitIntoPages,
    setTotalPages,
    totalPages,
  } = options;

  if (parsedDocument) {
    // For new parser documents, use DOM renderer - it already includes pagination
    const htmlContent = renderToHtml(parsedDocument, { includeStyles: false });

    // The DOM renderer already splits content into pages with proper structure
    // We need to extract the individual page divs instead of re-paginating
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const pageElements = tempDiv.querySelectorAll(".page");

    // Update total pages when pages change
    if (pageElements.length !== totalPages) {
      setTimeout(() => setTotalPages(pageElements.length), 0);
    }

    return Array.from(pageElements).map((pageElement, index) => (
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
  }

  if (structuredDocument?.elements) {
    // For structured documents, split by page breaks if available
    const allElements = structuredDocument.elements;
    const pages: any[][] = [];
    let currentPage: any[] = [];

    // Split elements by page breaks
    for (const element of allElements) {
      if (element.type === "pageBreak") {
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
  }

  // For markdown, use the existing pagination
  const htmlContent = marked.parse(removeFrontmatter(result));
  const pages = splitIntoPages(htmlContent as string);

  // Update total pages when pages change
  if (pages.length !== totalPages) {
    setTimeout(() => setTotalPages(pages.length), 0);
  }

  return pages.map((pageContent, index) => (
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
}
