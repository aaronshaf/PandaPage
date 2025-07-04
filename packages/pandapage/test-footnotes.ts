#!/usr/bin/env bun

import { processPdf } from './src/pdf-processor';
import { Effect } from 'effect';
import * as fs from 'fs';

async function testFootnotes() {
  try {
    const pdfPath = '/Users/ashafovaloff/github/PandaPage/packages/pandapage/test-fixtures/guide-footnotes.pdf';
    
    console.log('Testing guide-footnotes.pdf with improved line break detection...');
    console.log('='.repeat(80));
    
    // Read PDF as ArrayBuffer
    const pdfBuffer = await fs.promises.readFile(pdfPath);
    const buffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength);
    
    // Process with Effect
    const result = await Effect.runPromise(processPdf(buffer, { includeMetadata: true }));
    
    console.log('=== EXTRACTED CONTENT ===');
    console.log(result.raw);
    console.log('='.repeat(80));
    
    // Check for proper line breaks by counting paragraphs
    const lines = result.raw.split('\n').filter(line => line.trim().length > 0);
    const paragraphs = result.raw.split('\n\n').filter(p => p.trim().length > 0);
    
    console.log(`\nStats:`);
    console.log(`- Total non-empty lines: ${lines.length}`);
    console.log(`- Total paragraphs: ${paragraphs.length}`);
    console.log(`- Average line length: ${result.raw.length / lines.length} chars`);
    
    // Check for specific patterns that indicate good line break detection
    const hasQuestions = result.raw.includes('What is a footnote?');
    const hasNumberedSections = /\d+\.\s+/.test(result.raw);
    const hasFootnoteReferences = /\^\d+/.test(result.raw);
    
    console.log(`\nLine break quality indicators:`);
    console.log(`- Contains questions: ${hasQuestions}`);
    console.log(`- Has numbered sections: ${hasNumberedSections}`);
    console.log(`- Has footnote references: ${hasFootnoteReferences}`);
    
  } catch (error) {
    console.error('Error processing guide-footnotes.pdf:', error);
  }
}

testFootnotes();