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
  blockIndex: number;
  pageIndex?: number;
}

interface GraphicsState {
  ctm: number[]; // Current transformation matrix [a, b, c, d, e, f]
}

// Helper to multiply two transformation matrices
const multiplyMatrix = (m1: number[], m2: number[]): number[] => {
  return [
    m1[0] * m2[0] + m1[1] * m2[2],
    m1[0] * m2[1] + m1[1] * m2[3],
    m1[2] * m2[0] + m1[3] * m2[2],
    m1[2] * m2[1] + m1[3] * m2[3],
    m1[4] * m2[0] + m1[5] * m2[2] + m2[4],
    m1[4] * m2[1] + m1[5] * m2[3] + m2[5]
  ];
};

// Transform a point using the transformation matrix
const transformPoint = (x: number, y: number, ctm: number[]): [number, number] => {
  const newX = ctm[0] * x + ctm[2] * y + ctm[4];
  const newY = ctm[1] * x + ctm[3] * y + ctm[5];
  return [newX, newY];
};

// Decode PDF text string
const decodePdfText = (text: string): string => {
  return text
    .replace(/\\r/g, '\r')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')');
};

// Enhanced text extraction with graphics state tracking
export const extractTextContentV4 = (buffer: ArrayBuffer): Effect.Effect<string, PdfParseError> =>
  Effect.gen(function* () {
    yield* Effect.log("Extracting text content from PDF with V4 extractor...");
    
    const bytes = new Uint8Array(buffer);
    const text = new TextDecoder('latin1').decode(bytes);
    
    // Find all content streams
    const streamPattern = /(\d+)\s+\d+\s+obj\s*<<([^>]*)>>\s*stream\s*\n/g;
    const allTextItems: TextItem[] = [];
    
    let match;
    let streamCount = 0;
    let pageIndex = 0;
    
    while ((match = streamPattern.exec(text)) !== null) {
      streamCount++;
      const dictContent = match[2];
      const streamStart = match.index + match[0].length;
      
      debug.log(`Stream ${streamCount} dictionary:`, dictContent);
      
      // Extract stream content
      const streamContent = yield* extractStreamContent(bytes, streamStart, dictContent, streamCount);
      if (!streamContent) continue;
      
      // Check if this is a page stream (has text content)
      if (streamContent.includes('BT') && streamContent.includes('ET')) {
        pageIndex++;
        debug.log(`Processing page ${pageIndex}`);
        
        // Parse the entire stream with graphics state tracking
        const items = yield* parseStreamWithGraphicsState(streamContent, streamCount, pageIndex);
        allTextItems.push(...items);
      }
    }
    
    debug.log(`Total pages found: ${pageIndex}`);
    debug.log(`Total text items extracted: ${allTextItems.length}`);
    
    // Format the text with improved layout detection
    const formattedText = yield* formatTextWithLayout(allTextItems);
    
    return formattedText;
  });

