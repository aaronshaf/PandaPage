// Field code parsing functions
import type { DocxRun } from './types';
import { parseAdvancedFieldRun } from './field-code-parser';

/**
 * Parse a field instruction and create a run with placeholder text
 * @param fieldInstruction - The field instruction (e.g., "PAGE \* MERGEFORMAT")
 * @param runProperties - Optional run properties element
 * @param ns - The namespace string
 * @param context - Optional context for field resolution
 * @returns A DocxRun with placeholder text and field code metadata
 */
export function parseFieldRun(
  fieldInstruction: string, 
  runProperties: Element | null, 
  ns: string,
  context?: {
    bookmarks?: Map<string, string>;
    sequences?: Map<string, number>;
    metadata?: any;
    currentDate?: Date;
  }
): DocxRun | null {
  // Use the advanced field parser
  return parseAdvancedFieldRun(fieldInstruction, runProperties, ns, context);
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