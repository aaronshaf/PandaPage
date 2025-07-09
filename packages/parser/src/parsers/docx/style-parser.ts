// Style parsing functions for DOCX
import { WORD_NAMESPACE } from './types';
import type { DocxBorder, DocxShading, DocxParagraphBorders } from './types';
import type { ParagraphAlignmentString, TextDirectionString, VerticalAlignmentString, LineSpacingRuleString } from '@browser-document-viewer/ooxml-types';
import { getElementByTagNameNSFallback, getElementsByTagNameNSFallback } from './xml-utils';

export interface DocxStyle {
  id: string;
  name: string;
  type: 'paragraph' | 'character' | 'table' | 'numbering';
  basedOn?: string;
  isDefault?: boolean;
  paragraphProperties?: DocxParagraphProperties;
  runProperties?: DocxRunProperties;
}

export interface DocxParagraphProperties {
  alignment?: ParagraphAlignmentString;
  indent?: {
    left?: number;
    right?: number;
    hanging?: number;
    firstLine?: number;
  };
  spacing?: {
    before?: number;
    after?: number;
    line?: number;
    lineRule?: LineSpacingRuleString;
  };
  keepNext?: boolean;
  keepLines?: boolean;
  outlineLevel?: number;
  textDirection?: TextDirectionString;
  verticalAlignment?: VerticalAlignmentString | 'auto';
  borders?: DocxParagraphBorders;
  shading?: DocxShading;
}

export interface DocxRunProperties {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  fontSize?: string; // half-points (w:sz)
  fontSizeCs?: string; // complex script font size in half-points (w:szCs)
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  // Advanced text formatting
  characterSpacing?: number; // Twips (w:spacing)
  position?: number; // Twips (w:position)
  emboss?: boolean;
  imprint?: boolean;
  outline?: boolean;
  shadow?: boolean;
  smallCaps?: boolean;
  caps?: boolean;
  hidden?: boolean;
  doubleStrikethrough?: boolean;
  kerning?: number; // Minimum font size for kerning (half-points)
  textScale?: number; // Horizontal scaling percentage
  emphasis?: 'dot' | 'comma' | 'circle' | 'underDot';
  lang?: string;
}

export interface DocxStylesheet {
  defaults: {
    paragraph: DocxParagraphProperties;
    run: DocxRunProperties;
  };
  styles: Map<string, DocxStyle>;
}

/**
 * Parse styles.xml to extract style definitions
 */
export function parseStylesheet(xml: string): DocxStylesheet {
  let doc: Document;
  if (typeof DOMParser === 'undefined') {
    // @ts-ignore
    const { DOMParser: XMLDOMParser } = require('@xmldom/xmldom');
    const parser = new XMLDOMParser();
    doc = parser.parseFromString(xml, "text/xml");
  } else {
    const parser = new DOMParser();
    doc = parser.parseFromString(xml, "text/xml");
  }

  const ns = WORD_NAMESPACE;
  const styles = new Map<string, DocxStyle>();
  
  // Parse document defaults
  const docDefaults = doc.getElementsByTagNameNS(ns, 'docDefaults')[0];
  let defaultParagraphProps: DocxParagraphProperties = {};
  let defaultRunProps: DocxRunProperties = {};
  
  if (docDefaults) {
    // Parse default paragraph properties
    const pPrDefault = getElementByTagNameNSFallback(docDefaults, ns, 'pPrDefault');
    if (pPrDefault) {
      const pPr = getElementByTagNameNSFallback(pPrDefault, ns, 'pPr');
      if (pPr) {
        defaultParagraphProps = parseParagraphProperties(pPr, ns);
      }
    }
    
    // Parse default run properties
    const rPrDefault = getElementByTagNameNSFallback(docDefaults, ns, 'rPrDefault');
    if (rPrDefault) {
      const rPr = getElementByTagNameNSFallback(rPrDefault, ns, 'rPr');
      if (rPr) {
        defaultRunProps = parseRunProperties(rPr, ns);
      }
    }
  }
  
  // Parse individual styles
  const styleElements = getElementsByTagNameNSFallback(doc.documentElement, ns, 'style');
  for (let i = 0; i < styleElements.length; i++) {
    const styleElement = styleElements[i];
    if (!styleElement) continue;
    
    const style = parseStyle(styleElement, ns);
    if (style) {
      styles.set(style.id, style);
    }
  }
  
  return {
    defaults: {
      paragraph: defaultParagraphProps,
      run: defaultRunProps
    },
    styles
  };
}

/**
 * Parse a single style element
 */
