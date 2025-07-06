import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import { parseDocumentXml } from "./docx-reader";
import { FieldCode } from "./form-field-parser";

describe("DOCX Reader - Field Integration", () => {
  test("should parse paragraphs with form fields", async () => {
    const documentXml = `<?xml version="1.0"?>
      <w:document>
        <w:body>
          <w:p>
            <w:r><w:t>Name: </w:t></w:r>
            <w:r>
              <w:fldChar w:fldCharType="begin"/>
            </w:r>
            <w:r>
              <w:instrText>FORMTEXT "Enter your name"</w:instrText>
            </w:r>
            <w:r>
              <w:fldChar w:fldCharType="separate"/>
            </w:r>
            <w:r>
              <w:t>John Doe</w:t>
            </w:r>
            <w:r>
              <w:fldChar w:fldCharType="end"/>
            </w:r>
          </w:p>
        </w:body>
      </w:document>`;

    const paragraphs = await Effect.runPromise(parseDocumentXml(documentXml));
    
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]?.runs).toHaveLength(2); // "Name: " and "John Doe"
    expect(paragraphs[0]?.runs[0]?.text).toBe("Name: ");
    expect(paragraphs[0]?.runs[1]?.text).toBe("John Doe");
    
    // Check fields
    expect(paragraphs[0]?.fields).toBeDefined();
    expect(paragraphs[0]?.fields).toHaveLength(1);
    expect(paragraphs[0]?.fields?.[0]?.type).toBe(FieldCode.FORMTEXT);
    expect(paragraphs[0]?.fields?.[0]?.result).toBe("John Doe");
    expect(paragraphs[0]?.fields?.[0]?.properties?.defaultText).toBe("Enter your name");
  });

  test("should parse paragraphs with multiple fields", async () => {
    const documentXml = `<?xml version="1.0"?>
      <w:document>
        <w:body>
          <w:p>
            <w:r><w:t>Meeting Date: </w:t></w:r>
            <w:r><w:fldChar w:fldCharType="begin"/></w:r>
            <w:r><w:instrText>DATE \\@ "MM/dd/yyyy"</w:instrText></w:r>
            <w:r><w:fldChar w:fldCharType="separate"/></w:r>
            <w:r><w:t>12/25/2023</w:t></w:r>
            <w:r><w:fldChar w:fldCharType="end"/></w:r>
            <w:r><w:t>, Attendees: </w:t></w:r>
            <w:r><w:fldChar w:fldCharType="begin"/></w:r>
            <w:r><w:instrText>FORMTEXT</w:instrText></w:r>
            <w:r><w:fldChar w:fldCharType="end"/></w:r>
          </w:p>
        </w:body>
      </w:document>`;

    const paragraphs = await Effect.runPromise(parseDocumentXml(documentXml));
    
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs?.[0]?.fields).toBeDefined();
    expect(paragraphs?.[0]?.fields).toHaveLength(2);
    
    // First field - DATE
    expect(paragraphs?.[0]?.fields!?.[0]?.type).toBe(FieldCode.DATE);
    expect(paragraphs?.[0]?.fields!?.[0]?.result).toBe("12/25/2023");
    expect(paragraphs?.[0]?.fields!?.[0]?.properties?.["@"]).toBe("MM/dd/yyyy");
    
    // Second field - FORMTEXT
    expect(paragraphs?.[0]?.fields!?.[1]?.type).toBe(FieldCode.FORMTEXT);
    expect(paragraphs?.[0]?.fields!?.[1]?.result).toBeUndefined();
  });

  test("should handle paragraphs without fields", async () => {
    const documentXml = `<?xml version="1.0"?>
      <w:document>
        <w:body>
          <w:p>
            <w:r><w:t>This is a regular paragraph without any fields.</w:t></w:r>
          </w:p>
        </w:body>
      </w:document>`;

    const paragraphs = await Effect.runPromise(parseDocumentXml(documentXml));
    
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs?.[0]?.fields).toBeUndefined();
    expect(paragraphs?.[0]?.runs?.[0]?.text).toBe("This is a regular paragraph without any fields.");
  });

  test("should parse complex field with formatting", async () => {
    const documentXml = `<?xml version="1.0"?>
      <w:document>
        <w:body>
          <w:p>
            <w:pPr>
              <w:pStyle w:val="Heading1"/>
            </w:pPr>
            <w:r>
              <w:t>Document Title: </w:t>
            </w:r>
            <w:r>
              <w:rPr>
                <w:b w:val="1"/>
              </w:rPr>
              <w:fldChar w:fldCharType="begin"/>
            </w:r>
            <w:r>
              <w:instrText>TITLE</w:instrText>
            </w:r>
            <w:r>
              <w:fldChar w:fldCharType="separate"/>
            </w:r>
            <w:r>
              <w:rPr>
                <w:b w:val="1"/>
              </w:rPr>
              <w:t>Meeting Minutes Template</w:t>
            </w:r>
            <w:r>
              <w:fldChar w:fldCharType="end"/>
            </w:r>
          </w:p>
        </w:body>
      </w:document>`;

    const paragraphs = await Effect.runPromise(parseDocumentXml(documentXml));
    
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs?.[0]?.style).toBe("Heading1");
    expect(paragraphs?.[0]?.fields).toBeDefined();
    expect(paragraphs?.[0]?.fields).toHaveLength(1);
    expect(paragraphs?.[0]?.fields!?.[0]?.type).toBe(FieldCode.TITLE);
    expect(paragraphs?.[0]?.fields!?.[0]?.result).toBe("Meeting Minutes Template");
    
    // Check that the text with formatting is preserved
    expect(paragraphs?.[0]?.runs?.[1]?.text).toBe("Meeting Minutes Template");
    expect(paragraphs?.[0]?.runs?.[1]?.bold).toBe(true);
  });

  test("should handle page numbering fields", async () => {
    const documentXml = `<?xml version="1.0"?>
      <w:document>
        <w:body>
          <w:p>
            <w:r><w:t>Page </w:t></w:r>
            <w:r><w:fldChar w:fldCharType="begin"/></w:r>
            <w:r><w:instrText>PAGE</w:instrText></w:r>
            <w:r><w:fldChar w:fldCharType="separate"/></w:r>
            <w:r><w:t>1</w:t></w:r>
            <w:r><w:fldChar w:fldCharType="end"/></w:r>
            <w:r><w:t> of </w:t></w:r>
            <w:r><w:fldChar w:fldCharType="begin"/></w:r>
            <w:r><w:instrText>NUMPAGES</w:instrText></w:r>
            <w:r><w:fldChar w:fldCharType="separate"/></w:r>
            <w:r><w:t>10</w:t></w:r>
            <w:r><w:fldChar w:fldCharType="end"/></w:r>
          </w:p>
        </w:body>
      </w:document>`;

    const paragraphs = await Effect.runPromise(parseDocumentXml(documentXml));
    
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs?.[0]?.fields).toHaveLength(2);
    
    expect(paragraphs?.[0]?.fields!?.[0]?.type).toBe(FieldCode.PAGE);
    expect(paragraphs?.[0]?.fields!?.[0]?.result).toBe("1");
    
    expect(paragraphs?.[0]?.fields!?.[1]?.type).toBe(FieldCode.NUMPAGES);
    expect(paragraphs?.[0]?.fields!?.[1]?.result).toBe("10");
  });
});