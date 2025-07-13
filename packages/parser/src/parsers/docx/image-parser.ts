import { Effect } from "effect";
import type { Image, ImageCrop, DrawingTransform, ImageEffects } from "../../types/document";
import { DocxParseError } from "./index";

interface ImageRelationship {
  id: string;
  target: string;
  type: string;
}

export interface DrawingInfo {
  relationshipId: string;
  name?: string;
  description?: string;
  width?: number;
  height?: number;
  // Extended properties
  transform?: DrawingTransform;
  crop?: ImageCrop;
  effects?: ImageEffects;
}

/**
 * Parse relationships from document.xml.rels to find image references
 */
export function parseRelationships(
  relsXml: string,
): Effect.Effect<Map<string, ImageRelationship>, DocxParseError> {
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
    r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
  };

  // Find the blip element which contains the relationship ID
  let blipElements = drawingElement.getElementsByTagNameNS(ns.a, "blip");
  if (blipElements.length === 0) {
    // Try with prefixed name
    blipElements = drawingElement.getElementsByTagName("a:blip");
  }
  if (blipElements.length === 0) return null;

  const blip = blipElements[0];
  if (!blip) return null;
  const relationshipId = blip.getAttributeNS(ns.r, "embed") || blip.getAttribute("r:embed");
  if (!relationshipId) return null;

  // Extract dimensions from extent element
  let extentElements = drawingElement.getElementsByTagNameNS(ns.wp, "extent");
  if (extentElements.length === 0) {
    extentElements = drawingElement.getElementsByTagName("wp:extent");
  }
  let width: number | undefined;
  let height: number | undefined;

  if (extentElements.length > 0) {
    const extent = extentElements[0];
    if (extent) {
      const cx = extent.getAttribute("cx");
      const cy = extent.getAttribute("cy");

      // Convert EMUs (English Metric Units) to CSS pixels
      // 1 EMU = 1/914400 inch, using 96 DPI for CSS pixels
      // This ensures consistent sizing across different displays
      if (cx) width = Math.round((parseInt(cx) / 914400) * 96);
      if (cy) height = Math.round((parseInt(cy) / 914400) * 96);
    }
  }

  // Extract name and description
  let docPrElements = drawingElement.getElementsByTagNameNS(ns.wp, "docPr");
  if (docPrElements.length === 0) {
    docPrElements = drawingElement.getElementsByTagName("wp:docPr");
  }
  let name: string | undefined;
  let description: string | undefined;

  if (docPrElements.length > 0) {
    const docPr = docPrElements[0];
    if (docPr) {
      name = docPr.getAttribute("name") || undefined;
      description = docPr.getAttribute("descr") || undefined;
    }
  }

  // Parse advanced properties
  const transform = parseImageTransform(drawingElement, ns);
  const crop = parseImageCrop(drawingElement, ns);
  const effects = parseImageEffects(drawingElement, ns);

  return {
    relationshipId,
    name,
    description,
    width,
    height,
    transform,
    crop,
    effects,
  };
}

/**
 * Parse image transformation properties
 */
function parseImageTransform(drawingElement: Element, ns: any): DrawingTransform | undefined {
  // Find the picture element
  const picElements = drawingElement.getElementsByTagNameNS(ns.pic, "pic");
  if (picElements.length === 0) return undefined;

  const picElement = picElements[0];
  if (!picElement) return undefined;

  // Find shape properties
  const spPrElements = picElement.getElementsByTagNameNS(ns.pic, "spPr");
  if (spPrElements.length === 0) return undefined;

  const spPr = spPrElements[0];
  if (!spPr) return undefined;

  // Find transform element
  const xfrmElements = spPr.getElementsByTagNameNS(ns.a, "xfrm");
  if (xfrmElements.length === 0) return undefined;

  const xfrm = xfrmElements[0];
  if (!xfrm) return undefined;

  const transform: DrawingTransform = {};

  // Rotation (in 60000ths of a degree)
  const rot = xfrm.getAttribute("rot");
  if (rot) {
    transform.rotation = parseInt(rot) / 60000;
  }

  // Flip
  const flipH = xfrm.getAttribute("flipH");
  const flipV = xfrm.getAttribute("flipV");
  if (flipH === "1") transform.flipHorizontal = true;
  if (flipV === "1") transform.flipVertical = true;

  return Object.keys(transform).length > 0 ? transform : undefined;
}

/**
 * Parse image cropping properties
 */
function parseImageCrop(drawingElement: Element, ns: any): ImageCrop | undefined {
  // Find the picture element
  const picElements = drawingElement.getElementsByTagNameNS(ns.pic, "pic");
  if (picElements.length === 0) return undefined;

  const picElement = picElements[0];
  if (!picElement) return undefined;

  // Find blip fill
  const blipFillElements = picElement.getElementsByTagNameNS(ns.pic, "blipFill");
  if (blipFillElements.length === 0) return undefined;

  const blipFill = blipFillElements[0];
  if (!blipFill) return undefined;

  // Find source rectangle (crop)
  const srcRectElements = blipFill.getElementsByTagNameNS(ns.a, "srcRect");
  if (srcRectElements.length === 0) return undefined;

  const srcRect = srcRectElements[0];
  if (!srcRect) return undefined;

  const crop: ImageCrop = {};

  // Values are in percentages (multiplied by 1000)
  const t = srcRect.getAttribute("t");
  const b = srcRect.getAttribute("b");
  const l = srcRect.getAttribute("l");
  const r = srcRect.getAttribute("r");

  if (t) crop.top = parseInt(t) / 1000;
  if (b) crop.bottom = parseInt(b) / 1000;
  if (l) crop.left = parseInt(l) / 1000;
  if (r) crop.right = parseInt(r) / 1000;

  return Object.keys(crop).length > 0 ? crop : undefined;
}

