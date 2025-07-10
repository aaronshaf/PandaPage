import { readFile } from 'fs/promises';
import { parseDocxDocument } from '../core/src/wrappers.js';

async function testHeadingDetection() {
  console.log('Testing improved heading detection...');
  
  try {
    const buffer = await readFile('./public/011.docx');
    const parsed = await parseDocxDocument(buffer.buffer);
    
    console.log('\\n=== HEADING DETECTION RESULTS ===');
    
    // Count headings and paragraphs
    let headingCount = 0;
    let paragraphCount = 0;
    
    parsed.elements.forEach((element, index) => {
      if (element.type === 'heading') {
        headingCount++;
        const text = element.runs.map(r => r.text).join('').trim();
        console.log(`HEADING ${element.level}: "${text}" (element ${index + 1})`);
      } else if (element.type === 'paragraph') {
        paragraphCount++;
        const text = element.runs.map(r => r.text).join('').trim();
        
        // Show first few paragraphs for context
        if (index < 15 && text.length > 0) {
          console.log(`Paragraph ${index + 1}: "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`);
        }
      }
    });
    
    console.log(`\\n=== SUMMARY ===`);
    console.log(`Total elements: ${parsed.elements.length}`);
    console.log(`Headings detected: ${headingCount}`);
    console.log(`Paragraphs: ${paragraphCount}`);
    console.log(`Other elements: ${parsed.elements.length - headingCount - paragraphCount}`);
    
    // Check for specific expected headings
    const expectedHeadings = [
      'TITLE OF THE CHICAGO FORMAT PAPER',
      'Bibliography'
    ];
    
    console.log(`\\n=== CHECKING EXPECTED HEADINGS ===`);
    expectedHeadings.forEach(expectedText => {
      const found = parsed.elements.find(el => 
        el.type === 'heading' && 
        el.runs.map(r => r.text).join('').trim().includes(expectedText)
      );
      console.log(`"${expectedText}": ${found ? '✓ FOUND as heading level ' + found.level : '✗ NOT FOUND'}`);
    });
    
    // Show text characteristics for debugging
    console.log(`\\n=== TEXT ANALYSIS FOR DEBUGGING ===`);
    parsed.elements.slice(0, 20).forEach((element, index) => {
      if (element.type === 'paragraph') {
        const text = element.runs.map(r => r.text).join('').trim();
        if (text.length > 0) {
          const hasBold = element.runs.some(r => r.bold);
          const hasLargeFont = element.runs.some(r => r.fontSize && r.fontSize > 12);
          const isShort = text.length <= 100;
          const isAllCaps = text === text.toUpperCase() && /[A-Z]/.test(text);
          const isCenter = element.alignment === 'center';
          
          if (hasBold || hasLargeFont || isAllCaps || isCenter || (isShort && index < 10)) {
            console.log(`Element ${index + 1}: "${text}"`);
            console.log(`  Bold: ${hasBold}, Large: ${hasLargeFont}, AllCaps: ${isAllCaps}, Center: ${isCenter}, Short: ${isShort}`);
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Error testing heading detection:', error);
  }
}

testHeadingDetection();