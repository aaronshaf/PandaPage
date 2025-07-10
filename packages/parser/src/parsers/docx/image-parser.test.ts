import { test, expect } from "bun:test";
import { parseDrawing, createImageElement, getMimeType } from "./image-parser";

// Use DOMParser from environment or import it
const getDOMParser = async () => {
  if (typeof DOMParser !== "undefined") {
    return DOMParser;
  }
  const { DOMParser: XMLDOMParser } = await import("@xmldom/xmldom");
  return XMLDOMParser;
};

test("parseDrawing extracts relationship ID from blip element", async () => {
  const drawingXml = `
    <w:drawing xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
               xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
               xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
               xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
      <wp:inline>
        <wp:extent cx="1905000" cy="1270000"/>
        <wp:docPr id="1" name="Picture 1" descr="Test image description"/>
        <a:graphic>
          <a:graphicData>
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:blipFill>
                <a:blip r:embed="rId4"/>
              </pic:blipFill>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  `;

  const Parser = await getDOMParser();
  const parser = new Parser();
  const doc = parser.parseFromString(drawingXml, "text/xml");
  const drawingElement = doc.documentElement;

  if (!drawingElement) {
    throw new Error("Failed to parse drawing XML");
  }

  const result = parseDrawing(drawingElement as any);

  expect(result).toBeTruthy();
  expect(result?.relationshipId).toBe("rId4");
  expect(result?.name).toBe("Picture 1");
  expect(result?.description).toBe("Test image description");
  // 1905000 / 9525 = 200
  expect(result?.width).toBe(200);
  // 1270000 / 9525 = 133
  expect(result?.height).toBe(133);
});

test("parseDrawing returns null for drawing without blip", async () => {
  const drawingXml = `
    <w:drawing xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
        <wp:extent cx="1905000" cy="1270000"/>
        <wp:docPr id="1" name="Picture 1"/>
      </wp:inline>
    </w:drawing>
  `;

  const Parser = await getDOMParser();
  const parser = new Parser();
  const doc = parser.parseFromString(drawingXml, "text/xml");
  const drawingElement = doc.documentElement;

  if (!drawingElement) {
    throw new Error("Failed to parse drawing XML");
  }

  const result = parseDrawing(drawingElement as any);

  expect(result).toBeNull();
});

test("parseDrawing handles missing dimensions", async () => {
  const drawingXml = `
    <w:drawing xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
               xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
               xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
      <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
        <wp:docPr id="1" name="Picture 1"/>
        <a:graphic>
          <a:graphicData>
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:blipFill>
                <a:blip r:embed="rId4"/>
              </pic:blipFill>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  `;

  const Parser = await getDOMParser();
  const parser = new Parser();
  const doc = parser.parseFromString(drawingXml, "text/xml");
  const drawingElement = doc.documentElement;

  if (!drawingElement) {
    throw new Error("Failed to parse drawing XML");
  }

  const result = parseDrawing(drawingElement as any);

  expect(result).toBeTruthy();
  expect(result?.relationshipId).toBe("rId4");
  expect(result?.width).toBeUndefined();
  expect(result?.height).toBeUndefined();
});

test("createImageElement creates Image with correct properties", () => {
  const drawingInfo = {
    relationshipId: "rId4",
    name: "Test Image",
    description: "A test image",
    width: 200,
    height: 150,
  };

  const imageData = {
    data: new ArrayBuffer(10),
    mimeType: "image/png",
  };

  const image = createImageElement(drawingInfo, imageData);

  expect(image.type).toBe("image");
  expect(image.data).toBe(imageData.data);
  expect(image.mimeType).toBe("image/png");
  expect(image.width).toBe(200);
  expect(image.height).toBe(150);
  expect(image.alt).toBe("A test image");
});

test("createImageElement uses name as alt when description is missing", () => {
  const drawingInfo = {
    relationshipId: "rId4",
    name: "Test Image",
    width: 200,
    height: 150,
  };

  const imageData = {
    data: new ArrayBuffer(10),
    mimeType: "image/png",
  };

  const image = createImageElement(drawingInfo, imageData);

  expect(image.alt).toBe("Test Image");
});

test("createImageElement uses default alt when both name and description are missing", () => {
  const drawingInfo = {
    relationshipId: "rId4",
  };

  const imageData = {
    data: new ArrayBuffer(10),
    mimeType: "image/png",
  };

  const image = createImageElement(drawingInfo, imageData);

  expect(image.alt).toBe("Image");
});

test("getMimeType returns correct MIME types", () => {
  expect(getMimeType("png")).toBe("image/png");
  expect(getMimeType("jpg")).toBe("image/jpeg");
  expect(getMimeType("jpeg")).toBe("image/jpeg");
  expect(getMimeType("gif")).toBe("image/gif");
  expect(getMimeType("bmp")).toBe("image/bmp");
  expect(getMimeType("tiff")).toBe("image/tiff");
  expect(getMimeType("tif")).toBe("image/tiff");
  expect(getMimeType("svg")).toBe("image/svg+xml");
  expect(getMimeType("webp")).toBe("image/webp");
});

test("getMimeType returns default for unknown extensions", () => {
  expect(getMimeType("unknown")).toBe("image/png");
  expect(getMimeType()).toBe("image/png");
  expect(getMimeType("")).toBe("image/png");
});
