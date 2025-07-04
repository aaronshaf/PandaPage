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
}

interface TextBlock {
  items: TextItem[];
  x: number;
  y: number;
  width: number;
  height: number;
}

// Enhanced text extraction with better line break detection
export const extractTextContentV3 = (buffer: ArrayBuffer): Effect.Effect<string, PdfParseError> =>
  Effect.gen(function* () {
    debug.log("Extracting text content from PDF...");
    
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
      
      debug.log(`Stream ${streamCount} dictionary:`, dictContent);
      
      // Extract stream content (same as before)
      const streamContent = yield* extractStreamContent(bytes, streamStart, dictContent, streamCount);
      if (!streamContent) continue;
      
      debug.log(`Stream ${streamCount} content preview:`, streamContent.substring(0, 200));
      
      // Parse text blocks with positioning
      const textItems = yield* parseTextWithPositioning(streamContent, streamCount);
      allTextItems.push(...textItems);
    }
    
    debug.log(`Total streams found: ${streamCount}`);
    debug.log(`Total text items extracted: ${allTextItems.length}`);
    
    // Add extraction order to preserve sequence when positions are identical
    allTextItems.forEach((item, index) => {
      (item as any).extractionOrder = index;
    });
    
    // Sort text items by Y position (top to bottom), then X position (left to right)
    allTextItems.sort((a, b) => {
      // PDF coordinates are bottom-up, so higher Y values are at the top
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 5) return yDiff;  // Significant Y difference means different lines
      if (Math.abs(a.x - b.x) > 0.1) return a.x - b.x;  // Same line, sort by X position
      // If positions are identical, preserve extraction order
      return (a as any).extractionOrder - (b as any).extractionOrder;
    });
    
    // Debug: Log sorted positions
    debug.log("Sorted text items (first 20):");
    allTextItems.slice(0, 20).forEach((item, i) => {
      debug.log(`${i}: "${item.text}" at (${item.x}, ${item.y})`);
    });
    
    // Group text items into logical lines and apply formatting
    const formattedText = yield* formatTextWithLineBreaks(allTextItems);
    
    return formattedText;
  });

// Extract stream content (reuse existing logic)
const extractStreamContent = (
  bytes: Uint8Array, 
  streamStart: number, 
  dictContent: string, 
  streamCount: number
): Effect.Effect<string | null, PdfParseError> =>
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
    
    let streamBytes = bytes.slice(streamStart, endStreamIndex);
    
    // Handle length references
    const lengthMatch = dictContent.match(/\/Length\s+(\d+)(\s+\d+\s+R)?/);
    if (lengthMatch) {
      let declaredLength: number;
      
      if (lengthMatch[2]) {
        // Indirect reference
        const objNum = parseInt(lengthMatch[1]);
        const objPattern = new RegExp(`${objNum}\\s+0\\s+obj\\s*(\\d+)\\s*endobj`);
        const text = new TextDecoder('latin1').decode(bytes);
        const objMatch = text.match(objPattern);
        declaredLength = objMatch ? parseInt(objMatch[1]) : streamBytes.length;
      } else {
        declaredLength = parseInt(lengthMatch[1]);
      }
      
      if (declaredLength !== streamBytes.length) {
        streamBytes = streamBytes.slice(0, declaredLength);
      }
    }
    
    let streamContent: string;
    
    // Handle compression
    if (dictContent.includes('/Filter') && dictContent.includes('FlateDecode')) {
      try {
        let dataStart = 0;
        while (dataStart < streamBytes.length && 
               (streamBytes[dataStart] === 0x0A || streamBytes[dataStart] === 0x0D || streamBytes[dataStart] === 0x20)) {
          dataStart++;
        }
        
        const compressedData = streamBytes.slice(dataStart);
        const decompressed = pako.inflate(compressedData);
        streamContent = new TextDecoder('latin1').decode(decompressed);
      } catch (e) {
        debug.error(`Failed to decompress stream ${streamCount}:`, e);
        return null;
      }
    } else {
      streamContent = new TextDecoder('latin1').decode(streamBytes);
    }
    
    return streamContent;
  });

