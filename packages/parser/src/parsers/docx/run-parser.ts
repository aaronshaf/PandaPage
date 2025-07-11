// Run parsing functions
import type { DocxRun } from "./types";
import { parseFieldRun } from "./field-parser";
import type { FieldParsingContext } from "./field-context";
import { parseDrawing } from "./image-parser";
import type { Image } from "../../types/document";
import {
  getElementsByTagNameNSFallback,
  getElementByTagNameNSFallback,
  hasChildElementNS,
  parseOnOffValue,
} from "./xml-utils";
import { applyStyleCascade, type DocxStylesheet } from "./style-parser";
import type { DocxTheme } from "./theme-parser";
import { resolveThemeColor, resolveThemeFont } from "./theme-parser";
import { ST_Em } from "@browser-document-viewer/ooxml-types";

/**
 * Check if text content is purely punctuation that shouldn't inherit language attributes
 * This helps prevent issues where quotation marks get tagged with inappropriate language codes
 */
function isPunctuationOnly(text: string): boolean {
  // Don't treat empty strings as punctuation-only
  if (!text || text.length === 0) {
    return false;
  }

  // Common punctuation characters that often get incorrectly tagged with language attributes
  const punctuationRegex = /^[\s\p{P}\p{S}]+$/u;
  return punctuationRegex.test(text);
}

// Helper type for field parsing state
export interface FieldParsingState {
  inField: boolean;
  fieldInstruction: string;
  fieldRunProperties: any;
  skipFieldValue: boolean;
}

/**
 * Parse a run element
 */
export function parseRunElement(
  element: Element,
  ns: string,
  runs: DocxRun[],
  images: Image[],
  imageRelationships: Map<string, any> | undefined,
  zip: any,
  fieldState: FieldParsingState,
  updateFieldState: (state: FieldParsingState) => void,
  stylesheet?: DocxStylesheet,
  theme?: DocxTheme,
  fieldContext?: FieldParsingContext,
): void {
  // Check for footnote references first
  const footnoteRefElements = getElementsByTagNameNSFallback(element, ns, "footnoteReference");
  if (footnoteRefElements.length > 0) {
    const footnoteRef = footnoteRefElements[0];
    if (footnoteRef) {
      const footnoteId = footnoteRef.getAttribute("w:id");
      if (footnoteId) {
        // Add a superscript run for the footnote reference
        runs.push({
          text: footnoteId, // Use the footnote ID as the reference text
          superscript: true,
          _footnoteRef: footnoteId, // Mark this as a footnote reference
        });
      }
    }
  } else {
    // Check for field codes
    const fldCharElements = getElementsByTagNameNSFallback(element, ns, "fldChar");
    const instrTextElements = getElementsByTagNameNSFallback(element, ns, "instrText");

    if (fldCharElements.length > 0) {
      const fldChar = fldCharElements[0];
      const fldCharType = fldChar?.getAttribute("w:fldCharType");

      if (fldCharType === "begin") {
        updateFieldState({
          inField: true,
          fieldInstruction: "",
          skipFieldValue: false,
          fieldRunProperties:
            getElementByTagNameNSFallback(element, ns, "rPr")?.cloneNode(true) || null,
        });
      } else if (fldCharType === "separate") {
        // After separator, skip the field value runs until we hit end
        updateFieldState({ ...fieldState, skipFieldValue: true });
      } else if (fldCharType === "end" && fieldState.inField) {
        // Field complete - create a run with the field code
        if (fieldState.fieldInstruction.trim()) {
          const fieldRun = parseFieldRun(
            fieldState.fieldInstruction,
            fieldState.fieldRunProperties,
            ns,
            fieldContext,
          );
          if (fieldRun) {
            runs.push(fieldRun);
          }
        }
        updateFieldState({
          inField: false,
          skipFieldValue: false,
          fieldInstruction: "",
          fieldRunProperties: null,
        });
      }
    } else if (instrTextElements.length > 0 && fieldState.inField && !fieldState.skipFieldValue) {
      // Collect field instruction text
      const instrText = instrTextElements[0];
      if (instrText) {
        updateFieldState({
          ...fieldState,
          fieldInstruction: fieldState.fieldInstruction + (instrText.textContent || ""),
        });
      }
    } else if (!fieldState.inField && !fieldState.skipFieldValue) {
      // Direct run element (not part of a field)
      const run = parseRun(element, ns, undefined, stylesheet, theme);
      if (run && run.text) {
        runs.push(run);
      }
    }
  }

  // Check for drawing elements (images) in the run
  const drawingElements = getElementsByTagNameNSFallback(element, ns, "drawing");
  for (let j = 0; j < drawingElements.length; j++) {
    const drawingElement = drawingElements[j];
    if (!drawingElement) continue;
    const drawingInfo = parseDrawing(drawingElement);

    if (drawingInfo && imageRelationships && zip) {
      const imageRel = imageRelationships.get(drawingInfo.relationshipId);
      if (imageRel) {
        // Store drawing info and relationship for later async processing
        images.push({
          type: "image",
          data: new ArrayBuffer(0), // Placeholder - will be populated later
          mimeType: "image/png", // Placeholder
          width: drawingInfo.width,
          height: drawingInfo.height,
          alt: drawingInfo.description || drawingInfo.name || "Image",
          // Store metadata for later processing
          _drawingInfo: drawingInfo,
          _imageRel: imageRel,
        } as any);
      }
    }
  }
}

