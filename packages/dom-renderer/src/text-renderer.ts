import type { TextRun } from "@browser-document-viewer/parser";

/**
 * Check if a language code represents a complex script
 * Complex scripts include: Arabic, Hebrew, Thai, Devanagari, etc.
 */
function isComplexScript(lang: string): boolean {
  // Extract the primary language code (e.g., 'ar' from 'ar-SA')
  const primaryLang = lang.split("-")[0]?.toLowerCase() || "";

  // List of language codes for complex scripts
  const complexScriptLangs = [
    "ar", // Arabic
    "he", // Hebrew
    "fa", // Persian/Farsi
    "ur", // Urdu
    "th", // Thai
    "hi", // Hindi
    "bn", // Bengali
    "ta", // Tamil
    "te", // Telugu
    "mr", // Marathi
    "gu", // Gujarati
    "kn", // Kannada
    "ml", // Malayalam
    "pa", // Punjabi
    "ne", // Nepali
    "si", // Sinhala
    "my", // Burmese
    "km", // Khmer
    "lo", // Lao
    "bo", // Tibetan
    "dz", // Dzongkha
    "am", // Amharic
    "ti", // Tigrinya
  ];

  return complexScriptLangs.includes(primaryLang);
}

export function renderTextRun(
  run: TextRun,
  doc: Document,
  currentPageNumber: number,
  totalPages: number,
): HTMLElement {
  // Handle field codes
  if ((run as any)._fieldCode) {
    const fieldCode = (run as any)._fieldCode;
    let modifiedRun = { ...run };

    switch (fieldCode) {
      case "PAGE":
        modifiedRun.text = currentPageNumber.toString();
        break;
      case "NUMPAGES":
        modifiedRun.text = totalPages.toString();
        break;
    }

    run = modifiedRun;
  }

  // Check for footnote reference first
  if ((run as any)._footnoteRef) {
    const footnoteId = (run as any)._footnoteRef;
    const link = doc.createElement("a");
    link.href = `#footnote-${footnoteId}`;
    link.className = "footnote-reference";
    link.setAttribute("data-footnote-id", footnoteId);

    const sup = doc.createElement("sup");
    sup.textContent = run.text;
    link.appendChild(sup);

    return link;
  }

  let element: HTMLElement;

  // Handle links
  if (run.link) {
    element = doc.createElement("a");
    (element as HTMLAnchorElement).href = run.link;
    element.setAttribute("target", "_blank");
    element.setAttribute("rel", "noopener noreferrer");
    // Only add onclick in browser environment
    if (typeof window !== "undefined") {
      element.setAttribute("onclick", "return confirmDocumentLink(this.href)");
    }
  } else {
    element = doc.createElement("span");
  }

  // Apply formatting styles
  if (run.bold) element.style.fontWeight = "bold";
  if (run.italic) element.style.fontStyle = "italic";

  // Handle text decoration (underline, strikethrough, double strikethrough)
  const textDecorations: string[] = [];
  if (run.underline) textDecorations.push("underline");
  if (run.strikethrough || run.doubleStrikethrough) textDecorations.push("line-through");
  if (textDecorations.length > 0) {
    element.style.textDecoration = textDecorations.join(" ");
    // Double strikethrough using text-decoration-style
    if (run.doubleStrikethrough) {
      element.style.textDecorationStyle = "double";
    }
  }

  // Apply inline styles
  const styles: string[] = [];
  if (run.fontSize) styles.push(`font-size: ${run.fontSize}pt`);
  // Use complex script font size if available and appropriate (for non-Latin scripts)
  if (run.fontSizeCs && run.lang && isComplexScript(run.lang)) {
    styles.push(`font-size: ${run.fontSizeCs}pt`);
  }
  if (run.fontFamily) styles.push(`font-family: ${run.fontFamily}`);
  if (run.color) styles.push(`color: ${run.color}`);
  if (run.backgroundColor) styles.push(`background-color: ${run.backgroundColor}`);

  // Advanced text formatting
  if (run.characterSpacing !== undefined) {
    // Convert twips to points for letter-spacing
    const spacingPt = run.characterSpacing / 20;
    styles.push(`letter-spacing: ${spacingPt}pt`);
  }

  if (run.position !== undefined) {
    // Convert twips to points for vertical position
    const positionPt = run.position / 20;
    // Negative values move text up, positive down
    styles.push(`vertical-align: ${-positionPt}pt`);
    styles.push("position: relative");
  }

  // Text effects
  const textShadows: string[] = [];
  if (run.emboss) {
    textShadows.push("1px 1px 0 rgba(255,255,255,0.8), -1px -1px 0 rgba(0,0,0,0.2)");
  }
  if (run.imprint) {
    textShadows.push("-1px -1px 0 rgba(255,255,255,0.8), 1px 1px 0 rgba(0,0,0,0.2)");
  }
  if (run.outline) {
    styles.push("-webkit-text-stroke: 1px currentColor");
    styles.push("text-stroke: 1px currentColor");
    styles.push("-webkit-text-fill-color: transparent");
    styles.push("text-fill-color: transparent");
  }
  if (run.shadow) {
    textShadows.push("2px 2px 2px rgba(0,0,0,0.3)");
  }
  if (textShadows.length > 0) {
    styles.push(`text-shadow: ${textShadows.join(", ")}`);
  }

  // Text transformations
  if (run.caps) {
    styles.push("text-transform: uppercase");
  } else if (run.smallCaps) {
    styles.push("font-variant: small-caps");
  }

  // Hidden text
  if (run.hidden) {
    styles.push("visibility: hidden");
  }

  // Text scale (horizontal stretching)
  if (run.textScale !== undefined && run.textScale !== 100) {
    const scaleX = run.textScale / 100;
    styles.push(`transform: scaleX(${scaleX})`);
    styles.push("display: inline-block"); // Required for transform
  }

  // Language
  if (run.lang) {
    element.setAttribute("lang", run.lang);
  }

  if (styles.length > 0) {
    element.style.cssText = styles.join("; ");
  }

  // Handle superscript/subscript
  if (run.superscript) {
    const sup = doc.createElement("sup");
    sup.textContent = run.text;
    element.appendChild(sup);
  } else if (run.subscript) {
    const sub = doc.createElement("sub");
    sub.textContent = run.text;
    element.appendChild(sub);
  } else {
    element.textContent = run.text;
  }

  return element;
}
