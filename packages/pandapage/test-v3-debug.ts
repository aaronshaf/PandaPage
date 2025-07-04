#!/usr/bin/env bun

import { Effect } from 'effect';
import * as fs from 'fs';
import { extractTextContentV3 } from './src/pdf-text-extractor-v3';

async function debugV3() {
  try {
    const pdfPath = '/Users/ashafovaloff/github/PandaPage/assets/examples/sample3.pdf';
    
    console.log('Debugging V3 extraction for sample3.pdf...');
    console.log('='.repeat(80));
    
    // Read PDF as ArrayBuffer
    const pdfBuffer = await fs.promises.readFile(pdfPath);
    const buffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength);
    
    // Extract with new method - this will show all the debug output
    const result = await Effect.runPromise(extractTextContentV3(buffer));
    
    console.log('\n=== FINAL RESULT ===');
    console.log(result);
    console.log('Length:', result.length);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugV3();