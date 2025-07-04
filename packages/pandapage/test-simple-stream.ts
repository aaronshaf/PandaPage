#!/usr/bin/env bun

import * as fs from 'fs';

const pdfBytes = new Uint8Array(fs.readFileSync('./../../assets/examples/sample3.pdf'));
const text = new TextDecoder('latin1').decode(pdfBytes);

console.log("=== Step-by-step debugging ===");

// Step 1: Find object
const objStart = text.indexOf('4 0 obj');
console.log("1. Object found at:", objStart);

// Step 2: Find stream keyword
const streamKeyword = text.indexOf('stream', objStart);
console.log("2. Stream keyword at:", streamKeyword);

// Step 3: Find dictionary
const dictStart = text.indexOf('<<', objStart);
const dictEnd = text.indexOf('>>', dictStart);
console.log("3. Dict start:", dictStart, "Dict end:", dictEnd);

// Step 4: Extract dictionary
const dictStr = text.substring(dictStart + 2, dictEnd);
console.log("4. Dictionary:", dictStr);

// Step 5: Find endstream
const endstreamIndex = text.indexOf('endstream', streamKeyword);
console.log("5. Endstream at:", endstreamIndex);

// Step 6: Calculate positions
const streamStartBytes = streamKeyword + 6; // length of "stream"
console.log("6. Stream start bytes:", streamStartBytes);

// Check what character is at stream start
console.log("7. Char at stream start (code):", pdfBytes[streamStartBytes]);
console.log("8. Char at stream start+1 (code):", pdfBytes[streamStartBytes + 1]);

// Skip newline logic
let streamStart = streamStartBytes;
if (pdfBytes[streamStart] === 0x0d && pdfBytes[streamStart + 1] === 0x0a) {
  streamStart += 2; // CRLF
  console.log("9. Skipped CRLF, new start:", streamStart);
} else if (pdfBytes[streamStart] === 0x0a || pdfBytes[streamStart] === 0x0d) {
  streamStart += 1; // LF or CR
  console.log("9. Skipped single newline, new start:", streamStart);
} else {
  console.log("9. No newline to skip, start:", streamStart);
}

// Check length
const lengthMatch = dictStr.match(/\/Length\s+(\d+)(?:\s+\d+\s+R)?/);
console.log("10. Length match:", lengthMatch);

if (lengthMatch) {
  // Check if indirect reference
  if (dictStr.includes(`/Length ${lengthMatch[1]} 0 R`)) {
    console.log("11. Found indirect reference to object", lengthMatch[1]);
    
    // Look up the length object
    const lengthObjPattern = new RegExp(`${lengthMatch[1]}\\s+\\d+\\s+obj\\s*(\\d+)\\s*endobj`);
    const lengthObjMatch = text.match(lengthObjPattern);
    console.log("12. Length object match:", lengthObjMatch);
  }
}