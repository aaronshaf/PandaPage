// Field context management for DOCX parsing
import type { Bookmark } from "../../types/document";
import type { ParsedDocument } from "../../types/document";

/**
 * Field parsing context containing document information
 */
export interface FieldParsingContext {
  bookmarks: Map<string, string>;
  sequences: Map<string, number>;
  metadata?: ParsedDocument["metadata"];
  currentDate: Date;
  tableValues?: number[]; // Values from table cells for formula calculations
}

/**
 * Create a field parsing context from document information
 * @param bookmarks - Array of bookmarks from the document
 * @param metadata - Document metadata
 * @returns Field parsing context
 */
export function createFieldContext(
  bookmarks: Bookmark[],
  metadata?: ParsedDocument["metadata"],
): FieldParsingContext {
  // Build bookmark map
  const bookmarkMap = new Map<string, string>();
  for (const bookmark of bookmarks) {
    if (bookmark.name) {
      bookmarkMap.set(bookmark.name, bookmark.text || bookmark.name);
    }
    if (bookmark.id) {
      bookmarkMap.set(bookmark.id, bookmark.text || bookmark.name || bookmark.id);
    }
  }

  return {
    bookmarks: bookmarkMap,
    sequences: new Map<string, number>(),
    metadata,
    currentDate: new Date(),
  };
}

/**
 * Update sequences in the context (for SEQ fields)
 * @param context - Field parsing context
 * @param sequenceName - Name of the sequence
 * @param operation - Operation to perform
 * @param value - Value for reset operation
 */
export function updateSequence(
  context: FieldParsingContext,
  sequenceName: string,
  operation: "next" | "reset" | "current",
  value?: number,
): number {
  const current = context.sequences.get(sequenceName) || 0;

  switch (operation) {
    case "next":
      const next = current + 1;
      context.sequences.set(sequenceName, next);
      return next;

    case "reset":
      const resetValue = value || 1;
      context.sequences.set(sequenceName, resetValue);
      return resetValue;

    case "current":
      return current;

    default:
      return current;
  }
}
