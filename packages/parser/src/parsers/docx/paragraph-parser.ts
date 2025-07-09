// Paragraph and run parsing functions
import type { DocxParagraph, DocxRun } from './types';
import { WORD_NAMESPACE } from './types';
import { parseFieldRun } from './field-parser';
import { parseDrawing } from './image-parser';
import type { Image } from '../../types/document';
import { getElementsByTagNameNSFallback, getElementByTagNameNSFallback, hasChildElementNS } from './xml-utils';
import { applyStyleCascade, type DocxStylesheet } from './style-parser';
import type { DocxTheme } from './theme-parser';
import { resolveThemeColor, resolveThemeFont } from './theme-parser';

/**
 * Parse a paragraph element
 * @param paragraphElement - The paragraph element to parse
 * @param relationships - Map of relationship IDs to URLs (for hyperlinks)
 * @param imageRelationships - Map of image relationship IDs
 * @param zip - JSZip instance for image extraction
 * @param stylesheet - Document stylesheet for style resolution
 * @param theme - Document theme for color and font resolution
 * @returns Parsed paragraph or null
 */
export function parseParagraph(
  paragraphElement: Element, 
  relationships?: Map<string, string>, 
  imageRelationships?: Map<string, any>, 
  zip?: any,
  stylesheet?: DocxStylesheet,
  theme?: DocxTheme
): DocxParagraph | null {
  const runs: DocxRun[] = [];
  const images: Image[] = [];
  const ns = WORD_NAMESPACE;
  
  // Get paragraph style
  const pPrElement = getElementByTagNameNSFallback(paragraphElement, ns, "pPr");
  let style: string | undefined;
  let numId: string | undefined;
  let ilvl: number | undefined;
  let alignment: DocxParagraph['alignment'];
  let outlineLevel: number | undefined;
  let spacing: DocxParagraph['spacing'] | undefined;
  let indentation: DocxParagraph['indentation'] | undefined;
  let textDirection: DocxParagraph['textDirection'];
  let verticalAlignment: DocxParagraph['verticalAlignment'];
  
  if (pPrElement) {
    const styleElement = getElementByTagNameNSFallback(pPrElement, ns, "pStyle");
    style = styleElement?.getAttribute("w:val") || undefined;
    
    // Get outline level (w:outlineLvl) - this is key for heading detection
    const outlineLvlElement = getElementByTagNameNSFallback(pPrElement, ns, "outlineLvl");
    const outlineLvlStr = outlineLvlElement?.getAttribute("w:val");
    if (outlineLvlStr) {
      outlineLevel = parseInt(outlineLvlStr, 10);
    }
    
    // Get alignment
    const jcElement = getElementByTagNameNSFallback(pPrElement, ns, "jc");
    const jcVal = jcElement?.getAttribute("w:val");
    if (jcVal) {
      switch (jcVal) {
        case 'center': alignment = 'center'; break;
        case 'right': alignment = 'right'; break;
        case 'both': case 'justify': alignment = 'justify'; break;
        case 'distribute': alignment = 'distribute'; break;
        case 'highKashida': alignment = 'highKashida'; break;
        case 'lowKashida': alignment = 'lowKashida'; break;
        case 'mediumKashida': alignment = 'mediumKashida'; break;
        case 'thaiDistribute': alignment = 'thaiDistribute'; break;
        case 'left': default: alignment = 'left'; break;
      }
    }
    
    // Get numbering info
    const numPrElement = getElementByTagNameNSFallback(pPrElement, ns, "numPr");
    if (numPrElement) {
      const numIdElement = getElementByTagNameNSFallback(numPrElement, ns, "numId");
      numId = numIdElement?.getAttribute("w:val") || undefined;
      const ilvlElement = getElementByTagNameNSFallback(numPrElement, ns, "ilvl");
      const ilvlStr = ilvlElement?.getAttribute("w:val");
      ilvl = ilvlStr ? parseInt(ilvlStr, 10) : undefined;
    }
    
    // Get spacing
    const spacingElement = getElementByTagNameNSFallback(pPrElement, ns, "spacing");
    if (spacingElement) {
      spacing = {};
      const before = spacingElement.getAttribute("w:before");
      const after = spacingElement.getAttribute("w:after");
      const line = spacingElement.getAttribute("w:line");
      const lineRule = spacingElement.getAttribute("w:lineRule");
      
      if (before) spacing.before = parseInt(before, 10);
      if (after) spacing.after = parseInt(after, 10);
      if (line) spacing.line = parseInt(line, 10);
      if (lineRule) spacing.lineRule = lineRule as 'auto' | 'exact' | 'atLeast';
    }
    
    // Get indentation
    const indElement = getElementByTagNameNSFallback(pPrElement, ns, "ind");
    if (indElement) {
      indentation = {};
      const left = indElement.getAttribute("w:left");
      const right = indElement.getAttribute("w:right");
      const firstLine = indElement.getAttribute("w:firstLine");
      const hanging = indElement.getAttribute("w:hanging");
      
      if (left) indentation.left = parseInt(left, 10);
      if (right) indentation.right = parseInt(right, 10);
      if (firstLine) indentation.firstLine = parseInt(firstLine, 10);
      if (hanging) indentation.hanging = parseInt(hanging, 10);
    }
    
    // Get text direction (bidi)
    const bidiElement = getElementByTagNameNSFallback(pPrElement, ns, "bidi");
    if (bidiElement && bidiElement.getAttribute("w:val") !== "0") {
      textDirection = 'rtl';
    }
    
    // Get text flow/vertical text
    const textFlowElement = getElementByTagNameNSFallback(pPrElement, ns, "textFlow");
    const textFlowVal = textFlowElement?.getAttribute("w:val");
    if (textFlowVal) {
      switch (textFlowVal) {
        case 'lrV': textDirection = 'lrV'; break;
        case 'tbV': textDirection = 'tbV'; break;
        case 'lrTbV': textDirection = 'lrTbV'; break;
        case 'tbLrV': textDirection = 'tbLrV'; break;
      }
    }
    
    // Get vertical alignment (for text within the paragraph)
    const textAlignmentElement = getElementByTagNameNSFallback(pPrElement, ns, "textAlignment");
    const textAlignmentVal = textAlignmentElement?.getAttribute("w:val");
    if (textAlignmentVal) {
      switch (textAlignmentVal) {
        case 'top': verticalAlignment = 'top'; break;
        case 'center': verticalAlignment = 'center'; break;
        case 'bottom': verticalAlignment = 'bottom'; break;
        case 'auto': case 'baseline': verticalAlignment = 'auto'; break;
      }
    }
  }
  
  // Parse runs - both direct runs and runs inside hyperlinks
  const allChildren = Array.from(paragraphElement.childNodes);
  
  // Track field parsing state
  let inField = false;
  let fieldInstruction = "";
  let fieldRunProperties: any = null;
  let skipFieldValue = false; // Track when to skip the field value between separate and end
  
  for (let i = 0; i < allChildren.length; i++) {
    const child = allChildren[i];
    if (!child || child.nodeType !== 1) continue; // Skip non-element nodes
    
    const element = child as Element;
    
    const localName = element.localName || element.tagName.split(':').pop() || element.tagName;
    
    if (localName === "r") {
      parseRunElement(element, ns, runs, images, imageRelationships, zip, 
        { inField, fieldInstruction, fieldRunProperties, skipFieldValue },
        (state) => {
          inField = state.inField;
          fieldInstruction = state.fieldInstruction;
          fieldRunProperties = state.fieldRunProperties;
          skipFieldValue = state.skipFieldValue;
        },
        stylesheet,
        theme
      );
    } else if (localName === "hyperlink") {
      parseHyperlink(element, ns, runs, relationships, stylesheet, theme);
    } else if (localName === "sdt") {
      parseStructuredDocumentTag(element, ns, runs, 
        { inField, fieldInstruction, fieldRunProperties, skipFieldValue },
        (state) => {
          inField = state.inField;
          fieldInstruction = state.fieldInstruction;
          fieldRunProperties = state.fieldRunProperties;
          skipFieldValue = state.skipFieldValue;
        },
        stylesheet,
        theme
      );
    }
  }
  
  // Apply style cascade for paragraph-level properties
  let resolvedAlignment = alignment;
  let resolvedSpacing = spacing;
  let resolvedIndentation = indentation;
  
  if (stylesheet) {
    const paragraphProps = pPrElement ? {
      alignment,
      outlineLevel,
      spacing,
      indent: indentation
    } : undefined;
    
    const { paragraph: resolvedParagraphProps } = applyStyleCascade(
      style,
      paragraphProps,
      undefined,
      stylesheet
    );
    
    // Update paragraph properties with resolved values
    if (resolvedParagraphProps.alignment) {
      resolvedAlignment = resolvedParagraphProps.alignment;
    }
    if (resolvedParagraphProps.outlineLevel !== undefined) {
      outlineLevel = resolvedParagraphProps.outlineLevel;
    }
    if (resolvedParagraphProps.spacing) {
      resolvedSpacing = resolvedParagraphProps.spacing;
    }
    if (resolvedParagraphProps.indent) {
      resolvedIndentation = resolvedParagraphProps.indent;
    }
  }
  
  // Always return paragraph data, even if empty (for headers/footers with field codes)
  return { 
    runs, 
    style, 
    numId, 
    ilvl, 
    alignment: resolvedAlignment, 
    outlineLevel,
    spacing: resolvedSpacing,
    indentation: resolvedIndentation,
    ...(textDirection && { textDirection }),
    ...(verticalAlignment && { verticalAlignment }),
    ...(images.length > 0 && { images }) 
  };
}

