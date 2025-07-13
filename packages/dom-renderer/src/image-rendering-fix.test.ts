import { describe, it, expect } from "bun:test";
import { renderImage } from "./element-renderers";
import { JSDOM } from "jsdom";
import type { Image } from "@browser-document-viewer/parser";

describe("Image Rendering Fix", () => {
  const jsdom = new JSDOM();
  const doc = jsdom.window.document;

  describe("renderImage with missing data", () => {
    it("should render placeholder for image without data", () => {
      const image: Image = {
        type: "image",
        data: undefined as any, // Simulate missing data
        mimeType: "image/png",
        alt: "Test image without data",
      };

      const imgElement = renderImage(image, doc) as HTMLImageElement;

      expect(imgElement.tagName).toBe("IMG");
      expect(imgElement.alt).toBe("Test image without data");
      expect(imgElement.src).toContain("data:image/svg+xml");
      // Should use placeholder, not the original mime type
      expect(imgElement.src).not.toContain("data:image/png");
    });

    it("should render placeholder for image with empty data", () => {
      const image: Image = {
        type: "image",
        data: new ArrayBuffer(0), // Empty data
        mimeType: "image/jpeg",
        alt: "Empty image",
      };

      const imgElement = renderImage(image, doc) as HTMLImageElement;

      expect(imgElement.tagName).toBe("IMG");
      expect(imgElement.alt).toBe("Empty image");
      expect(imgElement.src).toContain("data:image/svg+xml");
      // Should use placeholder, not the original mime type
      expect(imgElement.src).not.toContain("data:image/jpeg");
    });

    it("should render placeholder for image without alt text", () => {
      const image: Image = {
        type: "image",
        data: undefined as any,
        mimeType: "image/png",
      };

      const imgElement = renderImage(image, doc) as HTMLImageElement;

      expect(imgElement.tagName).toBe("IMG");
      expect(imgElement.alt).toBe("Image without data");
      expect(imgElement.src).toContain("data:image/svg+xml");
    });

    it("should render normally for image with valid data", () => {
      // Create a simple 1x1 pixel PNG
      const imageData = new ArrayBuffer(67);
      const image: Image = {
        type: "image",
        data: imageData,
        mimeType: "image/png",
        alt: "Valid image",
      };

      const imgElement = renderImage(image, doc) as HTMLImageElement;

      expect(imgElement.tagName).toBe("IMG");
      expect(imgElement.alt).toBe("Valid image");
      expect(imgElement.src).toContain("data:image/png;base64,");
      expect(imgElement.src).not.toContain("No Image Data");
    });

    it("should apply dimensions when provided", () => {
      const image: Image = {
        type: "image",
        data: undefined as any,
        mimeType: "image/png",
        width: 300,
        height: 200,
      };

      const imgElement = renderImage(image, doc) as HTMLImageElement;

      expect(imgElement.style.width).toBe("300px");
      expect(imgElement.style.height).toBe("200px");
    });
  });
});