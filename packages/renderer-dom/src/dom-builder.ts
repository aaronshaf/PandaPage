import type {
  ParsedDocument,
  DocumentElement,
  Paragraph,
  Heading,
  Table,
  TextRun,
  Image
} from '@browser-document-viewer/parser';

export interface DomRenderOptions {
  includeStyles?: boolean;
  document?: Document;
}

function createTextNode(text: string, doc: Document): Text {
  return doc.createTextNode(text);
}

function renderTextRun(run: TextRun, doc: Document): Node | Node[] {
  const nodes: Node[] = [];
  
  // Create base element or text node
  let baseNode: HTMLElement | Text;
  
  if (run.link) {
    const anchor = doc.createElement('a');
    anchor.href = run.link;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.onclick = (e) => {
      const message = `This document contains a link to an external website:\n\n${run.link}\n\nClicking this link will open a new window and navigate to the external site.\n\n⚠️ Security Warning: Only click if you trust this link and source.\n\nContinue?`;
      if (!confirm(message)) {
        e.preventDefault();
        return false;
      }
      return true;
    };
    baseNode = anchor;
  } else if (run.bold || run.italic || run.underline || run.strikethrough || 
             run.fontSize || run.fontFamily || run.color || run.backgroundColor) {
    baseNode = doc.createElement('span');
  } else {
    // Just text, no formatting
    baseNode = createTextNode(run.text, doc);
  }
  
  // Apply formatting if baseNode is an element
  if (baseNode instanceof HTMLElement) {
    // Add text content
    baseNode.textContent = run.text;
    
    // Apply styles
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
    
    if (styles.length > 0) {
      baseNode.style.cssText = styles.join('; ');
    }
    if (classes.length > 0) {
      baseNode.className = classes.join(' ');
    }
  }
  
  // Handle superscript and subscript
  if (run.superscript || run.subscript) {
    const wrapper = doc.createElement(run.superscript ? 'sup' : 'sub');
    if (baseNode instanceof Text) {
      wrapper.appendChild(baseNode);
    } else {
      // Move children from baseNode to wrapper
      while (baseNode.firstChild) {
        wrapper.appendChild(baseNode.firstChild);
      }
      baseNode.appendChild(wrapper);
    }
    
    if (baseNode instanceof Text) {
      return wrapper;
    }
  }
  
  return baseNode;
}

function renderParagraph(paragraph: Paragraph, doc: Document): HTMLElement {
  let element: HTMLElement;
  
  if (paragraph.listInfo) {
    element = doc.createElement('li');
    const indent = paragraph.listInfo.level * 2;
    element.className = `mb-4 ml-${indent * 4}`;
    
    if (paragraph.listInfo.type === 'number' && paragraph.listInfo.text) {
      element.setAttribute('value', paragraph.listInfo.text);
    }
  } else {
    element = doc.createElement('p');
    element.className = 'mb-4';
  }
  
  // Apply alignment
  if (paragraph.alignment) {
    switch (paragraph.alignment) {
      case 'center': element.classList.add('text-center'); break;
      case 'right': element.classList.add('text-right'); break;
      case 'justify': element.classList.add('text-justify'); break;
    }
  }
  
  // Render runs
  paragraph.runs.forEach(run => {
    const node = renderTextRun(run, doc);
    if (Array.isArray(node)) {
      node.forEach(n => element.appendChild(n));
    } else {
      element.appendChild(node);
    }
  });
  
  // Render images if present
  if (paragraph.images) {
    paragraph.images.forEach(image => {
      const imgElement = renderImage(image, doc);
      element.appendChild(imgElement);
    });
  }
  
  return element;
}

function renderHeading(heading: Heading, doc: Document): HTMLElement {
  const element = doc.createElement(`h${heading.level}`);
  const classes = ['mb-4'];
  
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
  
  element.className = classes.join(' ');
  
  // Render runs
  heading.runs.forEach(run => {
    const node = renderTextRun(run, doc);
    if (Array.isArray(node)) {
      node.forEach(n => element.appendChild(n));
    } else {
      element.appendChild(node);
    }
  });
  
  // Render images if present
  if (heading.images) {
    heading.images.forEach(image => {
      const imgElement = renderImage(image, doc);
      element.appendChild(imgElement);
    });
  }
  
  return element;
}

