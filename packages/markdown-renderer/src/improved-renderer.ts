import type {
  ParsedDocument,
  DocumentMetadata,
  DocumentElement,
  Paragraph,
  Heading,
  Table,
  TableRow,
  TableCell,
  TextRun,
  Image,
} from "@browser-document-viewer/parser";

export interface MarkdownRenderOptions {
  includeMetadata?: boolean;
  headingOffset?: number;
  skipEmptyParagraphs?: boolean;
  preserveBookmarks?: boolean;
  compactTables?: boolean;
}

function safeBase64Encode(data: ArrayBuffer | any): string {
  try {
    if (!data) return "";

    // Handle ArrayBuffer
    if (
      data instanceof ArrayBuffer ||
      (data && data.constructor && data.constructor.name === "ArrayBuffer")
    ) {
      const bytes = new Uint8Array(data);
      const binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
      return btoa(binaryString);
    }

    // Handle Buffer-like objects
    if (data.type === "Buffer" && Array.isArray(data.data)) {
      const bytes = new Uint8Array(data.data);
      const binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
      return btoa(binaryString);
    }

    // Already base64
    if (typeof data === "string") {
      return data;
    }

    return "";
  } catch (error) {
    console.warn("Failed to encode image data:", error);
    return "";
  }
}

function renderTextRun(run: TextRun): string {
  let text = run.text || "";

  // Handle footnote references first (before other formatting)
  if ((run as any)._footnoteRef) {
    return `<sup>[^${(run as any)._footnoteRef}]</sup>`;
  }

  // Apply formatting
  if (run.bold) text = `**${text}**`;
  if (run.italic) text = `*${text}*`;
  if (run.underline) text = `<u>${text}</u>`;
  if (run.strikethrough) text = `~~${text}~~`;
  if (run.superscript) text = `<sup>${text}</sup>`;
  if (run.subscript) text = `<sub>${text}</sub>`;

  // Handle color
  if (run.color && run.color !== "auto") {
    text = `<span style="color: ${run.color}">${text}</span>`;
  }

  // Handle highlight
  if (run.highlightColor && run.highlightColor !== "none") {
    text = `<mark style="background-color: ${run.highlightColor}">${text}</mark>`;
  }

  // Handle link
  if (run.link) {
    text = `[${text}](${run.link})`;
  }

  return text;
}

