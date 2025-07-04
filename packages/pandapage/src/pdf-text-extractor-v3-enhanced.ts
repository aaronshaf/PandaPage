import { Effect } from "effect";
import { PdfParseError } from "./pdf-reader";
import * as pako from "pako";
import { debug } from "./debug";
import { decodeCmap, decodeTextFromCmap } from "./decode-text-from-cmap";

interface TextItem {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  font?: string;
  blockIndex: number;
}

// Enhanced V3 extractor that handles graphics state transformations
export const extractTextContentV3Enhanced = (buffer: ArrayBuffer): Effect.Effect<string, PdfParseError> =>
  Effect.gen(function* () {
    debug.log("Extracting text content from PDF (V3 Enhanced)...");
    
    const bytes = new Uint8Array(buffer);
    const text = new TextDecoder('latin1').decode(bytes);
    
    // Find all content streams with positioning information
    const streamPattern = /(\d+)\s+\d+\s+obj\s*<<([^>]*)>>\s*stream\s*\n/g;
    const allTextItems: TextItem[] = [];
    
    // Extract CMaps first for character decoding
    const cmaps = yield* extractAllCmaps(bytes, text);
    
    let match;
    let streamCount = 0;
    let pageNumber = 0;
    
    while ((match = streamPattern.exec(text)) !== null) {
      streamCount++;
      const dictContent = match[2];
      const streamStart = match.index + match[0].length;
      
      debug.log(`Stream ${streamCount} dictionary:`, dictContent);
      
      // Extract stream content
      const streamContent = yield* extractStreamContent(bytes, streamStart, dictContent, streamCount);
      if (!streamContent) continue;
      
      debug.log(`Stream ${streamCount} content preview:`, streamContent.substring(0, 200));
      
      // Check if this is a content stream (has BT/ET markers)
      if (!streamContent.includes('BT') || !streamContent.includes('ET')) {
        continue;
      }
      
      pageNumber++;
      debug.log(`Processing page ${pageNumber}`);
      
      // Parse text with graphics state tracking
      const textItems = yield* parseTextWithGraphicsState(streamContent, streamCount, cmaps);
      allTextItems.push(...textItems);
    }
    
    debug.log(`Total pages found: ${pageNumber}`);
    debug.log(`Total text items extracted: ${allTextItems.length}`);
    
    // Format with improved layout detection
    const formattedText = yield* formatTextWithImprovedLayout(allTextItems);
    
    return formattedText;
  });

// Extract all CMaps from the PDF
const extractAllCmaps = (bytes: Uint8Array, text: string): Effect.Effect<Map<string, any>, never> =>
  Effect.gen(function* () {
    const cmaps = new Map<string, any>();
    
    // Find CMap objects
    const cmapPattern = /\/(\w+)\s+\d+\s+0\s+R/g;
    let cmapMatch;
    const cmapRefs = new Set<string>();
    
    while ((cmapMatch = cmapPattern.exec(text)) !== null) {
      const fontName = cmapMatch[1];
      if (fontName.startsWith('TT') || fontName.startsWith('F')) {
        cmapRefs.add(fontName);
      }
    }
    
    debug.log(`Found ${cmapRefs.size} font references`);
    
    // For now, return empty map - CMap extraction can be added later if needed
    return cmaps;
  });