/**
 * Parse image visual effects
 */
function parseImageEffects(drawingElement: Element, ns: any): ImageEffects | undefined {
  // Find the picture element
  const picElements = drawingElement.getElementsByTagNameNS(ns.pic, "pic");
  if (picElements.length === 0) return undefined;

  const picElement = picElements[0];
  if (!picElement) return undefined;

  // Find shape properties
  const spPrElements = picElement.getElementsByTagNameNS(ns.pic, "spPr");
  if (spPrElements.length === 0) return undefined;

  const spPr = spPrElements[0];
  if (!spPr) return undefined;

  // Find effect list
  const effectLstElements = spPr.getElementsByTagNameNS(ns.a, "effectLst");
  if (effectLstElements.length === 0) return undefined;

  const effectLst = effectLstElements[0];
  if (!effectLst) return undefined;

  const effects: ImageEffects = {};

  // Parse shadow effect
  const outerShdwElements = effectLst.getElementsByTagNameNS(ns.a, "outerShdw");
  if (outerShdwElements.length > 0) {
    const outerShdw = outerShdwElements[0];
    if (outerShdw) {
      const shadow: ImageEffects["shadow"] = {};

      const blurRad = outerShdw.getAttribute("blurRad");
      const dist = outerShdw.getAttribute("dist");
      const dir = outerShdw.getAttribute("dir");

      if (blurRad) shadow.blur = parseInt(blurRad) / 12700; // EMU to points
      if (dist) shadow.distance = parseInt(dist) / 12700;
      if (dir) shadow.angle = parseInt(dir) / 60000; // 60000ths of a degree

      // Parse color
      const colorElements = outerShdw.getElementsByTagName("*");
      for (let i = 0; i < colorElements.length; i++) {
        const elem = colorElements[i];
        if (elem?.localName === "srgbClr") {
          shadow.color = "#" + elem.getAttribute("val");
          break;
        }
      }

      effects.shadow = shadow;
    }
  }

  // Parse reflection effect
  const reflectionElements = effectLst.getElementsByTagNameNS(ns.a, "reflection");
  if (reflectionElements.length > 0) {
    const reflection = reflectionElements[0];
    if (reflection) {
      const reflectionEffect: ImageEffects["reflection"] = {};

      const blurRad = reflection.getAttribute("blurRad");
      const dist = reflection.getAttribute("dist");

      if (blurRad) reflectionEffect.blur = parseInt(blurRad) / 12700;
      if (dist) reflectionEffect.distance = parseInt(dist) / 12700;

      effects.reflection = reflectionEffect;
    }
  }

  // Parse glow effect
  const glowElements = effectLst.getElementsByTagNameNS(ns.a, "glow");
  if (glowElements.length > 0) {
    const glow = glowElements[0];
    if (glow) {
      const glowEffect: ImageEffects["glow"] = {};

      const rad = glow.getAttribute("rad");
      if (rad) glowEffect.radius = parseInt(rad) / 12700;

      // Parse color
      const colorElements = glow.getElementsByTagName("*");
      for (let i = 0; i < colorElements.length; i++) {
        const elem = colorElements[i];
        if (elem?.localName === "srgbClr") {
          glowEffect.color = "#" + elem.getAttribute("val");
          break;
        }
      }

      effects.glow = glowEffect;
    }
  }

  return Object.keys(effects).length > 0 ? effects : undefined;
}

/**
 * Extract image data from the zip file
 */
export function extractImageData(
  zip: any, // JSZip instance
  imagePath: string,
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
      catch: (error) => new DocxParseError(`Failed to extract image data: ${error}`),
    });

    // Determine MIME type from extension
    const extension = imagePath.split(".").pop()?.toLowerCase();
    const mimeType = getMimeType(extension);

    return { data, mimeType };
  });
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(extension?: string): string {
  const mimeTypes: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    bmp: "image/bmp",
    tiff: "image/tiff",
    tif: "image/tiff",
    svg: "image/svg+xml",
    webp: "image/webp",
  };

  return mimeTypes[extension || ""] || "image/png";
}

/**
 * Create an Image element from drawing info and image data
 */
export function createImageElement(
  drawingInfo: DrawingInfo,
  imageData: { data: ArrayBuffer; mimeType: string },
): Image {
  return {
    type: "image",
    data: imageData.data,
    mimeType: imageData.mimeType,
    width: drawingInfo.width,
    height: drawingInfo.height,
    alt: drawingInfo.description || drawingInfo.name || "Image",
    crop: drawingInfo.crop,
    transform: drawingInfo.transform,
    effects: drawingInfo.effects,
  };
}
