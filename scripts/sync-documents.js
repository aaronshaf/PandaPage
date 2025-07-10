#!/usr/bin/env bun

/**
 * Script to sync documents from centralized location to demo app
 * This avoids the need for symlinks or duplicating files in git
 */

import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";
import { join, dirname } from "path";

const ROOT_DIR = import.meta.dir.replace("/scripts", "");
const DOCUMENTS_SOURCE = join(ROOT_DIR, "documents");
const DEMO_PUBLIC_DIR = join(ROOT_DIR, "packages", "demo", "public");

async function syncDocuments() {
  console.log("🔄 Syncing documents from centralized location...");
  console.log(`Source: ${DOCUMENTS_SOURCE}`);
  console.log(`Target: ${DEMO_PUBLIC_DIR}`);

  // Ensure target directory exists
  await mkdir(DEMO_PUBLIC_DIR, { recursive: true });

  // Get all document files from source
  const lsResult = Bun.spawn(["ls", DOCUMENTS_SOURCE], {
    stdout: "pipe",
  });
  const output = await new Response(lsResult.stdout).text();
  const sourceFiles = output
    .trim()
    .split("\n")
    .filter((f) => f.endsWith(".docx") || f.endsWith(".pages"));

  let copied = 0;
  let skipped = 0;

  for (const filename of sourceFiles) {
    const sourcePath = join(DOCUMENTS_SOURCE, filename);
    const targetPath = join(DEMO_PUBLIC_DIR, filename);

    try {
      // Check if source file exists
      if (!existsSync(sourcePath)) {
        console.log(`⚠️  Source file not found: ${filename}`);
        continue;
      }

      // Check if target file is newer
      const sourceStats = await Bun.file(sourcePath).size;
      const targetExists = existsSync(targetPath);

      if (targetExists) {
        const targetStats = await Bun.file(targetPath).size;
        if (sourceStats === targetStats) {
          skipped++;
          continue;
        }
      }

      // Copy file
      await copyFile(sourcePath, targetPath);
      console.log(`✅ Copied: ${filename}`);
      copied++;
    } catch (error) {
      console.error(`❌ Failed to copy ${filename}:`, error.message);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Copied: ${copied} files`);
  console.log(`  Skipped: ${skipped} files (already up to date)`);
  console.log(`  Total documents: ${copied + skipped}`);
}

// Run if called directly
if (import.meta.main) {
  await syncDocuments();
}

//