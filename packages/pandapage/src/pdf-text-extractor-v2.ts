import { Effect } from 'effect';
import * as pako from 'pako';
import { extractAndDecodeStream, extractPageContentStreams as extractStreams } from './pdf-stream-decoder';
import { debug } from './debug';

interface TextState {
  x: number;
  y: number;
  fontSize: number;
  font: string;
  lineHeight: number;
  charSpace: number;
  wordSpace: number;
  textMatrix: number[];
  ctm: number[]; // Current transformation matrix
}

interface TextItem {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  page: number;
}

// Text operators
const TEXT_OPERATORS = {
  BT: 'BeginText',
  ET: 'EndText',
  Tj: 'ShowText',
  TJ: 'ShowTextArray',
  Td: 'MoveText',
  TD: 'MoveTextSetLeading',
  Tm: 'SetTextMatrix',
  'T*': 'NextLine',
  Tf: 'SetFontAndSize',
  TL: 'SetTextLeading',
  Tc: 'SetCharSpacing',
  Tw: 'SetWordSpacing',
  Tz: 'SetHorizScaling',
  Ts: 'SetTextRise',
  q: 'SaveGraphicsState',
  Q: 'RestoreGraphicsState',
  cm: 'ConcatMatrix'
};

export const extractTextFromPdfV2 = (
  pdfBuffer: ArrayBuffer,
  options: { logging?: boolean } = {}
): Effect.Effect<string, Error> =>
  Effect.gen(function* () {
    const bytes = new Uint8Array(pdfBuffer);
    const text = new TextDecoder('latin1').decode(bytes);
    
    // Extract all pages
    const pages = yield* extractPages(text);
    if (options.logging) debug.log(`Found ${pages.length} pages`);
    
    // Process each page
    const allTextItems: TextItem[] = [];
    
    for (let pageNum = 0; pageNum < pages.length; pageNum++) {
      const page = pages[pageNum];
      
      // Get page content streams using improved decoder
      const contentStreams = yield* extractStreams(page, bytes, options.logging);
      if (options.logging) debug.log(`Page ${pageNum + 1} has ${contentStreams.length} content streams`);
      
      // Get page resources (fonts, etc.)
      const resources = yield* getPageResources(page, text);
      
      // Process each content stream
      for (const stream of contentStreams) {
        const textItems = yield* extractTextFromContentStream(
          stream,
          resources,
          pageNum + 1,
          options
        );
        allTextItems.push(...textItems);
      }
    }
    
    // Sort text items by page, then y position (top to bottom), then x position
    allTextItems.sort((a, b) => {
      if (a.page !== b.page) return a.page - b.page;
      if (Math.abs(a.y - b.y) > 5) return b.y - a.y; // PDF coordinates are bottom-up
      return a.x - b.x;
    });
    
    // Build final text with proper formatting
    let finalText = '';
    let lastPage = 0;
    let lastY = Infinity;
    let lastX = 0;
    
    for (const item of allTextItems) {
      // Page break
      if (item.page !== lastPage) {
        if (lastPage > 0) finalText += '\n\n';
        lastPage = item.page;
        lastY = Infinity;
        lastX = 0;
      }
      
      // Line break
      if (lastY - item.y > item.fontSize * 0.5) {
        finalText += '\n';
        lastX = 0;
      }
      // Space between words
      else if (item.x - lastX > item.fontSize * 0.2) {
        finalText += ' ';
      }
      
      finalText += item.text;
      lastY = item.y;
      lastX = item.x + (item.text.length * item.fontSize * 0.5); // Approximate
    }
    
    return finalText.trim();
  });

// Extract all page objects from PDF
function extractPages(pdfText: string): Effect.Effect<string[], Error> {
  return Effect.try(() => {
    const pages: string[] = [];
    
    // Find all Page objects (not Pages)
    const pagePattern = /(\d+)\s+\d+\s+obj\s*<<([^>]*\/Type\s*\/Page[^>]*)>>/g;
    let match;
    
    while ((match = pagePattern.exec(pdfText)) !== null) {
      const content = match[2];
      // Make sure it's a Page, not Pages
      if (!/\/Type\s*\/Pages/.test(content)) {
        pages.push(match[0]);
      }
    }
    
    return pages;
  });
}


// Get page resources (fonts, etc.)
function getPageResources(page: string, pdfText: string): Effect.Effect<any, Error> {
  return Effect.try(() => {
    const resources: any = { fonts: {} };
    
    // Extract Resources reference
    const resourcesMatch = page.match(/\/Resources\s*(\d+)\s+\d+\s+R/);
    if (resourcesMatch) {
      const objNum = resourcesMatch[1];
      const resourceObj = extractObject(objNum, pdfText);
      
      // Extract font references
      const fontMatch = resourceObj?.match(/\/Font\s*<<([^>]*)>>/);
      if (fontMatch) {
        const fontDict = fontMatch[1];
        const fontRefs = fontDict.match(/\/(\w+)\s+(\d+)\s+\d+\s+R/g) || [];
        
        for (const fontRef of fontRefs) {
          const match = fontRef.match(/\/(\w+)\s+(\d+)/);
          if (match) {
            resources.fonts[match[1]] = match[2];
          }
        }
      }
    }
    
    return resources;
  });
}

// Extract an object by its number
function extractObject(objNum: string, pdfText: string): string | null {
  const objPattern = new RegExp(
    `${objNum}\\s+\\d+\\s+obj([\\s\\S]*?)endobj`,
    ''
  );
  const match = pdfText.match(objPattern);
  return match ? match[1] : null;
}

