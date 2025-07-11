// Section properties parsing for headers and footers
import type { Header, Footer, HeaderFooterInfo } from "../../types/document";
import { WORD_NAMESPACE } from "./types";

/**
 * Parse section properties to determine header/footer assignments
 * @param doc - The parsed XML document
 * @param headerMap - Map of relationship IDs to parsed headers
 * @param footerMap - Map of relationship IDs to parsed footers
 * @returns Object containing header and footer info
 */
export function parseSectionProperties(
  doc: Document,
  headerMap: Map<string, Header>,
  footerMap: Map<string, Footer>,
): { headers?: HeaderFooterInfo; footers?: HeaderFooterInfo } {
  const ns = WORD_NAMESPACE;
  const headers: HeaderFooterInfo = {};
  const footers: HeaderFooterInfo = {};

  // Find section properties in the document
  const sectPrElements = doc.getElementsByTagNameNS(ns, "sectPr");

  // Process all section properties and merge header/footer references
  // In Word, multiple sections can have different headers/footers
  for (let i = 0; i < sectPrElements.length; i++) {
    const sectPr = sectPrElements[i];
    if (sectPr) {
      // Parse header references
      const headerRefs = sectPr.getElementsByTagNameNS(ns, "headerReference");
      for (let j = 0; j < headerRefs.length; j++) {
        const ref = headerRefs[j];
        if (!ref) continue;
        const type = ref.getAttribute("w:type");
        const rId = ref.getAttribute("r:id");

        if (rId && headerMap.has(rId)) {
          const header = headerMap.get(rId)!;
          switch (type) {
            case "first":
              headers.first = header;
              break;
            case "even":
              headers.even = header;
              break;
            case "default":
            default:
              headers.default = header;
              break;
          }
        }
      }

      // Parse footer references
      const footerRefs = sectPr.getElementsByTagNameNS(ns, "footerReference");
      for (let j = 0; j < footerRefs.length; j++) {
        const ref = footerRefs[j];
        if (!ref) continue;
        const type = ref.getAttribute("w:type");
        const rId = ref.getAttribute("r:id");

        if (rId && footerMap.has(rId)) {
          const footer = footerMap.get(rId)!;
          switch (type) {
            case "first":
              footers.first = footer;
              break;
            case "even":
              footers.even = footer;
              break;
            case "default":
            default:
              footers.default = footer;
              break;
          }
        }
      }
    }
  }

  return {
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    footers: Object.keys(footers).length > 0 ? footers : undefined,
  };
}

/**
 * Get header for a specific page
 * @param pageNumber - The page number (1-based)
 * @param headers - Header info object
 * @returns The appropriate header or undefined
 */
export function getHeaderForPage(
  pageNumber: number,
  headers: HeaderFooterInfo,
): Header | undefined {
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

/**
 * Get footer for a specific page
 * @param pageNumber - The page number (1-based)
 * @param footers - Footer info object
 * @returns The appropriate footer or undefined
 */
export function getFooterForPage(
  pageNumber: number,
  footers: HeaderFooterInfo,
): Footer | undefined {
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
