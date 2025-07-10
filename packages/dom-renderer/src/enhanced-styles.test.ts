import { describe, it, expect, beforeEach } from "bun:test";
import { JSDOM } from "jsdom";
import { addEnhancedStyles } from "./enhanced-styles";

describe("Enhanced Styles", () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>");
    document = dom.window.document;
  });

  it("should add enhanced styles to document head", () => {
    expect(document.head.children.length).toBe(0);

    addEnhancedStyles(document);

    expect(document.head.children.length).toBe(1);
    const styleElement = document.head.children[0] as HTMLStyleElement;
    expect(styleElement.tagName).toBe("STYLE");
  });

  it("should include document container styles", () => {
    addEnhancedStyles(document);

    const styleElement = document.head.children[0] as HTMLStyleElement;
    const styles = styleElement.textContent;

    expect(styles).toContain(".document-container");
    expect(styles).toContain("font-family: 'Times New Roman'");
    expect(styles).toContain("line-height: 1.6");
    expect(styles).toContain("color: #333");
  });

  it("should include page layout styles", () => {
    addEnhancedStyles(document);

    const styleElement = document.head.children[0] as HTMLStyleElement;
    const styles = styleElement.textContent;

    expect(styles).toContain(".page");
    expect(styles).toContain("background: white");
    expect(styles).toContain("width: 8.5in");
    expect(styles).toContain("min-height: 11in");
    expect(styles).toContain("page-break-after: always");
  });

  it("should include enhanced table styles", () => {
    addEnhancedStyles(document);

    const styleElement = document.head.children[0] as HTMLStyleElement;
    const styles = styleElement.textContent;

    expect(styles).toContain(".enhanced-table");
    expect(styles).toContain("border-collapse: collapse");
    expect(styles).toContain(".enhanced-table th");
    expect(styles).toContain(".enhanced-table td");
    expect(styles).toContain("background-color: #f5f5f5");
  });

  it("should include typography effects", () => {
    addEnhancedStyles(document);

    const styleElement = document.head.children[0] as HTMLStyleElement;
    const styles = styleElement.textContent;

    expect(styles).toContain(".dropcap");
    expect(styles).toContain("font-size: 3.5em");
    expect(styles).toContain(".text-shadow");
    expect(styles).toContain(".text-outline");
    expect(styles).toContain(".text-emboss");
    expect(styles).toContain(".text-engrave");
  });

  it("should include footnote styles", () => {
    addEnhancedStyles(document);

    const styleElement = document.head.children[0] as HTMLStyleElement;
    const styles = styleElement.textContent;

    expect(styles).toContain(".footnote-section");
    expect(styles).toContain(".footnote-item");
    expect(styles).toContain(".footnote-number");
    expect(styles).toContain(".footnote-marker");
    expect(styles).toContain("border-top: 1px solid #ccc");
  });

  it("should include image styles", () => {
    addEnhancedStyles(document);

    const styleElement = document.head.children[0] as HTMLStyleElement;
    const styles = styleElement.textContent;

    expect(styles).toContain(".image-figure");
    expect(styles).toContain(".lazy-image");
    expect(styles).toContain("filter: blur(5px)");
    expect(styles).toContain("transition: filter 0.3s");
  });

  it("should include accessibility styles", () => {
    addEnhancedStyles(document);

    const styleElement = document.head.children[0] as HTMLStyleElement;
    const styles = styleElement.textContent;

    expect(styles).toContain(".sr-only");
    expect(styles).toContain("position: absolute");
    expect(styles).toContain("clip: rect(0, 0, 0, 0)");
  });

  it("should include print media queries", () => {
    addEnhancedStyles(document);

    const styleElement = document.head.children[0] as HTMLStyleElement;
    const styles = styleElement.textContent;

    expect(styles).toContain("@media print");
    expect(styles).toContain("page-break-inside: avoid");
    expect(styles).toContain("display: table-header-group");
  });

  it("should include high contrast media query", () => {
    addEnhancedStyles(document);

    const styleElement = document.head.children[0] as HTMLStyleElement;
    const styles = styleElement.textContent;

    expect(styles).toContain("@media (prefers-contrast: high)");
    expect(styles).toContain("border: 2px solid");
  });

  it("should include focus indicators", () => {
    addEnhancedStyles(document);

    const styleElement = document.head.children[0] as HTMLStyleElement;
    const styles = styleElement.textContent;

    expect(styles).toContain(".footnote-marker:focus");
    expect(styles).toContain("a:focus");
    expect(styles).toContain("outline: 2px solid #0066cc");
    expect(styles).toContain("outline-offset: 2px");
  });
});
