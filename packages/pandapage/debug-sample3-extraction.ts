import { Effect } from "effect";
import * as fs from "fs";
import * as path from "path";
import * as pako from "pako";

// Load and process sample3.pdf step by step
const debugSample3 = async () => {
  console.log("=== DEBUG SAMPLE3 PDF EXTRACTION ===\n");
  
  // Load the PDF
  const pdfPath = path.join(__dirname, "../../assets/examples/sample3.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const bytes = new Uint8Array(buffer);
  const text = new TextDecoder('latin1').decode(bytes);
  
  // Find content streams
  const streamPattern = /(\d+)\s+\d+\s+obj\s*<<([^>]*)>>\s*stream\s*\n/g;
  
  let match;
  let streamCount = 0;
  
  while ((match = streamPattern.exec(text)) !== null) {
    streamCount++;
    const dictContent = match[2];
    const streamStart = match.index + match[0].length;
    
    console.log(`\n=== STREAM ${streamCount} ===`);
    console.log(`Dictionary: ${dictContent}`);
    
    // Find endstream
    const endStreamIndex = text.indexOf('\nendstream', streamStart);
    if (endStreamIndex === -1) {
      console.log("Could not find endstream");
      continue;
    }
    
    const streamLength = endStreamIndex - streamStart;
    const streamBytes = bytes.slice(streamStart, streamStart + streamLength);
    
    // Try to decompress if needed
    let streamContent: string;
    if (dictContent.includes('/FlateDecode')) {
      try {
        const decompressed = pako.inflate(streamBytes);
        streamContent = new TextDecoder('latin1').decode(decompressed);
        console.log("Stream decompressed successfully");
      } catch (e) {
        console.log("Failed to decompress stream");
        continue;
      }
    } else {
      streamContent = new TextDecoder('latin1').decode(streamBytes);
    }
    
    // Check if it's a text stream
    if (!streamContent.includes('BT') || !streamContent.includes('ET')) {
      console.log("Not a text stream (no BT/ET markers)");
      continue;
    }
    
    console.log("Text stream found!");
    console.log(`Stream length: ${streamContent.length} chars`);
    
    // Show first 500 chars
    console.log("\nFirst 500 chars of stream:");
    console.log(streamContent.substring(0, 500));
    
    // Extract text blocks
    const textBlockPattern = /BT([\s\S]*?)ET/g;
    let blockMatch;
    let blockCount = 0;
    
    while ((blockMatch = textBlockPattern.exec(streamContent)) !== null) {
      blockCount++;
      const block = blockMatch[1];
      
      console.log(`\n--- Text Block ${blockCount} ---`);
      console.log("Raw block content:");
      console.log(block.substring(0, 200) + (block.length > 200 ? '...' : ''));
      
      // Look for positioning commands
      const lines = block.split(/[\r\n]+/).filter(line => line.trim());
      console.log(`\nBlock has ${lines.length} lines`);
      
      // Check first few lines for positioning
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim();
        console.log(`Line ${i + 1}: ${line.substring(0, 60)}${line.length > 60 ? '...' : ''}`);
        
        // Check for positioning commands
        if (line.includes('Tm')) {
          console.log("  -> Contains text matrix (Tm)");
        }
        if (line.includes('Td')) {
          console.log("  -> Contains text displacement (Td)");
        }
        if (line.includes('Tf')) {
          console.log("  -> Contains font selection (Tf)");
        }
        if (line.includes('Tj')) {
          console.log("  -> Contains text show (Tj)");
        }
        if (line.includes('TJ')) {
          console.log("  -> Contains text array (TJ)");
        }
      }
    }
    
    console.log(`\nTotal text blocks in stream: ${blockCount}`);
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total streams found: ${streamCount}`);
};

debugSample3().catch(console.error);