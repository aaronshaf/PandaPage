import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@pandapage/parser";

test("renderToHtml handles empty document", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: []
  };
  
  const result = renderToHtml(doc);
  expect(result).toBe("");
});

test("renderToHtml renders headings", () => {
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
  
  const result = renderToHtml(doc);
  expect(result).toContain("<h1");
  expect(result).toContain("Hello World</h1>");
});

test("renderToHtml renders all heading levels", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      { type: "heading", level: 1, runs: [{ text: "H1" }] },
      { type: "heading", level: 2, runs: [{ text: "H2" }] },
      { type: "heading", level: 3, runs: [{ text: "H3" }] },
      { type: "heading", level: 4, runs: [{ text: "H4" }] },
      { type: "heading", level: 5, runs: [{ text: "H5" }] },
      { type: "heading", level: 6, runs: [{ text: "H6" }] }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain("<h1>H1</h1>");
  expect(result).toContain("<h2>H2</h2>");
  expect(result).toContain("<h3>H3</h3>");
  expect(result).toContain("<h4>H4</h4>");
  expect(result).toContain("<h5>H5</h5>");
  expect(result).toContain("<h6>H6</h6>");
});

test("renderToHtml renders paragraphs", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "This is a paragraph." }]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain("<p");
  expect(result).toContain("This is a paragraph.</p>");
});

test("renderToHtml handles text formatting", () => {
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
          { text: " and " },
          { text: "underline", underline: true },
          { text: " and " },
          { text: "strikethrough", strikethrough: true }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain("Normal <strong>bold</strong>");
  expect(result).toContain("<em>italic</em>");
  expect(result).toContain("<u>underline</u>");
  expect(result).toContain("<s>strikethrough</s>");
});

test("renderToHtml handles combined formatting", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "bold+italic", bold: true, italic: true },
          { text: " " },
          { text: "all", bold: true, italic: true, underline: true, strikethrough: true }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain("<strong><em>bold+italic</em></strong>");
  expect(result).toContain("<u><s><strong><em>all</em></strong></s></u>");
});

test("renderToHtml handles links", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "Visit " },
          { text: "example.com", link: "https://example.com" },
          { text: " for more" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('Visit <a href="https://example.com">example.com</a> for more');
});

test("renderToHtml handles formatted links", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "bold link", bold: true, link: "https://example.com" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<a href="https://example.com"><strong>bold link</strong></a>');
});

test("renderToHtml handles font styling", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "arial text", fontFamily: "Arial" },
          { text: " " },
          { text: "large text", fontSize: 18 },
          { text: " " },
          { text: "red text", color: "#FF0000" },
          { text: " " },
          { text: "highlighted", backgroundColor: "#FFFF00" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('style="font-family: Arial;"');
  expect(result).toContain('style="font-size: 18px;"');
  expect(result).toContain('style="color: #FF0000;"');
  expect(result).toContain('style="background-color: #FFFF00;"');
});

test("renderToHtml handles lists", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Item 1" }],
        listInfo: { level: 0, type: "bullet" }
      },
      {
        type: "paragraph",
        runs: [{ text: "Item 2" }],
        listInfo: { level: 0, type: "bullet" }
      },
      {
        type: "paragraph",
        runs: [{ text: "Nested item" }],
        listInfo: { level: 1, type: "bullet" }
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain("<ul>");
  expect(result).toContain("<li>Item 1</li>");
  expect(result).toContain("<li>Item 2");
  expect(result).toContain("Nested item</li>");
  expect(result).toContain("</ul>");
});

test("renderToHtml handles numbered lists", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "First" }],
        listInfo: { level: 0, type: "number" }
      },
      {
        type: "paragraph",
        runs: [{ text: "Second" }],
        listInfo: { level: 0, type: "number" }
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain("<ol>");
  expect(result).toContain("<li>First</li>");
  expect(result).toContain("<li>Second</li>");
  expect(result).toContain("</ol>");
});

test("renderToHtml handles mixed list types", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Bullet 1" }],
        listInfo: { level: 0, type: "bullet" }
      },
      {
        type: "paragraph",
        runs: [{ text: "Number 1" }],
        listInfo: { level: 0, type: "number" }
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain("<ul>");
  expect(result).toContain("</ul>");
  expect(result).toContain("<ol>");
  expect(result).toContain("</ol>");
});

test("renderToHtml handles page breaks", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Page 1" }]
      },
      {
        type: "pageBreak"
      },
      {
        type: "paragraph",
        runs: [{ text: "Page 2" }]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<div class="page-break"></div>');
});

