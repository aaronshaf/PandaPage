import type {
  ParsedDocument,
  DocumentElement,
  Paragraph,
  Heading,
  Table,
  TextRun,
  DocumentMetadata,
  Image,
} from "@browser-document-viewer/parser";

export interface MarkdownRenderOptions {
  includeFrontmatter?: boolean;
  headingOffset?: number;
  maxDepth?: number;
}

interface RenderContext {
  depth: number;
  maxDepth: number;
  visitedElements: WeakSet<any>;
}

function safeBase64Encode(data: ArrayBuffer): string {
  try {
    // Limit the size to prevent memory issues
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    if (data.byteLength > maxSize) {
      return ""; // Return empty string for oversized images
    }

    const bytes = new Uint8Array(data);
    const binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binaryString);
  } catch (error) {
    console.warn("Failed to encode image data:", error);
    return "";
  }
}

function renderTextRun(run: TextRun): string {
  // Check if this is a footnote reference
  if ((run as any)._footnoteRef) {
    return `[^${(run as any)._footnoteRef}]`;
  }

  let text = run.text;

  // Apply formatting
  if (run.bold) text = `**${text}**`;
  if (run.italic) text = `*${text}*`;
  if (run.underline) text = `<u>${text}</u>`;
  if (run.strikethrough) text = `~~${text}~~`;
  if (run.superscript) text = `<sup>${text}</sup>`;
  if (run.subscript) text = `<sub>${text}</sub>`;

  // Apply link
  if (run.link) {
    text = `[${text}](${run.link})`;
  }

  return text;
}

function renderParagraph(paragraph: Paragraph, context: RenderContext): string {
  // Check recursion depth
  if (context.depth >= context.maxDepth) {
    return "[Content truncated - max depth reached]";
  }

  // Check for circular references
  if (context.visitedElements.has(paragraph)) {
    return "[Circular reference detected]";
  }

  context.visitedElements.add(paragraph);

  const text = paragraph.runs.map(renderTextRun).join("").trim();
  let result = "";

  if (paragraph.listInfo) {
    const indent = "  ".repeat(paragraph.listInfo.level);
    const marker = paragraph.listInfo.type === "bullet" ? "-" : "1.";
    result = `${indent}${marker} ${text}`;
  } else {
    result = text;
  }

  // Add images if present
  if (paragraph.images && paragraph.images.length > 0) {
    const imageMarkdown = paragraph.images
      .map((image) => {
        const base64Data = safeBase64Encode(image.data);
        if (base64Data) {
          return `\n![${image.alt || "Image"}](data:${image.mimeType};base64,${base64Data})`;
        }
        return `\n![${image.alt || "Image"}](data:image/placeholder;base64,)`;
      })
      .join("\n");
    result += imageMarkdown;
  }

  return result;
}

function renderHeading(heading: Heading, context: RenderContext): string {
  // Check recursion depth
  if (context.depth >= context.maxDepth) {
    return "[Content truncated - max depth reached]";
  }

  // Check for circular references
  if (context.visitedElements.has(heading)) {
    return "[Circular reference detected]";
  }

  context.visitedElements.add(heading);

  const text = heading.runs.map(renderTextRun).join("").trim();
  const hashes = "#".repeat(heading.level);
  let result = `${hashes} ${text}`;

  // Add images if present
  if (heading.images && heading.images.length > 0) {
    const imageMarkdown = heading.images
      .map((image) => {
        const base64Data = safeBase64Encode(image.data);
        if (base64Data) {
          return `\n![${image.alt || "Image"}](data:${image.mimeType};base64,${base64Data})`;
        }
        return `\n![${image.alt || "Image"}](data:image/placeholder;base64,)`;
      })
      .join("\n");
    result += imageMarkdown;
  }

  return result;
}

function renderTable(table: Table, context: RenderContext): string {
  // Check recursion depth
  if (context.depth >= context.maxDepth) {
    return "[Content truncated - max depth reached]";
  }

  // Check for circular references
  if (context.visitedElements.has(table)) {
    return "[Circular reference detected]";
  }

  context.visitedElements.add(table);

  const lines: string[] = [];

  table.rows.forEach((row, rowIndex: number) => {
    const cells = row.cells.map((cell: any) => {
      // Join all paragraphs in the cell
      return cell.paragraphs
        .map((p: any) =>
          p.runs
            .map((r: any) => r.text)
            .join("")
            .trim(),
        )
        .join(" ");
    });

    lines.push(`| ${cells.join(" | ")} |`);

    // Add separator after header row
    if (rowIndex === 0) {
      const separators = cells.map(() => "---");
      lines.push(`| ${separators.join(" | ")} |`);
    }
  });

  return lines.join("\n");
}