/**
 * Parse a hyperlink element
 */
export function parseHyperlink(
  element: Element,
  ns: string,
  runs: DocxRun[],
  relationships?: Map<string, string>,
  stylesheet?: DocxStylesheet,
  theme?: DocxTheme,
): void {
  const rId = element.getAttribute("r:id");
  let linkUrl: string | undefined;

  // Resolve rId to actual URL using relationships
  if (rId && relationships) {
    linkUrl = relationships.get(rId);
  }

  const hyperlinkRuns = getElementsByTagNameNSFallback(element, ns, "r");
  for (let j = 0; j < hyperlinkRuns.length; j++) {
    const runElement = hyperlinkRuns[j];
    if (!runElement) continue;
    const run = parseRun(runElement, ns, linkUrl, stylesheet, theme);
    if (run && run.text) {
      runs.push(run);
    }
  }
}

/**
 * Parse a structured document tag (content control)
 */
export function parseStructuredDocumentTag(
  element: Element,
  ns: string,
  runs: DocxRun[],
  fieldState: FieldParsingState,
  updateFieldState: (state: FieldParsingState) => void,
  stylesheet?: DocxStylesheet,
  theme?: DocxTheme,
  fieldContext?: FieldParsingContext,
): void {
  const sdtContent = getElementByTagNameNSFallback(element, ns, "sdtContent");
  if (sdtContent) {
    // Parse all runs inside the SDT content
    const sdtChildren = Array.from(sdtContent.childNodes);
    for (const sdtChild of sdtChildren) {
      if (sdtChild.nodeType === 1) {
        const sdtElement = sdtChild as Element;
        const sdtLocalName =
          sdtElement.localName || sdtElement.tagName.split(":").pop() || sdtElement.tagName;
        if (sdtLocalName === "r") {
          // Recursively parse run element inside SDT
          parseRunElement(
            sdtElement,
            ns,
            runs,
            [],
            undefined,
            undefined,
            fieldState,
            updateFieldState,
            stylesheet,
            theme,
            fieldContext,
          );
        }
      }
    }
  }
}

/**
 * Parse a run element
 * @param runElement - The run element to parse
 * @param ns - The namespace string
 * @param linkUrl - Optional URL if this run is inside a hyperlink
 * @param stylesheet - Document stylesheet for style resolution
 * @param theme - Document theme for color and font resolution
 * @returns Parsed run or null
 */
