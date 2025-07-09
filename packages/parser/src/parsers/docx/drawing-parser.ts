import { Effect } from "effect";
import type { DrawingObject, Image, Shape, DrawingTransform, ImageCrop, ImageEffects, ShadowEffect, DrawingPosition, ShapeFill, GradientStop, TextBox } from "../../types/document";
import { DocxParseError } from "./index";
import { parseDrawing as parseBasicDrawing, type DrawingInfo } from "./image-parser";
import { parseParagraph } from "./paragraph-parser";
import type { DocxStylesheet } from "./style-parser";
import type { DocxTheme } from "./theme-parser";

interface ExtendedDrawingInfo extends DrawingInfo {
  drawingType: 'inline' | 'anchor';
  position?: DrawingPosition;
  wrapType?: DrawingObject['wrapType'];
  wrapSide?: DrawingObject['wrapSide'];
  allowOverlap?: boolean;
  behindText?: boolean;
  locked?: boolean;
  layoutInCell?: boolean;
  distanceFromText?: DrawingObject['distanceFromText'];
  transform?: DrawingTransform;
  crop?: ImageCrop;
  effects?: ImageEffects;
}

/**
 * Parse a w:drawing element to extract complete drawing object information
 */
export function parseDrawingObject(
  drawingElement: Element,
  imageRelationships?: Map<string, any>,
  zip?: any,
  stylesheet?: DocxStylesheet,
  theme?: DocxTheme
): Effect.Effect<DrawingObject | null, DocxParseError> {
  return Effect.gen(function* () {
    const ns = {
      wp: "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
      a: "http://schemas.openxmlformats.org/drawingml/2006/main",
      pic: "http://schemas.openxmlformats.org/drawingml/2006/picture",
      r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      wps: "http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
    };
    
    // Check if it's inline or anchor
    const inlineElement = drawingElement.getElementsByTagNameNS(ns.wp, "inline")[0] || 
                         drawingElement.getElementsByTagName("wp:inline")[0];
    const anchorElement = drawingElement.getElementsByTagNameNS(ns.wp, "anchor")[0] || 
                         drawingElement.getElementsByTagName("wp:anchor")[0];
    
    if (!inlineElement && !anchorElement) return null;
    
    const isInline = !!inlineElement;
    const drawingContainer = inlineElement || anchorElement;
    if (!drawingContainer) return null;
    
    // Parse basic drawing info
    const basicInfo = parseBasicDrawing(drawingElement);
    if (!basicInfo) return null;
    
    // Parse extended properties
    const extendedInfo: ExtendedDrawingInfo = {
      ...basicInfo,
      drawingType: isInline ? 'inline' : 'anchor'
    };
    
    // Parse positioning for anchored drawings
    if (!isInline && anchorElement) {
      extendedInfo.position = parseAnchorPosition(anchorElement, ns);
      extendedInfo.wrapType = parseWrapType(anchorElement, ns);
      extendedInfo.wrapSide = parseWrapSide(anchorElement, ns);
      
      // Parse anchor attributes
      extendedInfo.allowOverlap = anchorElement.getAttribute("allowOverlap") === "1";
      extendedInfo.behindText = anchorElement.getAttribute("behindDoc") === "1";
      extendedInfo.locked = anchorElement.getAttribute("locked") === "1";
      extendedInfo.layoutInCell = anchorElement.getAttribute("layoutInCell") === "1";
      
      // Parse distance from text
      const distT = anchorElement.getAttribute("distT");
      const distB = anchorElement.getAttribute("distB");
      const distL = anchorElement.getAttribute("distL");
      const distR = anchorElement.getAttribute("distR");
      
      if (distT || distB || distL || distR) {
        extendedInfo.distanceFromText = {
          top: distT ? parseInt(distT) / 12700 : undefined, // EMU to points
          bottom: distB ? parseInt(distB) / 12700 : undefined,
          left: distL ? parseInt(distL) / 12700 : undefined,
          right: distR ? parseInt(distR) / 12700 : undefined
        };
      }
    }
    
    // Check what type of content is in the drawing
    const graphicElement = drawingContainer.getElementsByTagNameNS(ns.a, "graphic")[0] ||
                          drawingContainer.getElementsByTagName("a:graphic")[0];
    if (!graphicElement) return null;
    
    const graphicData = graphicElement.getElementsByTagNameNS(ns.a, "graphicData")[0] ||
                       graphicElement.getElementsByTagName("a:graphicData")[0];
    if (!graphicData) return null;
    
    // Check if it's a picture
    const picElement = graphicData.getElementsByTagNameNS(ns.pic, "pic")[0] ||
                      graphicData.getElementsByTagName("pic:pic")[0];
    
    if (picElement) {
      // Parse as image with extended properties
      const image = yield* parseExtendedImage(picElement, extendedInfo, ns);
      
      return {
        type: 'drawing',
        drawingType: extendedInfo.drawingType,
        content: image,
        position: extendedInfo.position,
        wrapType: extendedInfo.wrapType,
        wrapSide: extendedInfo.wrapSide,
        allowOverlap: extendedInfo.allowOverlap,
        behindText: extendedInfo.behindText,
        locked: extendedInfo.locked,
        layoutInCell: extendedInfo.layoutInCell,
        distanceFromText: extendedInfo.distanceFromText
      };
    }
    
    // Check if it's a shape
    const wpsElement = graphicData.getElementsByTagNameNS(ns.wps, "wsp")[0] ||
                      graphicData.getElementsByTagName("wps:wsp")[0];
    
    if (wpsElement) {
      // Parse as shape
      const shape = yield* parseShape(wpsElement, ns, stylesheet, theme);
      
      return {
        type: 'drawing',
        drawingType: extendedInfo.drawingType,
        content: shape,
        position: extendedInfo.position,
        wrapType: extendedInfo.wrapType,
        wrapSide: extendedInfo.wrapSide,
        allowOverlap: extendedInfo.allowOverlap,
        behindText: extendedInfo.behindText,
        locked: extendedInfo.locked,
        layoutInCell: extendedInfo.layoutInCell,
        distanceFromText: extendedInfo.distanceFromText
      };
    }
    
    // For now, return null for unsupported drawing types (charts, SmartArt, etc.)
    return null;
  });
}

