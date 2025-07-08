import { describe, test, expect, beforeAll } from "bun:test";
import { Effect } from "effect";
import { readPptx, PptxParseError } from "../src/formats/pptx/pptx-reader";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  const window = new Window();
  (global as any).DOMParser = window.DOMParser;
  (global as any).Document = window.Document;
  (global as any).Element = window.Element;
  (global as any).Node = window.Node;
});

// Helper to create a minimal valid PPTX buffer
function createMinimalPptx(options: {
  hasSlides?: boolean;
  slideCount?: number;
  slideContent?: string[];
  hasMetadata?: boolean;
  metadataContent?: string;
  corruptZip?: boolean;
} = {}): ArrayBuffer {
  const { zipSync, strToU8 } = require("fflate");
  
  if (options.corruptZip) {
    const buffer = new ArrayBuffer(100);
    const view = new Uint8Array(buffer);
    view.fill(255);
    return buffer;
  }
  
  const files: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
        <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
        <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
      </Types>`),
    "_rels/.rels": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
        <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
      </Relationships>`)
  };
  
  if (options.hasSlides !== false) {
    const slideCount = options.slideCount || 1;
    for (let i = 0; i < slideCount; i++) {
      files[`ppt/slides/slide${i + 1}.xml`] = strToU8(
        options.slideContent?.[i] || 
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
            <p:cSld>
              <p:spTree>
                <p:sp>
                  <p:nvSpPr>
                    <p:nvPr>
                      <p:ph type="title"/>
                    </p:nvPr>
                  </p:nvSpPr>
                  <p:txBody>
                    <a:p>
                      <a:r>
                        <a:t>Slide ${i + 1} Title</a:t>
                      </a:r>
                    </a:p>
                  </p:txBody>
                </p:sp>
                <p:sp>
                  <p:txBody>
                    <a:p>
                      <a:r>
                        <a:t>Content on slide ${i + 1}</a:t>
                      </a:r>
                    </a:p>
                  </p:txBody>
                </p:sp>
              </p:spTree>
            </p:cSld>
          </p:sld>`
      );
    }
  }
  
  if (options.hasMetadata !== false) {
    files["docProps/app.xml"] = strToU8(options.metadataContent || 
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes" xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title>Test Presentation</dc:title>
          <dc:creator>Test Author</dc:creator>
        </Properties>`
    );
  }
  
  const zipped = zipSync(files);
  return zipped.buffer;
}