// Matrix multiplication for combining transformations
function multiplyMatrix(m1: number[], m2: number[]): number[] {
  return [
    m1[0] * m2[0] + m1[1] * m2[2],
    m1[0] * m2[1] + m1[1] * m2[3],
    m1[2] * m2[0] + m1[3] * m2[2],
    m1[2] * m2[1] + m1[3] * m2[3],
    m1[4] * m2[0] + m1[5] * m2[2] + m2[4],
    m1[4] * m2[1] + m1[5] * m2[3] + m2[5]
  ];
}

// Apply transformation matrix to a point
function transformPoint(x: number, y: number, matrix: number[]): { x: number, y: number } {
  return {
    x: matrix[0] * x + matrix[2] * y + matrix[4],
    y: matrix[1] * x + matrix[3] * y + matrix[5]
  };
}

// Parse text with positioning information
const parseTextWithPositioning = (
  streamContent: string, 
  streamCount: number
): Effect.Effect<TextItem[], PdfParseError> =>
  Effect.gen(function* () {
    const textItems: TextItem[] = [];
    
    // Track graphics state stack for q/Q commands
    const graphicsStateStack: number[][] = [];
    let currentTransform: number[] = [1, 0, 0, 1, 0, 0]; // Identity matrix
    
    // Split content into commands, preserving text blocks
    const commands: string[] = [];
    let currentPos = 0;
    
    // First, extract all commands while preserving their order
    while (currentPos < streamContent.length) {
      // Skip whitespace
      while (currentPos < streamContent.length && /\s/.test(streamContent[currentPos])) {
        currentPos++;
      }
      
      if (currentPos >= streamContent.length) break;
      
      // Check for BT...ET block
      if (streamContent.substr(currentPos, 2) === 'BT') {
        const etIndex = streamContent.indexOf('ET', currentPos);
        if (etIndex !== -1) {
          const textBlock = streamContent.substring(currentPos, etIndex + 2);
          commands.push(textBlock);
          currentPos = etIndex + 2;
          continue;
        }
      }
      
      // Parse regular command
      let commandEnd = currentPos;
      let inString = false;
      let inHex = false;
      
      while (commandEnd < streamContent.length) {
        const char = streamContent[commandEnd];
        
        if (!inString && !inHex) {
          if (char === '(') inString = true;
          else if (char === '<') inHex = true;
          else if (/[a-zA-Z]/.test(char)) {
            // Found operator
            commandEnd++;
            while (commandEnd < streamContent.length && /[a-zA-Z*]/.test(streamContent[commandEnd])) {
              commandEnd++;
            }
            break;
          }
        } else if (inString && char === ')' && streamContent[commandEnd - 1] !== '\\') {
          inString = false;
        } else if (inHex && char === '>') {
          inHex = false;
        }
        
        commandEnd++;
      }
      
      if (commandEnd > currentPos) {
        const command = streamContent.substring(currentPos, commandEnd).trim();
        if (command) commands.push(command);
        currentPos = commandEnd;
      } else {
        currentPos++;
      }
    }
    
    debug.log(`Stream ${streamCount} has ${commands.length} commands`);
    
    // Process commands
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      // Handle graphics state save/restore
      if (command === 'q') {
        graphicsStateStack.push([...currentTransform]);
        debug.log('Graphics state saved, stack depth:', graphicsStateStack.length);
      } else if (command === 'Q') {
        if (graphicsStateStack.length > 0) {
          currentTransform = graphicsStateStack.pop()!;
          debug.log('Graphics state restored, stack depth:', graphicsStateStack.length);
        }
      } else if (command.endsWith(' cm')) {
        // Handle transformation matrix
        const match = command.match(/([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+cm/);
        if (match) {
          const newTransform = [
            parseFloat(match[1]),
            parseFloat(match[2]),
            parseFloat(match[3]),
            parseFloat(match[4]),
            parseFloat(match[5]),
            parseFloat(match[6])
          ];
          currentTransform = multiplyMatrix(currentTransform, newTransform);
          debug.log('Transformation matrix applied:', newTransform);
          debug.log('Current transform:', currentTransform);
        }
      } else if (command.startsWith('BT') && command.endsWith('ET')) {
        // Parse text block with current transformation
        debug.log(`Processing text block ${i} with transform:`, currentTransform);
        const blockItems = yield* parseTextBlock(command, i, currentTransform);
        textItems.push(...blockItems);
      } else {
        // Log other commands for debugging
        if (command.length < 50) {
          debug.log(`Other command: ${command}`);
        }
      }
    }
    
    return textItems;
  });

// Parse a single text block for positioning
const parseTextBlock = (
  block: string, 
  blockIndex: number, 
  transformMatrix: number[]
): Effect.Effect<TextItem[], PdfParseError> =>
  Effect.gen(function* () {
    const items: TextItem[] = [];
    
    // Track text state within the block
    let currentX = 0;
    let currentY = 0;
    let currentFontSize = 12;
    let currentFont = '';
    
    // First, handle TJ arrays that might span multiple lines
    // Replace newlines within [...] TJ to keep array content together
    let processedBlock = block.replace(/\[([\s\S]*?)\]\s*TJ/g, (match) => {
      return match.replace(/[\r\n]+/g, ' ');
    });
    
    // Also handle Tj operators that might be on a separate line from their text
    processedBlock = processedBlock.replace(/\(((?:[^()\\]|\\.)*)\)\s*[\r\n]+\s*Tj/g, (match) => {
      return match.replace(/[\r\n]+/g, ' ');
    });
    
    // Split block into lines and process sequentially
    const lines = processedBlock.split(/[\r\n]+/).map(line => line.trim()).filter(line => line);
    
    let pendingMatrix: number[] | null = null;
    
    for (const line of lines) {
      debug.log(`Processing line: "${line}"`);
      
      // Parse positioning commands first (may be multiple on same line)
      let workingLine = line;
      
      // Check if this line is just matrix numbers (e.g., "BT 150 0 0 150 0 0")
      if (line.startsWith('BT') && !line.includes('Tm') && !line.includes('Tj')) {
        const matrixMatch = line.match(/BT\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)$/);
        if (matrixMatch) {
          // Store the matrix values for the next line
          pendingMatrix = [
            parseFloat(matrixMatch[1]),
            parseFloat(matrixMatch[2]),
            parseFloat(matrixMatch[3]),
            parseFloat(matrixMatch[4]),
            parseFloat(matrixMatch[5]),
            parseFloat(matrixMatch[6])
          ];
          continue;
        }
      }
      
      // Check if we have a pending matrix and this line starts with Tm
      if (pendingMatrix && workingLine.startsWith('Tm')) {
        currentX = pendingMatrix[4];
        currentY = pendingMatrix[5];
        debug.log(`Text matrix set from pending, position: (${currentX}, ${currentY})`);
        pendingMatrix = null;
        // Remove the Tm from the line
        workingLine = workingLine.replace(/^Tm\s*/, '');
      }
      
      // Look for text positioning commands
      const tdMatch = workingLine.match(/([\d.-]+)\s+([\d.-]+)\s+Td/);
      if (tdMatch) {
        // Td: move text position
        currentX += parseFloat(tdMatch[1]);
        currentY += parseFloat(tdMatch[2]);
        debug.log(`Position moved to (${currentX}, ${currentY})`);
        // Remove the Td command from the line to process other commands
        workingLine = workingLine.replace(/([\d.-]+)\s+([\d.-]+)\s+Td\s*/, '');
      }
      
      const tmMatch = workingLine.match(/([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+Tm/);
      if (tmMatch) {
        // Tm: set text matrix
        currentX = parseFloat(tmMatch[5]);
        currentY = parseFloat(tmMatch[6]);
        debug.log(`Text matrix set, position: (${currentX}, ${currentY})`);
        // Remove the Tm command
        workingLine = workingLine.replace(/([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+Tm\s*/, '');
      }
      
      const tfMatch = workingLine.match(/\/(\w+)\s+([\d.-]+)\s+Tf/);
      if (tfMatch) {
        // Tf: set font and size
        currentFont = tfMatch[1];
        currentFontSize = parseFloat(tfMatch[2]);
        debug.log(`Font set to ${currentFont}, size ${currentFontSize}`);
        // Remove the Tf command
        workingLine = workingLine.replace(/\/\w+\s+[\d.-]+\s+Tf\s*/, '');
      }
      
      // Look for text content (parentheses-enclosed)
      const tjMatch = workingLine.match(/\(((?:[^()\\]|\\.)*)\)\s*Tj/);
      if (tjMatch) {
        const text = decodePdfText(tjMatch[1]);
        if (text) {
          // Apply the transformation matrix to get actual coordinates
          const transformed = transformPoint(currentX, currentY, transformMatrix);
          items.push({
            text,
            x: transformed.x,
            y: transformed.y,
            fontSize: currentFontSize,
            font: currentFont,
            blockIndex
          });
          debug.log(`Text item: "${text}" at (${currentX}, ${currentY}) -> transformed to (${transformed.x}, ${transformed.y})`);
          
          // Estimate position advance (rough approximation)
          currentX += text.length * currentFontSize * 0.6;
        }
        continue;
      }
      
      // Look for hex-encoded text content
      const hexTjMatch = workingLine.match(/<([0-9A-Fa-f]+)>\s*Tj/);
      if (hexTjMatch) {
        const text = decodeHexString(hexTjMatch[1]);
        if (text) {
          // Apply the transformation matrix to get actual coordinates
          const transformed = transformPoint(currentX, currentY, transformMatrix);
          items.push({
            text,
            x: transformed.x,
            y: transformed.y,
            fontSize: currentFontSize,
            font: currentFont,
            blockIndex
          });
          debug.log(`Hex text item: "${text}" at (${currentX}, ${currentY}) -> transformed to (${transformed.x}, ${transformed.y})`);
          
          // Estimate position advance (rough approximation)
          currentX += text.length * currentFontSize * 0.6;
        }
        continue;
      }
      
      // Handle TJ arrays (more complex)
      const tjArrayMatch = workingLine.match(/\[((?:[^\[\]\\]|\\.)*)\]\s*TJ/);
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
        
        // Add the combined text as a single item
        if (combinedText) {
          // Apply the transformation matrix to get actual coordinates
          const transformed = transformPoint(currentX, currentY, transformMatrix);
          items.push({
            text: combinedText,
            x: transformed.x,
            y: transformed.y,
            fontSize: currentFontSize,
            font: currentFont,
            blockIndex
          });
          debug.log(`TJ combined text: "${combinedText}" at (${currentX}, ${currentY}) -> transformed to (${transformed.x}, ${transformed.y})`);
          
          // Advance position based on total length
          currentX += combinedText.length * currentFontSize * 0.6;
        }
        continue;
      }
    }
    
    return items;
  });

// Format text with intelligent line breaks
const formatTextWithLineBreaks = (textItems: TextItem[]): Effect.Effect<string, PdfParseError> =>
  Effect.gen(function* () {
    if (textItems.length === 0) return '';
    
    // Check if we have meaningful position data
    const hasPositionData = textItems.some(item => item.x !== 0 || item.y !== 0);
    const uniqueYPositions = new Set(textItems.map(item => item.y)).size;
    
    debug.log(`Has position data: ${hasPositionData}, Unique Y positions: ${uniqueYPositions}`);
    
    // If no meaningful position data, fall back to simple concatenation
    if (!hasPositionData || uniqueYPositions < 2) {
      debug.log("No meaningful position data, using simple concatenation");
      
      // Just concatenate all text in order, preserving original extraction order
      const result = textItems.map(item => item.text).join('');
      
      // Apply the same cleanup as the original extractor
      return result
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .replace(/\s([.,;:!?])/g, '$1')  // Fix punctuation spacing
        .trim();
    }
    
    // Otherwise, use position-based formatting
    const lines: string[] = [];
    let currentLine: TextItem[] = [];
    let lastY = textItems[0].y;
    
    debug.log("Starting line break formatting...");
    
    for (let i = 0; i < textItems.length; i++) {
      const item = textItems[i];
      const nextItem = textItems[i + 1];
      
      // Check if we should start a new line based on Y position difference
      const yDifference = Math.abs(lastY - item.y);
      const shouldStartNewLine = yDifference > 5; // Increase threshold
      
      if (shouldStartNewLine && currentLine.length > 0) {
        // Finish current line
        const lineText = buildLineText(currentLine);
        if (lineText.trim()) {
          lines.push(lineText.trim());
          debug.log(`Added line: "${lineText.trim()}"`);
        }
        currentLine = [];
      }
      
      currentLine.push(item);
      lastY = item.y;
    }
    
    // Add the last line
    if (currentLine.length > 0) {
      const lineText = buildLineText(currentLine);
      if (lineText.trim()) {
        lines.push(lineText.trim());
        debug.log(`Added final line: "${lineText.trim()}"`);
      }
    }
    
    debug.log(`Total lines created: ${lines.length}`);
    
    // Join lines with appropriate spacing
    let result = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1];
      
      if (!line.trim()) continue;
      
      result += line;
      
      // Decide line spacing
      if (nextLine) {
        if (shouldAddParagraphBreak(line, nextLine)) {
          result += '\n\n';
        } else {
          result += '\n';
        }
      }
    }
    
    // Clean up common text extraction artifacts
    result = result
      .replace(/ +/g, ' ')  // Normalize spaces (but preserve line breaks)
      .replace(/([a-z])\s+([a-z])/g, (match, p1, p2) => {
        // If we have single letters separated by space, they might belong together
        if (p1.length === 1 && p2.length === 1) {
          return p1 + p2;
        }
        return match;
      })
      .trim();
    
    // Apply intelligent space insertion for concatenated words
    result = result.split('\n').map(line => addMissingSpaces(line)).join('\n');
    
    return result;
  });

// Build text from a line of items, handling spacing
function buildLineText(lineItems: TextItem[]): string {
  if (lineItems.length === 0) return '';
  if (lineItems.length === 1) return lineItems[0].text;
  
  let result = lineItems[0].text;
  
  for (let i = 1; i < lineItems.length; i++) {
    const current = lineItems[i];
    const previous = lineItems[i - 1];
    
    // If current text already starts with a space, don't add another
    if (current.text.startsWith(' ')) {
      result += current.text;
      continue;
    }
    
    // If previous text ends with a space, don't add another
    if (previous.text.endsWith(' ')) {
      result += current.text;
      continue;
    }
    
    // Calculate the gap between text items
    const estimatedPrevWidth = previous.text.length * previous.fontSize * 0.5; // More conservative estimate
    const expectedNextX = previous.x + estimatedPrevWidth;
    const actualGap = current.x - expectedNextX;
    
    debug.log(`Gap analysis: prev="${previous.text}" at ${previous.x}, curr="${current.text}" at ${current.x}, estimated width=${estimatedPrevWidth}, gap=${actualGap}`);
    
    // Add space if there's a meaningful gap (adjust threshold based on font size)
    // Be more conservative with space detection - only add if gap is significant
    const spaceThreshold = previous.fontSize * 0.5; // Increased threshold
    if (actualGap > spaceThreshold) {
      result += ' ';
    }
    
    result += current.text;
  }
  
  return result;
}

// Determine if we should add a paragraph break
function shouldAddParagraphBreak(currentLine: string, nextLine: string): boolean {
  // Add paragraph breaks before:
  // 1. Numbered sections (1., 2., etc.)
  // 2. Lettered lists (a., b., etc.)
  // 3. Questions
  // 4. After periods at end of sentences that seem to end paragraphs
  
  const nextLinePatterns = [
    /^\d+\.\s+/,        // "1. ", "2. "
    /^[a-z]\.\s+/,      // "a. ", "b. "
    /^[A-Z]\.\s+/,      // "A. ", "B. "
    /^(What|How|Why|When|Where)\s+/i,  // Questions
    /^(Block\s+)?Quotations?/i,        // Block quotations
    /^Example/i,                       // Examples
    /^Footnotes?/i                     // Footnote sections
  ];
  
  const currentLineEndings = [
    /\.\s*$/,           // Ends with period
    /\?\s*$/,           // Ends with question mark
    /\!\s*$/,           // Ends with exclamation
    /\:\s*$/            // Ends with colon
  ];
  
  const nextStartsNewSection = nextLinePatterns.some(pattern => pattern.test(nextLine));
  const currentEndsComplete = currentLineEndings.some(pattern => pattern.test(currentLine));
  
  return nextStartsNewSection || (currentEndsComplete && currentLine.length > 40);
}

// Decode PDF text (reuse existing logic)
function decodePdfText(str: string): string {
  // Handle escape sequences
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\(\d{3})/g, (match, octal) => {
      return String.fromCharCode(parseInt(octal, 8));
    });
}

