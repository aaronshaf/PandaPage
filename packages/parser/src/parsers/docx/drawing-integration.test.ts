import { test, expect } from "bun:test";
import { parseParagraph } from "./paragraph-parser";
import { DOMParser } from "@xmldom/xmldom";
import "../../test-setup";

test("parseParagraph extracts drawing elements", () => {
  const xml = `<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
    xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
    xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <w:r>
      <w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0">
          <wp:extent cx="5486400" cy="3657600"/>
          <wp:docPr id="1" name="Picture 1" descr="Test image"/>
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
  </w:p>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const paragraphElement = doc.documentElement;

  const imageRelationships = new Map([["rId1", { target: "media/image1.png" }]]);

  const paragraph = parseParagraph(
    paragraphElement! as unknown as Element,
    undefined,
    imageRelationships,
    {
      /* mock zip */
    },
  );

  expect(paragraph).not.toBeNull();
  expect(paragraph?.images).toBeDefined();
  expect(paragraph?.images?.length).toBeGreaterThan(0);

  const image = paragraph?.images?.[0];
  expect(image?.type).toBe("image");
  expect(image?.width).toBe(576); // 5486400 EMUs / 9525
  expect(image?.height).toBe(384); // 3657600 EMUs / 9525
  expect(image?.alt).toBe("Test image");
});

test("parseParagraph handles multiple drawings", () => {
  const xml = `<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
    xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
    xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <w:r>
      <w:drawing>
        <wp:inline>
          <wp:extent cx="1905000" cy="1905000"/>
          <wp:docPr id="1" name="Image 1"/>
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
    <w:r>
      <w:drawing>
        <wp:inline>
          <wp:extent cx="2857500" cy="2857500"/>
          <wp:docPr id="2" name="Image 2"/>
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
  </w:p>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const paragraphElement = doc.documentElement;

  const imageRelationships = new Map([
    ["rId1", { target: "media/image1.png" }],
    ["rId2", { target: "media/image2.png" }],
  ]);

  const paragraph = parseParagraph(
    paragraphElement! as unknown as Element,
    undefined,
    imageRelationships,
    {
      /* mock zip */
    },
  );

  expect(paragraph).not.toBeNull();
  expect(paragraph?.images?.length).toBe(2);

  expect(paragraph?.images?.[0]?.width).toBe(200); // 1905000 / 9525
  expect(paragraph?.images?.[0]?.alt).toBe("Image 1");

  expect(paragraph?.images?.[1]?.width).toBe(300); // 2857500 / 9525
  expect(paragraph?.images?.[1]?.alt).toBe("Image 2");
});
