import { Effect, pipe } from "effect";
import { readFileSync } from "fs";
import * as pako from "pako";

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error("Please provide a PDF file path");
  process.exit(1);
}

const buffer = readFileSync(pdfPath);
const bytes = new Uint8Array(buffer);
const text = new TextDecoder('latin1').decode(bytes);

// Find all content streams and decompress them
const streamPattern = /(\d+)\s+\d+\s+obj\s*<<([^>]*)>>\s*stream\s*\n/g;
let match;
let streamIndex = 0;

while ((match = streamPattern.exec(text)) !== null) {
  streamIndex++;
  const dictContent = match[2];
  const streamStart = match.index + match[0].length;
  
  // Find endstream
  const endStreamPattern = new Uint8Array([101, 110, 100, 115, 116, 114, 101, 97, 109]);
  let endStreamIndex = -1;
  
  for (let i = streamStart; i < bytes.length - endStreamPattern.length; i++) {
    let found = true;
    for (let j = 0; j < endStreamPattern.length; j++) {
      if (bytes[i + j] !== endStreamPattern[j]) {
        found = false;
        break;
      }
    }
    if (found) {
      endStreamIndex = i;
      break;
    }
  }
  
  if (endStreamIndex !== -1) {
    let streamBytes = bytes.slice(streamStart, endStreamIndex);
    
    // Handle compression
    if (dictContent.includes('FlateDecode')) {
      try {
        // Skip whitespace
        let dataStart = 0;
        while (dataStart < streamBytes.length && 
               (streamBytes[dataStart] === 0x0A || streamBytes[dataStart] === 0x0D || streamBytes[dataStart] === 0x20)) {
          dataStart++;
        }
        
        const compressedData = streamBytes.slice(dataStart);
        const decompressed = pako.inflate(compressedData);
        const streamContent = new TextDecoder('latin1').decode(decompressed);
        
        // Check if this stream contains text operations
        if (streamContent.includes('BT') || streamContent.includes('Tj') || streamContent.includes('TJ')) {
          console.log(`\n=== Stream ${streamIndex} (contains text) ===`);
          console.log("First 500 characters:");
          console.log(streamContent.substring(0, 500));
          
          // Look for q/Q and cm commands
          const qCount = (streamContent.match(/\bq\b/g) || []).length;
          const QCount = (streamContent.match(/\bQ\b/g) || []).length;
          const cmCount = (streamContent.match(/cm\b/g) || []).length;
          
          console.log(`\nFound ${qCount} 'q' commands (save state)`);
          console.log(`Found ${QCount} 'Q' commands (restore state)`);
          console.log(`Found ${cmCount} 'cm' commands (transformation matrix)`);
          
          // Show some cm examples
          const cmMatches = streamContent.match(/[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+cm/g);
          if (cmMatches) {
            console.log("\nExample cm commands:");
            cmMatches.slice(0, 5).forEach(cm => console.log(`  ${cm}`));
          }
          
          // Show pattern around first BT
          const btIndex = streamContent.indexOf('BT');
          if (btIndex >= 0) {
            const contextStart = Math.max(0, btIndex - 100);
            const contextEnd = Math.min(streamContent.length, btIndex + 200);
            console.log("\nContext around first BT:");
            console.log(streamContent.substring(contextStart, contextEnd));
          }
        }
        
      } catch (e) {
        console.error(`Failed to decompress stream ${streamIndex}:`, e);
      }
    }
  }
}