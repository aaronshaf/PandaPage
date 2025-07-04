import { Effect } from "effect";
import { extractTextContentV4 } from "./src/pdf-text-extractor-v4";
import * as fs from "fs";
import * as path from "path";

const testV4Extractor = async () => {
  console.log("Testing V4 extractor on sample3.pdf...\n");
  
  // Enable debug logging for this test
  process.env.LOG_LEVEL = "Debug";
  
  // Load the PDF
  const pdfPath = path.join(__dirname, "../../assets/examples/sample3.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  // Extract with V4
  const result = await Effect.runPromise(extractTextContentV4(arrayBuffer));
  
  console.log("=== V4 EXTRACTED TEXT ===");
  console.log(result);
  console.log("\n=== END V4 TEXT ===");
  
  // Compare with expected
  const expectedPath = path.join(__dirname, "../../assets/examples/sample3.md");
  const expected = fs.readFileSync(expectedPath, "utf-8");
  
  console.log(`\nV4 length: ${result.length}`);
  console.log(`Expected length: ${expected.length}`);
  
  // Show first 500 chars of each
  console.log("\nFirst 500 chars of V4:");
  console.log(result.substring(0, 500));
  
  console.log("\nFirst 500 chars of expected:");
  console.log(expected.substring(0, 500));
};

testV4Extractor().catch(console.error);