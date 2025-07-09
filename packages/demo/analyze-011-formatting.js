import { readFile } from 'fs/promises';
import { parseDocxDocument } from '../core/src/wrappers.js';

async function analyzeFormatting() {
  console.log('Analyzing 011.docx formatting and rendering issues...');
  
  try {
    const buffer = await readFile('./public/011.docx');
    const parsed = await parseDocxDocument(buffer.buffer);
    
    console.log('\\n=== DOCUMENT STRUCTURE ANALYSIS ===');
    console.log('Elements:', parsed.elements.length);
    console.log('Metadata:', parsed.metadata);
    
    // Analyze element types
    const elementTypes = {};
    parsed.elements.forEach(element => {
      elementTypes[element.type] = (elementTypes[element.type] || 0) + 1;
    });
    
    console.log('\\n=== ELEMENT TYPES ===');
    Object.entries(elementTypes).forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });
    
    // Check for formatting issues
    console.log('\\n=== FORMATTING ANALYSIS ===');
    
    let headingsFound = 0;
    let tablesFound = 0;
    let paragraphsWithStyling = 0;
    let runsWithFormatting = 0;
    let footnoteReferences = 0;
    let imageElements = 0;
    let pageBreaks = 0;
    
    parsed.elements.forEach((element, index) => {
      switch (element.type) {
        case 'heading':
          headingsFound++;
          console.log(`Heading ${element.level}: "${element.runs.map(r => r.text).join('').trim()}"`);
          break;
          
        case 'table':
          tablesFound++;
          console.log(`Table with ${element.rows.length} rows, ${element.rows[0]?.cells.length || 0} columns`);
          break;
          
        case 'paragraph':
          // Check for styling
          if (element.style) {
            paragraphsWithStyling++;
          }
          
          // Check runs for formatting
          element.runs.forEach(run => {
            if (run.bold || run.italic || run.underline || run.color || run.fontSize) {
              runsWithFormatting++;
            }
            
            // Check for footnote references
            if (run.text.includes('^')) {
              footnoteReferences++;
            }
          });
          
          // Show sample of formatted text
          const text = element.runs.map(r => r.text).join('').trim();
          if (text.length > 0 && (element.style || element.runs.some(r => r.bold || r.italic))) {
            console.log(`Formatted paragraph: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}" (style: ${element.style || 'none'})`);
          }
          break;
          
        case 'image':
          imageElements++;
          console.log(`Image: ${element.src} (${element.width}x${element.height})`);
          break;
          
        case 'footnote':
          const footnoteText = element.runs ? element.runs.map(r => r.text).join('').trim() : element.text || 'No text';
          console.log(`Footnote ${element.id}: "${footnoteText}"`);
          break;
          
        case 'pageBreak':
          pageBreaks++;
          break;
      }
    });
    
    console.log('\\n=== FORMATTING SUMMARY ===');
    console.log(`Headings: ${headingsFound}`);
    console.log(`Tables: ${tablesFound}`);
    console.log(`Paragraphs with styling: ${paragraphsWithStyling}`);
    console.log(`Runs with formatting: ${runsWithFormatting}`);
    console.log(`Footnote references: ${footnoteReferences}`);
    console.log(`Images: ${imageElements}`);
    console.log(`Page breaks: ${pageBreaks}`);
    
    // Check for potential issues
    console.log('\\n=== POTENTIAL ISSUES ===');
    
    // Check for missing styles
    if (headingsFound === 0) {
      console.log('⚠️  No headings detected - may need better heading detection');
    }
    
    // Check for footnote handling
    if (footnoteReferences > 0) {
      console.log('⚠️  Footnote references found - check footnote linking');
    }
    
    // Check for table formatting
    if (tablesFound > 0) {
      console.log('⚠️  Tables found - check table border/styling rendering');
    }
    
    // Check for images
    if (imageElements > 0) {
      console.log('⚠️  Images found - check image rendering and positioning');
    }
    
    // Detailed analysis of a few elements
    console.log('\\n=== DETAILED ELEMENT ANALYSIS ===');
    
    // Show first few paragraphs with their properties
    parsed.elements.slice(0, 10).forEach((element, index) => {
      if (element.type === 'paragraph') {
        const text = element.runs.map(r => r.text).join('').trim();
        if (text.length > 0) {
          console.log(`\\nParagraph ${index + 1}:`);
          console.log(`  Text: "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`);
          console.log(`  Style: ${element.style || 'none'}`);
          console.log(`  Runs: ${element.runs.length}`);
          
          element.runs.forEach((run, runIndex) => {
            if (run.bold || run.italic || run.underline || run.color || run.fontSize) {
              console.log(`    Run ${runIndex + 1}: "${run.text.substring(0, 40)}${run.text.length > 40 ? '...' : ''}" - ${JSON.stringify({
                bold: run.bold,
                italic: run.italic,
                underline: run.underline,
                color: run.color,
                fontSize: run.fontSize
              })}`);
            }
          });
        }
      }
    });
    
    // Check for bibliography section
    console.log('\\n=== BIBLIOGRAPHY ANALYSIS ===');
    let bibliographyFound = false;
    let citationCount = 0;
    
    parsed.elements.forEach(element => {
      if (element.type === 'paragraph') {
        const text = element.runs.map(r => r.text).join('').trim();
        if (text.toLowerCase().includes('bibliography') || text.toLowerCase().includes('references')) {
          bibliographyFound = true;
          console.log(`Bibliography section found: "${text}"`);
        }
        
        // Count citations (look for patterns like "Author. Title.")
        if (text.includes('.') && text.includes(',') && text.length > 50) {
          citationCount++;
        }
      }
    });
    
    console.log(`Bibliography section found: ${bibliographyFound}`);
    console.log(`Potential citations: ${citationCount}`);
    
  } catch (error) {
    console.error('Error analyzing document:', error);
  }
}

analyzeFormatting();