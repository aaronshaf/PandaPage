#!/usr/bin/env bun

import { Effect } from 'effect';
import * as fs from 'fs';
import { extractTextContent } from './src/pdf-text-extractor';
import { extractTextContentV3 } from './src/pdf-text-extractor-v3';
import { processPdf } from './src/pdf-processor';

async function testAllSamples() {
  const samples = [
    { name: 'sample1.pdf', path: '/Users/ashafovaloff/github/PandaPage/packages/demo/public/sample1.pdf' },
    { name: 'sample2.pdf', path: '/Users/ashafovaloff/github/PandaPage/packages/demo/public/sample2.pdf' },
    { name: 'sample3.pdf', path: '/Users/ashafovaloff/github/PandaPage/assets/examples/sample3.pdf' },
    { name: 'guide-footnotes.pdf', path: '/Users/ashafovaloff/github/PandaPage/packages/pandapage/test-fixtures/guide-footnotes.pdf' },
  ];

  console.log('Testing all sample PDFs with V3 extractor...');
  console.log('='.repeat(80));

  for (const sample of samples) {
    if (!fs.existsSync(sample.path)) {
      console.log(`\n❌ ${sample.name}: File not found at ${sample.path}`);
      continue;
    }

    console.log(`\n📄 Testing ${sample.name}...`);
    
    try {
      // Read PDF as ArrayBuffer
      const pdfBuffer = await fs.promises.readFile(sample.path);
      const buffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength);
      
      // Extract with V1 (baseline)
      const v1Result = await Effect.runPromise(extractTextContent(buffer));
      
      // Extract with V3 (new)
      const v3Result = await Effect.runPromise(extractTextContentV3(buffer));
      
      // Process with full pipeline
      const processed = await Effect.runPromise(processPdf(buffer));
      
      console.log(`  V1 length: ${v1Result.length} chars`);
      console.log(`  V3 length: ${v3Result.length} chars`);
      console.log(`  Match: ${v1Result === v3Result ? '✅ EXACT' : '⚠️  DIFFERENT'}`);
      
      if (v1Result !== v3Result) {
        const diff = Math.abs(v1Result.length - v3Result.length);
        const diffPercent = ((diff / v1Result.length) * 100).toFixed(1);
        console.log(`  Difference: ${diff} chars (${diffPercent}%)`);
        
        // Show first difference
        const firstDiff = [...v1Result].findIndex((char, i) => char !== v3Result[i]);
        if (firstDiff !== -1) {
          console.log(`  First diff at position ${firstDiff}:`);
          console.log(`    V1: "${v1Result.substring(firstDiff - 10, firstDiff + 10)}"`);
          console.log(`    V3: "${v3Result.substring(firstDiff - 10, firstDiff + 10)}"`);
        }
      }
      
      // Show first 100 chars
      console.log(`  Preview: "${v3Result.substring(0, 100).replace(/\n/g, ' ')}..."`);
      
    } catch (error) {
      console.error(`  ❌ Error: ${error}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
}

testAllSamples();