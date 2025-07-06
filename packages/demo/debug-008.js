#!/usr/bin/env node

/**
 * Debug script to analyze 008.docx "Project Report Template" heading parsing
 * 
 * This script uses the PandaPage parsing functions to analyze the document structure
 * and investigate why the heading isn't rendering correctly.
 */

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up DOM globals for Node.js environment
import { DOMParser } from '@xmldom/xmldom';
global.DOMParser = DOMParser;
global.Node = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  DOCUMENT_NODE: 9
};

// Import the PandaPage parsing functions directly from source
const { parseDocxToStructured } = await import('../pandapage/src/formats/docx/docx-to-structured.ts');
const { readEnhancedDocx } = await import('../pandapage/src/formats/docx/reader-enhanced.ts');
const { Effect } = await import('effect');

async function main() {
  try {
    console.log('=== Debug Script for 008.docx ===');
    console.log('Analyzing "Project Report Template" heading parsing...\n');
    
    // Load the 008.docx file
    const docxPath = resolve(__dirname, 'public', '008.docx');
    console.log(`Loading document: ${docxPath}`);
    
    const buffer = await fs.readFile(docxPath);
    console.log(`Document loaded, size: ${buffer.length} bytes\n`);
    
    // Parse using the enhanced reader
    console.log('=== Parsing with Enhanced Reader ===');
    const parsedDocument = await Effect.runPromise(readEnhancedDocx(buffer));
    
    console.log(`Document metadata:`);
    console.log(`- Processing time: ${parsedDocument.processingTime}ms`);
    console.log(`- Word count: ${parsedDocument.wordCount}`);
    console.log(`- Character count: ${parsedDocument.characterCount}`);
    console.log(`- Paragraph count: ${parsedDocument.paragraphCount}`);
    console.log(`- Extracted at: ${parsedDocument.extractedAt}`);
    console.log(`- Original format: ${parsedDocument.originalFormat}\n`);
    
    // Log metadata details
    if (parsedDocument.metadata) {
      console.log('Document metadata:');
      console.log(JSON.stringify(parsedDocument.metadata, null, 2));
      console.log();
    }
    
    // Analyze the first few elements
    console.log('=== First 10 Elements Analysis ===');
    const firstElements = parsedDocument.elements.slice(0, 10);
    
    firstElements.forEach((element, index) => {
      console.log(`Element ${index + 1}:`);
      console.log(`  Type: ${element.type}`);
      
      if (element.type === 'paragraph') {
        console.log(`  Style: ${element.style || 'undefined'}`);
        console.log(`  Runs: ${element.runs.length}`);
        
        // Analyze runs
        element.runs.forEach((run, runIndex) => {
          console.log(`    Run ${runIndex + 1}:`);
          console.log(`      Text: "${run.text}"`);
          console.log(`      Bold: ${run.bold || false}`);
          console.log(`      Italic: ${run.italic || false}`);
          console.log(`      Underline: ${run.underline || false}`);
        });
        
        // Get full text
        const fullText = element.runs.map(r => r.text).join('');
        console.log(`  Full text: "${fullText}"`);
        
        // Check if this might be the title
        if (fullText.includes('Project Report Template')) {
          console.log('  >>> THIS IS THE PROJECT REPORT TEMPLATE ELEMENT <<<');
          console.log('  >>> Detailed analysis:');
          console.log(`      - Detected as paragraph, not heading`);
          console.log(`      - Style: ${element.style || 'No style detected'}`);
          console.log(`      - Number of runs: ${element.runs.length}`);
          console.log(`      - Text formatting breakdown:`);
          element.runs.forEach((run, runIndex) => {
            console.log(`        Run ${runIndex + 1}: "${run.text}"`);
            console.log(`          Bold: ${run.bold || false}`);
            console.log(`          Italic: ${run.italic || false}`);
            console.log(`          Underline: ${run.underline || false}`);
          });
        }
      } else if (element.type === 'table') {
        console.log(`  Rows: ${element.rows.length}`);
        console.log(`  Properties: ${element.properties ? 'Yes' : 'No'}`);
      }
      
      console.log();
    });
    
    // Parse using the structured parser
    console.log('=== Parsing with Structured Parser ===');
    const structuredResult = await parseDocxToStructured(buffer);
    
    console.log('Structured document elements:');
    console.log(`- Total elements: ${structuredResult.document.elements.length}`);
    console.log(`- Metadata keys: ${Object.keys(structuredResult.document.metadata).join(', ')}`);
    console.log();
    
    // Show the generated markdown
    console.log('=== Generated Markdown (first 500 chars) ===');
    console.log(structuredResult.markdown.substring(0, 500));
    if (structuredResult.markdown.length > 500) {
      console.log('... (truncated)');
    }
    console.log();
    
    // Search for the Project Report Template specifically
    console.log('=== Searching for "Project Report Template" ===');
    const titleElement = parsedDocument.elements.find(element => {
      if (element.type === 'paragraph') {
        const text = element.runs.map(r => r.text).join('');
        return text.includes('Project Report Template');
      }
      return false;
    });
    
    if (titleElement) {
      console.log('Found "Project Report Template" element:');
      console.log(JSON.stringify(titleElement, null, 2));
    } else {
      console.log('❌ Could not find "Project Report Template" element');
    }
    
    // Check if any elements have heading styles
    console.log('\n=== Elements with Heading Styles ===');
    const headingElements = parsedDocument.elements.filter(element => {
      if (element.type === 'paragraph') {
        return element.style && element.style.toLowerCase().includes('heading');
      }
      return false;
    });
    
    console.log(`Found ${headingElements.length} elements with heading styles:`);
    headingElements.forEach((element, index) => {
      if (element.type === 'paragraph') {
        const text = element.runs.map(r => r.text).join('');
        console.log(`  ${index + 1}. Style: ${element.style}, Text: "${text}"`);
      }
    });
    
    // Check for elements with bold formatting
    console.log('\n=== Elements with Bold Formatting ===');
    const boldElements = parsedDocument.elements.filter(element => {
      if (element.type === 'paragraph') {
        return element.runs.some(run => run.bold);
      }
      return false;
    });
    
    console.log(`Found ${boldElements.length} elements with bold formatting:`);
    boldElements.slice(0, 5).forEach((element, index) => {
      if (element.type === 'paragraph') {
        const text = element.runs.map(r => r.text).join('');
        console.log(`  ${index + 1}. Text: "${text}"`);
        console.log(`      Style: ${element.style || 'None'}`);
        console.log(`      Bold runs: ${element.runs.filter(r => r.bold).length}/${element.runs.length}`);
      }
    });
    
    console.log('\n=== Analysis Complete ===');
    console.log('This debug script has analyzed the 008.docx document structure.');
    console.log('Check the output above for details about how the "Project Report Template" heading is parsed.');
    
  } catch (error) {
    console.error('Error during analysis:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main().catch(console.error);