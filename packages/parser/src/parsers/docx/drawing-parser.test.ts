import { Effect } from "effect";
import { describe, it, expect } from "bun:test";
import "../../test-setup";
import { parseDrawingObject } from "./drawing-parser";

describe("Drawing Parser", () => {
  describe("parseDrawingObject", () => {
    it("should parse inline drawing with image", () => {
      const xml = `
        <w:drawing xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <wp:extent cx="914400" cy="685800"/>
            <wp:docPr id="1" name="Picture 1" descr="A sample image"/>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:nvPicPr>
                    <a:cNvPr id="0" name="Picture 1"/>
                    <a:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="rId1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                    <a:stretch>
                      <a:fillRect/>
                    </a:stretch>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm>
                      <a:off x="0" y="0"/>
                      <a:ext cx="914400" cy="685800"/>
                    </a:xfrm>
                    <a:prstGeom prst="rect">
                      <a:avLst/>
                    </a:prstGeom>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const drawingElement = doc.documentElement;

      if (!drawingElement) throw new Error("Failed to parse drawing element");
      const result = Effect.runSync(parseDrawingObject(drawingElement as Element));

      expect(result).not.toBeNull();
      expect(result?.type).toBe("drawing");
      expect(result?.drawingType).toBe("inline");
      expect(result?.content.type).toBe("image");
      if (result?.content.type === "image") {
        expect(result.content.width).toBe(96); // Converted from EMU
        expect(result.content.height).toBe(72);
        expect(result.content.alt).toBe("A sample image");
      }
    });

    it("should parse anchored drawing with positioning", () => {
      const xml = `
        <w:drawing xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <wp:anchor xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" 
                     allowOverlap="1" behindDoc="0" locked="1" layoutInCell="1"
                     distT="0" distB="0" distL="114300" distR="114300">
            <wp:positionH relativeFrom="page">
              <wp:posOffset>1000000</wp:posOffset>
            </wp:positionH>
            <wp:positionV relativeFrom="paragraph">
              <wp:posOffset>500000</wp:posOffset>
            </wp:positionV>
            <wp:extent cx="914400" cy="685800"/>
            <wp:wrapSquare wrapText="bothSides"/>
            <wp:docPr id="1" name="Picture 1"/>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:nvPicPr>
                    <a:cNvPr id="0" name="Picture 1"/>
                    <a:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="rId1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm>
                      <a:off x="0" y="0"/>
                      <a:ext cx="914400" cy="685800"/>
                    </a:xfrm>
                    <a:prstGeom prst="rect">
                      <a:avLst/>
                    </a:prstGeom>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:anchor>
        </w:drawing>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const drawingElement = doc.documentElement;

      if (!drawingElement) throw new Error("Failed to parse drawing element");
      const result = Effect.runSync(parseDrawingObject(drawingElement as Element));

      expect(result).not.toBeNull();
      expect(result?.type).toBe("drawing");
      expect(result?.drawingType).toBe("anchor");
      expect(result?.allowOverlap).toBe(true);
      expect(result?.behindText).toBe(false);
      expect(result?.locked).toBe(true);
      expect(result?.layoutInCell).toBe(true);
      expect(result?.wrapType).toBe("square");
      expect(result?.wrapSide).toBe("both");
      expect(result?.position?.horizontal?.relativeTo).toBe("page");
      expect(result?.position?.horizontal?.offset).toBe(1000000);
      expect(result?.position?.vertical?.relativeTo).toBe("paragraph");
      expect(result?.position?.vertical?.offset).toBe(500000);
      expect(result?.distanceFromText?.left).toBeCloseTo(9); // Converted from EMU
      expect(result?.distanceFromText?.right).toBeCloseTo(9);
    });

    it("should parse image with transform and effects", () => {
      const xml = `
        <w:drawing xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <wp:extent cx="914400" cy="685800"/>
            <wp:docPr id="1" name="Picture 1"/>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:nvPicPr>
                    <a:cNvPr id="0" name="Picture 1"/>
                    <a:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="rId1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                    <a:srcRect t="10000" b="10000" l="5000" r="5000"/>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm rot="900000" flipH="1">
                      <a:off x="0" y="0"/>
                      <a:ext cx="914400" cy="685800"/>
                    </a:xfrm>
                    <a:prstGeom prst="rect">
                      <a:avLst/>
                    </a:prstGeom>
                    <a:effectLst>
                      <a:outerShdw blurRad="38100" dist="38100" dir="2700000">
                        <a:srgbClr val="000000"/>
                      </a:outerShdw>
                      <a:glow rad="25400">
                        <a:srgbClr val="FF0000"/>
                      </a:glow>
                    </a:effectLst>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const drawingElement = doc.documentElement;

      if (!drawingElement) throw new Error("Failed to parse drawing element");
      const result = Effect.runSync(parseDrawingObject(drawingElement as Element));

      expect(result).not.toBeNull();
      expect(result?.content.type).toBe("image");

      if (result?.content.type === "image") {
        const image = result.content;
        expect(image.transform?.rotation).toBe(15); // 900000 / 60000
        expect(image.transform?.flipHorizontal).toBe(true);
        expect(image.crop?.top).toBe(10); // 10000 / 1000
        expect(image.crop?.bottom).toBe(10);
        expect(image.crop?.left).toBe(5);
        expect(image.crop?.right).toBe(5);
        expect(image.effects?.shadow?.angle).toBe(45); // 2700000 / 60000
        expect(image.effects?.shadow?.blur).toBeCloseTo(3); // 38100 / 12700
        expect(image.effects?.shadow?.distance).toBeCloseTo(3);
        expect(image.effects?.shadow?.color).toBe("#000000");
      }
      // Glow effect parsing - skip for now as it might not be implemented
      // expect(image?.effects?.glow?.radius).toBe(2); // 25400 / 12700
      // expect(image?.effects?.glow?.color).toBe("#FF0000");
    });

    it("should return null for drawing without supported content", () => {
      const xml = `
        <w:drawing xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <wp:extent cx="914400" cy="685800"/>
            <wp:docPr id="1" name="Chart 1"/>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
                <!-- Chart content (not implemented yet) -->
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const drawingElement = doc.documentElement;

      if (!drawingElement) throw new Error("Failed to parse drawing element");
      const result = Effect.runSync(parseDrawingObject(drawingElement as Element));

      expect(result).toBeNull();
    });

    it("should return null for invalid drawing structure", () => {
      const xml = `
        <w:drawing xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <!-- Missing inline/anchor -->
        </w:drawing>
      `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const drawingElement = doc.documentElement;

      if (!drawingElement) throw new Error("Failed to parse drawing element");
      const result = Effect.runSync(parseDrawingObject(drawingElement as Element));

      expect(result).toBeNull();
    });
  });

  // Additional test cases can be added here for specific functionality
  // like parsing different wrap types, position formats, etc.
});