function renderTable(table: Table, doc: Document): HTMLElement {
  const tableElement = doc.createElement('table');
  tableElement.className = 'border-collapse mb-4';
  
  table.rows.forEach((row, rowIndex) => {
    const tr = doc.createElement('tr');
    
    row.cells.forEach(cell => {
      const tag = rowIndex === 0 ? 'th' : 'td';
      const cellElement = doc.createElement(tag);
      cellElement.className = rowIndex === 0 ? 'border px-4 py-2 font-semibold' : 'border px-4 py-2';
      
      if (cell.colspan) cellElement.setAttribute('colspan', cell.colspan.toString());
      if (cell.rowspan) cellElement.setAttribute('rowspan', cell.rowspan.toString());
      
      // Render cell paragraphs
      cell.paragraphs.forEach(p => {
        cellElement.appendChild(renderParagraph(p, doc));
      });
      
      tr.appendChild(cellElement);
    });
    
    tableElement.appendChild(tr);
  });
  
  return tableElement;
}

function renderImage(image: Image, doc: Document): HTMLElement {
  const img = doc.createElement('img');
  
  // Convert ArrayBuffer to base64
  const bytes = new Uint8Array(image.data);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const base64 = btoa(binary);
  
  img.src = `data:${image.mimeType};base64,${base64}`;
  img.alt = image.alt || '';
  img.className = 'max-w-full h-auto mb-4';
  
  if (image.width !== undefined) img.width = image.width;
  if (image.height !== undefined) img.height = image.height;
  
  return img;
}

function renderHeader(header: DocumentElement, doc: Document): HTMLElement | null {
  if (header.type !== 'header') return null;
  
  const element = doc.createElement('header');
  element.className = 'header mb-4 pb-2 border-b border-gray-300';
  
  header.elements.forEach((el: any) => {
    let childElement: HTMLElement | null = null;
    if (el.type === 'paragraph') {
      childElement = renderParagraph(el, doc);
    } else if (el.type === 'table') {
      childElement = renderTable(el, doc);
    }
    if (childElement) {
      element.appendChild(childElement);
    }
  });
  
  return element;
}

function renderFooter(footer: DocumentElement, doc: Document): HTMLElement | null {
  if (footer.type !== 'footer') return null;
  
  const element = doc.createElement('footer');
  element.className = 'footer mt-4 pt-2 border-t border-gray-300';
  
  footer.elements.forEach((el: any) => {
    let childElement: HTMLElement | null = null;
    if (el.type === 'paragraph') {
      childElement = renderParagraph(el, doc);
    } else if (el.type === 'table') {
      childElement = renderTable(el, doc);
    }
    if (childElement) {
      element.appendChild(childElement);
    }
  });
  
  return element;
}

function renderBookmark(bookmark: DocumentElement, doc: Document): HTMLElement | null {
  if (bookmark.type !== 'bookmark') return null;
  
  const span = doc.createElement('span');
  span.id = bookmark.name;
  span.className = 'bookmark-anchor';
  span.setAttribute('data-bookmark-id', bookmark.id);
  
  return span;
}

function renderPageBreak(doc: Document): HTMLElement {
  const div = doc.createElement('div');
  div.className = 'page-break';
  div.style.pageBreakAfter = 'always';
  return div;
}

function renderElement(element: DocumentElement, doc: Document): HTMLElement | null {
  switch (element.type) {
    case 'paragraph':
      return renderParagraph(element, doc);
    case 'heading':
      return renderHeading(element, doc);
    case 'table':
      return renderTable(element, doc);
    case 'header':
      return renderHeader(element, doc);
    case 'footer':
      return renderFooter(element, doc);
    case 'bookmark':
      return renderBookmark(element, doc);
    case 'image':
      return renderImage(element, doc);
    case 'pageBreak':
      return renderPageBreak(doc);
    default:
      return null;
  }
}

export function renderToDOM(document: ParsedDocument, options: DomRenderOptions = {}): DocumentFragment {
  const doc = options.document || globalThis.document;
  const fragment = doc.createDocumentFragment();
  
  document.elements.forEach(element => {
    const node = renderElement(element, doc);
    if (node) {
      fragment.appendChild(node);
    }
  });
  
  return fragment;
}

export function renderToDOMString(document: ParsedDocument, options: DomRenderOptions = {}): string {
  // For server-side rendering or when a string is needed
  const fragment = renderToDOM(document, options);
  const container = (options.document || globalThis.document).createElement('div');
  container.appendChild(fragment);
  return container.innerHTML;
}