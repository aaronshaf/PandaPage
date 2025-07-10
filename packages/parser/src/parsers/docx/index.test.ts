import { test, expect } from "bun:test";
import { Effect } from "effect";
import { parseDocx, parseDocxDocument, DocxParseError } from "./index";
import type { ParsedDocument } from "../../types/document";
import "../../test-setup";

// Helper to create a minimal DOCX zip structure
async function createMinimalDocx(documentXml: string): Promise<ArrayBuffer> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  // Add the minimal required structure
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
  );

  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  );

  zip.file("word/document.xml", documentXml);

  // Add core properties
  zip.file(
    "docProps/core.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Test Document</dc:title>
  <dc:creator>Test Author</dc:creator>
  <cp:lastModifiedBy>Test Author</cp:lastModifiedBy>
  <cp:keywords>test, document</cp:keywords>
  <dc:description>Test description</dc:description>
</cp:coreProperties>`,
  );

  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="../docProps/core.xml"/>
</Relationships>`,
  );

  return zip.generateAsync({ type: "arraybuffer" });
}

// Test data
const simpleDocumentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
      </w:pPr>
      <w:r>
        <w:t>Test Heading</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>This is a simple paragraph.</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>Bold text</w:t>
      </w:r>
      <w:r>
        <w:t> and </w:t>
      </w:r>
      <w:r>
        <w:rPr>
          <w:i/>
        </w:rPr>
        <w:t>italic text</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

test("parseDocxDocument is a function", () => {
  expect(typeof parseDocxDocument).toBe("function");
});

test("parseDocxDocument handles empty buffer", async () => {
  await expect(parseDocxDocument(new ArrayBuffer(0))).rejects.toThrow();
});

test("parseDocx returns Effect with DocxParseError", async () => {
  const effect = parseDocx(new ArrayBuffer(0));
  const result = await Effect.runPromise(Effect.either(effect));
  expect(result._tag).toBe("Left");
  if (result._tag === "Left") {
    expect(result.left).toBeInstanceOf(DocxParseError);
  }
});

test("DocxParseError has correct structure", () => {
  const error = new DocxParseError("Test error");
  expect(error._tag).toBe("DocxParseError");
  expect(error.message).toBe("Test error");
});

test("parseDocx parses simple document correctly", async () => {
  const docxBuffer = await createMinimalDocx(simpleDocumentXml);
  const effect = parseDocx(docxBuffer);
  const result = await Effect.runPromise(Effect.either(effect));

  expect(result._tag).toBe("Right");
  if (result._tag === "Right") {
    const doc = result.right;
    expect(doc.metadata.title).toBe("Test Document");
    expect(doc.metadata.author).toBe("Test Author");
    expect(doc.metadata.keywords).toEqual(["test", "document"]);
    expect(doc.metadata.description).toBe("Test description");

    expect(doc.elements).toHaveLength(3);

    // First element should be a heading
    const heading = doc.elements[0];
    expect(heading.type).toBe("heading");
    if (heading.type === "heading") {
      expect(heading.level).toBe(1);
      expect(heading.runs).toHaveLength(1);
      expect(heading.runs[0].text).toBe("Test Heading");
    }

    // Second element should be a paragraph
    const para1 = doc.elements[1];
    expect(para1.type).toBe("paragraph");
    if (para1.type === "paragraph") {
      expect(para1.runs).toHaveLength(1);
      expect(para1.runs[0].text).toBe("This is a simple paragraph.");
    }

    // Third element should have formatting
    const para2 = doc.elements[2];
    expect(para2.type).toBe("paragraph");
    if (para2.type === "paragraph") {
      expect(para2.runs).toHaveLength(3);
      expect(para2.runs[0].text).toBe("Bold text");
      expect(para2.runs[0].bold).toBe(true);
      expect(para2.runs[1].text).toBe(" and ");
      expect(para2.runs[2].text).toBe("italic text");
      expect(para2.runs[2].italic).toBe(true);
    }
  }
});

test("parseDocx handles missing document.xml", async () => {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  zip.file("dummy.txt", "dummy");
  const buffer = await zip.generateAsync({ type: "arraybuffer" });

  const effect = parseDocx(buffer);
  const result = await Effect.runPromise(Effect.either(effect));

  expect(result._tag).toBe("Left");
  if (result._tag === "Left") {
    expect(result.left.message).toContain("No document.xml found");
  }
});

test("parseDocx handles invalid XML", async () => {
  const docxBuffer = await createMinimalDocx("<invalid xml");
  const effect = parseDocx(docxBuffer);
  const result = await Effect.runPromise(Effect.either(effect));

  // Invalid XML might still parse, but should produce empty document
  expect(result._tag).toBe("Right");
  if (result._tag === "Right") {
    expect(result.right.elements).toHaveLength(0);
  }
});