function parseStyle(styleElement: Element, ns: string): DocxStyle | null {
  const id = styleElement.getAttribute('w:styleId');
  const type = styleElement.getAttribute('w:type') as 'paragraph' | 'character' | 'table' | 'numbering';
  const isDefault = styleElement.getAttribute('w:default') === '1';
  
  if (!id || !type) return null;
  
  // Get style name
  const nameElement = getElementByTagNameNSFallback(styleElement, ns, 'name');
  const name = nameElement?.getAttribute('w:val') || id;
  
  // Get basedOn
  const basedOnElement = getElementByTagNameNSFallback(styleElement, ns, 'basedOn');
  const basedOn = basedOnElement?.getAttribute('w:val') || undefined;
  
  // Parse properties
  let paragraphProperties: DocxParagraphProperties | undefined;
  let runProperties: DocxRunProperties | undefined;
  
  if (type === 'paragraph') {
    const pPr = getElementByTagNameNSFallback(styleElement, ns, 'pPr');
    if (pPr) {
      paragraphProperties = parseParagraphProperties(pPr, ns);
    }
  }
  
  const rPr = getElementByTagNameNSFallback(styleElement, ns, 'rPr');
  if (rPr) {
    runProperties = parseRunProperties(rPr, ns);
  }
  
  return {
    id,
    name,
    type,
    basedOn,
    isDefault,
    paragraphProperties,
    runProperties
  };
}

/**
 * Parse paragraph properties
 */
function parseParagraphProperties(pPr: Element, ns: string): DocxParagraphProperties {
  const props: DocxParagraphProperties = {};
  
  // Alignment
  const jc = getElementByTagNameNSFallback(pPr, ns, 'jc');
  const jcVal = jc?.getAttribute('w:val');
  if (jcVal) {
    switch (jcVal) {
      case 'center': props.alignment = 'center'; break;
      case 'right': case 'end': props.alignment = 'end'; break;
      case 'both': case 'justify': props.alignment = 'both'; break;
      case 'distribute': props.alignment = 'distribute'; break;
      case 'highKashida': props.alignment = 'highKashida'; break;
      case 'lowKashida': props.alignment = 'lowKashida'; break;
      case 'mediumKashida': props.alignment = 'mediumKashida'; break;
      case 'thaiDistribute': props.alignment = 'thaiDistribute'; break;
      case 'left': case 'start': default: props.alignment = 'start'; break;
    }
  }
  
  // Indentation
  const ind = getElementByTagNameNSFallback(pPr, ns, 'ind');
  if (ind) {
    props.indent = {};
    const left = ind.getAttribute('w:left');
    const right = ind.getAttribute('w:right');
    const hanging = ind.getAttribute('w:hanging');
    const firstLine = ind.getAttribute('w:firstLine');
    
    if (left) props.indent.left = parseInt(left, 10);
    if (right) props.indent.right = parseInt(right, 10);
    if (hanging) props.indent.hanging = parseInt(hanging, 10);
    if (firstLine) props.indent.firstLine = parseInt(firstLine, 10);
  }
  
  // Spacing
  const spacing = getElementByTagNameNSFallback(pPr, ns, 'spacing');
  if (spacing) {
    props.spacing = {};
    const before = spacing.getAttribute('w:before');
    const after = spacing.getAttribute('w:after');
    const line = spacing.getAttribute('w:line');
    const lineRule = spacing.getAttribute('w:lineRule');
    
    if (before) props.spacing.before = parseInt(before, 10);
    if (after) props.spacing.after = parseInt(after, 10);
    if (line) props.spacing.line = parseInt(line, 10);
    if (lineRule) props.spacing.lineRule = lineRule as 'auto' | 'exact' | 'atLeast';
  }
  
  // Keep properties
  const keepNext = getElementByTagNameNSFallback(pPr, ns, 'keepNext');
  if (keepNext) props.keepNext = keepNext.getAttribute('w:val') !== '0';
  
  const keepLines = getElementByTagNameNSFallback(pPr, ns, 'keepLines');
  if (keepLines) props.keepLines = keepLines.getAttribute('w:val') !== '0';
  
  // Outline level
  const outlineLvl = getElementByTagNameNSFallback(pPr, ns, 'outlineLvl');
  if (outlineLvl) {
    const level = outlineLvl.getAttribute('w:val');
    if (level) props.outlineLevel = parseInt(level, 10);
  }
  
  // Text direction (bidi)
  const bidi = getElementByTagNameNSFallback(pPr, ns, 'bidi');
  if (bidi && bidi.getAttribute('w:val') !== '0') {
    props.textDirection = 'rtl';
  }
  
  // Text flow/vertical text
  const textFlow = getElementByTagNameNSFallback(pPr, ns, 'textFlow');
  const textFlowVal = textFlow?.getAttribute('w:val');
  if (textFlowVal) {
    switch (textFlowVal) {
      case 'lrV': props.textDirection = 'lrV'; break;
      case 'tbV': props.textDirection = 'tbV'; break;
      case 'lrTbV': props.textDirection = 'lrTbV'; break;
      case 'tbLrV': props.textDirection = 'tbLrV'; break;
    }
  }
  
  // Vertical alignment
  const textAlignment = getElementByTagNameNSFallback(pPr, ns, 'textAlignment');
  const textAlignmentVal = textAlignment?.getAttribute('w:val');
  if (textAlignmentVal) {
    switch (textAlignmentVal) {
      case 'top': props.verticalAlignment = 'top'; break;
      case 'center': props.verticalAlignment = 'center'; break;
      case 'bottom': props.verticalAlignment = 'bottom'; break;
      case 'auto': case 'baseline': props.verticalAlignment = 'auto'; break;
    }
  }
  
  // Borders
  const pBdr = getElementByTagNameNSFallback(pPr, ns, 'pBdr');
  if (pBdr) {
    props.borders = parseParagraphBorders(pBdr, ns);
  }
  
  // Shading
  const shd = getElementByTagNameNSFallback(pPr, ns, 'shd');
  if (shd) {
    props.shading = parseShading(shd);
  }
  
  return props;
}

