import { Effect } from 'effect';
import { extractPageContentStreams } from './pdf-stream-decoder';

interface TextElement {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontName: string;
  baseline: number;
  isSuperscript: boolean;
  isBold: boolean;
}

interface TextLine {
  elements: TextElement[];
  y: number;
  text: string;
  indentLevel: number;
  isHeader: boolean;
  isListItem: boolean;
}

interface DocumentStructure {
  title?: string;
  sections: Section[];
  footnotes: Footnote[];
}

interface Section {
  header: string;
  content: string[];
  subsections: Section[];
}

interface Footnote {
  number: string;
  content: string;
}

// Enhanced text extraction with position tracking
export function extractTextWithPositions(
  pdfBytes: Uint8Array,
  logging = false
): Effect.Effect<TextElement[], Error> {
  return Effect.try(() => {
    const text = new TextDecoder('latin1').decode(pdfBytes);
    const elements: TextElement[] = [];
    
    // Find all content streams in the PDF
    const streamMatches = text.matchAll(/(\d+)\s+\d+\s+obj[^]*?stream([^]*)endstream/g);
    
    for (const streamMatch of streamMatches) {
      const streamContent = streamMatch[2];
      if (streamContent && streamContent.includes('BT')) {
        // This looks like a content stream with text
        const pageElements = parseContentStream(streamContent);
        elements.push(...pageElements);
      }
    }
    
    return elements;
  });
}

// Parse PDF content stream to extract positioned text
function parseContentStream(content: string): TextElement[] {
  const elements: TextElement[] = [];
  let currentTransform = { x: 0, y: 0 };
  let currentFont = { name: '', size: 12 };
  let textMatrix = { x: 0, y: 0 };
  
  // Split into text blocks (BT...ET)
  const textBlocks = content.match(/BT[^]*?ET/g) || [];
  
  for (const block of textBlocks) {
    const lines = block.split('\n');
    
    for (const line of lines) {
      // Text positioning operators
      const tdMatch = line.match(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+Td/);
      if (tdMatch) {
        textMatrix.x += parseFloat(tdMatch[1]);
        textMatrix.y += parseFloat(tdMatch[2]);
        continue;
      }
      
      // Text matrix operator
      const tmMatch = line.match(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+Tm/);
      if (tmMatch) {
        textMatrix.x = parseFloat(tmMatch[5]);
        textMatrix.y = parseFloat(tmMatch[6]);
        continue;
      }
      
      // Font operator
      const fontMatch = line.match(/\/(\w+)\s+(\d+(?:\.\d+)?)\s+Tf/);
      if (fontMatch) {
        currentFont.name = fontMatch[1];
        currentFont.size = parseFloat(fontMatch[2]);
        continue;
      }
      
      // Text showing operators
      const tjMatch = line.match(/\(([^)]*)\)\s*Tj/);
      if (tjMatch) {
        const text = tjMatch[1];
        elements.push({
          text: text,
          x: textMatrix.x,
          y: textMatrix.y,
          fontSize: currentFont.size,
          fontName: currentFont.name,
          baseline: textMatrix.y,
          isSuperscript: detectSuperscript(currentFont.size, textMatrix.y),
          isBold: detectBold(currentFont.name)
        });
        continue;
      }
      
      // Text array operator (TJ)
      const tjArrayMatch = line.match(/\[\s*([^]*?)\s*\]\s*TJ/);
      if (tjArrayMatch) {
        const arrayContent = tjArrayMatch[1];
        const textParts = arrayContent.match(/\(([^)]*)\)/g) || [];
        
        let xOffset = 0;
        for (const part of textParts) {
          const text = part.slice(1, -1); // Remove parentheses
          elements.push({
            text: text,
            x: textMatrix.x + xOffset,
            y: textMatrix.y,
            fontSize: currentFont.size,
            fontName: currentFont.name,
            baseline: textMatrix.y,
            isSuperscript: detectSuperscript(currentFont.size, textMatrix.y),
            isBold: detectBold(currentFont.name)
          });
          xOffset += text.length * (currentFont.size * 0.6); // Approximate character width
        }
      }
    }
  }
  
  return elements;
}

// Detect if text is superscript based on font size and position
function detectSuperscript(fontSize: number, yPosition: number): boolean {
  // Superscripts are typically smaller and positioned higher
  return fontSize < 10 && fontSize > 5;
}

// Detect if font is bold based on font name
function detectBold(fontName: string): boolean {
  return /bold|heavy|black/i.test(fontName);
}

