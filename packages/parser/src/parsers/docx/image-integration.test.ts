import { describe, it, expect, beforeAll } from "bun:test";
import { parseDocxDocument } from "./index";
import type { Paragraph } from "../../types/document";
import JSZip from "jszip";

describe("Image Integration Tests", () => {
  let docxWithImage: ArrayBuffer;

  beforeAll(async () => {
    // Create a minimal DOCX with an image
    const zip = new JSZip();

    // Add minimal document.xml with an image reference
    const documentXml = `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
                  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
                  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
                  xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
        <w:body>
          <w:p>
            <w:r>
              <w:t>This is a paragraph with an image:</w:t>
            </w:r>
            <w:r>
              <w:drawing>
                <wp:inline>
                  <wp:extent cx="2438400" cy="1828800"/>
                  <wp:docPr id="1" name="test-image" descr="Test image description"/>
                  <a:graphic>
                    <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                      <pic:pic>
                        <pic:blipFill>
                          <a:blip r:embed="rId1"/>
                        </pic:blipFill>
                      </pic:pic>
                    </a:graphicData>
                  </a:graphic>
                </wp:inline>
              </w:drawing>
            </w:r>
          </w:p>
          <w:p>
            <w:r>
              <w:t>Another paragraph after the image.</w:t>
            </w:r>
          </w:p>
        </w:body>
      </w:document>`;

    // Add relationships
    const relsXml = `<?xml version="1.0" encoding="UTF-8"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
      </Relationships>`;

    // Create a simple 1x1 red PNG image
    const redPixelPng = new Uint8Array([
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a, // PNG header
      0x00,
      0x00,
      0x00,
      0x0d,
      0x49,
      0x48,
      0x44,
      0x52, // IHDR chunk
      0x00,
      0x00,
      0x00,
      0x01,
      0x00,
      0x00,
      0x00,
      0x01,
      0x08,
      0x02,
      0x00,
      0x00,
      0x00,
      0x90,
      0x77,
      0x53,
      0xde,
      0x00,
      0x00,
      0x00,
      0x0c,
      0x49,
      0x44,
      0x41,
      0x54,
      0x08,
      0x99,
      0x63,
      0xf8,
      0xcf,
      0xc0,
      0x00,
      0x00,
      0x03,
      0x01,
      0x01,
      0x00,
      0x18,
      0xdd,
      0x8d,
      0xb4,
      0x00,
      0x00,
      0x00,
      0x00,
      0x49,
      0x45,
      0x4e,
      0x44,
      0xae,
      0x42,
      0x60,
      0x82,
    ]);

    zip.file("word/document.xml", documentXml);
    zip.file("word/_rels/document.xml.rels", relsXml);
    zip.file("word/media/image1.png", redPixelPng);

    docxWithImage = await zip.generateAsync({ type: "arraybuffer" });
  });

  it("should parse document with image in paragraph", async () => {
    const result = await parseDocxDocument(docxWithImage);

    expect(result.elements).toBeDefined();
    expect(result.elements.length).toBeGreaterThan(0);

    // Find the paragraph with the image
    const paragraphWithImage = result.elements.find(
      (el) => el.type === "paragraph" && "images" in el && el.images && el.images.length > 0,
    ) as Paragraph | undefined;

    expect(paragraphWithImage).toBeDefined();
    expect(paragraphWithImage?.type).toBe("paragraph");
    expect(paragraphWithImage?.images).toBeDefined();
    expect(paragraphWithImage?.images?.length).toBe(1);

    const image = paragraphWithImage?.images?.[0];
    expect(image?.type).toBe("image");
    expect(image?.mimeType).toBe("image/png");
    expect(image?.alt).toBe("Test image description");
    expect(image?.width).toBe(256); // 2438400 EMUs / 9525
    expect(image?.height).toBe(192); // 1828800 EMUs / 9525
    expect(image?.data).toBeDefined();
    expect(image?.data.byteLength).toBeGreaterThan(0);
  });

  it("should not have separate image elements", async () => {
    const result = await parseDocxDocument(docxWithImage);

    // Images should be embedded in paragraphs, not as separate elements
    const standaloneImages = result.elements.filter((el) => el.type === "image");
    expect(standaloneImages.length).toBe(0);
  });
});
