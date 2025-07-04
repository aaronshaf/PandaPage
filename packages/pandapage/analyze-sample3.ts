import { Effect } from "effect";
import { extractTextContentV3 } from "./src/pdf-text-extractor-v3";
import * as fs from "fs";
import * as path from "path";

// Enable debug logging for this analysis
process.env.LOG_LEVEL = "Debug";

const analyzeSample3 = async () => {
  console.log("Analyzing sample3.pdf positioning data...\n");
  
  // Load the PDF
  const pdfPath = path.join(__dirname, "../../assets/examples/sample3.pdf");
  const buffer = fs.readFileSync(pdfPath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  // Extract with positioning data
  const result = await Effect.runPromise(extractTextContentV3(arrayBuffer));
  
  console.log("\n=== EXTRACTED TEXT ===");
  console.log(result);
  console.log("\n=== END EXTRACTED TEXT ===\n");
  
  // Also load the expected markdown to compare
  const expectedPath = path.join(__dirname, "../../assets/examples/sample3.md");
  const expected = fs.readFileSync(expectedPath, "utf-8");
  
  console.log("\n=== EXPECTED MARKDOWN ===");
  console.log(expected);
  console.log("\n=== END EXPECTED MARKDOWN ===\n");
  
  // Compare lengths
  console.log(`Extracted text length: ${result.length}`);
  console.log(`Expected text length: ${expected.length}`);
};

analyzeSample3().catch(console.error);