/**
 * Parse anchor position information
 */
function parseAnchorPosition(anchorElement: Element, ns: any): DrawingPosition {
  const position: DrawingPosition = {};
  
  // Parse horizontal position
  const positionH = anchorElement.getElementsByTagNameNS(ns.wp, "positionH")[0] ||
                   anchorElement.getElementsByTagName("wp:positionH")[0];
  if (positionH) {
    const relativeFrom = positionH.getAttribute("relativeFrom");
    const posOffset = positionH.getElementsByTagNameNS(ns.wp, "posOffset")[0] ||
                     positionH.getElementsByTagName("wp:posOffset")[0];
    const align = positionH.getElementsByTagNameNS(ns.wp, "align")[0] ||
                 positionH.getElementsByTagName("wp:align")[0];
    
    position.horizontal = {
      relativeTo: (relativeFrom || 'column') as any,
      offset: posOffset?.textContent ? parseInt(posOffset.textContent) : undefined,
      align: align?.textContent as any
    };
  }
  
  // Parse vertical position
  const positionV = anchorElement.getElementsByTagNameNS(ns.wp, "positionV")[0] ||
                   anchorElement.getElementsByTagName("wp:positionV")[0];
  if (positionV) {
    const relativeFrom = positionV.getAttribute("relativeFrom");
    const posOffset = positionV.getElementsByTagNameNS(ns.wp, "posOffset")[0] ||
                     positionV.getElementsByTagName("wp:posOffset")[0];
    const align = positionV.getElementsByTagNameNS(ns.wp, "align")[0] ||
                 positionV.getElementsByTagName("wp:align")[0];
    
    position.vertical = {
      relativeTo: (relativeFrom || 'paragraph') as any,
      offset: posOffset?.textContent ? parseInt(posOffset.textContent) : undefined,
      align: align?.textContent as any
    };
  }
  
  return position;
}

/**
 * Parse wrap type from anchor element
 */
