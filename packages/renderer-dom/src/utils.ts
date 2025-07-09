import type { Header, Footer, HeaderFooterInfo } from '@browser-document-viewer/parser';

// Pure functions for header/footer selection
export function getHeaderForPage(pageNumber: number, headers: HeaderFooterInfo): Header | undefined {
  // For first page, use first page header if available
  if (pageNumber === 1 && headers.first) {
    return headers.first as Header;
  }
  
  // For even pages, use even header if available
  if (pageNumber % 2 === 0 && headers.even) {
    return headers.even as Header;
  }
  
  // For odd pages, use odd header if available
  if (pageNumber % 2 === 1 && headers.odd) {
    return headers.odd as Header;
  }
  
  // Otherwise use default header
  return headers.default as Header | undefined;
}

export function getFooterForPage(pageNumber: number, footers: HeaderFooterInfo): Footer | undefined {
  // For first page, use first page footer if available
  if (pageNumber === 1 && footers.first) {
    return footers.first as Footer;
  }
  
  // For even pages, use even footer if available
  if (pageNumber % 2 === 0 && footers.even) {
    return footers.even as Footer;
  }
  
  // For odd pages, use odd footer if available
  if (pageNumber % 2 === 1 && footers.odd) {
    return footers.odd as Footer;
  }
  
  // Otherwise use default footer
  return footers.default as Footer | undefined;
}