function renderHeader(header: DocumentElement, context: RenderContext): string {
  if (header.type !== "header") return "";

  // Check recursion depth
  if (context.depth >= context.maxDepth) {
    return "[Content truncated - max depth reached]";
  }

  // Check for circular references
  if (context.visitedElements.has(header)) {
    return "[Circular reference detected]";
  }

  context.visitedElements.add(header);

  const childContext = { ...context, depth: context.depth + 1 };
  const elements = header.elements
    .map((el: any) => {
      if (el.type === "paragraph") {
        return renderParagraph(el, childContext);
      } else if (el.type === "table") {
        return renderTable(el, childContext);
      }
      return "";
    })
    .filter(Boolean);

  return `<!-- HEADER -->\n${elements.join("\n\n")}\n<!-- /HEADER -->`;
}

function renderFooter(footer: DocumentElement, context: RenderContext): string {
  if (footer.type !== "footer") return "";

  // Check recursion depth
  if (context.depth >= context.maxDepth) {
    return "[Content truncated - max depth reached]";
  }

  // Check for circular references
  if (context.visitedElements.has(footer)) {
    return "[Circular reference detected]";
  }

  context.visitedElements.add(footer);

  const childContext = { ...context, depth: context.depth + 1 };
  const elements = footer.elements
    .map((el: any) => {
      if (el.type === "paragraph") {
        return renderParagraph(el, childContext);
      } else if (el.type === "table") {
        return renderTable(el, childContext);
      }
      return "";
    })
    .filter(Boolean);

  return `<!-- FOOTER -->\n${elements.join("\n\n")}\n<!-- /FOOTER -->`;
}

function renderBookmark(bookmark: DocumentElement): string {
  if (bookmark.type !== "bookmark") return "";
  return `<a id="${bookmark.name}">${bookmark.text || ""}</a>`;
}

function renderElement(element: DocumentElement, context: RenderContext): string {
  // Check recursion depth
  if (context.depth >= context.maxDepth) {
    return "[Content truncated - max depth reached]";
  }

  const childContext = { ...context, depth: context.depth + 1 };

  switch (element.type) {
    case "paragraph":
      return renderParagraph(element, childContext);
    case "heading":
      return renderHeading(element, childContext);
    case "table":
      return renderTable(element, childContext);
    case "header":
      return renderHeader(element, childContext);
    case "footer":
      return renderFooter(element, childContext);
    case "bookmark":
      return renderBookmark(element);
    case "image":
      const base64Data = safeBase64Encode(element.data);
      if (base64Data) {
        return `![${element.alt || "Image"}](data:${element.mimeType};base64,${base64Data})`;
      }
      return `![${element.alt || "Image"}](data:image/placeholder;base64,)`;
    case "pageBreak":
      return "---";
    case "footnote":
      // Render footnote with proper markdown formatting
      const footnoteContent = element.elements
        ?.map((el) => renderElement(el, childContext))
        .join("\n\n")
        .trim();
      return `[^${element.id}]: ${footnoteContent || ""}`;
    default:
      return "";
  }
}

function renderFrontmatter(metadata: DocumentMetadata): string {
  const lines: string[] = ["---"];

  if (metadata.title) lines.push(`title: "${metadata.title}"`);
  if (metadata.author) lines.push(`author: "${metadata.author}"`);
  if (metadata.createdDate) lines.push(`created: ${metadata.createdDate.toISOString()}`);
  if (metadata.modifiedDate) lines.push(`modified: ${metadata.modifiedDate.toISOString()}`);
  if (metadata.keywords && metadata.keywords.length > 0) {
    lines.push(`keywords: [${metadata.keywords.map((k: string) => `"${k}"`).join(", ")}]`);
  }
  if (metadata.description) lines.push(`description: "${metadata.description}"`);
  if (metadata.language) lines.push(`language: ${metadata.language}`);

  lines.push("---");
  return lines.join("\n");
}

export function renderToMarkdown(
  document: ParsedDocument,
  options: MarkdownRenderOptions = {},
): string {
  const lines: string[] = [];
  const footnotes: string[] = [];

  // Initialize render context with safety limits
  const context: RenderContext = {
    depth: 0,
    maxDepth: options.maxDepth || 100, // Default max depth of 100
    visitedElements: new WeakSet(),
  };

  // Add frontmatter if requested and metadata exists
  if (options.includeFrontmatter !== false && Object.keys(document.metadata).length > 0) {
    lines.push(renderFrontmatter(document.metadata));
    lines.push("");
  }

  // Render each element
  document.elements.forEach((element: DocumentElement) => {
    try {
      if (element.type === "footnote") {
        // Collect footnotes to render at the end
        const rendered = renderElement(element, context);
        if (rendered) {
          footnotes.push(rendered);
        }
      } else {
        const rendered = renderElement(element, context);
        if (rendered) {
          lines.push(rendered);

          // Add spacing after blocks
          if (
            element.type === "paragraph" ||
            element.type === "heading" ||
            element.type === "table"
          ) {
            lines.push("");
          }
        }
      }
    } catch (error) {
      console.warn("Error rendering element:", error);
      lines.push("[Error rendering element]");
    }
  });

  // Add footnotes at the end if any exist
  if (footnotes.length > 0) {
    lines.push("");
    lines.push("---");
    lines.push("");
    footnotes.forEach((footnote) => {
      lines.push(footnote);
      lines.push("");
    });
  }

  // Remove trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines.join("\n");
}