function parseWrapType(anchorElement: Element, ns: any): DrawingObject['wrapType'] {
  if (anchorElement.getElementsByTagNameNS(ns.wp, "wrapNone")[0] ||
      anchorElement.getElementsByTagName("wp:wrapNone")[0]) {
    return 'none';
  }
  if (anchorElement.getElementsByTagNameNS(ns.wp, "wrapSquare")[0] ||
      anchorElement.getElementsByTagName("wp:wrapSquare")[0]) {
    return 'square';
  }
  if (anchorElement.getElementsByTagNameNS(ns.wp, "wrapTight")[0] ||
      anchorElement.getElementsByTagName("wp:wrapTight")[0]) {
    return 'tight';
  }
  if (anchorElement.getElementsByTagNameNS(ns.wp, "wrapThrough")[0] ||
      anchorElement.getElementsByTagName("wp:wrapThrough")[0]) {
    return 'through';
  }
  if (anchorElement.getElementsByTagNameNS(ns.wp, "wrapTopAndBottom")[0] ||
      anchorElement.getElementsByTagName("wp:wrapTopAndBottom")[0]) {
    return 'topAndBottom';
  }
  return 'square'; // Default
}

/**
 * Parse wrap side from wrap element
 */
function parseWrapSide(anchorElement: Element, ns: any): DrawingObject['wrapSide'] {
  const wrapElements = [
    "wrapSquare", "wrapTight", "wrapThrough"
  ];
  
  for (const wrapType of wrapElements) {
    const wrapElement = anchorElement.getElementsByTagNameNS(ns.wp, wrapType)[0] ||
                       anchorElement.getElementsByTagName(`wp:${wrapType}`)[0];
    if (wrapElement) {
      const wrapText = wrapElement.getAttribute("wrapText");
      if (wrapText === "left") return 'left';
      if (wrapText === "right") return 'right';
      if (wrapText === "largest") return 'largest';
      return 'both';
    }
  }
  
  return 'both';
}

/**
 * Parse extended image properties
 */
function parseExtendedImage(
  picElement: Element,
  drawingInfo: ExtendedDrawingInfo,
  ns: any
): Effect.Effect<Image, DocxParseError> {
  return Effect.gen(function* () {
    // Get shape properties for transform and effects
    const spPr = picElement.getElementsByTagNameNS(ns.pic, "spPr")[0] ||
                picElement.getElementsByTagName("pic:spPr")[0];
    
    const transform = spPr ? parseTransform(spPr, ns) : undefined;
    const effects = spPr ? parseEffects(spPr, ns) : undefined;
    
    // Get blip fill for cropping
    const blipFill = picElement.getElementsByTagNameNS(ns.pic, "blipFill")[0] ||
                    picElement.getElementsByTagName("pic:blipFill")[0];
    const crop = blipFill ? parseCrop(blipFill, ns) : undefined;
    
    // Create image with extended properties
    const image: Image = {
      type: 'image',
      data: new ArrayBuffer(0), // Will be filled later
      mimeType: 'image/png', // Will be determined later
      width: drawingInfo.width,
      height: drawingInfo.height,
      alt: drawingInfo.description || drawingInfo.name || 'Image',
      transform,
      crop,
      effects
    };
    
    return image;
  });
}

/**
 * Parse transform properties
 */
function parseTransform(spPr: Element, ns: any): DrawingTransform | undefined {
  const xfrm = spPr.getElementsByTagNameNS(ns.a, "xfrm")[0] ||
              spPr.getElementsByTagName("a:xfrm")[0];
  if (!xfrm) return undefined;
  
  const transform: DrawingTransform = {};
  
  // Rotation
  const rot = xfrm.getAttribute("rot");
  if (rot) {
    transform.rotation = parseInt(rot) / 60000; // Convert from 60000ths of a degree
  }
  
  // Flip
  const flipH = xfrm.getAttribute("flipH");
  const flipV = xfrm.getAttribute("flipV");
  if (flipH === "1") transform.flipHorizontal = true;
  if (flipV === "1") transform.flipVertical = true;
  
  return Object.keys(transform).length > 0 ? transform : undefined;
}

/**
 * Parse image cropping
 */
