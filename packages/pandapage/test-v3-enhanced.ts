import { Effect } from "effect";
import { extractTextContentV3Enhanced } from "./src/pdf-text-extractor-v3-enhanced";
import * as fs from "fs";
import * as path from "path";

const testV3Enhanced = async () => {
  console.log("Testing V3 Enhanced extractor on sample3.pdf...\n");
  
  // Enable debug logging
  process.env.LOG_LEVEL = "Debug";
  
  // Load the PDF
  const pdfPath = path.join(__dirname, "../../assets/examples/sample3.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  // Extract with V3 Enhanced
  const result = await Effect.runPromise(extractTextContentV3Enhanced(arrayBuffer));
  
  console.log("\n=== V3 ENHANCED EXTRACTED TEXT ===");
  console.log(result);
  console.log("\n=== END V3 ENHANCED TEXT ===");
  
  // Compare with expected
  const expectedPath = path.join(__dirname, "../../assets/examples/sample3.md");
  const expected = fs.readFileSync(expectedPath, "utf-8");
  
  console.log(`\nV3 Enhanced length: ${result.length}`);
  console.log(`Expected length: ${expected.length}`);
  
  // Compare structure
  const v3Lines = result.split('\n').filter(line => line.trim());
  const expectedLines = expected.split('\n').filter(line => line.trim());
  
  console.log(`\nV3 Enhanced lines: ${v3Lines.length}`);
  console.log(`Expected lines: ${expectedLines.length}`);
  
  // Show first few lines
  console.log("\nFirst 10 lines of V3 Enhanced:");
  v3Lines.slice(0, 10).forEach((line, i) => {
    console.log(`${i + 1}: ${line}`);
  });
  
  console.log("\nFirst 10 lines of expected:");
  expectedLines.slice(0, 10).forEach((line, i) => {
    console.log(`${i + 1}: ${line}`);
  });
};

testV3Enhanced().catch(console.error);