export function parseRun(
  runElement: Element,
  ns: string,
  linkUrl?: string,
  stylesheet?: DocxStylesheet,
  theme?: DocxTheme,
): DocxRun | null {
  // Parse all text content including tabs
  let text = "";
  const textElements = getElementsByTagNameNSFallback(runElement, ns, "t");

  for (let i = 0; i < textElements.length; i++) {
    const textElement = textElements[i];
    if (!textElement) continue;
    text += textElement.textContent || "";
  }

  // Also check for tab elements
  const tabElements = getElementsByTagNameNSFallback(runElement, ns, "tab");
  if (tabElements.length > 0) {
    text += "\t".repeat(tabElements.length);
  }

  if (!text) return null;

  // Parse run properties
  const runProps = getElementByTagNameNSFallback(runElement, ns, "rPr");

  let bold = false;
  let italic = false;
  let underline = false;
  let strikethrough = false;
  let superscript = false;
  let subscript = false;
  let fontSize: string | undefined;
  let fontSizeCs: string | undefined;
  let fontFamily: string | undefined;
  let color: string | undefined;
  let backgroundColor: string | undefined;

  // Advanced formatting properties
  let characterSpacing: number | undefined;
  let position: number | undefined;
  let emboss = false;
  let imprint = false;
  let outline = false;
  let shadow = false;
  let smallCaps = false;
  let caps = false;
  let hidden = false;
  let doubleStrikethrough = false;
  let kerning: number | undefined;
  let textScale: number | undefined;
  let emphasis: ST_Em | undefined;
  let lang: string | undefined;

  if (runProps) {
    // Bold - check both b and bCs, OR logic (either can make text bold)
    const hasB = parseOnOffValue(runProps, ns, "b");
    const hasBCs = parseOnOffValue(runProps, ns, "bCs");
    bold = hasB || hasBCs; // OR logic: bold is true if either is present and enabled

    // Italic - check both i and iCs, OR logic (either can make text italic)
    const hasI = parseOnOffValue(runProps, ns, "i");
    const hasICs = parseOnOffValue(runProps, ns, "iCs");
    italic = hasI || hasICs; // OR logic: italic is true if either is present and enabled

    // Underline - check for u element (note: this is more complex than OnOff)
    underline = hasChildElementNS(runProps, ns, "u");

    // Strikethrough
    strikethrough = parseOnOffValue(runProps, ns, "strike");

    // Double strikethrough
    doubleStrikethrough = parseOnOffValue(runProps, ns, "dstrike");

    // Superscript/subscript from vertAlign
    const vertAlignElement = getElementByTagNameNSFallback(runProps, ns, "vertAlign");
    const vertAlign = vertAlignElement?.getAttribute("w:val");
    if (vertAlign === "superscript") superscript = true;
    if (vertAlign === "subscript") subscript = true;

    // Font size (half-points)
    const szElement = getElementByTagNameNSFallback(runProps, ns, "sz");
    fontSize = szElement?.getAttribute("w:val") || undefined;

    // Complex script font size (half-points)
    const szCsElement = getElementByTagNameNSFallback(runProps, ns, "szCs");
    fontSizeCs = szCsElement?.getAttribute("w:val") || undefined;

    // Font family
    const fontElement = getElementByTagNameNSFallback(runProps, ns, "rFonts");
    const fontAscii = fontElement?.getAttribute("w:ascii");
    if (fontAscii) {
      // Check if it's a theme font reference (starts with +)
      if (fontAscii.startsWith("+") && theme) {
        const resolvedFont = resolveThemeFont(fontAscii, theme);
        fontFamily = resolvedFont || fontAscii;
      } else {
        fontFamily = fontAscii;
      }
    }

    // Color
    const colorElement = getElementByTagNameNSFallback(runProps, ns, "color");
    const colorVal = colorElement?.getAttribute("w:val");
    if (colorVal && colorElement) {
      // Check if it's a theme color reference
      const themeColor = colorElement.getAttribute("w:themeColor");
      if (themeColor && theme) {
        const resolvedColor = resolveThemeColor(themeColor, theme);
        color = resolvedColor || colorVal;
      } else {
        color = colorVal;
      }
    }

    // Background color (highlighting)
    const highlightElement = getElementByTagNameNSFallback(runProps, ns, "highlight");
    const highlightColor = highlightElement?.getAttribute("w:val");
    if (highlightColor && highlightColor !== "none") {
      // Map Word highlight colors to hex
      const highlightMap: Record<string, string> = {
        yellow: "#FFFF00",
        green: "#00FF00",
        cyan: "#00FFFF",
        magenta: "#FF00FF",
        blue: "#0000FF",
        red: "#FF0000",
        darkBlue: "#000080",
        darkCyan: "#008080",
        darkGreen: "#008000",
        darkMagenta: "#800080",
        darkRed: "#800000",
        darkYellow: "#808000",
        darkGray: "#808080",
        lightGray: "#C0C0C0",
        black: "#000000",
      };
      backgroundColor = highlightMap[highlightColor] || `#${highlightColor}`;
    }

    // Also check for shading background
    const shadingElement = getElementByTagNameNSFallback(runProps, ns, "shd");
    const shadingFill = shadingElement?.getAttribute("w:fill");
    if (shadingFill && shadingFill !== "auto" && !backgroundColor) {
      backgroundColor = `#${shadingFill}`;
    }

    // Advanced formatting properties

    // Character spacing (w:spacing in twips)
    const spacingElement = getElementByTagNameNSFallback(runProps, ns, "spacing");
    const spacingVal = spacingElement?.getAttribute("w:val");
    if (spacingVal) {
      characterSpacing = parseInt(spacingVal, 10);
    }

    // Position (w:position in twips - vertical adjustment)
    const positionElement = getElementByTagNameNSFallback(runProps, ns, "position");
    const positionVal = positionElement?.getAttribute("w:val");
    if (positionVal) {
      position = parseInt(positionVal, 10);
    }

    // Text effects
    emboss = parseOnOffValue(runProps, ns, "emboss");
    imprint = parseOnOffValue(runProps, ns, "imprint");
    outline = parseOnOffValue(runProps, ns, "outline");
    shadow = parseOnOffValue(runProps, ns, "shadow");
    smallCaps = parseOnOffValue(runProps, ns, "smallCaps");
    caps = parseOnOffValue(runProps, ns, "caps");
    hidden = parseOnOffValue(runProps, ns, "vanish");

    // Kerning (minimum font size for kerning in half-points)
    const kernElement = getElementByTagNameNSFallback(runProps, ns, "kern");
    const kernVal = kernElement?.getAttribute("w:val");
    if (kernVal) {
      kerning = parseInt(kernVal, 10);
    }

    // Text scale (horizontal scaling percentage)
    const wElement = getElementByTagNameNSFallback(runProps, ns, "w");
    const wVal = wElement?.getAttribute("w:val");
    if (wVal) {
      textScale = parseInt(wVal, 10);
    }

    // Emphasis mark
    const emElement = getElementByTagNameNSFallback(runProps, ns, "em");
    const emVal = emElement?.getAttribute("w:val");
    if (emVal) {
      switch (emVal) {
        case "dot":
          emphasis = ST_Em.Dot;
          break;
        case "comma":
          emphasis = ST_Em.Comma;
          break;
        case "circle":
          emphasis = ST_Em.Circle;
          break;
        case "underDot":
          emphasis = ST_Em.UnderDot;
          break;
      }
    }

    // Language - but don't apply language attributes to punctuation-only text
    // This prevents issues where quotation marks get incorrectly tagged with Arabic or other language codes
    const langElement = getElementByTagNameNSFallback(runProps, ns, "lang");
    const langValue = langElement?.getAttribute("w:val");

    // Only apply language if it's not punctuation-only text or if it's a sensible language for punctuation
    if (langValue && !isPunctuationOnly(text)) {
      lang = langValue;
    } else if (langValue && isPunctuationOnly(text)) {
      // For punctuation-only text, only keep common/neutral language codes
      const neutralLanguages = ["en-US", "en-GB", "en", "default"];
      if (neutralLanguages.includes(langValue)) {
        lang = langValue;
      }
      // Otherwise, leave lang as undefined to avoid inappropriate language tagging
    } else {
      lang = langValue || undefined;
    }
  }

  // Apply style cascade if stylesheet is available
  if (stylesheet) {
    const runProps = {
      bold,
      italic,
      underline,
      strikethrough,
      superscript,
      subscript,
      fontSize,
      fontSizeCs,
      fontFamily,
      color,
      backgroundColor,
      characterSpacing,
      position,
      emboss,
      imprint,
      outline,
      shadow,
      smallCaps,
      caps,
      hidden,
      doubleStrikethrough,
      kerning,
      textScale,
      emphasis,
      lang,
    };

    // Apply style cascade (no paragraph style ID here, just run properties)
    const { run: resolvedRunProps } = applyStyleCascade(
      undefined, // No paragraph style ID at run level
      undefined, // No paragraph properties at run level
      runProps,
      stylesheet,
    );

    // Update run properties with resolved values
    return {
      text,
      bold: resolvedRunProps.bold ?? false,
      italic: resolvedRunProps.italic ?? false,
      underline: resolvedRunProps.underline ?? false,
      strikethrough: resolvedRunProps.strikethrough ?? false,
      superscript: resolvedRunProps.superscript ?? false,
      subscript: resolvedRunProps.subscript ?? false,
      fontSize: resolvedRunProps.fontSize,
      fontSizeCs: resolvedRunProps.fontSizeCs,
      fontFamily: resolvedRunProps.fontFamily,
      color: resolvedRunProps.color,
      backgroundColor: resolvedRunProps.backgroundColor,
      link: linkUrl,
      characterSpacing: resolvedRunProps.characterSpacing,
      position: resolvedRunProps.position,
      emboss: resolvedRunProps.emboss ?? false,
      imprint: resolvedRunProps.imprint ?? false,
      outline: resolvedRunProps.outline ?? false,
      shadow: resolvedRunProps.shadow ?? false,
      smallCaps: resolvedRunProps.smallCaps ?? false,
      caps: resolvedRunProps.caps ?? false,
      hidden: resolvedRunProps.hidden ?? false,
      doubleStrikethrough: resolvedRunProps.doubleStrikethrough ?? false,
      kerning: resolvedRunProps.kerning,
      textScale: resolvedRunProps.textScale,
      emphasis: resolvedRunProps.emphasis,
      lang: resolvedRunProps.lang,
    };
  }

  return {
    text,
    bold,
    italic,
    underline,
    strikethrough,
    superscript,
    subscript,
    fontSize,
    fontSizeCs,
    fontFamily,
    color,
    backgroundColor,
    link: linkUrl,
    characterSpacing,
    position,
    emboss,
    imprint,
    outline,
    shadow,
    smallCaps,
    caps,
    hidden,
    doubleStrikethrough,
    kerning,
    textScale,
    emphasis,
    lang,
  };
}
