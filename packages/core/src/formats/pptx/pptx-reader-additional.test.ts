import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import { readPptx, PptxParseError, type PptxSlide, type PptxContent } from "./pptx-reader";
import { Window } from "happy-dom";

// Set up DOM environment
const window = new Window();
global.DOMParser = window.DOMParser as any;

describe("PPTX Reader - Additional Coverage", () => {
  describe("parseSlideXml", () => {
    test("should handle invalid ArrayBuffer", async () => {
      const invalidBuffer = new ArrayBuffer(10);
      
      const result = await Effect.runPromiseExit(readPptx(invalidBuffer));
      expect(result._tag).toBe("Failure");
    });

    test("should handle empty ArrayBuffer", async () => {
      const emptyBuffer = new ArrayBuffer(0);
      
      const result = await Effect.runPromiseExit(readPptx(emptyBuffer));
      expect(result._tag).toBe("Failure");
    });
  });

  describe("PptxParseError", () => {
    test("should create error with message", () => {
      const error = new PptxParseError("Test error message");
      
      expect(error._tag).toBe("PptxParseError");
      expect(error.message).toBe("Test error message");
    });
  });

  describe("slide file filtering", () => {
    test("should correctly identify slide files", () => {
      const files = [
        "ppt/slides/slide1.xml",
        "ppt/slides/slide2.xml",
        "ppt/slides/slide10.xml",
        "ppt/slides/_rels/slide1.xml.rels",
        "ppt/presentation.xml",
        "docProps/app.xml"
      ];
      
      const slideFiles = files.filter((path) => {
        return path.startsWith("ppt/slides/slide") && path.endsWith(".xml");
      });
      
      expect(slideFiles).toHaveLength(3);
      expect(slideFiles).toContain("ppt/slides/slide1.xml");
      expect(slideFiles).toContain("ppt/slides/slide2.xml");
      expect(slideFiles).toContain("ppt/slides/slide10.xml");
    });
  });

  describe("slide number extraction", () => {
    test("should extract slide numbers correctly", () => {
      const getSlideNumber = (filename: string): number => {
        const parts = filename.split("/");
        const slideFile = parts[parts.length - 1] || "";
        const slidePrefix = "slide";
        const xmlSuffix = ".xml";

        if (slideFile.startsWith(slidePrefix) && slideFile.endsWith(xmlSuffix)) {
          const numberPart = slideFile.slice(slidePrefix.length, -xmlSuffix.length);
          const num = parseInt(numberPart, 10);
          return isNaN(num) ? 0 : num;
        }
        return 0;
      };
      
      expect(getSlideNumber("ppt/slides/slide1.xml")).toBe(1);
      expect(getSlideNumber("ppt/slides/slide10.xml")).toBe(10);
      expect(getSlideNumber("ppt/slides/slideA.xml")).toBe(0);
      expect(getSlideNumber("ppt/slides/invalid.xml")).toBe(0);
    });
  });

  describe("sorting slide files", () => {
    test("should sort slide files numerically", () => {
      const files = [
        "ppt/slides/slide10.xml",
        "ppt/slides/slide2.xml",
        "ppt/slides/slide1.xml",
        "ppt/slides/slide20.xml"
      ];
      
      const sorted = files.sort((a, b) => {
        const getSlideNumber = (filename: string): number => {
          const parts = filename.split("/");
          const slideFile = parts[parts.length - 1] || "";
          const slidePrefix = "slide";
          const xmlSuffix = ".xml";

          if (slideFile.startsWith(slidePrefix) && slideFile.endsWith(xmlSuffix)) {
            const numberPart = slideFile.slice(slidePrefix.length, -xmlSuffix.length);
            const num = parseInt(numberPart, 10);
            return isNaN(num) ? 0 : num;
          }
          return 0;
        };

        return getSlideNumber(a) - getSlideNumber(b);
      });
      
      expect(sorted[0]).toBe("ppt/slides/slide1.xml");
      expect(sorted[1]).toBe("ppt/slides/slide2.xml");
      expect(sorted[2]).toBe("ppt/slides/slide10.xml");
      expect(sorted[3]).toBe("ppt/slides/slide20.xml");
    });
  });
});