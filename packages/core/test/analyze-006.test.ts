import { describe, it } from "bun:test";
import { readFileSync } from "fs";
import { readEnhancedDocx } from "../src/formats/docx/reader-enhanced";
import { join } from "path";
import { Effect, Either } from "effect";

describe("006.docx Analysis", () => {
  it("should analyze 006.docx structure and content", async () => {
    const docPath = join(__dirname, "../../../documents/006.docx");
    const buffer = readFileSync(docPath);
    const effectResult = readEnhancedDocx(buffer);
    const result = await Effect.runPromise(effectResult);
    
    console.log("Parse result:", result);
    
    const doc = result;
    
    console.log("\n=== 006.docx Analysis ===");
    console.log("Document structure:", Object.keys(doc));
    console.log(`Total elements: ${doc.elements?.length || 0}`);
    
    // Count different element types
    const elementCounts: Record<string, number> = {};
    let superscriptCount = 0;
    let subscriptCount = 0;
    let specialFontCount = 0;
    let charSpacingCount = 0;
    let tableWithFormulas = 0;
    
    const elements = doc.elements || [];
    elements.forEach((element: any, index: number) => {
      elementCounts[element.type] = (elementCounts[element.type] || 0) + 1;
      
      if (element.type === "paragraph") {
        element.runs?.forEach((run: any) => {
          // Check for vertical alignment (superscript/subscript)
          if ((run as any).verticalAlignment === "superscript") superscriptCount++;
          if ((run as any).verticalAlignment === "subscript") subscriptCount++;
          
          // Check for special fonts
          if ((run as any).font && (run as any).font !== "Calibri") specialFontCount++;
          
          // Check for character spacing
          if ((run as any).characterSpacing) charSpacingCount++;
          
          // Log run details for first paragraph with superscript
          if (element.style === "Author" && index < 10) {
            console.log(`\nRun in Author paragraph:`, JSON.stringify(run, null, 2));
          }
        });
      }
      
      // Check tables
      if (element.type === "table" && index < 30) {
        console.log(`\nTable at index ${index}:`, JSON.stringify(element, null, 2).substring(0, 500) + "...");
        
        // Check for formulas in cells
        element.rows.forEach(row => {
          row.cells.forEach(cell => {
            cell.paragraphs.forEach(para => {
              const text = para.runs?.map(r => r.text).join("") || "";
              if (text.includes("=sum") || text.includes("SEQ")) {
                tableWithFormulas++;
              }
            });
          });
        });
      }
    });
    
    console.log("\nElement type breakdown:");
    Object.entries(elementCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log("\nSpecial features found:");
    console.log(`  Superscript runs: ${superscriptCount}`);
    console.log(`  Subscript runs: ${subscriptCount}`);
    console.log(`  Special fonts: ${specialFontCount}`);
    console.log(`  Character spacing: ${charSpacingCount}`);
    console.log(`  Tables with formulas: ${tableWithFormulas}`);
    
    // Sample some content
    console.log("\nFirst 10 elements preview:");
    elements.slice(0, 10).forEach((element, index) => {
      if (element.type === "paragraph") {
        const text = element.runs?.map(r => r.text).join("") || "[empty]";
        console.log(`  ${index}: ${element.style || "Normal"} - "${text.substring(0, 60)}"`);
      } else if (element.type === "table") {
        console.log(`  ${index}: table with ${element.rows.length} rows`);
      } else {
        console.log(`  ${index}: ${element.type}`);
      }
    });
    
    // Check for missing features by examining raw XML
    const rawXml = readFileSync("/tmp/006-document.xml", "utf-8");
    
    console.log("\nFeatures in XML but possibly not parsed:");
    if (rawXml.includes("w:drawing")) console.log("  - Drawing objects (charts, shapes)");
    if (rawXml.includes("w:fldSimple") || rawXml.includes("w:instrText")) console.log("  - Field codes (SEQ, formulas)");
    if (rawXml.includes("w:smartTag")) console.log("  - Smart tags");
    if (rawXml.includes("w:sdt")) console.log("  - Structured document tags");
    if (rawXml.includes("w:footnote")) console.log("  - Footnotes");
    if (rawXml.includes("w:endnote")) console.log("  - Endnotes");
    if (rawXml.includes("w:comment")) console.log("  - Comments");
    if (rawXml.includes("w:ins") || rawXml.includes("w:del")) console.log("  - Track changes");
  });
});