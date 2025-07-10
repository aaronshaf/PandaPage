import type { DocumentElement, Footnote } from "@browser-document-viewer/parser";

export function splitIntoPages(elements: DocumentElement[]): DocumentElement[][] {
  const pages: DocumentElement[][] = [];
  const footnotesById = new Map<string, Footnote>();

  // First pass: collect all footnotes
  elements.forEach((element) => {
    if (element.type === "footnote") {
      const footnote = element as Footnote;
      footnotesById.set(footnote.id, footnote);
    }
  });

  // Constants for page layout (in approximate lines)
  const MAX_LINES_PER_PAGE = 54; // ~9 inches at 6 lines per inch
  const LINES_PER_FOOTNOTE = 2.5; // Average lines per footnote
  const FOOTNOTE_SEPARATOR_LINES = 1; // Space for footnote separator line

  let currentPage: DocumentElement[] = [];
  let currentPageHeight = 0;
  let currentPageFootnotes = new Set<string>();
  let pageFootnotesHeight = 0;

  // Helper to estimate element height in lines
  const estimateElementHeight = (element: DocumentElement): number => {
    switch (element.type) {
      case "paragraph": {
        const text = element.runs.map((r) => r.text).join("");
        const lines = Math.max(1, Math.ceil(text.length / 80)); // ~80 chars per line
        return lines * 1.5; // Add spacing
      }
      case "heading":
        return element.level <= 2 ? 3 : 2.5;
      case "table":
        return element.rows.length * 1.5 + 1;
      case "pageBreak":
        return 0;
      default:
        return 1;
    }
  };

  // Helper to finalize current page
  const finalizePage = () => {
    if (currentPage.length > 0 || currentPageFootnotes.size > 0) {
      // Add footnotes to the current page
      if (currentPageFootnotes.size > 0) {
        // Sort footnotes numerically
        const sortedIds = Array.from(currentPageFootnotes).sort((a, b) => {
          const numA = parseInt(a, 10);
          const numB = parseInt(b, 10);
          return numA - numB;
        });

        // Add each footnote
        sortedIds.forEach((id) => {
          const footnote = footnotesById.get(id);
          if (footnote) {
            currentPage.push(footnote);
          }
        });
      }

      pages.push(currentPage);
      currentPage = [];
      currentPageHeight = 0;
      currentPageFootnotes = new Set<string>();
      pageFootnotesHeight = 0;
    }
  };

  // Process each element
  elements.forEach((element) => {
    // Skip footnotes as they're added at page end
    if (element.type === "footnote" || element.type === "header" || element.type === "footer") {
      return;
    }

    // Handle explicit page breaks
    if (element.type === "pageBreak") {
      finalizePage();
      return;
    }

    // Find footnote references in this element
    const elementFootnotes = new Set<string>();
    findFootnoteReferences(element, elementFootnotes);

    // Calculate space needed for new footnotes
    let newFootnotesHeight = 0;
    elementFootnotes.forEach((id) => {
      if (!currentPageFootnotes.has(id)) {
        newFootnotesHeight += LINES_PER_FOOTNOTE;
      }
    });

    // Add separator line if this page will have footnotes
    if (currentPageFootnotes.size === 0 && elementFootnotes.size > 0) {
      newFootnotesHeight += FOOTNOTE_SEPARATOR_LINES;
    }

    const elementHeight = estimateElementHeight(element);
    const totalRequiredHeight =
      currentPageHeight + elementHeight + pageFootnotesHeight + newFootnotesHeight;

    // Check if we need a new page
    if (totalRequiredHeight > MAX_LINES_PER_PAGE && currentPage.length > 0) {
      finalizePage();
    }

    // Add element to current page
    currentPage.push(element);
    currentPageHeight += elementHeight;

    // Track footnotes for this page
    elementFootnotes.forEach((id) => {
      if (!currentPageFootnotes.has(id)) {
        currentPageFootnotes.add(id);
        pageFootnotesHeight += LINES_PER_FOOTNOTE;
        if (currentPageFootnotes.size === 1) {
          pageFootnotesHeight += FOOTNOTE_SEPARATOR_LINES;
        }
      }
    });
  });

  // Finalize the last page
  finalizePage();

  // Ensure at least one page exists
  if (pages.length === 0) {
    pages.push([]);
  }

  return pages;
}

export function findFootnoteReferences(
  element: DocumentElement,
  referencedFootnotes: Set<string>,
): void {
  if (element.type === "paragraph") {
    element.runs.forEach((run) => {
      if ((run as any)._footnoteRef) {
        referencedFootnotes.add((run as any)._footnoteRef);
      }
    });
  } else if (element.type === "footnoteReference") {
    referencedFootnotes.add((element as any).id);
  } else if (element.type === "table") {
    element.rows.forEach((row) => {
      row.cells.forEach((cell) => {
        cell.paragraphs.forEach((paragraph) => {
          findFootnoteReferences(paragraph, referencedFootnotes);
        });
      });
    });
  }
}
