#!/usr/bin/env bun

import { Effect } from 'effect';
import * as fs from 'fs';
import { extractTextContent } from './src/pdf-text-extractor';
import { extractTextContentV3 } from './src/pdf-text-extractor-v3';

async function compareSample3() {
  try {
    const pdfPath = '/Users/ashafovaloff/github/PandaPage/assets/examples/sample3.pdf';
    
    console.log('Comparing sample3.pdf extraction methods...');
    console.log('='.repeat(80));
    
    // Read PDF as ArrayBuffer
    const pdfBuffer = await fs.promises.readFile(pdfPath);
    const buffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength);
    
    // Extract with old method
    console.log('\n=== OLD EXTRACTOR (v1) ===');
    const oldResult = await Effect.runPromise(extractTextContent(buffer));
    console.log(oldResult);
    console.log('='.repeat(80));
    
    // Extract with new method
    console.log('\n=== NEW EXTRACTOR (v3) ===');
    const newResult = await Effect.runPromise(extractTextContentV3(buffer));
    console.log(newResult);
    console.log('='.repeat(80));
    
    // Compare results
    console.log('\n=== COMPARISON ===');
    console.log(`Old length: ${oldResult.length} chars`);
    console.log(`New length: ${newResult.length} chars`);
    console.log(`Equal: ${oldResult === newResult}`);
    
    if (oldResult !== newResult) {
      console.log('\nFirst difference at character:', 
        [...oldResult].findIndex((char, i) => char !== newResult[i])
      );
      
      // Show first 200 chars of each
      console.log('\nOld (first 200 chars):', oldResult.substring(0, 200));
      console.log('\nNew (first 200 chars):', newResult.substring(0, 200));
    }
    
  } catch (error) {
    console.error('Error processing sample3.pdf:', error);
  }
}

compareSample3();