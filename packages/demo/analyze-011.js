import { readFile } from 'fs/promises';
import { readEnhancedDocx } from '@browser-document-viewer/core';

async function analyze011() {
  console.log('Analyzing 011.docx parsing...');
  
  try {
    // Read the 011.docx file
    const buffer = await readFile('./public/011.docx');
    
    // Parse with enhanced parser
    const parsed = await readEnhancedDocx(buffer.buffer);
    
    console.log('=== PARSING RESULTS ===');
    console.log('Elements found:', parsed.elements.length);
    console.log('Word count:', parsed.wordCount);
    console.log('Character count:', parsed.characterCount);
    console.log('Paragraph count:', parsed.paragraphCount);
    
    console.log('\n=== FIRST 10 ELEMENTS ===');
    parsed.elements.slice(0, 10).forEach((element, index) => {
      console.log(`${index + 1}. Type: ${element.type}`);
      if (element.type === 'paragraph') {
        const text = element.runs.map(run => run.text).join('').trim();
        console.log(`   Text: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
        console.log(`   Style: ${element.style || 'none'}`);
      }
    });
    
    console.log('\n=== LAST 10 ELEMENTS ===');
    parsed.elements.slice(-10).forEach((element, index) => {
      const actualIndex = parsed.elements.length - 10 + index;
      console.log(`${actualIndex + 1}. Type: ${element.type}`);
      if (element.type === 'paragraph') {
        const text = element.runs.map(run => run.text).join('').trim();
        console.log(`   Text: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
        console.log(`   Style: ${element.style || 'none'}`);
      }
    });
    
    console.log('\n=== CHECKING FOR PAGE BREAKS ===');
    let pageBreakCount = 0;
    parsed.elements.forEach((element, index) => {
      if (element.type === 'paragraph') {
        element.runs.forEach(run => {
          if (run.text.includes('\u000C')) {
            pageBreakCount++;
            console.log(`Page break found at element ${index + 1}`);
          }
        });
      }
    });
    console.log(`Total page breaks found: ${pageBreakCount}`);
    
    // Check for text that ends with "prefer)."
    console.log('\n=== SEARCHING FOR "prefer)." TEXT ===');
    let foundPreferText = false;
    parsed.elements.forEach((element, index) => {
      if (element.type === 'paragraph') {
        const text = element.runs.map(run => run.text).join('');
        if (text.includes('prefer).')) {
          foundPreferText = true;
          console.log(`Found "prefer)." at element ${index + 1}: "${text.trim()}"`);
          console.log(`This is element ${index + 1} of ${parsed.elements.length}`);
        }
      }
    });
    
    if (!foundPreferText) {
      console.log('Text ending with "prefer)." not found in parsed elements');
    }
    
  } catch (error) {
    console.error('Error analyzing 011.docx:', error);
  }
}

analyze011();