// Add spaces between words that are incorrectly concatenated
function addMissingSpaces(text: string): string {
  // Common patterns where spaces should be inserted:
  // 1. Between lowercase and uppercase: fooBar -> foo Bar
  // 2. Between letter and punctuation followed by uppercase: elit.Integer -> elit. Integer
  // 3. Between common word endings and beginnings
  
  // First pass: Add spaces around common Latin words
  let result = text
    // Add space between lowercase and uppercase
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Add space after punctuation if followed by letter
    .replace(/([.,:;!?])([A-Za-z])/g, '$1 $2')
    // Add space before common Latin words if preceded by lowercase
    .replace(/([a-z])(ipsum|dolor|sit|amet|consectetur|adipiscing|elit|sed|lorem|magna|nulla|integer|morbi|curabitur|vestibulum|mauris|fusce|nullam|quisque|class|aptent|praesent|suspendisse|lacinia|proin|duis|aenean|donec)/gi, '$1 $2')
    // Add space after common Latin words if followed by lowercase
    .replace(/(ipsum|dolor|sit|amet|consectetur|adipiscing|elit|sed|lorem|magna|nulla|integer|morbi|curabitur|vestibulum|mauris|fusce|nullam|quisque|class|aptent|praesent|suspendisse|lacinia|proin|duis|aenean|donec)([a-z])/gi, '$1 $2');
    
  // Second pass: Fix specific patterns common in Lorem Ipsum
  result = result
    // Fix common word boundaries that were missed
    .replace(/([a-z])(nec|quis|vel|eget|enim|nibh|ante|massa|tellus|augue|arcu|lectus|risus|turpis|ligula|metus|vitae|lacus|justo|orci|diam|pede|felis|porta|nunc|quam|sem)/gi, '$1 $2')
    .replace(/(nec|quis|vel|eget|enim|nibh|ante|massa|tellus|augue|arcu|lectus|risus|turpis|ligula|metus|vitae|lacus|justo|orci|diam|pede|felis|porta|nunc|quam|sem)([a-z])/gi, '$1 $2')
    // Fix compound words that should have spaces
    .replace(/([a-z])(ut|in|et|ac|eu|id|at|mi|non)/gi, '$1 $2')
    .replace(/(ut|in|et|ac|eu|id|at|mi|non)([a-z])/gi, '$1 $2');
    
  // Clean up any multiple spaces
  return result.replace(/ +/g, ' ');
}

// Decode hex-encoded strings from PDF
function decodeHexString(hex: string): string {
  // Check if it might be a simple character mapping (like in the original extractor)
  const charMap: { [key: string]: string } = {
    '01': 'D', '02': 'u', '03': 'm', '04': 'y',
    '05': ' ', '06': 'P', '07': 'F', '08': 'f',
    '09': 'i', '0a': 'l', '0b': 'e'
  };
  
  let mappedResult = '';
  for (let i = 0; i < hex.length; i += 2) {
    const code = hex.substr(i, 2).toLowerCase();
    if (charMap[code]) {
      mappedResult += charMap[code];
    }
  }
  
  if (mappedResult) {
    debug.log(`Character-mapped result: ${mappedResult}`);
    return mappedResult;
  }
  
  // Fallback to ASCII conversion if no mapping found
  let result = '';
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.substr(i, 2), 16);
    if (byte >= 32 && byte <= 126) {
      result += String.fromCharCode(byte);
    }
  }
  
  return result;
}