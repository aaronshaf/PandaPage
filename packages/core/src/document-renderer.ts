import { Effect } from "effect";
import { renderDocx, renderKey, renderPages, renderPptx } from "../index";

// Auto-detect document format and render to Markdown
export async function renderDocument(buffer: ArrayBuffer, filename?: string): Promise<string> {
  // Try to detect format from filename if provided
  if (filename) {
    const extension = filename.toLowerCase().split(".").pop();

    switch (extension) {
      case "docx":
        return renderDocx(buffer);
      case "pptx":
        return renderPptx(buffer);
      case "pages":
        return renderPages(buffer);
      case "key":
        return renderKey(buffer);
      default:
        throw new Error(`Unsupported file format: .${extension}`);
    }
  }

  // Try to detect format from file signature
  const bytes = new Uint8Array(buffer.slice(0, 8));

  // Check for ZIP file signature (used by DOCX, PPTX, Pages, and Key)
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
    // It's a ZIP file, need to look deeper to determine the format
    // Try formats in order of likelihood

    const errors: string[] = [];

    // Try DOCX first
    try {
      return await renderDocx(buffer);
    } catch (e) {
      errors.push(`DOCX: ${e}`);
    }

    // Try PPTX
    try {
      return await renderPptx(buffer);
    } catch (e) {
      errors.push(`PPTX: ${e}`);
    }

    // Try Pages
    try {
      return await renderPages(buffer);
    } catch (e) {
      errors.push(`Pages: ${e}`);
    }

    // Try Keynote
    try {
      return await renderKey(buffer);
    } catch (e) {
      errors.push(`Keynote: ${e}`);
    }

    throw new Error(`Unable to parse document. Errors:\n${errors.join("\n")}`);
  }

  throw new Error("Unsupported document format - file must be DOCX, PPTX, Pages, or Keynote");
}
