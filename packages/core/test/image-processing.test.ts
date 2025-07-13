import { describe, it, expect, beforeEach } from "bun:test";
import { Effect } from "effect";
import { readDocx, DocxParseError } from "../src/formats/docx/docx-reader";

describe("Image Processing Integration", () => {
  // Helper to create synthetic ZIP data with image files
  function createSyntheticDocxWithImages(): ArrayBuffer {
    // This is a minimal DOCX structure with synthetic image data
    // In a real implementation, we'd use a proper ZIP library
    // For now, we'll simulate the key components
    
    const fflate = require("fflate");
    
    // Create synthetic document XML with image references
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Document with image:</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:drawing>
          <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <wp:extent cx="914400" cy="609600"/>
            <wp:docPr id="1" name="test-image"/>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
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
  </w:body>
</w:document>`;

    // Create synthetic relationships XML
    const relationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
</Relationships>`;

    // Create synthetic PNG image data (valid PNG header + minimal data)
    const pngData = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // width: 1
      0x00, 0x00, 0x00, 0x01, // height: 1
      0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
      0x90, 0x77, 0x53, 0xDE, // CRC
      0x00, 0x00, 0x00, 0x00, // IEND chunk size
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ]);

    // Create ZIP structure
    const files: Record<string, Uint8Array> = {
      "word/document.xml": new TextEncoder().encode(documentXml),
      "word/_rels/document.xml.rels": new TextEncoder().encode(relationshipsXml),
      "word/media/image1.png": pngData,
    };

    return fflate.zipSync(files);
  }

  function createSyntheticDocxWithInvalidImage(): ArrayBuffer {
    const fflate = require("fflate");
    
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:r>
        <w:drawing>
          <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <wp:extent cx="914400" cy="609600"/>
            <wp:docPr id="1" name="invalid-image"/>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
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
  </w:body>
</w:document>`;

    const relationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/invalid.png"/>
</Relationships>`;

    // Create invalid image data (not a valid PNG)
    const invalidData = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);

    const files: Record<string, Uint8Array> = {
      "word/document.xml": new TextEncoder().encode(documentXml),
      "word/_rels/document.xml.rels": new TextEncoder().encode(relationshipsXml),
      "word/media/invalid.png": invalidData,
    };

    return fflate.zipSync(files);
  }

  function createSyntheticDocxWithOversizedImage(): ArrayBuffer {
    const fflate = require("fflate");
    
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:r>
        <w:drawing>
          <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <wp:extent cx="914400" cy="609600"/>
            <wp:docPr id="1" name="large-image"/>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
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
  </w:body>
</w:document>`;

    const relationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/large.png"/>
</Relationships>`;

    // Create oversized image data (larger than MAX_IMAGE_SIZE)
    const { MAX_IMAGE_SIZE } = require("../src/utils/image-validation");
    const oversizedData = new Uint8Array(MAX_IMAGE_SIZE + 1000);
    // Add PNG header to make it look like a PNG
    oversizedData[0] = 0x89;
    oversizedData[1] = 0x50;
    oversizedData[2] = 0x4E;
    oversizedData[3] = 0x47;

    const files: Record<string, Uint8Array> = {
      "word/document.xml": new TextEncoder().encode(documentXml),
      "word/_rels/document.xml.rels": new TextEncoder().encode(relationshipsXml),
      "word/media/large.png": oversizedData,
    };

    return fflate.zipSync(files);
  }

  describe("Valid Image Processing", () => {
    it("should successfully extract and validate proper images", async () => {
      const docxBuffer = createSyntheticDocxWithImages();
      
      const result = await Effect.runPromise(readDocx(docxBuffer));
      
      expect(result.paragraphs).toBeDefined();
      expect(result.paragraphs.length).toBeGreaterThan(0);
      
      // Find paragraph with image
      const imageRun = result.paragraphs
        .flatMap(p => p.runs)
        .find(r => r.image);
      
      expect(imageRun).toBeDefined();
      expect(imageRun?.image).toBeDefined();
      expect(imageRun?.image?.data).toBeDefined();
      expect(imageRun?.image?.mimeType).toBe("image/png");
      expect(imageRun?.image?.relationshipId).toBe("rId1");
    });

    it("should set correct image dimensions from DOCX metadata", async () => {
      const docxBuffer = createSyntheticDocxWithImages();
      
      const result = await Effect.runPromise(readDocx(docxBuffer));
      const imageRun = result.paragraphs
        .flatMap(p => p.runs)
        .find(r => r.image);
      
      expect(imageRun?.image?.width).toBeDefined();
      expect(imageRun?.image?.height).toBeDefined();
      // Dimensions are converted from EMUs to pixels
      expect(imageRun?.image?.width).toBeGreaterThan(0);
      expect(imageRun?.image?.height).toBeGreaterThan(0);
    });
  });

  describe("Invalid Image Handling", () => {
    it("should skip invalid images and continue processing", async () => {
      const docxBuffer = createSyntheticDocxWithInvalidImage();
      
      const result = await Effect.runPromise(readDocx(docxBuffer));
      
      expect(result.paragraphs).toBeDefined();
      
      // Find paragraph with image reference
      const imageRun = result.paragraphs
        .flatMap(p => p.runs)
        .find(r => r.image);
      
      // Image run should exist but without data due to validation failure
      if (imageRun?.image) {
        expect(imageRun.image.data).toBeUndefined();
      }
    });

    it("should skip oversized images and continue processing", async () => {
      const docxBuffer = createSyntheticDocxWithOversizedImage();
      
      const result = await Effect.runPromise(readDocx(docxBuffer));
      
      expect(result.paragraphs).toBeDefined();
      
      // Document should still be processed, but oversized image should be skipped
      const imageRun = result.paragraphs
        .flatMap(p => p.runs)
        .find(r => r.image);
      
      if (imageRun?.image) {
        expect(imageRun.image.data).toBeUndefined();
      }
    });
  });

  describe("Image Relationship Processing", () => {
    it("should handle missing image files gracefully", async () => {
      const fflate = require("fflate");
      
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:r>
        <w:drawing>
          <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
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
  </w:body>
</w:document>`;

      const relationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/missing.png"/>
</Relationships>`;

      // Note: no image file in the ZIP
      const files: Record<string, Uint8Array> = {
        "word/document.xml": new TextEncoder().encode(documentXml),
        "word/_rels/document.xml.rels": new TextEncoder().encode(relationshipsXml),
      };

      const docxBuffer = fflate.zipSync(files);
      
      const result = await Effect.runPromise(readDocx(docxBuffer));
      
      expect(result.paragraphs).toBeDefined();
      // Document should still process successfully even with missing image
      expect(result.paragraphs.length).toBeGreaterThan(0);
    });

    it("should handle malformed relationship references", async () => {
      const fflate = require("fflate");
      
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:r>
        <w:drawing>
          <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:blipFill>
                    <a:blip r:embed="rIdNonExistent"/>
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

      const relationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
</Relationships>`;

      const files: Record<string, Uint8Array> = {
        "word/document.xml": new TextEncoder().encode(documentXml),
        "word/_rels/document.xml.rels": new TextEncoder().encode(relationshipsXml),
      };

      const docxBuffer = fflate.zipSync(files);
      
      const result = await Effect.runPromise(readDocx(docxBuffer));
      
      expect(result.paragraphs).toBeDefined();
      // Should handle missing relationship gracefully
      expect(result.paragraphs.length).toBeGreaterThan(0);
    });
  });

  describe("Performance and Limits", () => {
    it("should enforce document image limits", async () => {
      const fflate = require("fflate");
      const { MAX_IMAGES_PER_DOCUMENT } = require("../src/utils/image-validation");
      
      // Create document with more images than the limit
      let documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>`;

      let relationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`;

      const files: Record<string, Uint8Array> = {};
      
      // Add maximum number of images + some extra
      const imageCount = Math.min(10, MAX_IMAGES_PER_DOCUMENT + 5); // Keep test reasonable
      
      for (let i = 1; i <= imageCount; i++) {
        documentXml += `
    <w:p>
      <w:r>
        <w:drawing>
          <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:blipFill>
                    <a:blip r:embed="rId${i}"/>
                  </pic:blipFill>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>`;
        
        relationshipsXml += `
  <Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${i}.png"/>`;
        
        // Create minimal PNG data for each image
        const pngData = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        files[`word/media/image${i}.png`] = pngData;
      }

      documentXml += `
  </w:body>
</w:document>`;
      relationshipsXml += `
</Relationships>`;

      files["word/document.xml"] = new TextEncoder().encode(documentXml);
      files["word/_rels/document.xml.rels"] = new TextEncoder().encode(relationshipsXml);

      const docxBuffer = fflate.zipSync(files);
      
      const result = await Effect.runPromise(readDocx(docxBuffer));
      
      expect(result.paragraphs).toBeDefined();
      
      // Count images that were actually processed
      const processedImages = result.paragraphs
        .flatMap(p => p.runs)
        .filter(r => r.image?.data)
        .length;
      
      // Should not exceed the document limit
      expect(processedImages).toBeLessThanOrEqual(Math.min(imageCount, MAX_IMAGES_PER_DOCUMENT));
    });
  });

  describe("Error Recovery", () => {
    it("should continue processing after image errors", async () => {
      const fflate = require("fflate");
      
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Text before image</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:drawing>
          <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
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
        <w:t>Text after image</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

      const relationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/corrupt.png"/>
</Relationships>`;

      // Create corrupted image data
      const corruptData = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF]);

      const files: Record<string, Uint8Array> = {
        "word/document.xml": new TextEncoder().encode(documentXml),
        "word/_rels/document.xml.rels": new TextEncoder().encode(relationshipsXml),
        "word/media/corrupt.png": corruptData,
      };

      const docxBuffer = fflate.zipSync(files);
      
      const result = await Effect.runPromise(readDocx(docxBuffer));
      
      expect(result.paragraphs).toBeDefined();
      expect(result.paragraphs.length).toBe(3);
      
      // Text content should still be extracted
      const textRuns = result.paragraphs.flatMap(p => p.runs).filter(r => r.text);
      expect(textRuns.length).toBeGreaterThan(0);
      expect(textRuns.some(r => r.text.includes("Text before image"))).toBe(true);
      expect(textRuns.some(r => r.text.includes("Text after image"))).toBe(true);
    });
  });
});