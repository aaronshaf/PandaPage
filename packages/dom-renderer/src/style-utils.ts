import type { Paragraph, Heading, TextRun } from "@browser-document-viewer/parser";

// DPI assumption for all conversions - standard web display DPI
const WEB_DPI = 96;

// Standard line spacing in twips (1 line = 240 twips at normal spacing)
const NORMAL_LINE_SPACING_TWIPS = 240;

// List indentation per level in pixels
const LIST_INDENT_PER_LEVEL = 40;

// Convert twips to pixels (1 twip = 1/1440 inch, assuming 96 DPI)
export function twipsToPixels(twips: number): number {
  return Math.round((twips / 1440) * WEB_DPI);
}

// Format color value to ensure proper hex format
export function formatColor(color: string | undefined): string | null {
  if (!color || color === "auto") {
    return null;
  }
  return color.startsWith("#") ? color : `#${color}`;
}

// Convert points to pixels (1 point = 1/72 inch, assuming 96 DPI)
export function pointsToPixels(points: number): number {
  return Math.round((points / 72) * WEB_DPI);
}

// Get text run styles as CSS
export function getTextRunStyles(run: TextRun): string {
  const styles: string[] = [];

  // Basic text formatting
  if (run.bold) styles.push("font-weight: bold");
  if (run.italic) styles.push("font-style: italic");
  
  // Handle underline with defensive type checking
  if (run.underline) {
    if (typeof run.underline === "boolean") {
      styles.push("text-decoration: underline");
    } else {
      // Safely check if the underline style exists in our mapping
      const underlineKey = run.underline as string;
      if (underlineKey in UNDERLINE_STYLES) {
        const underlineStyle = UNDERLINE_STYLES[underlineKey as UnderlineStyle];
        styles.push(underlineStyle);
      } else {
        // Default fallback for unknown underline types
        console.warn(`Unknown underline style: ${run.underline}, using default underline`);
        styles.push("text-decoration: underline");
      }
    }
  }
  
  // Strike-through formatting
  if (run.strikethrough) styles.push("text-decoration-line: line-through");
  if (run.doubleStrikethrough) {
    styles.push("text-decoration-line: line-through", "text-decoration-style: double");
  }
  
  // Font properties
  if (run.fontSize) styles.push(`font-size: ${run.fontSize}pt`);
  if (run.fontFamily) styles.push(`font-family: ${run.fontFamily}`);
  
  // Colors
  const color = formatColor(run.color);
  if (color) styles.push(`color: ${color}`);
  
  const backgroundColor = formatColor(run.backgroundColor);
  if (backgroundColor) styles.push(`background-color: ${backgroundColor}`);
  
  // Advanced text formatting
  if (run.characterSpacing) styles.push(`letter-spacing: ${twipsToPixels(run.characterSpacing)}px`);
  if (run.position) styles.push(`vertical-align: ${twipsToPixels(run.position)}px`);
  if (run.smallCaps) styles.push("font-variant: small-caps");
  if (run.caps) styles.push("text-transform: uppercase");
  if (run.hidden) styles.push("display: none");
  if (run.textScale) styles.push(`transform: scaleX(${run.textScale / 100})`);
  if (run.shadow) styles.push("text-shadow: 1px 1px 2px rgba(0,0,0,0.5)");
  
  if (run.outline) {
    styles.push("color: transparent");
    styles.push("-webkit-text-stroke: 1px currentColor");
  }

  return styles.join("; ");
}

// Type-safe heading level to font size mapping
const HEADING_FONT_SIZES = {
  1: 32, // ~24pt
  2: 28, // ~21pt
  3: 24, // ~18pt
  4: 20, // ~15pt
  5: 18, // ~13.5pt
  6: 16, // ~12pt
} as const;

type HeadingLevel = keyof typeof HEADING_FONT_SIZES;

// Type-safe underline styles mapping
const UNDERLINE_STYLES = {
  single: "text-decoration: underline",
  double: "text-decoration: underline double", 
  thick: "text-decoration: underline; text-decoration-thickness: 2px",
  dotted: "text-decoration: underline dotted",
  dash: "text-decoration: underline dashed",
  wave: "text-decoration: underline wavy",
} as const;

type UnderlineStyle = keyof typeof UNDERLINE_STYLES;

// Get heading styles based on level and document properties
export function getHeadingStyles(heading: Heading): string {
  const styles: string[] = [];
  
  const fontSize = HEADING_FONT_SIZES[heading.level as HeadingLevel] ?? HEADING_FONT_SIZES[1];
  styles.push(`font-size: ${fontSize}px`);
  styles.push("font-weight: bold");
  
  // Apply spacing if defined
  if (heading.spacing) {
    if (heading.spacing.before) styles.push(`margin-top: ${twipsToPixels(heading.spacing.before)}px`);
    if (heading.spacing.after) styles.push(`margin-bottom: ${twipsToPixels(heading.spacing.after)}px`);
    if (heading.spacing.line) {
      const lineHeight = heading.spacing.lineRule === "exact" 
        ? `${twipsToPixels(heading.spacing.line)}px`
        : heading.spacing.lineRule === "atLeast"
        ? `${Math.max(1.2, twipsToPixels(heading.spacing.line) / fontSize)}`
        : `${twipsToPixels(heading.spacing.line) / fontSize}`;
      styles.push(`line-height: ${lineHeight}`);
    }
  } else {
    // Default margins
    styles.push(`margin-bottom: ${fontSize * 0.5}px`);
  }

  // Apply alignment
  if (heading.alignment) {
    switch (heading.alignment) {
      case "center":
        styles.push("text-align: center");
        break;
      case "end":
        styles.push("text-align: right");
        break;
      case "both":
      case "distribute":
        styles.push("text-align: justify");
        break;
    }
  }

  // Apply indentation
  if (heading.indentation) {
    if (heading.indentation.left) styles.push(`margin-left: ${twipsToPixels(heading.indentation.left)}px`);
    if (heading.indentation.right) styles.push(`margin-right: ${twipsToPixels(heading.indentation.right)}px`);
    if (heading.indentation.firstLine) styles.push(`text-indent: ${twipsToPixels(heading.indentation.firstLine)}px`);
    if (heading.indentation.hanging) {
      styles.push(`padding-left: ${twipsToPixels(heading.indentation.hanging)}px`);
      styles.push(`text-indent: -${twipsToPixels(heading.indentation.hanging)}px`);
    }
  }

  return styles.join("; ");
}