/**
 * Parse run properties
 */
function parseRunProperties(rPr: Element, ns: string): DocxRunProperties {
  const props: DocxRunProperties = {};
  
  // Bold
  const b = getElementByTagNameNSFallback(rPr, ns, 'b');
  if (b) props.bold = b.getAttribute('w:val') !== '0';
  
  // Italic
  const i = getElementByTagNameNSFallback(rPr, ns, 'i');
  if (i) props.italic = i.getAttribute('w:val') !== '0';
  
  // Underline
  const u = getElementByTagNameNSFallback(rPr, ns, 'u');
  if (u) props.underline = u.getAttribute('w:val') !== 'none';
  
  // Strikethrough
  const strike = getElementByTagNameNSFallback(rPr, ns, 'strike');
  if (strike) props.strikethrough = strike.getAttribute('w:val') !== '0';
  
  // Superscript/subscript
  const vertAlign = getElementByTagNameNSFallback(rPr, ns, 'vertAlign');
  if (vertAlign) {
    const val = vertAlign.getAttribute('w:val');
    if (val === 'superscript') props.superscript = true;
    if (val === 'subscript') props.subscript = true;
  }
  
  // Font size
  const sz = getElementByTagNameNSFallback(rPr, ns, 'sz');
  if (sz) props.fontSize = sz.getAttribute('w:val') || undefined;
  
  // Complex script font size
  const szCs = getElementByTagNameNSFallback(rPr, ns, 'szCs');
  if (szCs) props.fontSizeCs = szCs.getAttribute('w:val') || undefined;
  
  // Font family
  const rFonts = getElementByTagNameNSFallback(rPr, ns, 'rFonts');
  if (rFonts) {
    props.fontFamily = rFonts.getAttribute('w:ascii') || 
                       rFonts.getAttribute('w:hAnsi') || 
                       rFonts.getAttribute('w:cs') || undefined;
  }
  
  // Color
  const color = getElementByTagNameNSFallback(rPr, ns, 'color');
  if (color) props.color = color.getAttribute('w:val') || undefined;
  
  // Background/highlighting
  const highlight = getElementByTagNameNSFallback(rPr, ns, 'highlight');
  if (highlight) {
    const highlightColor = highlight.getAttribute('w:val');
    if (highlightColor && highlightColor !== 'none') {
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
      props.backgroundColor = highlightMap[highlightColor] || `#${highlightColor}`;
    }
  }
  
  // Advanced formatting properties
  
  // Double strikethrough
  const dstrike = getElementByTagNameNSFallback(rPr, ns, 'dstrike');
  if (dstrike) props.doubleStrikethrough = dstrike.getAttribute('w:val') !== '0';
  
  // Character spacing
  const spacing = getElementByTagNameNSFallback(rPr, ns, 'spacing');
  if (spacing) {
    const val = spacing.getAttribute('w:val');
    if (val) props.characterSpacing = parseInt(val, 10);
  }
  
  // Position (vertical)
  const position = getElementByTagNameNSFallback(rPr, ns, 'position');
  if (position) {
    const val = position.getAttribute('w:val');
    if (val) props.position = parseInt(val, 10);
  }
  
  // Text effects
  const emboss = getElementByTagNameNSFallback(rPr, ns, 'emboss');
  if (emboss) props.emboss = emboss.getAttribute('w:val') !== '0';
  
  const imprint = getElementByTagNameNSFallback(rPr, ns, 'imprint');
  if (imprint) props.imprint = imprint.getAttribute('w:val') !== '0';
  
  const outline = getElementByTagNameNSFallback(rPr, ns, 'outline');
  if (outline) props.outline = outline.getAttribute('w:val') !== '0';
  
  const shadow = getElementByTagNameNSFallback(rPr, ns, 'shadow');
  if (shadow) props.shadow = shadow.getAttribute('w:val') !== '0';
  
  const smallCaps = getElementByTagNameNSFallback(rPr, ns, 'smallCaps');
  if (smallCaps) props.smallCaps = smallCaps.getAttribute('w:val') !== '0';
  
  const caps = getElementByTagNameNSFallback(rPr, ns, 'caps');
  if (caps) props.caps = caps.getAttribute('w:val') !== '0';
  
  const vanish = getElementByTagNameNSFallback(rPr, ns, 'vanish');
  if (vanish) props.hidden = vanish.getAttribute('w:val') !== '0';
  
  // Kerning
  const kern = getElementByTagNameNSFallback(rPr, ns, 'kern');
  if (kern) {
    const val = kern.getAttribute('w:val');
    if (val) props.kerning = parseInt(val, 10);
  }
  
  // Text scale
  const w = getElementByTagNameNSFallback(rPr, ns, 'w');
  if (w) {
    const val = w.getAttribute('w:val');
    if (val) props.textScale = parseInt(val, 10);
  }
  
  // Emphasis mark
  const em = getElementByTagNameNSFallback(rPr, ns, 'em');
  if (em) {
    const val = em.getAttribute('w:val');
    if (val && ['dot', 'comma', 'circle', 'underDot'].includes(val)) {
      props.emphasis = val as 'dot' | 'comma' | 'circle' | 'underDot';
    }
  }
  
  // Language
  const lang = getElementByTagNameNSFallback(rPr, ns, 'lang');
  if (lang) props.lang = lang.getAttribute('w:val') || undefined;
  
  return props;
}

