import type {
  ParsedDocument,
  DocumentElement,
  Paragraph,
  Heading,
  Table,
  TextRun,
  Image
} from '@browser-document-viewer/parser';

export interface HtmlRenderOptions {
  includeStyles?: boolean;
  pageSize?: 'letter' | 'a4';
  margins?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderTextRun(run: TextRun): string {
  let content = escapeHtml(run.text);
  
  const styles: string[] = [];
  const classes: string[] = [];
  
  if (run.bold) classes.push('font-bold');
  if (run.italic) classes.push('italic');
  if (run.underline) classes.push('underline');
  if (run.strikethrough) classes.push('line-through');
  
  if (run.fontSize) styles.push(`font-size: ${run.fontSize}pt`);
  if (run.fontFamily) styles.push(`font-family: ${run.fontFamily}`);
  if (run.color) styles.push(`color: ${run.color}`);
  if (run.backgroundColor) styles.push(`background-color: ${run.backgroundColor}`);
  
  const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
  const classAttr = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
  
  // Handle superscript and subscript properly by wrapping the content first
  if (run.superscript) {
    // If we have a link, build the proper structure with security attributes
    if (run.link) {
      const secureAttrs = 'target="_blank" rel="noopener noreferrer" onclick="return confirmDocumentLink(this.href)"';
      return `<a href="${escapeHtml(run.link)}" ${secureAttrs}${classAttr}${styleAttr}><sup>${content}</sup></a>`;
    }
    // If we have classes or styles, wrap in a span with sup inside
    if (classAttr || styleAttr) {
      return `<span${classAttr}${styleAttr}><sup>${content}</sup></span>`;
    }
    return `<sup>${content}</sup>`;
  } else if (run.subscript) {
    // If we have a link, build the proper structure with security attributes
    if (run.link) {
      const secureAttrs = 'target="_blank" rel="noopener noreferrer" onclick="return confirmDocumentLink(this.href)"';
      return `<a href="${escapeHtml(run.link)}" ${secureAttrs}${classAttr}${styleAttr}><sub>${content}</sub></a>`;
    }
    // If we have classes or styles, wrap in a span with sub inside
    if (classAttr || styleAttr) {
      return `<span${classAttr}${styleAttr}><sub>${content}</sub></span>`;
    }
    return `<sub>${content}</sub>`;
  }
  
  // If we have a link, wrap everything in an anchor tag with security attributes
  if (run.link) {
    const secureAttrs = 'target="_blank" rel="noopener noreferrer" onclick="return confirmDocumentLink(this.href)"';
    return `<a href="${escapeHtml(run.link)}" ${secureAttrs}${classAttr}${styleAttr}>${content}</a>`;
  }
  
  // If we have classes or styles, wrap in a span
  if (classAttr || styleAttr) {
    return `<span${classAttr}${styleAttr}>${content}</span>`;
  }
  
  return content;
}

function renderParagraph(paragraph: Paragraph): string {
  const trimmedRuns = trimWhitespaceRuns(paragraph.runs);
  const content = trimmedRuns.map(renderTextRun).join('');
  
  const classes: string[] = ['mb-4'];
  
  if (paragraph.alignment) {
    switch (paragraph.alignment) {
      case 'center': classes.push('text-center'); break;
      case 'right': classes.push('text-right'); break;
      case 'justify': classes.push('text-justify'); break;
    }
  }
  
  // Render images if present
  let imageHtml = '';
  if (paragraph.images) {
    imageHtml = paragraph.images.map(image => {
      const imgData = btoa(String.fromCharCode(...new Uint8Array(image.data)));
      const widthAttr = image.width ? ` width="${image.width}"` : '';
      const heightAttr = image.height ? ` height="${image.height}"` : '';
      return `<img src="data:${image.mimeType};base64,${imgData}"${widthAttr}${heightAttr} alt="${escapeHtml(image.alt || '')}" class="max-w-full h-auto inline-block" />`;
    }).join('');
  }
  
  if (paragraph.listInfo) {
    const indent = paragraph.listInfo.level * 2;
    classes.push(`ml-${indent * 4}`);
    
    if (paragraph.listInfo.type === 'bullet') {
      return `<li class="${classes.join(' ')}">${content}${imageHtml}</li>`;
    } else {
      return `<li class="${classes.join(' ')}" value="${paragraph.listInfo.text || ''}">${content}${imageHtml}</li>`;
    }
  }
  
  return `<p class="${classes.join(' ')}">${content}${imageHtml}</p>`;
}

// Helper function to trim whitespace-only runs from start and end
function trimWhitespaceRuns(runs: TextRun[]): TextRun[] {
  let start = 0;
  let end = runs.length - 1;
  
  // Find first non-whitespace-only run
  while (start <= end && runs[start]?.text.trim() === '') {
    start++;
  }
  
  // Find last non-whitespace-only run
  while (end >= start && runs[end]?.text.trim() === '') {
    end--;
  }
  
  if (start > end) {
    return []; // All runs were whitespace
  }
  
  // Create new array with trimmed runs
  const trimmed = runs.slice(start, end + 1);
  
  // Trim the first and last runs
  if (trimmed.length > 0) {
    trimmed[0] = { ...trimmed[0]!, text: trimmed[0]!.text.trimStart() };
    if (trimmed.length > 1) {
      trimmed[trimmed.length - 1] = { ...trimmed[trimmed.length - 1]!, text: trimmed[trimmed.length - 1]!.text.trimEnd() };
    } else {
      // Only one run, trim both ends
      trimmed[0] = { ...trimmed[0], text: trimmed[0].text.trimEnd() };
    }
  }
  
  return trimmed;
}

function renderHeading(heading: Heading): string {
  const trimmedRuns = trimWhitespaceRuns(heading.runs);
  const content = trimmedRuns.map(renderTextRun).join('');
  const tag = `h${heading.level}`;
  
  const classes: string[] = ['mb-4'];
  
  // Add size classes based on heading level
  switch (heading.level) {
    case 1: classes.push('text-4xl', 'font-bold'); break;
    case 2: classes.push('text-3xl', 'font-bold'); break;
    case 3: classes.push('text-2xl', 'font-semibold'); break;
    case 4: classes.push('text-xl', 'font-semibold'); break;
    case 5: classes.push('text-lg', 'font-medium'); break;
    case 6: classes.push('text-base', 'font-medium'); break;
  }
  
  if (heading.alignment) {
    switch (heading.alignment) {
      case 'center': classes.push('text-center'); break;
      case 'right': classes.push('text-right'); break;
    }
  }
  
  // Render images if present
  let imageHtml = '';
  if (heading.images) {
    imageHtml = heading.images.map(image => {
      const imgData = btoa(String.fromCharCode(...new Uint8Array(image.data)));
      const widthAttr = image.width ? ` width="${image.width}"` : '';
      const heightAttr = image.height ? ` height="${image.height}"` : '';
      return `<img src="data:${image.mimeType};base64,${imgData}"${widthAttr}${heightAttr} alt="${escapeHtml(image.alt || '')}" class="max-w-full h-auto inline-block" />`;
    }).join('');
  }
  
  return `<${tag} class="${classes.join(' ')}">${content}${imageHtml}</${tag}>`;
}

function renderTable(table: Table): string {
  const rows = table.rows.map((row: any, rowIndex: number) => {
    const cells = row.cells.map((cell: any) => {
      const content = cell.paragraphs.map((p: any) => renderParagraph(p)).join('');
      const tag = rowIndex === 0 ? 'th' : 'td';
      const classes = rowIndex === 0 ? 'border px-4 py-2 font-semibold' : 'border px-4 py-2';
      
      const attrs: string[] = [`class="${classes}"`];
      if (cell.colspan) attrs.push(`colspan="${cell.colspan}"`);
      if (cell.rowspan) attrs.push(`rowspan="${cell.rowspan}"`);
      
      return `<${tag} ${attrs.join(' ')}>${content}</${tag}>`;
    });
    
    return `<tr>${cells.join('')}</tr>`;
  });
  
  return `<table class="border-collapse mb-4">${rows.join('')}</table>`;
}

function renderHeader(header: DocumentElement): string {
  if (header.type !== 'header') return '';
  const elements = header.elements.map((el: any) => {
    if (el.type === 'paragraph') {
      return renderParagraph(el);
    } else if (el.type === 'table') {
      return renderTable(el);
    }
    return '';
  }).filter(Boolean);
  
  return `<header class="header mb-4 pb-2 border-b border-gray-300">${elements.join('\n')}</header>`;
}

function renderFooter(footer: DocumentElement): string {
  if (footer.type !== 'footer') return '';
  const elements = footer.elements.map((el: any) => {
    if (el.type === 'paragraph') {
      return renderParagraph(el);
    } else if (el.type === 'table') {
      return renderTable(el);
    }
    return '';
  }).filter(Boolean);
  
  return `<footer class="footer mt-4 pt-2 border-t border-gray-300">${elements.join('\n')}</footer>`;
}

function renderBookmark(bookmark: DocumentElement): string {
  if (bookmark.type !== 'bookmark') return '';
  // Render as invisible anchor for deep linking
  return `<span id="${escapeHtml(bookmark.name)}" class="bookmark-anchor" data-bookmark-id="${escapeHtml(bookmark.id)}"></span>`;
}

function renderElement(element: DocumentElement): string {
  switch (element.type) {
    case 'paragraph':
      return renderParagraph(element);
    case 'heading':
      return renderHeading(element);
    case 'table':
      return renderTable(element);
    case 'header':
      return renderHeader(element);
    case 'footer':
      return renderFooter(element);
    case 'bookmark':
      return renderBookmark(element);
    case 'image':
      const imgData = btoa(String.fromCharCode(...new Uint8Array(element.data)));
      const widthAttr = element.width ? ` width="${element.width}"` : '';
      const heightAttr = element.height ? ` height="${element.height}"` : '';
      return `<img src="data:${element.mimeType};base64,${imgData}"${widthAttr}${heightAttr} alt="${escapeHtml(element.alt || '')}" class="max-w-full h-auto mb-4" />`;
    case 'pageBreak':
      return '<div class="page-break" style="page-break-after: always;"></div>';
    default:
      return '';
  }
}

// Export DOM-based renderer
export { renderToDOM, renderToDOMString, type DomRenderOptions } from './dom-builder';

export function renderToHtml(document: ParsedDocument, options: HtmlRenderOptions = {}): string {
  const elements = document.elements.map(renderElement).join('\n');
  
  if (!options.includeStyles) {
    return elements;
  }
  
  // Include full HTML document with styles
  const pageSize = options.pageSize || 'letter';
  const margins = options.margins || {
    top: '1in',
    right: '1in',
    bottom: '1in',
    left: '1in'
  };
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${document.metadata.title ? `<title>${escapeHtml(document.metadata.title)}</title>` : ''}
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
      max-width: ${pageSize === 'letter' ? '8.5in' : '210mm'};
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