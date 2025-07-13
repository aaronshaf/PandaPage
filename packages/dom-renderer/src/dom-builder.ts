import type {
  ParsedDocument,
  DocumentElement,
  Paragraph,
  Heading,
  Table,
  TextRun,
  Image,
} from "@browser-document-viewer/parser";
import {
  getTextRunStyles,
  getHeadingStyles,
  getParagraphStyles,
  getImageStyles,
  getTableStyles,
  getTableCellStyles,
} from "./style-utils";

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
    const anchor = doc.createElement("a");
    anchor.href = run.link;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.onclick = (e) => {
      const message = `This document contains a link to an external website:\n\n${run.link}\n\nClicking this link will open a new window and navigate to the external site.\n\n⚠️ Security Warning: Only click if you trust this link and source.\n\nContinue?`;
      if (!confirm(message)) {
        e.preventDefault();
        return false;
      }
      return true;
    };
    baseNode = anchor;
  } else if (
    run.bold ||
    run.italic ||
    run.underline ||
    run.strikethrough ||
    run.fontSize ||
    run.fontFamily ||
    run.color ||
    run.backgroundColor
  ) {
    baseNode = doc.createElement("span");
  } else {
    // Just text, no formatting
    baseNode = createTextNode(run.text, doc);
  }

  // Apply formatting if baseNode is an element
  if (baseNode instanceof HTMLElement) {
    // Add text content
    baseNode.textContent = run.text;

    // Apply inline styles from text run properties
    const styles = getTextRunStyles(run);
    if (styles) {
      baseNode.style.cssText = styles;
    }
  }

  // Handle superscript and subscript
  if (run.superscript || run.subscript) {
    const wrapper = doc.createElement(run.superscript ? "sup" : "sub");
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
    element = doc.createElement("li");
    if (paragraph.listInfo.type === "number" && paragraph.listInfo.text) {
      element.setAttribute("value", paragraph.listInfo.text);
    }
  } else {
    element = doc.createElement("p");
  }

  // Apply inline styles from paragraph properties
  const styles = getParagraphStyles(paragraph);
  if (styles) {
    element.style.cssText = styles;
  }

  // Render runs
  paragraph.runs.forEach((run) => {
    const node = renderTextRun(run, doc);
    if (Array.isArray(node)) {
      node.forEach((n) => element.appendChild(n));
    } else {
      element.appendChild(node);
    }
  });

  // Render images if present
  if (paragraph.images) {
    paragraph.images.forEach((image) => {
      const imgElement = renderImage(image, doc);
      element.appendChild(imgElement);
    });
  }

  return element;
}

function renderHeading(heading: Heading, doc: Document): HTMLElement {
  const element = doc.createElement(`h${heading.level}`);
  
  // Apply inline styles from heading properties
  const styles = getHeadingStyles(heading);
  if (styles) {
    element.style.cssText = styles;
  }

  // Render runs
  heading.runs.forEach((run) => {
    const node = renderTextRun(run, doc);
    if (Array.isArray(node)) {
      node.forEach((n) => element.appendChild(n));
    } else {
      element.appendChild(node);
    }
  });

  // Render images if present
  if (heading.images) {
    heading.images.forEach((image) => {
      const imgElement = renderImage(image, doc);
      element.appendChild(imgElement);
    });
  }

  return element;
}

function renderTable(table: Table, doc: Document): HTMLElement {
  const tableElement = doc.createElement("table");
  tableElement.style.cssText = getTableStyles();

  table.rows.forEach((row, rowIndex) => {
    const tr = doc.createElement("tr");

    row.cells.forEach((cell) => {
      const tag = rowIndex === 0 ? "th" : "td";
      const cellElement = doc.createElement(tag);
      cellElement.style.cssText = getTableCellStyles(rowIndex === 0);

      if (cell.colspan) cellElement.setAttribute("colspan", cell.colspan.toString());
      if (cell.rowspan) cellElement.setAttribute("rowspan", cell.rowspan.toString());

      // Render cell paragraphs
      cell.paragraphs.forEach((p) => {
        cellElement.appendChild(renderParagraph(p, doc));
      });

      tr.appendChild(cellElement);
    });

    tableElement.appendChild(tr);
  });

  return tableElement;
}

