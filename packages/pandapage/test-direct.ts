import { Effect } from "effect";
import { processPdf } from "./src/pdf-processor";
import { readFile } from "fs/promises";

async function testPdfExtraction() {
  try {
    const pdfPath = "../../assets/examples/sample1.pdf";
    const pdfBuffer = await readFile(pdfPath);
    
    console.log("PDF Buffer loaded, size:", pdfBuffer.length);
    
    // Convert Node.js Buffer to ArrayBuffer
    const arrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    );
    
    const result = await Effect.runPromise(processPdf(arrayBuffer));
    
    console.log("=== EXTRACTED CONTENT ===");
    console.log(result.raw);
    console.log("=========================");
    
    // Also check the expected output
    const expectedPath = "../../assets/examples/sample1.md";
    const expected = await readFile(expectedPath, "utf-8");
    
    console.log("\n=== EXPECTED CONTENT ===");
    console.log(expected);
    console.log("========================");
    
    console.log("\n=== COMPARISON ===");
    console.log("Extracted matches expected:", result.raw.trim() === expected.trim());
    
  } catch (error) {
    console.error("Error:", error);
  }
}

testPdfExtraction();