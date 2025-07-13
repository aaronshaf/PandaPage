import { Effect } from "effect";
import { debug } from "../../common/debug";
import { parseXmlString } from "../../common/xml-parser";
import type { DocxParseError } from "./docx-reader";
import type { ST_RelationshipId } from "@browser-document-viewer/ooxml-types";

/**
 * Image relationship data from document.xml.rels
 */
export interface ImageRelationship {
  id: ST_RelationshipId;
  target: string; // Path to image file like "media/image1.png"
  targetMode?: string;
}

/**
 * Parsed image information from drawing element
 */
export interface DocxImage {
  relationshipId: ST_RelationshipId;
  width?: number; // in EMUs (English Metric Units)
  height?: number; // in EMUs  
  title?: string;
  description?: string;
  filePath?: string; // Resolved file path from relationship
  base64Data?: string; // Base64 encoded image data
}

/**
 * Parse image relationships from document.xml.rels using DOM parsing
 */
export const parseImageRelationships = (
  relsXml: string,
): Effect.Effect<Map<string, ImageRelationship>, DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Parsing image relationships with DOM parsing");

    const relationships = new Map<string, ImageRelationship>();

    // Parse XML with DOM parser
    const doc = yield* parseXmlString(relsXml).pipe(
      Effect.mapError(
        (error) => ({
          _tag: "DocxParseError" as const,
          message: `Failed to parse relationships XML: ${error.message}`,
        }),
      ),
    );

    // Get all Relationship elements
    const relationshipElements = doc.getElementsByTagName("Relationship");

    for (const element of relationshipElements) {
      const type = element.getAttribute("Type");

      // Check if it's an image relationship
      if (
        type === "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
      ) {
        const id = element.getAttribute("Id");
        const target = element.getAttribute("Target");
        const targetMode = element.getAttribute("TargetMode");

        if (id && target) {
          relationships.set(id, {
            id,
            target,
            ...(targetMode && { targetMode }),
          });
        }
      }
    }

    debug.log(`Found ${relationships.size} image relationships`);
    return relationships;
  });

/**
 * Parse a drawing element to extract image information using DOM parsing
 */
export const parseDrawingElement = (
  drawingXml: string,
  imageRelationships: Map<string, ImageRelationship>,
): Effect.Effect<DocxImage | null, DocxParseError> =>
  Effect.gen(function* () {
    // Add namespace declarations if missing
    let xmlContent = drawingXml;
    if (!xmlContent.includes("xmlns:w=")) {
      xmlContent = xmlContent.replace(
        /<w:drawing([^>]*)>/,
        '<w:drawing$1 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
      );
    }

    // Parse XML with DOM parser
    const doc = yield* parseXmlString(xmlContent).pipe(
      Effect.mapError(
        (error) => ({
          _tag: "DocxParseError" as const,
          message: `Failed to parse drawing XML: ${error.message}`,
        }),
      ),
    );

    // Look for picture elements within the drawing
    let picElements = doc.getElementsByTagName("pic:pic");
    if (picElements.length === 0) {
      picElements = doc.getElementsByTagName("pic");
    }

    if (picElements.length === 0) {
      debug.log("No picture elements found in drawing");
      return null;
    }

    const picElement = picElements[0];
    if (!picElement) {
      return null;
    }

    // Extract relationship ID from blip element
    let blipElements = picElement.getElementsByTagName("a:blip");
    if (blipElements.length === 0) {
      blipElements = picElement.getElementsByTagName("blip");
    }

    if (blipElements.length === 0) {
      debug.log("No blip elements found in picture");
      return null;
    }

    const blipElement = blipElements[0];
    if (!blipElement) {
      return null;
    }

    const relationshipId = blipElement.getAttribute("r:embed") || blipElement.getAttribute("embed");
    if (!relationshipId) {
      debug.log("No relationship ID found in blip element");
      return null;
    }

    // Get dimensions from extent element
    let width: number | undefined;
    let height: number | undefined;

    const extentElements = doc.getElementsByTagName("wp:extent");
    if (extentElements.length > 0) {
      const extentElement = extentElements[0];
      if (extentElement) {
        const cxAttr = extentElement.getAttribute("cx");
        const cyAttr = extentElement.getAttribute("cy");
        if (cxAttr) {
          const parsedWidth = parseInt(cxAttr, 10);
          if (!isNaN(parsedWidth) && parsedWidth > 0) {
            width = parsedWidth;
          }
        }
        if (cyAttr) {
          const parsedHeight = parseInt(cyAttr, 10);
          if (!isNaN(parsedHeight) && parsedHeight > 0) {
            height = parsedHeight;
          }
        }
      }
    }

    // Get title and description from docPr element
    let title: string | undefined;
    let description: string | undefined;

    const docPrElements = doc.getElementsByTagName("wp:docPr");
    if (docPrElements.length > 0) {
      const docPrElement = docPrElements[0];
      if (docPrElement) {
        title = docPrElement.getAttribute("name") || undefined;
        description = docPrElement.getAttribute("descr") || undefined;
      }
    }

    // Resolve file path from relationship
    const imageRelationship = imageRelationships.get(relationshipId);
    const filePath = imageRelationship?.target;

    debug.log(`Parsed image: ${relationshipId} -> ${filePath} (${width}x${height})`);

    return {
      relationshipId,
      width,
      height,
      title,
      description,
      filePath,
    };
  });