/**
 * Resolve a style by following the basedOn chain and merging properties
 */
export function resolveStyle(styleId: string, stylesheet: DocxStylesheet): DocxStyle | null {
  const style = stylesheet.styles.get(styleId);
  if (!style) return null;
  
  // If no basedOn, return the style as-is
  if (!style.basedOn) return style;
  
  // Recursively resolve the base style
  const baseStyle = resolveStyle(style.basedOn, stylesheet);
  if (!baseStyle) return style;
  
  // Merge properties from base style
  const resolved: DocxStyle = {
    ...style,
    paragraphProperties: {
      ...baseStyle.paragraphProperties,
      ...style.paragraphProperties
    },
    runProperties: {
      ...baseStyle.runProperties,
      ...style.runProperties
    }
  };
  
  return resolved;
}

/**
 * Apply style cascade: defaults → style → paragraph properties → run properties
 */
export function applyStyleCascade(
  styleId: string | undefined,
  paragraphProps: DocxParagraphProperties | undefined,
  runProps: DocxRunProperties | undefined,
  stylesheet: DocxStylesheet
): { paragraph: DocxParagraphProperties; run: DocxRunProperties } {
  
  // Start with document defaults
  let finalParagraphProps = { ...stylesheet.defaults.paragraph };
  let finalRunProps = { ...stylesheet.defaults.run };
  
  // Apply style if specified
  if (styleId) {
    const resolvedStyle = resolveStyle(styleId, stylesheet);
    if (resolvedStyle) {
      if (resolvedStyle.paragraphProperties) {
        finalParagraphProps = { ...finalParagraphProps, ...resolvedStyle.paragraphProperties };
        // Deep merge borders and shading from style
        if (resolvedStyle.paragraphProperties.borders) {
          finalParagraphProps.borders = {
            ...finalParagraphProps.borders,
            ...resolvedStyle.paragraphProperties.borders
          };
        }
        if (resolvedStyle.paragraphProperties.shading) {
          finalParagraphProps.shading = {
            ...finalParagraphProps.shading,
            ...resolvedStyle.paragraphProperties.shading
          };
        }
      }
      if (resolvedStyle.runProperties) {
        finalRunProps = { ...finalRunProps, ...resolvedStyle.runProperties };
      }
    }
  }
  
  // Apply paragraph-level properties
  if (paragraphProps) {
    // Save borders and shading before spread (which might overwrite with undefined)
    const preservedBorders = finalParagraphProps.borders;
    const preservedShading = finalParagraphProps.shading;
    
    finalParagraphProps = { ...finalParagraphProps, ...paragraphProps };
    
    // Restore borders if they were overwritten with undefined
    if (paragraphProps.borders === undefined && preservedBorders) {
      finalParagraphProps.borders = preservedBorders;
    } else if (paragraphProps.borders && preservedBorders) {
      // Deep merge if both exist
      finalParagraphProps.borders = {
        ...preservedBorders,
        ...paragraphProps.borders
      };
    }
    
    // Restore shading if it was overwritten with undefined
    if (paragraphProps.shading === undefined && preservedShading) {
      finalParagraphProps.shading = preservedShading;
    } else if (paragraphProps.shading && preservedShading) {
      // Deep merge if both exist
      finalParagraphProps.shading = {
        ...preservedShading,
        ...paragraphProps.shading
      };
    }
  }
  
  // Apply run-level properties
  if (runProps) {
    finalRunProps = { ...finalRunProps, ...runProps };
  }
  
  return {
    paragraph: finalParagraphProps,
    run: finalRunProps
  };
}

