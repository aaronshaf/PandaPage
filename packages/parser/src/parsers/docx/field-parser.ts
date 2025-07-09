// Field code parsing functions
import type { DocxRun } from './types';

/**
 * Parse a field instruction and create a run with placeholder text
 * @param fieldInstruction - The field instruction (e.g., "PAGE \* MERGEFORMAT")
 * @param runProperties - Optional run properties element
 * @param ns - The namespace string
 * @returns A DocxRun with placeholder text and field code metadata
 */
export function parseFieldRun(fieldInstruction: string, runProperties: Element | null, ns: string): DocxRun | null {
  // Parse the field instruction (e.g., "PAGE \* MERGEFORMAT")
  const instruction = fieldInstruction.trim();
  
  // Extract the field type
  const fieldType = instruction.split(/\s+/)[0];
  
  // Create a placeholder text based on the field type
  let text = "";
  switch (fieldType) {
    case "PAGE":
      text = "1"; // Placeholder - will be replaced by actual page number during rendering
      break;
    case "NUMPAGES":
      text = "1"; // Placeholder - will be replaced by total page count
      break;
    default:
      // For other field types, just show the field code
      text = `{${fieldType}}`;
  }
  
  // Parse run properties if available
  let fontSize: string | undefined;
  let fontFamily: string | undefined;
  let bold = false;
  let italic = false;
  
  if (runProperties) {
    const szElement = runProperties.getElementsByTagNameNS(ns, "sz")[0];
    fontSize = szElement?.getAttribute("w:val") || undefined;
    
    const fontElement = runProperties.getElementsByTagNameNS(ns, "rFonts")[0];
    fontFamily = fontElement?.getAttribute("w:ascii") || undefined;
    
    bold = runProperties.getElementsByTagNameNS(ns, "b").length > 0;
    italic = runProperties.getElementsByTagNameNS(ns, "i").length > 0;
  }
  
  return {
    text,
    bold,
    italic,
    fontSize,
    fontFamily,
    _fieldCode: fieldType
  };
}

/**
 * Get MIME type from file extension
 * @param extension - File extension without dot
 * @returns MIME type string
 */
export function getMimeType(extension?: string): string {
  const mimeTypes: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'tif': 'image/tiff',
    'svg': 'image/svg+xml',
    'webp': 'image/webp'
  };
  
  return mimeTypes[extension || ''] || 'image/png';
}