// Paragraph parsing functions
import type { DocxParagraph, DocxRun } from './types';
import { WORD_NAMESPACE } from './types';
import { parseFieldRun } from './field-parser';
import type { FieldParsingContext } from './field-context';
import type { Image } from '../../types/document';
import { getElementByTagNameNSFallback } from './xml-utils';
import { mapParagraphAlignment } from './ooxml-mappers';
import { applyStyleCascade, type DocxStylesheet } from './style-parser';
import type { DocxTheme } from './theme-parser';
import { parseRunElement, parseHyperlink, parseStructuredDocumentTag, parseRun, type FieldParsingState } from './run-parser';
import { parseParagraphBorders, parseShading } from './border-parser';

// Re-export parseRun for other modules
export { parseRun };

/**
 * Parse a paragraph element
 * @param paragraphElement - The paragraph element to parse
 * @param relationships - Map of relationship IDs to URLs (for hyperlinks)
 * @param imageRelationships - Map of image relationship IDs
 * @param zip - JSZip instance for image extraction
 * @param stylesheet - Document stylesheet for style resolution
 * @param theme - Document theme for color and font resolution
 * @param fieldContext - Context for field code resolution
 * @returns Parsed paragraph or null
 */
export function parseParagraph(
  paragraphElement: Element, 
  relationships?: Map<string, string>, 
  imageRelationships?: Map<string, any>, 
  zip?: any,
  stylesheet?: DocxStylesheet,
  theme?: DocxTheme,
  fieldContext?: FieldParsingContext
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
  let borders: DocxParagraph['borders'] | undefined;
  let shading: DocxParagraph['shading'] | undefined;
  
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
      alignment = mapParagraphAlignment(jcVal);
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
    
    // Get borders
    const pBdrElement = getElementByTagNameNSFallback(pPrElement, ns, "pBdr");
    if (pBdrElement) {
      borders = parseParagraphBorders(pBdrElement, ns);
    }
    
    // Get shading
    const shdElement = getElementByTagNameNSFallback(pPrElement, ns, "shd");
    if (shdElement) {
      shading = parseShading(shdElement);
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
        theme,
        fieldContext
      );
    } else if (localName === "fldSimple") {
      // Handle simple field codes (single element)
      const instruction = element.getAttribute("w:instr");
      if (instruction) {
        const fieldRun = parseFieldRun(instruction, null, ns, fieldContext);
        if (fieldRun) {
          runs.push(fieldRun);
        }
      }
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
        theme,
        fieldContext
      );
    }
  }
  
  // Apply style cascade for paragraph-level properties
  let resolvedAlignment = alignment;
  let resolvedSpacing = spacing;
  let resolvedIndentation = indentation;
  let resolvedBorders = borders;
  let resolvedShading = shading;
  
  if (stylesheet) {
    const paragraphProps = pPrElement ? {
      alignment,
      outlineLevel,
      spacing,
      indent: indentation,
      borders,
      shading
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
    if (resolvedParagraphProps.borders) {
      resolvedBorders = resolvedParagraphProps.borders;
    }
    if (resolvedParagraphProps.shading) {
      resolvedShading = resolvedParagraphProps.shading;
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
    ...(resolvedBorders && { borders: resolvedBorders }),
    ...(resolvedShading && { shading: resolvedShading }),
    ...(images.length > 0 && { images }) 
  };
}

