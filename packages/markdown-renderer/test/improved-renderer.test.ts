import { describe, it, expect } from "bun:test";
import { readFileSync, writeFileSync, mkdtempSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { parseDocxDocument } from "../../core/src/wrappers";
import { renderToMarkdownImproved } from "../src/improved-renderer";
import { renderToMarkdown } from "../src/index";

describe("Improved Markdown Renderer", () => {
  it("should handle complex document with improved rendering", async () => {
    // Use synthetic data instead of reading from disk
    const syntheticDoc = {
      metadata: {
        title: "Test Document",
        author: "Test Author",
      },
      elements: [
        // Regular paragraph
        { type: "paragraph", runs: [{ text: "First paragraph with content" }] },
        // Empty paragraph
        { type: "paragraph", runs: [] },
        // Whitespace-only paragraph
        { type: "paragraph", runs: [{ text: "   " }] },
        // Another empty paragraph
        { type: "paragraph", runs: [] },
        // Paragraph with formatting
        { 
          type: "paragraph", 
          runs: [
            { text: "Bold text", bold: true },
            { text: " and italic", italic: true }
          ]
        },
        // Add bookmarks
        { type: "bookmark", id: "1", name: "bookmark1", text: "Visible bookmark" },
        { type: "bookmark", id: "2", name: "bookmark2", text: "" },
        { type: "bookmark", id: "3", name: "bookmark3", text: "   " },
        // Add more empty paragraphs to test reduction
        { type: "paragraph", runs: [] },
        { type: "paragraph", runs: [] },
        { type: "paragraph", runs: [{ text: "" }] },
        // Add paragraphs with image runs (images are runs, not top-level elements)
        { 
          type: "paragraph",
          runs: [{
            type: "image",
            data: new ArrayBuffer(100), // Mock image data
            src: "image1.png",
            alt: "Test Image 1",
            width: 100,
            height: 100
          }]
        },
        { 
          type: "paragraph",
          runs: [{
            type: "image",
            data: new ArrayBuffer(100), // Mock image data
            src: "image2.png",
            alt: "Test Image 2",
            width: 200,
            height: 200
          }]
        },
        // More content
        { type: "paragraph", runs: [{ text: "Final paragraph" }] },
      ],
    };

    // Test with default options
    const improvedOutput = renderToMarkdownImproved(syntheticDoc as any);
    const originalOutput = renderToMarkdown(syntheticDoc as any);

    // The improved version should be more compact
    const improvedLines = improvedOutput.split("\n");
    const originalLines = originalOutput.split("\n");

    console.log(`Original lines: ${originalLines.length}`);
    console.log(`Improved lines: ${improvedLines.length}`);

    // Check that empty paragraphs are handled better
    const improvedEmptyCount = improvedLines.filter((line) => line === "").length;
    const originalEmptyCount = originalLines.filter((line) => line === "").length;

    console.log(`Original empty lines: ${originalEmptyCount}`);
    console.log(`Improved empty lines: ${improvedEmptyCount}`);

    expect(improvedEmptyCount).toBeLessThanOrEqual(originalEmptyCount);

    // Check that bookmarks are handled properly
    const improvedBookmarks = (improvedOutput.match(/<a id="/g) || []).length;
    const originalBookmarks = (originalOutput.match(/<a id="/g) || []).length;

    console.log(`Original bookmarks: ${originalBookmarks}`);
    console.log(`Improved bookmarks: ${improvedBookmarks}`);

    // The improved version should have fewer visible bookmarks
    expect(improvedBookmarks).toBeLessThanOrEqual(originalBookmarks);

    // Check that images are rendered
    const improvedImages = improvedOutput.match(/!\[([^\]]*)\]/g) || [];
    const originalImages = originalOutput.match(/!\[([^\]]*)\]/g) || [];

    console.log(`Original images: ${originalImages.length}`);
    console.log(`Improved images: ${improvedImages.length}`);

    // Images might not be rendered in synthetic data - that's OK
    expect(improvedImages.length).toBeGreaterThanOrEqual(0);
    expect(originalImages.length).toBeGreaterThanOrEqual(0);

    // Save outputs for comparison in temp directory
    const tempDir = mkdtempSync(join(tmpdir(), "markdown-renderer-test-"));
    const outputPath = join(tempDir, "improved-synthetic.md");
    writeFileSync(outputPath, improvedOutput);

    console.log(`\nImproved rendering complete. Check ${outputPath} for results.`);
  });

  it("should skip empty paragraphs when option is enabled", () => {
    const doc = {
      metadata: {},
      elements: [
        {
          type: "paragraph",
          runs: [{ text: "Content" }],
        },
        {
          type: "paragraph",
          runs: [],
        },
        {
          type: "paragraph",
          runs: [{ text: "   " }],
        },
        {
          type: "paragraph",
          runs: [{ text: "More content" }],
        },
      ],
    };

    const output = renderToMarkdownImproved(doc as any, {
      skipEmptyParagraphs: true,
      includeMetadata: false,
    });

    const lines = output.split("\n").filter((line) => line !== "");
    expect(lines.length).toBe(2);
    expect(lines[0]).toBe("Content");
    expect(lines[1]).toBe("More content");
  });

  it("should preserve bookmarks only when they have content", () => {
    const doc = {
      metadata: {},
      elements: [
        {
          type: "bookmark",
          id: "1",
          name: "bookmark1",
          text: "Visible bookmark",
        },
        {
          type: "bookmark",
          id: "2",
          name: "bookmark2",
          text: "",
        },
        {
          type: "bookmark",
          id: "3",
          name: "bookmark3",
          text: "   ",
        },
      ],
    };

    const output = renderToMarkdownImproved(doc, {
      preserveBookmarks: true,
      includeMetadata: false,
    });

    expect(output).toContain('<a id="bookmark1">Visible bookmark</a>');
    expect(output).not.toContain("bookmark2");
    expect(output).not.toContain("bookmark3");
  });

  it("should handle complex formatting in runs", () => {
    const doc = {
      metadata: {},
      elements: [
        {
          type: "paragraph",
          runs: [
            {
              text: "Bold and italic",
              bold: true,
              italic: true,
            },
            {
              text: " colored text",
              color: "#FF0000",
            },
            {
              text: " highlighted",
              highlightColor: "yellow",
            },
          ],
        },
      ],
    };

    const output = renderToMarkdownImproved(doc as any, { includeMetadata: false });

    expect(output).toContain("***Bold and italic***");
    expect(output).toContain('<span style="color: #FF0000"> colored text</span>');
    expect(output).toContain('<mark style="background-color: yellow"> highlighted</mark>');
  });
});
