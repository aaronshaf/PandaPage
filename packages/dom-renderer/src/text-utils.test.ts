import { describe, it, expect, beforeEach } from "bun:test";
import { JSDOM } from "jsdom";
import { renderEnhancedTextRun, renderEnhancedParagraph } from "./text-utils";
import type { TextRun, Paragraph } from "@browser-document-viewer/parser";
import { ST_HighlightColor, ST_Jc } from "@browser-document-viewer/ooxml-types";

describe("Text Utils", () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>");
    document = dom.window.document;
  });

  describe("renderEnhancedTextRun", () => {
    it("should render basic text run", () => {
      const run: TextRun = {
        text: "Hello world",
      };

      const result = renderEnhancedTextRun(run, document);

      expect(result.tagName).toBe("SPAN");
      expect(result.textContent).toBe("Hello world");
      expect(result.className).toBe("");
    });

    it("should render bold text", () => {
      const run: TextRun = {
        text: "Bold text",
        bold: true,
      };

      const result = renderEnhancedTextRun(run, document);

      expect(result.style.fontWeight).toBe("bold");
      expect(result.textContent).toBe("Bold text");
    });

    it("should render italic text", () => {
      const run: TextRun = {
        text: "Italic text",
        italic: true,
      };

      const result = renderEnhancedTextRun(run, document);

      expect(result.style.fontStyle).toBe("italic");
    });

    it("should render underlined text", () => {
      const run: TextRun = {
        text: "Underlined text",
        underline: true,
      };

      const result = renderEnhancedTextRun(run, document);

      expect(result.style.textDecoration).toContain("underline");
    });

    it("should render strikethrough text", () => {
      const run: TextRun = {
        text: "Strikethrough text",
        strikethrough: true,
      };

      const result = renderEnhancedTextRun(run, document);

      expect(result.style.textDecorationLine).toBe("line-through");
    });

    it("should render superscript with advanced formatting", () => {
      const run: TextRun = {
        text: "2",
        superscript: true,
      };

      const result = renderEnhancedTextRun(run, document, true);

      expect(result.tagName).toBe("SUP");
      expect(result.textContent).toBe("2");
    });

    it("should render subscript with advanced formatting", () => {
      const run: TextRun = {
        text: "2",
        subscript: true,
      };

      const result = renderEnhancedTextRun(run, document, true);

      expect(result.tagName).toBe("SUB");
      expect(result.textContent).toBe("2");
    });

    it("should not render superscript without advanced formatting", () => {
      const run: TextRun = {
        text: "2",
        superscript: true,
      };

      const result = renderEnhancedTextRun(run, document, false);

      expect(result.tagName).toBe("SPAN");
      expect(result.textContent).toBe("2");
    });

    it("should render text effects with advanced formatting", () => {
      const run: TextRun = {
        text: "Effect text",
        shadow: true,
        outline: true,
        emboss: true,
        imprint: true,
        smallCaps: true,
        caps: true,
        doubleStrikethrough: true,
        hidden: true,
      };

      const result = renderEnhancedTextRun(run, document, true);

      expect(result.style.textShadow).toContain("-1px -1px 0 rgba(255,255,255,0.8), 1px 1px 0 rgba(0,0,0,0.3)");
      expect(result.style.color).toBe("transparent");
      expect(result.style.webkitTextStroke).toBe("1px currentColor");
      // emboss and imprint effects are handled via textShadow
      expect(result.style.fontVariant).toBe("small-caps");
      expect(result.style.textTransform).toBe("uppercase");
      expect(result.style.textDecorationLine).toBe("line-through");
      expect(result.style.display).toBe("none");
    });

    it("should render color with predefined color map", () => {
      const run: TextRun = {
        text: "Red text",
        color: "FF0000",
      };

      const result = renderEnhancedTextRun(run, document, true);

      expect(result.style.color).toBe("rgb(255, 0, 0)");
    });

    it("should render color with hex prefix", () => {
      const run: TextRun = {
        text: "Blue text",
        color: "#0070C0",
      };

      const result = renderEnhancedTextRun(run, document, true);

      expect(result.style.color).toBe("rgb(0, 112, 192)");
    });

    it("should render custom color with inline style", () => {
      const run: TextRun = {
        text: "Custom color",
        color: "#ABCDEF",
      };

      const result = renderEnhancedTextRun(run, document, true) as HTMLElement;

      // DOM converts hex to RGB format
      expect(result.style.color).toBe("rgb(171, 205, 239)");
    });

    it("should render color without hash prefix", () => {
      const run: TextRun = {
        text: "Custom color",
        color: "ABCDEF",
      };

      const result = renderEnhancedTextRun(run, document, true) as HTMLElement;

      // DOM converts hex to RGB format
      expect(result.style.color).toBe("rgb(171, 205, 239)");
    });

    it("should not render auto color", () => {
      const run: TextRun = {
        text: "Auto color",
        color: "auto",
      };

      const result = renderEnhancedTextRun(run, document, true) as HTMLElement;

      expect(result.style.color).toBe("");
    });

    it("should render highlight colors", () => {
      const run: TextRun = {
        text: "Highlighted text",
        highlightColor: ST_HighlightColor.Yellow,
      };

      const result = renderEnhancedTextRun(run, document, true);

      expect(result.style.backgroundColor).toBe("rgb(255, 255, 0)");
    });

    it("should not render none highlight", () => {
      const run: TextRun = {
        text: "No highlight",
        highlightColor: undefined,
      };

      const result = renderEnhancedTextRun(run, document, true);

      expect(result.style.backgroundColor).toBe("");
    });

    it("should render combined formatting", () => {
      const run: TextRun = {
        text: "Combined formatting",
        bold: true,
        italic: true,
        underline: true,
        color: "FF0000",
        highlightColor: ST_HighlightColor.Yellow,
      };

      const result = renderEnhancedTextRun(run, document, true);

      expect(result.style.fontWeight).toBe("bold");
      expect(result.style.fontStyle).toBe("italic");
      expect(result.style.textDecoration).toContain("underline");
      expect(result.style.color).toBe("rgb(255, 0, 0)");
      expect(result.style.backgroundColor).toBe("rgb(255, 255, 0)");
    });

    it("should render link with proper attributes", () => {
      const run: TextRun = {
        text: "Link text",
        link: "https://example.com",
        bold: true,
      };

      const result = renderEnhancedTextRun(run, document, true);

      expect(result.tagName).toBe("A");
      expect((result as HTMLAnchorElement).href).toBe("https://example.com/");
      expect((result as HTMLAnchorElement).target).toBe("_blank");
      expect((result as HTMLAnchorElement).rel).toBe("noopener noreferrer");
      expect(result.style.fontWeight).toBe("bold");
      expect(result.textContent).toBe("Link text");
    });

    it("should handle empty text", () => {
      const run: TextRun = {
        text: "",
        bold: true,
      };

      const result = renderEnhancedTextRun(run, document);

      expect(result.textContent).toBe("");
      expect(result.style.fontWeight).toBe("bold");
    });
  });

  describe("renderEnhancedParagraph", () => {
    let mockRenderTextRun: (run: TextRun) => HTMLElement;
    let mockRenderImage: (image: any) => HTMLElement;

    beforeEach(() => {
      mockRenderTextRun = (run: TextRun) => {
        const span = document.createElement("span");
        span.textContent = run.text || "";
        return span;
      };

      mockRenderImage = (image: any) => {
        const img = document.createElement("img");
        img.src = image.src || "test.jpg";
        return img;
      };
    });

    it("should render basic paragraph", () => {
      const paragraph: Paragraph = {
        type: "paragraph",
        runs: [{ text: "Hello world" }],
      };

      const result = renderEnhancedParagraph(
        paragraph,
        document,
        {},
        mockRenderTextRun,
        mockRenderImage,
      );

      expect(result.tagName).toBe("P");
      expect(result.style.marginBottom).toBe("12px");
      expect(result.children.length).toBe(1);
      expect(result.children[0]?.textContent).toBe("Hello world");
    });

    it("should render paragraph with alignment", () => {
      const paragraph: Paragraph = {
        type: "paragraph",
        runs: [{ text: "Centered text" }],
        alignment: ST_Jc.Center,
      };

      const result = renderEnhancedParagraph(
        paragraph,
        document,
        {},
        mockRenderTextRun,
        mockRenderImage,
      );

      expect(result.style.textAlign).toBe("center");
    });

    it("should render paragraph with end alignment", () => {
      const paragraph: Paragraph = {
        type: "paragraph",
        runs: [{ text: "Right text" }],
        alignment: ST_Jc.End,
      };

      const result = renderEnhancedParagraph(
        paragraph,
        document,
        {},
        mockRenderTextRun,
        mockRenderImage,
      );

      expect(result.style.textAlign).toBe("right");
    });

    it("should render paragraph with justify alignment", () => {
      const paragraph: Paragraph = {
        type: "paragraph",
        runs: [{ text: "Justified text" }],
        alignment: ST_Jc.Both,
      };

      const result = renderEnhancedParagraph(
        paragraph,
        document,
        {},
        mockRenderTextRun,
        mockRenderImage,
      );

      expect(result.style.textAlign).toBe("justify");
    });

    it("should render paragraph with heading styles", () => {
      const paragraph: Paragraph = {
        type: "paragraph",
        runs: [{ text: "Heading text" }],
        style: "Heading1",
      };

      const result = renderEnhancedParagraph(
        paragraph,
        document,
        {},
        mockRenderTextRun,
        mockRenderImage,
      );

      expect(result.style.fontSize).toBe("32px");
      expect(result.style.fontWeight).toBe("bold");
    });

    it("should render paragraph with title style", () => {
      const paragraph: Paragraph = {
        type: "paragraph",
        runs: [{ text: "Title text" }],
        style: "Title",
      };

      const result = renderEnhancedParagraph(
        paragraph,
        document,
        {},
        mockRenderTextRun,
        mockRenderImage,
      );

      expect(result.style.fontSize).toBe("32px");
      expect(result.style.fontWeight).toBe("bold");
      expect(result.style.textAlign).toBe("center");
    });

    it("should render dropcap when enabled", () => {
      const paragraph: Paragraph = {
        type: "paragraph",
        runs: [
          {
            text: "This is a long paragraph that should qualify for a dropcap because it starts with a capital letter and is substantial content.",
          },
        ],
        style: "Normal",
      };

      const result = renderEnhancedParagraph(
        paragraph,
        document,
        { enableDropcaps: true },
        mockRenderTextRun,
        mockRenderImage,
      );

      expect(result.children.length).toBe(2); // dropcap + remaining text
      const dropcap = result.children[0] as HTMLElement;
      expect(dropcap.style.float).toBe("left");
      expect(dropcap.style.fontSize).toBe("3em");
      expect(dropcap.textContent).toBe("T");

      const remainingText = result.children[1] as HTMLElement;
      expect(remainingText.textContent?.startsWith("his is a long")).toBe(true);
    });

    it("should not render dropcap for short paragraphs", () => {
      const paragraph: Paragraph = {
        type: "paragraph",
        runs: [{ text: "Short." }],
        style: "Normal",
      };

      const result = renderEnhancedParagraph(
        paragraph,
        document,
        { enableDropcaps: true },
        mockRenderTextRun,
        mockRenderImage,
      );

      expect(result.children.length).toBe(1);
      expect(result.children[0]?.textContent).toBe("Short.");
    });

    it("should not render dropcap when disabled", () => {
      const paragraph: Paragraph = {
        type: "paragraph",
        runs: [
          {
            text: "This is a long paragraph that would qualify for a dropcap but dropcaps are disabled.",
          },
        ],
        style: "Normal",
      };

      const result = renderEnhancedParagraph(
        paragraph,
        document,
        { enableDropcaps: false },
        mockRenderTextRun,
        mockRenderImage,
      );

      expect(result.children.length).toBe(1);
      expect(result.children[0]?.textContent?.startsWith("This is a long")).toBe(true);
    });

    it("should render multiple runs", () => {
      const paragraph: Paragraph = {
        type: "paragraph",
        runs: [{ text: "First run " }, { text: "Second run " }, { text: "Third run" }],
      };

      const result = renderEnhancedParagraph(
        paragraph,
        document,
        {},
        mockRenderTextRun,
        mockRenderImage,
      );

      expect(result.children.length).toBe(3);
      expect(result.children[0]?.textContent).toBe("First run ");
      expect(result.children[1]?.textContent).toBe("Second run ");
      expect(result.children[2]?.textContent).toBe("Third run");
    });

    it("should render images in paragraph", () => {
      const paragraph: Paragraph = {
        type: "paragraph",
        runs: [{ text: "Text with image" }],
        images: [
          { type: "image", data: new ArrayBuffer(0), mimeType: "image/jpeg" },
          { type: "image", data: new ArrayBuffer(0), mimeType: "image/jpeg" },
        ],
      };

      const result = renderEnhancedParagraph(
        paragraph,
        document,
        {},
        mockRenderTextRun,
        mockRenderImage,
      );

      expect(result.children.length).toBe(3); // 1 run + 2 images
      expect(result.children[1]?.tagName).toBe("IMG");
      expect(result.children[2]?.tagName).toBe("IMG");
    });

    it("should handle paragraph without runs", () => {
      const paragraph: Paragraph = {
        type: "paragraph",
        runs: [],
      };

      const result = renderEnhancedParagraph(
        paragraph,
        document,
        {},
        mockRenderTextRun,
        mockRenderImage,
      );

      expect(result.tagName).toBe("P");
      expect(result.children.length).toBe(0);
    });

    it("should handle paragraph with empty runs array", () => {
      const paragraph: Paragraph = {
        type: "paragraph",
        runs: [],
      };

      const result = renderEnhancedParagraph(
        paragraph,
        document,
        {},
        mockRenderTextRun,
        mockRenderImage,
      );

      expect(result.tagName).toBe("P");
      expect(result.children.length).toBe(0);
    });

    it("should handle dropcap with multiple runs", () => {
      const paragraph: Paragraph = {
        type: "paragraph",
        runs: [
          { text: "This is a long paragraph that should qualify for a dropcap " },
          { text: "and has multiple runs in it." },
        ],
        style: "Normal",
      };

      const result = renderEnhancedParagraph(
        paragraph,
        document,
        { enableDropcaps: true },
        mockRenderTextRun,
        mockRenderImage,
      );

      expect(result.children.length).toBe(3); // dropcap + remaining first run + second run
      const dropcap = result.children[0] as HTMLElement;
      expect(dropcap.style.float).toBe("left");
      expect(dropcap.style.fontSize).toBe("3em");
      expect(dropcap.textContent).toBe("T");
    });
  });
});
