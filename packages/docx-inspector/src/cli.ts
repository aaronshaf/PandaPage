#!/usr/bin/env bun
// CLI for DOCX Inspector

import { program } from "commander";
import { readFileSync, existsSync } from "fs";
import { writeFileSync } from "fs";
import chalk from "chalk";
import { DocxInspector } from "./index.js";

program
  .name("docx-inspect")
  .description("Inspect DOCX file contents and structure")
  .version("0.1.0");

program
  .argument("<file>", "DOCX file to inspect")
  .option("-o, --output <file>", "Output JSON file (optional)")
  .option("-v, --verbose", "Show detailed file listing")
  .option("--xml <part>", "Extract specific XML part (e.g., document, styles, numbering)")
  .option("--list-files", "List all files in the DOCX")
  .option("--list-images", "List all image files")
  .option("--list-relationships", "List all relationships")
  .option("--stats-only", "Show only statistics")
  .action(async (filePath: string, options) => {
    try {
      // Check if file exists
      if (!existsSync(filePath)) {
        console.error(chalk.red(`Error: File '${filePath}' does not exist.`));
        process.exit(1);
      }

      // Read the DOCX file
      console.log(chalk.blue(`Inspecting DOCX file: ${filePath}`));
      const buffer = readFileSync(filePath);

      // Create inspector and analyze
      const inspector = new DocxInspector();
      const result = await inspector.inspect(buffer.buffer, filePath);

      // Handle specific XML extraction
      if (options.xml) {
        const xmlContent = extractXmlPart(inspector, result, options.xml);
        if (xmlContent) {
          console.log(xmlContent);
        } else {
          console.error(chalk.red(`XML part '${options.xml}' not found.`));
          process.exit(1);
        }
        return;
      }

      // Handle file listing
      if (options.listFiles) {
        displayFileList(result, options.verbose);
        return;
      }

      // Handle image listing
      if (options.listImages) {
        displayImageList(inspector, result);
        return;
      }

      // Handle relationships listing
      if (options.listRelationships) {
        displayRelationshipsList(result);
        return;
      }

      // Handle stats only
      if (options.statsOnly) {
        displayStatistics(result);
        return;
      }

      // Display full report
      displayFullReport(result, options.verbose);

      // Save to output file if specified
      if (options.output) {
        writeFileSync(options.output, JSON.stringify(result, null, 2));
        console.log(chalk.green(`\\nInspection results saved to: ${options.output}`));
      }
    } catch (error) {
      console.error(chalk.red("Error inspecting DOCX file:"), error);
      process.exit(1);
    }
  });

function extractXmlPart(inspector: DocxInspector, result: any, partName: string): string | null {
  switch (partName.toLowerCase()) {
    case "document":
      return inspector.getDocumentXml(result);
    case "styles":
      return inspector.getStylesXml(result);
    case "numbering":
      return inspector.getNumberingXml(result);
    default:
      // Try to find the file by name
      const file = result.files.find(
        (f: any) => f.name.toLowerCase().includes(partName.toLowerCase()) && f.type === "xml",
      );
      return file && typeof file.content === "string" ? file.content : null;
  }
}

function displayFileList(result: any, verbose: boolean) {
  console.log(chalk.bold("\\n📁 Files in DOCX:"));
  console.log(chalk.gray("─".repeat(80)));

  for (const file of result.files) {
    const sizeStr = formatFileSize(file.size);
    const typeIcon = file.type === "xml" ? "📄" : file.type === "binary" ? "📦" : "❓";

    if (verbose) {
      console.log(`${typeIcon} ${file.name.padEnd(50)} ${sizeStr.padStart(10)} ${file.type}`);
    } else {
      console.log(`${typeIcon} ${file.name}`);
    }
  }

  console.log(chalk.gray("─".repeat(80)));
  console.log(`Total: ${result.files.length} files`);
}

function displayImageList(inspector: DocxInspector, result: any) {
  const images = inspector.getImageFiles(result);

  console.log(chalk.bold("\\n🖼️  Images in DOCX:"));
  console.log(chalk.gray("─".repeat(60)));

  if (images.length === 0) {
    console.log(chalk.yellow("No images found."));
    return;
  }

  for (const image of images) {
    const sizeStr = formatFileSize(image.size);
    const ext = image.name.split(".").pop()?.toUpperCase() || "Unknown";
    console.log(`📷 ${image.name.padEnd(40)} ${sizeStr.padStart(10)} ${ext}`);
  }

  console.log(chalk.gray("─".repeat(60)));
  console.log(`Total: ${images.length} images`);
}

