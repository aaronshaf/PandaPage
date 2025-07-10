import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { JSDOM } from "jsdom";
import { addStyles } from "./styles";

describe("Styles", () => {
  let dom: JSDOM;
  let originalDocument: Document;

  beforeEach(() => {
    // Save the original document
    originalDocument = global.document;

    // Create new JSDOM instance and set as global
    dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>");
    global.document = dom.window.document as any;
  });

  afterEach(() => {
    // Restore original document
    global.document = originalDocument;
  });

  describe("addStyles", () => {
    it("should add styles to document head", () => {
      expect(document.head.children.length).toBe(0);

      addStyles();

      expect(document.head.children.length).toBe(1);
      const styleElement = document.head.children[0] as HTMLStyleElement;
      expect(styleElement.tagName).toBe("STYLE");
      expect(styleElement.id).toBe("browser-document-viewer-styles");
    });

    it("should not add styles if they already exist", () => {
      // First call should add styles
      addStyles();
      expect(document.head.children.length).toBe(1);

      // Second call should not add duplicate styles
      addStyles();
      expect(document.head.children.length).toBe(1);

      const styleElement = document.head.children[0] as HTMLStyleElement;
      expect(styleElement.id).toBe("browser-document-viewer-styles");
    });

    it("should include page styles", () => {
      addStyles();

      const styleElement = document.head.children[0] as HTMLStyleElement;
      const styles = styleElement.textContent;

      expect(styles).toContain(".page");
      expect(styles).toContain("position: relative");
      expect(styles).toContain("box-sizing: border-box");
    });

    it("should include page content styles", () => {
      addStyles();

      const styleElement = document.head.children[0] as HTMLStyleElement;
      const styles = styleElement.textContent;

      expect(styles).toContain(".page-content");
      expect(styles).toContain("position: relative");
      expect(styles).toContain("box-sizing: border-box");
    });

    it("should include footer styles", () => {
      addStyles();

      const styleElement = document.head.children[0] as HTMLStyleElement;
      const styles = styleElement.textContent;

      expect(styles).toContain(".footer");
      expect(styles).toContain("position: absolute");
      expect(styles).toContain("bottom: 0");
      expect(styles).toContain("left: 1in");
      expect(styles).toContain("right: 1in");
      expect(styles).toContain("padding-bottom: 0.5in");
    });

    it("should include footnote reference styles", () => {
      addStyles();

      const styleElement = document.head.children[0] as HTMLStyleElement;
      const styles = styleElement.textContent;

      expect(styles).toContain(".footnote-reference");
      expect(styles).toContain("color: #3b82f6");
      expect(styles).toContain("text-decoration: none");
      expect(styles).toContain("font-weight: 500");
      expect(styles).toContain(".footnote-reference:hover");
      expect(styles).toContain("text-decoration: underline");
    });

    it("should include footnote styles", () => {
      addStyles();

      const styleElement = document.head.children[0] as HTMLStyleElement;
      const styles = styleElement.textContent;

      expect(styles).toContain(".footnote");
      expect(styles).toContain("margin-top: 6pt");
      expect(styles).toContain("background-color: transparent");
      expect(styles).toContain("font-size: 10pt");
      expect(styles).toContain("line-height: 14pt");
    });

    it("should include first footnote special styles", () => {
      addStyles();

      const styleElement = document.head.children[0] as HTMLStyleElement;
      const styles = styleElement.textContent;

      expect(styles).toContain(".footnote:first-of-type");
      expect(styles).toContain("margin-top: 20pt");
      expect(styles).toContain("border-top: 1px solid #ccc");
      expect(styles).toContain("padding-top: 8pt");
    });

    it("should include footnote content styles", () => {
      addStyles();

      const styleElement = document.head.children[0] as HTMLStyleElement;
      const styles = styleElement.textContent;

      expect(styles).toContain(".footnote-content");
      expect(styles).toContain("display: flex");
      expect(styles).toContain("gap: 0.5rem");

      expect(styles).toContain(".footnote-number");
      expect(styles).toContain("font-weight: 600");
      expect(styles).toContain("color: #374151");
      expect(styles).toContain("min-width: 1.5rem");
      expect(styles).toContain("flex-shrink: 0");

      expect(styles).toContain(".footnote-text");
      expect(styles).toContain("flex: 1");
    });

    it("should include bookmark anchor styles", () => {
      addStyles();

      const styleElement = document.head.children[0] as HTMLStyleElement;
      const styles = styleElement.textContent;

      expect(styles).toContain(".bookmark-anchor");
      expect(styles).toContain("display: inline-block");
      expect(styles).toContain("width: 0");
      expect(styles).toContain("height: 0");
      expect(styles).toContain("overflow: hidden");
    });

    it("should include print media query", () => {
      addStyles();

      const styleElement = document.head.children[0] as HTMLStyleElement;
      const styles = styleElement.textContent;

      expect(styles).toContain("@media print");
      expect(styles).toContain("page-break-after: always");
      expect(styles).toContain("margin: 0");
      expect(styles).toContain("box-shadow: none");
    });

    it("should handle case where document.getElementById returns existing element", () => {
      // Manually add an element with the same ID
      const existingStyle = document.createElement("style");
      existingStyle.id = "browser-document-viewer-styles";
      existingStyle.textContent = "existing styles";
      document.head.appendChild(existingStyle);

      expect(document.head.children.length).toBe(1);

      addStyles();

      // Should not add another style element
      expect(document.head.children.length).toBe(1);
      const styleElement = document.head.children[0] as HTMLStyleElement;
      expect(styleElement.textContent).toBe("existing styles");
    });
  });
});
