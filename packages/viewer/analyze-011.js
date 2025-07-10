import { readFile } from "fs/promises";
import { parseDocxDocument, renderToMarkdown } from "../core/src/wrappers.js";

async function analyze011() {
  console.log("Analyzing 011.docx parsing...");

  try {
    // Read the 011.docx file
    const buffer = await readFile("./public/011.docx");

    // Parse with enhanced parser
    const parsed = await parseDocxDocument(buffer.buffer);

    console.log("=== PARSING RESULTS ===");
    console.log("Elements found:", parsed.elements.length);
    console.log("Word count:", parsed.wordCount);
    console.log("Character count:", parsed.characterCount);
    console.log("Paragraph count:", parsed.paragraphCount);

    console.log("\n=== FIRST 20 ELEMENTS ===");
    parsed.elements.slice(0, 20).forEach((element, index) => {
      console.log(`${index + 1}. Type: ${element.type}`);
      if (element.type === "paragraph") {
        const text = element.runs
          .map((run) => run.text)
          .join("")
          .trim();
        console.log(`   Text: "${text.substring(0, 100)}${text.length > 100 ? "..." : ""}"`);
        console.log(`   Style: ${element.style || "none"}`);
      }
    });

    console.log("\n=== ELEMENTS 20-40 ===");
    parsed.elements.slice(20, 40).forEach((element, index) => {
      const actualIndex = 20 + index;
      console.log(`${actualIndex + 1}. Type: ${element.type}`);
      if (element.type === "paragraph") {
        const text = element.runs
          .map((run) => run.text)
          .join("")
          .trim();
        console.log(`   Text: "${text.substring(0, 100)}${text.length > 100 ? "..." : ""}"`);
        console.log(`   Style: ${element.style || "none"}`);
      }
    });

    console.log("\n=== LAST 10 ELEMENTS ===");
    parsed.elements.slice(-10).forEach((element, index) => {
      const actualIndex = parsed.elements.length - 10 + index;
      console.log(`${actualIndex + 1}. Type: ${element.type}`);
      if (element.type === "paragraph") {
        const text = element.runs
          .map((run) => run.text)
          .join("")
          .trim();
        console.log(`   Text: "${text.substring(0, 100)}${text.length > 100 ? "..." : ""}"`);
        console.log(`   Style: ${element.style || "none"}`);
      }
    });

    console.log("\n=== CHECKING FOR PAGE BREAKS ===");
    let pageBreakCount = 0;
    parsed.elements.forEach((element, index) => {
      if (element.type === "paragraph") {
        element.runs.forEach((run) => {
          if (run.text.includes("\u000C")) {
            pageBreakCount++;
            console.log(`Page break found at element ${index + 1}`);
          }
        });
      }
    });
    console.log(`Total page breaks found: ${pageBreakCount}`);

    // Check for text that ends with "prefer)."
    console.log('\n=== SEARCHING FOR "prefer)." TEXT ===');
    let foundPreferText = false;
    parsed.elements.forEach((element, index) => {
      if (element.type === "paragraph") {
        const text = element.runs.map((run) => run.text).join("");
        if (text.includes("prefer).")) {
          foundPreferText = true;
          console.log(`Found "prefer)." at element ${index + 1}: "${text.trim()}"`);
          console.log(`This is element ${index + 1} of ${parsed.elements.length}`);
        }
      }
    });

    if (!foundPreferText) {
      console.log('Text ending with "prefer)." not found in parsed elements');
    }

    // Test markdown rendering
    console.log("\n=== TESTING MARKDOWN RENDERING ===");
    try {
      const markdown = await renderToMarkdown(parsed, { includeFrontmatter: true });
      console.log("Markdown length:", markdown.length);
      console.log("Markdown preview (first 500 chars):", markdown.substring(0, 500));
      console.log("Markdown preview (last 500 chars):", markdown.substring(markdown.length - 500));

      // Count paragraphs in markdown
      const paragraphs = markdown.split("\n\n").filter((p) => p.trim().length > 0);
      console.log("Paragraphs in markdown:", paragraphs.length);

      // Check if "prefer)." exists in markdown
      if (markdown.includes("prefer).")) {
        console.log('✓ "prefer)." found in markdown');
      } else {
        console.log('✗ "prefer)." NOT found in markdown');
      }
    } catch (renderError) {
      console.error("Error rendering to markdown:", renderError);
    }

    // Test HTML rendering and pagination
    console.log("\n=== TESTING HTML RENDERING AND PAGINATION ===");
    try {
      const { renderToHtml } = await import("../renderer-dom/src/index.js");
      const htmlContent = await renderToHtml(parsed, { includeStyles: false });
      console.log("HTML length:", htmlContent.length);
      console.log("HTML preview (first 500 chars):", htmlContent.substring(0, 500));
      console.log(
        "HTML preview (last 500 chars):",
        htmlContent.substring(htmlContent.length - 500),
      );

      // Check if "prefer)." exists in HTML
      if (htmlContent.includes("prefer).")) {
        console.log('✓ "prefer)." found in HTML');
      } else {
        console.log('✗ "prefer)." NOT found in HTML');
      }

      // Test page splitting
      const { extractContent } = await import("./src/utils/index.js");
      const contentOnly = extractContent(htmlContent);
      console.log("Content only length:", contentOnly.length);
      console.log("Content only preview (first 500 chars):", contentOnly.substring(0, 500));
      console.log(
        "Content only preview (last 500 chars):",
        contentOnly.substring(contentOnly.length - 500),
      );

      // Check if "prefer)." exists in content only
      if (contentOnly.includes("prefer).")) {
        console.log('✓ "prefer)." found in content only');
      } else {
        console.log('✗ "prefer)." NOT found in content only');
      }
    } catch (htmlError) {
      console.error("Error testing HTML rendering:", htmlError);
    }
  } catch (error) {
    console.error("Error analyzing 011.docx:", error);
  }
}

analyze011();
