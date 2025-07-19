import { describe, test, expect } from "bun:test";
import { Window } from "happy-dom";
import { renderParagraph } from "../src/element-renderers";
import type { Paragraph } from "@browser-document-viewer/parser";

// Set up DOM environment
const window = new Window();
const document = window.document;
(global as any).document = document;

describe("Drop Cap Rendering", () => {
  test("should render paragraph with drop cap", () => {
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

    const result = renderParagraph(paragraph, document, 1, 10);

    expect(result.tagName).toBe("P");

    // Check that drop cap span was created
    const dropCapSpan = result.querySelector(".drop-cap");
    expect(dropCapSpan).toBeDefined();
    expect(dropCapSpan?.textContent).toBe("L");

    // Check drop cap styles
    expect(dropCapSpan?.style.float).toBe("left");
    expect(dropCapSpan?.style.fontSize).toBe("3em");
    expect(dropCapSpan?.style.lineHeight).toBe("2");
    expect(dropCapSpan?.style.fontWeight).toBe("bold");
    expect(dropCapSpan?.style.marginRight).toBe("0.1em");
    expect(dropCapSpan?.style.marginTop).toBe("-0.1em");
    expect(dropCapSpan?.style.fontFamily).toBe("Georgia");
    expect(dropCapSpan?.style.color).toBe("#333333");

    // Check remaining text
    const remainingText = Array.from(result.childNodes)
      .filter((node) => node !== dropCapSpan)
      .map((node) => node.textContent)
      .join("");
    expect(remainingText).toBe("orem ipsum dolor sit amet, consectetur adipiscing elit.");
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

    const result = renderParagraph(paragraph, document, 1, 10);

    const dropCapSpan = result.querySelector(".drop-cap");
    expect(dropCapSpan).toBeDefined();
    expect(dropCapSpan?.textContent).toBe("A");
    expect(dropCapSpan?.style.fontSize).toBe("5em");
    expect(dropCapSpan?.style.lineHeight).toBe("4");
    expect(dropCapSpan?.style.marginLeft).toBe("-0.5em");
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

    const result = renderParagraph(paragraph, document, 1, 10);

    const dropCapSpan = result.querySelector(".drop-cap");
    expect(dropCapSpan).toBeNull();
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

    const result = renderParagraph(paragraph, document, 1, 10);

    const dropCapSpan = result.querySelector(".drop-cap");
    expect(dropCapSpan).toBeNull();
    expect(result.textContent).toBe("No drop cap here.");
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

    const result = renderParagraph(paragraph, document, 1, 10);

    const dropCapSpan = result.querySelector(".drop-cap");
    expect(dropCapSpan).toBeNull();
    expect(result.textContent).toBe("Normal paragraph without drop cap.");
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

    const result = renderParagraph(paragraph, document, 1, 10);

    const dropCapSpan = result.querySelector(".drop-cap");
    expect(dropCapSpan).toBeDefined();
    expect(dropCapSpan?.textContent).toBe("F");
    expect(dropCapSpan?.style.fontSize).toBe("2em");

    // Check that the remaining text is properly rendered
    const spans = result.querySelectorAll("span:not(.drop-cap)");
    expect(spans.length).toBeGreaterThan(0);

    // First span should have the rest of "irst run "
    const firstSpan = spans[0];
    expect(firstSpan?.textContent).toBe("irst run ");
    expect(firstSpan?.style.fontStyle).toBe("italic");
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

    const result = renderParagraph(paragraph, document, 1, 10);

    const dropCapSpan = result.querySelector(".drop-cap");
    expect(dropCapSpan).toBeDefined();
    expect(dropCapSpan?.style.fontSize).toBe("3em"); // Default is 3 lines
    expect(dropCapSpan?.style.lineHeight).toBe("2"); // lines - 1
  });
});