test("parseDocx handles document with list", async () => {
  const listDocumentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:numPr>
          <w:ilvl w:val="0"/>
          <w:numId w:val="1"/>
        </w:numPr>
      </w:pPr>
      <w:r>
        <w:t>First item</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:numPr>
          <w:ilvl w:val="0"/>
          <w:numId w:val="1"/>
        </w:numPr>
      </w:pPr>
      <w:r>
        <w:t>Second item</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

  const docxBuffer = await createMinimalDocx(listDocumentXml);
  const effect = parseDocx(docxBuffer);
  const result = await Effect.runPromise(Effect.either(effect));

  expect(result._tag).toBe("Right");
  if (result._tag === "Right") {
    const doc = result.right;
    expect(doc.elements).toHaveLength(2);

    const item1 = doc.elements[0];
    expect(item1.type).toBe("paragraph");
    if (item1.type === "paragraph") {
      expect(item1.listInfo).toEqual({ level: 0, type: "number" });
      expect(item1.runs[0].text).toBe("First item");
    }
  }
});

test("parseDocx handles text with multiple formatting", async () => {
  const formattedDocumentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:i/>
          <w:u/>
          <w:strike/>
          <w:sz w:val="28"/>
          <w:rFonts w:ascii="Arial"/>
          <w:color w:val="FF0000"/>
        </w:rPr>
        <w:t>Formatted text</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

  const docxBuffer = await createMinimalDocx(formattedDocumentXml);
  const effect = parseDocx(docxBuffer);
  const result = await Effect.runPromise(Effect.either(effect));

  expect(result._tag).toBe("Right");
  if (result._tag === "Right") {
    const doc = result.right;
    const para = doc.elements[0];
    expect(para.type).toBe("paragraph");
    if (para.type === "paragraph") {
      const run = para.runs[0];
      expect(run.text).toBe("Formatted text");
      expect(run.bold).toBe(true);
      expect(run.italic).toBe(true);
      expect(run.underline).toBe(true);
      expect(run.strikethrough).toBe(true);
      expect(run.fontSize).toBe(14);
      expect(run.fontFamily).toBe("Arial");
      expect(run.color).toBe("#FF0000");
    }
  }
});

test("parseDocxDocument handles valid DOCX", async () => {
  const docxBuffer = await createMinimalDocx(simpleDocumentXml);
  const result = await parseDocxDocument(docxBuffer);

  expect(result.metadata.title).toBe("Test Document");
  expect(result.elements).toHaveLength(3);
});

test("parseDocx handles empty body", async () => {
  const emptyDocumentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
  </w:body>
</w:document>`;

  const docxBuffer = await createMinimalDocx(emptyDocumentXml);
  const effect = parseDocx(docxBuffer);
  const result = await Effect.runPromise(Effect.either(effect));

  expect(result._tag).toBe("Right");
  if (result._tag === "Right") {
    const doc = result.right;
    expect(doc.elements).toHaveLength(0);
  }
});

test("parseDocx handles nested runs in paragraph", async () => {
  const nestedRunsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Part 1 </w:t>
      </w:r>
      <w:r>
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>Part 2 </w:t>
      </w:r>
      <w:r>
        <w:t>Part 3</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

  const docxBuffer = await createMinimalDocx(nestedRunsXml);
  const effect = parseDocx(docxBuffer);
  const result = await Effect.runPromise(Effect.either(effect));

  expect(result._tag).toBe("Right");
  if (result._tag === "Right") {
    const doc = result.right;
    const para = doc.elements[0];
    expect(para.type).toBe("paragraph");
    if (para.type === "paragraph") {
      expect(para.runs).toHaveLength(3);
      expect(para.runs[0].text).toBe("Part 1 ");
      expect(para.runs[0].bold).toBeFalsy();
      expect(para.runs[1].text).toBe("Part 2 ");
      expect(para.runs[1].bold).toBe(true);
      expect(para.runs[2].text).toBe("Part 3");
      expect(para.runs[2].bold).toBeFalsy();
    }
  }
});

test("parseDocx handles multiple heading levels", async () => {
  const headingsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
      </w:pPr>
      <w:r>
        <w:t>H1</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading2"/>
      </w:pPr>
      <w:r>
        <w:t>H2</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading3"/>
      </w:pPr>
      <w:r>
        <w:t>H3</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

  const docxBuffer = await createMinimalDocx(headingsXml);
  const effect = parseDocx(docxBuffer);
  const result = await Effect.runPromise(Effect.either(effect));

  expect(result._tag).toBe("Right");
  if (result._tag === "Right") {
    const doc = result.right;
    expect(doc.elements).toHaveLength(3);

    const h1 = doc.elements[0];
    expect(h1.type).toBe("heading");
    if (h1.type === "heading") {
      expect(h1.level).toBe(1);
      expect(h1.runs[0].text).toBe("H1");
    }

    const h2 = doc.elements[1];
    expect(h2.type).toBe("heading");
    if (h2.type === "heading") {
      expect(h2.level).toBe(2);
      expect(h2.runs[0].text).toBe("H2");
    }

    const h3 = doc.elements[2];
    expect(h3.type).toBe("heading");
    if (h3.type === "heading") {
      expect(h3.level).toBe(3);
      expect(h3.runs[0].text).toBe("H3");
    }
  }
});
