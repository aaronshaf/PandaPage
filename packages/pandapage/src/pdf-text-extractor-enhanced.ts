import { Effect } from "effect";
import { PdfParseError } from "./pdf-reader";
import * as pako from "pako";
import { debug } from "./debug";

interface TextItem {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  font?: string;
  width?: number;
}

interface TextLine {
  items: TextItem[];
  y: number;
  avgFontSize: number;
}

// Enhanced PDF text extractor with improved spacing and positioning heuristics
export const extractTextContentEnhanced = (buffer: ArrayBuffer): Effect.Effect<string, PdfParseError> =>
  Effect.gen(function* () {
    debug.log("Extracting text content from PDF with enhanced spacing...");
    
    const text = new TextDecoder('latin1').decode(new Uint8Array(buffer));
    const textItems: TextItem[] = [];
    
    // Find content streams
    const streamMatches = text.match(/\d+\s+\d+\s+obj[\s\S]*?stream([\s\S]*?)endstream/gi);
    
    if (!streamMatches) {
      throw new PdfParseError("No content streams found");
    }
    
    let streamCount = 0;
    
    for (const streamMatch of streamMatches) {
      streamCount++;
      const streamContent = streamMatch.match(/stream([\s\S]*?)endstream/i)?.[1];
      
      if (!streamContent) continue;
      
      // Extract stream content
      let processedContent: string;
      
      // Check if compressed
      if (streamMatch.includes('/FlateDecode') || streamMatch.includes('/Fl')) {
        try {
          const streamBytes = new Uint8Array(streamContent.length);
          for (let i = 0; i < streamContent.length; i++) {
            streamBytes[i] = streamContent.charCodeAt(i);
          }
          
          const decompressed = pako.inflate(streamBytes);
          processedContent = new TextDecoder('latin1').decode(decompressed);
        } catch (error) {
          debug.log(`Failed to decompress stream ${streamCount}, trying raw content`);
          processedContent = streamContent;
        }
      } else {
        processedContent = streamContent;
      }
      
      // Parse text positioning commands and extract with coordinates
      extractTextItemsWithPositioning(processedContent, textItems);
    }
    
    debug.log(`Extracted ${textItems.length} text items with positioning`);
    
    // Sort and group text items into logical reading order
    const sortedLines = groupTextIntoLines(textItems);
    debug.log(`Grouped into ${sortedLines.length} lines`);
    
    // Reconstruct text with proper spacing
    const reconstructedText = reconstructTextWithSpacing(sortedLines);
    
    return reconstructedText;
  });

