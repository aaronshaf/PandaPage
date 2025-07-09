#!/usr/bin/env bun

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseDocxDocument } from './packages/parser/src/parsers/docx/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testBoldItalicRendering() {
  console.log('Testing bold and italic text rendering with 001.docx...\n');
  
  try {
    // Load the 001.docx file
    const docxPath = join(__dirname, 'documents', '001.docx');
    const docxBuffer = await readFile(docxPath);
    
    console.log(`✓ Loaded 001.docx (${docxBuffer.length} bytes)`);
    
    // Parse the document
    const document = await parseDocxDocument(docxBuffer.buffer);
    
    console.log(`✓ Parsed document with ${document.elements.length} elements\n`);
    
    // Find bold and italic text
    let foundBoldText = false;
    let foundItalicText = false;
    
    console.log('Searching for formatted text...\n');
    
    for (let i = 0; i < document.elements.length; i++) {
      const element = document.elements[i];
      
      // Only process paragraphs and headings
      if (element.type === 'paragraph' || element.type === 'heading') {
        for (let j = 0; j < element.runs.length; j++) {
          const run = element.runs[j];
          
          // Check for bold text
          if (run.bold && run.text.includes('Bold text')) {
            console.log(`✓ Found bold text: "${run.text}" (element ${i + 1}, run ${j + 1})`);
            console.log(`  Bold: ${run.bold}, Italic: ${run.italic || false}`);
            foundBoldText = true;
          }
          
          // Check for italic text
          if (run.italic && run.text.includes('Italicized test')) {
            console.log(`✓ Found italic text: "${run.text}" (element ${i + 1}, run ${j + 1})`);
            console.log(`  Bold: ${run.bold || false}, Italic: ${run.italic}`);
            foundItalicText = true;
          }
          
          // Also log any other formatted text for debugging
          if ((run.bold || run.italic) && !run.text.includes('Bold text') && !run.text.includes('Italicized test')) {
            console.log(`• Other formatted text: "${run.text}" (Bold: ${run.bold || false}, Italic: ${run.italic || false})`);
          }
        }
      }
    }
    
    console.log('\n--- Test Results ---');
    
    if (foundBoldText) {
      console.log('✓ PASS: Bold text "Bold text." was correctly identified');
    } else {
      console.log('✗ FAIL: Bold text "Bold text." was NOT found');
    }
    
    if (foundItalicText) {
      console.log('✓ PASS: Italic text "Italicized test." was correctly identified');
    } else {
      console.log('✗ FAIL: Italic text "Italicized test." was NOT found');
    }
    
    if (foundBoldText && foundItalicText) {
      console.log('\n🎉 SUCCESS: Bold and italic text rendering is working correctly!');
      console.log('The fix for CT_OnOff parsing and OR logic between b/bCs and i/iCs is functional.');
    } else {
      console.log('\n❌ FAILED: Some formatting was not detected correctly.');
      console.log('The bold/italic parsing may need further investigation.');
    }
    
    // Debug: Show all runs for analysis
    console.log('\n--- Debug: All Text Runs ---');
    for (let i = 0; i < document.elements.length; i++) {
      const element = document.elements[i];
      if ((element.type === 'paragraph' || element.type === 'heading') && element.runs.length > 0) {
        console.log(`Element ${i + 1} (${element.type}):`);
        for (let j = 0; j < element.runs.length; j++) {
          const run = element.runs[j];
          console.log(`  Run ${j + 1}: "${run.text}" (Bold: ${run.bold || false}, Italic: ${run.italic || false})`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error testing bold/italic rendering:', error);
    process.exit(1);
  }
}

testBoldItalicRendering();