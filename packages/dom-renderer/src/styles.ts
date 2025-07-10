export function addStyles(): void {
  // Add CSS styles to document head if they don't exist
  const existingStyle = document.getElementById("browser-document-viewer-styles");
  if (existingStyle) return;

  const style = document.createElement("style");
  style.id = "browser-document-viewer-styles";
  style.textContent = `
    .page {
      /* Page styles are now applied inline for dynamic dimensions */
      /* Only shared styles remain here */
      position: relative;
      box-sizing: border-box;
    }
    
    .page-content {
      /* Content styles are now applied inline for dynamic dimensions */
      /* Only shared styles remain here */
      position: relative;
      box-sizing: border-box;
    }
    
    .footer {
      position: absolute;
      bottom: 0;
      left: 1in;
      right: 1in;
      padding-bottom: 0.5in;
    }
    
    .footnote-reference {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
    }
    
    .footnote-reference:hover {
      text-decoration: underline;
    }
    
    .footnote {
      margin-top: 6pt;
      padding: 0;
      background-color: transparent;
      border: none;
      padding-top: 4pt;
      font-size: 10pt;
      line-height: 14pt;
    }
    
    .footnote:first-of-type {
      margin-top: 20pt;
      border-top: 1px solid #ccc;
      padding-top: 8pt;
    }
    
    .footnote-content {
      font-size: 10pt;
      line-height: 14pt;
      display: flex;
      gap: 0.5rem;
    }
    
    .footnote-number {
      font-weight: 600;
      color: #374151;
      min-width: 1.5rem;
      flex-shrink: 0;
    }
    
    .footnote-text {
      flex: 1;
    }
    
    .bookmark-anchor {
      display: inline-block;
      width: 0;
      height: 0;
      overflow: hidden;
    }
    
    @media print {
      .page {
        page-break-after: always;
        margin: 0;
        box-shadow: none;
      }
    }
  `;

  document.head.appendChild(style);
}
