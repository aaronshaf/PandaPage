// Wrapper functions to ensure proper bundling
import type { ParsedDocument } from "@browser-document-viewer/parser";
import type { MarkdownRenderOptions } from "@browser-document-viewer/markdown-renderer";
import type { HtmlRenderOptions } from "@browser-document-viewer/dom-renderer";

export async function parseDocxDocument(buffer: ArrayBuffer): Promise<ParsedDocument> {
  const { parseDocxDocument: parse } = await import("@browser-document-viewer/parser");
  return parse(buffer);
}

export async function renderToMarkdown(
  document: ParsedDocument,
  options?: MarkdownRenderOptions,
): Promise<string> {
  const { renderToMarkdown: render } = await import("@browser-document-viewer/markdown-renderer");
  return render(document, options);
}

export async function renderToHtml(
  document: ParsedDocument,
  options?: HtmlRenderOptions,
): Promise<string> {
  const { renderToHtml: render } = await import("@browser-document-viewer/dom-renderer");
  return render(document, options);
}
