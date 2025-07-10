import type { Footnote, FootnoteReference } from "@browser-document-viewer/parser";

export function getFootnoteDisplayNumber(
  footnoteId: string,
  footnoteMap: Map<string, Footnote>,
): number {
  // Create a sorted list of footnote IDs for consistent numbering
  const sortedIds = Array.from(footnoteMap.keys()).sort((a, b) => {
    // Try to parse as numbers first, fall back to string comparison
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);

    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    return a.localeCompare(b);
  });

  const index = sortedIds.indexOf(footnoteId);
  return index >= 0 ? index + 1 : 1; // 1-based numbering
}

export function createFootnoteReference(
  ref: FootnoteReference,
  doc: Document,
  footnoteMap: Map<string, Footnote>,
): HTMLElement {
  const sup = doc.createElement("sup");
  const link = doc.createElement("a");
  link.className = "footnote-marker";
  link.href = `#footnote-${ref.id}`;
  link.setAttribute("role", "doc-noteref");
  link.setAttribute("aria-describedby", `footnote-${ref.id}`);

  // Convert footnote ID to 1-based numbering for display
  const displayNumber = getFootnoteDisplayNumber(ref.id, footnoteMap);
  link.textContent = displayNumber.toString();
  link.title = `Jump to footnote ${displayNumber}`;
  link.setAttribute("aria-label", `Footnote ${displayNumber}`);

  // Add click handler for smooth scrolling
  link.onclick = (e) => {
    e.preventDefault();
    const footnote = doc.getElementById(`footnote-${ref.id}`);
    if (footnote) {
      footnote.scrollIntoView({ behavior: "smooth" });
    }
  };

  sup.appendChild(link);
  return sup;
}

export function createFootnoteSection(
  footnoteMap: Map<string, Footnote>,
  doc: Document,
  renderElement: (element: any) => HTMLElement | null,
): HTMLElement | null {
  if (footnoteMap.size === 0) return null;

  const section = doc.createElement("aside");
  section.className = "footnote-section";
  section.setAttribute("aria-label", "Footnotes");
  section.setAttribute("role", "doc-endnotes");

  const heading = doc.createElement("h3");
  heading.textContent = "Footnotes";
  heading.className = "text-lg font-semibold mb-2";
  heading.id = "footnotes-heading";
  section.appendChild(heading);

  Array.from(footnoteMap.values()).forEach((footnote) => {
    const item = doc.createElement("div");
    item.className = "footnote-item";
    item.id = `footnote-${footnote.id}`;
    item.setAttribute("role", "doc-endnote");
    item.setAttribute("aria-describedby", "footnotes-heading");

    const number = doc.createElement("span");
    number.className = "footnote-number";
    number.setAttribute("aria-label", "Footnote number");
    // Convert footnote ID to 1-based numbering for display
    const displayNumber = getFootnoteDisplayNumber(footnote.id, footnoteMap);
    number.textContent = `${displayNumber}.`;
    item.appendChild(number);

    const content = doc.createElement("span");
    // Footnote contains elements (paragraphs, tables) not runs
    if (footnote.elements && footnote.elements.length > 0) {
      footnote.elements.forEach((element) => {
        const rendered = renderElement(element);
        if (rendered) {
          content.appendChild(rendered);
        }
      });
    }
    item.appendChild(content);

    section.appendChild(item);
  });

  return section;
}
