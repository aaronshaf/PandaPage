import { test, expect } from "bun:test";
import { renderToMarkdown } from "./index";
import type { ParsedDocument } from "@browser-document-viewer/parser";

test("renderToMarkdown handles empty document", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [],
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
        runs: [{ text: "Hello World" }],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("# Hello World");
});

test("renderToMarkdown renders all heading levels", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      { type: "heading", level: 1, runs: [{ text: "H1" }] },
      { type: "heading", level: 2, runs: [{ text: "H2" }] },
      { type: "heading", level: 3, runs: [{ text: "H3" }] },
      { type: "heading", level: 4, runs: [{ text: "H4" }] },
      { type: "heading", level: 5, runs: [{ text: "H5" }] },
      { type: "heading", level: 6, runs: [{ text: "H6" }] },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("# H1\n\n## H2\n\n### H3\n\n#### H4\n\n##### H5\n\n###### H6");
});

test("renderToMarkdown renders paragraphs", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "This is a paragraph." }],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("This is a paragraph.");
});

test("renderToMarkdown includes frontmatter when requested", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Test Document",
      author: "Test Author",
    },
    elements: [],
  };

  const result = renderToMarkdown(doc, { includeFrontmatter: true });
  expect(result).toContain("---");
  expect(result).toContain('title: "Test Document"');
  expect(result).toContain('author: "Test Author"');
});

test("renderToMarkdown excludes frontmatter when disabled", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Test Document",
      author: "Test Author",
    },
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Content" }],
      },
    ],
  };

  const result = renderToMarkdown(doc, { includeFrontmatter: false });
  expect(result).not.toContain("---");
  expect(result).toBe("Content");
});

test("renderToMarkdown handles all metadata fields", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Test Document",
      author: "Test Author",
      description: "Test description",
      keywords: ["keyword1", "keyword2"],
      language: "en",
      createdDate: new Date("2024-01-01"),
      modifiedDate: new Date("2024-01-02"),
    },
    elements: [],
  };

  const result = renderToMarkdown(doc);
  expect(result).toContain('title: "Test Document"');
  expect(result).toContain('author: "Test Author"');
  expect(result).toContain('description: "Test description"');
  expect(result).toContain('keywords: ["keyword1", "keyword2"]');
  expect(result).toContain("language: en");
  expect(result).toContain("created: 2024-01-01T00:00:00.000Z");
  expect(result).toContain("modified: 2024-01-02T00:00:00.000Z");
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
          { text: "italic", italic: true },
        ],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("Normal **bold** and *italic*");
});

test("renderToMarkdown handles all text formatting combinations", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "bold+italic", bold: true, italic: true },
          { text: " " },
          { text: "underline", underline: true },
          { text: " " },
          { text: "strikethrough", strikethrough: true },
          { text: " " },
          { text: "all", bold: true, italic: true, underline: true, strikethrough: true },
        ],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("***bold+italic*** <u>underline</u> ~~strikethrough~~ ~~<u>***all***</u>~~");
});

test("renderToMarkdown handles links", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "Visit " },
          { text: "example.com", link: "https://example.com" },
          { text: " for more" },
        ],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("Visit [example.com](https://example.com) for more");
});

test("renderToMarkdown handles formatted links", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "bold link", bold: true, link: "https://example.com" }],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("[**bold link**](https://example.com)");
});

test("renderToMarkdown handles lists", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Item 1" }],
        listInfo: { level: 0, type: "bullet" },
      },
      {
        type: "paragraph",
        runs: [{ text: "Item 2" }],
        listInfo: { level: 0, type: "bullet" },
      },
      {
        type: "paragraph",
        runs: [{ text: "Nested item" }],
        listInfo: { level: 1, type: "bullet" },
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("- Item 1\n\n- Item 2\n\n  - Nested item");
});

test("renderToMarkdown handles numbered lists", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "First" }],
        listInfo: { level: 0, type: "number" },
      },
      {
        type: "paragraph",
        runs: [{ text: "Second" }],
        listInfo: { level: 0, type: "number" },
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("1. First\n\n1. Second");
});

