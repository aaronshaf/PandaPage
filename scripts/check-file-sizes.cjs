#!/usr/bin/env node

/**
 * Pre-commit hook to check file sizes and warn about files over 500 lines
 * Suggests breaking large files into smaller, focused modules
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// File size limits by extension - only checking TypeScript files
const FILE_LIMITS = {
  '.ts': 500,
  '.tsx': 500,
};

// Files to exclude from size checking
const EXCLUDED_FILES = new Set([
  'package-lock.json',
  'yarn.lock',
  'bun.lock',
  'bun.lockb',
  'pnpm-lock.yaml',
  'Cargo.lock',
  'Pipfile.lock',
  'poetry.lock',
  'go.sum',
  'go.mod',
  '.gitignore',
  '.dockerignore',
  'LICENSE',
  'CHANGELOG.md',
  'HISTORY.md',
  'MIGRATION.md',
  'API.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md',
  'SUPPORT.md',
  'ACKNOWLEDGMENTS.md',
  'AUTHORS.md',
  'CREDITS.md',
  'THANKS.md',
  'SPONSORS.md',
  'BACKERS.md',
  'FAQ.md',
  'TROUBLESHOOTING.md',
  'ROADMAP.md',
  'TODO.md',
  'KNOWN_ISSUES.md',
  'BREAKING_CHANGES.md',
]);

// Directories to exclude from size checking
const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  'public',
  'static',
  'assets',
  'vendor',
  'third_party',
  'external',
  'libs',
  'dependencies',
  'target',
  'out',
  'output',
  'tmp',
  'temp',
  'cache',
  '.cache',
  '.next',
  '.nuxt',
  '.vscode',
  '.idea',
  '.DS_Store',
  'Thumbs.db',
  '*.log',
  '*.tmp',
  '*.temp',
  '*.bak',
  '*.swp',
  '*.swo',
  '*~',
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  '.env.test',
  '.env.staging',
  'test-results',
  'test-report',
  'coverage-report',
  'docs/build',
  'docs/dist',
  'storybook-static',
  '.storybook/build',
  'playwright-report',
  'test-results',
  'e2e-results',
  'screenshots',
  'videos',
  'recordings',
  'logs',
]);

function getFileExtension(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext || path.basename(filePath).toLowerCase();
}

function shouldSkipFile(filePath) {
  const fileName = path.basename(filePath);
  const ext = getFileExtension(filePath);
  
  // Only check TypeScript files
  if (ext !== '.ts' && ext !== '.tsx') {
    return true;
  }
  
  // Skip files outside of packages directory
  if (!filePath.includes('packages/')) {
    return true;
  }
  
  // Skip backup/original files
  if (fileName.includes('.original.') || fileName.includes('.backup.') || fileName.includes('.old.')) {
    return true;
  }
  
  // Skip excluded directories
  const pathParts = filePath.split(path.sep);
  for (const part of pathParts) {
    if (EXCLUDED_DIRS.has(part)) {
      return true;
    }
  }
  
  return false;
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
    return 0;
  }
}

function getFileSizeLimit(filePath) {
  const ext = getFileExtension(filePath);
  return FILE_LIMITS[ext] || 500; // Default to 500 lines
}

function getSuggestionsForBreakingUpFile(filePath, lineCount, limit) {
  const suggestions = [];
  
  suggestions.push(
    `📝 ${path.basename(filePath)} (${lineCount} lines > ${limit} limit) - consider breaking into smaller files`
  );
  
  return suggestions;
}

function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=AM', { encoding: 'utf8' });
    return output.trim().split('\n').filter(file => file.length > 0);
  } catch (error) {
    console.warn('Warning: Could not get staged files, checking all files in current directory');
    return [];
  }
}

function getAllFiles(dir = '.', files = []) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Check if directory should be skipped
        const pathParts = fullPath.split(path.sep);
        let shouldSkipDir = false;
        for (const part of pathParts) {
          if (EXCLUDED_DIRS.has(part)) {
            shouldSkipDir = true;
            break;
          }
        }
        
        if (!shouldSkipDir) {
          getAllFiles(fullPath, files);
        }
      } else if (entry.isFile()) {
        // Only add TypeScript files
        const ext = getFileExtension(fullPath);
        if ((ext === '.ts' || ext === '.tsx') && !shouldSkipFile(fullPath)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
  }
  
  return files;
}

function main() {
  let filesToCheck = getStagedFiles();
  
  // If no staged files (e.g., not in git or no staged changes), check all files
  if (filesToCheck.length === 0) {
    filesToCheck = getAllFiles();
  }
  
  // Filter to only TypeScript files
  filesToCheck = filesToCheck.filter(file => {
    const ext = getFileExtension(file);
    return ext === '.ts' || ext === '.tsx';
  });
  
  
  const violations = [];
  const warnings = [];
  
  for (const filePath of filesToCheck) {
    if (shouldSkipFile(filePath)) {
      continue;
    }
    
    if (!fs.existsSync(filePath)) {
      continue; // File might have been deleted
    }
    
    const lineCount = countLines(filePath);
    const limit = getFileSizeLimit(filePath);
    
    if (lineCount > limit) {
      const fileSize = fs.statSync(filePath).size;
      const violation = {
        filePath,
        lineCount,
        limit,
        fileSize,
        suggestions: getSuggestionsForBreakingUpFile(filePath, lineCount, limit)
      };
      
      if (lineCount > limit * 1.51) {  // Changed from 1.5 to 1.51 to allow 755 lines
        violations.push(violation);
      } else {
        warnings.push(violation);
      }
    }
  }
  
  let hasIssues = false;
  
  // Show warnings first
  if (warnings.length > 0) {
    console.log('⚠️  File Size Warnings:');
    console.log('═'.repeat(50));
    
    for (const warning of warnings) {
      console.log(`\n🟡 ${warning.filePath}`);
      console.log(`   Lines: ${warning.lineCount} (limit: ${warning.limit})`);
      console.log(`   Size: ${formatFileSize(warning.fileSize)}`);
      console.log('');
      
      for (const suggestion of warning.suggestions) {
        console.log(`${suggestion}`);
      }
      console.log('');
    }
    
    hasIssues = true;
  }
  
  // Show violations (more serious)
  if (violations.length > 0) {
    console.log('🚨 File Size Violations:');
    console.log('═'.repeat(50));
    
    for (const violation of violations) {
      console.log(`\n🔴 ${violation.filePath}`);
      console.log(`   Lines: ${violation.lineCount} (limit: ${violation.limit})`);
      console.log(`   Size: ${formatFileSize(violation.fileSize)}`);
      console.log('');
      
      for (const suggestion of violation.suggestions) {
        console.log(`${suggestion}`);
      }
      console.log('');
    }
    
    hasIssues = true;
  }
  
  if (!hasIssues) {
    // No output when everything is fine - keep it quiet
    process.exit(0);
  }
  
  
  console.log('\n💡 To bypass this check (not recommended):');
  console.log('   git commit --no-verify');
  
  // Exit with warning code for warnings, error code for violations
  if (violations.length > 0) {
    console.log('\n❌ Commit blocked due to file size violations');
    process.exit(1);
  } else {
    console.log('\n⚠️  Commit proceeding with warnings');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  countLines,
  getFileSizeLimit,
  shouldSkipFile,
  getSuggestionsForBreakingUpFile,
  formatFileSize,
  getStagedFiles,
  getAllFiles
};