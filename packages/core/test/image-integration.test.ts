import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import { parseDocumentXmlWithDom } from "../src/formats/docx/dom-parser";

describe("Image Integration Tests", () => {
  test("should handle document XML with image drawing elements", async () => {
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Text before image: </w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:drawing>
          <wp:inline distT="0" distB="0" distL="0" distR="0">
            <wp:extent cx="3245610" cy="2247253"/>
            <wp:docPr id="1" name="Picture 1" descr="A sample image"/>
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
        <w:t>Text after image.</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

    const relationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png" TargetMode="Internal"/>
</Relationships>`;

    const result = await Effect.runPromise(parseDocumentXmlWithDom(documentXml, relationshipsXml));

    expect(result).toHaveLength(3);

    // First paragraph: text only
    expect(result[0]?.runs).toHaveLength(1);
    expect(result[0]?.runs[0]?.text).toBe("Text before image: ");
    expect(result[0]?.runs[0]?.image).toBeUndefined();

    // Second paragraph: image
    expect(result[1]?.runs).toHaveLength(1);
    expect(result[1]?.runs[0]?.text).toBe("");
    expect(result[1]?.runs[0]?.image).toEqual({
      relationshipId: "rId1",
      width: 3245610,
      height: 2247253,
      title: "Picture 1",
      description: "A sample image",
      filePath: "media/image1.png",
    });

    // Third paragraph: text only
    expect(result[2]?.runs).toHaveLength(1);
    expect(result[2]?.runs[0]?.text).toBe("Text after image.");
    expect(result[2]?.runs[0]?.image).toBeUndefined();
  });

  test("should handle paragraph with mixed text and image content", async () => {
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Check this image: </w:t>
      </w:r>
      <w:r>
        <w:drawing>
          <wp:inline>
            <wp:extent cx="1000000" cy="1000000"/>
            <wp:docPr id="2" name="Inline Image"/>
            <a:graphic>
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic>
                  <pic:blipFill>
                    <a:blip r:embed="rId2"/>
                  </pic:blipFill>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
      <w:r>
        <w:t> and more text after.</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

    const relationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/diagram.jpg"/>
</Relationships>`;

    const result = await Effect.runPromise(parseDocumentXmlWithDom(documentXml, relationshipsXml));

    expect(result).toHaveLength(1);
    expect(result[0]?.runs).toHaveLength(3);

    // First run: text
    expect(result[0]?.runs[0]?.text).toBe("Check this image: ");
    expect(result[0]?.runs[0]?.image).toBeUndefined();

    // Second run: image
    expect(result[0]?.runs[1]?.text).toBe("");
    expect(result[0]?.runs[1]?.image?.relationshipId).toBe("rId2");
    expect(result[0]?.runs[1]?.image?.filePath).toBe("media/diagram.jpg");

    // Third run: text
    expect(result[0]?.runs[2]?.text).toBe(" and more text after.");
    expect(result[0]?.runs[2]?.image).toBeUndefined();
  });

  test("should handle document without images correctly", async () => {
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Just plain text without any images.</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

    const result = await Effect.runPromise(parseDocumentXmlWithDom(documentXml));

    expect(result).toHaveLength(1);
    expect(result[0]?.runs).toHaveLength(1);
    expect(result[0]?.runs[0]?.text).toBe("Just plain text without any images.");
    expect(result[0]?.runs[0]?.image).toBeUndefined();
  });

  test("should handle drawing elements without relationship resolution", async () => {
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
  <w:body>
    <w:p>
      <w:r>
        <w:drawing>
          <wp:inline>
            <wp:extent cx="2000000" cy="1500000"/>
            <wp:docPr id="3" name="Unknown Image"/>
            <a:graphic>
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic>
                  <pic:blipFill>
                    <a:blip r:embed="rId999"/>
                  </pic:blipFill>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

    // No relationships XML provided
    const result = await Effect.runPromise(parseDocumentXmlWithDom(documentXml));

    expect(result).toHaveLength(1);
    expect(result[0]?.runs).toHaveLength(1);
    expect(result[0]?.runs[0]?.text).toBe("");
    expect(result[0]?.runs[0]?.image).toEqual({
      relationshipId: "rId999",
      width: 2000000,
      height: 1500000,
      title: "Unknown Image",
      description: undefined,
      filePath: undefined,
    });
  });
});
