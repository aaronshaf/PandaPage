#!/usr/bin/env node

/**
 * Test script to parse 003.docx using the browser-document-viewer parsing system
 * 
 * This script demonstrates how to:
 * 1. Import the DOCX parser from the core package
 * 2. Read a DOCX file from the documents directory
 * 3. Parse it and output the structure
 * 4. Show any errors or warnings
 * 5. Display what elements were found
 * 
 * Usage:
 *   bun run test-003-parsing.js    (recommended - uses Bun runtime)
 *   node test-003-parsing.js       (requires workspace dependencies to be built)
 * 
 * Note: This project uses Bun as the preferred package manager and runtime.
 *       If using Node.js, ensure all workspace packages are built first.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the parsing functions from the core package
import { parseDocxDocument } from './packages/core/src/index.ts';

async function main() {
  console.log('🔍 Testing DOCX parsing with 003.docx');
  console.log('=====================================');
  
  // Detect runtime
  const runtime = typeof Bun !== 'undefined' ? 'Bun' : 'Node.js';
  console.log(`🚀 Runtime: ${runtime}`);
  
  if (runtime === 'Node.js') {
    console.log('⚠️  Note: This project is optimized for Bun. If you encounter module resolution issues,');
    console.log('   please use: bun run test-003-parsing.js');
  }
  console.log();

  try {
    // Read the 003.docx file
    const docxPath = join(__dirname, 'documents', '003.docx');
    console.log(`📁 Reading file: ${docxPath}`);
    
    const fileBuffer = readFileSync(docxPath);
    const arrayBuffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength
    );
    
    console.log(`📊 File size: ${arrayBuffer.byteLength} bytes\n`);

    // Parse the document
    console.log('⚙️  Parsing document...');
    const startTime = Date.now();
    
    const parsedDocument = await parseDocxDocument(arrayBuffer);
    
    const parseTime = Date.now() - startTime;
    console.log(`✅ Parsing completed in ${parseTime}ms\n`);

    // Display document metadata
    console.log('📄 Document Metadata:');
    console.log('====================');
    if (parsedDocument.metadata) {
      const metadata = parsedDocument.metadata;
      console.log(`Title: ${metadata.title || 'Not set'}`);
      console.log(`Author: ${metadata.author || 'Not set'}`);
      console.log(`Created: ${metadata.createdDate ? metadata.createdDate.toISOString() : 'Not set'}`);
      console.log(`Modified: ${metadata.modifiedDate ? metadata.modifiedDate.toISOString() : 'Not set'}`);
      console.log(`Description: ${metadata.description || 'Not set'}`);
      console.log(`Language: ${metadata.language || 'Not set'}`);
      if (metadata.keywords && metadata.keywords.length > 0) {
        console.log(`Keywords: ${metadata.keywords.join(', ')}`);
      }
    } else {
      console.log('No metadata found');
    }
    console.log();

    // Analyze document structure
    console.log('📋 Document Structure Analysis:');
    console.log('===============================');
    
    const stats = {
      paragraphs: 0,
      tables: 0,
      images: 0,
      headings: 0,
      lists: 0,
      footnotes: 0,
      hyperlinks: 0,
      totalRuns: 0,
      formattedRuns: 0
    };

    // Count different types of elements
    parsedDocument.elements.forEach(element => {
      switch (element.type) {
        case 'paragraph':
          stats.paragraphs++;
          if (element.heading?.level) {
            stats.headings++;
          }
          if (element.numbering) {
            stats.lists++;
          }
          
          // Count runs and formatting
          element.runs.forEach(run => {
            stats.totalRuns++;
            if (run.bold || run.italic || run.underline || run.color || run.fontSize) {
              stats.formattedRuns++;
            }
            if (run.link) {
              stats.hyperlinks++;
            }
            if (run._footnoteRef) {
              stats.footnotes++;
            }
          });
          break;
          
        case 'table':
          stats.tables++;
          break;
          
        case 'image':
          stats.images++;
          break;
      }
    });

    console.log(`Total elements: ${parsedDocument.elements.length}`);
    console.log(`Paragraphs: ${stats.paragraphs}`);
    console.log(`Headings: ${stats.headings}`);
    console.log(`Tables: ${stats.tables}`);
    console.log(`Images: ${stats.images}`);
    console.log(`Lists: ${stats.lists}`);
    console.log(`Footnotes: ${stats.footnotes}`);
    console.log(`Hyperlinks: ${stats.hyperlinks}`);
    console.log(`Text runs: ${stats.totalRuns}`);
    console.log(`Formatted runs: ${stats.formattedRuns}`);
    console.log();

    // Show first few elements for inspection
    console.log('🔍 First 5 Elements (detailed):');
    console.log('================================');
    
    parsedDocument.elements.slice(0, 5).forEach((element, index) => {
      console.log(`\n${index + 1}. Type: ${element.type}`);
      
      if (element.type === 'heading') {
        if (element.level) {
          console.log(`   Level: ${element.level}`);
        }
        if (element.runs && element.runs.length > 0) {
          const headingText = element.runs.map(r => r.text).join('').trim();
          const displayText = headingText.length > 60 ? headingText.substring(0, 60) + '...' : headingText;
          console.log(`   Text: "${displayText}"`);
        }
      } else if (element.type === 'paragraph') {
        if (element.heading?.level) {
          console.log(`   Heading Level: ${element.heading.level}`);
        }
        if (element.numbering) {
          console.log(`   List Item (Level ${element.numbering.level})`);
        }
        if (element.alignment) {
          console.log(`   Alignment: ${element.alignment}`);
        }
        
        console.log(`   Runs: ${element.runs.length}`);
        element.runs.slice(0, 3).forEach((run, runIndex) => {
          const formatting = [];
          if (run.bold) formatting.push('bold');
          if (run.italic) formatting.push('italic');
          if (run.underline) formatting.push('underline');
          if (run.color) formatting.push(`color:${run.color}`);
          if (run.fontSize) formatting.push(`size:${run.fontSize}pt`);
          
          const formattingStr = formatting.length > 0 ? ` [${formatting.join(', ')}]` : '';
          const text = run.text.length > 50 ? run.text.substring(0, 50) + '...' : run.text;
          console.log(`     ${runIndex + 1}. "${text}"${formattingStr}`);
        });
        
        if (element.runs.length > 3) {
          console.log(`     ... and ${element.runs.length - 3} more runs`);
        }
      } else if (element.type === 'table') {
        console.log(`   Rows: ${element.rows.length}`);
        console.log(`   Columns: ${element.rows[0]?.cells.length || 0}`);
      } else if (element.type === 'image') {
        console.log(`   Format: ${element.format || 'unknown'}`);
        console.log(`   Size: ${element.data?.length || 0} bytes`);
        if (element.width || element.height) {
          console.log(`   Dimensions: ${element.width || '?'} x ${element.height || '?'}`);
        }
      }
    });

    if (parsedDocument.elements.length > 5) {
      console.log(`\n... and ${parsedDocument.elements.length - 5} more elements`);
    }

    // Show any styles found
    if (parsedDocument.styles && Object.keys(parsedDocument.styles).length > 0) {
      console.log('\n🎨 Document Styles:');
      console.log('===================');
      Object.entries(parsedDocument.styles).slice(0, 10).forEach(([styleId, style]) => {
        console.log(`${styleId}: ${style.name || 'Unnamed'} (${style.type || 'unknown type'})`);
      });
      
      if (Object.keys(parsedDocument.styles).length > 10) {
        console.log(`... and ${Object.keys(parsedDocument.styles).length - 10} more styles`);
      }
    }

    // Show numbering if present
    if (parsedDocument.numbering && parsedDocument.numbering.length > 0) {
      console.log('\n📝 Numbering Definitions:');
      console.log('=========================');
      parsedDocument.numbering.slice(0, 5).forEach((num, index) => {
        console.log(`${index + 1}. ID: ${num.numId}, Levels: ${num.levels.length}`);
      });
    }

    console.log('\n✅ Analysis complete!');

  } catch (error) {
    console.error('❌ Error occurred during parsing:');
    console.error('================================');
    console.error(`Type: ${error.constructor.name}`);
    console.error(`Message: ${error.message}`);
    
    // Provide specific guidance for common issues
    if (error.code === 'ERR_MODULE_NOT_FOUND' && error.message.includes('@browser-document-viewer')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   This error usually occurs when using Node.js with workspace dependencies.');
      console.error('   Please try one of these solutions:');
      console.error('   1. Use Bun instead: bun run test-003-parsing.js');
      console.error('   2. Build the workspace packages first');
      console.error('   3. Run from the project root directory');
    } else if (error.message.includes('ENOENT') && error.path?.includes('003.docx')) {
      console.error('\n💡 File not found:');
      console.error('   Make sure you are running this script from the project root directory');
      console.error('   and that documents/003.docx exists.');
    }
    
    if (error.stack && process.env.DEBUG) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    // Show additional error details if available
    if (error.cause) {
      console.error('\nCause:');
      console.error(error.cause);
    }
    
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});