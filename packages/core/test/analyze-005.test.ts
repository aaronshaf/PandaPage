import { describe, it } from "bun:test";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { parseDocxDocument } from "../src/wrappers";
import { renderToMarkdown } from "../../markdown-renderer/src/index";

describe("005.docx Analysis", () => {
  it("should analyze 005.docx structure and content", async () => {
    const docPath = join(__dirname, "../../../documents/005.docx");
    const fileBuffer = readFileSync(docPath);
    const buffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength,
    );

    console.log("\n=== 005.docx Analysis ===");
    console.log(`File size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    let doc;
    try {
      doc = await parseDocxDocument(buffer);
    } catch (error) {
      throw new Error(`Failed to parse: ${error}`);
    }
    console.log(`\nTotal elements: ${doc.elements.length}`);

    // Count element types
    const elementTypes: Record<string, number> = {};
    const issues: string[] = [];

    doc.elements.forEach((el, idx) => {
      elementTypes[el.type] = (elementTypes[el.type] || 0) + 1;

      // Check for potential issues
      if (el.type === "paragraph") {
        // Check for missing runs
        if (!el.runs || el.runs.length === 0) {
          const text = JSON.stringify(el).substring(0, 100);
          issues.push(`Empty paragraph at index ${idx}: ${text}...`);
        }

        // Check for complex formatting
        el.runs?.forEach((run) => {
          // Count formatting properties
          let formats = 0;
          if (run.bold) formats++;
          if (run.italic) formats++;
          if (run.underline) formats++;
          if (run.strikethrough) formats++;
          if (run.superscript) formats++;
          if (run.subscript) formats++;
          if (run.color) formats++;
          if (run.highlightColor) formats++;

          if (formats > 3) {
            issues.push(`Complex formatting (${formats} properties) at index ${idx}`);
          }
        });
      }

      // Check tables
      if (el.type === "table") {
        const rows = el.rows.length;
        const cols = el.rows[0]?.cells.length || 0;
        console.log(`\nTable at index ${idx}: ${rows}x${cols}`);

        // Check for nested tables
        el.rows.forEach((row, rowIdx) => {
          row.cells.forEach((cell, cellIdx) => {
            if (cell.paragraphs && cell.paragraphs.some((p: any) => p.type === "table")) {
              issues.push(`Nested table found at ${idx} (row ${rowIdx}, cell ${cellIdx})`);
            }
          });
        });
      }
    });

    console.log("\nElement type breakdown:");
    Object.entries(elementTypes)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });

    if (issues.length > 0) {
      console.log("\nPotential issues found:");
      issues.slice(0, 10).forEach((issue) => console.log(`  - ${issue}`));
      if (issues.length > 10) {
        console.log(`  ... and ${issues.length - 10} more`);
      }
    }

    // Sample content
    console.log("\nFirst 5 elements preview:");
    doc.elements.slice(0, 5).forEach((el, idx) => {
      if (el.type === "paragraph") {
        const text = el.runs?.map((r) => r.text || "[empty]").join("") || "[empty]";
        console.log(
          `  ${idx}: ${el.style || "Normal"} - "${text.substring(0, 60)}${text.length > 60 ? "..." : ""}"`,
        );
      } else {
        console.log(`  ${idx}: ${el.type}`);
      }
    });

    // Test rendering
    console.log("\nTesting rendering...");
    const markdown = renderToMarkdown(doc);
    console.log(`Markdown size: ${(markdown.length / 1024).toFixed(2)} KB`);

    // Save output for inspection in tmp directory
    const tmpDir = process.env.TMPDIR || '/tmp';
    writeFileSync(join(tmpDir, "005-analysis.md"), markdown);
    writeFileSync(join(tmpDir, "005-structure.json"), JSON.stringify(doc, null, 2));

    console.log(`\nAnalysis complete. Check ${tmpDir}/005-analysis.md and ${tmpDir}/005-structure.json for details.`);
  });
});
