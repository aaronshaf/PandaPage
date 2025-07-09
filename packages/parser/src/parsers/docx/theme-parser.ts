import { Effect } from 'effect';
import { DocxParseError } from './types';
import { getElementByTagNameNSFallback, getElementsByTagNameNSFallback } from './xml-utils';

// DrawingML namespace for themes
export const DRAWINGML_NAMESPACE = "http://schemas.openxmlformats.org/drawingml/2006/main";

export interface ThemeColor {
  name: string;
  value: string;
}

export interface ThemeFont {
  type: 'major' | 'minor';
  script: string;
  typeface: string;
}

export interface DocxTheme {
  colors: Map<string, string>; // color scheme name -> hex value
  fonts: {
    major: Map<string, string>; // script -> typeface
    minor: Map<string, string>; // script -> typeface
  };
}

/**
 * Parse theme colors from clrScheme element
 */
function parseColorScheme(clrScheme: Element, ns: string): Map<string, string> {
  const colors = new Map<string, string>();
  
  // Standard theme color names
  const colorNames = [
    'dk1', 'lt1', 'dk2', 'lt2',
    'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6',
    'hlink', 'folHlink'
  ];
  
  for (const colorName of colorNames) {
    const colorElement = getElementByTagNameNSFallback(clrScheme, ns, colorName);
    if (colorElement) {
      // Look for srgbClr
      const srgbClr = getElementByTagNameNSFallback(colorElement, ns, 'srgbClr');
      if (srgbClr) {
        const val = srgbClr.getAttribute('val');
        if (val) {
          colors.set(colorName, `#${val}`);
        }
      }
      // Look for sysClr
      const sysClr = getElementByTagNameNSFallback(colorElement, ns, 'sysClr');
      if (sysClr) {
        const val = sysClr.getAttribute('lastClr');
        if (val) {
          colors.set(colorName, `#${val}`);
        }
      }
    }
  }
  
  return colors;
}

/**
 * Parse font scheme from fontScheme element
 */
function parseFontScheme(fontScheme: Element, ns: string): DocxTheme['fonts'] {
  const fonts: DocxTheme['fonts'] = {
    major: new Map(),
    minor: new Map()
  };
  
  // Parse major fonts
  const majorFont = getElementByTagNameNSFallback(fontScheme, ns, 'majorFont');
  if (majorFont) {
    const latin = getElementByTagNameNSFallback(majorFont, ns, 'latin');
    if (latin) {
      const typeface = latin.getAttribute('typeface');
      if (typeface) fonts.major.set('latin', typeface);
    }
    
    const ea = getElementByTagNameNSFallback(majorFont, ns, 'ea');
    if (ea) {
      const typeface = ea.getAttribute('typeface');
      if (typeface) fonts.major.set('ea', typeface);
    }
    
    const cs = getElementByTagNameNSFallback(majorFont, ns, 'cs');
    if (cs) {
      const typeface = cs.getAttribute('typeface');
      if (typeface) fonts.major.set('cs', typeface);
    }
  }
  
  // Parse minor fonts
  const minorFont = getElementByTagNameNSFallback(fontScheme, ns, 'minorFont');
  if (minorFont) {
    const latin = getElementByTagNameNSFallback(minorFont, ns, 'latin');
    if (latin) {
      const typeface = latin.getAttribute('typeface');
      if (typeface) fonts.minor.set('latin', typeface);
    }
    
    const ea = getElementByTagNameNSFallback(minorFont, ns, 'ea');
    if (ea) {
      const typeface = ea.getAttribute('typeface');
      if (typeface) fonts.minor.set('ea', typeface);
    }
    
    const cs = getElementByTagNameNSFallback(minorFont, ns, 'cs');
    if (cs) {
      const typeface = cs.getAttribute('typeface');
      if (typeface) fonts.minor.set('cs', typeface);
    }
  }
  
  return fonts;
}

/**
 * Parse theme XML
 */
export function parseTheme(xml: string): Effect.Effect<DocxTheme, DocxParseError> {
  return Effect.gen(function* () {
    let doc: Document;
    try {
      if (typeof DOMParser === 'undefined') {
        // @ts-ignore
        const { DOMParser: XMLDOMParser } = require('@xmldom/xmldom');
        const parser = new XMLDOMParser();
        doc = parser.parseFromString(xml, "text/xml");
      } else {
        const parser = new DOMParser();
        doc = parser.parseFromString(xml, "text/xml");
      }
    } catch (error) {
      return yield* Effect.fail(new DocxParseError(`Theme parsing error: ${error}`));
    }
    
    const ns = DRAWINGML_NAMESPACE;
    
    // Find theme elements
    const themeElements = getElementByTagNameNSFallback(doc.documentElement, ns, 'themeElements');
    if (!themeElements) {
      // Return empty theme if no theme elements found
      return {
        colors: new Map(),
        fonts: {
          major: new Map(),
          minor: new Map()
        }
      };
    }
    
    // Parse color scheme
    const clrScheme = getElementByTagNameNSFallback(themeElements, ns, 'clrScheme');
    const colors = clrScheme ? parseColorScheme(clrScheme, ns) : new Map<string, string>();
    
    // Parse font scheme
    const fontScheme = getElementByTagNameNSFallback(themeElements, ns, 'fontScheme');
    const fonts = fontScheme ? parseFontScheme(fontScheme, ns) : {
      major: new Map<string, string>(),
      minor: new Map<string, string>()
    };
    
    return {
      colors,
      fonts
    };
  });
}

/**
 * Resolve theme color reference
 * @param colorRef - Color reference (e.g., "accent1", "text1")
 * @param theme - Document theme
 * @returns Resolved hex color or undefined
 */
export function resolveThemeColor(colorRef: string, theme: DocxTheme): string | undefined {
  // Map common text color references to theme colors
  const colorMap: Record<string, string> = {
    'text1': 'dk1',
    'text2': 'dk2', 
    'background1': 'lt1',
    'background2': 'lt2',
    'tx1': 'dk1',
    'tx2': 'dk2',
    'bg1': 'lt1',
    'bg2': 'lt2'
  };
  
  const mappedColor = colorMap[colorRef] || colorRef;
  return theme.colors.get(mappedColor);
}

/**
 * Resolve theme font reference
 * @param fontRef - Font reference (e.g., "+mj-lt" for major Latin)
 * @param theme - Document theme
 * @returns Resolved font name or undefined
 */
export function resolveThemeFont(fontRef: string, theme: DocxTheme): string | undefined {
  if (!fontRef.startsWith('+')) return undefined;
  
  // Parse font reference: +mj-lt = major latin, +mn-ea = minor east asian
  const parts = fontRef.substring(1).split('-');
  if (parts.length !== 2) return undefined;
  
  const [type, script] = parts;
  if (type === 'mj') {
    return theme.fonts.major.get(script === 'lt' ? 'latin' : script);
  } else if (type === 'mn') {
    return theme.fonts.minor.get(script === 'lt' ? 'latin' : script);
  }
  
  return undefined;
}