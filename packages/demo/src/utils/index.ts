// Get base path for GitHub Pages deployment
export const getBasePath = () => {
  return process.env.NODE_ENV === 'production' ? '/PandaPage' : '';
};

// Remove YAML frontmatter from markdown for rendering
export const removeFrontmatter = (markdown: string): string => {
  // Check if markdown starts with frontmatter (---)
  if (markdown.startsWith('---\n')) {
    const endIndex = markdown.indexOf('\n---\n', 4);
    if (endIndex !== -1) {
      // Return content after the closing ---
      return markdown.substring(endIndex + 5).trim();
    }
  }
  return markdown;
};

// Count words in text
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Extract headings from markdown for outline view
export const extractHeadings = (markdown: string): Array<{level: number, text: string, id: string}> => {
  const lines = markdown.split('\n');
  const headings: Array<{level: number, text: string, id: string}> = [];
  
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ level, text, id });
    }
  }
  
  return headings;
};

// Split HTML content into pages for print view with better logic
export const splitIntoPages = (html: string): string[] => {
  // Create a temporary DOM to work with the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const pages: string[] = [];
  let currentPageElements: Element[] = [];
  let currentPageHeight = 0;
  
  // Rough estimates based on 8.5x11" page with 1" margins (6.5x9" content area)
  // At 12pt font, approximately 54 lines per page
  const maxPageHeight = 54;
  
  const getElementHeight = (element: Element): number => {
    const tagName = element.tagName;
    const textContent = element.textContent || '';
    const textLines = Math.ceil(textContent.length / 80) || 1; // ~80 chars per line
    
    switch (tagName) {
      case 'H1': return Math.max(3, textLines + 1); // Heading + space
      case 'H2': return Math.max(2.5, textLines + 0.5);
      case 'H3': 
      case 'H4': 
      case 'H5': 
      case 'H6': return Math.max(2, textLines + 0.5);
      case 'P': return Math.max(1.5, textLines);
      case 'UL':
      case 'OL': return element.children.length * 1.2 + 0.5; // Space for list
      case 'LI': return Math.max(1, textLines);
      case 'TABLE': {
        const rows = element.querySelectorAll('tr').length;
        return rows * 1.5 + 1; // Table spacing
      }
      case 'TR': return 1.5;
      case 'BLOCKQUOTE': return Math.max(2, textLines + 1);
      case 'PRE': return textContent.split('\n').length + 1;
      case 'HR': return 1;
      case 'DIV': return textLines > 0 ? Math.max(1, textLines) : 0;
      default: return textLines > 0 ? Math.max(0.5, textLines) : 0;
    }
  };
  
  const shouldPageBreakBefore = (element: Element, currentHeight: number): boolean => {
    const tagName = element.tagName;
    
    // Always break before H1 if not at start of page
    if (tagName === 'H1' && currentHeight > 2) {
      return true;
    }
    
    // Break before H2 if we're getting close to page end
    if (tagName === 'H2' && currentHeight > maxPageHeight * 0.8) {
      return true;
    }
    
    // Break before tables if they won't fit
    if (tagName === 'TABLE') {
      const tableHeight = getElementHeight(element);
      if (currentHeight + tableHeight > maxPageHeight) {
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
      const pageDiv = document.createElement('div');
      currentPageElements.forEach(el => pageDiv.appendChild(el.cloneNode(true)));
      pages.push(pageDiv.innerHTML);
      currentPageElements = [];
      currentPageHeight = 0;
    }
  };
  
  // Process each top-level element
  const elements = Array.from(tempDiv.children);
  
  for (const element of elements) {
    const elementHeight = getElementHeight(element);
    
    // Check if we need a page break
    if (shouldPageBreakBefore(element, currentPageHeight) || 
        (currentPageHeight + elementHeight > maxPageHeight && currentPageElements.length > 0)) {
      finishCurrentPage();
    }
    
    // Handle very large elements that might need to be split
    if (elementHeight > maxPageHeight && element.tagName === 'DIV') {
      // Try to split large div elements
      const children = Array.from(element.children);
      if (children.length > 1) {
        // Process children individually
        for (const child of children) {
          const childHeight = getElementHeight(child);
          if (currentPageHeight + childHeight > maxPageHeight && currentPageElements.length > 0) {
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
  
  // Ensure we have at least one page
  if (pages.length === 0) {
    pages.push(html);
  }
  
  return pages;
};