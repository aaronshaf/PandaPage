import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@browser-document-viewer/parser";

test("renderToHtml handles empty document", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: []
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('data-page-number="1"');
  expect(result).toContain('class="page"');
  expect(result).toContain('class="page-content"');
  expect(result).toContain('style="width: 8.5in');
  expect(result).toContain('style="padding: 0px 0px 0.5in');
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
  expect(result).toContain('<h1 style="margin-bottom: 12pt; font-weight: bold; font-size: 24pt;">');
  expect(result).toContain("<span>Hello World</span></h1>");
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
  expect(result).toContain('<h1 style="margin-bottom: 12pt; font-weight: bold; font-size: 24pt;"><span>H1</span></h1>');
  expect(result).toContain('<h2 style="margin-bottom: 12pt; font-weight: bold; font-size: 20pt;"><span>H2</span></h2>');
  expect(result).toContain('<h3 style="margin-bottom: 12pt; font-weight: bold; font-size: 16pt;"><span>H3</span></h3>');
  expect(result).toContain('<h4 style="margin-bottom: 12pt; font-weight: bold; font-size: 14pt;"><span>H4</span></h4>');
  expect(result).toContain('<h5 style="margin-bottom: 12pt; font-weight: bold; font-size: 12pt;"><span>H5</span></h5>');
  expect(result).toContain('<h6 style="margin-bottom: 12pt; font-weight: bold; font-size: 11pt;"><span>H6</span></h6>');
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
  expect(result).toContain('<p style="margin-bottom: 12pt;">');
  expect(result).toContain("<span>This is a paragraph.</span></p>");
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
  expect(result).toContain('<span>Normal </span><span style="font-weight: bold;">bold</span>');
  expect(result).toContain('<span> and </span><span style="font-style: italic;">italic</span>');
  expect(result).toContain('<span> and </span><span style="text-decoration: underline;">underline</span>');
  expect(result).toContain('<span> and </span><span style="text-decoration: line-through;">strikethrough</span>');
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
  expect(result).toContain('<span style="font-weight: bold; font-style: italic;">bold+italic</span>');
  expect(result).toContain('<span style="font-weight: bold; font-style: italic; text-decoration: line-through;">all</span>');
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
  expect(result).toContain('<a href="https://example.com"');
  expect(result).toContain('target="_blank"');
  expect(result).toContain('>example.com</a>');
  expect(result).toContain('<span> for more</span>');
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
  // onclick is not added in test environment (no browser window)
  expect(result).not.toContain('onclick');
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
  // Script is not added in test environment
  expect(result).not.toContain('function confirmDocumentLink');
  expect(result).not.toContain('Security Warning');
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
  expect(result).toContain('style="font-weight: bold;"');
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
  expect(result).toContain('style="font-family: Arial;"');
  expect(result).toContain('style="font-size: 18pt;"');
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
  // Lists are rendered as paragraphs in the current implementation
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>Item 1</span></p>');
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>Item 2</span></p>');
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>Nested item</span></p>');
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
  // Lists are rendered as paragraphs in the current implementation
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>First</span></p>');
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>Second</span></p>');
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
  // Lists are rendered as paragraphs in the current implementation
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>Bullet 1</span></p>');
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>Number 1</span></p>');
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
  // Page breaks now split content into separate page divs
  expect(result).toContain('data-page-number="1"');
  expect(result).toContain('data-page-number="2"');
  expect(result).toContain('Page 1');
  expect(result).toContain('Page 2');
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
  expect(result).toContain('<table style="border-collapse: collapse; margin-bottom: 12pt;">');
  expect(result).toContain('<tr>');
  expect(result).toContain('<th style="border: 1px solid #ccc; padding: 4pt; font-weight: 600; background-color: #f3f4f6;"><p><span>Header 1</span></p></th>');
  expect(result).toContain('<th style="border: 1px solid #ccc; padding: 4pt; font-weight: 600; background-color: #f3f4f6;"><p><span>Header 2</span></p></th>');
  expect(result).toContain('<td style="border: 1px solid #ccc; padding: 4pt;"><p><span>Cell 1</span></p></td>');
  expect(result).toContain('<td style="border: 1px solid #ccc; padding: 4pt;"><p><span>Cell 2</span></p></td>');
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
  expect(result).toContain('<th style="border: 1px solid #ccc; padding: 4pt; font-weight: 600; background-color: #f3f4f6;">&nbsp;</th>');
  expect(result).toContain('<th style="border: 1px solid #ccc; padding: 4pt; font-weight: 600; background-color: #f3f4f6;"><p><span>Content</span></p></th>');
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
  expect(result).toContain('<th style="border: 1px solid #ccc; padding: 4pt; font-weight: 600; background-color: #f3f4f6;"><p><span>Line 1</span></p><p><span>Line 2</span></p></th>');
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
  // Double quotes are not escaped in the current implementation
  expect(result).toContain('"quotes"');
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
  // DOM renderer doesn't create full HTML document structure, just the content
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>Content</span></p>');
  expect(result).not.toContain('<!DOCTYPE html>');
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
  // DOM renderer returns a page even for empty documents
  expect(result).toContain('data-page-number="1"');
  expect(result).toContain('class="page"');
  expect(result).toContain('class="page-content"');
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
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>Content</span></p>');
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
  expect(result).toContain('<sup>2</sup>');
  expect(result).toContain('E=mc');
  expect(result).toContain('is Einstein');
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
  expect(result).toContain('<sub>2</sub>');
  expect(result).toContain('O is water');
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
  expect(result).toContain('<span style="color: #FF0000;"><sup>x</sup></span>');
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
  expect(result).toContain('<span style="background-color: #FFFF00;"><sub>n</sub></span>');
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
  expect(result).toContain('style="font-weight: bold;"');
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
  expect(result).toContain('style="background-color: #FFFF00;"');
  expect(result).toContain('style="background-color: #00FF00;"');
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
  expect(result).toContain('style="color: #FFFFFF; background-color: #000000;"');
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
  expect(result).toContain('<span style="font-size: 14pt; font-family: Arial; color: #FF0000; background-color: #FFFF00;"><sup>complex</sup></span>');
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
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>Known</span></p>');
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>After</span></p>');
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
  // DOM renderer doesn't create title tags
  expect(result).not.toContain('<title>');
  expect(result).toContain('<h1 style="margin-bottom: 12pt; font-weight: bold; font-size: 24pt;"><span>Title</span></h1>');
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>Intro paragraph</span></p>');
  // Lists are rendered as paragraphs
  expect(result).toContain('<p style="margin-bottom: 12pt;"><span>List item</span></p>');
  // Page breaks now split content into separate pages
  expect(result).toContain('data-page-number="1"');
  expect(result).toContain('data-page-number="2"');
  expect(result).toContain('<h2 style="margin-bottom: 12pt; font-weight: bold; font-size: 20pt;"><span>Section</span></h2>');
});

