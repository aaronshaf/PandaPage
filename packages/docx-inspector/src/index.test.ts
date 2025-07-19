import { describe, it, expect } from "bun:test";
import { DocxInspector } from "./index";
import { readFileSync } from "fs";
import { join } from "path";

describe("DocxInspector", () => {
  const inspector = new DocxInspector();

  it("should create an inspector instance", () => {
    expect(inspector).toBeInstanceOf(DocxInspector);
  });

  it("should have required methods", () => {
    expect(typeof inspector.inspect).toBe("function");
    expect(typeof inspector.getDocumentXml).toBe("function");
    expect(typeof inspector.getStylesXml).toBe("function");
    expect(typeof inspector.getNumberingXml).toBe("function");
    expect(typeof inspector.getImageFiles).toBe("function");
  });

  // Test with synthetic DOCX structure
  it("should inspect synthetic DOCX structure", async () => {
    // Create a minimal synthetic DOCX-like structure
    const syntheticFiles = {
      "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`,
      "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
      "word/document.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Test paragraph</w:t></w:r></w:p>
    <w:tbl>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Cell 1</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Cell 2</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>`,
      "word/styles.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Normal">
    <w:name w:val="Normal"/>
  </w:style>
</w:styles>`,
      "word/media/image1.png": new ArrayBuffer(100), // Synthetic image
    };

    // Mock the JSZip structure with proper file objects
    const mockZip = {
      files: Object.entries(syntheticFiles).reduce((acc, [path, content]) => {
        acc[path] = {
          name: path,
          async: () => Promise.resolve(content),
        };
        return acc;
      }, {} as any),
      // Add forEach method that JSZip uses
      forEach: function (callback: (relativePath: string, file: any) => void) {
        Object.entries(this.files).forEach(([path, file]) => {
          callback(path, file);
        });
      },
    };

    // Override JSZip loadAsync temporarily
    const JSZip = await import("jszip");
    const originalLoadAsync = JSZip.default.prototype.loadAsync;
    JSZip.default.prototype.loadAsync = () => Promise.resolve(mockZip as any);

    try {
      // Create a minimal buffer (doesn't need to be real ZIP data for this test)
      const buffer = new ArrayBuffer(1000);
      const result = await inspector.inspect(buffer, "synthetic-test.docx");

      expect(result).toBeDefined();
      expect(result.fileName).toBe("synthetic-test.docx");
      expect(result.fileSize).toBe(1000);
      expect(result.files).toBeInstanceOf(Array);
      expect(result.files.length).toBe(5); // 5 files in our synthetic structure
      expect(result.documentStructure.hasDocument).toBe(true);
      expect(result.documentStructure.hasStyles).toBe(true);
      expect(result.documentStructure.hasImages).toBe(1); // We have 1 image file
      expect(result.statistics.totalFiles).toBe(5);

      // Should have main document parts
      const hasDocumentXml = result.files.some((f) => f.name === "word/document.xml");
      expect(hasDocumentXml).toBe(true);

      // Test utility methods
      const documentXml = inspector.getDocumentXml(result);
      expect(typeof documentXml).toBe("string");
      expect(documentXml?.includes("<w:document")).toBe(true);

      console.log("📊 Synthetic DOCX Inspection Results:");
      console.log(`- Files: ${result.statistics.totalFiles}`);
      console.log(`- Size: ${(result.fileSize / 1024).toFixed(1)} KB`);
      console.log(`- Images: ${result.documentStructure.hasImages}`);
      console.log(`- Has styles: ${result.documentStructure.hasStyles}`);
      console.log(`- Has numbering: ${result.documentStructure.hasNumbering}`);
    } finally {
      // Restore original loadAsync
      JSZip.default.prototype.loadAsync = originalLoadAsync;
    }
  });

  it("should handle file type detection", () => {
    const testCases = [
      { path: "word/document.xml", content: '<?xml version="1.0"?><document/>', expected: "xml" },
      { path: "word/media/image1.png", content: new ArrayBuffer(100), expected: "binary" },
      { path: "[Content_Types].xml", content: "<Types/>", expected: "xml" },
      { path: "word/embeddings/object1.bin", content: new ArrayBuffer(50), expected: "binary" },
    ];

    for (const testCase of testCases) {
      const result = (inspector as any).determineFileType(testCase.path, testCase.content);
      expect(result).toBe(testCase.expected);
    }
  });

  it("should detect image and embedded files correctly", () => {
    const imageFiles = ["word/media/image1.png", "word/media/image2.jpg", "word/media/chart.gif"];

    const embeddedFiles = ["word/embeddings/object1.bin", "word/oleObjects/object2.bin"];

    const normalFiles = ["word/document.xml", "word/styles.xml", "[Content_Types].xml"];

    for (const file of imageFiles) {
      expect((inspector as any).isImageFile(file)).toBe(true);
      expect((inspector as any).isEmbeddedObject(file)).toBe(false);
    }

    for (const file of embeddedFiles) {
      expect((inspector as any).isImageFile(file)).toBe(false);
      expect((inspector as any).isEmbeddedObject(file)).toBe(true);
    }

    for (const file of normalFiles) {
      expect((inspector as any).isImageFile(file)).toBe(false);
      expect((inspector as any).isEmbeddedObject(file)).toBe(false);
    }
  });

  it("should parse relationships correctly", () => {
    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="word/styles.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com" TargetMode="External"/>
</Relationships>`;

    const relationships = (inspector as any).parseRelationships(relsXml);

    expect(relationships).toHaveLength(3);
    expect(relationships[0].id).toBe("rId1");
    expect(relationships[0].type).toContain("officeDocument");
    expect(relationships[0].target).toBe("word/document.xml");

    expect(relationships[2].targetMode).toBe("External");
  });

  it("should parse content types correctly", () => {
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

    const contentTypes = (inspector as any).parseContentTypes(contentTypesXml);

    expect(contentTypes.png).toBe("image/png");
    expect(contentTypes.jpeg).toBe("image/jpeg");
    expect(contentTypes["/word/document.xml"]).toContain("wordprocessingml.document.main");
  });
});
