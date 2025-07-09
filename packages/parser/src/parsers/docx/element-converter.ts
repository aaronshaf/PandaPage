// Element conversion functions
import type { DocumentElement, Paragraph, Heading, TextRun, Image } from '../../types/document';
import type { DocxParagraph } from './types';

/**
 * Convert a DOCX paragraph to a document element (paragraph or heading)
 * @param paragraph - The DOCX paragraph to convert
 * @param processedImages - Optional processed images to include
 * @returns Document element
 */
export function convertToDocumentElement(paragraph: DocxParagraph, processedImages?: Image[]): DocumentElement {
  const runs: TextRun[] = paragraph.runs.map(run => ({
    text: run.text,
    bold: run.bold,
    italic: run.italic,
    underline: run.underline,
    strikethrough: run.strikethrough,
    superscript: run.superscript,
    subscript: run.subscript,
    fontSize: run.fontSize ? Math.round(parseInt(run.fontSize) / 2) : undefined,
    fontFamily: run.fontFamily,
    color: run.color ? `#${run.color}` : undefined,
    backgroundColor: run.backgroundColor,
    link: run.link,
    _footnoteRef: run._footnoteRef,
    _fieldCode: run._fieldCode
  }));
  
  // Check if it's a heading
  if (paragraph.style) {
    const styleNormalized = paragraph.style.toLowerCase().replace(/\s+/g, '');
    
    // More comprehensive heading detection
    // Exclude 'header' and 'footer' styles which are for page headers/footers
    const isHeading = (
      styleNormalized === 'title' ||
      styleNormalized === 'heading' ||
      styleNormalized.startsWith('heading') ||
      (styleNormalized.startsWith('head') && styleNormalized !== 'header' && !styleNormalized.startsWith('header')) ||
      (styleNormalized.includes('title') && !styleNormalized.includes('subtitle')) ||
      // Common DOCX heading style variations
      /^h[1-6]$/.test(styleNormalized) ||
      /^heading[1-6]$/.test(styleNormalized) ||
      /^title\d*$/.test(styleNormalized)
    );
    
    if (isHeading) {
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
      if (styleNormalized === 'title') {
        level = 1;
      }
      
      const heading: Heading = {
        type: 'heading',
        level,
        runs,
        alignment: paragraph.alignment
      };
      
      // Add images if present
      if (processedImages && processedImages.length > 0) {
        heading.images = processedImages;
      } else if (paragraph.images && paragraph.images.length > 0) {
        heading.images = paragraph.images as Image[];
      }
      
      return heading;
    }
  }
  
  // Default to paragraph
  const para: Paragraph = {
    type: 'paragraph',
    runs,
    alignment: paragraph.alignment
  };
  
  // Add list info if present
  if (paragraph.numId && paragraph.ilvl !== undefined) {
    para.listInfo = {
      level: paragraph.ilvl,
      type: 'number' // TODO: This should be determined from numbering.xml
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