function renderImage(image: Image, doc: Document): HTMLElement {
  const img = doc.createElement("img");

  // Check if image has data
  if (!image.data || image.data.byteLength === 0) {
    // Create a placeholder for images without data
    img.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1ZjVmNSIgc3Ryb2tlPSIjZGRkIi8+PHRleHQgeD0iMTAwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZSBEYXRhPC90ZXh0Pjwvc3ZnPg==";
    img.alt = image.alt || "Image without data";
  } else {
    // Convert ArrayBuffer to base64
    const bytes = new Uint8Array(image.data);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]!);
    }
    const base64 = btoa(binary);

    img.src = `data:${image.mimeType};base64,${base64}`;
    img.alt = image.alt || "";
  }
  
  img.style.cssText = getImageStyles();

  // Use CSS dimensions for proper high-DPI display support
  if (image.width !== undefined) {
    img.style.width = `${image.width}px`;
  }
  if (image.height !== undefined) {
    img.style.height = `${image.height}px`;
  }

  return img;
}

function renderHeader(header: DocumentElement, doc: Document): HTMLElement | null {
  if (header.type !== "header") return null;

  const element = doc.createElement("header");
  element.style.cssText = "margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #d1d5db";

  header.elements.forEach((el: any) => {
    let childElement: HTMLElement | null = null;
    if (el.type === "paragraph") {
      childElement = renderParagraph(el, doc);
    } else if (el.type === "table") {
      childElement = renderTable(el, doc);
    }
    if (childElement) {
      element.appendChild(childElement);
    }
  });

  return element;
}

function renderFooter(footer: DocumentElement, doc: Document): HTMLElement | null {
  if (footer.type !== "footer") return null;

  const element = doc.createElement("footer");
  element.style.cssText = "margin-top: 12px; padding-top: 8px; border-top: 1px solid #d1d5db";

  footer.elements.forEach((el: any) => {
    let childElement: HTMLElement | null = null;
    if (el.type === "paragraph") {
      childElement = renderParagraph(el, doc);
    } else if (el.type === "table") {
      childElement = renderTable(el, doc);
    }
    if (childElement) {
      element.appendChild(childElement);
    }
  });

  return element;
}

function renderBookmark(bookmark: DocumentElement, doc: Document): HTMLElement | null {
  if (bookmark.type !== "bookmark") return null;

  const span = doc.createElement("span");
  span.id = bookmark.name;
  span.style.cssText = "position: relative";
  span.setAttribute("data-bookmark-id", bookmark.id);

  return span;
}

function renderPageBreak(doc: Document): HTMLElement {
  const div = doc.createElement("div");
  div.className = "page-break";
  div.style.pageBreakAfter = "always";
  return div;
}

function renderElement(element: DocumentElement, doc: Document): HTMLElement | null {
  switch (element.type) {
    case "paragraph":
      return renderParagraph(element, doc);
    case "heading":
      return renderHeading(element, doc);
    case "table":
      return renderTable(element, doc);
    case "header":
      return renderHeader(element, doc);
    case "footer":
      return renderFooter(element, doc);
    case "bookmark":
      return renderBookmark(element, doc);
    case "image":
      return renderImage(element, doc);
    case "pageBreak":
      return renderPageBreak(doc);
    default:
      return null;
  }
}

export function renderToDOM(
  document: ParsedDocument,
  options: DomRenderOptions = {},
): DocumentFragment {
  const doc = options.document || globalThis.document;
  const fragment = doc.createDocumentFragment();

  document.elements.forEach((element) => {
    const node = renderElement(element, doc);
    if (node) {
      fragment.appendChild(node);
    }
  });

  return fragment;
}

export function renderToDOMString(
  document: ParsedDocument,
  options: DomRenderOptions = {},
): string {
  // For server-side rendering or when a string is needed
  const fragment = renderToDOM(document, options);
  const container = (options.document || globalThis.document).createElement("div");
  container.appendChild(fragment);
  return container.innerHTML;
}
