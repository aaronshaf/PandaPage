// Get base path for GitHub Pages deployment
export const getBasePath = () => {
  // Use import.meta.env for Vite
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env.PROD ? "/browser-document-viewer" : "";
  }
  // Fallback for tests or other environments
  return "";
};

// Remove YAML frontmatter from markdown for rendering
export const removeFrontmatter = (markdown: string): string => {
  // Check if markdown starts with frontmatter (---)
  if (!markdown.startsWith("---\n") && !markdown.startsWith("---\r\n")) {
    return markdown;
  }
  
  // Find the closing --- (must be on its own line)
  const lines = markdown.split(/\r?\n/);
  
  // Start from line 1 (skip the opening ---)
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      // Found closing marker, return content after it
      // Get remaining lines after the closing ---
      const remainingLines = lines.slice(i + 1);
      
      // Skip one empty line if present (common after frontmatter)
      if (remainingLines.length > 0 && remainingLines[0] === "") {
        return remainingLines.slice(1).join("\n");
      }
      
      return remainingLines.join("\n");
    }
  }
  
  // No closing marker found, return original
  return markdown;
};

// Count words in text
export const countWords = (text: string): number => {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

// Extract headings from parsed document for outline view (preferred method)
export const extractHeadingsFromDocument = (
  document: any,
): Array<{ level: number; text: string; id: string }> => {
  const headings: Array<{ level: number; text: string; id: string }> = [];

  if (!document || !document.elements) {
    return headings;
  }

  for (const element of document.elements) {
    if (element.type === "heading") {
      // Extract text from runs (preserves original formatting and structure)
      const text = element.runs
        .map((run: any) => run.text)
        .join("")
        .trim();
      if (text) {
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-");
        headings.push({
          level: element.level,
          text,
          id,
        });
      }
    }
  }

  return headings;
};

// Extract headings from markdown for outline view (fallback method)
export const extractHeadings = (
  markdown: string,
): Array<{ level: number; text: string; id: string }> => {
  const lines = markdown.split("\n");
  const headings: Array<{ level: number; text: string; id: string }> = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      headings.push({ level, text, id });
    }
  }

  return headings;
};

// Extract content from rendered HTML (remove page wrappers but preserve footnotes)
export const extractContent = (html: string): string => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Look for page-content divs and extract their content
  const pageContent = tempDiv.querySelector(".page-content");
  if (pageContent) {
    // Page content should already include footnotes, so just return its innerHTML
    return pageContent.innerHTML;
  }

  // Look for page divs and extract their content
  const page = tempDiv.querySelector(".page");
  if (page) {
    // Extract all content from the page, including footnotes
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

// Split HTML content into pages for print view with better logic
export const splitIntoPages = (html: string): string[] => {
  // Create a temporary DOM to work with the HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const pages: string[] = [];
  let currentPageElements: Element[] = [];
  let currentPageHeight = 0;

  // Rough estimates based on 8.5x11" page with 1" margins (6.5x9" content area)
  // At 12pt font, approximately 54 lines per page - but be more generous to avoid truncation
  const maxPageHeight = 150; // Increased from 54 to prevent content truncation

  const getElementHeight = (element: Element): number => {
    const tagName = element.tagName;
    const textContent = element.textContent || "";
    const textLines = Math.ceil(textContent.length / 80) || 1; // ~80 chars per line

    switch (tagName) {
      case "H1":
        return Math.max(3, textLines + 1); // Heading + space
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
        return element.children.length * 1.2 + 0.5; // Space for list
      case "LI":
        return Math.max(1, textLines);
      case "TABLE": {
        const rows = element.querySelectorAll("tr").length;
        return rows * 1.5 + 1; // Table spacing
      }
      case "TR":
        return 1.5;
      case "BLOCKQUOTE":
        return Math.max(2, textLines + 1);
      case "PRE":
        return textContent.split("\n").length + 1;
      case "HR":
        return 1;
      case "DIV": {
        // Special handling for footnotes - they should be compact
        if (element.classList.contains("footnote")) {
          return Math.max(1, textLines * 0.8);
        }
        return textLines > 0 ? Math.max(1, textLines) : 0;
      }
      default:
        return textLines > 0 ? Math.max(0.5, textLines) : 0;
    }
  };

  const shouldPageBreakBefore = (element: Element, currentHeight: number): boolean => {
    const tagName = element.tagName;

    // Be much more conservative about page breaks to avoid truncation
    // Only break before H1 if we have a lot of content (more conservative)
    if (tagName === "H1" && currentHeight > maxPageHeight * 0.8) {
      return true;
    }

    // Don't break before footnotes - they should stay with their content
    if (element.classList.contains("footnote")) {
      return false;
    }

    // Break before tables only if they really won't fit
    if (tagName === "TABLE") {
      const tableHeight = getElementHeight(element);
      if (currentHeight + tableHeight > maxPageHeight * 1.2) {
        return true;
      }
    }

    // Break before very large blocks only if they really won't fit
    if (["BLOCKQUOTE", "PRE"].includes(tagName)) {
      const elementHeight = getElementHeight(element);
      if (
        currentHeight + elementHeight > maxPageHeight * 1.2 &&
        currentHeight > maxPageHeight * 0.5
      ) {
        return true;
      }
    }

    return false;
  };

  const addElementToPage = (element: Element) => {
    currentPageElements.push(element);
    currentPageHeight += getElementHeight(element);
  };

  const finishCurrentPage = () => {
    if (currentPageElements.length > 0) {
      const pageDiv = document.createElement("div");
      currentPageElements.forEach((el) => pageDiv.appendChild(el.cloneNode(true)));
      const pageContent = pageDiv.innerHTML;

      // Only add non-empty pages (avoid blank pages from whitespace)
      if (pageContent.trim().length > 0) {
        pages.push(pageContent);
      }

      currentPageElements = [];
      currentPageHeight = 0;
    }
  };

  // Process each top-level element
  const elements = Array.from(tempDiv.children);

  for (const element of elements) {
    const elementHeight = getElementHeight(element);

    // Check if we need a page break - be more lenient to avoid truncation
    if (
      shouldPageBreakBefore(element, currentPageHeight) ||
      (currentPageHeight + elementHeight > maxPageHeight * 1.5 && currentPageElements.length > 0)
    ) {
      // Only create a new page if current page has substantial content
      if (currentPageHeight > maxPageHeight * 0.2) {
        // At least 20% of page height
        finishCurrentPage();
      }
    }

    // Handle very large elements that might need to be split - be more lenient
    if (elementHeight > maxPageHeight * 2 && element.tagName === "DIV") {
      // Try to split large div elements
      const children = Array.from(element.children);
      if (children.length > 1) {
        // Process children individually
        for (const child of children) {
          const childHeight = getElementHeight(child);
          if (
            currentPageHeight + childHeight > maxPageHeight * 1.5 &&
            currentPageElements.length > 0
          ) {
            finishCurrentPage();
          }
          addElementToPage(child);
        }
        continue;
      }
    }

    addElementToPage(element);
  }

  // Finish the last page
  finishCurrentPage();

  // Ensure we have at least one page, but only if there's actual content
  if (pages.length === 0 && html.trim().length > 0) {
    pages.push(html);
  }

  return pages;
};
