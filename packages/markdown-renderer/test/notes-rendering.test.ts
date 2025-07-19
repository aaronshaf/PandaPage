import { describe, test, expect } from "bun:test";
import { renderToMarkdownImproved } from "../src/improved-renderer";
import type { ParsedDocument } from "@browser-document-viewer/parser";

describe("Notes Rendering", () => {
  test("should render footnote references and content", () => {
    const document: ParsedDocument = {
      metadata: {},
      elements: [
        {
          type: "paragraph",
          runs: [
            { text: "This is a paragraph with a footnote" },
            { text: "1", superscript: true, _footnoteRef: "1" },
            { text: " reference." },
          ],
          images: [],
        },
        {
          type: "footnote",
          id: "1",
          elements: [
            {
              type: "paragraph",
              runs: [{ text: "This is the footnote content." }],
              images: [],
            },
          ],
        },
      ],
    };

    const markdown = renderToMarkdownImproved(document, { includeMetadata: false });
    
    expect(markdown).toContain("This is a paragraph with a footnote[^1] reference.");
    expect(markdown).toContain("\n---\n\n## Footnotes\n\n[^1]: This is the footnote content.");
  });

  test("should render endnote references and content", () => {
    const document: ParsedDocument = {
      metadata: {},
      elements: [
        {
          type: "paragraph",
          runs: [
            { text: "This is a paragraph with an endnote" },
            { text: "1", superscript: true, _endnoteRef: "1" },
            { text: " reference." },
          ],
          images: [],
        },
        {
          type: "endnote",
          id: "1",
          elements: [
            {
              type: "paragraph",
              runs: [{ text: "This is the endnote content." }],
              images: [],
            },
          ],
        },
      ],
    };

    const markdown = renderToMarkdownImproved(document, { includeMetadata: false });
    
    expect(markdown).toContain("This is a paragraph with an endnote[^endnote1] reference.");
    expect(markdown).toContain("\n---\n\n## Endnotes\n\n[^endnote1]: This is the endnote content.");
  });

  test("should render both footnotes and endnotes", () => {
    const document: ParsedDocument = {
      metadata: {},
      elements: [
        {
          type: "paragraph",
          runs: [
            { text: "This has a footnote" },
            { text: "1", superscript: true, _footnoteRef: "1" },
            { text: " and an endnote" },
            { text: "1", superscript: true, _endnoteRef: "1" },
            { text: "." },
          ],
          images: [],
        },
        {
          type: "footnote",
          id: "1",
          elements: [
            {
              type: "paragraph",
              runs: [{ text: "First footnote." }],
              images: [],
            },
          ],
        },
        {
          type: "endnote",
          id: "1",
          elements: [
            {
              type: "paragraph",
              runs: [{ text: "First endnote." }],
              images: [],
            },
          ],
        },
      ],
    };

    const markdown = renderToMarkdownImproved(document, { includeMetadata: false });
    
    expect(markdown).toContain("This has a footnote[^1] and an endnote[^endnote1].");
    expect(markdown).toContain("## Footnotes");
    expect(markdown).toContain("[^1]: First footnote.");
    expect(markdown).toContain("## Endnotes");
    expect(markdown).toContain("[^endnote1]: First endnote.");
  });

  test("should handle notes with multiple paragraphs", () => {
    const document: ParsedDocument = {
      metadata: {},
      elements: [
        {
          type: "paragraph",
          runs: [
            { text: "Text with footnote" },
            { text: "1", superscript: true, _footnoteRef: "1" },
            { text: "." },
          ],
          images: [],
        },
        {
          type: "footnote",
          id: "1",
          elements: [
            {
              type: "paragraph",
              runs: [{ text: "First paragraph of footnote." }],
              images: [],
            },
            {
              type: "paragraph",
              runs: [{ text: "Second paragraph of footnote." }],
              images: [],
            },
          ],
        },
      ],
    };

    const markdown = renderToMarkdownImproved(document, { includeMetadata: false });
    
    expect(markdown).toContain("Text with footnote[^1].");
    expect(markdown).toContain("[^1]: First paragraph of footnote.\nSecond paragraph of footnote.");
  });

  test("should handle document without notes", () => {
    const document: ParsedDocument = {
      metadata: {},
      elements: [
        {
          type: "paragraph",
          runs: [{ text: "Simple paragraph without notes." }],
          images: [],
        },
      ],
    };

    const markdown = renderToMarkdownImproved(document, { includeMetadata: false });
    
    expect(markdown).toBe("Simple paragraph without notes.");
    expect(markdown).not.toContain("## Footnotes");
    expect(markdown).not.toContain("## Endnotes");
  });
});