function parseCrop(blipFill: Element, ns: any): ImageCrop | undefined {
  const srcRect = blipFill.getElementsByTagNameNS(ns.a, "srcRect")[0] ||
                 blipFill.getElementsByTagName("a:srcRect")[0];
  if (!srcRect) return undefined;
  
  const crop: ImageCrop = {};
  
  const t = srcRect.getAttribute("t");
  const b = srcRect.getAttribute("b");
  const l = srcRect.getAttribute("l");
  const r = srcRect.getAttribute("r");
  
  // Values are in percentages (multiplied by 1000)
  if (t) crop.top = parseInt(t) / 1000;
  if (b) crop.bottom = parseInt(b) / 1000;
  if (l) crop.left = parseInt(l) / 1000;
  if (r) crop.right = parseInt(r) / 1000;
  
  return Object.keys(crop).length > 0 ? crop : undefined;
}

/**
 * Parse visual effects
 */
function parseEffects(spPr: Element, ns: any): ImageEffects | undefined {
  const effectLst = spPr.getElementsByTagNameNS(ns.a, "effectLst")[0] ||
                   spPr.getElementsByTagName("a:effectLst")[0];
  if (!effectLst) return undefined;
  
  const effects: ImageEffects = {};
  
  // Parse shadow
  const outerShdw = effectLst.getElementsByTagNameNS(ns.a, "outerShdw")[0] ||
                   effectLst.getElementsByTagName("a:outerShdw")[0];
  if (outerShdw) {
    effects.shadow = parseShadowEffect(outerShdw, ns);
  }
  
  // Parse other effects...
  // This is a simplified implementation - full implementation would parse all effect types
  
  return Object.keys(effects).length > 0 ? effects : undefined;
}

/**
 * Parse shadow effect
 */
function parseShadowEffect(shadowElement: Element, ns: any): ShadowEffect {
  const shadow: ShadowEffect = {};
  
  const blurRad = shadowElement.getAttribute("blurRad");
  const dist = shadowElement.getAttribute("dist");
  const dir = shadowElement.getAttribute("dir");
  
  if (blurRad) shadow.blur = parseInt(blurRad) / 12700; // EMU to points
  if (dist) shadow.distance = parseInt(dist) / 12700;
  if (dir) shadow.angle = parseInt(dir) / 60000; // 60000ths of a degree
  
  // Parse color
  const colorElements = shadowElement.getElementsByTagName("*");
  for (let i = 0; i < colorElements.length; i++) {
    const elem = colorElements[i];
    if (elem?.localName === "srgbClr") {
      shadow.color = "#" + elem.getAttribute("val");
      break;
    }
  }
  
  return shadow;
}

/**
 * Parse shape element
 */
function parseShape(
  wpsElement: Element,
  ns: any,
  stylesheet?: DocxStylesheet,
  theme?: DocxTheme
): Effect.Effect<Shape, DocxParseError> {
  return Effect.gen(function* () {
    // Get shape properties
    const spPr = wpsElement.getElementsByTagNameNS(ns.wps, "spPr")[0] ||
                wpsElement.getElementsByTagName("wps:spPr")[0];
    
    // Get preset geometry (shape type)
    let shapeType = 'rect'; // Default
    if (spPr) {
      const prstGeom = spPr.getElementsByTagNameNS(ns.a, "prstGeom")[0] ||
                      spPr.getElementsByTagName("a:prstGeom")[0];
      if (prstGeom) {
        shapeType = prstGeom.getAttribute("prst") || 'rect';
      }
    }
    
    // Parse dimensions from transform
    let width: number | undefined;
    let height: number | undefined;
    const transform = spPr ? parseTransform(spPr, ns) : undefined;
    
    if (spPr) {
      const xfrm = spPr.getElementsByTagNameNS(ns.a, "xfrm")[0] ||
                  spPr.getElementsByTagName("a:xfrm")[0];
      if (xfrm) {
        const ext = xfrm.getElementsByTagNameNS(ns.a, "ext")[0] ||
                   xfrm.getElementsByTagName("a:ext")[0];
        if (ext) {
          const cx = ext.getAttribute("cx");
          const cy = ext.getAttribute("cy");
          if (cx) width = parseInt(cx) / 9525; // EMU to pixels
          if (cy) height = parseInt(cy) / 9525;
        }
      }
    }
    
    // Parse fill
    const fill = spPr ? parseShapeFill(spPr, ns) : undefined;
    
    // Parse text box
    const txbx = wpsElement.getElementsByTagNameNS(ns.wps, "txbx")[0] ||
                wpsElement.getElementsByTagName("wps:txbx")[0];
    let textBox: TextBox | undefined;
    
    if (txbx) {
      const txbxContent = txbx.getElementsByTagNameNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "txbxContent")[0] ||
                         txbx.getElementsByTagName("w:txbxContent")[0];
      if (txbxContent) {
        textBox = yield* parseTextBox(txbxContent, stylesheet, theme);
      }
    }
    
    const shape: Shape = {
      type: 'shape',
      shapeType,
      width,
      height,
      transform,
      fill,
      textBox
    };
    
    return shape;
  });
}

