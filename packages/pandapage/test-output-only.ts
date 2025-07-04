#!/usr/bin/env bun

import * as fs from 'fs';
import { renderPdf } from './index';

// Disable logging for cleaner output
console.log = () => {};
console.debug = () => {};

console.error("=== Enhanced PDF Formatting Test ===\n");

const testFile = './../../assets/examples/guide-footnotes.pdf';
const pdfBytes = new Uint8Array(fs.readFileSync(testFile));
const result = await renderPdf(new Blob([pdfBytes], { type: 'application/pdf' }));

console.error("--- Enhanced Result (first 2000 chars) ---");
console.error(result.substring(0, 2000));

console.error("\n--- Improvements Detected ---");
console.error("✓ Bold headers (**):", result.includes('**'));
console.error("✓ Has character improvements:", result.includes('"') && !result.includes('Ò'));
console.error("✓ Contains core content:", result.includes('Eighth Grade Term Paper') && result.includes('footnote'));
console.error("✓ Has list formatting:", result.includes('a.') || result.includes('1.'));
console.error("✓ Length:", result.length, "characters");