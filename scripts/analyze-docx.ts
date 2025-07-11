#!/usr/bin/env bun
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, basename, extname } from "path";
import { parseDocxDocument } from "../packages/core/index.ts";
import { renderToMarkdown } from "../packages/markdown-renderer/src/index.ts";
import { renderToHtml } from "../packages/dom-renderer/src/index.ts";

async function analyzeDocx(filePath: string) {
  const fileName = basename(filePath, extname(filePath));
  console.log(`Analyzing ${basename(filePath)}...\n`);

  // Create tmp directory if it doesn't exist
  const tmpDir = "./tmp/docx-analysis";
  if (!existsSync(tmpDir)) {
    mkdirSync(tmpDir, { recursive: true });
  }

  try {
    // Read the file
    const buffer = readFileSync(filePath);
    console.log(`File size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB\n`);

    // Parse the document
    try {
      const doc = await parseDocxDocument(buffer);
      console.log("Document structure:");
      console.log(`- Elements: ${doc.elements.length}`);

      // Count element types
      const elementTypes: Record<string, number> = {};
      let imageCount = 0;
      let tableCount = 0;
      let listCount = 0;
      let footnoteCount = 0;

      doc.elements.forEach((el) => {
        elementTypes[el.type] = (elementTypes[el.type] || 0) + 1;

        if (el.type === "paragraph" && el.runs) {
          el.runs.forEach((run) => {
            if (run.type === "image") imageCount++;
          });
        }

        if (el.type === "table") tableCount++;

        if (el.type === "paragraph" && el.listInfo) {
          listCount++;
        }
        
        if (el.type === "footnote") {
          footnoteCount++;
        }
      });

      console.log("\nElement type breakdown:");
      Object.entries(elementTypes).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`);
      });

      console.log(`\nSpecial content:`);
      console.log(`  - Images: ${imageCount}`);
      console.log(`  - Tables: ${tableCount}`);
      console.log(`  - List items: ${listCount}`);
      console.log(`  - Footnotes: ${footnoteCount}`);

      // Check for complex content
      console.log("\nAnalyzing first few elements:");
      doc.elements.slice(0, 10).forEach((el, idx) => {
        if (el.type === "paragraph") {
          const text =
            el.runs?.map((r) => (r.type === "text" ? r.content : `[${r.type}]`)).join("") || "";
          console.log(
            `  ${idx}: Paragraph - "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`,
          );
          if (el.style) console.log(`      Style: ${el.style}`);
          if (el.listInfo)
            console.log(`      List: level ${el.listInfo.level}, ${el.listInfo.type}`);
        } else if (el.type === "table") {
          console.log(
            `  ${idx}: Table - ${el.rows.length} rows, ${el.rows[0]?.cells.length || 0} columns`,
          );
        } else if (el.type === "footnote") {
          const footnoteText = el.content?.substring(0, 50) || "";
          console.log(
            `  ${idx}: Footnote ${el.id} - "${footnoteText}${footnoteText.length > 50 ? "..." : ""}"`,
          );
        }
      });

      // Render to markdown
      console.log("\nRendering to Markdown...");
      const markdown = renderToMarkdown(doc, { includeMetadata: true });
      const markdownPath = join(tmpDir, `${fileName}-output.md`);
      writeFileSync(markdownPath, markdown);
      console.log(`Markdown output: ${(markdown.length / 1024).toFixed(2)} KB`);
      console.log(`Saved to: ${markdownPath}`);

      // Render to HTML
      console.log("\nRendering to HTML...");
      const html = renderToHtml(doc, { fullDocument: true });
      const htmlPath = join(tmpDir, `${fileName}-output.html`);
      writeFileSync(htmlPath, html);
      console.log(`HTML output: ${(html.length / 1024).toFixed(2)} KB`);
      console.log(`Saved to: ${htmlPath}`);

      // Save analysis report
      const analysisReport = {
        fileName: basename(filePath),
        fileSize: buffer.length,
        parsedAt: new Date().toISOString(),
        structure: {
          totalElements: doc.elements.length,
          elementTypes,
          images: imageCount,
          tables: tableCount,
          listItems: listCount,
          footnotes: footnoteCount,
        },
        metadata: doc.metadata,
      };

      const reportPath = join(tmpDir, `${fileName}-analysis.json`);
      writeFileSync(reportPath, JSON.stringify(analysisReport, null, 2));
      console.log(`\nAnalysis report saved to: ${reportPath}`);

      // Check for footnote references in text
      console.log("\nFootnote references found:");
      let footnoteRefs = 0;
      doc.elements.forEach((el) => {
        if (el.type === "paragraph" && el.runs) {
          el.runs.forEach((run) => {
            if (run.type === "footnoteReference") {
              footnoteRefs++;
              console.log(`  - Footnote reference: ${run.id}`);
            }
          });
        }
      });
      if (footnoteRefs === 0) {
        console.log("  - No footnote references found in text");
      }

      // Check for potential issues
      console.log("\nPotential rendering issues:");

      // Check for nested tables
      let nestedTables = 0;
      doc.elements.forEach((el) => {
        if (el.type === "table") {
          el.rows.forEach((row) => {
            row.cells.forEach((cell) => {
              if (cell.elements.some((e) => e.type === "table")) {
                nestedTables++;
              }
            });
          });
        }
      });
      if (nestedTables > 0) console.log(`  - Found ${nestedTables} nested tables`);

      // Check for complex lists
      const maxListLevel = doc.elements
        .filter((el) => el.type === "paragraph" && el.listInfo)
        .reduce((max, el) => Math.max(max, el.listInfo!.level), 0);
      if (maxListLevel > 2) console.log(`  - Deep list nesting: up to level ${maxListLevel}`);

      // Check for large tables
      const largeTables = doc.elements.filter(
        (el) =>
          el.type === "table" && (el.rows.length > 20 || (el.rows[0]?.cells.length || 0) > 10),
      );
      if (largeTables.length > 0) {
        console.log(`  - Large tables: ${largeTables.length} tables with many rows/columns`);
      }

      console.log(`\n✅ Analysis complete! All output files are in: ${tmpDir}`);
    } catch (error) {
      console.error("Failed to parse document:", error);
    }
  } catch (error) {
    console.error("Error analyzing document:", error);
  }
}

// Main entry point
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: bun run scripts/analyze-docx.ts <path-to-docx-file>");
  process.exit(1);
}

const filePath = args[0];
if (!existsSync(filePath)) {
  console.error(`Error: File not found: ${filePath}`);
  process.exit(1);
}

if (!filePath.toLowerCase().endsWith('.docx')) {
  console.error("Error: File must be a .docx file");
  process.exit(1);
}

analyzeDocx(filePath);