export function addEnhancedStyles(doc: Document): void {
  const style = doc.createElement('style');
  style.textContent = `
    .document-container {
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.6;
      color: #333;
      max-width: 100%;
      margin: 0 auto;
    }
    
    .page {
      background: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin: 20px auto;
      padding: 1in;
      min-height: 11in;
      width: 8.5in;
      position: relative;
      page-break-after: always;
    }
    
    .page-content {
      height: 100%;
      overflow: hidden;
    }
    
    @media print {
      .page {
        box-shadow: none;
        margin: 0;
        page-break-after: always;
      }
    }
    
    /* Enhanced Typography */
    .dropcap {
      float: left;
      font-size: 3.5em;
      line-height: 0.8;
      padding-right: 8px;
      padding-top: 4px;
      font-weight: bold;
    }
    
    /* Enhanced Tables */
    .enhanced-table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
      font-size: 14px;
    }
    
    .enhanced-table th,
    .enhanced-table td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
      vertical-align: top;
    }
    
    .enhanced-table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    
    .enhanced-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    
    .enhanced-table tr:hover {
      background-color: #f0f0f0;
    }
    
    /* Text Effects */
    .text-shadow {
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .text-outline {
      -webkit-text-stroke: 1px;
    }
    
    .text-emboss {
      text-shadow: -1px -1px 0 rgba(255, 255, 255, 0.3), 1px 1px 0 rgba(0, 0, 0, 0.8);
    }
    
    .text-engrave {
      text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3), 0 -1px 0 rgba(0, 0, 0, 0.7);
    }
    
    /* Footnotes */
    .footnote-section {
      border-top: 1px solid #ccc;
      margin-top: 2em;
      padding-top: 1em;
    }
    
    .footnote-item {
      margin-bottom: 0.5em;
      font-size: 0.9em;
      display: flex;
      align-items: flex-start;
    }
    
    .footnote-number {
      margin-right: 0.5em;
      font-weight: bold;
      min-width: 1.5em;
    }
    
    .footnote-marker {
      color: #0066cc;
      text-decoration: none;
      font-weight: bold;
    }
    
    .footnote-marker:hover {
      text-decoration: underline;
    }
    
    /* Images */
    .image-figure {
      margin: 1em 0;
      text-align: center;
    }
    
    .image-figure img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .image-figure figcaption {
      margin-top: 0.5em;
      font-style: italic;
      color: #666;
      font-size: 0.9em;
    }
    
    /* Lazy loading placeholder */
    .lazy-image {
      filter: blur(5px);
      transition: filter 0.3s;
    }
    
    .lazy-image.loaded {
      filter: none;
    }
    
    /* Accessibility */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    
    /* Focus indicators */
    .footnote-marker:focus,
    a:focus {
      outline: 2px solid #0066cc;
      outline-offset: 2px;
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .enhanced-table {
        border: 2px solid;
      }
      
      .enhanced-table th,
      .enhanced-table td {
        border: 1px solid;
      }
    }
    
    /* Print optimizations */
    @media print {
      .footnote-section {
        page-break-inside: avoid;
      }
      
      .footnote-item {
        page-break-inside: avoid;
      }
      
      .image-figure {
        page-break-inside: avoid;
      }
      
      .enhanced-table {
        page-break-inside: auto;
      }
      
      .enhanced-table thead {
        display: table-header-group;
      }
      
      .enhanced-table tbody {
        display: table-row-group;
      }
    }
  `;
  
  doc.head.appendChild(style);
}