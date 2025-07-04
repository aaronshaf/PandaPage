import { Effect } from "effect";
import * as fs from "fs";
import * as path from "path";
import * as pako from "pako";

// Test to understand why positions are all (0,0)
const testV3Positioning = async () => {
  console.log("Analyzing V3 positioning issue...\n");
  
  const pdfPath = path.join(__dirname, "../../assets/examples/sample3.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const bytes = new Uint8Array(buffer);
  const text = new TextDecoder('latin1').decode(bytes);
  
  // Find first content stream
  const streamPattern = /(\d+)\s+\d+\s+obj\s*<<([^>]*)>>\s*stream\s*\n/g;
  const match = streamPattern.exec(text);
  
  if (!match) {
    console.log("No stream found");
    return;
  }
  
  const dictContent = match[2];
  const streamStart = match.index + match[0].length;
  
  // Find endstream
  const endStreamIndex = text.indexOf('\nendstream', streamStart);
  const streamLength = endStreamIndex - streamStart;
  const streamBytes = bytes.slice(streamStart, streamStart + streamLength);
  
  // Decompress
  let streamContent: string;
  try {
    const decompressed = pako.inflate(streamBytes);
    streamContent = new TextDecoder('latin1').decode(decompressed);
  } catch (e) {
    console.log("Failed to decompress");
    return;
  }
  
  // Look for the pattern before BT blocks
  console.log("Looking for graphics state before text blocks...\n");
  
  // Find all q...Q blocks that contain text
  const graphicsBlocks = streamContent.match(/q[^q]*?BT[^]*?ET[^]*?Q/g) || [];
  
  console.log(`Found ${graphicsBlocks.length} graphics blocks with text\n`);
  
  for (let i = 0; i < Math.min(3, graphicsBlocks.length); i++) {
    console.log(`\n=== Graphics Block ${i + 1} ===`);
    const block = graphicsBlocks[i];
    
    // Extract cm command
    const cmMatch = block.match(/([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+cm/);
    if (cmMatch) {
      console.log(`Transformation: ${cmMatch[0]}`);
      console.log(`  Translation: (${cmMatch[5]}, ${cmMatch[6]})`);
      console.log(`  Scale: (${cmMatch[1]}, ${cmMatch[4]})`);
    }
    
    // Extract text matrix
    const tmMatch = block.match(/([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+Tm/);
    if (tmMatch) {
      console.log(`Text matrix: ${tmMatch[0]}`);
    }
    
    // Extract text
    const textMatch = block.match(/\(((?:[^()\\]|\\.)*)\)\s*Tj/);
    if (textMatch) {
      console.log(`Text: "${textMatch[1]}"`);
    }
  }
  
  // Look for positioning pattern
  console.log("\n=== Positioning Pattern Analysis ===");
  
  // Find all cm commands
  const allCmCommands = streamContent.match(/([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+cm/g) || [];
  console.log(`Total cm (transformation) commands: ${allCmCommands.length}`);
  if (allCmCommands.length > 0) {
    console.log("First 5 cm commands:");
    allCmCommands.slice(0, 5).forEach(cm => console.log(`  ${cm}`));
  }
  
  // Find pattern: q ... cm BT ... ET Q
  const graphicsTextPattern = /q[^q]*?([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+cm\s*BT[^ET]*?ET\s*Q/g;
  const matches = streamContent.match(graphicsTextPattern) || [];
  console.log(`\nFound ${matches.length} graphics state + text blocks`);
  
  if (matches.length > 0) {
    console.log("\nFirst match structure:");
    const firstMatch = matches[0];
    console.log(firstMatch.substring(0, 100) + "...");
  }
};

testV3Positioning().catch(console.error);