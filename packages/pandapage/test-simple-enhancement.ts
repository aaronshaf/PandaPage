#!/usr/bin/env bun

import * as fs from 'fs';
import { renderPdf } from './index';

console.log("=== Testing Enhanced Formatting ===\n");

// Test with guide-footnotes.pdf
const testFile = './../../assets/examples/guide-footnotes.pdf';
const expectedFile = './../../assets/examples/guide-footnotes.md';

console.log("Processing guide-footnotes.pdf...");
const pdfBytes = new Uint8Array(fs.readFileSync(testFile));
const expectedOutput = fs.readFileSync(expectedFile, 'utf-8');

const result = await renderPdf(new Blob([pdfBytes], { type: 'application/pdf' }));

console.log("\n--- Enhanced Result (first 1000 chars) ---");
console.log(result.substring(0, 1000));

console.log("\n--- Expected Output (first 1000 chars) ---");
console.log(expectedOutput.substring(0, 1000));

console.log("\n--- Comparison ---");
console.log("Result length:", result.length);
console.log("Expected length:", expectedOutput.length);
console.log("Has bold headers (**):", result.includes('**'));
console.log("Has footnote markers (^):", result.includes('^'));
console.log("Has block quotes (```):", result.includes('```'));
console.log("Has list indentation (    ):", result.includes('    '));

// Check specific improvements
console.log("\n--- Specific Pattern Checks ---");
console.log("Title is bold:", result.includes('**Eighth Grade Term Paper: Footnotes**'));
console.log("Questions are bold:", result.includes('**What is a footnote?**'));
console.log("Has proper list items:", result.includes('a.') && result.includes('b.'));
console.log("Contains plagiarism definition:", result.includes('plagiarism'));
console.log("Contains footnote examples:", result.includes('My ideas on footnoting'));