/**
 * Convert EMUs (English Metric Units) to pixels for display
 * 1 EMU = 1/914400 inch
 * 
 * This function now returns CSS pixels (not device pixels) to ensure
 * consistent sizing across different DPI displays. The browser will
 * automatically handle high-DPI rendering when these values are used
 * in CSS width/height properties.
 */
export const emusToPixels = (emus: number): number => {
  // Use standard 96 DPI for CSS pixels
  // The browser handles device pixel ratio automatically
  return Math.round((emus / 914400) * 96);
};

/**
 * Supported image formats and their magic bytes
 */
const IMAGE_FORMATS = {
  png: { mimeType: 'image/png', magic: [0x89, 0x50, 0x4E, 0x47] },
  jpeg: { mimeType: 'image/jpeg', magic: [0xFF, 0xD8, 0xFF] },
  gif: { mimeType: 'image/gif', magic: [0x47, 0x49, 0x46] },
  bmp: { mimeType: 'image/bmp', magic: [0x42, 0x4D] },
  webp: { 
    mimeType: 'image/webp', 
    magic: [0x52, 0x49, 0x46, 0x46], // RIFF
    secondaryMagic: [0x57, 0x45, 0x42, 0x50], // WEBP at offset 8
    secondaryOffset: 8 
  },
} as const;

/**
 * Maximum allowed image size (10MB)
 */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * Detect image format from binary data
 */
const detectImageFormat = (data: Uint8Array): string | null => {
  for (const [format, info] of Object.entries(IMAGE_FORMATS)) {
    const { magic } = info;
    if (data.length >= magic.length) {
      let matches = true;
      for (let i = 0; i < magic.length; i++) {
        if (data[i] !== magic[i]) {
          matches = false;
          break;
        }
      }
      
      // Check secondary magic bytes if present (e.g., for WebP)
      if (matches && 'secondaryMagic' in info && info.secondaryMagic && info.secondaryOffset) {
        const secondaryMagic = info.secondaryMagic;
        const offset = info.secondaryOffset;
        if (data.length >= offset + secondaryMagic.length) {
          for (let i = 0; i < secondaryMagic.length; i++) {
            if (data[offset + i] !== secondaryMagic[i]) {
              matches = false;
              break;
            }
          }
        } else {
          matches = false;
        }
      }
      
      if (matches) {
        return format;
      }
    }
  }
  return null;
};

/**
 * Extract image binary data from ZIP archive
 */
export const extractImageFromZip = (
  unzipped: Record<string, Uint8Array>,
  imagePath: string
): Effect.Effect<string, DocxParseError> =>
  Effect.gen(function* () {
    // Try different possible paths for the image
    const possiblePaths = [
      `word/${imagePath}`,
      imagePath,
      `word/media/${imagePath.replace(/^media\//, '')}`,
    ];

    for (const path of possiblePaths) {
      const imageData = unzipped[path];
      if (imageData) {
        debug.log(`Found image at path: ${path}, size: ${imageData.length} bytes`);
        
        // Validate image size
        if (imageData.length > MAX_IMAGE_SIZE) {
          debug.log(`Image too large: ${imageData.length} bytes (max: ${MAX_IMAGE_SIZE})`);
          return yield* Effect.fail({
            _tag: "DocxParseError" as const,
            message: `Image exceeds size limit: ${(imageData.length / 1024 / 1024).toFixed(1)}MB (maximum: ${MAX_IMAGE_SIZE / 1024 / 1024}MB)`,
          });
        }
        
        // Validate image format
        const format = detectImageFormat(imageData);
        if (!format) {
          debug.log(`Unknown image format for: ${path}`);
          // Continue with the image anyway - Word may support formats we don't validate
        }
        
        // Convert Uint8Array to base64
        const base64Data = yield* Effect.tryPromise({
          try: async () => {
            // Use btoa in browser, Buffer in Node.js
            if (typeof btoa !== 'undefined') {
              // Browser environment
              // TODO: For large images, consider using FileReader.readAsDataURL() 
              // or streaming approaches to avoid loading entire image into memory
              let binary = '';
              for (let i = 0; i < imageData.length; i++) {
                binary += String.fromCharCode(imageData[i]!);
              }
              return btoa(binary);
            } else {
              // Node.js environment
              return Buffer.from(imageData).toString('base64');
            }
          },
          catch: (error) => ({
            _tag: "DocxParseError" as const,
            message: `Failed to convert image to base64: ${error}`,
          }),
        });

        return base64Data;
      }
    }

    debug.log(`Image not found at any of these paths: ${possiblePaths.join(', ')}`);
    return yield* Effect.fail({
      _tag: "DocxParseError" as const,
      message: `Image not found: ${imagePath}`,
    });
  });

/**
 * Format image as markdown with proper dimensions
 * 
 * NOTE: For memory efficiency, consider these approaches in production:
 * 1. Stream large images instead of loading into memory
 * 2. Use object URLs with cleanup (URL.revokeObjectURL)
 * 3. Implement lazy loading for images above a certain size
 * 4. Clear base64Data after rendering to free memory
 */
export const formatImageAsMarkdown = (image: DocxImage): string => {
  const title = image.title || "Image";
  const description = image.description || title;
  
  if (image.base64Data) {
    // Use base64 data URL
    const mimeType = image.filePath?.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `![${description}](data:${mimeType};base64,${image.base64Data})`;
  } else if (image.filePath) {
    // Use file path reference
    return `![${description}](${image.filePath})`;
  } else {
    // Fallback placeholder
    return `![${description}](placeholder-image)`;
  }
};