// Get paragraph styles
export function getParagraphStyles(paragraph: Paragraph): string {
  const styles: string[] = [];

  // Apply spacing if defined
  if (paragraph.spacing) {
    if (paragraph.spacing.before) styles.push(`margin-top: ${twipsToPixels(paragraph.spacing.before)}px`);
    if (paragraph.spacing.after) styles.push(`margin-bottom: ${twipsToPixels(paragraph.spacing.after)}px`);
    if (paragraph.spacing.line) {
      const lineHeight = paragraph.spacing.lineRule === "exact" 
        ? `${twipsToPixels(paragraph.spacing.line)}px`
        : paragraph.spacing.lineRule === "atLeast"
        ? `${Math.max(1.2, twipsToPixels(paragraph.spacing.line) / 16)}`
        : `${twipsToPixels(paragraph.spacing.line) / NORMAL_LINE_SPACING_TWIPS}`;
      styles.push(`line-height: ${lineHeight}`);
    }
  } else {
    // Default margin
    styles.push("margin-bottom: 12px");
  }

  // Apply alignment
  if (paragraph.alignment) {
    switch (paragraph.alignment) {
      case "center":
        styles.push("text-align: center");
        break;
      case "end":
        styles.push("text-align: right");
        break;
      case "both":
      case "distribute":
        styles.push("text-align: justify");
        break;
    }
  }

  // Apply indentation
  if (paragraph.indentation) {
    if (paragraph.indentation.left) styles.push(`margin-left: ${twipsToPixels(paragraph.indentation.left)}px`);
    if (paragraph.indentation.right) styles.push(`margin-right: ${twipsToPixels(paragraph.indentation.right)}px`);
    if (paragraph.indentation.firstLine) styles.push(`text-indent: ${twipsToPixels(paragraph.indentation.firstLine)}px`);
    if (paragraph.indentation.hanging) {
      styles.push(`padding-left: ${twipsToPixels(paragraph.indentation.hanging)}px`);
      styles.push(`text-indent: -${twipsToPixels(paragraph.indentation.hanging)}px`);
    }
  }

  // Apply list indentation
  if (paragraph.listInfo) {
    const indent = paragraph.listInfo.level * LIST_INDENT_PER_LEVEL;
    styles.push(`margin-left: ${indent}px`);
  }

  // Handle special paragraph styles
  if (paragraph.style) {
    switch (paragraph.style.toLowerCase()) {
      case "title":
        styles.push("font-size: 32px");
        styles.push("font-weight: bold");
        styles.push("text-align: center");
        styles.push("margin-bottom: 24px");
        break;
      case "subtitle":
        styles.push("font-size: 24px");
        styles.push("text-align: center");
        styles.push("color: #666666");
        styles.push("margin-bottom: 16px");
        break;
      case "heading1":
        styles.push("font-size: 32px");
        styles.push("font-weight: bold");
        styles.push("margin-bottom: 16px");
        break;
      case "heading2":
        styles.push("font-size: 28px");
        styles.push("font-weight: bold");
        styles.push("margin-bottom: 14px");
        break;
      case "heading3":
        styles.push("font-size: 24px");
        styles.push("font-weight: bold");
        styles.push("margin-bottom: 12px");
        break;
      case "heading4":
        styles.push("font-size: 20px");
        styles.push("font-weight: bold");
        styles.push("margin-bottom: 10px");
        break;
      case "heading5":
        styles.push("font-size: 18px");
        styles.push("font-weight: bold");
        styles.push("margin-bottom: 9px");
        break;
      case "heading6":
        styles.push("font-size: 16px");
        styles.push("font-weight: bold");
        styles.push("margin-bottom: 8px");
        break;
    }
  }

  return styles.join("; ");
}

// Get image styles
export function getImageStyles(): string {
  return "max-width: 100%; height: auto; margin-bottom: 12px";
}

// Get table styles
export function getTableStyles(): string {
  return "border-collapse: collapse; margin-bottom: 12px";
}

// Get table cell styles
export function getTableCellStyles(isHeader: boolean): string {
  const styles: string[] = [
    "border: 1px solid #d1d5db",
    "padding: 8px 16px",
  ];
  
  if (isHeader) {
    styles.push("font-weight: 600");
    styles.push("background-color: #f9fafb");
  }
  
  return styles.join("; ");
}