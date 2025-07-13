import { describe, it, expect } from "bun:test";
import "../../test-setup";
import { parseHeaderFooter } from "./header-footer-parser";
import { WORD_NAMESPACE } from "./types";

describe("Header Footer Parser", () => {
  describe("parseHeaderFooter", () => {
    it("should parse header with paragraph", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:hdr xmlns:w="${WORD_NAMESPACE}">
          <w:p>
            <w:r>
              <w:t>Header text</w:t>
            </w:r>
          </w:p>
        </w:hdr>`;

      const result = parseHeaderFooter(xml, "header");

      expect(result).not.toBeNull();
      expect(result?.type).toBe("header");
      expect(result?.elements).toHaveLength(1);
      expect(result?.elements[0].type).toBe("paragraph");
    });

    it("should parse footer with paragraph", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:ftr xmlns:w="${WORD_NAMESPACE}">
          <w:p>
            <w:r>
              <w:t>Footer text</w:t>
            </w:r>
          </w:p>
        </w:ftr>`;

      const result = parseHeaderFooter(xml, "footer");

      expect(result).not.toBeNull();
      expect(result?.type).toBe("footer");
      expect(result?.elements).toHaveLength(1);
      expect(result?.elements[0].type).toBe("paragraph");
    });

    it("should parse header with multiple paragraphs", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:hdr xmlns:w="${WORD_NAMESPACE}">
          <w:p>
            <w:r>
              <w:t>First paragraph</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:r>
              <w:t>Second paragraph</w:t>
            </w:r>
          </w:p>
        </w:hdr>`;

      const result = parseHeaderFooter(xml, "header");

      expect(result).not.toBeNull();
      expect(result?.elements).toHaveLength(2);
      expect(result?.elements[0].type).toBe("paragraph");
      expect(result?.elements[1].type).toBe("paragraph");
    });

    it("should parse header with table", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:hdr xmlns:w="${WORD_NAMESPACE}">
          <w:tbl>
            <w:tr>
              <w:tc>
                <w:p>
                  <w:r>
                    <w:t>Table cell</w:t>
                  </w:r>
                </w:p>
              </w:tc>
            </w:tr>
          </w:tbl>
        </w:hdr>`;

      const result = parseHeaderFooter(xml, "header");

      expect(result).not.toBeNull();
      expect(result?.elements).toHaveLength(1);
      expect(result?.elements[0].type).toBe("table");
    });

    it("should parse header with mixed content", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:hdr xmlns:w="${WORD_NAMESPACE}">
          <w:p>
            <w:r>
              <w:t>Header paragraph</w:t>
            </w:r>
          </w:p>
          <w:tbl>
            <w:tr>
              <w:tc>
                <w:p>
                  <w:r>
                    <w:t>Table in header</w:t>
                  </w:r>
                </w:p>
              </w:tc>
            </w:tr>
          </w:tbl>
        </w:hdr>`;

      const result = parseHeaderFooter(xml, "header");

      expect(result).not.toBeNull();
      expect(result?.elements).toHaveLength(2);
      expect(result?.elements[0].type).toBe("paragraph");
      expect(result?.elements[1].type).toBe("table");
    });

    it("should handle empty header", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:hdr xmlns:w="${WORD_NAMESPACE}">
        </w:hdr>`;

      const result = parseHeaderFooter(xml, "header");

      expect(result).not.toBeNull();
      expect(result?.type).toBe("header");
      expect(result?.elements).toHaveLength(0);
    });

    it("should handle empty footer", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:ftr xmlns:w="${WORD_NAMESPACE}">
        </w:ftr>`;

      const result = parseHeaderFooter(xml, "footer");

      expect(result).toBeNull(); // Footer returns null for empty content
    });

    it("should handle header with empty paragraphs", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:hdr xmlns:w="${WORD_NAMESPACE}">
          <w:p>
          </w:p>
        </w:hdr>`;

      const result = parseHeaderFooter(xml, "header");

      expect(result).not.toBeNull();
      expect(result?.type).toBe("header");
      expect(result?.elements).toHaveLength(0); // Empty paragraphs don't get added
    });

    it("should handle non-namespaced elements", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <hdr>
          <p>
            <r>
              <t>Non-namespaced content</t>
            </r>
          </p>
          <tbl>
            <tr>
              <tc>
                <p>
                  <r>
                    <t>Table content</t>
                  </r>
                </p>
              </tc>
            </tr>
          </tbl>
        </hdr>`;

      const result = parseHeaderFooter(xml, "header");

      expect(result).not.toBeNull();
      expect(result?.elements).toHaveLength(2);
      expect(result?.elements[0].type).toBe("paragraph");
      expect(result?.elements[1].type).toBe("table");
    });

    it("should ignore non-element nodes", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:hdr xmlns:w="${WORD_NAMESPACE}">
          <!-- This is a comment -->
          <w:p>
            <w:r>
              <w:t>Valid paragraph</w:t>
            </w:r>
          </w:p>
          <!-- Another comment -->
        </w:hdr>`;

      const result = parseHeaderFooter(xml, "header");

      expect(result).not.toBeNull();
      expect(result?.elements).toHaveLength(1);
      expect(result?.elements[0].type).toBe("paragraph");
    });

    it("should handle formatting in header", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:hdr xmlns:w="${WORD_NAMESPACE}">
          <w:p>
            <w:r>
              <w:rPr>
                <w:b/>
                <w:i/>
              </w:rPr>
              <w:t>Bold and italic header</w:t>
            </w:r>
          </w:p>
        </w:hdr>`;

      const result = parseHeaderFooter(xml, "header");

      expect(result).not.toBeNull();
      expect(result?.elements).toHaveLength(1);
      expect(result?.elements[0].type).toBe("paragraph");
    });

    it("should handle unknown elements gracefully", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:hdr xmlns:w="${WORD_NAMESPACE}">
          <w:p>
            <w:r>
              <w:t>Valid paragraph</w:t>
            </w:r>
          </w:p>
          <w:unknownElement>
            <w:someChild/>
          </w:unknownElement>
          <w:p>
            <w:r>
              <w:t>Another valid paragraph</w:t>
            </w:r>
          </w:p>
        </w:hdr>`;

      const result = parseHeaderFooter(xml, "header");

      expect(result).not.toBeNull();
      expect(result?.elements).toHaveLength(2); // Only valid paragraphs are included
      expect(result?.elements[0].type).toBe("paragraph");
      expect(result?.elements[1].type).toBe("paragraph");
    });
  });
});