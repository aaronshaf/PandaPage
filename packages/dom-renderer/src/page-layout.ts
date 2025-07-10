import type { ParsedDocument } from "@browser-document-viewer/parser";

export function applyPageStyles(
  pageDiv: HTMLElement,
  parsedDoc: ParsedDocument,
  pageIndex: number,
): void {
  // For now, apply default page styles until document sections are available
  // TODO: Use parsedDoc.sections[pageIndex] when available
  const defaultPageWidth = "8.5in";
  const defaultPageHeight = "11in";
  const defaultMargin = "1in";

  // Apply page container styles
  pageDiv.style.width = defaultPageWidth;
  pageDiv.style.minHeight = defaultPageHeight;
  pageDiv.style.margin = "0 auto 2rem auto";
  pageDiv.style.background = "white";
  pageDiv.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 1px 3px -1px rgba(0, 0, 0, 0.06)";
  pageDiv.style.padding = defaultMargin;
  pageDiv.style.position = "relative";
  pageDiv.style.pageBreakAfter = "always";
  pageDiv.style.border = "1px solid #e5e7eb";
  pageDiv.style.boxSizing = "border-box";
}

export function applyContentStyles(
  contentDiv: HTMLElement,
  parsedDoc: ParsedDocument,
  pageIndex: number,
): void {
  // Remove padding from content - it should extend to the page margins
  contentDiv.style.padding = "0";
  contentDiv.style.paddingBottom = "0.5in"; // Space for footer
  contentDiv.style.fontSize = "12pt";
  contentDiv.style.lineHeight = "1.2";
  contentDiv.style.position = "relative";

  // Add top padding for header on pages after the first
  if (pageIndex > 0) {
    contentDiv.style.paddingTop = "0.75in"; // Space for header with page number
  }

  // TODO: When document sections are available, calculate content area based on page dimensions
  // const section = parsedDoc.sections?.[pageIndex];
  // if (section?.properties?.pageSize && section.properties.margins) {
  //   const pageWidth = section.properties.pageSize.width;
  //   const pageHeight = section.properties.pageSize.height;
  //   const margins = section.properties.margins;
  //   // Calculate content area and apply styles
  // }
}