test("renderToMarkdown handles page breaks", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Page 1" }],
      },
      {
        type: "pageBreak",
      },
      {
        type: "paragraph",
        runs: [{ text: "Page 2" }],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("Page 1\n\n---\nPage 2");
});

test("renderToMarkdown handles tables", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "table",
        rows: [
          {
            cells: [
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Header 1" }] }] },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Header 2" }] }] },
            ],
          },
          {
            cells: [
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Cell 1" }] }] },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Cell 2" }] }] },
            ],
          },
        ],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toContain("| Header 1 | Header 2 |");
  expect(result).toContain("| --- | --- |");
  expect(result).toContain("| Cell 1 | Cell 2 |");
});

test("renderToMarkdown handles empty table cells", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "table",
        rows: [
          {
            cells: [
              { paragraphs: [] },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Header" }] }] },
            ],
          },
        ],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toContain("|  | Header |");
});

test("renderToMarkdown handles multiple paragraphs in table cells", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "table",
        rows: [
          {
            cells: [
              {
                paragraphs: [
                  { type: "paragraph", runs: [{ text: "Line 1" }] },
                  { type: "paragraph", runs: [{ text: "Line 2" }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toContain("| Line 1 Line 2 |");
});

test("renderToMarkdown handles mixed content", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Mixed Content",
    },
    elements: [
      { type: "heading", level: 1, runs: [{ text: "Title" }] },
      { type: "paragraph", runs: [{ text: "Intro paragraph" }] },
      { type: "paragraph", runs: [{ text: "List item" }], listInfo: { level: 0, type: "bullet" } },
      { type: "pageBreak" },
      { type: "heading", level: 2, runs: [{ text: "Section" }] },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toContain("---");
  expect(result).toContain('title: "Mixed Content"');
  expect(result).toContain("# Title");
  expect(result).toContain("Intro paragraph");
  expect(result).toContain("- List item");
  expect(result).toContain("---"); // page break
  expect(result).toContain("## Section");
});

test("renderToMarkdown handles superscript formatting", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "E=mc" },
          { text: "2", superscript: true },
          { text: " is Einstein's equation" },
        ],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("E=mc<sup>2</sup> is Einstein's equation");
});

test("renderToMarkdown handles subscript formatting", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "H" }, { text: "2", subscript: true }, { text: "O is water" }],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("H<sub>2</sub>O is water");
});

test("renderToMarkdown handles formatted superscript", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "x", superscript: true, bold: true, italic: true }],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("<sup>***x***</sup>");
});

test("renderToMarkdown handles formatted subscript", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "n", subscript: true, underline: true, strikethrough: true }],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("<sub>~~<u>n</u>~~</sub>");
});

test("renderToMarkdown handles superscript with links", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "ref", superscript: true, link: "https://example.com", bold: true }],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("[<sup>**ref**</sup>](https://example.com)");
});

test("renderToMarkdown handles subscript with links", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "note", subscript: true, link: "https://example.com" }],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("[<sub>note</sub>](https://example.com)");
});

test("renderToMarkdown handles complex formatting combinations", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "super", superscript: true, bold: true },
          { text: " and " },
          { text: "sub", subscript: true, italic: true, underline: true },
        ],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("<sup>**super**</sup> and <sub><u>*sub*</u></sub>");
});

test("renderToMarkdown handles mixed superscript and subscript in text", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "x" },
          { text: "2", superscript: true },
          { text: " + y" },
          { text: "3", subscript: true },
          { text: " = z" },
        ],
      },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("x<sup>2</sup> + y<sub>3</sub> = z");
});

test("renderToMarkdown handles unknown element types gracefully", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      { type: "paragraph", runs: [{ text: "Known" }] },
      // @ts-ignore - Testing unknown type
      { type: "unknown", content: "test" },
      { type: "paragraph", runs: [{ text: "After" }] },
    ],
  };

  const result = renderToMarkdown(doc);
  expect(result).toBe("Known\n\nAfter");
});
