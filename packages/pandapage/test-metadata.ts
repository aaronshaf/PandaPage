import { Effect } from "effect";
import { extractMetadata, toArrayBuffer } from "./src/pdf-reader";
import { readFile } from "fs/promises";

async function testMetadataExtraction() {
  try {
    const pdfPath = "./../../assets/examples/sample1.pdf";
    const pdfBuffer = await readFile(pdfPath);
    
    // Convert Node.js Buffer to ArrayBuffer
    const arrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    );
    
    const metadata = await Effect.runPromise(extractMetadata(arrayBuffer));
    
    console.log("=== EXTRACTED METADATA ===");
    console.log(JSON.stringify(metadata, null, 2));
    console.log("=========================");
    
  } catch (error) {
    console.error("Error:", error);
  }
}

testMetadataExtraction();