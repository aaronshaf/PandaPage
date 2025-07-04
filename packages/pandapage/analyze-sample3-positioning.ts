import { Effect } from "effect";
import { PdfParseError } from "./src/pdf-reader";
import * as pako from "pako";
import * as fs from "fs";
import * as path from "path";

interface TextItem {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  font?: string;
  blockIndex: number;
}

// Copy the relevant extraction logic to capture positioning data
const extractTextWithFullPositioning = (buffer: ArrayBuffer): Effect.Effect<TextItem[], PdfParseError> =>
  Effect.gen(function* () {
    const bytes = new Uint8Array(buffer);
    const text = new TextDecoder('latin1').decode(bytes);
    
    // Find all content streams with positioning information
    const streamPattern = /(\d+)\s+\d+\s+obj\s*<<([^>]*)>>\s*stream\s*\n/g;
    const allTextItems: TextItem[] = [];
    
    let match;
    let streamCount = 0;
    while ((match = streamPattern.exec(text)) !== null) {
      streamCount++;
      const dictContent = match[2];
      const streamStart = match.index + match[0].length;
      
      // Extract stream content
      const endStreamIndex = text.indexOf('\nendstream', streamStart);
      if (endStreamIndex === -1) continue;
      
      const streamLength = endStreamIndex - streamStart;
      const streamBytes = bytes.slice(streamStart, streamStart + streamLength);
      
      // Check if compressed
      let streamContent: string;
      if (dictContent.includes('/FlateDecode')) {
        try {
          const decompressed = pako.inflate(streamBytes);
          streamContent = new TextDecoder('latin1').decode(decompressed);
        } catch (e) {
          continue;
        }
      } else {
        streamContent = new TextDecoder('latin1').decode(streamBytes);
      }
      
      // Skip non-text streams
      if (!streamContent.includes('BT') || !streamContent.includes('ET')) {
        continue;
      }
      
      // Parse text blocks
      const textBlockPattern = /BT([\s\S]*?)ET/g;
      let blockMatch;
      let blockIndex = 0;
      
      while ((blockMatch = textBlockPattern.exec(streamContent)) !== null) {
        blockIndex++;
        const block = blockMatch[1];
        
        // Process each line in the block
        const lines = block.split(/[\r\n]+/).filter(line => line.trim());
        
        let currentX = 0;
        let currentY = 0;
        let currentFontSize = 12;
        let currentFont = '';
        
        for (const line of lines) {
          // Position commands
          const tdMatch = line.match(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+Td/);
          if (tdMatch) {
            currentX += parseFloat(tdMatch[1]);
            currentY += parseFloat(tdMatch[2]);
          }
          
          // Text matrix
          const tmMatch = line.match(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+Tm/);
          if (tmMatch) {
            currentX = parseFloat(tmMatch[5]);
            currentY = parseFloat(tmMatch[6]);
          }
          
          // Font commands
          const fontMatch = line.match(/\/(\w+)\s+(\d+\.?\d*)\s+Tf/);
          if (fontMatch) {
            currentFont = fontMatch[1];
            currentFontSize = parseFloat(fontMatch[2]);
          }
          
          // Text commands
          const tjMatch = line.match(/\(((?:[^()\\]|\\.)*)\)\s*Tj/);
          if (tjMatch) {
            const text = tjMatch[1]
              .replace(/\\r/g, '\r')
              .replace(/\\n/g, '\n')
              .replace(/\\t/g, '\t')
              .replace(/\\\\/g, '\\')
              .replace(/\\\(/g, '(')
              .replace(/\\\)/g, ')');
            
            if (text.trim()) {
              allTextItems.push({
                text,
                x: currentX,
                y: currentY,
                fontSize: currentFontSize,
                font: currentFont,
                blockIndex
              });
            }
          }
          
          // TJ arrays
          const tjArrayMatch = line.match(/\[((?:[^\[\]\\]|\\.)*)\]\s*TJ/);
          if (tjArrayMatch) {
            const arrayContent = tjArrayMatch[1];
            const textParts = arrayContent.match(/\(((?:[^()\\]|\\.)*)\)/g) || [];
            let combinedText = '';
            
            for (const part of textParts) {
              const partMatch = part.match(/\(((?:[^()\\]|\\.)*)\)/);
              if (partMatch) {
                const text = partMatch[1]
                  .replace(/\\r/g, '\r')
                  .replace(/\\n/g, '\n')
                  .replace(/\\t/g, '\t')
                  .replace(/\\\\/g, '\\')
                  .replace(/\\\(/g, '(')
                  .replace(/\\\)/g, ')');
                
                if (text) {
                  combinedText += text;
                }
              }
            }
            
            if (combinedText.trim()) {
              allTextItems.push({
                text: combinedText,
                x: currentX,
                y: currentY,
                fontSize: currentFontSize,
                font: currentFont,
                blockIndex
              });
            }
          }
        }
      }
    }
    
    return allTextItems;
  });

