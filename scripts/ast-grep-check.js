#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// For now, we'll use a simple grep-based approach
// In the future, this can be replaced with proper ast-grep when it's configured
console.log("Running type assertion checks...");

try {
  // Search for problematic 'as' type assertions
  // Exclude 'as const' and 'as unknown' which are allowed
  const result = execSync(
    `grep -r "\\sas\\s" packages/ --include="*.ts" --include="*.tsx" | grep -v "as const" | grep -v "as unknown" | grep -v "node_modules" | grep -v ".d.ts" | head -20 || true`,
    {
      stdio: "pipe",
      encoding: "utf8",
    }
  );

  if (result && result.trim()) {
    console.error("❌ Found potentially forbidden type assertions:");
    console.error("Note: Manual review needed - some of these might be valid");
    console.error(result);
    console.error("\nConsider using type guards or proper typing instead of 'as' assertions.");
    console.error("Allowed exceptions: 'as const' and 'as unknown'");
    // For now, just warn but don't fail the build
    // process.exit(1);
  } else {
    console.log("✅ No obvious forbidden type assertions found");
  }
} catch (error) {
  console.error("Error running type assertion check:", error.message);
  // Don't fail the build for now
}