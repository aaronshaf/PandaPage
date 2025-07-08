import { Effect } from "effect";
import type { Image } from "../../types/document";
import { DocxParseError } from "./index";

interface ImageRelationship {
  id: string;
  target: string;
  type: string;
}

interface DrawingInfo {
  relationshipId: string;
  name?: string;
  description?: string;
  width?: number;
  height?: number;
}

/**
 * Parse relationships from document.xml.rels to find image references
 */
export function parseRelationships(relsXml: string): Effect.Effect<Map<string, ImageRelationship>, DocxParseError> {
  return Effect.gen(function* () {
    const parser = new DOMParser();
    const doc = parser.parseFromString(relsXml, "text/xml");
    
    const relationships = new Map<string, ImageRelationship>();
    const relationshipElements = doc.getElementsByTagName("Relationship");
    
    for (let i = 0; i < relationshipElements.length; i++) {
      const rel = relationshipElements[i];
      if (!rel) continue;
      const id = rel.getAttribute("Id");
      const type = rel.getAttribute("Type");
      const target = rel.getAttribute("Target");
      
      if (id && type && target && type.includes("image")) {
        relationships.set(id, { id, type, target });
      }
    }
    
    return relationships;
  });
}

/**
 * Extract drawing information from a w:drawing element
 */
export function parseDrawing(drawingElement: Element): DrawingInfo | null {
  const ns = {
    wp: "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    a: "http://schemas.openxmlformats.org/drawingml/2006/main",
    pic: "http://schemas.openxmlformats.org/drawingml/2006/picture",
    r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  };
  
  // Find the blip element which contains the relationship ID
  const blipElements = drawingElement.getElementsByTagNameNS(ns.a, "blip");
  if (blipElements.length === 0) return null;
  
  const blip = blipElements[0];
  if (!blip) return null;
  const relationshipId = blip.getAttributeNS(ns.r, "embed") || blip.getAttribute("r:embed");
  if (!relationshipId) return null;
  
  // Extract dimensions from extent element
  const extentElements = drawingElement.getElementsByTagNameNS(ns.wp, "extent");
  let width: number | undefined;
  let height: number | undefined;
  
  if (extentElements.length > 0) {
    const extent = extentElements[0];
    if (extent) {
      const cx = extent.getAttribute("cx");
      const cy = extent.getAttribute("cy");
      
      // Convert EMUs (English Metric Units) to pixels
      // 1 pixel = 9525 EMUs
      if (cx) width = Math.round(parseInt(cx) / 9525);
      if (cy) height = Math.round(parseInt(cy) / 9525);
    }
  }
  
  // Extract name and description
  const docPrElements = drawingElement.getElementsByTagNameNS(ns.wp, "docPr");
  let name: string | undefined;
  let description: string | undefined;
  
  if (docPrElements.length > 0) {
    const docPr = docPrElements[0];
    if (docPr) {
      name = docPr.getAttribute("name") || undefined;
      description = docPr.getAttribute("descr") || undefined;
    }
  }
  
  return {
    relationshipId,
    name,
    description,
    width,
    height
  };
}

/**
 * Extract image data from the zip file
 */
export function extractImageData(
  zip: any, // JSZip instance
  imagePath: string
): Effect.Effect<{ data: ArrayBuffer; mimeType: string }, DocxParseError> {
  return Effect.gen(function* () {
    // Normalize path - remove leading slash if present
    const normalizedPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    const fullPath = normalizedPath.startsWith("word/") ? normalizedPath : `word/${normalizedPath}`;
    
    const imageFile = zip.file(fullPath);
    if (!imageFile) {
      return yield* Effect.fail(new DocxParseError(`Image file not found: ${fullPath}`));
    }
    
    const data = yield* Effect.tryPromise({
      try: () => imageFile.async("arraybuffer") as Promise<ArrayBuffer>,
      catch: (error) => new DocxParseError(`Failed to extract image data: ${error}`)
    });
    
    // Determine MIME type from extension
    const extension = imagePath.split('.').pop()?.toLowerCase();
    const mimeType = getMimeType(extension);
    
    return { data, mimeType };
  });
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(extension?: string): string {
  const mimeTypes: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'tif': 'image/tiff',
    'svg': 'image/svg+xml',
    'webp': 'image/webp'
  };
  
  return mimeTypes[extension || ''] || 'image/png';
}

/**
 * Create an Image element from drawing info and image data
 */
export function createImageElement(
  drawingInfo: DrawingInfo,
  imageData: { data: ArrayBuffer; mimeType: string }
): Image {
  return {
    type: 'image',
    data: imageData.data,
    mimeType: imageData.mimeType,
    width: drawingInfo.width,
    height: drawingInfo.height,
    alt: drawingInfo.description || drawingInfo.name || 'Image'
  };
}