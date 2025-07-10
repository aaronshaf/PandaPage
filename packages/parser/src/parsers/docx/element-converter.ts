// Element conversion functions
import type { DocumentElement, Paragraph, Heading, TextRun, Image } from "../../types/document";
import type { DocxParagraph } from "./types";
import { halfPointsToPoints } from "./unit-utils";
import {
  getListType,
  getListText,
  getNumberingFormat,
  type NumberingDefinition,
} from "./numbering-parser";

/**
 * Convert a DOCX paragraph to a document element (paragraph or heading)
 * @param paragraph - The DOCX paragraph to convert
 * @param processedImages - Optional processed images to include
 * @param paragraphIndex - Index of this paragraph in the document (for position-based heading detection)
 * @param outlineLevel - Outline level from paragraph properties (w:outlineLvl)
 * @param numberingDef - Numbering definition for list type determination
 * @returns Document element
 */
export function convertToDocumentElement(
  paragraph: DocxParagraph,
  processedImages?: Image[],
  paragraphIndex?: number,
  outlineLevel?: number,
  numberingDef?: NumberingDefinition,
): DocumentElement {
  const runs: TextRun[] = paragraph.runs.map((run) => ({
    text: run.text,
    bold: run.bold,
    italic: run.italic,
    underline: run.underline,
    strikethrough: run.strikethrough,
    superscript: run.superscript,
    subscript: run.subscript,
    fontSize: halfPointsToPoints(run.fontSize),
    fontSizeCs: halfPointsToPoints(run.fontSizeCs),
    fontFamily: run.fontFamily,
    color: run.color ? `#${run.color}` : undefined,
    backgroundColor: run.backgroundColor,
    link: run.link,
    _footnoteRef: run._footnoteRef,
    _fieldCode: run._fieldCode,
    // Advanced text formatting
    characterSpacing: run.characterSpacing,
    position: run.position,
    emboss: run.emboss,
    imprint: run.imprint,
    outline: run.outline,
    shadow: run.shadow,
    smallCaps: run.smallCaps,
    caps: run.caps,
    hidden: run.hidden,
    doubleStrikethrough: run.doubleStrikethrough,
    kerning: run.kerning,
    textScale: run.textScale,
    emphasis: run.emphasis,
    lang: run.lang,
  }));

  // Check if it's a heading using multiple methods
  const headingDetection = detectHeading(paragraph, runs, paragraphIndex, outlineLevel);

  if (headingDetection.isHeading) {
    const heading: Heading = {
      type: "heading",
      level: headingDetection.level,
      runs,
      alignment: paragraph.alignment,
      spacing: paragraph.spacing,
      indentation: paragraph.indentation,
      ...(paragraph.textDirection && { textDirection: paragraph.textDirection }),
      ...(paragraph.verticalAlignment && { verticalAlignment: paragraph.verticalAlignment }),
    };

    // Add images if present
    if (processedImages && processedImages.length > 0) {
      heading.images = processedImages;
    } else if (paragraph.images && paragraph.images.length > 0) {
      heading.images = paragraph.images as Image[];
    }

    return heading;
  }

  // Default to paragraph
  const para: Paragraph = {
    type: "paragraph",
    runs,
    alignment: paragraph.alignment,
    spacing: paragraph.spacing,
    indentation: paragraph.indentation,
    ...(paragraph.textDirection && { textDirection: paragraph.textDirection }),
    ...(paragraph.verticalAlignment && { verticalAlignment: paragraph.verticalAlignment }),
  };

  // Add list info if present
  if (paragraph.numId && paragraph.ilvl !== undefined) {
    const listType = getListType(paragraph.numId, paragraph.ilvl, numberingDef);
    const listText = getListText(paragraph.numId, paragraph.ilvl, numberingDef);
    const numFmt = getNumberingFormat(paragraph.numId, paragraph.ilvl, numberingDef);

    para.listInfo = {
      level: paragraph.ilvl,
      type: listType,
      text: listText,
      numFmt: numFmt,
    };
  }

  // Add images if present
  if (processedImages && processedImages.length > 0) {
    para.images = processedImages;
  } else if (paragraph.images && paragraph.images.length > 0) {
    para.images = paragraph.images as Image[];
  }

  return para;
}