// Helper type for field parsing state
interface FieldParsingState {
  inField: boolean;
  fieldInstruction: string;
  fieldRunProperties: any;
  skipFieldValue: boolean;
}

/**
 * Parse a run element
 */
function parseRunElement(
  element: Element,
  ns: string,
  runs: DocxRun[],
  images: Image[],
  imageRelationships: Map<string, any> | undefined,
  zip: any,
  fieldState: FieldParsingState,
  updateFieldState: (state: FieldParsingState) => void,
  stylesheet?: DocxStylesheet,
  theme?: DocxTheme
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
          _footnoteRef: footnoteId // Mark this as a footnote reference
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
          fieldRunProperties: getElementByTagNameNSFallback(element, ns, "rPr")?.cloneNode(true) || null
        });
      } else if (fldCharType === "separate") {
        // After separator, skip the field value runs until we hit end
        updateFieldState({ ...fieldState, skipFieldValue: true });
      } else if (fldCharType === "end" && fieldState.inField) {
        // Field complete - create a run with the field code
        if (fieldState.fieldInstruction.trim()) {
          const fieldRun = parseFieldRun(fieldState.fieldInstruction, fieldState.fieldRunProperties, ns);
          if (fieldRun) {
            runs.push(fieldRun);
          }
        }
        updateFieldState({
          inField: false,
          skipFieldValue: false,
          fieldInstruction: "",
          fieldRunProperties: null
        });
      }
    } else if (instrTextElements.length > 0 && fieldState.inField && !fieldState.skipFieldValue) {
      // Collect field instruction text
      const instrText = instrTextElements[0];
      if (instrText) {
        updateFieldState({
          ...fieldState,
          fieldInstruction: fieldState.fieldInstruction + (instrText.textContent || "")
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
          type: 'image',
          data: new ArrayBuffer(0), // Placeholder - will be populated later
          mimeType: 'image/png', // Placeholder
          width: drawingInfo.width,
          height: drawingInfo.height,
          alt: drawingInfo.description || drawingInfo.name || 'Image',
          // Store metadata for later processing
          _drawingInfo: drawingInfo,
          _imageRel: imageRel
        } as any);
      }
    }
  }
}

