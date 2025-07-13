import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import {
  parseImageRelationships,
  parseDrawingElement,
  extractImageFromZip,
  formatImageAsMarkdown,
  emusToPixels,
  type ImageRelationship,
  type DocxImage,
} from "../src/formats/docx/image-parser";

describe("Image Parser", () => {
  describe("parseImageRelationships", () => {
    test("should parse image relationships from relationships XML", async () => {
      const relationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png" TargetMode="Internal"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image2.jpg"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com" TargetMode="External"/>
</Relationships>`;

      const result = await Effect.runPromise(parseImageRelationships(relationshipsXml));

      expect(result.size).toBe(2);
      expect(result.get("rId1")).toEqual({
        id: "rId1",
        target: "media/image1.png",
        targetMode: "Internal",
      });
      expect(result.get("rId2")).toEqual({
        id: "rId2",
        target: "media/image2.jpg",
      });
      expect(result.has("rId3")).toBe(false); // Not an image relationship
    });

    test("should handle empty relationships XML", async () => {
      const relationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

      const result = await Effect.runPromise(parseImageRelationships(relationshipsXml));

      expect(result.size).toBe(0);
    });

    test("should handle malformed relationships XML", async () => {
      const relationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
</Relationships>`;

      const result = await Effect.runPromise(parseImageRelationships(relationshipsXml));

      expect(result.size).toBe(0); // Missing Id attribute
    });
  });

  describe("parseDrawingElement", () => {
    test("should parse drawing element with image", async () => {
      const drawingXml = `<w:drawing xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
    <wp:extent cx="3245610" cy="2247253"/>
    <wp:docPr id="1" name="Picture 1" descr="Test image description"/>
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
</w:drawing>`;

      const imageRelationships = new Map<string, ImageRelationship>([
        ["rId1", { id: "rId1", target: "media/image1.png" }],
      ]);

      const result = await Effect.runPromise(parseDrawingElement(drawingXml, imageRelationships));

      expect(result).toEqual({
        relationshipId: "rId1",
        width: 3245610,
        height: 2247253,
        title: "Picture 1",
        description: "Test image description",
        filePath: "media/image1.png",
      });
    });

    test("should return null for drawing without pictures", async () => {
      const drawingXml = `<w:drawing xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
    <wp:extent cx="3245610" cy="2247253"/>
  </wp:inline>
</w:drawing>`;

      const imageRelationships = new Map<string, ImageRelationship>();

      const result = await Effect.runPromise(parseDrawingElement(drawingXml, imageRelationships));

      expect(result).toBeNull();
    });

    test("should handle missing relationship", async () => {
      const drawingXml = `<w:drawing xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
    <wp:extent cx="3245610" cy="2247253"/>
    <wp:docPr id="1" name="Picture 1"/>
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
</w:drawing>`;

      const imageRelationships = new Map<string, ImageRelationship>();

      const result = await Effect.runPromise(parseDrawingElement(drawingXml, imageRelationships));

      expect(result).toEqual({
        relationshipId: "rId1",
        width: 3245610,
        height: 2247253,
        title: "Picture 1",
        description: undefined,
        filePath: undefined,
      });
    });
  });

  describe("extractImageFromZip", () => {
    test("should extract image from ZIP at correct path", async () => {
      const mockImageData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
      const unzipped = {
        "word/media/image1.png": mockImageData,
      };

      const result = await Effect.runPromise(extractImageFromZip(unzipped, "media/image1.png"));

      expect(result).toBe("iVBORw0KGgo="); // Base64 of PNG header
    });

    test("should try alternative paths for image", async () => {
      const mockImageData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
      const unzipped = {
        "media/image1.png": mockImageData, // Image at root level
      };

      const result = await Effect.runPromise(extractImageFromZip(unzipped, "media/image1.png"));

      expect(result).toBe("iVBORw0KGgo="); // Should find it at alternative path
    });

    test("should fail when image not found", async () => {
      const unzipped = {};

      const result = Effect.runPromise(extractImageFromZip(unzipped, "media/missing.png"));

      await expect(result).rejects.toThrow("Image not found: media/missing.png");
    });
  });

  describe("emusToPixels", () => {
    test("should convert EMUs to pixels correctly", () => {
      expect(emusToPixels(914400)).toBe(96); // 1 inch at 96 DPI
      expect(emusToPixels(457200)).toBe(48); // 0.5 inch at 96 DPI
      expect(emusToPixels(0)).toBe(0);
    });
  });

  describe("formatImageAsMarkdown", () => {
    test("should format image with base64 data", () => {
      const image: DocxImage = {
        relationshipId: "rId1",
        title: "Test Image",
        description: "A test image",
        filePath: "media/image1.png",
        base64Data: "iVBORw0KGgo=",
      };

      const result = formatImageAsMarkdown(image);

      expect(result).toBe("![A test image](data:image/png;base64,iVBORw0KGgo=)");
    });

    test("should format image with file path only", () => {
      const image: DocxImage = {
        relationshipId: "rId1",
        title: "Test Image",
        filePath: "media/image1.jpg",
      };

      const result = formatImageAsMarkdown(image);

      expect(result).toBe("![Test Image](media/image1.jpg)");
    });

    test("should use fallback for image without data or path", () => {
      const image: DocxImage = {
        relationshipId: "rId1",
        title: "Test Image",
      };

      const result = formatImageAsMarkdown(image);

      expect(result).toBe("![Test Image](placeholder-image)");
    });

    test("should detect JPEG MIME type correctly", () => {
      const image: DocxImage = {
        relationshipId: "rId1",
        title: "JPEG Image",
        filePath: "media/image1.jpg",
        base64Data: "/9j/4AAQSkZJRgABAQEA",
      };

      const result = formatImageAsMarkdown(image);

      expect(result).toBe("![JPEG Image](data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA)");
    });
  });
});