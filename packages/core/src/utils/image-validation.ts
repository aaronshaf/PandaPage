/**
 * Image validation utilities for security and reliability
 */

import { debug } from "../common/debug";

// Security constants
export const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB limit
export const MAX_IMAGES_PER_DOCUMENT = 1000; // Prevent DoS attacks

// Supported image formats with their magic numbers
const IMAGE_SIGNATURES: Record<string, { signature: number[]; mimeType: string }> = {
  png: { signature: [0x89, 0x50, 0x4E, 0x47], mimeType: "image/png" },
  jpeg: { signature: [0xFF, 0xD8, 0xFF], mimeType: "image/jpeg" },
  gif87a: { signature: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], mimeType: "image/gif" },
  gif89a: { signature: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], mimeType: "image/gif" },
  bmp: { signature: [0x42, 0x4D], mimeType: "image/bmp" },
  webp: { signature: [0x52, 0x49, 0x46, 0x46], mimeType: "image/webp" }, // First 4 bytes, followed by WEBP
  tiff_le: { signature: [0x49, 0x49, 0x2A, 0x00], mimeType: "image/tiff" }, // Little endian
  tiff_be: { signature: [0x4D, 0x4D, 0x00, 0x2A], mimeType: "image/tiff" }, // Big endian
};

// Extended MIME type mapping from file extensions
const EXTENSION_MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  bmp: "image/bmp",
  tiff: "image/tiff",
  tif: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp",
  wmf: "image/wmf",
  emf: "image/emf",
  ico: "image/x-icon",
  psd: "image/vnd.adobe.photoshop",
};

export interface ImageValidationResult {
  isValid: boolean;
  detectedMimeType?: string;
  error?: string;
  warnings?: string[];
}

/**
 * Detect MIME type from binary data using magic numbers
 */
export function detectMimeType(imageData: ArrayBuffer): string | null {
  if (imageData.byteLength < 4) {
    return null;
  }

  const bytes = new Uint8Array(imageData, 0, Math.min(12, imageData.byteLength));

  // Check each signature
  for (const [format, { signature, mimeType }] of Object.entries(IMAGE_SIGNATURES)) {
    if (signature.length <= bytes.length) {
      const matches = signature.every((byte, index) => bytes[index] === byte);
      
      if (matches) {
        // Special case for WebP - need to check for WEBP marker after RIFF
        if (format === "webp" && bytes.length >= 12) {
          const webpMarker = [0x57, 0x45, 0x42, 0x50]; // "WEBP"
          const hasWebpMarker = webpMarker.every((byte, index) => bytes[8 + index] === byte);
          if (hasWebpMarker) {
            return mimeType;
          }
        } else if (format !== "webp") {
          return mimeType;
        }
      }
    }
  }

  return null;
}

/**
 * Get expected MIME type from file extension
 */
export function getMimeTypeFromExtension(imagePath: string): string {
  const extension = imagePath.split(".").pop()?.toLowerCase();
  return EXTENSION_MIME_TYPES[extension || ""] || "application/octet-stream";
}

/**
 * Validate image format by checking both extension and binary content
 */
export function isValidImageFormat(imagePath: string, imageData: ArrayBuffer): boolean {
  const extension = imagePath.split(".").pop()?.toLowerCase();
  
  // Check if extension is supported
  if (!extension || !EXTENSION_MIME_TYPES[extension]) {
    debug.log(`Unsupported image extension: ${extension}`);
    return false;
  }

  // For binary formats, verify magic numbers
  if (extension !== "svg") {
    const detectedMimeType = detectMimeType(imageData);
    if (!detectedMimeType) {
      debug.log(`Could not detect MIME type for ${imagePath}`);
      return false;
    }

    const expectedMimeType = EXTENSION_MIME_TYPES[extension];
    if (detectedMimeType !== expectedMimeType) {
      debug.log(`MIME type mismatch for ${imagePath}: expected ${expectedMimeType}, detected ${detectedMimeType}`);
      // Allow this but log warning - some formats have variants
    }
  }

  return true;
}

/**
 * Comprehensive image validation
 */
export function validateImage(imagePath: string, imageData: ArrayBuffer): ImageValidationResult {
  const warnings: string[] = [];

  // Size validation
  if (imageData.byteLength > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: `Image too large: ${imageData.byteLength} bytes (max: ${MAX_IMAGE_SIZE})`,
    };
  }

  if (imageData.byteLength === 0) {
    return {
      isValid: false,
      error: "Image data is empty",
    };
  }

  // Format validation
  const extension = imagePath.split(".").pop()?.toLowerCase();
  if (!extension || !EXTENSION_MIME_TYPES[extension]) {
    return {
      isValid: false,
      error: `Unsupported image format: ${extension}`,
    };
  }

  const expectedMimeType = EXTENSION_MIME_TYPES[extension];
  let detectedMimeType: string | undefined;

  // For binary formats, check magic numbers
  if (extension !== "svg") {
    detectedMimeType = detectMimeType(imageData) || undefined;
    
    if (!detectedMimeType) {
      // Be strict about unrecognizable binary data
      return {
        isValid: false,
        error: `Could not detect valid image format from binary data`,
      };
    } else if (detectedMimeType !== expectedMimeType) {
      warnings.push(`MIME type mismatch: expected ${expectedMimeType}, detected ${detectedMimeType}`);
    }
  } else {
    // For SVG, basic validation
    try {
      const decoder = new TextDecoder("utf-8", { fatal: true });
      const svgText = decoder.decode(imageData);
      if (!svgText.includes("<svg") || !svgText.includes("</svg>")) {
        return {
          isValid: false,
          error: "Invalid SVG format",
        };
      }
      detectedMimeType = "image/svg+xml";
    } catch {
      return {
        isValid: false,
        error: "Could not decode SVG as text",
      };
    }
  }

  return {
    isValid: true,
    detectedMimeType: detectedMimeType || expectedMimeType,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Document-level image validation state
 */
export class ImageValidationTracker {
  private imageCount = 0;

  canAddImage(): boolean {
    return this.imageCount < MAX_IMAGES_PER_DOCUMENT;
  }

  addImage(): void {
    this.imageCount++;
  }

  getImageCount(): number {
    return this.imageCount;
  }

  hasReachedLimit(): boolean {
    return this.imageCount >= MAX_IMAGES_PER_DOCUMENT;
  }
}