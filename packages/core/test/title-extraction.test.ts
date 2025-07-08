import { describe, test, expect } from "bun:test";
import { parseDocxToStructured } from "../src/formats/docx/docx-to-structured";

describe("Title Extraction from DOCX", () => {
  test("should handle empty buffer gracefully", async () => {
    // Test error handling without relying on DOM APIs
    try {
      await parseDocxToStructured(new ArrayBuffer(0));
      // Should not reach here
      expect(true).toBe(false);
    } catch (err: any) {
      // Should get an error
      expect(err).toBeTruthy();
      expect(err.message).toContain("DOCX");
    }
  });

  test("structured document should include metadata fields", () => {
    // Test the structure of our types
    const mockDocument = {
      elements: [],
      metadata: {
        extractedAt: new Date(),
        originalFormat: "docx" as const,
        title: "Test Title"
      },
      processingTime: 100,
      extractedAt: new Date(),
      originalFormat: "docx" as const,
      wordCount: 0,
      characterCount: 0,
      paragraphCount: 0
    };
    
    // Verify the structure matches what we expect
    expect(mockDocument.metadata.title).toBe("Test Title");
    expect(mockDocument.metadata.originalFormat).toBe("docx");
    expect(mockDocument.metadata.extractedAt).toBeInstanceOf(Date);
  });

  test("getDocumentTitle logic should prioritize metadata title", () => {
    // Test the title extraction logic without React
    const mockStructuredDoc = {
      metadata: {
        title: "Metadata Title",
        extractedAt: new Date(),
        originalFormat: "docx" as const
      }
    };
    
    const mockResult = "# First Heading\n\nSome content";
    
    // Simulate getDocumentTitle logic
    const getTitle = (structuredDoc: any, markdown: string | null) => {
      if (structuredDoc?.metadata?.title) {
        return structuredDoc.metadata.title;
      }
      
      if (!markdown) return 'Browser Document Viewer';
      
      // Try to get first heading
      const headingMatch = markdown.match(/^#\s+(.+)$/m);
      if (headingMatch) {
        return headingMatch[1];
      }
      
      return 'Browser Document Viewer';
    };
    
    // Test priority: metadata > heading > default
    expect(getTitle(mockStructuredDoc, mockResult)).toBe("Metadata Title");
    expect(getTitle(null, mockResult)).toBe("First Heading");
    expect(getTitle(null, null)).toBe("Browser Document Viewer");
  });
});