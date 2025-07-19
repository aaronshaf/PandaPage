import { describe, test, expect } from "bun:test";
import { parseFootnotes, parseEndnotes } from "./footnote-parser";

describe("Notes Parser", () => {
  describe("parseFootnotes", () => {
    test("should parse simple footnote", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:footnote w:id="1">
            <w:p>
              <w:r>
                <w:t>This is a footnote text.</w:t>
              </w:r>
            </w:p>
          </w:footnote>
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);
      expect(footnotes).toHaveLength(1);
      expect(footnotes[0].id).toBe("1");
      expect(footnotes[0].type).toBe("footnote");
      expect(footnotes[0].elements).toHaveLength(1);
      expect(footnotes[0].elements[0].type).toBe("paragraph");
      expect((footnotes[0].elements[0] as any).runs[0].text).toBe("This is a footnote text.");
    });

    test("should skip separator footnotes", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:footnote w:type="separator" w:id="0">
            <w:p><w:r><w:separator/></w:r></w:p>
          </w:footnote>
          <w:footnote w:type="continuationSeparator" w:id="1">
            <w:p><w:r><w:continuationSeparator/></w:r></w:p>
          </w:footnote>
          <w:footnote w:id="2">
            <w:p>
              <w:r>
                <w:t>Real footnote content.</w:t>
              </w:r>
            </w:p>
          </w:footnote>
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);
      expect(footnotes).toHaveLength(1);
      expect(footnotes[0].id).toBe("2");
      expect((footnotes[0].elements[0] as any).runs[0].text).toBe("Real footnote content.");
    });

    test("should parse footnote with multiple paragraphs", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:footnote w:id="1">
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
      expect((footnotes[0].elements[0] as any).runs[0].text).toBe("First paragraph of footnote.");
      expect((footnotes[0].elements[1] as any).runs[0].text).toBe("Second paragraph of footnote.");
    });

    test("should handle empty footnotes XML", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        </w:footnotes>`;

      const footnotes = parseFootnotes(xml);
      expect(footnotes).toHaveLength(0);
    });
  });

  describe("parseEndnotes", () => {
    test("should parse simple endnote", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:endnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:endnote w:id="1">
            <w:p>
              <w:r>
                <w:t>This is an endnote text.</w:t>
              </w:r>
            </w:p>
          </w:endnote>
        </w:endnotes>`;

      const endnotes = parseEndnotes(xml);
      expect(endnotes).toHaveLength(1);
      expect(endnotes[0].id).toBe("1");
      expect(endnotes[0].type).toBe("endnote");
      expect(endnotes[0].elements).toHaveLength(1);
      expect(endnotes[0].elements[0].type).toBe("paragraph");
      expect((endnotes[0].elements[0] as any).runs[0].text).toBe("This is an endnote text.");
    });

    test("should skip separator endnotes", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:endnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:endnote w:type="separator" w:id="0">
            <w:p><w:r><w:separator/></w:r></w:p>
          </w:endnote>
          <w:endnote w:type="continuationSeparator" w:id="1">
            <w:p><w:r><w:continuationSeparator/></w:r></w:p>
          </w:endnote>
          <w:endnote w:id="2">
            <w:p>
              <w:r>
                <w:t>Real endnote content.</w:t>
              </w:r>
            </w:p>
          </w:endnote>
        </w:endnotes>`;

      const endnotes = parseEndnotes(xml);
      expect(endnotes).toHaveLength(1);
      expect(endnotes[0].id).toBe("2");
      expect((endnotes[0].elements[0] as any).runs[0].text).toBe("Real endnote content.");
    });

    test("should parse endnote with formatting", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:endnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:endnote w:id="1">
            <w:p>
              <w:r>
                <w:rPr>
                  <w:b/>
                  <w:i/>
                </w:rPr>
                <w:t>Bold and italic endnote text.</w:t>
              </w:r>
            </w:p>
          </w:endnote>
        </w:endnotes>`;

      const endnotes = parseEndnotes(xml);
      expect(endnotes).toHaveLength(1);
      const run = (endnotes[0].elements[0] as any).runs[0];
      expect(run.text).toBe("Bold and italic endnote text.");
      expect(run.bold).toBe(true);
      expect(run.italic).toBe(true);
    });
  });
});