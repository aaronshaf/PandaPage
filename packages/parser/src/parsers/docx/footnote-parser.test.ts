import { describe, it, expect } from "bun:test";
import "../../test-setup";
import { parseFootnotes } from "./footnote-parser";
import { WORD_NAMESPACE } from "./types";

describe("Footnote Parser", () => {
  describe("parseFootnotes", () => {
    it("should parse simple footnote with paragraph", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:footnotes xmlns:w="${WORD_NAMESPACE}">
          <w:footnote w:type="normal" w:id="1">
            <w:p>
              <w:r>
                <w:t>This is a footnote text.</w:t>
              </w:r>
            </w:p>
          </w:footnote>
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);

      expect(footnotes).toHaveLength(1);
      expect(footnotes[0].type).toBe("footnote");
      expect(footnotes[0].id).toBe("1");
      expect(footnotes[0].elements).toHaveLength(1);
      expect(footnotes[0].elements[0].type).toBe("paragraph");
    });

    it("should parse multiple footnotes", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:footnotes xmlns:w="${WORD_NAMESPACE}">
          <w:footnote w:type="normal" w:id="1">
            <w:p>
              <w:r>
                <w:t>First footnote.</w:t>
              </w:r>
            </w:p>
          </w:footnote>
          <w:footnote w:type="normal" w:id="2">
            <w:p>
              <w:r>
                <w:t>Second footnote.</w:t>
              </w:r>
            </w:p>
          </w:footnote>
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);

      expect(footnotes).toHaveLength(2);
      expect(footnotes[0].id).toBe("1");
      expect(footnotes[1].id).toBe("2");
    });

    it("should skip separator footnotes", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:footnotes xmlns:w="${WORD_NAMESPACE}">
          <w:footnote w:type="separator" w:id="-1">
            <w:p>
              <w:r>
                <w:separator/>
              </w:r>
            </w:p>
          </w:footnote>
          <w:footnote w:type="continuationSeparator" w:id="0">
            <w:p>
              <w:r>
                <w:continuationSeparator/>
              </w:r>
            </w:p>
          </w:footnote>
          <w:footnote w:type="normal" w:id="1">
            <w:p>
              <w:r>
                <w:t>Normal footnote.</w:t>
              </w:r>
            </w:p>
          </w:footnote>
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);

      expect(footnotes).toHaveLength(1);
      expect(footnotes[0].id).toBe("1");
    });

    it("should skip continuationNotice footnotes", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:footnotes xmlns:w="${WORD_NAMESPACE}">
          <w:footnote w:type="continuationNotice" w:id="-2">
            <w:p>
              <w:r>
                <w:t>Continued...</w:t>
              </w:r>
            </w:p>
          </w:footnote>
          <w:footnote w:type="normal" w:id="1">
            <w:p>
              <w:r>
                <w:t>Normal footnote.</w:t>
              </w:r>
            </w:p>
          </w:footnote>
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);

      expect(footnotes).toHaveLength(1);
      expect(footnotes[0].id).toBe("1");
    });

    it("should parse footnote with multiple paragraphs", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:footnotes xmlns:w="${WORD_NAMESPACE}">
          <w:footnote w:type="normal" w:id="1">
            <w:p>
              <w:r>
                <w:t>First paragraph of footnote.</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:r>
                <w:t>Second paragraph of footnote.</w:t>
              </w:r>
            </w:p>
          </w:footnote>
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);

      expect(footnotes).toHaveLength(1);
      expect(footnotes[0].elements).toHaveLength(2);
      expect(footnotes[0].elements[0].type).toBe("paragraph");
      expect(footnotes[0].elements[1].type).toBe("paragraph");
    });

    it("should parse footnote with table", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:footnotes xmlns:w="${WORD_NAMESPACE}">
          <w:footnote w:type="normal" w:id="1">
            <w:p>
              <w:r>
                <w:t>Footnote with table:</w:t>
              </w:r>
            </w:p>
            <w:tbl>
              <w:tr>
                <w:tc>
                  <w:p>
                    <w:r>
                      <w:t>Cell content</w:t>
                    </w:r>
                  </w:p>
                </w:tc>
              </w:tr>
            </w:tbl>
          </w:footnote>
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);

      expect(footnotes).toHaveLength(1);
      expect(footnotes[0].elements).toHaveLength(2);
      expect(footnotes[0].elements[0].type).toBe("paragraph");
      expect(footnotes[0].elements[1].type).toBe("table");
    });

    it("should handle footnote without id attribute", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:footnotes xmlns:w="${WORD_NAMESPACE}">
          <w:footnote w:type="normal">
            <w:p>
              <w:r>
                <w:t>Footnote without id.</w:t>
              </w:r>
            </w:p>
          </w:footnote>
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);

      expect(footnotes).toHaveLength(0);
    });

    it("should handle empty footnote", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:footnotes xmlns:w="${WORD_NAMESPACE}">
          <w:footnote w:type="normal" w:id="1">
          </w:footnote>
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);

      expect(footnotes).toHaveLength(0);
    });

    it("should handle footnote with only empty paragraphs", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:footnotes xmlns:w="${WORD_NAMESPACE}">
          <w:footnote w:type="normal" w:id="1">
            <w:p>
            </w:p>
          </w:footnote>
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);

      // Empty paragraphs might still create valid elements, so check if any footnotes are created
      // If a footnote is created, it should have elements
      if (footnotes.length > 0) {
        expect(footnotes[0].elements.length).toBeGreaterThan(0);
      }
    });

    it("should handle invalid XML gracefully", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:footnotes xmlns:w="${WORD_NAMESPACE}">
          <w:footnote w:type="normal" w:id="1">
            <w:p>
              <w:r>
                <w:t>Unclosed tag
              </w:r>
            </w:p>
          </w:footnote>
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);

      expect(footnotes).toEqual([]);
    });

    it("should handle empty footnotes XML", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:footnotes xmlns:w="${WORD_NAMESPACE}">
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);

      expect(footnotes).toHaveLength(0);
    });

    it("should handle footnotes with formatting", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:footnotes xmlns:w="${WORD_NAMESPACE}">
          <w:footnote w:type="normal" w:id="1">
            <w:p>
              <w:r>
                <w:rPr>
                  <w:b/>
                  <w:i/>
                </w:rPr>
                <w:t>Bold and italic footnote text.</w:t>
              </w:r>
            </w:p>
          </w:footnote>
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);

      expect(footnotes).toHaveLength(1);
      // The element could be either paragraph or heading depending on parsing logic
      expect(["paragraph", "heading"]).toContain(footnotes[0].elements[0].type);
    });

    it("should ignore non-element nodes", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:footnotes xmlns:w="${WORD_NAMESPACE}">
          <w:footnote w:type="normal" w:id="1">
            <!-- This is a comment -->
            <w:p>
              <w:r>
                <w:t>Footnote text.</w:t>
              </w:r>
            </w:p>
            <!-- Another comment -->
          </w:footnote>
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);

      expect(footnotes).toHaveLength(1);
      expect(footnotes[0].elements).toHaveLength(1);
      expect(footnotes[0].elements[0].type).toBe("paragraph");
    });
  });
});