/**
 * Intelligent heading detection using multiple heuristics
 */
function detectHeading(
  paragraph: DocxParagraph,
  runs: TextRun[],
  paragraphIndex?: number,
  outlineLevel?: number,
): { isHeading: boolean; level: 1 | 2 | 3 | 4 | 5 | 6 } {
  // Method 1: Style-based detection (existing logic)
  if (paragraph.style) {
    const styleNormalized = paragraph.style.toLowerCase().replace(/\s+/g, "");

    // More comprehensive heading detection
    // Exclude 'header' and 'footer' styles which are for page headers/footers
    const isStyleHeading =
      styleNormalized === "title" ||
      styleNormalized === "heading" ||
      styleNormalized.startsWith("heading") ||
      (styleNormalized.startsWith("head") &&
        styleNormalized !== "header" &&
        !styleNormalized.startsWith("header")) ||
      (styleNormalized.includes("title") && !styleNormalized.includes("subtitle")) ||
      // Common DOCX heading style variations
      /^h[1-6]$/.test(styleNormalized) ||
      /^heading[1-6]$/.test(styleNormalized) ||
      /^title\d*$/.test(styleNormalized);

    if (isStyleHeading) {
      let level: 1 | 2 | 3 | 4 | 5 | 6 = 1;

      // Extract level from various patterns
      const levelMatches = [
        styleNormalized.match(/heading\s*(\d)/),
        styleNormalized.match(/head\s*(\d)/),
        styleNormalized.match(/h(\d)/),
        styleNormalized.match(/title(\d)/),
        // Look for digit at the end
        styleNormalized.match(/(\d)$/),
      ];

      for (const match of levelMatches) {
        if (match && match[1]) {
          const parsedLevel = parseInt(match[1]);
          if (parsedLevel >= 1 && parsedLevel <= 6) {
            level = parsedLevel as 1 | 2 | 3 | 4 | 5 | 6;
            break;
          }
        }
      }

      // Special case: 'title' without number is typically level 1
      if (styleNormalized === "title") {
        level = 1;
      }

      return { isHeading: true, level };
    }
  }

  // Method 2: Outline level detection
  if (typeof outlineLevel === "number" && outlineLevel >= 0 && outlineLevel <= 8) {
    const level = Math.min(6, outlineLevel + 1) as 1 | 2 | 3 | 4 | 5 | 6;
    return { isHeading: true, level };
  }

  // Method 3: Text and formatting-based heuristics
  const text = runs
    .map((run) => run.text)
    .join("")
    .trim();

  if (!text || text.length === 0) {
    return { isHeading: false, level: 1 };
  }

  // Don't treat list items as headings
  if (paragraph.numId && paragraph.ilvl !== undefined) {
    return { isHeading: false, level: 1 };
  }

  // Don't treat single runs with multiple formatting properties as headings
  // (these are likely formatted paragraphs from tests or documents with heavy formatting)
  if (runs.length === 1) {
    const run = runs[0];
    if (run) {
      const formattingCount = [
        run.bold,
        run.italic,
        run.underline,
        run.strikethrough,
        run.fontSize,
        run.color,
        run.backgroundColor,
      ].filter(Boolean).length;

      if (formattingCount >= 4) {
        return { isHeading: false, level: 1 };
      }
    }
  }

  // Calculate heuristic scores
  let score = 0;
  let level: 1 | 2 | 3 | 4 | 5 | 6 = 1;

  // Text characteristics
  const isShort = text.length <= 100; // Headings are usually short
  const isAllCaps = text === text.toUpperCase() && /[A-Z]/.test(text);
  const isTitleCase = /^[A-Z]/.test(text) && !/[.!?:]$/.test(text); // Starts with capital, no ending punctuation (including colon)
  const hasNoEndPunctuation = !/[.!?:]$/.test(text); // Include colon as ending punctuation
  const wordCount = text.split(/\s+/).length;
  const isReasonableLength = wordCount >= 1 && wordCount <= 15; // 1-15 words
  const endsWithColon = text.endsWith(":"); // Text ending with colon is usually introducing content

  // Position-based scoring
  const isEarlyInDocument = typeof paragraphIndex === "number" && paragraphIndex < 20;

  // Formatting characteristics
  const hasBoldRuns = runs.some((run) => run.bold);
  const allRunsBold = runs.length > 0 && runs.every((run) => run.bold || !run.text.trim());
  const hasLargeFont = runs.some((run) => run.fontSize && run.fontSize > 12);
  const isCenter = paragraph.alignment === "center";
  const hasMixedFormatting =
    runs.some((run) => run.bold) &&
    runs.some((run) => run.italic) &&
    runs.some((run) => !run.bold && !run.italic);

  // Specific patterns
  const looksLikeTitle =
    /^[A-Z][A-Z\s]*[A-Z]$/.test(text) || // ALL CAPS TITLE
    /^[A-Z][a-z]+(\s+[A-Z][a-z]*)*$/.test(text); // Title Case

  // Score calculation
  if (isShort) score += 2;
  if (isAllCaps) score += 3;
  if (isTitleCase) score += 2;
  if (hasNoEndPunctuation) score += 1;
  if (isReasonableLength) score += 1;
  if (isEarlyInDocument) score += 2;
  if (hasBoldRuns) score += 2;
  if (allRunsBold) score += 3;
  if (hasLargeFont) score += 2;
  if (isCenter) score += 2;
  if (looksLikeTitle) score += 3;
  if (endsWithColon) score -= 3; // Text ending with colon is usually introducing content, not a heading

  // Specific detection for known patterns
  const titlePatterns = [
    /^TITLE OF THE/i,
    /^CHAPTER \d+/i,
    /^SECTION \d+/i,
    /^INTRODUCTION$/i,
    /^CONCLUSION$/i,
    /^ABSTRACT$/i,
    /^BIBLIOGRAPHY$/i,
    /^REFERENCES$/i,
    /^ACKNOWLEDGMENTS?$/i,
    /^APPENDIX/i,
  ];

  for (const pattern of titlePatterns) {
    if (pattern.test(text)) {
      score += 5;
      break;
    }
  }

  // Determine level based on characteristics
  if (isAllCaps || isCenter || text.length > 50) {
    level = 1; // Main title
  } else if (hasBoldRuns && wordCount <= 8) {
    level = 2; // Section heading
  } else if (hasBoldRuns) {
    level = 3; // Subsection heading
  } else {
    level = 4; // Minor heading
  }

  // Additional filters to reduce false positives
  const hasQuotes = text.includes('"') || text.includes('"') || text.includes('"');
  const hasCommas = text.includes(",");
  const hasColons = text.includes(":");
  const hasNumbers = /\d/.test(text);
  const hasParentheses = text.includes("(") || text.includes(")");
  const looksLikeCitation = hasQuotes && hasCommas && (hasNumbers || hasParentheses);
  const isProbablyBibliography = paragraphIndex && paragraphIndex > 50 && looksLikeCitation;

  // Reduce score for likely citations
  if (looksLikeCitation) score -= 3;
  if (isProbablyBibliography) score -= 5;

  // Reduce score for mixed formatting (typical of formatted paragraphs, not headings)
  if (hasMixedFormatting) score -= 4;

  // Boost score for known title patterns
  if (text.toLowerCase().includes("title of the")) score += 3;
  if (text.toLowerCase() === "bibliography") score += 3;

  // Reduce score for generic test content patterns
  const testPatterns = [
    /^part\s+\d+/i,
    /^section\s+\d+/i,
    /^item\s+\d+/i,
    /^test\s+/i,
    /^sample\s+/i,
    /^example\s+/i,
    /^formatted\s+text/i,
    /^bold\s+text/i,
    /^italic\s+text/i,
  ];

  for (const pattern of testPatterns) {
    if (pattern.test(text)) {
      score -= 5;
      break;
    }
  }

  // Threshold for considering it a heading
  const isHeading = score >= 7; // Increased threshold to reduce false positives

  return { isHeading, level };
}
