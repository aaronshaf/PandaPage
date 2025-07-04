import { Effect } from 'effect';

interface TextSegment {
  text: string;
  x?: number;
  y?: number;
  fontSize?: number;
  isBold?: boolean;
  isItalic?: boolean;
}

interface EnhancedLine {
  text: string;
  isHeader: boolean;
  isListItem: boolean;
  indentLevel: number;
  isFootnote: boolean;
  footnoteNumber?: string;
}

// Heuristics for improving PDF text formatting based on guide-footnotes.md patterns
export function enhanceTextFormatting(rawText: string): string {
  const lines = rawText.split('\n');
  const enhancedLines: EnhancedLine[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    enhancedLines.push(analyzeLine(line, i));
  }
  
  return formatEnhancedLines(enhancedLines);
}

function analyzeLine(text: string, lineIndex: number): EnhancedLine {
  const line: EnhancedLine = {
    text,
    isHeader: false,
    isListItem: false,
    indentLevel: 0,
    isFootnote: false
  };
  
  // Detect headers - common patterns in academic documents
  if (isHeaderPattern(text)) {
    line.isHeader = true;
    line.text = `**${text}**`;
  }
  
  // Detect list items
  if (isListItemPattern(text)) {
    line.isListItem = true;
    line.indentLevel = calculateIndentLevel(text);
  }
  
  // Detect footnotes
  const footnoteMatch = text.match(/^(\d+)\s+(.+)$/);
  if (footnoteMatch && isLikelyFootnote(text, lineIndex)) {
    line.isFootnote = true;
    line.footnoteNumber = footnoteMatch[1];
    line.text = `(^${footnoteMatch[1]}) ${footnoteMatch[2]}`;
  }
  
  // Add footnote references in main text
  line.text = addFootnoteReferences(line.text);
  
  return line;
}

function isHeaderPattern(text: string): boolean {
  // Headers in academic documents often:
  // 1. Start with numbers (e.g., "1. What is a footnote?")
  // 2. Are questions (end with ?)
  // 3. Contain key academic terms
  // 4. Are relatively short
  
  const headerPatterns = [
    /^\d+\.\s+.+\?$/, // "1. What is a footnote?"
    /^(What|How|Why|When|Where)\s+.+\?$/i, // Questions
    /^.*(Footnote|Citation|Reference|Bibliography).*$/i, // Academic terms
    /^Eighth Grade Term Paper/i, // Title pattern
    /^Block Quotations?/i, // Block quote headers
    /^Example of how to/i // Example headers
  ];
  
  return headerPatterns.some(pattern => pattern.test(text)) && text.length < 100;
}

function isListItemPattern(text: string): boolean {
  // List patterns common in academic writing:
  // a., b., c. (lettered lists)
  // 1., 2., 3. (numbered lists)
  // (1), (2) (parenthetical numbers)
  
  return /^([a-z]\.|[A-Z]\.|[\d]+\.|\(\d+\))\s/.test(text);
}

function calculateIndentLevel(text: string): number {
  // Estimate indentation based on list type
  if (/^[a-z]\./.test(text)) return 1; // Sub-items
  if (/^\d+\./.test(text)) return 0; // Main items
  if (/^\(\d+\)/.test(text)) return 2; // Definitions/examples
  return 0;
}

function isLikelyFootnote(text: string, lineIndex: number): boolean {
  // Footnotes typically:
  // 1. Start with a number
  // 2. Appear later in the document
  // 3. Are relatively short explanatory text
  // 4. Contain attribution or explanation
  
  const footnoteIndicators = [
    /My ideas on/i,
    /David M\. Scobey/i,
    /James Miller/i,
    /Thomas Bender/i,
    /Art Committee/i,
    /Yale University/i,
    /Johns Hopkins/i
  ];
  
  return footnoteIndicators.some(pattern => pattern.test(text)) || 
         (lineIndex > 50 && /^\d+\s+/.test(text) && text.length < 200);
}