/**
 * Parse shape fill
 */
function parseShapeFill(spPr: Element, ns: any): ShapeFill | undefined {
  // Check for solid fill
  const solidFill = spPr.getElementsByTagNameNS(ns.a, "solidFill")[0] ||
                   spPr.getElementsByTagName("a:solidFill")[0];
  if (solidFill) {
    const colorElem = solidFill.getElementsByTagName("*")[0];
    if (colorElem?.localName === "srgbClr") {
      return {
        type: 'solid',
        color: "#" + colorElem.getAttribute("val")
      };
    }
  }
  
  // Check for gradient fill
  const gradFill = spPr.getElementsByTagNameNS(ns.a, "gradFill")[0] ||
                  spPr.getElementsByTagName("a:gradFill")[0];
  if (gradFill) {
    return parseGradientFill(gradFill, ns);
  }
  
  return undefined;
}

/**
 * Parse gradient fill
 */
function parseGradientFill(gradFill: Element, ns: any): ShapeFill {
  const stops: GradientStop[] = [];
  
  const gsLst = gradFill.getElementsByTagNameNS(ns.a, "gsLst")[0] ||
               gradFill.getElementsByTagName("a:gsLst")[0];
  if (gsLst) {
    const gsElements = gsLst.getElementsByTagNameNS(ns.a, "gs") ||
                      gsLst.getElementsByTagName("a:gs");
    for (let i = 0; i < gsElements.length; i++) {
      const gs = gsElements[i];
      if (!gs) continue;
      
      const pos = gs.getAttribute("pos");
      const colorElem = gs.getElementsByTagName("*")[0];
      
      if (pos && colorElem?.localName === "srgbClr") {
        stops.push({
          position: parseInt(pos) / 1000, // Convert to percentage
          color: "#" + colorElem.getAttribute("val")
        });
      }
    }
  }
  
  return {
    type: 'gradient',
    gradient: {
      type: 'linear',
      stops
    }
  };
}

/**
 * Parse text box content
 */
function parseTextBox(
  txbxContent: Element,
  stylesheet?: DocxStylesheet,
  theme?: DocxTheme
): Effect.Effect<TextBox, DocxParseError> {
  return Effect.gen(function* () {
    const paragraphs = [];
    
    const pElements = txbxContent.getElementsByTagNameNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "p") ||
                     txbxContent.getElementsByTagName("w:p");
    
    for (let i = 0; i < pElements.length; i++) {
      const pElement = pElements[i];
      if (!pElement) continue;
      
      const paragraph = parseParagraph(pElement, undefined, undefined, undefined, stylesheet, theme);
      if (paragraph) {
        // Convert DocxRun to TextRun with proper type conversions
        const textRuns = paragraph.runs.map(run => ({
          ...run,
          fontSize: run.fontSize ? parseInt(run.fontSize) / 2 : undefined, // Convert from half-points to points
          fontSizeCs: run.fontSizeCs ? parseInt(run.fontSizeCs) / 2 : undefined
        }));
        
        paragraphs.push({
          type: 'paragraph' as const,
          runs: textRuns,
          alignment: paragraph.alignment,
          spacing: paragraph.spacing,
          indentation: paragraph.indentation
        });
      }
    }
    
    return {
      paragraphs,
      wordWrap: true // Default
    };
  });
}