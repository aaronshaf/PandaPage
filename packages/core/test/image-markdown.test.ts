import { describe, test, expect } from "bun:test";
import { convertDocxToMarkdown } from "../src/formats/docx/docx-to-markdown";
import type { DocxDocument, DocxParagraph, DocxRun } from "../src/formats/docx/docx-reader";
import type { DocxImage } from "../src/formats/docx/image-parser";

describe("Image to Markdown Conversion", () => {
  test("should convert document with images to markdown", () => {
    const image: DocxImage = {
      relationshipId: "rId1",
      title: "Sample Image",
      description: "A test image",
      filePath: "media/image1.png",
      base64Data: "iVBORw0KGgo=",
    };

    const document: DocxDocument = {
      paragraphs: [
        {
          type: "paragraph",
          runs: [
            {
              text: "Here is an image: ",
              bold: false,
              italic: false,
            },
            {
              text: "",
              image: image,
            },
            {
              text: " and some text after.",
            },
          ],
        },
      ],
    };

    const markdown = convertDocxToMarkdown(document);

    expect(markdown).toBe(
      "Here is an image: ![A test image](data:image/png;base64,iVBORw0KGgo=) and some text after.",
    );
  });

  test("should handle image-only paragraphs", () => {
    const image: DocxImage = {
      relationshipId: "rId2",
      title: "Standalone Image",
      filePath: "media/diagram.jpg",
    };

    const document: DocxDocument = {
      paragraphs: [
        {
          type: "paragraph",
          runs: [
            {
              text: "Text before image.",
            },
          ],
        },
        {
          type: "paragraph",
          runs: [
            {
              text: "",
              image: image,
            },
          ],
        },
        {
          type: "paragraph",
          runs: [
            {
              text: "Text after image.",
            },
          ],
        },
      ],
    };

    const markdown = convertDocxToMarkdown(document);

    expect(markdown).toBe(
      "Text before image.\n![Standalone Image](media/diagram.jpg)\nText after image.",
    );
  });

  test("should handle multiple images in same paragraph", () => {
    const image1: DocxImage = {
      relationshipId: "rId1",
      title: "First Image",
      filePath: "media/image1.png",
    };

    const image2: DocxImage = {
      relationshipId: "rId2",
      title: "Second Image",
      filePath: "media/image2.jpg",
    };

    const document: DocxDocument = {
      paragraphs: [
        {
          type: "paragraph",
          runs: [
            {
              text: "",
              image: image1,
            },
            {
              text: " and ",
            },
            {
              text: "",
              image: image2,
            },
          ],
        },
      ],
    };

    const markdown = convertDocxToMarkdown(document);

    expect(markdown).toBe("![First Image](media/image1.png) and ![Second Image](media/image2.jpg)");
  });

  test("should handle images without file paths", () => {
    const image: DocxImage = {
      relationshipId: "rId999",
      title: "Missing Image",
    };

    const document: DocxDocument = {
      paragraphs: [
        {
          type: "paragraph",
          runs: [
            {
              text: "",
              image: image,
            },
          ],
        },
      ],
    };

    const markdown = convertDocxToMarkdown(document);

    expect(markdown).toBe("![Missing Image](placeholder-image)");
  });
});
