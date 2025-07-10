import { readFile } from "fs/promises";
import { parseDocxDocument } from "../core/src/wrappers.js";
import { JSDOM } from "jsdom";

// Mock DOM for Node.js
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
global.document = dom.window.document;
global.window = dom.window;

async function testFix() {
  console.log("Testing the fix for 011.docx...");

  try {
    // Read the 011.docx file
    const buffer = await readFile("./public/011.docx");

    // Parse with enhanced parser
    const parsed = await parseDocxDocument(buffer.buffer);

    // Test HTML rendering
    const { renderToHtml } = await import("../renderer-dom/src/index.js");
    const htmlContent = await renderToHtml(parsed, { includeStyles: false });

    console.log("HTML content length:", htmlContent.length);

    // Now test the new logic - extract individual page divs like the frontend does
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const pageElements = tempDiv.querySelectorAll(".page");

    console.log("\\n=== PAGE EXTRACTION RESULTS ===");
    console.log("Number of pages found:", pageElements.length);

    // Check each page for "prefer)." text
    let foundPage = -1;
    Array.from(pageElements).forEach((pageElement, index) => {
      const pageContent = pageElement.innerHTML;
      if (pageContent.includes("prefer).")) {
        foundPage = index + 1;
        console.log(`✓ Page ${index + 1} contains "prefer)." text`);
      } else {
        console.log(`✗ Page ${index + 1} does not contain "prefer)." text`);
      }
    });

    if (foundPage > 0) {
      console.log(
        `\\n✅ SUCCESS: "prefer)." text found on page ${foundPage} of ${pageElements.length}`,
      );
      console.log("This means the fix should work - all pages are now available to the frontend!");
    } else {
      console.log('\\n❌ FAILURE: "prefer)." text not found in any page');
    }

    // Show a sample of the first page content
    if (pageElements.length > 0) {
      const firstPageContent = pageElements[0].innerHTML;
      console.log(`\\n=== FIRST PAGE CONTENT SAMPLE ===`);
      console.log(firstPageContent.substring(0, 500) + "...");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testFix();
