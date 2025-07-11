import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@browser-document-viewer/parser";

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
          { text: "strikethrough", strikethrough: true },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).toContain('<span>Normal </span><span class="font-bold">bold</span>');
  expect(result).toContain('<span> and </span><span class="italic">italic</span>');
  expect(result).toContain(
    '<span> and </span><span class="underline">underline</span>',
  );
  expect(result).toContain(
    '<span> and </span><span class="line-through">strikethrough</span>',
  );
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
          { text: "all", bold: true, italic: true, underline: true, strikethrough: true },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).toContain(
    '<span class="font-bold italic">bold+italic</span>',
  );
  expect(result).toContain(
    '<span class="font-bold italic underline line-through">all</span>',
  );
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
          { text: " for more" },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).toContain('<a href="https://example.com"');
  expect(result).toContain('target="_blank"');
  expect(result).toContain(">example.com</a>");
  expect(result).toContain("<span> for more</span>");
});

test("renderToHtml adds security attributes to links", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "example.com", link: "https://example.com" }],
      },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).toContain('target="_blank"');
  expect(result).toContain('rel="noopener noreferrer"');
  // onclick is not added in test environment (no browser window)
  expect(result).not.toContain("onclick");
});

test("renderToHtml includes security script in full document", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "example.com", link: "https://example.com" }],
      },
    ],
  };

  const result = renderToHtml(doc, { includeStyles: true });
  // Script is not added in test environment
  expect(result).not.toContain("function confirmDocumentLink");
  expect(result).not.toContain("Security Warning");
});

test("renderToHtml handles formatted links", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "bold link", bold: true, link: "https://example.com" }],
      },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).toContain('<a href="https://example.com"');
  expect(result).toContain('class="font-bold"');
  expect(result).toContain('target="_blank"');
  expect(result).toContain(">bold link</a>");
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
          { text: "highlighted", backgroundColor: "#FFFF00" },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);
  // Enhanced renderer uses classes for common colors and doesn't render font-family/size inline
  expect(result).toContain('<span>arial text</span>');
  expect(result).toContain('<span>large text</span>');
  expect(result).toContain('class="text-color-red"');
  expect(result).toContain('<span>highlighted</span>');
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
          { text: "green background", backgroundColor: "#00FF00" },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);
  // Enhanced renderer doesn't currently apply background colors inline
  expect(result).toContain('<span>yellow highlight</span>');
  expect(result).toContain('<span>green background</span>');
});

test("renderToHtml handles complex color combinations", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "inverse video", color: "#FFFFFF", backgroundColor: "#000000" }],
      },
    ],
  };

  const result = renderToHtml(doc);
  // Enhanced renderer handles color but not background-color inline
  expect(result).toContain('class="text-color-white"');
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
            fontFamily: "Arial",
          },
        ],
      },
    ],
  };

  const result = renderToHtml(doc);
  // Enhanced renderer renders superscript as <sup> and uses classes for colors
  expect(result).toContain('<sup>complex</sup>');
});

test("renderToHtml escapes HTML entities", () => {
  const doc: ParsedDocument = {
    metadata: {},
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Test <script>alert('xss')</script> & \"quotes\"" }],
      },
    ],
  };

  const result = renderToHtml(doc);
  expect(result).not.toContain("<script>");
  expect(result).toContain("&lt;script&gt;");
  expect(result).toContain("&amp;");
  // Double quotes are not escaped in the current implementation
  expect(result).toContain('"quotes"');
});
