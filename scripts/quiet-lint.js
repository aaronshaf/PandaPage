#!/usr/bin/env node
import { execSync } from 'child_process';

try {
  // Run biome lint with minimal output
  execSync('biome lint . --reporter=summary', { stdio: 'pipe' });
  process.exit(0);
} catch (error) {
  // Only show output if there are actual lint errors
  console.error(error.stdout?.toString() || error.message);
  process.exit(1);
}