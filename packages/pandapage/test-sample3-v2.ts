#!/usr/bin/env bun

import { Effect } from 'effect';
import { extractTextFromPdfV2 } from './src/pdf-text-extractor-v2';
import * as fs from 'fs';

async function test() {
  console.log("Testing sample3.pdf with improved extractor...\n");
  
  try {
    // Read the PDF file
    const pdfPath = "./../../assets/examples/sample3.pdf";
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    // Extract text with the new extractor
    const result = await Effect.runPromise(
      extractTextFromPdfV2(pdfBuffer.buffer, { logging: true })
    );
    
    console.log("\nExtracted text (first 1000 chars):");
    console.log("=====================================");
    console.log(result.substring(0, 1000));
    console.log("\n...");
    console.log("\nTotal length:", result.length);
    
    // Read expected output
    const expected = fs.readFileSync("./../../assets/examples/sample3.md", "utf-8");
    const expectedText = expected.split('---\n\n')[1]?.trim() || '';
    
    console.log("\nExpected text starts with:");
    console.log("===========================");
    console.log(expectedText.substring(0, 200));
    
    // Check if it contains the main content
    const hasMainTitle = result.includes("Sample PDF");
    const hasSubtitle = result.includes("Created for testing PDFObject");
    const hasLoremIpsum = result.includes("Lorem ipsum dolor sit amet");
    
    console.log("\nContent checks:");
    console.log("- Has main title:", hasMainTitle);
    console.log("- Has subtitle:", hasSubtitle);
    console.log("- Has Lorem ipsum:", hasLoremIpsum);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

test();