import { describe, test, expect } from "bun:test";
import { renderParagraph } from "../src/improved-renderer";
import type { Paragraph } from "@browser-document-viewer/parser";

describe("Drop Cap Rendering in Markdown", () => {
  test("should render paragraph with drop cap using HTML", () => {
    const paragraph: Paragraph = {
      type: "paragraph",
      runs: [
        {
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          bold: true,
          fontFamily: "Georgia",
          color: "#333333",
        },
      ],
      framePr: {
        dropCap: "drop",
        lines: 3,
      },
    };

    const result = renderParagraph(paragraph, { skipEmptyParagraphs: false });

    // Check that HTML span for drop cap is included
    expect(result).toContain('<span style="float: left; font-size: 3em; line-height: 2; font-weight: bold; margin-right: 0.1em; color: #333333;">L</span>');
    
    // Check that the rest of the text is bold with color
    expect(result).toContain('**orem ipsum dolor sit amet, consectetur adipiscing elit.**');
  });

  test("should render paragraph with margin drop cap", () => {
    const paragraph: Paragraph = {
      type: "paragraph",
      runs: [
        {
          text: "Another paragraph with margin drop cap.",
        },
      ],
      framePr: {
        dropCap: "margin",
        lines: 5,
      },
    };

    const result = renderParagraph(paragraph, { skipEmptyParagraphs: false });

    expect(result).toContain('<span style="float: left; font-size: 5em; line-height: 4; font-weight: bold; margin-right: 0.1em;">A</span>');
    expect(result).toContain("nother paragraph with margin drop cap.");
  });

  test("should not render drop cap for short text", () => {
    const paragraph: Paragraph = {
      type: "paragraph",
      runs: [
        {
          text: "",
        },
      ],
      framePr: {
        dropCap: "drop",
        lines: 3,
      },
    };

    const result = renderParagraph(paragraph, { skipEmptyParagraphs: false });

    expect(result).toBe("");
  });

  test("should not render drop cap when dropCap is none", () => {
    const paragraph: Paragraph = {
      type: "paragraph",
      runs: [
        {
          text: "No drop cap here.",
        },
      ],
      framePr: {
        dropCap: "none",
        lines: 3,
      },
    };

    const result = renderParagraph(paragraph, { skipEmptyParagraphs: false });

    expect(result).not.toContain('<span style="');
    expect(result).toBe("No drop cap here.");
  });

  test("should render normal paragraph without framePr", () => {
    const paragraph: Paragraph = {
      type: "paragraph",
      runs: [
        {
          text: "Normal paragraph without drop cap.",
        },
      ],
    };

    const result = renderParagraph(paragraph, { skipEmptyParagraphs: false });

    expect(result).not.toContain('<span style="');
    expect(result).toBe("Normal paragraph without drop cap.");
  });

  test("should handle drop cap with multiple runs", () => {
    const paragraph: Paragraph = {
      type: "paragraph",
      runs: [
        {
          text: "First run ",
          italic: true,
        },
        {
          text: "second run ",
          bold: true,
        },
        {
          text: "third run.",
        },
      ],
      framePr: {
        dropCap: "drop",
        lines: 2,
      },
    };

    const result = renderParagraph(paragraph, { skipEmptyParagraphs: false });

    expect(result).toContain('<span style="float: left; font-size: 2em; line-height: 1; font-weight: bold; margin-right: 0.1em;">F</span>');
    expect(result).toContain("*irst run *");
    expect(result).toContain("**second run **");
    expect(result).toContain("third run.");
  });

  test("should use default lines value when not specified", () => {
    const paragraph: Paragraph = {
      type: "paragraph",
      runs: [
        {
          text: "Default lines paragraph.",
        },
      ],
      framePr: {
        dropCap: "drop",
      },
    };

    const result = renderParagraph(paragraph, { skipEmptyParagraphs: false });

    expect(result).toContain('<span style="float: left; font-size: 3em; line-height: 2; font-weight: bold; margin-right: 0.1em;">D</span>');
  });

  test("should skip empty paragraphs when option is enabled", () => {
    const paragraph: Paragraph = {
      type: "paragraph",
      runs: [
        {
          text: "   ",
        },
      ],
      framePr: {
        dropCap: "drop",
      },
    };

    const result = renderParagraph(paragraph, { skipEmptyParagraphs: true });

    expect(result).toBe("");
  });

  test("should handle drop cap with color but no font", () => {
    const paragraph: Paragraph = {
      type: "paragraph",
      runs: [
        {
          text: "Colored drop cap.",
          color: "#FF0000",
        },
      ],
      framePr: {
        dropCap: "drop",
        lines: 4,
      },
    };

    const result = renderParagraph(paragraph, { skipEmptyParagraphs: false });

    expect(result).toContain('<span style="float: left; font-size: 4em; line-height: 3; font-weight: bold; margin-right: 0.1em; color: #FF0000;">C</span>');
  });
});