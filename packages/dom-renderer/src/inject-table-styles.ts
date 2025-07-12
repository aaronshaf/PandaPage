/**
 * Inject table styles into the document
 */

// Table styles CSS as a string constant
const tableStylesCSS = `
/**
 * Enhanced table styles for document viewer
 * Provides consistent table formatting across view modes
 */

/* Base table styling */
.doc-table {
  font-family: inherit;
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  max-width: 100%;
  background-color: transparent;
  margin: 1em 0;
}

/* Responsive table wrapper */
.doc-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 1em 0;
}

.doc-table-wrapper .doc-table {
  margin: 0;
  min-width: 600px; /* Minimum width before horizontal scroll */
}

/* Enhanced table with complex formatting */
.doc-table-enhanced {
  border-collapse: separate;
  border-spacing: 0;
  table-layout: auto;
}

/* Table cells */
.doc-table th,
.doc-table td {
  padding: 8pt;
  vertical-align: top;
  border: none;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Header cells */
.doc-table th {
  font-weight: bold;
  background-color: #f8f9fa;
}

/* Merged cells */
.doc-table .cell-merged {
  background-color: rgba(0, 123, 255, 0.1);
  position: relative;
}

/* Print-specific styles */
@media print {
  .doc-table {
    page-break-inside: auto;
    margin: 0.5em 0;
  }
  
  .doc-table tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  
  .doc-table thead {
    display: table-header-group;
  }
  
  .doc-table-wrapper {
    overflow: visible;
  }
}

/* Table alignment */
.doc-table-center {
  margin-left: auto;
  margin-right: auto;
}

/* Vertical text support */
.doc-table .vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  height: 150px;
  white-space: nowrap;
}

.doc-table .vertical-text-lr {
  writing-mode: vertical-lr;
  text-orientation: mixed;
  height: 150px;
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .doc-table {
    font-size: 0.9em;
  }
  
  .doc-table th,
  .doc-table td {
    padding: 6pt;
  }
}
`;

let stylesInjected = false;

/**
 * Inject table styles into the document head
 * This ensures consistent table styling across all view modes
 */
export function injectTableStyles(doc: Document = document): void {
  if (stylesInjected && doc === document) {
    return; // Already injected for the main document
  }

  const styleEl = doc.createElement('style');
  styleEl.setAttribute('data-table-styles', 'true');
  styleEl.textContent = tableStylesCSS;
  
  const head = doc.head || doc.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(styleEl);
    if (doc === document) {
      stylesInjected = true;
    }
  }
}

/**
 * Get table styles as a string for server-side rendering or other uses
 */
export function getTableStylesCSS(): string {
  return tableStylesCSS;
}