// Extract stream content (compressed or not)
const extractStreamContent = (
  bytes: Uint8Array, 
  streamStart: number, 
  dictContent: string, 
  streamCount: number
): Effect.Effect<string | null, never> =>
  Effect.gen(function* () {
    // Find endstream
    const endStreamPattern = new Uint8Array([101, 110, 100, 115, 116, 114, 101, 97, 109]);
    let endStreamIndex = -1;
    
    for (let i = streamStart; i < bytes.length - endStreamPattern.length; i++) {
      let found = true;
      for (let j = 0; j < endStreamPattern.length; j++) {
        if (bytes[i + j] !== endStreamPattern[j]) {
          found = false;
          break;
        }
      }
      if (found) {
        endStreamIndex = i;
        break;
      }
    }
    
    if (endStreamIndex === -1) {
      debug.log(`Stream ${streamCount}: Could not find endstream`);
      return null;
    }
    
    const streamLength = endStreamIndex - streamStart;
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

// Parse text with graphics state tracking
const parseTextWithGraphicsState = (
  streamContent: string, 
  streamCount: number,
  cmaps: Map<string, any>
): Effect.Effect<TextItem[], never> =>
  Effect.gen(function* () {
    const items: TextItem[] = [];
    
    // Find all q...Q blocks that contain text
    const graphicsBlocks = streamContent.match(/q[^q]*?BT[^]*?ET[^]*?Q/g) || [];
    
    debug.log(`Stream ${streamCount} has ${graphicsBlocks.length} graphics blocks with text`);
    
    let blockIndex = 0;
    
    for (const block of graphicsBlocks) {
      blockIndex++;
      
      // Extract transformation matrix from cm command
      let globalX = 0, globalY = 0, scaleX = 1, scaleY = 1;
      const cmMatch = block.match(/([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+cm/);
      if (cmMatch) {
        scaleX = parseFloat(cmMatch[1]);
        scaleY = parseFloat(cmMatch[4]);
        globalX = parseFloat(cmMatch[5]);
        globalY = parseFloat(cmMatch[6]);
        debug.log(`Block ${blockIndex}: cm transform - pos(${globalX}, ${globalY}), scale(${scaleX}, ${scaleY})`);
      }
      
      // Extract text content between BT and ET
      const btIndex = block.indexOf('BT');
      const etIndex = block.indexOf('ET');
      if (btIndex === -1 || etIndex === -1) continue;
      
      const textBlock = block.substring(btIndex + 2, etIndex).trim();
      
      // Parse text operations within the block
      const lines = textBlock.split(/[\r\n]+/).filter(line => line.trim());
      
      let currentFont = '';
      let currentFontSize = 12;
      let textX = 0, textY = 0;
      
      for (const line of lines) {
        // Text matrix (Tm)
        const tmMatch = line.match(/([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+Tm/);
        if (tmMatch) {
          // Usually the text matrix is used for scaling, not positioning in these PDFs
          const tmScaleX = parseFloat(tmMatch[1]);
          const tmScaleY = parseFloat(tmMatch[4]);
          textX = parseFloat(tmMatch[5]);
          textY = parseFloat(tmMatch[6]);
          
          // Adjust font size based on text matrix scale
          if (tmScaleX > 0) {
            currentFontSize = tmScaleX;
          }
        }
        
        // Font selection (Tf)
        const tfMatch = line.match(/\/(\w+)\s+([\d.-]+)\s+Tf/);
        if (tfMatch) {
          currentFont = tfMatch[1];
          currentFontSize = parseFloat(tfMatch[2]);
        }
        
        // Text show (Tj)
        const tjMatch = line.match(/\(((?:[^()\\]|\\.)*)\)\s*Tj/);
        if (tjMatch) {
          const text = decodePdfText(tjMatch[1]);
          if (text.trim()) {
            // Calculate actual position
            const actualX = globalX + (textX * scaleX);
            const actualY = globalY + (textY * scaleY);
            const actualFontSize = currentFontSize * scaleX;
            
            items.push({
              text,
              x: actualX,
              y: actualY,
              fontSize: actualFontSize,
              font: currentFont,
              blockIndex
            });
            
            debug.log(`Text: "${text}" at (${actualX.toFixed(2)}, ${actualY.toFixed(2)}), size=${actualFontSize.toFixed(2)}`);
          }
        }
        
        // Text array (TJ)
        const tjArrayMatch = line.match(/\[((?:[^\[\]\\]|\\.)*)\]\s*TJ/);
        if (tjArrayMatch) {
          const arrayContent = tjArrayMatch[1];
          debug.log(`TJ array content:`, arrayContent);
          
          // Parse array for text parts and concatenate them
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
            const actualX = globalX + (textX * scaleX);
            const actualY = globalY + (textY * scaleY);
            const actualFontSize = currentFontSize * scaleX;
            
            items.push({
              text: combinedText,
              x: actualX,
              y: actualY,
              fontSize: actualFontSize,
              font: currentFont,
              blockIndex
            });
            
            debug.log(`TJ text: "${combinedText}" at (${actualX.toFixed(2)}, ${actualY.toFixed(2)})`);
          }
        }
      }
    }
    
    return items;
  });

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

// Format text with improved layout detection
const formatTextWithImprovedLayout = (textItems: TextItem[]): Effect.Effect<string, never> =>
  Effect.gen(function* () {
    if (textItems.length === 0) return '';
    
    // Sort by Y (descending) then X
    const sortedItems = [...textItems].sort((a, b) => {
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 2) return yDiff;
      return a.x - b.x;
    });
    
    debug.log("Sorted text items (first 20):");
    sortedItems.slice(0, 20).forEach((item, i) => {
      debug.log(`${i}: "${item.text}" at (${item.x.toFixed(2)}, ${item.y.toFixed(2)}), size=${item.fontSize.toFixed(2)}`);
    });
    
    // Group into lines based on Y position
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
    
    debug.log(`Grouped into ${lines.length} lines`);
    
    // Format lines into paragraphs
    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];
    let lastLineY = lines[0]?.[0]?.y || 0;
    let pageBreaks: number[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineY = line[0]?.y || 0;
      const lineText = line
        .sort((a, b) => a.x - b.x)
        .map(item => item.text)
        .join(' ')
        .trim();
      
      if (!lineText) continue;
      
      // Check for page break (very large Y gap)
      const yGap = lastLineY - lineY;
      if (yGap > 500) {
        debug.log(`Page break detected at line ${i}, gap=${yGap}`);
        if (currentParagraph.length > 0) {
          paragraphs.push(currentParagraph.join(' '));
          currentParagraph = [];
        }
        paragraphs.push('\n---\n');
        pageBreaks.push(i);
      }
      // Check for paragraph break (medium Y gap)
      else if (yGap > 20 && currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
      
      // Check if this is a header (larger font size)
      const avgFontSize = line.reduce((sum, item) => sum + item.fontSize, 0) / line.length;
      const isHeader = avgFontSize > 14;
      
      if (isHeader && currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [];
        
        // Add header with appropriate markdown
        if (avgFontSize > 30) {
          paragraphs.push(`# ${lineText}`);
        } else if (avgFontSize > 20) {
          paragraphs.push(`## ${lineText}`);
        } else {
          paragraphs.push(`### ${lineText}`);
        }
      } else {
        currentParagraph.push(lineText);
      }
      
      lastLineY = lineY;
    }
    
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '));
    }
    
    debug.log(`Created ${paragraphs.length} paragraphs with ${pageBreaks.length} page breaks`);
    
    return paragraphs.join('\n\n');
  });