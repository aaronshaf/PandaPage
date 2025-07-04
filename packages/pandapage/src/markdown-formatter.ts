import { Effect } from "effect";
import { PdfMetadata, MarkdownOutput } from "./types";

// Format metadata as YAML front matter
export const formatFrontMatter = (metadata: PdfMetadata): string => {
  const lines: string[] = ["---"];
  
  if (metadata.title) lines.push(`title: "${metadata.title}"`);
  if (metadata.author) lines.push(`author: "${metadata.author}"`);
  
  // Format date as YYYY-MM-DD
  if (metadata.creationDate) {
    const date = metadata.creationDate;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    lines.push(`date: "${year}-${month}-${day}"`);
  }
  
  // Map creator to generator
  if (metadata.creator) lines.push(`generator: "${metadata.creator}"`);
  
  // Map producer to pdf_producer
  if (metadata.producer) lines.push(`pdf_producer: "${metadata.producer}"`);
  
  // Keep these if they exist
  if (metadata.subject) lines.push(`subject: "${metadata.subject}"`);
  if (metadata.keywords) lines.push(`keywords: "${metadata.keywords}"`);
  if (metadata.modificationDate) {
    const date = metadata.modificationDate;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    lines.push(`modified: "${year}-${month}-${day}"`);
  }
  
  lines.push("---");
  
  return lines.join("\n");
};

// Create markdown output with front matter and content
export const createMarkdownOutput = (
  metadata: PdfMetadata,
  content: string,
  includeMetadata: boolean = true
): Effect.Effect<MarkdownOutput> =>
  Effect.gen(function* () {
    const frontMatterString = includeMetadata ? formatFrontMatter(metadata) : "";
    const fullContent = includeMetadata 
      ? `${frontMatterString}\n\n${content}`
      : content;
    
    return {
      frontMatter: metadata,
      content,
      raw: fullContent,
    };
  });

// Format PDF text content as markdown
export const formatPdfContent = (rawText: string): Effect.Effect<string> =>
  Effect.gen(function* () {
    // Basic formatting rules:
    // 1. Trim whitespace
    let formatted = rawText.trim();
    
    // 2. Normalize line breaks
    formatted = formatted.replace(/\r\n/g, "\n");
    formatted = formatted.replace(/\r/g, "\n");
    
    // 3. Convert multiple spaces to single space
    formatted = formatted.replace(/ +/g, " ");
    
    // 4. Add paragraph breaks for double newlines
    formatted = formatted.replace(/\n\n+/g, "\n\n");
    
    // 5. TODO: Add more sophisticated formatting:
    // - Detect headers based on font size/weight
    // - Detect lists
    // - Preserve tables
    // - Handle special characters
    
    return formatted;
  });