describe("pptx-reader internal functions", () => {
  describe("readPptx with valid PPTX", () => {
    test("should parse a simple PPTX file with one slide", async () => {
      const buffer = createMinimalPptx();
      const result = await Effect.runPromise(readPptx(buffer));
      
      expect(result).toBeDefined();
      expect(result.slides).toBeArray();
      expect(result.slides).toHaveLength(1);
      expect(result.slides[0]?.slideNumber).toBe(1);
      expect(result.slides[0]?.title).toBe("Slide 1 Title");
      expect(result.slides[0]?.content).toHaveLength(2); // Title + content
      expect(result.metadata).toBeDefined();
    });

    test("should parse multiple slides", async () => {
      const buffer = createMinimalPptx({ slideCount: 3 });
      const result = await Effect.runPromise(readPptx(buffer));
      
      expect(result.slides).toHaveLength(3);
      expect(result.slides[0]?.slideNumber).toBe(1);
      expect(result.slides[1]?.slideNumber).toBe(2);
      expect(result.slides[2]?.slideNumber).toBe(3);
      expect(result.metadata?.slideCount).toBe(3);
    });

    test("should handle slides without metadata", async () => {
      const buffer = createMinimalPptx({ hasMetadata: false });
      const result = await Effect.runPromise(readPptx(buffer));
      
      expect(result).toBeDefined();
      expect(result.slides).toHaveLength(1);
      expect(result.metadata).toEqual({});
    });

    test("should parse slide with bullet points", async () => {
      const slideContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
          <p:cSld>
            <p:spTree>
              <p:sp>
                <p:txBody>
                  <a:p>
                    <a:pPr>
                      <a:buChar/>
                    </a:pPr>
                    <a:r>
                      <a:t>Bullet point 1</a:t>
                    </a:r>
                  </a:p>
                  <a:p>
                    <a:pPr>
                      <a:buChar/>
                    </a:pPr>
                    <a:r>
                      <a:t>Bullet point 2</a:t>
                    </a:r>
                  </a:p>
                </p:txBody>
              </p:sp>
            </p:spTree>
          </p:cSld>
        </p:sld>`;
      
      const buffer = createMinimalPptx({ slideContent: [slideContent] });
      const result = await Effect.runPromise(readPptx(buffer));
      
      const bullets = result.slides[0]?.content.filter(c => c.type === "bullet");
      expect(bullets).toHaveLength(2);
      expect(bullets?.[0]?.text).toBe("Bullet point 1");
      expect(bullets?.[1]?.text).toBe("Bullet point 2");
    });

    test("should handle center title", async () => {
      const slideContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
          <p:cSld>
            <p:spTree>
              <p:sp>
                <p:nvSpPr>
                  <p:nvPr>
                    <p:ph type="ctrTitle"/>
                  </p:nvPr>
                </p:nvSpPr>
                <p:txBody>
                  <a:p>
                    <a:r>
                      <a:t>Center Title</a:t>
                    </a:r>
                  </a:p>
                </p:txBody>
              </p:sp>
            </p:spTree>
          </p:cSld>
        </p:sld>`;
      
      const buffer = createMinimalPptx({ slideContent: [slideContent] });
      const result = await Effect.runPromise(readPptx(buffer));
      
      expect(result.slides[0]?.title).toBe("Center Title");
      expect(result.slides[0]?.content[0]?.type).toBe("title");
    });

    test("should handle empty paragraphs", async () => {
      const slideContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
          <p:cSld>
            <p:spTree>
              <p:sp>
                <p:txBody>
                  <a:p></a:p>
                  <a:p>
                    <a:r>
                      <a:t></a:t>
                    </a:r>
                  </a:p>
                  <a:p>
                    <a:r>
                      <a:t>   </a:t>
                    </a:r>
                  </a:p>
                </p:txBody>
              </p:sp>
            </p:spTree>
          </p:cSld>
        </p:sld>`;
      
      const buffer = createMinimalPptx({ slideContent: [slideContent] });
      const result = await Effect.runPromise(readPptx(buffer));
      
      // Empty paragraphs should be filtered out
      expect(result.slides[0]?.content).toHaveLength(0);
    });

    test("should handle multiple text runs in paragraph", async () => {
      const slideContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
          <p:cSld>
            <p:spTree>
              <p:sp>
                <p:txBody>
                  <a:p>
                    <a:r>
                      <a:t>Hello</a:t>
                    </a:r>
                    <a:r>
                      <a:t> </a:t>
                    </a:r>
                    <a:r>
                      <a:t>World</a:t>
                    </a:r>
                  </a:p>
                </p:txBody>
              </p:sp>
            </p:spTree>
          </p:cSld>
        </p:sld>`;
      
      const buffer = createMinimalPptx({ slideContent: [slideContent] });
      const result = await Effect.runPromise(readPptx(buffer));
      
      expect(result.slides[0]?.content[0]?.text).toBe("Hello World");
    });

    test("should handle no bullet indicator as having bullets", async () => {
      const slideContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
          <p:cSld>
            <p:spTree>
              <p:sp>
                <p:txBody>
                  <a:p>
                    <a:r>
                      <a:t>This has bullets by default</a:t>
                    </a:r>
                  </a:p>
                </p:txBody>
              </p:sp>
            </p:spTree>
          </p:cSld>
        </p:sld>`;
      
      const buffer = createMinimalPptx({ slideContent: [slideContent] });
      const result = await Effect.runPromise(readPptx(buffer));
      
      // When no bullet indicator is present, it should be treated as bullet
      expect(result.slides[0]?.content[0]?.type).toBe("bullet");
    });

    test("should handle explicit no bullets", async () => {
      const slideContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
          <p:cSld>
            <p:spTree>
              <p:sp>
                <p:txBody>
                  <a:p>
                    <a:pPr>
                      <a:buNone/>
                    </a:pPr>
                    <a:r>
                      <a:t>This has no bullets</a:t>
                    </a:r>
                  </a:p>
                </p:txBody>
              </p:sp>
            </p:spTree>
          </p:cSld>
        </p:sld>`;
      
      const buffer = createMinimalPptx({ slideContent: [slideContent] });
      const result = await Effect.runPromise(readPptx(buffer));
      
      // When buNone is present, it should be text
      expect(result.slides[0]?.content[0]?.type).toBe("text");
    });

    test("should extract metadata correctly", async () => {
      const metadataContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title>My Presentation Title</dc:title>
          <dc:creator>John Doe</dc:creator>
        </Properties>`;
      
      const buffer = createMinimalPptx({ metadataContent });
      const result = await Effect.runPromise(readPptx(buffer));
      
      expect(result.metadata?.title).toBe("My Presentation Title");
      expect(result.metadata?.author).toBe("John Doe");
    });

    test("should handle empty metadata values", async () => {
      const metadataContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title></dc:title>
          <dc:creator></dc:creator>
        </Properties>`;
      
      const buffer = createMinimalPptx({ metadataContent });
      const result = await Effect.runPromise(readPptx(buffer));
      
      expect(result.metadata?.title).toBe("");
      expect(result.metadata?.author).toBe("");
    });

    test("should handle missing slide files gracefully", async () => {
      const buffer = createMinimalPptx({ hasSlides: false });
      const result = await Effect.runPromise(readPptx(buffer));
      
      expect(result.slides).toHaveLength(0);
      expect(result.metadata).toBeDefined();
    });

    test("should sort slides by slide number", async () => {
      // Create a PPTX with slides out of order
      const { zipSync, strToU8 } = require("fflate");
      const files: Record<string, Uint8Array> = {
        "[Content_Types].xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
            <Default Extension="xml" ContentType="application/xml"/>
          </Types>`),
        "ppt/slides/slide10.xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
            <p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Slide 10</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld>
          </p:sld>`),
        "ppt/slides/slide2.xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
            <p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Slide 2</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld>
          </p:sld>`),
        "ppt/slides/slide1.xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
            <p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Slide 1</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld>
          </p:sld>`)
      };
      
      const buffer = zipSync(files).buffer;
      const result = await Effect.runPromise(readPptx(buffer));
      
      expect(result.slides).toHaveLength(3);
      expect(result.slides[0]?.slideNumber).toBe(1);
      expect(result.slides[0]?.content[0]?.text).toBe("Slide 1");
      expect(result.slides[1]?.slideNumber).toBe(2);
      expect(result.slides[1]?.content[0]?.text).toBe("Slide 2");
      expect(result.slides[2]?.slideNumber).toBe(3);
      expect(result.slides[2]?.content[0]?.text).toBe("Slide 10");
    });
  });

  describe("Error handling", () => {
    test("should fail with corrupted ZIP", async () => {
      const buffer = createMinimalPptx({ corruptZip: true });
      
      await expect(Effect.runPromise(readPptx(buffer))).rejects.toThrow();
    });

    test("should handle invalid slide XML gracefully", async () => {
      const slideContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <p:sld>
          <invalid XML here
        </p:sld>`;
      
      const buffer = createMinimalPptx({ slideContent: [slideContent] });
      
      // Should still parse what it can
      const result = await Effect.runPromise(readPptx(buffer));
      expect(result.slides).toHaveLength(1);
      expect(result.slides[0]?.content).toHaveLength(0); // No valid content found
    });

    test("should return PptxParseError for failures", async () => {
      const buffer = new ArrayBuffer(10); // Invalid PPTX
      
      try {
        await Effect.runPromise(readPptx(buffer));
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain("Failed to read PPTX:");
      }
    });
  });

  describe("parseSlideXml coverage", () => {
    test("should handle shape without text body", async () => {
      const slideContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
          <p:cSld>
            <p:spTree>
              <p:sp>
                <!-- Shape without txBody -->
              </p:sp>
            </p:spTree>
          </p:cSld>
        </p:sld>`;
      
      const buffer = createMinimalPptx({ slideContent: [slideContent] });
      const result = await Effect.runPromise(readPptx(buffer));
      
      expect(result.slides[0]?.content).toHaveLength(0);
    });

    test("should skip shapes with no content", async () => {
      const slideContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
          <p:cSld>
            <p:spTree>
              <p:sp></p:sp>
              <p:sp>
                <p:txBody>
                  <a:p>
                    <a:r>
                      <a:t>Valid content</a:t>
                    </a:r>
                  </a:p>
                </p:txBody>
              </p:sp>
            </p:spTree>
          </p:cSld>
        </p:sld>`;
      
      const buffer = createMinimalPptx({ slideContent: [slideContent] });
      const result = await Effect.runPromise(readPptx(buffer));
      
      expect(result.slides[0]?.content).toHaveLength(1);
      expect(result.slides[0]?.content[0]?.text).toBe("Valid content");
    });

    test("should only set title once", async () => {
      const slideContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
          <p:cSld>
            <p:spTree>
              <p:sp>
                <p:nvSpPr>
                  <p:nvPr>
                    <p:ph type="title"/>
                  </p:nvPr>
                </p:nvSpPr>
                <p:txBody>
                  <a:p>
                    <a:r>
                      <a:t>First Title</a:t>
                    </a:r>
                  </a:p>
                </p:txBody>
              </p:sp>
              <p:sp>
                <p:nvSpPr>
                  <p:nvPr>
                    <p:ph type="title"/>
                  </p:nvPr>
                </p:nvSpPr>
                <p:txBody>
                  <a:p>
                    <a:r>
                      <a:t>Second Title</a:t>
                    </a:r>
                  </a:p>
                </p:txBody>
              </p:sp>
            </p:spTree>
          </p:cSld>
        </p:sld>`;
      
      const buffer = createMinimalPptx({ slideContent: [slideContent] });
      const result = await Effect.runPromise(readPptx(buffer));
      
      // Should only use the first title
      expect(result.slides[0]?.title).toBe("First Title");
      // Both should be in content
      expect(result.slides[0]?.content).toHaveLength(2);
      expect(result.slides[0]?.content[0]?.type).toBe("title");
      // Second title shape becomes a bullet because it's already set
      expect(result.slides[0]?.content[1]?.type).toBe("bullet");
    });
  });
});