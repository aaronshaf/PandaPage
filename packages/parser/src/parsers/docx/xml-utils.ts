// XML utility functions for namespace handling

/**
 * Get elements by tag name with namespace fallback
 */
export function getElementsByTagNameNSFallback(
  element: Element,
  namespace: string,
  localName: string
): Element[] {
  // Try namespace-aware lookup first
  let elements = Array.from(element.getElementsByTagNameNS(namespace, localName));
  
  // If no elements found, try with prefix
  if (elements.length === 0) {
    elements = Array.from(element.getElementsByTagName(`w:${localName}`));
  }
  
  // If still no elements, try by local name
  if (elements.length === 0) {
    const allElements = element.getElementsByTagName("*");
    elements = [];
    for (let i = 0; i < allElements.length; i++) {
      const elem = allElements[i];
      if (elem && (elem.localName === localName || elem.tagName === `w:${localName}`)) {
        elements.push(elem);
      }
    }
  }
  
  return elements;
}

/**
 * Get first element by tag name with namespace fallback
 */
export function getElementByTagNameNSFallback(
  element: Element,
  namespace: string,
  localName: string
): Element | null {
  const elements = getElementsByTagNameNSFallback(element, namespace, localName);
  return elements[0] || null;
}

/**
 * Check if element has child with given tag name
 */
export function hasChildElementNS(
  element: Element,
  namespace: string,
  localName: string
): boolean {
  return getElementsByTagNameNSFallback(element, namespace, localName).length > 0;
}