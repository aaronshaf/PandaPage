import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import {
  readPptx,
  PptxParseError,
  type PptxDocument,
  type PptxSlide,
  type PptxContent,
} from "../src/formats/pptx/pptx-reader";

describe("PPTX Reader", () => {
  describe("PptxParseError", () => {
    test("should have correct structure", () => {
      const error = new PptxParseError("Test error");
      expect(error._tag).toBe("PptxParseError");
      expect(error.message).toBe("Test error");
    });

    test("should be throwable", () => {
      const throwError = () => {
        throw new PptxParseError("Error occurred");
      };
      expect(throwError).toThrow();
    });
  });

  describe("readPptx with real ZIP data", () => {
    test("should handle invalid buffer", async () => {
      const buffer = new ArrayBuffer(10);
      const view = new Uint8Array(buffer);
      view.fill(0);

      await expect(Effect.runPromise(readPptx(buffer))).rejects.toThrow();
    });

    test("should handle empty buffer", async () => {
      const buffer = new ArrayBuffer(0);

      await expect(Effect.runPromise(readPptx(buffer))).rejects.toThrow();
    });

    test("should create proper Effect type", () => {
      const buffer = new ArrayBuffer(10);
      const effect = readPptx(buffer);

      // Check that it's an Effect
      expect(effect).toBeDefined();
      expect(typeof effect).toBe("object");
    });
  });

  describe("Type definitions", () => {
    test("PptxContent types should be valid", () => {
      const textContent: PptxContent = {
        type: "text",
        text: "Hello",
      };

      const titleContent: PptxContent = {
        type: "title",
        text: "Title",
      };

      const bulletContent: PptxContent = {
        type: "bullet",
        text: "Bullet point",
        level: 1,
      };

      const imageContent: PptxContent = {
        type: "image",
        src: "image.png",
      };

      expect(textContent.type).toBe("text");
      expect(titleContent.type).toBe("title");
      expect(bulletContent.type).toBe("bullet");
      expect(imageContent.type).toBe("image");
    });

    test("PptxSlide should have required properties", () => {
      const slide: PptxSlide = {
        type: "slide",
        slideNumber: 1,
        title: "Test Slide",
        content: [{ type: "text", text: "Content" }],
      };

      expect(slide.type).toBe("slide");
      expect(slide.slideNumber).toBe(1);
      expect(slide.title).toBe("Test Slide");
      expect(slide.content).toHaveLength(1);
    });

    test("PptxDocument should support metadata", () => {
      const doc: PptxDocument = {
        slides: [],
        metadata: {
          title: "Presentation",
          author: "Author",
          slideCount: 5,
        },
      };

      expect(doc.metadata?.title).toBe("Presentation");
      expect(doc.metadata?.author).toBe("Author");
      expect(doc.metadata?.slideCount).toBe(5);
    });

    test("Metadata should be optional", () => {
      const doc: PptxDocument = {
        slides: [],
      };

      expect(doc.metadata).toBeUndefined();
    });
  });

  describe("Content parsing patterns", () => {
    test("should recognize title pattern", () => {
      const titlePattern = /<p:ph[^>]*type="title"/;
      const ctrTitlePattern = /<p:ph[^>]*type="ctrTitle"/;

      expect(titlePattern.test('<p:ph type="title"/>')).toBe(true);
      expect(ctrTitlePattern.test('<p:ph type="ctrTitle"/>')).toBe(true);
      expect(titlePattern.test('<p:ph type="body"/>')).toBe(false);
    });

    test("should recognize bullet pattern", () => {
      const bulletPattern = /<a:buChar/;
      const noBulletPattern = /<a:buNone/;

      expect(bulletPattern.test("<a:buChar/>")).toBe(true);
      expect(noBulletPattern.test("<a:buNone/>")).toBe(true);
      expect(bulletPattern.test("<a:text/>")).toBe(false);
    });

    test("should match shape elements", () => {
      const shapeRegex = /<p:sp[^>]*>(.*?)<\/p:sp>/gs;
      const xml = "<p:sp><content>test</content></p:sp>";
      const matches = xml.match(shapeRegex);

      expect(matches).toBeTruthy();
      expect(matches?.[0]).toContain("test");
    });

    test("should match paragraph elements", () => {
      const paragraphRegex = /<a:p[^>]*>(.*?)<\/a:p>/gs;
      const xml = "<a:p><a:t>text</a:t></a:p>";
      const matches = xml.match(paragraphRegex);

      expect(matches).toBeTruthy();
      expect(matches?.[0]).toContain("text");
    });

    test("should match text elements", () => {
      const textRegex = /<a:t[^>]*>([^<]*)<\/a:t>/g;
      const xml = "<a:t>Hello World</a:t>";
      const match = textRegex.exec(xml);

      expect(match).toBeTruthy();
      expect(match?.[1]).toBe("Hello World");
    });
  });

  describe("File path handling", () => {
    test("should match slide file paths", () => {
      const slidePattern = /^ppt\/slides\/slide\d+\.xml$/;

      expect(slidePattern.test("ppt/slides/slide1.xml")).toBe(true);
      expect(slidePattern.test("ppt/slides/slide123.xml")).toBe(true);
      expect(slidePattern.test("ppt/slides/slide.xml")).toBe(false);
      expect(slidePattern.test("ppt/slides/slideabc.xml")).toBe(false);
      expect(slidePattern.test("other/slides/slide1.xml")).toBe(false);
    });

    test("should extract slide numbers", () => {
      const extractNumber = (path: string) => {
        const match = path.match(/slide(\d+)\.xml$/);
        return match && match[1] ? parseInt(match[1], 10) : 0;
      };

      expect(extractNumber("ppt/slides/slide1.xml")).toBe(1);
      expect(extractNumber("ppt/slides/slide15.xml")).toBe(15);
      expect(extractNumber("ppt/slides/slide.xml")).toBe(0);
    });

    test("should sort slide files correctly", () => {
      const files = [
        "ppt/slides/slide10.xml",
        "ppt/slides/slide2.xml",
        "ppt/slides/slide1.xml",
        "ppt/slides/slide20.xml",
      ];

      const sorted = files.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || "0", 10);
        const numB = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] || "0", 10);
        return numA - numB;
      });

      expect(sorted).toEqual([
        "ppt/slides/slide1.xml",
        "ppt/slides/slide2.xml",
        "ppt/slides/slide10.xml",
        "ppt/slides/slide20.xml",
      ]);
    });
  });

  describe("Metadata parsing patterns", () => {
    test("should match title in metadata", () => {
      const xml = "<dc:title>My Presentation Title</dc:title>";
      const match = xml.match(/<dc:title>([^<]*)<\/dc:title>/);

      expect(match).toBeTruthy();
      expect(match?.[1]).toBe("My Presentation Title");
    });

    test("should match author in metadata", () => {
      const xml = "<dc:creator>John Doe</dc:creator>";
      const match = xml.match(/<dc:creator>([^<]*)<\/dc:creator>/);

      expect(match).toBeTruthy();
      expect(match?.[1]).toBe("John Doe");
    });

    test("should handle empty metadata values", () => {
      const emptyTitle = "<dc:title></dc:title>";
      const emptyAuthor = "<dc:creator></dc:creator>";

      const titleMatch = emptyTitle.match(/<dc:title>([^<]*)<\/dc:title>/);
      const authorMatch = emptyAuthor.match(/<dc:creator>([^<]*)<\/dc:creator>/);

      expect(titleMatch?.[1]).toBe("");
      expect(authorMatch?.[1]).toBe("");
    });

    test("should not match when tags are missing", () => {
      const xml = "<Properties><other>value</other></Properties>";
      const titleMatch = xml.match(/<dc:title>([^<]*)<\/dc:title>/);
      const authorMatch = xml.match(/<dc:creator>([^<]*)<\/dc:creator>/);

      expect(titleMatch).toBeNull();
      expect(authorMatch).toBeNull();
    });
  });

  describe("ArrayBuffer handling", () => {
    test("should convert ArrayBuffer to Uint8Array", () => {
      const buffer = new ArrayBuffer(10);
      const view = new DataView(buffer);
      view.setUint8(0, 255);
      view.setUint8(1, 128);

      const uint8Array = new Uint8Array(buffer);

      expect(uint8Array).toBeInstanceOf(Uint8Array);
      expect(uint8Array.length).toBe(10);
      expect(uint8Array[0]).toBe(255);
      expect(uint8Array[1]).toBe(128);
    });

    test("should handle empty ArrayBuffer", () => {
      const buffer = new ArrayBuffer(0);
      const uint8Array = new Uint8Array(buffer);

      expect(uint8Array.length).toBe(0);
    });
  });

  describe("Complex XML patterns", () => {
    test("should handle nested shapes", () => {
      const xml = `
        <p:sld>
          <p:sp>
            <a:p><a:t>Text 1</a:t></a:p>
          </p:sp>
          <p:sp>
            <a:p><a:t>Text 2</a:t></a:p>
          </p:sp>
        </p:sld>
      `;

      const shapeRegex = /<p:sp[^>]*>(.*?)<\/p:sp>/gs;
      const matches = Array.from(xml.matchAll(shapeRegex));

      expect(matches).toHaveLength(2);
      expect(matches[0]?.[1]).toContain("Text 1");
      expect(matches[1]?.[1]).toContain("Text 2");
    });

    test("should handle multiple paragraphs in shape", () => {
      const shapeContent = `
        <a:p><a:t>Para 1</a:t></a:p>
        <a:p><a:t>Para 2</a:t></a:p>
        <a:p><a:t>Para 3</a:t></a:p>
      `;

      const paragraphRegex = /<a:p[^>]*>(.*?)<\/a:p>/gs;
      const matches = Array.from(shapeContent.matchAll(paragraphRegex));

      expect(matches).toHaveLength(3);
    });

    test("should handle multiple text runs", () => {
      const paragraphContent = `
        <a:t>Hello</a:t>
        <a:t> </a:t>
        <a:t>World</a:t>
      `;

      const textRegex = /<a:t[^>]*>([^<]*)<\/a:t>/g;
      const texts: string[] = [];
      let match;

      while ((match = textRegex.exec(paragraphContent)) !== null) {
        texts.push(match[1] || "");
      }

      expect(texts).toEqual(["Hello", " ", "World"]);
      expect(texts.join("")).toBe("Hello World");
    });
  });

  describe("Edge case handling", () => {
    test("should handle malformed XML gracefully", () => {
      const malformedXmls = [
        "<p:sp><a:p><a:t>Unclosed",
        "<p:sp><a:p><a:t>Text</a:t></p:sp>", // Missing closing a:p
        "<p:sp></p:sp>", // Empty shape
        "<a:t></a:t>", // Empty text
      ];

      malformedXmls.forEach((xml) => {
        const textRegex = /<a:t[^>]*>([^<]*)<\/a:t>/g;
        const match = textRegex.exec(xml);

        // Should either find empty text or no match
        if (match) {
          expect(match[1]).toBeDefined();
        }
      });
    });

    test("should trim whitespace from text", () => {
      const texts = ["  Text  ", "\nText\n", "\tText\t", " "];

      texts.forEach((text) => {
        const trimmed = text.trim();
        if (trimmed) {
          expect(trimmed).toBe("Text");
        } else {
          expect(trimmed).toBe("");
        }
      });
    });
  });
});
