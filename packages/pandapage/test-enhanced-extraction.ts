#!/usr/bin/env bun

import * as fs from 'fs';
import { enhancedPdfExtraction } from './src/enhanced-pdf-extractor';
import { renderPdf } from './index';
import { Effect } from 'effect';

console.log("=== Testing Enhanced PDF Extraction ===\n");

// Test with guide-footnotes.pdf
const testFile = './../../assets/examples/guide-footnotes.pdf';
const expectedFile = './../../assets/examples/guide-footnotes.md';

console.log("Reading PDF and expected output...");
const pdfBytes = new Uint8Array(fs.readFileSync(testFile));
const expectedOutput = fs.readFileSync(expectedFile, 'utf-8');

console.log("\n--- Current Extraction ---");
const currentResult = await renderPdf(new Blob([pdfBytes], { type: 'application/pdf' }));
console.log("Length:", currentResult.length);
console.log("First 500 chars:");
console.log(currentResult.substring(0, 500));

console.log("\n--- Enhanced Extraction ---");
const enhancedResultEffect = enhancedPdfExtraction(pdfBytes, true);
const enhancedResult = Effect.runSync(enhancedResultEffect);
console.log("Length:", enhancedResult.length);
console.log("First 500 chars:");
console.log(enhancedResult.substring(0, 500));

console.log("\n--- Expected Output ---");
console.log("Length:", expectedOutput.length);
console.log("First 500 chars:");
console.log(expectedOutput.substring(0, 500));

console.log("\n=== Comparison ===");
console.log("Current extraction matches expected:", currentResult.trim() === expectedOutput.trim());
console.log("Enhanced extraction matches expected:", enhancedResult.trim() === expectedOutput.trim());

// Check for specific improvements
console.log("\n--- Specific Checks ---");
console.log("Current has footnote markers (^):", currentResult.includes('^'));
console.log("Enhanced has footnote markers (^):", enhancedResult.includes('^'));
console.log("Current has bold headers (**):", currentResult.includes('**'));
console.log("Enhanced has bold headers (**):", enhancedResult.includes('**'));
console.log("Current has block quotes (```):", currentResult.includes('```'));
console.log("Enhanced has block quotes (```):", enhancedResult.includes('```'));