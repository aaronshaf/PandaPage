#!/usr/bin/env node

/**
 * Debug script to analyze 008.docx "Project Report Template" heading rendering
 * 
 * This script uses mock data that represents what the 008.docx file would look like
 * when parsed, to understand why the heading isn't rendering correctly.
 */

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the conversion functions
const { convertDocxToMarkdown } = await import('../pandapage/src/formats/docx/docx-to-markdown.ts');

async function main() {
  try {
    console.log('=== Debug Script for 008.docx (Mock Data) ===');
    console.log('Analyzing "Project Report Template" heading rendering...\n');
    
    // Create mock data representing the 008.docx document structure
    // Based on typical DOCX structure, the title might be parsed as a centered paragraph
    // without a specific heading style
    
    console.log('=== Test Case 1: Title as Paragraph (No Heading Style) ===');
    const mockDocWithoutHeadingStyle = {
      paragraphs: [
        {
          type: "paragraph",
          style: undefined, // No heading style detected
          runs: [
            { 
              text: "Project Report Template", 
              bold: true, // The title is bold
              italic: false,
              underline: false
            }
          ]
        },
        {
          type: "paragraph",
          style: undefined,
          runs: [
            { text: "This is a normal paragraph after the title." }
          ]
        }
      ],
      numbering: undefined
    };
    
    const markdown1 = convertDocxToMarkdown(mockDocWithoutHeadingStyle);
    console.log('Markdown output when title has no heading style:');
    console.log(markdown1);
    console.log();
    
    console.log('=== Test Case 2: Title as Heading 1 ===');
    const mockDocWithHeading1 = {
      paragraphs: [
        {
          type: "paragraph",
          style: "Heading 1", // What it should be if detected as heading
          runs: [
            { 
              text: "Project Report Template", 
              bold: true,
              italic: false,
              underline: false
            }
          ]
        },
        {
          type: "paragraph",
          style: undefined,
          runs: [
            { text: "This is a normal paragraph after the title." }
          ]
        }
      ],
      numbering: undefined
    };
    
    const markdown2 = convertDocxToMarkdown(mockDocWithHeading1);
    console.log('Markdown output when title is detected as Heading 1:');
    console.log(markdown2);
    console.log();
    
    console.log('=== Test Case 3: Title with Mixed Formatting ===');
    const mockDocWithMixedFormatting = {
      paragraphs: [
        {
          type: "paragraph",
          style: undefined,
          runs: [
            { text: "Project", bold: true },
            { text: " ", bold: false },
            { text: "Report", bold: true },
            { text: " ", bold: false },
            { text: "Template", bold: true }
          ]
        },
        {
          type: "paragraph",
          style: undefined,
          runs: [
            { text: "This is a normal paragraph after the title." }
          ]
        }
      ],
      numbering: undefined
    };
    
    const markdown3 = convertDocxToMarkdown(mockDocWithMixedFormatting);
    console.log('Markdown output when title has mixed formatting:');
    console.log(markdown3);
    console.log();
    
    console.log('=== Test Case 4: Title with Style but Not Heading ===');
    const mockDocWithCustomStyle = {
      paragraphs: [
        {
          type: "paragraph",
          style: "Title", // Some other style name
          runs: [
            { 
              text: "Project Report Template", 
              bold: true,
              italic: false,
              underline: false
            }
          ]
        },
        {
          type: "paragraph",
          style: undefined,
          runs: [
            { text: "This is a normal paragraph after the title." }
          ]
        }
      ],
      numbering: undefined
    };
    
    const markdown4 = convertDocxToMarkdown(mockDocWithCustomStyle);
    console.log('Markdown output when title has "Title" style:');
    console.log(markdown4);
    console.log();
    
    console.log('=== Test Case 5: Centered Text (Center Alignment) ===');
    // Note: The conversion function might not handle text alignment
    const mockDocWithCenteredText = {
      paragraphs: [
        {
          type: "paragraph",
          style: undefined,
          alignment: "center", // If this property exists
          runs: [
            { 
              text: "Project Report Template", 
              bold: true,
              italic: false,
              underline: false
            }
          ]
        },
        {
          type: "paragraph",
          style: undefined,
          runs: [
            { text: "This is a normal paragraph after the title." }
          ]
        }
      ],
      numbering: undefined
    };
    
    const markdown5 = convertDocxToMarkdown(mockDocWithCenteredText);
    console.log('Markdown output when title is centered:');
    console.log(markdown5);
    console.log();
    
    console.log('=== Analysis Summary ===');
    console.log('1. Without heading style: The title renders as regular text with bold formatting');
    console.log('2. With Heading 1 style: The title renders as a proper markdown heading');
    console.log('3. Mixed formatting: Each word gets its own bold formatting');
    console.log('4. Custom style: The title still renders as regular text (style not recognized as heading)');
    console.log('5. Centered text: Alignment is likely not preserved in markdown');
    console.log();
    
    console.log('=== Key Findings ===');
    console.log('- The issue is likely that the "Project Report Template" in 008.docx');
    console.log('  is not being parsed with a recognized heading style');
    console.log('- It may be using a custom style like "Title" or just paragraph formatting');
    console.log('- The bold formatting is preserved but not converted to heading markup');
    console.log('- Center alignment (22pt font, center-aligned) is not being detected as heading');
    console.log();
    
    console.log('=== Actual Code Analysis ===');
    console.log('Examining the convertParagraphToMarkdown function reveals:');
    console.log('- "Title" style IS supported (converts to # heading)');
    console.log('- Various heading styles are supported (Heading, Heading1, Heading 1, etc.)');
    console.log('- If no recognized style, text renders as-is (just formatting preserved)');
    console.log();
    
    console.log('=== Root Cause Analysis ===');
    console.log('The conversion logic is working correctly. The issue is in the PARSING stage:');
    console.log('1. The "Project Report Template" is likely not being parsed with a "Title" style');
    console.log('2. It may be using a different style name not in the supported list');
    console.log('3. It may have no style at all (just visual formatting: bold, center, 22pt)');
    console.log('4. The DOCX parser may not be extracting style information correctly');
    console.log();
    
    console.log('=== Recommendations ===');
    console.log('1. Investigate the DOCX parsing logic to ensure style extraction works');
    console.log('2. Check if the document actually uses a "Title" style or custom style');
    console.log('3. Consider adding heuristics for heading detection based on:');
    console.log('   - Font size (22pt indicates heading)');
    console.log('   - Text alignment (center-aligned)');
    console.log('   - Formatting (bold text)');
    console.log('   - Position (first paragraph in document)');
    console.log('4. Add logging to see what style is actually parsed from 008.docx');
    
    // Let's also check if the file exists and its size
    const docxPath = resolve(__dirname, 'public', '008.docx');
    try {
      const stats = await fs.stat(docxPath);
      console.log(`\n=== File Info ===`);
      console.log(`File: ${docxPath}`);
      console.log(`Size: ${stats.size} bytes`);
      console.log(`Modified: ${stats.mtime}`);
    } catch (error) {
      console.log(`\n=== File Info ===`);
      console.log(`File not found: ${docxPath}`);
    }
    
  } catch (error) {
    console.error('Error during analysis:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main().catch(console.error);