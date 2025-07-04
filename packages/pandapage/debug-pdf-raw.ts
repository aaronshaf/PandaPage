import { readFileSync } from "fs";

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error("Please provide a PDF file path");
  process.exit(1);
}

const buffer = readFileSync(pdfPath);
const text = new TextDecoder('latin1').decode(buffer);

// Find content streams
const streamPattern = /(\d+)\s+\d+\s+obj\s*<<([^>]*)>>\s*stream\s*\n/g;
let match;
let streamCount = 0;

while ((match = streamPattern.exec(text)) !== null) {
  streamCount++;
  const dictContent = match[2];
  const streamStart = match.index + match[0].length;
  
  // Find endstream
  const endStreamIndex = text.indexOf('endstream', streamStart);
  if (endStreamIndex === -1) continue;
  
  const streamContent = text.substring(streamStart, endStreamIndex);
  
  console.log(`\n=== Stream ${streamCount} ===`);
  console.log("Dictionary:", dictContent);
  
  // Check if compressed
  if (dictContent.includes('FlateDecode')) {
    console.log("(Stream is compressed)");
  } else {
    console.log("\nRaw content:");
    console.log(streamContent.substring(0, 500));
    console.log("...");
  }
}

console.log(`\nTotal streams found: ${streamCount}`);