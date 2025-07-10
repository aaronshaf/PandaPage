import { describe, it, expect } from "bun:test";
import { parseDocument } from "../src/index";
import { renderToMarkdown } from "@browser-document-viewer/markdown-renderer";

describe("Superscript rendering", () => {
  it("should render superscripts in text", () => {
    // Create a minimal document with superscripts
    const doc = {
      metadata: {},
      elements: [
        {
          type: "paragraph" as const,
          runs: [
            { text: "Name of 1", bold: true },
            { text: "st", bold: true, superscript: true },
            { text: " Author ", bold: true },
            { text: "1", bold: true, superscript: true },
            { text: ", Name of 2", bold: true },
            { text: "nd", bold: true, superscript: true },
            { text: " Author ", bold: true },
            { text: "2", bold: true, superscript: true },
          ],
          style: {},
          numbering: null,
          alignment: null,
          indentation: null,
          images: [],
        },
      ],
    };

    const markdown = renderToMarkdown(doc);

    // Check that superscripts are rendered with bold
    expect(markdown).toContain("<sup>**st**</sup>");
    expect(markdown).toContain("<sup>**nd**</sup>");
    expect(markdown).toContain("<sup>**1**</sup>");
    expect(markdown).toContain("<sup>**2**</sup>");

    // Check the full expected output
    expect(markdown).toBe(
      "**Name of 1**<sup>**st**</sup>** Author **<sup>**1**</sup>**, Name of 2**<sup>**nd**</sup>** Author **<sup>**2**</sup>",
    );
  });

  it("should handle superscripts with multiple formatting", () => {
    const doc = {
      metadata: {},
      elements: [
        {
          type: "paragraph" as const,
          runs: [
            { text: "H", italic: true },
            { text: "2", italic: true, subscript: true },
            { text: "O and CO", italic: true },
            { text: "2", italic: true, superscript: true },
          ],
          style: {},
          numbering: null,
          alignment: null,
          indentation: null,
          images: [],
        },
      ],
    };

    const markdown = renderToMarkdown(doc);

    expect(markdown).toContain("<sub>");
    expect(markdown).toContain("<sup>");
    expect(markdown).toBe("*H*<sub>*2*</sub>*O and CO*<sup>*2*</sup>");
  });
});
