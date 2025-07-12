import type { Paragraph, Heading, TextRun } from "@browser-document-viewer/parser";

// Convert twips to pixels (1 twip = 1/1440 inch, assuming 96 DPI)
export function twipsToPixels(twips: number): number {
  return Math.round((twips / 1440) * 96);
}

// Convert points to pixels (1 point = 1/72 inch, assuming 96 DPI)
export function pointsToPixels(points: number): number {
  return Math.round((points / 72) * 96);
}

// Get text run styles as CSS
export function getTextRunStyles(run: TextRun): string {
  const styles: string[] = [];

  if (run.bold) styles.push("font-weight: bold");
  if (run.italic) styles.push("font-style: italic");
  if (run.underline) {
    if (typeof run.underline === "boolean") {
      styles.push("text-decoration: underline");
    } else {
      // Handle specific underline styles from OOXML
      switch (run.underline) {
        case "single":
          styles.push("text-decoration: underline");
          break;
        case "double":
          styles.push("text-decoration: underline double");
          break;
        case "thick":
          styles.push("text-decoration: underline", "text-decoration-thickness: 2px");
          break;
        case "dotted":
          styles.push("text-decoration: underline dotted");
          break;
        case "dash":
          styles.push("text-decoration: underline dashed");
          break;
        case "wave":
          styles.push("text-decoration: underline wavy");
          break;
        default:
          styles.push("text-decoration: underline");
      }
    }
  }
  if (run.strikethrough) styles.push("text-decoration-line: line-through");
  if (run.doubleStrikethrough) styles.push("text-decoration-line: line-through", "text-decoration-style: double");
  
  if (run.fontSize) styles.push(`font-size: ${run.fontSize}pt`);
  if (run.fontFamily) styles.push(`font-family: ${run.fontFamily}`);
  if (run.color && run.color !== "auto") {
    const color = run.color.startsWith("#") ? run.color : `#${run.color}`;
    styles.push(`color: ${color}`);
  }
  if (run.backgroundColor && run.backgroundColor !== "auto") {
    const backgroundColor = run.backgroundColor.startsWith("#") ? run.backgroundColor : `#${run.backgroundColor}`;
    styles.push(`background-color: ${backgroundColor}`);
  }
  
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

// Get heading styles based on level and document properties
export function getHeadingStyles(heading: Heading): string {
  const styles: string[] = [];
  
  // Base font sizes for heading levels (in pixels)
  const headingSizes = {
    1: 32, // ~24pt
    2: 28, // ~21pt
    3: 24, // ~18pt
    4: 20, // ~15pt
    5: 18, // ~13.5pt
    6: 16, // ~12pt
  };

  styles.push(`font-size: ${headingSizes[heading.level]}px`);
  styles.push("font-weight: bold");
  
  // Apply spacing if defined
  if (heading.spacing) {
    if (heading.spacing.before) styles.push(`margin-top: ${twipsToPixels(heading.spacing.before)}px`);
    if (heading.spacing.after) styles.push(`margin-bottom: ${twipsToPixels(heading.spacing.after)}px`);
    if (heading.spacing.line) {
      const lineHeight = heading.spacing.lineRule === "exact" 
        ? `${twipsToPixels(heading.spacing.line)}px`
        : heading.spacing.lineRule === "atLeast"
        ? `${Math.max(1.2, twipsToPixels(heading.spacing.line) / headingSizes[heading.level])}`
        : `${twipsToPixels(heading.spacing.line) / headingSizes[heading.level]}`;
      styles.push(`line-height: ${lineHeight}`);
    }
  } else {
    // Default margins
    styles.push(`margin-bottom: ${headingSizes[heading.level] * 0.5}px`);
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
        : `${twipsToPixels(paragraph.spacing.line) / 240}`; // 240 twips = 1 line at normal spacing
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
    const indent = paragraph.listInfo.level * 40; // 40px per level
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