const analyzeSample3Positioning = async () => {
  console.log("Analyzing sample3.pdf positioning data...\n");
  
  // Load the PDF
  const pdfPath = path.join(__dirname, "../../assets/examples/sample3.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  // Extract with full positioning data
  const items = await Effect.runPromise(extractTextWithFullPositioning(arrayBuffer));
  
  console.log(`Total text items: ${items.length}\n`);
  
  // Group by Y position to identify lines
  const linesByY = new Map<number, TextItem[]>();
  for (const item of items) {
    const roundedY = Math.round(item.y);
    if (!linesByY.has(roundedY)) {
      linesByY.set(roundedY, []);
    }
    linesByY.get(roundedY)!.push(item);
  }
  
  // Sort lines by Y position (descending, as PDF Y coordinates go bottom to top)
  const sortedYPositions = Array.from(linesByY.keys()).sort((a, b) => b - a);
  
  console.log("=== TEXT BY LINE (Y POSITION) ===\n");
  
  let prevY = sortedYPositions[0];
  let pageBreaks: number[] = [];
  
  for (const y of sortedYPositions) {
    const items = linesByY.get(y)!;
    const sortedItems = items.sort((a, b) => a.x - b.x);
    
    // Check for large Y gaps that might indicate page breaks
    const yGap = prevY - y;
    if (yGap > 100) {
      console.log(`\n[LARGE GAP: ${yGap} units - possible page break]\n`);
      pageBreaks.push(y);
    }
    
    // Combine items on the same line
    const lineText = sortedItems.map(item => item.text).join('');
    const fontSize = sortedItems[0].fontSize;
    const font = sortedItems[0].font;
    
    console.log(`Y=${y} (font=${font}, size=${fontSize}): "${lineText}"`);
    
    prevY = y;
  }
  
  console.log("\n=== ANALYSIS SUMMARY ===\n");
  console.log(`Total lines: ${linesByY.size}`);
  console.log(`Page breaks detected: ${pageBreaks.length}`);
  console.log(`Y range: ${Math.min(...sortedYPositions)} to ${Math.max(...sortedYPositions)}`);
  
  // Analyze font sizes
  const fontSizes = new Set(items.map(item => item.fontSize));
  console.log(`\nFont sizes used: ${Array.from(fontSizes).sort((a, b) => b - a).join(', ')}`);
  
  // Analyze fonts
  const fonts = new Set(items.map(item => item.font));
  console.log(`Fonts used: ${Array.from(fonts).join(', ')}`);
  
  // Find potential headers (larger font sizes)
  const avgFontSize = items.reduce((sum, item) => sum + item.fontSize, 0) / items.length;
  console.log(`\nAverage font size: ${avgFontSize.toFixed(2)}`);
  
  console.log("\n=== POTENTIAL HEADERS (larger than average) ===\n");
  for (const y of sortedYPositions) {
    const lineItems = linesByY.get(y)!;
    if (lineItems[0].fontSize > avgFontSize) {
      const lineText = lineItems.map(item => item.text).join('');
      console.log(`Size ${lineItems[0].fontSize}: "${lineText}"`);
    }
  }
};

analyzeSample3Positioning().catch(console.error);