function renderParagraph(paragraph: Paragraph, options: MarkdownRenderOptions): string {
  // Skip empty paragraphs if option is set
  if (options.skipEmptyParagraphs) {
    const hasContent =
      paragraph.runs?.some((run) => run.text?.trim()) ||
      (paragraph.images && paragraph.images.length > 0);

    if (!hasContent) {
      return "";
    }
  }

  let content = paragraph.runs.map(renderTextRun).join("");

  // Add images if present
  if (paragraph.images && paragraph.images.length > 0) {
    const imageMarkdown = paragraph.images
      .map((img) => {
        const base64Data = safeBase64Encode(img.data);
        if (base64Data) {
          const dataUrl = `data:${img.mimeType};base64,${base64Data}`;
          return `![${img.alt || "Image"}](${dataUrl})`;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");

    if (imageMarkdown) {
      content = content ? `${content}\n${imageMarkdown}` : imageMarkdown;
    }
  }

  // Handle list formatting
  if (paragraph.listInfo) {
    const indent = "  ".repeat(paragraph.listInfo.level);
    const marker = paragraph.listInfo.type === "bullet" ? "-" : "1.";
    content = `${indent}${marker} ${content}`;
  }

  // Apply alignment if needed
  if (paragraph.alignment && paragraph.alignment !== "start") {
    const alignMap: Record<string, string> = {
      center: "center",
      end: "right",
      both: "justify",
      distribute: "justify",
      highKashida: "justify",
      lowKashida: "justify",
      mediumKashida: "justify",
      thaiDistribute: "justify",
    };
    const alignStyle = alignMap[paragraph.alignment];
    if (alignStyle) {
      content = `<div style="text-align: ${alignStyle}">${content}</div>`;
    }
  }

  return content;
}

function renderHeading(heading: Heading, options: MarkdownRenderOptions): string {
  const level = Math.min(6, Math.max(1, heading.level + (options.headingOffset || 0)));
  let content = heading.runs.map(renderTextRun).join("");

  // Add images if present (though rare in headings)
  if (heading.images && heading.images.length > 0) {
    const imageMarkdown = heading.images
      .map((img) => {
        const base64Data = safeBase64Encode(img.data);
        if (base64Data) {
          const dataUrl = `data:${img.mimeType};base64,${base64Data}`;
          return `![${img.alt || "Image"}](${dataUrl})`;
        }
        return "";
      })
      .filter(Boolean)
      .join(" ");

    if (imageMarkdown) {
      content = content ? `${content} ${imageMarkdown}` : imageMarkdown;
    }
  }

  return `${"#".repeat(level)} ${content}`;
}

function renderTableCell(cell: TableCell, options: MarkdownRenderOptions): string {
  if (!cell || !cell.paragraphs) return "";

  const content = cell.paragraphs
    .map((para) => {
      const text = para.runs.map(renderTextRun).join("");
      return text;
    })
    .filter(Boolean)
    .join(" ");

  // Apply cell alignment
  if (cell.verticalAlignment && cell.verticalAlignment === "center") {
    return `<div style="text-align: center">${content}</div>`;
  }

  return content.trim();
}

function renderTable(table: Table, options: MarkdownRenderOptions): string {
  if (!table.rows || table.rows.length === 0) return "";

  const lines: string[] = [];
  const maxColumns = Math.max(...table.rows.map((row) => row.cells.length));

  table.rows.forEach((row, rowIndex) => {
    const cells: string[] = [];

    for (let i = 0; i < maxColumns; i++) {
      const cell = row.cells[i];
      cells.push(cell ? renderTableCell(cell, options) : "");
    }

    lines.push(`| ${cells.join(" | ")} |`);

    // Add separator after first row
    if (rowIndex === 0) {
      const separators = cells.map(() => "---");
      lines.push(`| ${separators.join(" | ")} |`);
    }
  });

  return lines.join("\n");
}

function renderImage(image: Image): string {
  const base64Data = safeBase64Encode(image.data);
  if (base64Data) {
    const dataUrl = `data:${image.mimeType};base64,${base64Data}`;
    return `![${image.alt || "Image"}](${dataUrl})`;
  }
  return `![${image.alt || "Image"}](data:image/placeholder;base64,)`;
}

function renderElement(element: DocumentElement, options: MarkdownRenderOptions): string | null {
  switch (element.type) {
    case "paragraph":
      return renderParagraph(element, options);

    case "heading":
      return renderHeading(element, options);

    case "table":
      return renderTable(element, options);

    case "bookmark":
      // Only render bookmarks with text content if preserving
      if (options.preserveBookmarks && element.text && element.text.trim()) {
        return `<a id="${element.name}">${element.text}</a>`;
      }
      return "";

    case "image":
      return renderImage(element);

    case "pageBreak":
      return "\n---\n";

    case "footnote":
      // Footnotes are collected and rendered at the end, return empty here
      return "";

    default:
      return null;
  }
}

function renderMetadata(metadata: DocumentMetadata): string {
  const lines: string[] = ["---"];

  if (metadata.title) lines.push(`title: "${metadata.title}"`);
  if (metadata.author) lines.push(`author: "${metadata.author}"`);
  if (metadata.createdDate) {
    const date =
      metadata.createdDate instanceof Date
        ? metadata.createdDate.toISOString()
        : metadata.createdDate;
    lines.push(`created: ${date}`);
  }
  if (metadata.modifiedDate) {
    const date =
      metadata.modifiedDate instanceof Date
        ? metadata.modifiedDate.toISOString()
        : metadata.modifiedDate;
    lines.push(`modified: ${date}`);
  }
  if (metadata.keywords && metadata.keywords.length > 0) {
    lines.push(`keywords: [${metadata.keywords.map((k) => `"${k}"`).join(", ")}]`);
  }
  if (metadata.description) lines.push(`description: "${metadata.description}"`);

  lines.push("---");
  return lines.join("\n");
}

export function renderToMarkdownImproved(
  document: ParsedDocument,
  options: MarkdownRenderOptions = {},
): string {
  const defaultOptions: MarkdownRenderOptions = {
    includeMetadata: true,
    skipEmptyParagraphs: true,
    preserveBookmarks: true,
    compactTables: false,
    ...options,
  };

  const lines: string[] = [];

  // Add metadata if requested
  if (defaultOptions.includeMetadata && Object.keys(document.metadata).length > 0) {
    lines.push(renderMetadata(document.metadata));
    lines.push("");
  }

  // Track state for better formatting
  let lastElementType: string | null = null;
  let inList = false;
  const footnotes: string[] = [];

  for (const element of document.elements) {
    // Collect footnotes separately
    if (element.type === "footnote") {
      const footnoteContent = element.elements
        ?.map((el) => renderElement(el, defaultOptions))
        .filter(Boolean)
        .join(" ");
      if (footnoteContent) {
        footnotes.push(`[^${element.id}]: ${footnoteContent}`);
      }
      continue;
    }

    const rendered = renderElement(element, defaultOptions);

    if (!rendered) {
      continue;
    }

    // Handle list spacing
    const isListItem =
      element.type === "paragraph" && "listInfo" in element && element.listInfo !== undefined;

    if (isListItem && !inList) {
      // Starting a new list
      inList = true;
      if (lines.length > 0 && lines[lines.length - 1] !== "") {
        lines.push("");
      }
    } else if (!isListItem && inList) {
      // Ending a list
      inList = false;
      lines.push("");
    }

    // Add the rendered content
    lines.push(rendered);

    // Add spacing based on element type
    if (!inList) {
      switch (element.type) {
        case "heading":
        case "table":
        case "image":
          lines.push("");
          break;
        case "paragraph":
          // Only add spacing for non-empty paragraphs
          if (rendered.trim()) {
            lines.push("");
          }
          break;
      }
    }

    lastElementType = element.type;
  }

  // Add footnotes at the end if any exist
  if (footnotes.length > 0) {
    lines.push("");
    lines.push("---");
    lines.push("");
    footnotes.forEach((footnote) => {
      lines.push(footnote);
    });
  }

  // Clean up trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  // Ensure single empty line between sections
  const cleanedLines: string[] = [];
  let emptyCount = 0;

  for (const line of lines) {
    if (line === "") {
      emptyCount++;
      if (emptyCount <= 1) {
        cleanedLines.push(line);
      }
    } else {
      emptyCount = 0;
      cleanedLines.push(line);
    }
  }

  return cleanedLines.join("\n");
}