test("renderToHtml handles tables", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "table",
        rows: [
          {
            cells: [
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Header 1" }] }] },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Header 2" }] }] }
            ]
          },
          {
            cells: [
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Cell 1" }] }] },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Cell 2" }] }] }
            ]
          }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain("<table>");
  expect(result).toContain("<tr>");
  expect(result).toContain("<td>Header 1</td>");
  expect(result).toContain("<td>Header 2</td>");
  expect(result).toContain("<td>Cell 1</td>");
  expect(result).toContain("<td>Cell 2</td>");
  expect(result).toContain("</tr>");
  expect(result).toContain("</table>");
});

test("renderToHtml handles empty table cells", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "table",
        rows: [
          {
            cells: [
              { paragraphs: [] },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Content" }] }] }
            ]
          }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain("<td></td>");
  expect(result).toContain("<td>Content</td>");
});

test("renderToHtml handles table cell spans", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "table",
        rows: [
          {
            cells: [
              { 
                paragraphs: [{ type: "paragraph", runs: [{ text: "Span cell" }] }],
                colspan: 2,
                rowspan: 2
              },
              { paragraphs: [{ type: "paragraph", runs: [{ text: "Normal" }] }] }
            ]
          }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('colspan="2"');
  expect(result).toContain('rowspan="2"');
});

test("renderToHtml handles multiple paragraphs in table cells", () => {
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
                  { type: "paragraph", runs: [{ text: "Line 2" }] }
                ] 
              }
            ]
          }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain("<td><p>Line 1</p><p>Line 2</p></td>");
});

test("renderToHtml escapes HTML entities", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Test <script>alert('xss')</script> & \"quotes\"" }]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).not.toContain("<script>");
  expect(result).toContain("&lt;script&gt;");
  expect(result).toContain("&amp;");
  expect(result).toContain("&quot;");
});

test("renderToHtml includes full document when requested", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Test Document",
      author: "Test Author",
      description: "Test description"
    },
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Content" }]
      }
    ]
  };
  
  const result = renderToHtml(doc, { includeStyles: true });
  expect(result).toContain("<!DOCTYPE html>");
  expect(result).toContain("<title>Test Document</title>");
  expect(result).toContain('<meta name="author" content="Test Author">');
  expect(result).toContain('<meta name="description" content="Test description">');
  expect(result).toContain("<style>");
  expect(result).toContain("Content");
});

test("renderToHtml handles full document with all metadata", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Test Document",
      author: "Test Author",
      description: "Test description",
      keywords: ["test", "document"],
      language: "en"
    },
    elements: []
  };
  
  const result = renderToHtml(doc, { includeStyles: true });
  expect(result).toContain('<html lang="en">');
  expect(result).toContain('<meta name="keywords" content="test,document">');
});

test("renderToHtml handles fragment output", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Test Document"
    },
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Content" }]
      }
    ]
  };
  
  const result = renderToHtml(doc, { includeStyles: false });
  expect(result).not.toContain("<!DOCTYPE html>");
  expect(result).not.toContain("<title>");
  expect(result).toContain("<p>Content</p>");
});

test("renderToHtml handles unknown element types gracefully", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      { type: "paragraph", runs: [{ text: "Known" }] },
      // @ts-ignore - Testing unknown type
      { type: "unknown", content: "test" },
      { type: "paragraph", runs: [{ text: "After" }] }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain("<p>Known</p>");
  expect(result).toContain("<p>After</p>");
  expect(result).not.toContain("unknown");
});

test("renderToHtml handles mixed content", () => {
  const doc: ParsedDocument = {
    metadata: {
      title: "Mixed Content"
    },
    elements: [
      { type: "heading", level: 1, runs: [{ text: "Title" }] },
      { type: "paragraph", runs: [{ text: "Intro paragraph" }] },
      { type: "paragraph", runs: [{ text: "List item" }], listInfo: { level: 0, type: "bullet" } },
      { type: "pageBreak" },
      { type: "heading", level: 2, runs: [{ text: "Section" }] }
    ]
  };
  
  const result = renderToHtml(doc, { includeStyles: true });
  expect(result).toContain('<title>Mixed Content</title>');
  expect(result).toContain("<h1>Title</h1>");
  expect(result).toContain("<p>Intro paragraph</p>");
  expect(result).toContain("<ul>");
  expect(result).toContain("<li>List item</li>");
  expect(result).toContain('<div class="page-break"></div>');
  expect(result).toContain("<h2>Section</h2>");
});