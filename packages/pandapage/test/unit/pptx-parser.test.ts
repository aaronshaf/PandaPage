import { test, expect } from "bun:test";
import { convertPptxToMarkdown } from "../../src/formats/pptx/pptx-to-markdown";

// Pure function tests for PPTX parsing
  test("convertPptxToMarkdown handles empty presentation", () => {
    const emptyDoc = {
      slides: [],
      metadata: undefined
    };
    
    const result = convertPptxToMarkdown(emptyDoc);
    expect(result).toBe("");
  });

  test("convertPptxToMarkdown adds metadata title", () => {
    const doc = {
      slides: [],
      metadata: {
        title: "My Presentation"
      }
    };
    
    const result = convertPptxToMarkdown(doc);
    expect(result).toBe("# My Presentation");
  });

  test("convertPptxToMarkdown formats single slide", () => {
    const doc = {
      slides: [{
        type: "slide" as const,
        slideNumber: 1,
        title: "Slide Title",
        content: [
          { type: "title" as const, text: "Slide Title" },
          { type: "text" as const, text: "Some content" }
        ]
      }],
      metadata: undefined
    };
    
    const result = convertPptxToMarkdown(doc);
    expect(result).toContain("<!-- Slide 1 -->");
    expect(result).toContain("## Slide Title");
    expect(result).toContain("Some content");
  });

  test("convertPptxToMarkdown adds slide separators", () => {
    const doc = {
      slides: [
        {
          type: "slide" as const,
          slideNumber: 1,
          content: [{ type: "text" as const, text: "Slide 1" }]
        },
        {
          type: "slide" as const,
          slideNumber: 2,
          content: [{ type: "text" as const, text: "Slide 2" }]
        }
      ],
      metadata: undefined
    };
    
    const result = convertPptxToMarkdown(doc);
    expect(result).toContain("---"); // Separator between slides
    expect(result).toContain("Slide 1");
    expect(result).toContain("Slide 2");
  });

  test("convertPptxToMarkdown formats bullet points", () => {
    const doc = {
      slides: [{
        type: "slide" as const,
        slideNumber: 1,
        content: [
          { type: "bullet" as const, text: "Point 1", level: 0 },
          { type: "bullet" as const, text: "Point 2", level: 0 },
          { type: "bullet" as const, text: "Subpoint", level: 1 }
        ]
      }],
      metadata: undefined
    };
    
    const result = convertPptxToMarkdown(doc);
    expect(result).toContain("- Point 1");
    expect(result).toContain("- Point 2");
    expect(result).toContain("  - Subpoint"); // Indented
  });

  test("convertPptxToMarkdown handles images", () => {
    const doc = {
      slides: [{
        type: "slide" as const,
        slideNumber: 1,
        content: [
          { type: "image" as const, src: "/path/to/image.png" }
        ]
      }],
      metadata: undefined
    };
    
    const result = convertPptxToMarkdown(doc);
    expect(result).toContain("![Image](/path/to/image.png)");
  });

  test("convertPptxToMarkdown handles missing content gracefully", () => {
    const doc = {
      slides: [{
        type: "slide" as const,
        slideNumber: 1,
        content: [
          { type: "text" as const }, // No text
          { type: "bullet" as const }, // No text
          { type: "image" as const } // No src
        ]
      }],
      metadata: undefined
    };
    
    const result = convertPptxToMarkdown(doc);
    // Empty content should still show the bullet marker
    expect(result).toBe("<!-- Slide 1 -->\n- ");
  });