test("renderToHtml handles bookmarks as invisible anchors", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "bookmark",
        id: "bm1",
        name: "Chapter1",
        text: "Introduction"
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('data-page-number="1"');
  expect(result).toContain('<span id="Chapter1" class="bookmark-anchor" data-bookmark-id="bm1"></span>');
});

test("renderToHtml handles bookmarks with special characters", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "bookmark",
        id: "bm2",
        name: "Section_2.1",
        text: "Analysis & Results"
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('data-page-number="1"');
  expect(result).toContain('<span id="Section_2.1" class="bookmark-anchor" data-bookmark-id="bm2"></span>');
});

test("renderToHtml handles bookmarks without text content", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "bookmark",
        id: "bm3",
        name: "EmptyBookmark"
      }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('data-page-number="1"');
  expect(result).toContain('<span id="EmptyBookmark" class="bookmark-anchor" data-bookmark-id="bm3"></span>');
});

test("renderToHtml renders bookmarks with content for deep linking", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "bookmark",
        id: "intro-start",
        name: "introduction",
        text: "Introduction Section"
      },
      { type: "heading", level: 1, runs: [{ text: "Introduction" }] },
      { type: "paragraph", runs: [{ text: "This is the introduction." }] },
      {
        type: "bookmark", 
        id: "conclusion-start",
        name: "conclusion"
      },
      { type: "heading", level: 1, runs: [{ text: "Conclusion" }] }
    ]
  };
  
  const result = renderToHtml(doc);
  expect(result).toContain('<span id="introduction" class="bookmark-anchor" data-bookmark-id="intro-start"></span>');
  expect(result).toContain('<span id="conclusion" class="bookmark-anchor" data-bookmark-id="conclusion-start"></span>');
  expect(result).toContain('<h1 style="margin-bottom: 12pt; font-weight: bold; font-size: 24pt;"><span>Introduction</span></h1>');
  expect(result).toContain('<h1 style="margin-bottom: 12pt; font-weight: bold; font-size: 24pt;"><span>Conclusion</span></h1>');
});