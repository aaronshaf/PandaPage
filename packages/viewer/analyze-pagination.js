import { readFile } from "fs/promises";
import { parseDocxDocument, renderToMarkdown } from "../core/src/wrappers.js";
import { JSDOM } from "jsdom";

// Mock DOM for Node.js
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
global.document = dom.window.document;
global.window = dom.window;

// Import the pagination functions
async function testPagination() {
  console.log("Testing pagination logic with 011.docx...");

  try {
    // Read the 011.docx file
    const buffer = await readFile("./public/011.docx");

    // Parse with enhanced parser
    const parsed = await parseDocxDocument(buffer.buffer);

    console.log("=== PARSING RESULTS ===");
    console.log("Elements found:", parsed.elements.length);

    // Test HTML rendering
    const { renderToHtml } = await import("../renderer-dom/src/index.js");
    const htmlContent = await renderToHtml(parsed, { includeStyles: false });
    console.log("HTML content length:", htmlContent.length);

    // Test extractContent function
    const extractContent = (html) => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      // Look for page-content divs and extract their content
      const pageContent = tempDiv.querySelector(".page-content");
      if (pageContent) {
        return pageContent.innerHTML;
      }

      // Look for page divs and extract their content
      const page = tempDiv.querySelector(".page");
      if (page) {
        let content = "";

        // Get all child elements, preserving footnotes
        const children = Array.from(page.children);
        children.forEach((child) => {
          // Skip nested .page divs but include everything else (including footnotes)
          if (!child.classList.contains("page")) {
            content += child.outerHTML;
          }
        });

        return content;
      }

      // If no page structure found, return original HTML
      return html;
    };

    const contentOnly = extractContent(htmlContent);
    console.log("Content only length:", contentOnly.length);

    // Check for "prefer)." in different stages
    console.log('\\n=== CHECKING FOR "prefer)." TEXT ===');
    console.log("In HTML:", htmlContent.includes("prefer).") ? "✓" : "✗");
    console.log("In content only:", contentOnly.includes("prefer).") ? "✓" : "✗");

    // Test pagination with different page heights
    const testSplitIntoPages = (html, maxHeight) => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      const pages = [];
      let currentPageElements = [];
      let currentPageHeight = 0;

      const getElementHeight = (element) => {
        const tagName = element.tagName;
        const textContent = element.textContent || "";
        const textLines = Math.ceil(textContent.length / 80) || 1;

        switch (tagName) {
          case "H1":
            return Math.max(3, textLines + 1);
          case "H2":
            return Math.max(2.5, textLines + 0.5);
          case "H3":
          case "H4":
          case "H5":
          case "H6":
            return Math.max(2, textLines + 0.5);
          case "P":
            return Math.max(1.5, textLines);
          case "UL":
          case "OL":
            return element.children.length * 1.2 + 0.5;
          case "LI":
            return Math.max(1, textLines);
          case "TABLE": {
            const rows = element.querySelectorAll("tr").length;
            return rows * 1.5 + 1;
          }
          case "TR":
            return 1.5;
          case "BLOCKQUOTE":
            return Math.max(2, textLines + 1);
          case "PRE":
            return textContent.split("\\n").length + 1;
          case "HR":
            return 1;
          case "DIV": {
            if (element.classList.contains("footnote")) {
              return Math.max(1, textLines * 0.8);
            }
            return textLines > 0 ? Math.max(1, textLines) : 0;
          }
          default:
            return textLines > 0 ? Math.max(0.5, textLines) : 0;
        }
      };

      const finishCurrentPage = () => {
        if (currentPageElements.length > 0) {
          const pageDiv = document.createElement("div");
          currentPageElements.forEach((el) => pageDiv.appendChild(el.cloneNode(true)));
          const pageContent = pageDiv.innerHTML;

          if (pageContent.trim().length > 0) {
            pages.push(pageContent);
          }

          currentPageElements = [];
          currentPageHeight = 0;
        }
      };

      const elements = Array.from(tempDiv.children);

      for (const element of elements) {
        const elementHeight = getElementHeight(element);

        if (currentPageHeight + elementHeight > maxHeight && currentPageElements.length > 0) {
          finishCurrentPage();
        }

        currentPageElements.push(element);
        currentPageHeight += elementHeight;
      }

      finishCurrentPage();

      if (pages.length === 0 && html.trim().length > 0) {
        pages.push(html);
      }

      return pages;
    };

    console.log("\\n=== TESTING PAGINATION WITH DIFFERENT PAGE HEIGHTS ===");

    // Test with original height (54)
    const pages54 = testSplitIntoPages(contentOnly, 54);
    console.log(`Page height 54: ${pages54.length} pages`);
    console.log(
      `Last page contains "prefer).": ${pages54[pages54.length - 1].includes("prefer).") ? "✓" : "✗"}`,
    );

    // Test with current height (150)
    const pages150 = testSplitIntoPages(contentOnly, 150);
    console.log(`Page height 150: ${pages150.length} pages`);
    console.log(
      `Last page contains "prefer).": ${pages150[pages150.length - 1].includes("prefer).") ? "✓" : "✗"}`,
    );

    // Test with very high height (1000)
    const pages1000 = testSplitIntoPages(contentOnly, 1000);
    console.log(`Page height 1000: ${pages1000.length} pages`);
    console.log(
      `Last page contains "prefer).": ${pages1000[pages1000.length - 1].includes("prefer).") ? "✓" : "✗"}`,
    );

    // Look for where "prefer)." appears
    console.log('\\n=== LOCATING "prefer)." IN PAGES ===');
    pages150.forEach((page, index) => {
      if (page.includes("prefer).")) {
        console.log(`Found "prefer)." in page ${index + 1} of ${pages150.length}`);
        // Show context around "prefer)."
        const preferIndex = page.indexOf("prefer).");
        const context = page.substring(Math.max(0, preferIndex - 100), preferIndex + 100);
        console.log(`Context: ...${context}...`);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

testPagination();
