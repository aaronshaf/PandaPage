#!/usr/bin/env node
import { execSync } from "child_process";

const packages = ["parser", "markdown-renderer", "dom-renderer", "core"];
let hasErrors = false;

for (const pkg of packages) {
  try {
    execSync(`cd packages/${pkg} && bun run typecheck`, { stdio: "pipe" });
  } catch (error) {
    hasErrors = true;
    console.error(`\nTypeScript errors in ${pkg}:`);
    console.error(error.stdout?.toString() || error.message);
  }
}

if (!hasErrors) {
  // Silent success
  process.exit(0);
} else {
  process.exit(1);
}
