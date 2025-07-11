#!/usr/bin/env node
import { execSync } from 'child_process';

const testCommand = 'cd packages/parser && bun test --coverage && cd ../markdown-renderer && bun test --coverage && cd ../dom-renderer && bun test --coverage && cd ../core && bun test --coverage test/*.test.ts';

try {
  // Run tests and capture output
  const output = execSync(testCommand, { stdio: 'pipe', encoding: 'utf-8' });
  
  // Check if any test failed or coverage threshold not met
  // Look for actual test failures, not "0 fail" in summary
  const failMatch = output.match(/(\d+) fail/);
  const hasFail = failMatch && parseInt(failMatch[1]) > 0;
  
  const hasFailure = hasFail || output.includes('FAIL') || 
                     output.includes('coverage threshold') || output.includes('Coverage threshold');
  
  if (hasFailure) {
    // Show full output if there are failures
    console.log(output);
    process.exit(1);
  } else {
    // Silent success - tests passed and coverage met
    process.exit(0);
  }
} catch (error) {
  // Test command failed - show the error output
  console.error(error.stdout?.toString() || error.stderr?.toString() || error.message);
  process.exit(1);
}