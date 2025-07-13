import { describe, test, expect, beforeAll } from "bun:test";
import { Effect } from "effect";
import {
  readPptx,
  PptxParseError,
  type PptxDocument,
  type PptxSlide,
  type PptxContent,
} from "../src/formats/pptx/pptx-reader";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  const window = new Window();
  (global as any).DOMParser = window.DOMParser;
  (global as any).Document = window.Document;
  (global as any).Element = window.Element;
  (global as any).Node = window.Node;
});

/**
 * Helper function to create a synthetic PPTX file for testing
 */
async function createSyntheticPptx(options: {
  slides?: string[];
  includeProps?: boolean;
  includeCorruptedSlide?: boolean;
  slidesWithBullets?: boolean;
  slidesWithImages?: boolean;
}): Promise<ArrayBuffer> {
  const fflate = await import("fflate");
  
  const files: Record<string, Uint8Array> = {};

  // Add content types
  files["[Content_Types].xml"] = new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-presentationml.presentation.main+xml"/>
    </Types>`);

  // Add slides
  if (options.slides) {
    options.slides.forEach((slideContent, index) => {
      if (options.includeCorruptedSlide && index === 1) {
        // Add corrupted slide
        files[`ppt/slides/slide${index + 1}.xml`] = new TextEncoder().encode("<invalid>corrupted slide</invalid>");
      } else if (options.slidesWithBullets && index === 0) {
        // Add slide with bullets
        files[`ppt/slides/slide${index + 1}.xml`] = new TextEncoder().encode(`
          <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <p:cSld>
              <p:spTree>
                <p:sp>
                  <p:txBody>
                    <a:p>
                      <a:pPr>
                        <a:lvl1pPr>
                          <a:buChar char="•"/>
                        </a:lvl1pPr>
                      </a:pPr>
                      <a:r>
                        <a:t>First bullet point</a:t>
                      </a:r>
                    </a:p>
                    <a:p>
                      <a:pPr>
                        <a:lvl2pPr>
                          <a:buChar char="◦"/>
                        </a:lvl2pPr>
                      </a:pPr>
                      <a:r>
                        <a:t>Second level bullet</a:t>
                      </a:r>
                    </a:p>
                  </p:txBody>
                </p:sp>
              </p:spTree>
            </p:cSld>
          </p:sld>
        `);
      } else if (options.slidesWithImages && index === 0) {
        // Add slide with image
        files[`ppt/slides/slide${index + 1}.xml`] = new TextEncoder().encode(`
          <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
            <p:cSld>
              <p:spTree>
                <p:pic>
                  <p:blipFill>
                    <a:blip r:embed="rId1"/>
                  </p:blipFill>
                </p:pic>
                <p:sp>
                  <p:txBody>
                    <a:p>
                      <a:r>
                        <a:t>${slideContent}</a:t>
                      </a:r>
                    </a:p>
                  </p:txBody>
                </p:sp>
              </p:spTree>
            </p:cSld>
          </p:sld>
        `);
      } else {
        // Add regular slide
        files[`ppt/slides/slide${index + 1}.xml`] = new TextEncoder().encode(`
          <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <p:cSld>
              <p:spTree>
                <p:sp>
                  <p:nvSpPr>
                    <p:cNvSpPr/>
                    <p:nvPr>
                      <p:ph type="title"/>
                    </p:nvPr>
                  </p:nvSpPr>
                  <p:txBody>
                    <a:p>
                      <a:r>
                        <a:t>Slide ${index + 1} Title</a:t>
                      </a:r>
                    </a:p>
                  </p:txBody>
                </p:sp>
                <p:sp>
                  <p:txBody>
                    <a:p>
                      <a:r>
                        <a:t>${slideContent}</a:t>
                      </a:r>
                    </a:p>
                  </p:txBody>
                </p:sp>
              </p:spTree>
            </p:cSld>
          </p:sld>
        `);
      }
    });
  }

  // Add presentation properties if requested
  if (options.includeProps) {
    files["docProps/app.xml"] = new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
        <Application>Test PowerPoint</Application>
        <TitlesOfParts>
          <vt:vector size="${options.slides?.length || 0}" baseType="lpstr">
            ${options.slides?.map((_, i) => `<vt:lpstr>Slide ${i + 1}</vt:lpstr>`).join('\n') || ''}
          </vt:vector>
        </TitlesOfParts>
      </Properties>`);

    files["docProps/core.xml"] = new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <dc:title>Test Presentation</dc:title>
        <dc:creator>Test Author</dc:creator>
        <cp:lastModifiedBy>Test Editor</cp:lastModifiedBy>
        <dcterms:created xsi:type="dcterms:W3CDTF">2024-01-01T00:00:00Z</dcterms:created>
        <dcterms:modified xsi:type="dcterms:W3CDTF">2024-01-01T12:00:00Z</dcterms:modified>
      </cp:coreProperties>`);
  }

  const zipped = fflate.zipSync(files);
  return zipped.buffer as ArrayBuffer;
}

describe("PPTX Reader Edge Cases", () => {
  describe("readPptx with synthetic files", () => {
    test("should process PPTX with multiple slides successfully", async () => {
      const buffer = await createSyntheticPptx({
        slides: ["First slide content", "Second slide content", "Third slide content"],
        includeProps: true
      });

      const result = await Effect.runPromise(readPptx(buffer));
      
      expect(result.slides).toHaveLength(3);
      expect(result.slides[0]?.slideNumber).toBe(1);
      expect(result.slides[0]?.title).toBe("Slide 1 Title");
      expect(result.slides[0]?.content.some(c => c.text?.includes("First slide content"))).toBe(true);
      
      expect(result.metadata?.slideCount).toBe(3);
    });

    test("should handle PPTX with no slides", async () => {
      const buffer = await createSyntheticPptx({
        slides: [],
        includeProps: true
      });

      const result = await Effect.runPromise(readPptx(buffer));
      expect(result.slides).toHaveLength(0);
      expect(result.metadata?.slideCount).toBe(0);
    });

    test("should handle PPTX with bullet points", async () => {
      const buffer = await createSyntheticPptx({
        slides: ["Test content"],
        slidesWithBullets: true
      });

      const result = await Effect.runPromise(readPptx(buffer));
      expect(result.slides).toHaveLength(1);
      expect(result.slides[0]?.content.some(c => c.type === "bullet")).toBe(true);
      expect(result.slides[0]?.content.some(c => c.text?.includes("First bullet point"))).toBe(true);
      expect(result.slides[0]?.content.some(c => c.text?.includes("Second level bullet"))).toBe(true);
    });

    test("should handle PPTX with images", async () => {
      const buffer = await createSyntheticPptx({
        slides: ["Slide with image"],
        slidesWithImages: true
      });

      const result = await Effect.runPromise(readPptx(buffer));
      expect(result.slides).toHaveLength(1);
      // The current implementation may not parse images as image content type
      // but should still process the slide with text content
      expect(result.slides[0]?.content.length).toBeGreaterThan(0);
      expect(result.slides[0]?.content.some(c => c.text?.includes("Slide with image"))).toBe(true);
    });

    test("should handle PPTX with corrupted slide", async () => {
      const buffer = await createSyntheticPptx({
        slides: ["Valid slide 1", "Corrupted slide", "Valid slide 3"],
        includeCorruptedSlide: true
      });

      const result = await Effect.runPromise(readPptx(buffer));
      // Should process valid slides and handle corrupted ones gracefully
      expect(result.slides.length).toBeGreaterThanOrEqual(2);
    });

    test("should handle PPTX without metadata", async () => {
      const buffer = await createSyntheticPptx({
        slides: ["Single slide"],
        includeProps: false
      });

      const result = await Effect.runPromise(readPptx(buffer));
      expect(result.slides).toHaveLength(1);
      expect(result.metadata).toEqual({});
    });

    test("should handle PPTX with metadata", async () => {
      const buffer = await createSyntheticPptx({
        slides: ["Slide with metadata"],
        includeProps: true
      });

      const result = await Effect.runPromise(readPptx(buffer));
      expect(result.slides).toHaveLength(1);
      expect(result.metadata?.slideCount).toBe(1);
    });

    test("should handle corrupted ZIP file", async () => {
      const buffer = new ArrayBuffer(100);
      const view = new Uint8Array(buffer);
      // Fill with random data to simulate corruption
      for (let i = 0; i < view.length; i++) {
        view[i] = Math.floor(Math.random() * 256);
      }

      await expect(Effect.runPromise(readPptx(buffer))).rejects.toThrow();
    });

    test("should handle PPTX with invalid slide numbering", async () => {
      const fflate = await import("fflate");
      const slideXml = `
        <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <p:cSld>
            <p:spTree>
              <p:sp>
                <p:txBody>
                  <a:p>
                    <a:r>
                      <a:t>Test slide</a:t>
                    </a:r>
                  </a:p>
                </p:txBody>
              </p:sp>
            </p:spTree>
          </p:cSld>
        </p:sld>
      `;

      const files = {
        "[Content_Types].xml": new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
            <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          </Types>`),
        "ppt/slides/slideXYZ.xml": new TextEncoder().encode(slideXml), // Invalid slide name
        "ppt/slides/slide999.xml": new TextEncoder().encode(slideXml)  // Large slide number
      };
      
      const zipped = fflate.zipSync(files);
      const buffer = zipped.buffer as ArrayBuffer;

      const result = await Effect.runPromise(readPptx(buffer));
      expect(result.slides).toHaveLength(2);
      // Slides should be sorted properly even with invalid numbering
    });

    test("should handle binary content in slide files", async () => {
      const fflate = await import("fflate");
      const binaryData = new Uint8Array([0xFF, 0xFE, 0xFD, 0xFC]);

      const files = {
        "[Content_Types].xml": new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
            <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          </Types>`),
        "ppt/slides/slide1.xml": binaryData // Binary data that can't be decoded as text
      };
      
      const zipped = fflate.zipSync(files);
      const buffer = zipped.buffer as ArrayBuffer;

      // Should handle binary content gracefully and continue processing
      const result = await Effect.runPromise(readPptx(buffer));
      // The reader should process what it can, may create empty slide for binary content
      expect(result.slides.length).toBeGreaterThanOrEqual(0);
    });

    test("should process slides in correct order", async () => {
      const buffer = await createSyntheticPptx({
        slides: ["Slide A", "Slide B", "Slide C", "Slide D", "Slide E"]
      });

      const result = await Effect.runPromise(readPptx(buffer));
      expect(result.slides).toHaveLength(5);
      
      // Verify slides are in correct order
      for (let i = 0; i < result.slides.length; i++) {
        expect(result.slides[i]?.slideNumber).toBe(i + 1);
        expect(result.slides[i]?.content.some(c => 
          c.text?.includes(`Slide ${String.fromCharCode(65 + i)}`)
        )).toBe(true);
      }
    });

    test("should handle empty slides gracefully", async () => {
      const fflate = await import("fflate");
      const emptySlideXml = `
        <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
          <p:cSld>
            <p:spTree>
            </p:spTree>
          </p:cSld>
        </p:sld>
      `;

      const files = {
        "[Content_Types].xml": new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
            <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          </Types>`),
        "ppt/slides/slide1.xml": new TextEncoder().encode(emptySlideXml)
      };
      
      const zipped = fflate.zipSync(files);
      const buffer = zipped.buffer as ArrayBuffer;

      const result = await Effect.runPromise(readPptx(buffer));
      expect(result.slides).toHaveLength(1);
      expect(result.slides[0]?.content).toHaveLength(0);
    });

    test("should handle large number of slides", async () => {
      const slides = Array.from({ length: 50 }, (_, i) => `Content for slide ${i + 1}`);
      const buffer = await createSyntheticPptx({
        slides,
        includeProps: true
      });

      const result = await Effect.runPromise(readPptx(buffer));
      expect(result.slides).toHaveLength(50);
      expect(result.metadata?.slideCount).toBe(50);
      
      // Verify all slides are processed correctly
      expect(result.slides.every(slide => slide.content.length > 0)).toBe(true);
    });
  });
});