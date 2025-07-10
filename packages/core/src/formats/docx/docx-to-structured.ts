import { Effect } from "effect";
import { readEnhancedDocx } from "./reader-enhanced";
import { convertTableToMarkdown } from "./docx-to-markdown";
import type { EnhancedDocxDocument } from "./types";
import { DocxParseError } from "./types";

export interface StructuredDocxResult {
  document: EnhancedDocxDocument;
  markdown: string;
}

/**
 * Convert enhanced document to markdown
 */
const convertEnhancedDocumentToMarkdown = (
  document: EnhancedDocxDocument,
): Effect.Effect<string, DocxParseError> =>
  Effect.gen(function* () {
    const lines: string[] = [];

    // Add frontmatter if metadata exists
    if (document.metadata && Object.keys(document.metadata).length > 0) {
      lines.push("---");
      if (document.metadata.title) lines.push(`title: "${document.metadata.title}"`);
      if (document.metadata.creator) lines.push(`author: "${document.metadata.creator}"`);
      if (document.metadata.created)
        lines.push(`created: ${document.metadata.created.toISOString()}`);
      if (document.metadata.modified)
        lines.push(`modified: ${document.metadata.modified.toISOString()}`);
      lines.push("---");
      lines.push("");
    }

    // Convert elements to markdown
    for (const element of document.elements) {
      if (element.type === "paragraph") {
        // Convert paragraph runs to text
        const text =
          element.runs
            ?.map((run) => {
              let content = run.text || "";
              if (run.bold) content = `**${content}**`;
              if (run.italic) content = `*${content}*`;
              if (run.underline) content = `<u>${content}</u>`;
              return content;
            })
            .join("") || "";

        // Handle headings
        if (element.style?.startsWith("Heading")) {
          const level = parseInt(element.style.replace("Heading", "")) || 1;
          lines.push(`${"#".repeat(level)} ${text}`);
          lines.push("");
        } else if (text.trim()) {
          lines.push(text);
          lines.push("");
        }
      } else if (element.type === "table") {
        const tableMarkdown = convertTableToMarkdown(element);
        if (tableMarkdown) {
          lines.push(tableMarkdown);
          lines.push("");
        }
      }
    }

    // Remove trailing empty lines
    while (lines.length > 0 && lines[lines.length - 1] === "") {
      lines.pop();
    }

    return lines.join("\n");
  });

/**
 * Parse DOCX and return both structured document and markdown
 */
export const docxToStructured = (
  buffer: ArrayBuffer,
): Effect.Effect<StructuredDocxResult, DocxParseError> =>
  Effect.gen(function* () {
    // Parse the document
    const document = yield* readEnhancedDocx(buffer);

    // Convert to markdown
    const markdown = yield* convertEnhancedDocumentToMarkdown(document);

    return {
      document,
      markdown,
    };
  });

/**
 * Helper function for promise-based usage
 */
export async function parseDocxToStructured(buffer: ArrayBuffer): Promise<StructuredDocxResult> {
  return Effect.runPromise(docxToStructured(buffer));
}
