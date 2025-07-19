import { describe, test, expect } from "bun:test";
import { parseDocxDocument } from "./index";
import JSZip from "jszip";

async function createDocxWithFootnotesAndEndnotes(): Promise<ArrayBuffer> {
  const zip = new JSZip();

  // Add document.xml with footnote and endnote references
  const documentXml = `<?xml version="1.0" encoding="UTF-8"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        <w:p>
          <w:r>
            <w:t>This is a paragraph with a footnote</w:t>
          </w:r>
          <w:r>
            <w:footnoteReference w:id="1"/>
          </w:r>
          <w:r>
            <w:t> and an endnote</w:t>
          </w:r>
          <w:r>
            <w:endnoteReference w:id="1"/>
          </w:r>
          <w:r>
            <w:t> reference.</w:t>
          </w:r>
        </w:p>
      </w:body>
    </w:document>`;

  // Add footnotes.xml
  const footnotesXml = `<?xml version="1.0" encoding="UTF-8"?>
    <w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:footnote w:type="separator" w:id="0">
        <w:p><w:r><w:separator/></w:r></w:p>
      </w:footnote>
      <w:footnote w:id="1">
        <w:p>
          <w:r>
            <w:t>This is the footnote content.</w:t>
          </w:r>
        </w:p>
      </w:footnote>
    </w:footnotes>`;

  // Add endnotes.xml
  const endnotesXml = `<?xml version="1.0" encoding="UTF-8"?>
    <w:endnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:endnote w:type="separator" w:id="0">
        <w:p><w:r><w:separator/></w:r></w:p>
      </w:endnote>
      <w:endnote w:id="1">
        <w:p>
          <w:r>
            <w:t>This is the endnote content.</w:t>
          </w:r>
        </w:p>
      </w:endnote>
    </w:endnotes>`;

  // Add relationships
  const relsXml = `<?xml version="1.0" encoding="UTF-8"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    </Relationships>`;

  zip.file("word/document.xml", documentXml);
  zip.file("word/footnotes.xml", footnotesXml);
  zip.file("word/endnotes.xml", endnotesXml);
  zip.file("word/_rels/document.xml.rels", relsXml);

  return await zip.generateAsync({ type: "arraybuffer" });
}

describe("Notes Integration", () => {
  test("should parse document with footnotes and endnotes", async () => {
    const buffer = await createDocxWithFootnotesAndEndnotes();
    const document = await parseDocxDocument(buffer);

    // Check main content
    expect(document.elements).toHaveLength(3); // 1 paragraph + 1 footnote + 1 endnote

    // Check paragraph with references
    const paragraph = document.elements[0];
    expect(paragraph.type).toBe("paragraph");
    if (paragraph.type === "paragraph") {
      expect(paragraph.runs).toHaveLength(5);

      // Check footnote reference
      expect(paragraph.runs[1]._footnoteRef).toBe("1");
      expect(paragraph.runs[1].superscript).toBe(true);
      expect(paragraph.runs[1].text).toBe("1");

      // Check endnote reference
      expect(paragraph.runs[3]._endnoteRef).toBe("1");
      expect(paragraph.runs[3].superscript).toBe(true);
      expect(paragraph.runs[3].text).toBe("1");
    }

    // Check footnote content
    const footnote = document.elements[1];
    expect(footnote.type).toBe("footnote");
    if (footnote.type === "footnote") {
      expect(footnote.id).toBe("1");
      expect(footnote.elements).toHaveLength(1);
      expect(footnote.elements[0].type).toBe("paragraph");
      if (footnote.elements[0].type === "paragraph") {
        expect(footnote.elements[0].runs[0].text).toBe("This is the footnote content.");
      }
    }

    // Check endnote content
    const endnote = document.elements[2];
    expect(endnote.type).toBe("endnote");
    if (endnote.type === "endnote") {
      expect(endnote.id).toBe("1");
      expect(endnote.elements).toHaveLength(1);
      expect(endnote.elements[0].type).toBe("paragraph");
      if (endnote.elements[0].type === "paragraph") {
        expect(endnote.elements[0].runs[0].text).toBe("This is the endnote content.");
      }
    }

    // Check footnotes and endnotes maps
    expect(document.footnotes).toBeDefined();
    expect(document.endnotes).toBeDefined();

    if (document.footnotes) {
      expect(document.footnotes.size).toBe(1);
      expect(document.footnotes.has("1")).toBe(true);
      const footnoteFromMap = document.footnotes.get("1");
      expect(footnoteFromMap?.id).toBe("1");
    }

    if (document.endnotes) {
      expect(document.endnotes.size).toBe(1);
      expect(document.endnotes.has("1")).toBe(true);
      const endnoteFromMap = document.endnotes.get("1");
      expect(endnoteFromMap?.id).toBe("1");
    }
  });

  test("should handle document without footnotes or endnotes", async () => {
    const zip = new JSZip();

    const documentXml = `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:r>
              <w:t>Simple paragraph without notes.</w:t>
            </w:r>
          </w:p>
        </w:body>
      </w:document>`;

    zip.file("word/document.xml", documentXml);

    const buffer = await zip.generateAsync({ type: "arraybuffer" });
    const document = await parseDocxDocument(buffer);

    expect(document.elements).toHaveLength(1);
    expect(document.footnotes?.size).toBe(0);
    expect(document.endnotes?.size).toBe(0);
  });
});