/**
 * Parse a hyperlink element
 */
function parseHyperlink(
  element: Element,
  ns: string,
  runs: DocxRun[],
  relationships?: Map<string, string>,
  stylesheet?: DocxStylesheet,
  theme?: DocxTheme
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
function parseStructuredDocumentTag(
  element: Element,
  ns: string,
  runs: DocxRun[],
  fieldState: FieldParsingState,
  updateFieldState: (state: FieldParsingState) => void,
  stylesheet?: DocxStylesheet,
  theme?: DocxTheme
): void {
  const sdtContent = getElementByTagNameNSFallback(element, ns, "sdtContent");
  if (sdtContent) {
    // Parse all runs inside the SDT content
    const sdtChildren = Array.from(sdtContent.childNodes);
    for (const sdtChild of sdtChildren) {
      if (sdtChild.nodeType === 1) {
        const sdtElement = sdtChild as Element;
        const sdtLocalName = sdtElement.localName || sdtElement.tagName.split(':').pop() || sdtElement.tagName;
        if (sdtLocalName === "r") {
          // Recursively parse run element inside SDT
          parseRunElement(sdtElement, ns, runs, [], undefined, undefined, fieldState, updateFieldState, stylesheet, theme);
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
export function parseRun(runElement: Element, ns: string, linkUrl?: string, stylesheet?: DocxStylesheet, theme?: DocxTheme): DocxRun | null {
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
  let emphasis: 'dot' | 'comma' | 'circle' | 'underDot' | undefined;
  let lang: string | undefined;
  
  if (runProps) {
    // Bold - check both b and bCs with XOR logic
    const hasB = hasChildElementNS(runProps, ns, "b");
    const hasBCs = hasChildElementNS(runProps, ns, "bCs");
    bold = hasB !== hasBCs; // XOR logic: bold is true if only one is present
    
    // Italic - check both i and iCs with XOR logic
    const hasI = hasChildElementNS(runProps, ns, "i");
    const hasICs = hasChildElementNS(runProps, ns, "iCs");
    italic = hasI !== hasICs; // XOR logic: italic is true if only one is present
    
    // Underline
    underline = hasChildElementNS(runProps, ns, "u");
    
    // Strikethrough
    strikethrough = hasChildElementNS(runProps, ns, "strike");
    
    // Double strikethrough
    doubleStrikethrough = hasChildElementNS(runProps, ns, "dstrike");
    
    // Superscript/subscript from vertAlign
    const vertAlignElement = getElementByTagNameNSFallback(runProps, ns, "vertAlign");
    const vertAlign = vertAlignElement?.getAttribute("w:val");
    if (vertAlign === "superscript") superscript = true;
    if (vertAlign === "subscript") subscript = true;
    
    // Font size (half-points)
    const szElement = getElementByTagNameNSFallback(runProps, ns, "sz");
    fontSize = szElement?.getAttribute("w:val") || undefined;
    
    // Font family
    const fontElement = getElementByTagNameNSFallback(runProps, ns, "rFonts");
    const fontAscii = fontElement?.getAttribute("w:ascii");
    if (fontAscii) {
      // Check if it's a theme font reference (starts with +)
      if (fontAscii.startsWith('+') && theme) {
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
        'yellow': '#FFFF00',
        'green': '#00FF00',
        'cyan': '#00FFFF',
        'magenta': '#FF00FF',
        'blue': '#0000FF',
        'red': '#FF0000',
        'darkBlue': '#000080',
        'darkCyan': '#008080',
        'darkGreen': '#008000',
        'darkMagenta': '#800080',
        'darkRed': '#800000',
        'darkYellow': '#808000',
        'darkGray': '#808080',
        'lightGray': '#C0C0C0',
        'black': '#000000',
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
    emboss = hasChildElementNS(runProps, ns, "emboss");
    imprint = hasChildElementNS(runProps, ns, "imprint");
    outline = hasChildElementNS(runProps, ns, "outline");
    shadow = hasChildElementNS(runProps, ns, "shadow");
    smallCaps = hasChildElementNS(runProps, ns, "smallCaps");
    caps = hasChildElementNS(runProps, ns, "caps");
    hidden = hasChildElementNS(runProps, ns, "vanish");
    
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
    if (emVal && ['dot', 'comma', 'circle', 'underDot'].includes(emVal)) {
      emphasis = emVal as 'dot' | 'comma' | 'circle' | 'underDot';
    }
    
    // Language
    const langElement = getElementByTagNameNSFallback(runProps, ns, "lang");
    lang = langElement?.getAttribute("w:val") || undefined;
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
      lang
    };
    
    // Apply style cascade (no paragraph style ID here, just run properties)
    const { run: resolvedRunProps } = applyStyleCascade(
      undefined, // No paragraph style ID at run level
      undefined, // No paragraph properties at run level
      runProps,
      stylesheet
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
      lang: resolvedRunProps.lang
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
    lang
  };
}