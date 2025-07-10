import { test, expect } from "bun:test";
import { renderToHtml } from "./index";
import type { ParsedDocument } from "@browser-document-viewer/parser";

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