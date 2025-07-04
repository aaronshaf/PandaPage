#!/usr/bin/env bun

import * as fs from 'fs';
import { extractAndDecodeStream } from './src/pdf-stream-decoder';

const pdfBuffer = fs.readFileSync('./../../assets/examples/sample3.pdf');
const pdfBytes = new Uint8Array(pdfBuffer);
const pdfText = new TextDecoder('latin1').decode(pdfBytes);

console.log("Testing stream extraction for object 4:");
console.log("=====================================");

// First let's check the raw object 4
const obj4Start = pdfText.indexOf('4 0 obj');
const obj4End = pdfText.indexOf('endobj', obj4Start);
const obj4Full = pdfText.substring(obj4Start, obj4End + 6);
console.log("Object 4 full:\n", obj4Full);

// Check object 5 (the length reference)
const obj5Pattern = /5\s+\d+\s+obj\s*(\d+)\s*endobj/s;
const obj5Match = pdfText.match(obj5Pattern);
console.log("Object 5 (length):", obj5Match ? obj5Match[1] : "NOT FOUND");

console.log("\n=== Now testing stream extraction ===");

// Let's manually check the stream positions
const streamPos = pdfText.indexOf('stream', pdfText.indexOf('4 0 obj'));
const endstreamPos = pdfText.indexOf('endstream', streamPos);
console.log("Stream starts at position:", streamPos);
console.log("Endstream at position:", endstreamPos);
console.log("Stream length would be:", endstreamPos - streamPos - 6);

console.log("About to call extractAndDecodeStream...");
const stream = extractAndDecodeStream('4', pdfBytes, true);
console.log("extractAndDecodeStream returned:", stream ? "SUCCESS" : "NULL");
if (stream) {
  console.log("Stream decoded successfully!");
  console.log("First 500 chars:");
  console.log(stream.substring(0, 500));
  
  // Look for text operators
  const hasBeginText = stream.includes('BT');
  const hasShowText = stream.includes('Tj') || stream.includes('TJ');
  const hasEndText = stream.includes('ET');
  
  console.log("\nText operators found:");
  console.log("- BT (BeginText):", hasBeginText);
  console.log("- Tj/TJ (ShowText):", hasShowText);
  console.log("- ET (EndText):", hasEndText);
  
  // Show some operators
  const lines = stream.split('\n').filter(l => l.trim());
  console.log("\nFirst 10 lines:");
  lines.slice(0, 10).forEach(line => console.log(line));
} else {
  console.log("Failed to extract stream!");
}