/**
 * Parse a border element
 */
function parseBorder(borderElement: Element | null): DocxBorder | undefined {
  if (!borderElement) return undefined;
  
  const border: DocxBorder = {};
  
  // Border style
  const val = borderElement.getAttribute('w:val');
  if (val && val !== 'nil' && val !== 'none') {
    border.style = val as DocxBorder['style'];
  } else if (val === 'nil' || val === 'none') {
    border.style = 'none';
  }
  
  // Border color
  const color = borderElement.getAttribute('w:color');
  if (color && color !== 'auto') {
    border.color = color.startsWith('#') ? color : `#${color}`;
  }
  
  // Border size (in eighth-points)
  const sz = borderElement.getAttribute('w:sz');
  if (sz) {
    border.size = parseInt(sz, 10);
  }
  
  // Space from text (in points)
  const space = borderElement.getAttribute('w:space');
  if (space) {
    border.space = parseInt(space, 10);
  }
  
  return Object.keys(border).length > 0 ? border : undefined;
}

/**
 * Parse paragraph borders
 */
function parseParagraphBorders(pBdrElement: Element, ns: string): DocxParagraphBorders | undefined {
  const borders: DocxParagraphBorders = {};
  
  // Top border
  const top = getElementByTagNameNSFallback(pBdrElement, ns, 'top');
  const topBorder = parseBorder(top);
  if (topBorder) borders.top = topBorder;
  
  // Bottom border
  const bottom = getElementByTagNameNSFallback(pBdrElement, ns, 'bottom');
  const bottomBorder = parseBorder(bottom);
  if (bottomBorder) borders.bottom = bottomBorder;
  
  // Left border
  const left = getElementByTagNameNSFallback(pBdrElement, ns, 'left');
  const leftBorder = parseBorder(left);
  if (leftBorder) borders.left = leftBorder;
  
  // Right border
  const right = getElementByTagNameNSFallback(pBdrElement, ns, 'right');
  const rightBorder = parseBorder(right);
  if (rightBorder) borders.right = rightBorder;
  
  // Between border (for consecutive paragraphs with same style)
  const between = getElementByTagNameNSFallback(pBdrElement, ns, 'between');
  const betweenBorder = parseBorder(between);
  if (betweenBorder) borders.between = betweenBorder;
  
  return Object.keys(borders).length > 0 ? borders : undefined;
}

/**
 * Parse shading element
 */
function parseShading(shdElement: Element): DocxShading | undefined {
  const shading: DocxShading = {};
  
  // Shading pattern
  const val = shdElement.getAttribute('w:val');
  if (val && val !== 'nil') {
    shading.val = val as DocxShading['val'];
  }
  
  // Fill color (background)
  const fill = shdElement.getAttribute('w:fill');
  if (fill && fill !== 'auto') {
    shading.fill = fill.startsWith('#') ? fill : `#${fill}`;
  }
  
  // Pattern color
  const color = shdElement.getAttribute('w:color');
  if (color && color !== 'auto') {
    shading.color = color.startsWith('#') ? color : `#${color}`;
  }
  
  return Object.keys(shading).length > 0 ? shading : undefined;
}