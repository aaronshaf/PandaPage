import { test, expect } from "bun:test";
import { renderToMarkdown } from "./index";
import type { ParsedDocument } from "@pandapage/parser";

test("renderToMarkdown handles empty document", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: []
  };
  
  const result = renderToMarkdown(doc);
  expect(result).toBe("");
});

test("renderToMarkdown renders headings", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "heading",
        level: 1,
        runs: [{ text: "Hello World" }]
      }
    ]
  };
  
  const result = renderToMarkdown(doc);
  expect(result).toBe("# Hello World");
});

test("renderToMarkdown renders paragraphs", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "This is a paragraph." }]
      }
    ]
  };
  
  const result = renderToMarkdown(doc);
  expect(result).toBe("This is a paragraph.");
});

test("renderToMarkdown includes frontmatter when requested", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Test Document",
      author: "Test Author"
    },
    elements: []
  };
  
  const result = renderToMarkdown(doc, { includeFrontmatter: true });
  expect(result).toContain("---");
  expect(result).toContain('title: "Test Document"');
  expect(result).toContain('author: "Test Author"');
});

test("renderToMarkdown handles text formatting", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "Normal " },
          { text: "bold", bold: true },
          { text: " and " },
          { text: "italic", italic: true }
        ]
      }
    ]
  };
  
  const result = renderToMarkdown(doc);
  expect(result).toBe("Normal **bold** and *italic*");
});