function displayRelationshipsList(result: any) {
  console.log(chalk.bold("\\n🔗 Relationships:"));
  console.log(chalk.gray("─".repeat(80)));

  if (result.relationships.length === 0) {
    console.log(chalk.yellow("No relationships found."));
    return;
  }

  for (const rel of result.relationships) {
    const typeShort = rel.type.split("/").pop() || rel.type;
    console.log(`🔗 ${rel.id.padEnd(15)} ${typeShort.padEnd(20)} → ${rel.target}`);
  }

  console.log(chalk.gray("─".repeat(80)));
  console.log(`Total: ${result.relationships.length} relationships`);
}

function displayStatistics(result: any) {
  console.log(chalk.bold("\\n📊 Statistics:"));
  console.log(chalk.gray("─".repeat(40)));

  console.log(`File Size:           ${formatFileSize(result.fileSize)}`);
  console.log(`Uncompressed Size:   ${formatFileSize(result.statistics.totalUncompressedSize)}`);
  console.log(`Compression Ratio:   ${(result.statistics.compressionRatio * 100).toFixed(1)}%`);
  console.log(`Total Files:         ${result.statistics.totalFiles}`);
  console.log(`XML Files:           ${result.statistics.xmlFiles}`);
  console.log(`Binary Files:        ${result.statistics.binaryFiles}`);
  console.log(`Images:              ${result.documentStructure.hasImages}`);
  console.log(`Embedded Objects:    ${result.documentStructure.hasEmbeddedObjects}`);
}

function displayFullReport(result: any, verbose: boolean) {
  // Header
  console.log(chalk.bold.cyan("\\n🔍 DOCX Inspection Report"));
  console.log(chalk.gray("=".repeat(50)));

  // Basic Info
  console.log(chalk.bold("\\n📄 Basic Information:"));
  console.log(`File: ${result.fileName}`);
  console.log(`Size: ${formatFileSize(result.fileSize)}`);

  // Document Structure
  console.log(chalk.bold("\\n🏗️  Document Structure:"));
  const structure = result.documentStructure;

  console.log(`Main Document:       ${structure.hasDocument ? "✅" : "❌"}`);
  console.log(`Styles:              ${structure.hasStyles ? "✅" : "❌"}`);
  console.log(`Numbering:           ${structure.hasNumbering ? "✅" : "❌"}`);
  console.log(`Settings:            ${structure.hasSettings ? "✅" : "❌"}`);
  console.log(`Theme:               ${structure.hasTheme ? "✅" : "❌"}`);
  console.log(`Comments:            ${structure.hasComments ? "✅" : "❌"}`);
  console.log(`Footnotes:           ${structure.hasFootnotes ? "✅" : "❌"}`);
  console.log(`Endnotes:            ${structure.hasEndnotes ? "✅" : "❌"}`);
  console.log(`Headers:             ${structure.hasHeaders ? "✅" : "❌"}`);
  console.log(`Footers:             ${structure.hasFooters ? "✅" : "❌"}`);
  console.log(`Images:              ${structure.hasImages} files`);
  console.log(`Embedded Objects:    ${structure.hasEmbeddedObjects} files`);

  // Statistics
  displayStatistics(result);

  // Content Types (if verbose)
  if (verbose && Object.keys(result.contentTypes).length > 0) {
    console.log(chalk.bold("\\n📋 Content Types:"));
    console.log(chalk.gray("─".repeat(60)));

    for (const [key, value] of Object.entries(result.contentTypes)) {
      console.log(`${key.padEnd(30)} → ${value}`);
    }
  }

  // Key Files Summary
  console.log(chalk.bold("\\n📁 Key Files:"));
  const keyFiles = result.files.filter(
    (f: any) =>
      f.name.includes("word/document.xml") ||
      f.name.includes("word/styles.xml") ||
      f.name.includes("word/numbering.xml") ||
      f.name.includes("word/settings.xml") ||
      f.name === "[Content_Types].xml",
  );

  for (const file of keyFiles) {
    const sizeStr = formatFileSize(file.size);
    console.log(`📄 ${file.name.padEnd(30)} ${sizeStr}`);
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / k ** i).toFixed(1)) + " " + sizes[i];
}

// Handle errors
process.on("uncaughtException", (error) => {
  console.error(chalk.red("Uncaught Exception:"), error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error(chalk.red("Unhandled Rejection:"), reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();
