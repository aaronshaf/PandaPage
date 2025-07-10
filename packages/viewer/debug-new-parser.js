// Debug script to test the new parser vs old parser on 011.docx
import fs from "fs";
import { Effect } from "effect";

// Import the parsing functions
import {
  readEnhancedDocx,
  convertEnhancedDocxToMarkdown,
} from "../../core/src/formats/docx/docx-reader-enhanced.js";
import { docxToMarkdownWithMetadata } from "../../core/src/formats/docx/docx-to-markdown.js";

async function testParsers() {
  console.log("=== TESTING NEW PARSER vs OLD PARSER ===");

  try {
    // Read the 011.docx file
    const buffer = fs.readFileSync("011.docx");

    console.log("File size:", buffer.length, "bytes");

    // Test new parser
    console.log("\n--- Testing Enhanced Parser ---");
    try {
      const enhancedResult = await Effect.runPromise(readEnhancedDocx(buffer.buffer));
      console.log("Enhanced parser succeeded");
      console.log("Elements found:", enhancedResult.elements.length);
      console.log("Word count:", enhancedResult.wordCount);
      console.log("Character count:", enhancedResult.characterCount);
      console.log("Paragraph count:", enhancedResult.paragraphCount);

      // Test if we can convert to markdown
      const markdown = convertEnhancedDocxToMarkdown(enhancedResult);
      console.log("Markdown length:", markdown.length);
      console.log("First 200 chars:", markdown.substring(0, 200));

      // Check if markdown contains "prefer"
      if (markdown.includes("prefer")) {
        console.log('✓ Markdown contains "prefer"');
        const preferIndex = markdown.indexOf("prefer");
        const lastPreferIndex = markdown.lastIndexOf("prefer");
        console.log('First "prefer" at position:', preferIndex);
        console.log('Last "prefer" at position:', lastPreferIndex);

        // Show context around the last "prefer"
        const context = markdown.substring(lastPreferIndex - 50, lastPreferIndex + 100);
        console.log('Context around last "prefer":', context);
      } else {
        console.log('✗ Markdown does NOT contain "prefer"');
      }
    } catch (error) {
      console.error("Enhanced parser failed:", error);
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Test old parser
    console.log("\n--- Testing Old Parser ---");
    try {
      const oldResult = await Effect.runPromise(docxToMarkdownWithMetadata(buffer.buffer));
      console.log("Old parser succeeded");
      console.log("Markdown length:", oldResult.length);
      console.log("First 200 chars:", oldResult.substring(0, 200));

      // Check if markdown contains "prefer"
      if (oldResult.includes("prefer")) {
        console.log('✓ Old markdown contains "prefer"');
        const preferIndex = oldResult.indexOf("prefer");
        const lastPreferIndex = oldResult.lastIndexOf("prefer");
        console.log('First "prefer" at position:', preferIndex);
        console.log('Last "prefer" at position:', lastPreferIndex);

        // Show context around the last "prefer"
        const context = oldResult.substring(lastPreferIndex - 50, lastPreferIndex + 100);
        console.log('Context around last "prefer":', context);
      } else {
        console.log('✗ Old markdown does NOT contain "prefer"');
      }
    } catch (error) {
      console.error("Old parser failed:", error);
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
    }
  } catch (error) {
    console.error("Failed to read file:", error);
  }
}

testParsers();
