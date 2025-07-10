// Debug script to understand what's being parsed from 011.docx
import fs from "fs";

// Read the extracted document.xml
const xmlContent = fs.readFileSync("011-document.xml", "utf8");

console.log("=== XML CONTENT INFO ===");
console.log("Total length:", xmlContent.length);

// Use the same regex as in the parser
const paragraphRegex = /<w:p[^>]*>(.*?)<\/w:p>/gs;
let paragraphMatch;
let paragraphCount = 0;
let totalTextLength = 0;

console.log("\n=== PARAGRAPH ANALYSIS ===");

while ((paragraphMatch = paragraphRegex.exec(xmlContent)) !== null) {
  paragraphCount++;
  const paragraphContent = paragraphMatch[1];

  if (paragraphContent && paragraphContent.trim()) {
    // Extract text content like the parser does
    const runRegex = /<w:r[^>]*>(.*?)<\/w:r>/gs;
    let runMatch;
    let paragraphText = "";

    while ((runMatch = runRegex.exec(paragraphContent)) !== null) {
      const runContent = runMatch[1];
      if (!runContent) continue;

      // Extract text elements
      const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      let textMatch;

      while ((textMatch = textRegex.exec(runContent)) !== null) {
        const textContent = textMatch[1] || "";
        paragraphText += textContent;
      }
    }

    if (paragraphText.trim()) {
      totalTextLength += paragraphText.length;
      console.log(
        `Paragraph ${paragraphCount}: "${paragraphText.trim().substring(0, 100)}${paragraphText.length > 100 ? "..." : ""}" (${paragraphText.length} chars)`,
      );

      // Check if this paragraph contains "prefer"
      if (paragraphText.includes("prefer")) {
        console.log(`  ^^ CONTAINS "prefer" - Position: ${paragraphText.indexOf("prefer")}`);
      }
    }
  }
}

console.log("\n=== SUMMARY ===");
console.log(`Total paragraphs found: ${paragraphCount}`);
console.log(`Total text length: ${totalTextLength}`);

// Look for specific patterns that might indicate issues
console.log("\n=== CHECKING FOR ISSUES ===");
const sectPrCount = (xmlContent.match(/<w:sectPr/g) || []).length;
const pageBreakCount = (xmlContent.match(/w:type="page"/g) || []).length;
const sectionBreakCount = (xmlContent.match(/w:type="nextPage"/g) || []).length;

console.log(`Section properties found: ${sectPrCount}`);
console.log(`Page breaks found: ${pageBreakCount}`);
console.log(`Section breaks found: ${sectionBreakCount}`);
