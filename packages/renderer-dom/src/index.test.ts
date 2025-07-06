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
  expect(result).toContain('<h1 class="mb-4 text-4xl font-bold">');
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
  expect(result).toContain('<h1 class="mb-4 text-4xl font-bold">H1</h1>');
  expect(result).toContain('<h2 class="mb-4 text-3xl font-bold">H2</h2>');
  expect(result).toContain('<h3 class="mb-4 text-2xl font-semibold">H3</h3>');
  expect(result).toContain('<h4 class="mb-4 text-xl font-semibold">H4</h4>');
  expect(result).toContain('<h5 class="mb-4 text-lg font-medium">H5</h5>');
  expect(result).toContain('<h6 class="mb-4 text-base font-medium">H6</h6>');
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
  expect(result).toContain('<p class="mb-4">');
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
  expect(result).toContain('Normal <span class="font-bold">bold</span>');
  expect(result).toContain('<span class="italic">italic</span>');
  expect(result).toContain('<span class="underline">underline</span>');
  expect(result).toContain('<span class="line-through">strikethrough</span>');
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
  expect(result).toContain('<span class="font-bold italic">bold+italic</span>');
  expect(result).toContain('<span class="font-bold italic underline line-through">all</span>');
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
  expect(result).toContain('Visit <a href="https://example.com"');
  expect(result).toContain('target="_blank"');
  expect(result).toContain('>example.com</a> for more');
});

test("renderToHtml adds security attributes to links", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "example.com", link: "https://example.com" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('target="_blank"');
  expect(result).toContain('rel="noopener noreferrer"');
  expect(result).toContain('onclick="return confirmDocumentLink(this.href)"');
});

test("renderToHtml includes security script in full document", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "example.com", link: "https://example.com" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc, { includeStyles: true });
  expect(result).toContain('function confirmDocumentLink(url)');
  expect(result).toContain('Security Warning');
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
  expect(result).toContain('<a href="https://example.com"');
  expect(result).toContain('class="font-bold"');
  expect(result).toContain('target="_blank"');
  expect(result).toContain('>bold link</a>');
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
  expect(result).toContain('style="font-family: Arial"');
  expect(result).toContain('style="font-size: 18pt"');
  expect(result).toContain('style="color: #FF0000"');
  expect(result).toContain('style="background-color: #FFFF00"');
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
  expect(result).toContain('<li class="mb-4 ml-0">Item 1</li>');
  expect(result).toContain('<li class="mb-4 ml-0">Item 2</li>');
  expect(result).toContain('<li class="mb-4 ml-8">Nested item</li>');
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
  expect(result).toContain('<li class="mb-4 ml-0" value="">First</li>');
  expect(result).toContain('<li class="mb-4 ml-0" value="">Second</li>');
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
  expect(result).toContain('<li class="mb-4 ml-0">Bullet 1</li>');
  expect(result).toContain('<li class="mb-4 ml-0" value="">Number 1</li>');
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
  expect(result).toContain('<div class="page-break" style="page-break-after: always;"></div>');
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
  expect(result).toContain('<table class="border-collapse mb-4">');
  expect(result).toContain('<tr>');
  expect(result).toContain('<th class="border px-4 py-2 font-semibold"><p class="mb-4">Header 1</p></th>');
  expect(result).toContain('<th class="border px-4 py-2 font-semibold"><p class="mb-4">Header 2</p></th>');
  expect(result).toContain('<td class="border px-4 py-2"><p class="mb-4">Cell 1</p></td>');
  expect(result).toContain('<td class="border px-4 py-2"><p class="mb-4">Cell 2</p></td>');
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
  expect(result).toContain('<th class="border px-4 py-2 font-semibold"></th>');
  expect(result).toContain('<th class="border px-4 py-2 font-semibold"><p class="mb-4">Content</p></th>');
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
  expect(result).toContain('<th class="border px-4 py-2 font-semibold"><p class="mb-4">Line 1</p><p class="mb-4">Line 2</p></th>');
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
  expect(result).toContain("<style>");
  expect(result).toContain('<p class="mb-4">Content</p>');
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
  expect(result).toContain('<title>Test Document</title>');
  expect(result).toContain("<!DOCTYPE html>");
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
  expect(result).toContain('<p class="mb-4">Content</p>');
});

test("renderToHtml handles superscript formatting", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "E=mc" },
          { text: "2", superscript: true },
          { text: " is Einstein's equation" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('E=mc<sup>2</sup> is Einstein&#039;s equation');
});

test("renderToHtml handles subscript formatting", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "H" },
          { text: "2", subscript: true },
          { text: "O is water" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('H<sub>2</sub>O is water');
});

test("renderToHtml handles formatted superscript", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "x", superscript: true, bold: true, color: "#FF0000" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<span class="font-bold" style="color: #FF0000"><sup>x</sup></span>');
});

test("renderToHtml handles formatted subscript", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "n", subscript: true, italic: true, backgroundColor: "#FFFF00" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<span class="italic" style="background-color: #FFFF00"><sub>n</sub></span>');
});

test("renderToHtml handles superscript with links", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "ref", superscript: true, link: "https://example.com", bold: true }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<a href="https://example.com"');
  expect(result).toContain('target="_blank"');
  expect(result).toContain('class="font-bold"');
  expect(result).toContain('><sup>ref</sup></a>');
});

test("renderToHtml handles subscript with links", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "note", subscript: true, link: "https://example.com" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<a href="https://example.com"');
  expect(result).toContain('target="_blank"');
  expect(result).toContain('><sub>note</sub></a>');
});

test("renderToHtml handles background colors", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "yellow highlight", backgroundColor: "#FFFF00" },
          { text: " and " },
          { text: "green background", backgroundColor: "#00FF00" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('style="background-color: #FFFF00"');
  expect(result).toContain('style="background-color: #00FF00"');
});

test("renderToHtml handles complex color combinations", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { text: "inverse video", color: "#FFFFFF", backgroundColor: "#000000" }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('style="color: #FFFFFF; background-color: #000000"');
});

test("renderToHtml handles multiple style combinations", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [
          { 
            text: "complex", 
            bold: true, 
            italic: true, 
            superscript: true,
            color: "#FF0000",
            backgroundColor: "#FFFF00",
            fontSize: 14,
            fontFamily: "Arial"
          }
        ]
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<span class="font-bold italic" style="font-size: 14pt; font-family: Arial; color: #FF0000; background-color: #FFFF00"><sup>complex</sup></span>');
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
  expect(result).toContain('<p class="mb-4">Known</p>');
  expect(result).toContain('<p class="mb-4">After</p>');
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
  expect(result).toContain('<h1 class="mb-4 text-4xl font-bold">Title</h1>');
  expect(result).toContain('<p class="mb-4">Intro paragraph</p>');
  expect(result).toContain('<li class="mb-4 ml-0">List item</li>');
  expect(result).toContain('<div class="page-break" style="page-break-after: always;"></div>');
  expect(result).toContain('<h2 class="mb-4 text-3xl font-bold">Section</h2>');
});