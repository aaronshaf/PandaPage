export * from "./types/document";
export { parseDocx, parseDocxDocument, DocxParseError } from "./parsers/docx";
export { sanitizeHTML } from "./utils/html-sanitizer";

// Main parser function that auto-detects format
export async function parseDocument(
  buffer: ArrayBuffer,
  filename?: string,
): Promise<import("./types/document").ParsedDocument> {
  // For now, only support DOCX
  // TODO: Add support for PPTX, Pages, Key

  if (filename?.endsWith(".docx")) {
    const { parseDocxDocument } = await import("./parsers/docx");
    return parseDocxDocument(buffer);
  }

  // Try to detect format from file signature
  const bytes = new Uint8Array(buffer.slice(0, 4));

  // Check for ZIP file signature (DOCX uses ZIP format)
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    // Assume DOCX for now
    const { parseDocxDocument } = await import("./parsers/docx");
    return parseDocxDocument(buffer);
  }

  throw new Error("Unsupported document format");
}
