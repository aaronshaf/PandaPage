import type { ParsedDocument } from "@browser-document-viewer/parser";

// Re-export the new DOM-based renderer
export { DOMRenderer, type DOMRenderOptions } from "./dom-renderer";

// Export the enhanced DOM renderer
export { EnhancedDOMRenderer, type EnhancedDOMRenderOptions } from "./improved-dom-renderer";

export interface HtmlRenderOptions {
  includeStyles?: boolean;
  pageSize?: "letter" | "a4";
  margins?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  fullDocument?: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Import the new DOM-based renderer
import { DOMRenderer } from "./dom-renderer";

export function renderToHtml(document: ParsedDocument, options: HtmlRenderOptions = {}): string {
  // Use the new DOM-based renderer
  const renderer = new DOMRenderer();

  if (options.fullDocument) {
    // Return full HTML document with head/body
    return renderFullDocument(document, options);
  }

  // Return just the elements HTML without container div for backward compatibility
  return renderer.renderToHTML(document, { includeContainer: false });
}

// Function for full document rendering using DOM-based renderer
function renderFullDocument(document: ParsedDocument, options: HtmlRenderOptions): string {
  const renderer = new DOMRenderer();
  const elements = renderer.renderToHTML(document);

  // Include full HTML document with styles
  const pageSize = options.pageSize || "letter";
  const margins = options.margins || {
    top: "1in",
    right: "1in",
    bottom: "1in",
    left: "1in",
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${document.metadata.title ? `<title>${escapeHtml(document.metadata.title)}</title>` : ""}
  <script>
    function confirmDocumentLink(url) {
      const message = 'This document contains a link to an external website:\\n\\n' + url + 
        '\\n\\nClicking this link will open a new window and navigate to the external site.' +
        '\\n\\n⚠️ Security Warning: Only click if you trust this link and source.\\n\\nContinue?';
      return confirm(message);
    }
  </script>
  <style>
    @page {
      size: ${pageSize};
      margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: ${pageSize === "letter" ? "8.5in" : "210mm"};
      margin: 0 auto;
      padding: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
    }
    
    .font-bold { font-weight: bold; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .italic { font-style: italic; }
    .underline { text-decoration: underline; }
    .line-through { text-decoration: line-through; }
    
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-justify { text-align: justify; }
    
    .text-4xl { font-size: 2.25rem; }
    .text-3xl { font-size: 1.875rem; }
    .text-2xl { font-size: 1.5rem; }
    .text-xl { font-size: 1.25rem; }
    .text-lg { font-size: 1.125rem; }
    .text-base { font-size: 1rem; }
    
    .mb-4 { margin-bottom: 1rem; }
    .ml-8 { margin-left: 2rem; }
    .ml-16 { margin-left: 4rem; }
    
    .max-w-full { max-width: 100%; }
    .h-auto { height: auto; }
    
    .border { border: 1px solid #e5e7eb; }
    .border-b { border-bottom: 1px solid; }
    .border-t { border-top: 1px solid; }
    .border-gray-300 { border-color: #d1d5db; }
    .border-collapse { border-collapse: collapse; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .pb-2 { padding-bottom: 0.5rem; }
    .pt-2 { padding-top: 0.5rem; }
    .mt-4 { margin-top: 1rem; }
    
    /* Footnote styles */
    .footnote-reference {
      color: #2563eb;
      text-decoration: none;
      font-size: 0.875rem;
    }
    
    .footnote-reference:hover {
      text-decoration: underline;
    }
    
    .footnote {
      margin-top: 1rem;
      padding: 0.5rem;
      background-color: #f9fafb;
      border-left: 3px solid #e5e7eb;
      font-size: 0.875rem;
    }
    
    .footnote-content {
      display: flex;
      gap: 0.5rem;
    }
    
    .footnote-number {
      font-weight: bold;
      color: #374151;
      min-width: 1.5rem;
    }
    
    @media print {
      .page-break { page-break-after: always; }
    }
  </style>
</head>
<body>
${elements}
</body>
</html>`;
}