// Group text elements into lines based on Y position
function groupIntoLines(elements: TextElement[]): TextLine[] {
  const lines: TextLine[] = [];
  const tolerance = 5; // Y position tolerance for same line
  
  // Sort by Y position (top to bottom), then X position (left to right)
  elements.sort((a, b) => {
    const yDiff = b.y - a.y; // Reverse Y (PDF coordinates)
    if (Math.abs(yDiff) < tolerance) {
      return a.x - b.x;
    }
    return yDiff;
  });
  
  for (const element of elements) {
    // Find existing line or create new one
    let line = lines.find(l => Math.abs(l.y - element.y) < tolerance);
    
    if (!line) {
      line = {
        elements: [],
        y: element.y,
        text: '',
        indentLevel: 0,
        isHeader: false,
        isListItem: false
      };
      lines.push(line);
    }
    
    line.elements.push(element);
  }
  
  // Process each line
  for (const line of lines) {
    // Sort elements by X position
    line.elements.sort((a, b) => a.x - b.x);
    
    // Combine text
    line.text = line.elements.map(el => el.text).join('');
    
    // Calculate indent level
    const leftmostX = Math.min(...line.elements.map(el => el.x));
    line.indentLevel = Math.max(0, Math.floor((leftmostX - 50) / 20)); // Approximate
    
    // Detect headers (larger font or bold)
    const avgFontSize = line.elements.reduce((sum, el) => sum + el.fontSize, 0) / line.elements.length;
    line.isHeader = avgFontSize > 14 || line.elements.some(el => el.isBold);
    
    // Detect list items
    line.isListItem = /^(\d+\.|[a-z]\.|[A-Z]\.|\(\d+\)|\([a-z]\))/.test(line.text.trim());
  }
  
  return lines;
}

// Detect and process footnotes
function extractFootnotes(lines: TextLine[]): { lines: TextLine[], footnotes: Footnote[] } {
  const footnotes: Footnote[] = [];
  const filteredLines: TextLine[] = [];
  
  for (const line of lines) {
    // Look for footnote references like (^1), (^2), etc.
    const footnoteMatch = line.text.match(/^\(\^(\d+)\)\s*(.+)$/);
    
    if (footnoteMatch) {
      footnotes.push({
        number: footnoteMatch[1],
        content: footnoteMatch[2]
      });
    } else {
      filteredLines.push(line);
    }
  }
  
  return { lines: filteredLines, footnotes };
}

// Convert lines to markdown with proper formatting
function formatAsMarkdown(lines: TextLine[], footnotes: Footnote[]): string {
  const result: string[] = [];
  let inBlockQuote = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    
    let formattedText = line.text.trim();
    
    // Handle superscripts (convert to ^number format)
    formattedText = formattedText.replace(/(\d+)/g, (match, num) => {
      // Check if this might be a footnote reference
      const element = line.elements.find(el => el.text.includes(num) && el.isSuperscript);
      return element ? `^${num}` : num;
    });
    
    // Format headers
    if (line.isHeader && formattedText) {
      formattedText = `**${formattedText}**`;
    }
    
    // Handle indentation for lists
    if (line.isListItem || line.indentLevel > 0) {
      const indent = '    '.repeat(line.indentLevel);
      formattedText = indent + formattedText;
    }
    
    // Detect block quotes (lines that might be indented significantly)
    const isQuoteLine = line.indentLevel > 2 && !line.isListItem;
    
    if (isQuoteLine && !inBlockQuote) {
      result.push('```');
      inBlockQuote = true;
    } else if (!isQuoteLine && inBlockQuote) {
      result.push('```');
      inBlockQuote = false;
    }
    
    if (formattedText) {
      result.push(formattedText);
    }
    
    // Add spacing between sections
    if (nextLine) {
      const yGap = Math.abs(line.y - nextLine.y);
      if (yGap > 30) { // Significant gap suggests new section
        result.push('');
      }
    }
  }
  
  // Close any open block quote
  if (inBlockQuote) {
    result.push('```');
  }
  
  // Add footnotes at the end
  if (footnotes.length > 0) {
    result.push('');
    for (const footnote of footnotes) {
      result.push(`(^${footnote.number}) ${footnote.content}`);
    }
  }
  
  return result.join('\n');
}

// Main enhanced extraction function
export function enhancedPdfExtraction(
  pdfBytes: Uint8Array,
  logging = false
): Effect.Effect<string, Error> {
  return extractTextWithPositions(pdfBytes, logging).pipe(
    Effect.map(elements => {
      const lines = groupIntoLines(elements);
      const { lines: contentLines, footnotes } = extractFootnotes(lines);
      return formatAsMarkdown(contentLines, footnotes);
    })
  );
}