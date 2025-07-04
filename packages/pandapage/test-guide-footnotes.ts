import { renderPdf } from "./index";
import { readFile } from "fs/promises";

async function testGuideFootnotesExtraction() {
  try {
    const pdfPath = "../../assets/examples/guide-footnotes.pdf";
    const pdfBuffer = await readFile(pdfPath);
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
    
    console.log("PDF Buffer loaded, size:", pdfBuffer.length);
    
    const result = await renderPdf(pdfBlob);
    
    console.log("=== EXTRACTED CONTENT ===");
    console.log(result);
    console.log("=========================");
    
    // Show line breaks and structure
    console.log("\n=== ANALYZING LINE BREAKS ===");
    const lines = result.split('\n');
    console.log(`Total lines: ${lines.length}`);
    lines.forEach((line, i) => {
      if (i < 20) { // Show first 20 lines
        console.log(`${i + 1}: "${line}"`);
      }
    });
    console.log("==============================");
    
  } catch (error) {
    console.error("Error:", error);
  }
}

testGuideFootnotesExtraction();