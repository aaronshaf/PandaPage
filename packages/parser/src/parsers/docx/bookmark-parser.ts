// Bookmark parsing functions
import type { Bookmark } from "../../types/document";
import { WORD_NAMESPACE } from "./types";

/**
 * Parse bookmarks from an element
 * @param element - The element to search for bookmarks
 * @param ns - The namespace string
 * @returns Array of parsed bookmarks
 */
export function parseBookmarks(element: Element, ns: string): Bookmark[] {
  const bookmarks: Bookmark[] = [];

  // Find all bookmark start elements
  const bookmarkStarts = element.getElementsByTagNameNS(ns, "bookmarkStart");

  for (let i = 0; i < bookmarkStarts.length; i++) {
    const bookmarkStart = bookmarkStarts[i];
    if (!bookmarkStart) continue;
    const id = bookmarkStart.getAttribute("w:id");
    const name = bookmarkStart.getAttribute("w:name");

    if (id && name) {
      // Try to find corresponding bookmark end and extract text content
      const bookmarkEnd = findBookmarkEnd(element, id, ns);
      let text: string | undefined;

      if (bookmarkEnd && bookmarkStart) {
        text = extractBookmarkText(bookmarkStart, bookmarkEnd);
      }

      bookmarks.push({
        type: "bookmark",
        id,
        name,
        text,
      });
    }
  }

  return bookmarks;
}

/**
 * Find the bookmark end element for a given bookmark ID
 * @param element - The element to search within
 * @param bookmarkId - The bookmark ID to find
 * @param ns - The namespace string
 * @returns The bookmark end element or null
 */
export function findBookmarkEnd(element: Element, bookmarkId: string, ns: string): Element | null {
  const bookmarkEnds = element.getElementsByTagNameNS(ns, "bookmarkEnd");

  for (let i = 0; i < bookmarkEnds.length; i++) {
    const bookmarkEnd = bookmarkEnds[i];
    if (!bookmarkEnd) continue;
    if (bookmarkEnd.getAttribute("w:id") === bookmarkId) {
      return bookmarkEnd;
    }
  }

  return null;
}

/**
 * Extract text content between bookmark start and end elements
 * @param startElement - The bookmark start element
 * @param endElement - The bookmark end element
 * @returns The extracted text
 */
export function extractBookmarkText(startElement: Element, endElement: Element): string {
  // This is a simplified implementation
  // In a full implementation, you'd traverse from start to end collecting text
  let current = startElement.nextSibling;
  let text = "";

  while (current && current !== endElement) {
    if (current.nodeType === 1) {
      // Element node
      const element = current as Element;
      if (element.tagName === "w:r") {
        const textNodes = element.getElementsByTagName("w:t");
        for (let i = 0; i < textNodes.length; i++) {
          const textNode = textNodes[i];
          if (!textNode) continue;
          text += textNode.textContent || "";
        }
      }
    }
    current = current.nextSibling;
  }

  return text.trim();
}
