import { describe, it, expect } from "bun:test";
import {
  detectMimeType,
  getMimeTypeFromExtension,
  isValidImageFormat,
  validateImage,
  ImageValidationTracker,
  MAX_IMAGE_SIZE,
  MAX_IMAGES_PER_DOCUMENT,
} from "../src/utils/image-validation";

describe("Image Validation", () => {
  describe("detectMimeType", () => {
    it("should detect PNG format", () => {
      const pngHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const buffer = pngHeader.buffer;
      expect(detectMimeType(buffer)).toBe("image/png");
    });

    it("should detect JPEG format", () => {
      const jpegHeader = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
      const buffer = jpegHeader.buffer;
      expect(detectMimeType(buffer)).toBe("image/jpeg");
    });

    it("should detect GIF87a format", () => {
      const gif87aHeader = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]);
      const buffer = gif87aHeader.buffer;
      expect(detectMimeType(buffer)).toBe("image/gif");
    });

    it("should detect GIF89a format", () => {
      const gif89aHeader = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
      const buffer = gif89aHeader.buffer;
      expect(detectMimeType(buffer)).toBe("image/gif");
    });

    it("should detect BMP format", () => {
      const bmpHeader = new Uint8Array([0x42, 0x4D, 0x00, 0x00]);
      const buffer = bmpHeader.buffer;
      expect(detectMimeType(buffer)).toBe("image/bmp");
    });

    it("should detect WebP format", () => {
      const webpHeader = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x00, 0x00, 0x00, 0x00, // file size (placeholder)
        0x57, 0x45, 0x42, 0x50  // WEBP
      ]);
      const buffer = webpHeader.buffer;
      expect(detectMimeType(buffer)).toBe("image/webp");
    });

    it("should detect TIFF little endian format", () => {
      const tiffLEHeader = new Uint8Array([0x49, 0x49, 0x2A, 0x00]);
      const buffer = tiffLEHeader.buffer;
      expect(detectMimeType(buffer)).toBe("image/tiff");
    });

    it("should detect TIFF big endian format", () => {
      const tiffBEHeader = new Uint8Array([0x4D, 0x4D, 0x00, 0x2A]);
      const buffer = tiffBEHeader.buffer;
      expect(detectMimeType(buffer)).toBe("image/tiff");
    });

    it("should return null for unknown format", () => {
      const unknownHeader = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
      const buffer = unknownHeader.buffer;
      expect(detectMimeType(buffer)).toBeNull();
    });

    it("should return null for too small buffer", () => {
      const smallBuffer = new Uint8Array([0x89]).buffer;
      expect(detectMimeType(smallBuffer)).toBeNull();
    });

    it("should handle empty buffer", () => {
      const emptyBuffer = new ArrayBuffer(0);
      expect(detectMimeType(emptyBuffer)).toBeNull();
    });
  });

  describe("getMimeTypeFromExtension", () => {
    it("should return correct MIME type for common extensions", () => {
      expect(getMimeTypeFromExtension("image.png")).toBe("image/png");
      expect(getMimeTypeFromExtension("photo.jpg")).toBe("image/jpeg");
      expect(getMimeTypeFromExtension("picture.jpeg")).toBe("image/jpeg");
      expect(getMimeTypeFromExtension("animation.gif")).toBe("image/gif");
      expect(getMimeTypeFromExtension("bitmap.bmp")).toBe("image/bmp");
      expect(getMimeTypeFromExtension("vector.svg")).toBe("image/svg+xml");
      expect(getMimeTypeFromExtension("modern.webp")).toBe("image/webp");
    });

    it("should handle case insensitive extensions", () => {
      expect(getMimeTypeFromExtension("IMAGE.PNG")).toBe("image/png");
      expect(getMimeTypeFromExtension("Photo.JPG")).toBe("image/jpeg");
    });

    it("should return default for unknown extensions", () => {
      expect(getMimeTypeFromExtension("file.unknown")).toBe("application/octet-stream");
      expect(getMimeTypeFromExtension("noextension")).toBe("application/octet-stream");
    });

    it("should handle paths with multiple dots", () => {
      expect(getMimeTypeFromExtension("file.name.with.dots.png")).toBe("image/png");
    });
  });

  describe("isValidImageFormat", () => {
    it("should validate known image formats with correct magic numbers", () => {
      const pngData = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]).buffer;
      expect(isValidImageFormat("test.png", pngData)).toBe(true);

      const jpegData = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]).buffer;
      expect(isValidImageFormat("test.jpg", jpegData)).toBe(true);
    });

    it("should reject unsupported extensions", () => {
      const data = new Uint8Array([0x00, 0x01, 0x02, 0x03]).buffer;
      expect(isValidImageFormat("test.xyz", data)).toBe(false);
    });

    it("should handle SVG format (text-based)", () => {
      const svgData = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>').buffer as ArrayBuffer;
      expect(isValidImageFormat("test.svg", svgData)).toBe(true);
    });

    it("should reject files with wrong magic numbers", () => {
      const wrongData = new Uint8Array([0x00, 0x01, 0x02, 0x03]).buffer;
      expect(isValidImageFormat("test.png", wrongData)).toBe(false);
    });
  });

  describe("validateImage", () => {
    it("should validate correct image", () => {
      const pngData = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]).buffer;
      const result = validateImage("test.png", pngData);
      
      expect(result.isValid).toBe(true);
      expect(result.detectedMimeType).toBe("image/png");
      expect(result.error).toBeUndefined();
    });

    it("should reject oversized images", () => {
      const largeSize = MAX_IMAGE_SIZE + 1;
      const largeData = new ArrayBuffer(largeSize);
      const result = validateImage("test.png", largeData);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Image too large");
    });

    it("should reject empty images", () => {
      const emptyData = new ArrayBuffer(0);
      const result = validateImage("test.png", emptyData);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Image data is empty");
    });

    it("should reject unsupported formats", () => {
      const data = new Uint8Array([0x00, 0x01, 0x02, 0x03]).buffer;
      const result = validateImage("test.xyz", data);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Unsupported image format");
    });

    it("should warn about MIME type mismatches", () => {
      // PNG data with JPEG extension
      const pngData = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]).buffer;
      const result = validateImage("test.jpg", pngData);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.[0]).toContain("MIME type mismatch");
    });

    it("should validate SVG files", () => {
      const svgData = new TextEncoder().encode(
        '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>'
      ).buffer as ArrayBuffer;
      const result = validateImage("test.svg", svgData);
      
      expect(result.isValid).toBe(true);
      expect(result.detectedMimeType).toBe("image/svg+xml");
    });

    it("should reject invalid SVG files", () => {
      const invalidSvgData = new TextEncoder().encode("not an svg file").buffer as ArrayBuffer;
      const result = validateImage("test.svg", invalidSvgData);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid SVG format");
    });

    it("should reject undectable binary formats", () => {
      const unknownData = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]).buffer;
      const result = validateImage("test.png", unknownData);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Could not detect valid image format");
    });
  });

  describe("ImageValidationTracker", () => {
    it("should track image count correctly", () => {
      const tracker = new ImageValidationTracker();
      
      expect(tracker.getImageCount()).toBe(0);
      expect(tracker.canAddImage()).toBe(true);
      expect(tracker.hasReachedLimit()).toBe(false);
      
      tracker.addImage();
      expect(tracker.getImageCount()).toBe(1);
    });

    it("should enforce maximum image limit", () => {
      const tracker = new ImageValidationTracker();
      
      // Add images up to limit
      for (let i = 0; i < MAX_IMAGES_PER_DOCUMENT; i++) {
        expect(tracker.canAddImage()).toBe(true);
        tracker.addImage();
      }
      
      expect(tracker.getImageCount()).toBe(MAX_IMAGES_PER_DOCUMENT);
      expect(tracker.hasReachedLimit()).toBe(true);
      expect(tracker.canAddImage()).toBe(false);
    });

    it("should maintain state across multiple checks", () => {
      const tracker = new ImageValidationTracker();
      
      // Add some images
      tracker.addImage();
      tracker.addImage();
      tracker.addImage();
      
      expect(tracker.getImageCount()).toBe(3);
      expect(tracker.canAddImage()).toBe(true);
      expect(tracker.hasReachedLimit()).toBe(false);
    });
  });

  describe("Security and Edge Cases", () => {
    it("should handle very small valid images", () => {
      const minimalPNG = new Uint8Array([0x89, 0x50, 0x4E, 0x47]).buffer;
      const result = validateImage("test.png", minimalPNG);
      expect(result.isValid).toBe(true);
    });

    it("should handle maximum allowed image size", () => {
      const maxSizeData = new ArrayBuffer(MAX_IMAGE_SIZE);
      // Add PNG header
      const view = new Uint8Array(maxSizeData);
      view[0] = 0x89;
      view[1] = 0x50;
      view[2] = 0x4E;
      view[3] = 0x47;
      
      const result = validateImage("test.png", maxSizeData);
      expect(result.isValid).toBe(true);
    });

    it("should reject files that are exactly one byte over limit", () => {
      const oversizeData = new ArrayBuffer(MAX_IMAGE_SIZE + 1);
      const result = validateImage("test.png", oversizeData);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Image too large");
    });

    it("should reject corrupted image headers", () => {
      const corruptedData = new Uint8Array([0x89, 0x50, 0x00, 0x00]).buffer; // Corrupted PNG
      const result = validateImage("test.png", corruptedData);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Could not detect valid image format");
    });

    it("should handle non-UTF8 data in SVG validation", () => {
      const binaryData = new Uint8Array([0xFF, 0xFE, 0xFD, 0xFC]).buffer;
      const result = validateImage("test.svg", binaryData);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Could not decode SVG as text");
    });
  });
});