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

console.log(`PDF size: ${bytes.length} bytes`);

// Find all content streams
const streamPattern = /(\d+)\s+\d+\s+obj\s*<<([^>]*)>>\s*stream/g;
let match;
let streamCount = 0;
let textStreamCount = 0;

while ((match = streamPattern.exec(text)) !== null) {
  streamCount++;
  const dictContent = match[2];
  
  // Skip non-page content streams
  if (dictContent.includes('/Type /XObject') || 
      dictContent.includes('/Type /Font') ||
      dictContent.includes('/ColorSpace')) {
    continue;
  }
  
  console.log(`\nStream ${streamCount} dictionary: ${dictContent}`);
  
  const streamStart = match.index + match[0].length;
  
  // Find endstream
  let endStreamIndex = text.indexOf('endstream', streamStart);
  if (endStreamIndex === -1) continue;
  
  // Extract raw bytes
  const rawStreamContent = text.substring(streamStart, endStreamIndex);
  
  // Check if it's compressed
  if (dictContent.includes('FlateDecode')) {
    console.log("Stream is compressed, attempting to decompress...");
    
    // Get the actual byte data
    const streamStartBytes = Buffer.from(text.substring(0, streamStart), 'latin1').length;
    const streamEndBytes = Buffer.from(text.substring(0, endStreamIndex), 'latin1').length;
    let streamBytes = bytes.slice(streamStartBytes, streamEndBytes);
    
    // Skip whitespace at start
    let dataStart = 0;
    while (dataStart < streamBytes.length && 
           (streamBytes[dataStart] === 0x0A || 
            streamBytes[dataStart] === 0x0D || 
            streamBytes[dataStart] === 0x20)) {
      dataStart++;
    }
    
    try {
      const compressedData = streamBytes.slice(dataStart);
      const decompressed = pako.inflate(compressedData);
      const content = new TextDecoder('latin1').decode(decompressed);
      
      if (content.includes('BT') || content.includes('Tj')) {
        textStreamCount++;
        console.log(`Found text stream! Length: ${content.length}`);
        console.log("First 300 chars:");
        console.log(content.substring(0, 300));
        
        // Look for transformation patterns
        if (content.includes(' cm')) {
          console.log("\nContains cm (transformation) commands!");
        }
        if (content.includes(' q')) {
          console.log("Contains q/Q (save/restore) commands!");
        }
      }
    } catch (e) {
      console.log("Failed to decompress");
    }
  } else {
    // Uncompressed stream
    if (rawStreamContent.includes('BT') || rawStreamContent.includes('Tj')) {
      textStreamCount++;
      console.log("Found uncompressed text stream!");
      console.log("First 300 chars:");
      console.log(rawStreamContent.substring(0, 300));
    }
  }
}

console.log(`\nTotal streams: ${streamCount}`);
console.log(`Text streams: ${textStreamCount}`);