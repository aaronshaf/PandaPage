import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import { readPptx, PptxParseError } from "./pptx-reader";
import { Window } from "happy-dom";

// Set up DOM environment
const window = new Window();
global.DOMParser = window.DOMParser as any;

describe("PPTX Reader - DOM Parsing Coverage", () => {
  describe("parseSlideXml DOM paths", () => {
    test("should handle slide with title placeholder", async () => {
      // Create a minimal PPTX ZIP structure with a slide containing title
      const { zipSync, strToU8 } = await import("fflate");

      const slideXml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" 
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="1" name="Title"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="title"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:txBody>
          <a:p>
            <a:r>
              <a:t>Sample Title</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

      const files = {
        "ppt/slides/slide1.xml": strToU8(slideXml),
        "[Content_Types].xml": strToU8(
          `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
        ),
      };

      const zipBuffer = zipSync(files);
      const arrayBuffer = zipBuffer.buffer.slice(
        zipBuffer.byteOffset,
        zipBuffer.byteOffset + zipBuffer.byteLength,
      ) as ArrayBuffer;

      const result = await Effect.runPromise(readPptx(arrayBuffer));

      expect(result.slides).toHaveLength(1);
      expect(result.slides[0]?.title).toBe("Sample Title");
      expect(result.slides[0]?.content).toHaveLength(1);
      expect(result.slides[0]?.content[0]?.type).toBe("title");
    });

    test("should handle slide with bullet points", async () => {
      const { zipSync, strToU8 } = await import("fflate");

      const slideXml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" 
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p>
            <a:pPr>
              <a:buChar char="•"/>
            </a:pPr>
            <a:r>
              <a:t>First bullet</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:pPr>
              <a:buChar char="•"/>
            </a:pPr>
            <a:r>
              <a:t>Second bullet</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

      const files = {
        "ppt/slides/slide1.xml": strToU8(slideXml),
        "[Content_Types].xml": strToU8(
          `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
        ),
      };

      const zipBuffer = zipSync(files);
      const arrayBuffer = zipBuffer.buffer.slice(
        zipBuffer.byteOffset,
        zipBuffer.byteOffset + zipBuffer.byteLength,
      ) as ArrayBuffer;

      const result = await Effect.runPromise(readPptx(arrayBuffer));

      expect(result.slides).toHaveLength(1);
      expect(result.slides[0]?.content).toHaveLength(2);
      expect(result.slides[0]?.content[0]?.type).toBe("bullet");
      expect(result.slides[0]?.content[0]?.text).toBe("First bullet");
      expect(result.slides[0]?.content[1]?.type).toBe("bullet");
      expect(result.slides[0]?.content[1]?.text).toBe("Second bullet");
    });

    test("should handle slide with no bullets (buNone)", async () => {
      const { zipSync, strToU8 } = await import("fflate");

      const slideXml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" 
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p>
            <a:pPr>
              <a:buNone/>
            </a:pPr>
            <a:r>
              <a:t>Regular text</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

      const files = {
        "ppt/slides/slide1.xml": strToU8(slideXml),
        "[Content_Types].xml": strToU8(
          `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
        ),
      };

      const zipBuffer = zipSync(files);
      const arrayBuffer = zipBuffer.buffer.slice(
        zipBuffer.byteOffset,
        zipBuffer.byteOffset + zipBuffer.byteLength,
      ) as ArrayBuffer;

      const result = await Effect.runPromise(readPptx(arrayBuffer));

      expect(result.slides).toHaveLength(1);
      expect(result.slides[0]?.content).toHaveLength(1);
      expect(result.slides[0]?.content[0]?.type).toBe("text");
      expect(result.slides[0]?.content[0]?.text).toBe("Regular text");
    });

    test("should handle slide with center title placeholder", async () => {
      const { zipSync, strToU8 } = await import("fflate");

      const slideXml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" 
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
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

      const files = {
        "ppt/slides/slide1.xml": strToU8(slideXml),
        "[Content_Types].xml": strToU8(
          `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
        ),
      };

      const zipBuffer = zipSync(files);
      const arrayBuffer = zipBuffer.buffer.slice(
        zipBuffer.byteOffset,
        zipBuffer.byteOffset + zipBuffer.byteLength,
      ) as ArrayBuffer;

      const result = await Effect.runPromise(readPptx(arrayBuffer));

      expect(result.slides).toHaveLength(1);
      expect(result.slides[0]?.title).toBe("Center Title");
      expect(result.slides[0]?.content[0]?.type).toBe("title");
    });

    test("should handle slide with multiple text runs in paragraph", async () => {
      const { zipSync, strToU8 } = await import("fflate");

      const slideXml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" 
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p>
            <a:r>
              <a:t>Hello </a:t>
            </a:r>
            <a:r>
              <a:t>beautiful </a:t>
            </a:r>
            <a:r>
              <a:t>world!</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

      const files = {
        "ppt/slides/slide1.xml": strToU8(slideXml),
        "[Content_Types].xml": strToU8(
          `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
        ),
      };

      const zipBuffer = zipSync(files);
      const arrayBuffer = zipBuffer.buffer.slice(
        zipBuffer.byteOffset,
        zipBuffer.byteOffset + zipBuffer.byteLength,
      ) as ArrayBuffer;

      const result = await Effect.runPromise(readPptx(arrayBuffer));

      expect(result.slides).toHaveLength(1);
      expect(result.slides[0]?.content).toHaveLength(1);
      expect(result.slides[0]?.content[0]?.text).toBe("Hello beautiful world!");
    });

    test("should handle slide with empty text elements", async () => {
      const { zipSync, strToU8 } = await import("fflate");

      const slideXml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" 
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p>
            <a:r>
              <a:t></a:t>
            </a:r>
            <a:r>
              <a:t>   </a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

      const files = {
        "ppt/slides/slide1.xml": strToU8(slideXml),
        "[Content_Types].xml": strToU8(
          `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
        ),
      };

      const zipBuffer = zipSync(files);
      const arrayBuffer = zipBuffer.buffer.slice(
        zipBuffer.byteOffset,
        zipBuffer.byteOffset + zipBuffer.byteLength,
      ) as ArrayBuffer;

      const result = await Effect.runPromise(readPptx(arrayBuffer));

      expect(result.slides).toHaveLength(1);
      expect(result.slides[0]?.content).toHaveLength(0); // Empty text should be filtered out
    });

    test("should handle malformed XML gracefully", async () => {
      const { zipSync, strToU8 } = await import("fflate");

      const malformedXml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <unclosed-tag>
      <p:sp>
        <malformed
      </p:sp>
    </unclosed-tag>
  </p:cSld>
</p:sld>`;

      const files = {
        "ppt/slides/slide1.xml": strToU8(malformedXml),
        "[Content_Types].xml": strToU8(
          `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
        ),
      };

      const zipBuffer = zipSync(files);
      const arrayBuffer = zipBuffer.buffer.slice(
        zipBuffer.byteOffset,
        zipBuffer.byteOffset + zipBuffer.byteLength,
      ) as ArrayBuffer;

      const result = await Effect.runPromise(readPptx(arrayBuffer));

      expect(result.slides).toHaveLength(1);
      expect(result.slides[0]?.content).toHaveLength(0); // Should handle gracefully
    });
  });

  describe("parsePresentationProps DOM paths", () => {
    test("should parse metadata with title and author", async () => {
      const { zipSync, strToU8 } = await import("fflate");

      const appPropsXml = `<?xml version="1.0" encoding="UTF-8"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Microsoft PowerPoint</Application>
  <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">My Presentation</dc:title>
  <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">John Doe</dc:creator>
</Properties>`;

      const slideXml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree></p:spTree></p:cSld>
</p:sld>`;

      const files = {
        "ppt/slides/slide1.xml": strToU8(slideXml),
        "docProps/app.xml": strToU8(appPropsXml),
        "[Content_Types].xml": strToU8(
          `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
        ),
      };

      const zipBuffer = zipSync(files);
      const arrayBuffer = zipBuffer.buffer.slice(
        zipBuffer.byteOffset,
        zipBuffer.byteOffset + zipBuffer.byteLength,
      ) as ArrayBuffer;

      const result = await Effect.runPromise(readPptx(arrayBuffer));

      expect(result.metadata?.title).toBe("My Presentation");
      expect(result.metadata?.author).toBe("John Doe");
      expect(result.metadata?.slideCount).toBe(1);
    });

    test("should handle empty metadata elements", async () => {
      const { zipSync, strToU8 } = await import("fflate");

      const appPropsXml = `<?xml version="1.0" encoding="UTF-8"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/"></dc:title>
  <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/"></dc:creator>
</Properties>`;

      const slideXml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree></p:spTree></p:cSld>
</p:sld>`;

      const files = {
        "ppt/slides/slide1.xml": strToU8(slideXml),
        "docProps/app.xml": strToU8(appPropsXml),
        "[Content_Types].xml": strToU8(
          `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
        ),
      };

      const zipBuffer = zipSync(files);
      const arrayBuffer = zipBuffer.buffer.slice(
        zipBuffer.byteOffset,
        zipBuffer.byteOffset + zipBuffer.byteLength,
      ) as ArrayBuffer;

      const result = await Effect.runPromise(readPptx(arrayBuffer));

      expect(result.metadata?.title).toBe("");
      expect(result.metadata?.author).toBe("");
    });

    test("should handle missing metadata elements", async () => {
      const { zipSync, strToU8 } = await import("fflate");

      const appPropsXml = `<?xml version="1.0" encoding="UTF-8"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Microsoft PowerPoint</Application>
</Properties>`;

      const slideXml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree></p:spTree></p:cSld>
</p:sld>`;

      const files = {
        "ppt/slides/slide1.xml": strToU8(slideXml),
        "docProps/app.xml": strToU8(appPropsXml),
        "[Content_Types].xml": strToU8(
          `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
        ),
      };

      const zipBuffer = zipSync(files);
      const arrayBuffer = zipBuffer.buffer.slice(
        zipBuffer.byteOffset,
        zipBuffer.byteOffset + zipBuffer.byteLength,
      ) as ArrayBuffer;

      const result = await Effect.runPromise(readPptx(arrayBuffer));

      expect(result.metadata?.title).toBeUndefined();
      expect(result.metadata?.author).toBeUndefined();
      expect(result.metadata?.slideCount).toBe(1);
    });

    test("should handle metadata parsing errors", async () => {
      const { zipSync, strToU8 } = await import("fflate");

      const malformedAppPropsXml = `<?xml version="1.0" encoding="UTF-8"?>
<Properties>
  <unclosed-tag>
    <dc:title>Title</dc:title>
  <!-- malformed XML -->
</Properties>`;

      const slideXml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree></p:spTree></p:cSld>
</p:sld>`;

      const files = {
        "ppt/slides/slide1.xml": strToU8(slideXml),
        "docProps/app.xml": strToU8(malformedAppPropsXml),
        "[Content_Types].xml": strToU8(
          `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
        ),
      };

      const zipBuffer = zipSync(files);
      const arrayBuffer = zipBuffer.buffer.slice(
        zipBuffer.byteOffset,
        zipBuffer.byteOffset + zipBuffer.byteLength,
      ) as ArrayBuffer;

      // Should fail due to malformed metadata XML
      const result = await Effect.runPromiseExit(readPptx(arrayBuffer));
      expect(result._tag).toBe("Failure");
    });
  });

  describe("readPptx with missing files", () => {
    test("should handle PPTX without metadata", async () => {
      const { zipSync, strToU8 } = await import("fflate");

      const slideXml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree></p:spTree></p:cSld>
</p:sld>`;

      const files = {
        "ppt/slides/slide1.xml": strToU8(slideXml),
        "[Content_Types].xml": strToU8(
          `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
        ),
      };

      const zipBuffer = zipSync(files);
      const arrayBuffer = zipBuffer.buffer.slice(
        zipBuffer.byteOffset,
        zipBuffer.byteOffset + zipBuffer.byteLength,
      ) as ArrayBuffer;

      const result = await Effect.runPromise(readPptx(arrayBuffer));

      expect(result.slides).toHaveLength(1);
      expect(result.metadata).toEqual({}); // Empty metadata object
    });

    test("should handle PPTX with no slides", async () => {
      const { zipSync, strToU8 } = await import("fflate");

      const files = {
        "[Content_Types].xml": strToU8(
          `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
        ),
      };

      const zipBuffer = zipSync(files);
      const arrayBuffer = zipBuffer.buffer.slice(
        zipBuffer.byteOffset,
        zipBuffer.byteOffset + zipBuffer.byteLength,
      ) as ArrayBuffer;

      const result = await Effect.runPromise(readPptx(arrayBuffer));

      expect(result.slides).toHaveLength(0);
    });
  });

  describe("XML namespace handling", () => {
    test("should add missing namespaces to slide XML", async () => {
      const { zipSync, strToU8 } = await import("fflate");

      // XML without proper namespaces
      const slideXmlWithoutNs = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld>
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p>
            <a:r>
              <a:t>Test text</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

      const files = {
        "ppt/slides/slide1.xml": strToU8(slideXmlWithoutNs),
        "[Content_Types].xml": strToU8(
          `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
        ),
      };

      const zipBuffer = zipSync(files);
      const arrayBuffer = zipBuffer.buffer.slice(
        zipBuffer.byteOffset,
        zipBuffer.byteOffset + zipBuffer.byteLength,
      ) as ArrayBuffer;

      const result = await Effect.runPromise(readPptx(arrayBuffer));

      expect(result.slides).toHaveLength(1);
      expect(result.slides[0]?.content).toHaveLength(1);
      expect(result.slides[0]?.content[0]?.text).toBe("Test text");
    });
  });
});