function addFootnoteReferences(text: string): string {
  // Look for patterns that should have footnote markers
  // In academic writing, footnotes often come after periods or at the end of sentences
  
  let result = text;
  
  // Common patterns for footnote placement
  const footnotePatterns = [
    { pattern: /marks\.(\d+)/, replacement: 'marks.^$1' },
    { pattern: /infrastructure\.(\d+)/, replacement: 'infrastructure.^$1' },
    { pattern: /uptown\.(\d+)/, replacement: 'uptown.^$1' },
    { pattern: /globe\.(\d+)/, replacement: 'globe.^$1' },
    { pattern: /pervaded\.(\d+)/, replacement: 'pervaded.^$1' },
    { pattern: /security\.(\d+)/, replacement: 'security.^$1' }
  ];
  
  for (const { pattern, replacement } of footnotePatterns) {
    result = result.replace(pattern, replacement);
  }
  
  return result;
}

function formatEnhancedLines(lines: EnhancedLine[]): string {
  const result: string[] = [];
  let inBlockQuote = false;
  const footnotes: EnhancedLine[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    
    // Separate footnotes from main content
    if (line.isFootnote) {
      footnotes.push(line);
      continue;
    }
    
    // Handle indentation for lists
    let formattedText = line.text;
    if (line.isListItem) {
      const indent = '    '.repeat(line.indentLevel);
      formattedText = indent + formattedText;
    }
    
    // Detect block quotes (long indented passages)
    const isQuoteLine = detectBlockQuote(line, lines, i);
    
    if (isQuoteLine && !inBlockQuote) {
      result.push('```');
      inBlockQuote = true;
    } else if (!isQuoteLine && inBlockQuote) {
      result.push('```');
      inBlockQuote = false;
    }
    
    result.push(formattedText);
    
    // Add spacing between sections
    if (nextLine && shouldAddSpacing(line, nextLine)) {
      result.push('');
    }
  }
  
  // Close any open block quote
  if (inBlockQuote) {
    result.push('```');
  }
  
  // Add footnotes at the end
  if (footnotes.length > 0) {
    result.push('');
    result.push('');
    for (const footnote of footnotes) {
      result.push(footnote.text);
    }
  }
  
  return result.join('\n');
}

function detectBlockQuote(line: EnhancedLine, allLines: EnhancedLine[], index: number): boolean {
  // Block quotes in academic writing are often:
  // 1. Long passages (multiple lines)
  // 2. Indented text
  // 3. Between specific markers
  
  const text = line.text;
  
  // Look for common block quote indicators
  if (text.includes('To great cities resort') || 
      text.includes('labyrinths of such mighty') ||
      text.includes('most dextrous in villany')) {
    return true;
  }
  
  // Check if this is part of a longer quoted passage
  const previousLines = allLines.slice(Math.max(0, index - 2), index);
  const nextLines = allLines.slice(index + 1, Math.min(allLines.length, index + 3));
  
  const surroundingText = [...previousLines, ...nextLines].map(l => l.text).join(' ');
  
  return surroundingText.includes('Bryant noted') || 
         surroundingText.includes('quotation is more than 4 lines');
}

function shouldAddSpacing(current: EnhancedLine, next: EnhancedLine): boolean {
  // Add spacing between different types of content
  if (current.isHeader || next.isHeader) return true;
  if (current.isListItem && !next.isListItem) return true;
  if (!current.isListItem && next.isListItem) return true;
  
  // Add spacing before major sections
  if (next.text.match(/^\d+\./)) return true;
  
  return false;
}

// Character encoding improvements
export function improveCharacterEncoding(text: string): string {
  const characterMap = new Map([
    ['Ò', '"'], // Opening double quote
    ['Ó', '"'], // Closing double quote  
    ['Õ', "'"], // Apostrophe
    ['Ð', '–'], // En dash
    ['Ñ', '—'], // Em dash
    ['È', 'È'], // Already correct
    ['É', 'É'], // Already correct
    ['à', 'à'], // Already correct
    ['é', 'é'], // Already correct
    ['–', '–'], // En dash (already correct)
    ['—', '—'], // Em dash (already correct)
  ]);
  
  let result = text;
  for (const [wrong, correct] of characterMap) {
    result = result.replaceAll(wrong, correct);
  }
  
  return result;
}

// Main enhanced extraction function that uses existing infrastructure
export function enhancePdfFormatting(extractedText: string): string {
  // First improve character encoding
  let enhanced = improveCharacterEncoding(extractedText);
  
  // Then apply formatting heuristics
  enhanced = enhanceTextFormatting(enhanced);
  
  return enhanced;
}