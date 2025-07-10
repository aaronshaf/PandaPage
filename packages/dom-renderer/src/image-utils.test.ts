import { describe, it, expect } from "bun:test";
import { createLazyImage } from "./image-utils";
import { JSDOM } from "jsdom";
import type { Image } from "@browser-document-viewer/parser";

describe("Image Utils", () => {
  const jsdom = new JSDOM();
  const doc = jsdom.window.document;

  describe("createLazyImage", () => {
    it("should create a figure element with img", () => {
      const image: Image = {
        type: "image",
        data: new ArrayBuffer(100),
        mimeType: "image/png",
        alt: "Test image",
      };

      const figure = createLazyImage(image, doc);

      expect(figure.tagName).toBe("FIGURE");
      expect(figure.className).toContain("image-figure");
      
      const img = figure.querySelector("img");
      expect(img).toBeDefined();
      expect(img?.alt).toBe("Test image");
    });

    it("should NOT create captions from alt text", () => {
      const image: Image = {
        type: "image",
        data: new ArrayBuffer(100),
        mimeType: "image/png",
        alt: "This should not become a caption",
      };

      const figure = createLazyImage(image, doc);
      const caption = figure.querySelector("figcaption");
      
      // Caption should not be created automatically from alt text
      expect(caption).toBeNull();
    });

    it("should handle images without alt text", () => {
      const image: Image = {
        type: "image",
        data: new ArrayBuffer(100),
        mimeType: "image/png",
      };

      const figure = createLazyImage(image, doc);
      const img = figure.querySelector("img");
      
      // When no alt is provided, createLazyImage sets a default
      expect(img?.alt).toBe("Document image");
    });

    it("should set width and height when provided", () => {
      const image: Image = {
        type: "image",
        data: new ArrayBuffer(100),
        mimeType: "image/png",
        width: 300,
        height: 200,
      };

      const figure = createLazyImage(image, doc);
      const img = figure.querySelector("img") as HTMLImageElement;
      
      expect(img.width).toBe(300);
      expect(img.height).toBe(200);
    });

    it("should create lazy loading attributes", () => {
      const image: Image = {
        type: "image",
        data: new ArrayBuffer(100),
        mimeType: "image/png",
      };

      const figure = createLazyImage(image, doc);
      const img = figure.querySelector("img") as HTMLImageElement;
      
      expect(img.loading).toBe("lazy");
      expect(img.className).toContain("lazy-image");
      expect(img.getAttribute("data-src")).toContain("data:image/png;base64,");
    });
  });
});