// Extract stream content (compressed or not)
const extractStreamContent = (
  bytes: Uint8Array, 
  streamStart: number, 
  dictContent: string, 
  streamCount: number
): Effect.Effect<string | null, never> =>
  Effect.gen(function* () {
    const endStreamIndex = bytes.indexOf(0x0A, streamStart); // Find newline
    let searchStart = streamStart;
    let endStreamPos = -1;
    
    // Search for 'endstream'
    const endStreamBytes = new TextEncoder().encode('endstream');
    for (let i = searchStart; i < bytes.length - endStreamBytes.length; i++) {
      let matches = true;
      for (let j = 0; j < endStreamBytes.length; j++) {
        if (bytes[i + j] !== endStreamBytes[j]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        endStreamPos = i;
        break;
      }
    }
    
    if (endStreamPos === -1) {
      debug.log(`Stream ${streamCount}: Could not find endstream`);
      return null;
    }
    
    const streamLength = endStreamPos - streamStart;
    const streamBytes = bytes.slice(streamStart, streamStart + streamLength);
    
    // Check if compressed
    if (dictContent.includes('/FlateDecode')) {
      try {
        const decompressed = pako.inflate(streamBytes);
        return new TextDecoder('latin1').decode(decompressed);
      } catch (e) {
        debug.error(`Failed to decompress stream ${streamCount}:`, e);
        return null;
      }
    } else {
      return new TextDecoder('latin1').decode(streamBytes);
    }
  });

// Parse stream content with full graphics state tracking
const parseStreamWithGraphicsState = (
  streamContent: string, 
  streamCount: number,
  pageIndex: number
): Effect.Effect<TextItem[], never> =>
  Effect.gen(function* () {
    const items: TextItem[] = [];
    
    // Split into operations while preserving structure
    const operations = streamContent.split(/(?=[\s\n](?:q|Q|BT|ET|cm|Tm|Td|TD|Tf|Tj|TJ|'))/);
    
    // Graphics state stack
    const stateStack: GraphicsState[] = [];
    let currentState: GraphicsState = {
      ctm: [1, 0, 0, 1, 0, 0] // Identity matrix
    };
    
    // Text state
    let textMatrix = [1, 0, 0, 1, 0, 0];
    let textLineMatrix = [1, 0, 0, 1, 0, 0];
    let currentFont = '';
    let currentFontSize = 12;
    let inTextBlock = false;
    
    for (const op of operations) {
      const trimmedOp = op.trim();
      if (!trimmedOp) continue;
      
      // Graphics state operators
      if (trimmedOp === 'q') {
        // Save graphics state
        stateStack.push({ ctm: [...currentState.ctm] });
        continue;
      }
      
      if (trimmedOp === 'Q') {
        // Restore graphics state
        const saved = stateStack.pop();
        if (saved) {
          currentState = saved;
        }
        continue;
      }
      
      // Concat matrix (cm)
      const cmMatch = trimmedOp.match(/([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+cm/);
      if (cmMatch) {
        const newMatrix = [
          parseFloat(cmMatch[1]),
          parseFloat(cmMatch[2]),
          parseFloat(cmMatch[3]),
          parseFloat(cmMatch[4]),
          parseFloat(cmMatch[5]),
          parseFloat(cmMatch[6])
        ];
        currentState.ctm = multiplyMatrix(newMatrix, currentState.ctm);
        continue;
      }
      
      // Text block operators
      if (trimmedOp === 'BT') {
        inTextBlock = true;
        textMatrix = [1, 0, 0, 1, 0, 0];
        textLineMatrix = [1, 0, 0, 1, 0, 0];
        continue;
      }
      
      if (trimmedOp === 'ET') {
        inTextBlock = false;
        continue;
      }
      
      if (!inTextBlock) continue;
      
      // Text positioning operators
      const tmMatch = trimmedOp.match(/([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+Tm/);
      if (tmMatch) {
        textMatrix = [
          parseFloat(tmMatch[1]),
          parseFloat(tmMatch[2]),
          parseFloat(tmMatch[3]),
          parseFloat(tmMatch[4]),
          parseFloat(tmMatch[5]),
          parseFloat(tmMatch[6])
        ];
        textLineMatrix = [...textMatrix];
        continue;
      }
      
      const tdMatch = trimmedOp.match(/([\d.-]+)\s+([\d.-]+)\s+Td/);
      if (tdMatch) {
        const tx = parseFloat(tdMatch[1]);
        const ty = parseFloat(tdMatch[2]);
        textMatrix = multiplyMatrix([1, 0, 0, 1, tx, ty], textMatrix);
        textLineMatrix = [...textMatrix];
        continue;
      }
      
      // Font selection
      const tfMatch = trimmedOp.match(/\/(\w+)\s+([\d.-]+)\s+Tf/);
      if (tfMatch) {
        currentFont = tfMatch[1];
        currentFontSize = parseFloat(tfMatch[2]);
        continue;
      }
      
      // Text showing operators
      const tjMatch = trimmedOp.match(/\(((?:[^()\\]|\\.)*)\)\s*Tj/);
      if (tjMatch) {
        const text = decodePdfText(tjMatch[1]);
        if (text.trim()) {
          // Transform text position through both matrices
          const [localX, localY] = transformPoint(0, 0, textMatrix);
          const [globalX, globalY] = transformPoint(localX, localY, currentState.ctm);
          
          items.push({
            text,
            x: globalX,
            y: globalY,
            fontSize: currentFontSize * currentState.ctm[0], // Scale font size
            font: currentFont,
            blockIndex: streamCount,
            pageIndex
          });
          
          // Advance text position (approximate)
          const advance = text.length * currentFontSize * 0.5;
          textMatrix = multiplyMatrix([1, 0, 0, 1, advance, 0], textMatrix);
        }
        continue;
      }
      
      // TJ arrays
      const tjArrayMatch = trimmedOp.match(/\[([\s\S]*?)\]\s*TJ/);
      if (tjArrayMatch) {
        const arrayContent = tjArrayMatch[1];
        const textParts = arrayContent.match(/\(((?:[^()\\]|\\.)*)\)/g) || [];
        let combinedText = '';
        
        for (const part of textParts) {
          const partMatch = part.match(/\(((?:[^()\\]|\\.)*)\)/);
          if (partMatch) {
            const text = decodePdfText(partMatch[1]);
            if (text) {
              combinedText += text;
            }
          }
        }
        
        if (combinedText.trim()) {
          const [localX, localY] = transformPoint(0, 0, textMatrix);
          const [globalX, globalY] = transformPoint(localX, localY, currentState.ctm);
          
          items.push({
            text: combinedText,
            x: globalX,
            y: globalY,
            fontSize: currentFontSize * currentState.ctm[0],
            font: currentFont,
            blockIndex: streamCount,
            pageIndex
          });
          
          const advance = combinedText.length * currentFontSize * 0.5;
          textMatrix = multiplyMatrix([1, 0, 0, 1, advance, 0], textMatrix);
        }
      }
    }
    
    return items;
  });

// Format text with improved layout detection
const formatTextWithLayout = (textItems: TextItem[]): Effect.Effect<string, never> =>
  Effect.gen(function* () {
    if (textItems.length === 0) return '';
    
    // Group items by page
    const pageGroups = new Map<number, TextItem[]>();
    for (const item of textItems) {
      const page = item.pageIndex || 1;
      if (!pageGroups.has(page)) {
        pageGroups.set(page, []);
      }
      pageGroups.get(page)!.push(item);
    }
    
    const pages: string[] = [];
    
    for (const [pageNum, items] of Array.from(pageGroups.entries()).sort((a, b) => a[0] - b[0])) {
      debug.log(`Formatting page ${pageNum} with ${items.length} items`);
      
      // Sort items by Y position (descending) then X position
      const sortedItems = items.sort((a, b) => {
        const yDiff = b.y - a.y;
        if (Math.abs(yDiff) > 5) return yDiff;
        return a.x - b.x;
      });
      
      // Group items into lines based on Y position
      const lines: TextItem[][] = [];
      let currentLine: TextItem[] = [];
      let lastY = sortedItems[0]?.y || 0;
      
      for (const item of sortedItems) {
        const yDiff = Math.abs(lastY - item.y);
        
        // New line if Y difference is significant
        if (yDiff > 5 && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = [];
        }
        
        currentLine.push(item);
        lastY = item.y;
      }
      
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      
      // Format lines into paragraphs
      const paragraphs: string[] = [];
      let currentParagraph: string[] = [];
      let lastLineY = lines[0]?.[0]?.y || 0;
      
      for (const line of lines) {
        const lineY = line[0]?.y || 0;
        const lineText = line
          .sort((a, b) => a.x - b.x)
          .map(item => item.text)
          .join(' ')
          .trim();
        
        if (!lineText) continue;
        
        // Check for paragraph break (large Y gap)
        const yGap = lastLineY - lineY;
        if (yGap > 20 && currentParagraph.length > 0) {
          paragraphs.push(currentParagraph.join(' '));
          currentParagraph = [];
        }
        
        // Check if this is a header (larger font size)
        const avgFontSize = line.reduce((sum, item) => sum + item.fontSize, 0) / line.length;
        if (avgFontSize > 14 && currentParagraph.length > 0) {
          paragraphs.push(currentParagraph.join(' '));
          currentParagraph = [];
          paragraphs.push(`# ${lineText}`);
        } else {
          currentParagraph.push(lineText);
        }
        
        lastLineY = lineY;
      }
      
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(' '));
      }
      
      pages.push(paragraphs.join('\n\n'));
    }
    
    return pages.join('\n\n---\n\n');
  });