function extractTextItemsWithPositioning(content: string, textItems: TextItem[]): void {
  const lines = content.split('\n');
  let currentX = 0;
  let currentY = 0;
  let currentFontSize = 12;
  let currentMatrix = [1, 0, 0, 1, 0, 0]; // [a, b, c, d, e, f]
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Track transformation matrix changes
    const matrixMatch = line.match(/^([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+cm$/);
    if (matrixMatch) {
      currentMatrix = matrixMatch.slice(1, 7).map(Number);
      continue;
    }
    
    // Track text matrix positioning (Tm command)
    const tmMatch = line.match(/^([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+Tm$/);
    if (tmMatch) {
      // Text matrix: [a, b, c, d, e, f] where (e, f) is translation
      currentX = parseFloat(tmMatch[5]);
      currentY = parseFloat(tmMatch[6]);
      continue;
    }
    
    // Track font size changes
    const fontMatch = line.match(/\/\w+\s+([-\d.]+)\s+Tf/);
    if (fontMatch) {
      currentFontSize = parseFloat(fontMatch[1]);
      continue;
    }
    
    // Track text positioning adjustments (Td command)
    const tdMatch = line.match(/^([-\d.]+)\s+([-\d.]+)\s+Td$/);
    if (tdMatch) {
      currentX += parseFloat(tdMatch[1]);
      currentY += parseFloat(tdMatch[2]);
      continue;
    }
    
    // Extract simple text (Tj command)
    const tjMatch = line.match(/\(([^)]*)\)\s*Tj/);
    if (tjMatch) {
      const text = decodePdfText(tjMatch[1]);
      if (text.trim()) {
        textItems.push({
          text: text,
          x: currentX,
          y: currentY,
          fontSize: currentFontSize,
          width: estimateTextWidth(text, currentFontSize)
        });
        
        // Advance X position for next text
        currentX += estimateTextWidth(text, currentFontSize);
      }
      continue;
    }
    
    // Extract array text (TJ command) - more complex positioning
    const tjArrayMatch = line.match(/\[(.*?)\]\s*TJ/);
    if (tjArrayMatch) {
      const arrayContent = tjArrayMatch[1];
      extractFromTJArray(arrayContent, currentX, currentY, currentFontSize, textItems);
    }
  }
}

function extractFromTJArray(arrayContent: string, startX: number, startY: number, fontSize: number, textItems: TextItem[]): void {
  // Parse TJ array: [(text) offset (text) offset ...]
  const parts = arrayContent.split(/\s+/);
  let currentX = startX;
  
  for (const part of parts) {
    const textMatch = part.match(/\(([^)]*)\)/);
    if (textMatch) {
      const text = decodePdfText(textMatch[1]);
      if (text.trim()) {
        textItems.push({
          text: text,
          x: currentX,
          y: startY,
          fontSize: fontSize,
          width: estimateTextWidth(text, fontSize)
        });
        currentX += estimateTextWidth(text, fontSize);
      }
    } else {
      // Numeric offset - negative values move text closer together
      const offset = parseFloat(part);
      if (!isNaN(offset)) {
        // Convert offset to actual spacing (typically in thousandths of an em)
        currentX -= (offset * fontSize) / 1000;
      }
    }
  }
}

function decodePdfText(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

function estimateTextWidth(text: string, fontSize: number): number {
  // Rough estimation: average character width is about 0.6 * fontSize
  return text.length * fontSize * 0.6;
}

function groupTextIntoLines(textItems: TextItem[]): TextLine[] {
  if (textItems.length === 0) return [];
  
  // Sort by Y coordinate (top to bottom), then by X coordinate (left to right)
  const sortedItems = [...textItems].sort((a, b) => {
    const yDiff = b.y - a.y; // Higher Y values first (PDF coordinates)
    if (Math.abs(yDiff) > 5) return yDiff;
    return a.x - b.x; // Then left to right
  });
  
  const lines: TextLine[] = [];
  let currentLine: TextItem[] = [];
  let currentY = sortedItems[0].y;
  
  for (const item of sortedItems) {
    // If Y coordinate differs significantly, start a new line
    if (Math.abs(item.y - currentY) > 5) {
      if (currentLine.length > 0) {
        lines.push({
          items: currentLine,
          y: currentY,
          avgFontSize: currentLine.reduce((sum, item) => sum + item.fontSize, 0) / currentLine.length
        });
      }
      currentLine = [item];
      currentY = item.y;
    } else {
      currentLine.push(item);
    }
  }
  
  // Add the last line
  if (currentLine.length > 0) {
    lines.push({
      items: currentLine,
      y: currentY,
      avgFontSize: currentLine.reduce((sum, item) => sum + item.fontSize, 0) / currentLine.length
    });
  }
  
  return lines;
}

function reconstructTextWithSpacing(lines: TextLine[]): string {
  const result: string[] = [];
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const lineText: string[] = [];
    
    // Sort items in the line by X coordinate
    const sortedItems = line.items.sort((a, b) => a.x - b.x);
    
    for (let i = 0; i < sortedItems.length; i++) {
      const item = sortedItems[i];
      const nextItem = sortedItems[i + 1];
      
      lineText.push(item.text);
      
      // Add spacing between items if needed
      if (nextItem) {
        const gap = nextItem.x - (item.x + (item.width || 0));
        const avgCharWidth = item.fontSize * 0.6;
        
        // If gap is larger than half a character width, add space
        if (gap > avgCharWidth * 0.5) {
          // Add multiple spaces for larger gaps
          const spaceCount = Math.min(Math.round(gap / avgCharWidth), 5);
          lineText.push(' '.repeat(Math.max(1, spaceCount)));
        } else if (gap > avgCharWidth * 0.2) {
          // Small gap - just one space
          lineText.push(' ');
        }
        // If gap is very small or negative, don't add space (letters are meant to be close)
      }
    }
    
    const reconstructedLine = lineText.join('').trim();
    if (reconstructedLine) {
      result.push(reconstructedLine);
    }
    
    // Add line breaks between lines based on spacing
    const nextLine = lines[lineIndex + 1];
    if (nextLine) {
      const lineSpacing = Math.abs(line.y - nextLine.y);
      const avgFontSize = (line.avgFontSize + nextLine.avgFontSize) / 2;
      
      // If lines are far apart, add extra line break
      if (lineSpacing > avgFontSize * 2) {
        result.push(''); // Extra line break
      }
    }
  }
  
  return result.join('\n');
}