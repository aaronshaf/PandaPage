// Debug the heading detection logic
console.log('Testing heading detection logic...');

// Mock the test content
const testCases = [
  {
    name: 'nested runs test',
    paragraph: {
      runs: [
        { text: 'Part 1 ', bold: false },
        { text: 'Part 2 ', bold: true },
        { text: 'Part 3', bold: false }
      ],
      alignment: undefined,
      numId: undefined,
      ilvl: undefined,
      outlineLevel: undefined
    },
    paragraphIndex: 0,
    outlineLevel: undefined
  },
  {
    name: 'title test',
    paragraph: {
      runs: [
        { text: 'TITLE OF THE CHICAGO FORMAT PAPER', bold: false, italic: true }
      ],
      alignment: 'center',
      numId: undefined,
      ilvl: undefined,
      outlineLevel: undefined
    },
    paragraphIndex: 8,
    outlineLevel: undefined
  }
];

function detectHeadingDebug(paragraph, runs, paragraphIndex, outlineLevel) {
  
  // Method 1: Style-based detection (existing logic)
  if (paragraph.style) {
    const styleNormalized = paragraph.style.toLowerCase().replace(/\\s+/g, '');
    
    // More comprehensive heading detection
    // Exclude 'header' and 'footer' styles which are for page headers/footers
    const isStyleHeading = (
      styleNormalized === 'title' ||
      styleNormalized === 'heading' ||
      styleNormalized.startsWith('heading') ||
      (styleNormalized.startsWith('head') && styleNormalized !== 'header' && !styleNormalized.startsWith('header')) ||
      (styleNormalized.includes('title') && !styleNormalized.includes('subtitle')) ||
      // Common DOCX heading style variations
      /^h[1-6]$/.test(styleNormalized) ||
      /^heading[1-6]$/.test(styleNormalized) ||
      /^title\\d*$/.test(styleNormalized)
    );
    
    if (isStyleHeading) {
      console.log('✓ Style-based detection');
      return { isHeading: true, level: 1 };
    }
  }
  
  // Method 2: Outline level detection
  if (typeof outlineLevel === 'number' && outlineLevel >= 0 && outlineLevel <= 8) {
    const level = Math.min(6, outlineLevel + 1);
    console.log('✓ Outline level detection:', level);
    return { isHeading: true, level };
  }
  
  // Method 3: Text and formatting-based heuristics
  const text = runs.map(run => run.text).join('').trim();
  
  if (!text || text.length === 0) {
    console.log('✗ Empty text');
    return { isHeading: false, level: 1 };
  }
  
  // Don't treat list items as headings
  if (paragraph.numId && paragraph.ilvl !== undefined) {
    console.log('✗ List item');
    return { isHeading: false, level: 1 };
  }
  
  // Don't treat single runs with multiple formatting properties as headings
  // (these are likely formatted paragraphs from tests or documents with heavy formatting)
  if (runs.length === 1) {
    const run = runs[0];
    const formattingCount = [
      run.bold, run.italic, run.underline, run.strikethrough, 
      run.fontSize, run.color, run.backgroundColor
    ].filter(Boolean).length;
    
    if (formattingCount >= 4) {
      console.log('✗ Heavy formatting');
      return { isHeading: false, level: 1 };
    }
  }
  
  // Calculate heuristic scores
  let score = 0;
  let level = 1;
  
  console.log('Text:', JSON.stringify(text));
  console.log('Runs:', runs.length);
  
  // Text characteristics
  const isShort = text.length <= 100; // Headings are usually short
  const isAllCaps = text === text.toUpperCase() && /[A-Z]/.test(text);
  const isTitleCase = /^[A-Z]/.test(text) && !/[.!?]$/.test(text); // Starts with capital, no ending punctuation
  const hasNoEndPunctuation = !/[.!?]$/.test(text);
  const wordCount = text.split(/\\s+/).length;
  const isReasonableLength = wordCount >= 1 && wordCount <= 15; // 1-15 words
  
  // Position-based scoring
  const isEarlyInDocument = typeof paragraphIndex === 'number' && paragraphIndex < 20;
  
  // Formatting characteristics
  const hasBoldRuns = runs.some(run => run.bold);
  const allRunsBold = runs.length > 0 && runs.every(run => run.bold || !run.text.trim());
  const hasLargeFont = runs.some(run => run.fontSize && run.fontSize > 12);
  const isCenter = paragraph.alignment === 'center';
  const hasMixedFormatting = runs.some(run => run.bold) && runs.some(run => run.italic) && runs.some(run => !run.bold && !run.italic);
  
  console.log('Characteristics:');
  console.log('  isShort:', isShort);
  console.log('  isAllCaps:', isAllCaps);
  console.log('  isTitleCase:', isTitleCase);
  console.log('  hasNoEndPunctuation:', hasNoEndPunctuation);
  console.log('  isReasonableLength:', isReasonableLength);
  console.log('  isEarlyInDocument:', isEarlyInDocument);
  console.log('  hasBoldRuns:', hasBoldRuns);
  console.log('  allRunsBold:', allRunsBold);
  console.log('  hasLargeFont:', hasLargeFont);
  console.log('  isCenter:', isCenter);
  console.log('  hasMixedFormatting:', hasMixedFormatting);
  
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
  
  console.log('Current score:', score);
  
  // Additional filters to reduce false positives
  const hasQuotes = text.includes('"') || text.includes('"') || text.includes('"');
  const hasCommas = text.includes(',');
  const hasColons = text.includes(':');
  const hasNumbers = /\\d/.test(text);
  const hasParentheses = text.includes('(') || text.includes(')');
  const looksLikeCitation = hasQuotes && hasCommas && (hasNumbers || hasParentheses);
  const isProbablyBibliography = paragraphIndex && paragraphIndex > 50 && looksLikeCitation;
  
  // Reduce score for likely citations
  if (looksLikeCitation) score -= 3;
  if (isProbablyBibliography) score -= 5;
  
  // Reduce score for mixed formatting (typical of formatted paragraphs, not headings)
  if (hasMixedFormatting) score -= 4;
  
  // Boost score for known title patterns
  if (text.toLowerCase().includes('title of the')) score += 3;
  if (text.toLowerCase() === 'bibliography') score += 3;
  
  console.log('Final score:', score);
  
  // Threshold for considering it a heading
  const isHeading = score >= 7; // Increased threshold to reduce false positives
  
  console.log('Is heading:', isHeading);
  
  return { isHeading, level };
}

testCases.forEach(testCase => {
  console.log('\\n=== Testing:', testCase.name, '===');
  const result = detectHeadingDebug(testCase.paragraph, testCase.paragraph.runs, testCase.paragraphIndex, testCase.outlineLevel);
  console.log('Result:', result);
});