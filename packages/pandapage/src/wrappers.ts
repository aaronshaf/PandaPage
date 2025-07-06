// Wrapper functions to ensure proper bundling
import type { ParsedDocument } from "@pandapage/parser";
import type { MarkdownRenderOptions } from "@pandapage/renderer-markdown";
import type { HtmlRenderOptions } from "@pandapage/renderer-dom";

export async function parseDocxDocument(buffer: ArrayBuffer): Promise<ParsedDocument> {
  const { parseDocxDocument: parse } = await import("@pandapage/parser");
  return parse(buffer);
}

export async function renderToMarkdown(document: ParsedDocument, options?: MarkdownRenderOptions): Promise<string> {
  const { renderToMarkdown: render } = await import("@pandapage/renderer-markdown");
  return render(document, options);
}

export async function renderToHtml(document: ParsedDocument, options?: HtmlRenderOptions): Promise<string> {
  const { renderToHtml: render } = await import("@pandapage/renderer-dom");
  return render(document, options);
}