// Extract text from a content stream
function extractTextFromContentStream(
  stream: string,
  resources: any,
  pageNum: number,
  options: { logging?: boolean } = {}
): Effect.Effect<TextItem[], Error> {
  return Effect.try(() => {
    const textItems: TextItem[] = [];
    const graphicsStack: TextState[] = [];
    
    // Initialize text state
    let textState: TextState = {
      x: 0,
      y: 0,
      fontSize: 12,
      font: '',
      lineHeight: 0,
      charSpace: 0,
      wordSpace: 0,
      textMatrix: [1, 0, 0, 1, 0, 0],
      ctm: [1, 0, 0, 1, 0, 0]
    };
    
    // Parse content stream into operators
    const operators = parseContentStream(stream);
    
    // Process each operator
    for (const op of operators) {
      switch (op.operator) {
        case 'BT': // Begin text
          textState.textMatrix = [1, 0, 0, 1, 0, 0];
          break;
          
        case 'ET': // End text
          break;
          
        case 'Tf': // Set font and size
          if (op.args.length >= 2) {
            textState.font = op.args[0];
            textState.fontSize = parseFloat(op.args[1]);
          }
          break;
          
        case 'Td': // Move text position
          if (op.args.length >= 2) {
            const tx = parseFloat(op.args[0]);
            const ty = parseFloat(op.args[1]);
            textState.textMatrix[4] += tx;
            textState.textMatrix[5] += ty;
          }
          break;
          
        case 'TD': // Move text and set leading
          if (op.args.length >= 2) {
            const tx = parseFloat(op.args[0]);
            const ty = parseFloat(op.args[1]);
            textState.textMatrix[4] += tx;
            textState.textMatrix[5] += ty;
            textState.lineHeight = -ty;
          }
          break;
          
        case 'Tm': // Set text matrix
          if (op.args.length >= 6) {
            textState.textMatrix = op.args.map(a => parseFloat(a));
          }
          break;
          
        case 'T*': // Next line
          textState.textMatrix[5] -= textState.lineHeight;
          break;
          
        case 'Tj': // Show text
          if (op.args.length >= 1) {
            const text = decodeText(op.args[0]);
            if (text) {
              textItems.push({
                text,
                x: textState.textMatrix[4],
                y: textState.textMatrix[5],
                fontSize: textState.fontSize,
                page: pageNum
              });
              
              // Advance position
              const width = text.length * textState.fontSize * 0.5; // Approximate
              textState.textMatrix[4] += width;
            }
          }
          break;
          
        case 'TJ': // Show text array
          if (op.args.length >= 1) {
            const array = parseTextArray(op.args[0]);
            for (const item of array) {
              if (typeof item === 'string') {
                const text = decodeText(item);
                if (text) {
                  textItems.push({
                    text,
                    x: textState.textMatrix[4],
                    y: textState.textMatrix[5],
                    fontSize: textState.fontSize,
                    page: pageNum
                  });
                  
                  // Advance position
                  const width = text.length * textState.fontSize * 0.5;
                  textState.textMatrix[4] += width;
                }
              } else {
                // Numeric adjustment (in thousands of text space units)
                const adjustment = -item * textState.fontSize / 1000;
                textState.textMatrix[4] += adjustment;
              }
            }
          }
          break;
          
        case 'q': // Save graphics state
          graphicsStack.push(JSON.parse(JSON.stringify(textState)));
          break;
          
        case 'Q': // Restore graphics state
          if (graphicsStack.length > 0) {
            textState = graphicsStack.pop()!;
          }
          break;
      }
    }
    
    return textItems;
  });
}

// Parse content stream into operators
function parseContentStream(stream: string): Array<{operator: string, args: string[]}> {
  const operators: Array<{operator: string, args: string[]}> = [];
  const lines = stream.split(/[\r\n]+/).filter(line => line.trim());
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Find the operator (last token that matches known operators)
    const tokens = trimmed.split(/\s+/);
    let operatorIndex = -1;
    
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (tokens[i] in TEXT_OPERATORS) {
        operatorIndex = i;
        break;
      }
    }
    
    if (operatorIndex >= 0) {
      const operator = tokens[operatorIndex];
      const args = tokens.slice(0, operatorIndex);
      operators.push({ operator, args });
    }
  }
  
  return operators;
}

// Decode text from PDF string
function decodeText(str: string): string {
  // Remove parentheses
  if (str.startsWith('(') && str.endsWith(')')) {
    str = str.substring(1, str.length - 1);
    
    // Decode escape sequences
    str = str
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
      .replace(/\\(\d{3})/g, (match, octal) => {
        return String.fromCharCode(parseInt(octal, 8));
      });
    
    return str;
  }
  
  // Handle hex strings
  if (str.startsWith('<') && str.endsWith('>')) {
    str = str.substring(1, str.length - 1);
    let result = '';
    
    for (let i = 0; i < str.length; i += 2) {
      if (i + 1 < str.length) {
        const hex = str.substr(i, 2);
        result += String.fromCharCode(parseInt(hex, 16));
      }
    }
    
    return result;
  }
  
  return '';
}

// Parse text array for TJ operator
function parseTextArray(str: string): Array<string | number> {
  const result: Array<string | number> = [];
  
  if (!str.startsWith('[') || !str.endsWith(']')) {
    return result;
  }
  
  str = str.substring(1, str.length - 1).trim();
  
  // Simple parsing - should be improved for production
  const parts = str.split(/\s+/);
  for (const part of parts) {
    if (part.startsWith('(') || part.startsWith('<')) {
      result.push(part);
    } else if (!isNaN(parseFloat(part))) {
      result.push(parseFloat(part));
    }
  }
  
  return result;
}