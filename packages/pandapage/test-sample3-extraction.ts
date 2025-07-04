import { Effect } from "effect";
import { extractTextContentV3 } from "./src/pdf-text-extractor-v3";
import * as fs from "fs";
import * as path from "path";

// Test the current V3 extractor on sample3
const testSample3 = async () => {
  // Enable debug logging
  process.env.LOG_LEVEL = "Debug";
  
  const pdfPath = path.join(__dirname, "../../assets/examples/sample3.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  console.log("Testing V3 extractor on sample3.pdf...\n");
  
  const result = await Effect.runPromise(extractTextContentV3(arrayBuffer));
  
  // Write to file for analysis
  fs.writeFileSync("sample3-v3-output.txt", result);
  console.log("\nOutput written to sample3-v3-output.txt");
  
  // Show structure
  console.log(`\nTotal length: ${result.length}`);
  console.log(`Contains page markers: ${result.includes('!"!')}`);
  
  // Show first 500 chars
  console.log("\nFirst 500 chars:");
  console.log(result.substring(0, 500));
  
  // Count unique markers
  const pageMarkers = result.match(/!"!/g) || [];
  console.log(`\nPage markers found: ${pageMarkers.length}`);
};

testSample3().catch(console.error);