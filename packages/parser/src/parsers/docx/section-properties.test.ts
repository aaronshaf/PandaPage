import { describe, it, expect, beforeEach } from "bun:test";
import "../../test-setup";
import { parseSectionProperties, getHeaderForPage, getFooterForPage } from "./section-properties";
import type { Header, Footer, HeaderFooterInfo } from "../../types/document";
import { WORD_NAMESPACE } from "./types";

describe("Section Properties", () => {
  let headerMap: Map<string, Header>;
  let footerMap: Map<string, Footer>;

  beforeEach(() => {
    headerMap = new Map();
    footerMap = new Map();

    // Setup mock headers
    headerMap.set("rId1", {
      type: "header",
      elements: [
        {
          type: "paragraph",
          runs: [{ text: "Default Header" }],
        },
      ],
    });

    headerMap.set("rId2", {
      type: "header",
      elements: [
        {
          type: "paragraph",
          runs: [{ text: "First Page Header" }],
        },
      ],
    });

    headerMap.set("rId3", {
      type: "header",
      elements: [
        {
          type: "paragraph",
          runs: [{ text: "Even Page Header" }],
        },
      ],
    });

    // Setup mock footers
    footerMap.set("rId4", {
      type: "footer",
      elements: [
        {
          type: "paragraph",
          runs: [{ text: "Default Footer" }],
        },
      ],
    });

    footerMap.set("rId5", {
      type: "footer",
      elements: [
        {
          type: "paragraph",
          runs: [{ text: "First Page Footer" }],
        },
      ],
    });

    footerMap.set("rId6", {
      type: "footer",
      elements: [
        {
          type: "paragraph",
          runs: [{ text: "Even Page Footer" }],
        },
      ],
    });
  });

  describe("parseSectionProperties", () => {
    it("should parse default header and footer references", () => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="${WORD_NAMESPACE}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <w:body>
            <w:sectPr>
              <w:headerReference w:type="default" r:id="rId1"/>
              <w:footerReference w:type="default" r:id="rId4"/>
            </w:sectPr>
          </w:body>
        </w:document>`;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, "text/xml");

      const result = parseSectionProperties(doc, headerMap, footerMap);

      expect(result.headers).toBeDefined();
      expect(result.footers).toBeDefined();
      expect(result.headers?.default).toBe(headerMap.get("rId1")!);
      expect(result.footers?.default).toBe(footerMap.get("rId4")!);
    });

    it("should parse first page header and footer references", () => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="${WORD_NAMESPACE}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <w:body>
            <w:sectPr>
              <w:headerReference w:type="first" r:id="rId2"/>
              <w:footerReference w:type="first" r:id="rId5"/>
            </w:sectPr>
          </w:body>
        </w:document>`;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, "text/xml");

      const result = parseSectionProperties(doc, headerMap, footerMap);

      expect(result.headers?.first).toBe(headerMap.get("rId2")!);
      expect(result.footers?.first).toBe(footerMap.get("rId5")!);
    });

    it("should parse even page header and footer references", () => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="${WORD_NAMESPACE}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <w:body>
            <w:sectPr>
              <w:headerReference w:type="even" r:id="rId3"/>
              <w:footerReference w:type="even" r:id="rId6"/>
            </w:sectPr>
          </w:body>
        </w:document>`;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, "text/xml");

      const result = parseSectionProperties(doc, headerMap, footerMap);

      expect(result.headers?.even).toBe(headerMap.get("rId3")!);
      expect(result.footers?.even).toBe(footerMap.get("rId6")!);
    });

    it("should parse multiple header and footer types", () => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="${WORD_NAMESPACE}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <w:body>
            <w:sectPr>
              <w:headerReference w:type="default" r:id="rId1"/>
              <w:headerReference w:type="first" r:id="rId2"/>
              <w:headerReference w:type="even" r:id="rId3"/>
              <w:footerReference w:type="default" r:id="rId4"/>
              <w:footerReference w:type="first" r:id="rId5"/>
              <w:footerReference w:type="even" r:id="rId6"/>
            </w:sectPr>
          </w:body>
        </w:document>`;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, "text/xml");

      const result = parseSectionProperties(doc, headerMap, footerMap);

      expect(result.headers?.default).toBe(headerMap.get("rId1")!);
      expect(result.headers?.first).toBe(headerMap.get("rId2")!);
      expect(result.headers?.even).toBe(headerMap.get("rId3")!);
      expect(result.footers?.default).toBe(footerMap.get("rId4")!);
      expect(result.footers?.first).toBe(footerMap.get("rId5")!);
      expect(result.footers?.even).toBe(footerMap.get("rId6")!);
    });

    it("should handle multiple sections", () => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="${WORD_NAMESPACE}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <w:body>
            <w:p>
              <w:pPr>
                <w:sectPr>
                  <w:headerReference w:type="default" r:id="rId1"/>
                </w:sectPr>
              </w:pPr>
            </w:p>
            <w:sectPr>
              <w:headerReference w:type="first" r:id="rId2"/>
              <w:footerReference w:type="default" r:id="rId4"/>
            </w:sectPr>
          </w:body>
        </w:document>`;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, "text/xml");

      const result = parseSectionProperties(doc, headerMap, footerMap);

      expect(result.headers?.default).toBe(headerMap.get("rId1")!);
      expect(result.headers?.first).toBe(headerMap.get("rId2")!);
      expect(result.footers?.default).toBe(footerMap.get("rId4")!);
    });

    it("should handle missing header/footer references gracefully", () => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="${WORD_NAMESPACE}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <w:body>
            <w:sectPr>
              <w:headerReference w:type="default" r:id="rIdNonExistent"/>
              <w:footerReference w:type="default" r:id="rIdNonExistent"/>
            </w:sectPr>
          </w:body>
        </w:document>`;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, "text/xml");

      const result = parseSectionProperties(doc, headerMap, footerMap);

      expect(result.headers).toBeUndefined();
      expect(result.footers).toBeUndefined();
    });

    it("should handle missing r:id attributes", () => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="${WORD_NAMESPACE}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <w:body>
            <w:sectPr>
              <w:headerReference w:type="default"/>
              <w:footerReference w:type="default"/>
            </w:sectPr>
          </w:body>
        </w:document>`;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, "text/xml");

      const result = parseSectionProperties(doc, headerMap, footerMap);

      expect(result.headers).toBeUndefined();
      expect(result.footers).toBeUndefined();
    });

    it("should handle empty section properties", () => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="${WORD_NAMESPACE}">
          <w:body>
            <w:sectPr>
            </w:sectPr>
          </w:body>
        </w:document>`;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, "text/xml");

      const result = parseSectionProperties(doc, headerMap, footerMap);

      expect(result.headers).toBeUndefined();
      expect(result.footers).toBeUndefined();
    });

    it("should handle document without section properties", () => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="${WORD_NAMESPACE}">
          <w:body>
            <w:p>
              <w:r>
                <w:t>Content without sections</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, "text/xml");

      const result = parseSectionProperties(doc, headerMap, footerMap);

      expect(result.headers).toBeUndefined();
      expect(result.footers).toBeUndefined();
    });

    it("should handle null sectPr elements", () => {
      // This test simulates the case where sectPrElements[i] could be null
      const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="${WORD_NAMESPACE}">
          <w:body>
          </w:body>
        </w:document>`;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, "text/xml");

      const result = parseSectionProperties(doc, headerMap, footerMap);

      expect(result.headers).toBeUndefined();
      expect(result.footers).toBeUndefined();
    });
  });

  describe("getHeaderForPage", () => {
    it("should return first page header for page 1", () => {
      const mockHeaders: HeaderFooterInfo = {
        default: headerMap.get("rId1")!,
        first: headerMap.get("rId2")!,
        even: headerMap.get("rId3")!,
      };

      const result = getHeaderForPage(1, mockHeaders);
      expect(result).toBe(headerMap.get("rId2")!);
    });

    it("should return even page header for even pages", () => {
      const mockHeaders: HeaderFooterInfo = {
        default: headerMap.get("rId1")!,
        first: headerMap.get("rId2")!,
        even: headerMap.get("rId3")!,
      };

      const result = getHeaderForPage(2, mockHeaders);
      expect(result).toBe(headerMap.get("rId3")!);
    });

    it("should return default header for odd pages (except first)", () => {
      const mockHeaders: HeaderFooterInfo = {
        default: headerMap.get("rId1")!,
        first: headerMap.get("rId2")!,
        even: headerMap.get("rId3")!,
      };

      const result = getHeaderForPage(3, mockHeaders);
      expect(result).toBe(headerMap.get("rId1")!);
    });

    it("should return default header when no first page header is defined", () => {
      const headersWithoutFirst: HeaderFooterInfo = {
        default: headerMap.get("rId1")!,
        even: headerMap.get("rId3")!,
      };

      const result = getHeaderForPage(1, headersWithoutFirst);
      expect(result).toBe(headerMap.get("rId1")!);
    });

    it("should return default header when no even page header is defined", () => {
      const headersWithoutEven: HeaderFooterInfo = {
        default: headerMap.get("rId1")!,
        first: headerMap.get("rId2")!,
      };

      const result = getHeaderForPage(2, headersWithoutEven);
      expect(result).toBe(headerMap.get("rId1")!);
    });

    it("should return undefined when no headers are defined", () => {
      const result = getHeaderForPage(1, {});
      expect(result).toBeUndefined();
    });

    it("should check odd header property", () => {
      const headersWithOdd: HeaderFooterInfo = {
        default: headerMap.get("rId1")!,
        odd: headerMap.get("rId2")!,
      };

      const result = getHeaderForPage(3, headersWithOdd);
      expect(result).toBe(headerMap.get("rId2")!);
    });
  });

  describe("getFooterForPage", () => {
    it("should return first page footer for page 1", () => {
      const mockFooters: HeaderFooterInfo = {
        default: footerMap.get("rId4")!,
        first: footerMap.get("rId5")!,
        even: footerMap.get("rId6")!,
      };

      const result = getFooterForPage(1, mockFooters);
      expect(result).toBe(footerMap.get("rId5")!);
    });

    it("should return even page footer for even pages", () => {
      const mockFooters: HeaderFooterInfo = {
        default: footerMap.get("rId4")!,
        first: footerMap.get("rId5")!,
        even: footerMap.get("rId6")!,
      };

      const result = getFooterForPage(2, mockFooters);
      expect(result).toBe(footerMap.get("rId6")!);
    });

    it("should return default footer for odd pages (except first)", () => {
      const mockFooters: HeaderFooterInfo = {
        default: footerMap.get("rId4")!,
        first: footerMap.get("rId5")!,
        even: footerMap.get("rId6")!,
      };

      const result = getFooterForPage(3, mockFooters);
      expect(result).toBe(footerMap.get("rId4")!);
    });

    it("should return default footer when no first page footer is defined", () => {
      const footersWithoutFirst: HeaderFooterInfo = {
        default: footerMap.get("rId4")!,
        even: footerMap.get("rId6")!,
      };

      const result = getFooterForPage(1, footersWithoutFirst);
      expect(result).toBe(footerMap.get("rId4")!);
    });

    it("should return default footer when no even page footer is defined", () => {
      const footersWithoutEven: HeaderFooterInfo = {
        default: footerMap.get("rId4")!,
        first: footerMap.get("rId5")!,
      };

      const result = getFooterForPage(2, footersWithoutEven);
      expect(result).toBe(footerMap.get("rId4")!);
    });

    it("should return undefined when no footers are defined", () => {
      const result = getFooterForPage(1, {});
      expect(result).toBeUndefined();
    });

    it("should check odd footer property", () => {
      const footersWithOdd: HeaderFooterInfo = {
        default: footerMap.get("rId4")!,
        odd: footerMap.get("rId5")!,
      };

      const result = getFooterForPage(3, footersWithOdd);
      expect(result).toBe(footerMap.get("rId5")!);
    });
  });
});
