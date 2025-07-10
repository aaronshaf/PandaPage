import type { Header, Footer } from "@browser-document-viewer/parser";
import { renderParagraph, renderTable } from "./element-renderers";
import { renderTextRun } from "./text-renderer";

export function renderHeader(
  header: any,
  doc: Document,
  currentPageNumber: number,
  totalPages: number,
): HTMLElement {
  const headerEl = doc.createElement("header");

  // Check if header has any actual content
  const hasContent =
    header.elements &&
    header.elements.length > 0 &&
    header.elements.some((el: any) => {
      if (el.type === "paragraph") {
        return (
          el.runs &&
          el.runs.length > 0 &&
          el.runs.some((run: any) => run.text && run.text.trim().length > 0)
        );
      }
      return true; // Tables or other elements count as content
    });

  // Only add spacing and border if there's actual content
  if (hasContent) {
    headerEl.style.marginBottom = "12pt";
    headerEl.style.paddingBottom = "8pt";
    headerEl.style.borderBottom = "1px solid #d1d5db";
  }

  header.elements.forEach((el: any) => {
    if (el.type === "paragraph") {
      headerEl.appendChild(
        renderParagraph(el, doc, currentPageNumber, totalPages, { inTableCell: false }),
      );
    } else if (el.type === "table") {
      headerEl.appendChild(renderTable(el, doc, currentPageNumber, totalPages));
    }
  });

  return headerEl;
}

export function renderHeaderWithPageNumber(
  header: Header,
  pageNumber: number,
  totalPages: number,
  doc: Document,
): HTMLElement {
  const headerEl = doc.createElement("header");
  headerEl.className = "header";
  headerEl.style.position = "absolute";
  headerEl.style.top = "0.5in";
  headerEl.style.right = "1in";
  headerEl.style.left = "1in";
  headerEl.style.fontSize = "12pt";
  headerEl.style.fontFamily = "Times New Roman, serif";
  headerEl.style.lineHeight = "1";

  // Create a container div for the header content
  const contentDiv = doc.createElement("div");
  contentDiv.style.width = "100%";

  // Render header elements
  header.elements.forEach((el: any) => {
    if (el.type === "paragraph") {
      const p = renderParagraph(el, doc, pageNumber, totalPages, { inTableCell: false });
      // Remove default paragraph margin for headers
      p.style.margin = "0";
      p.style.marginBottom = "0";
      contentDiv.appendChild(p);
    } else if (el.type === "table") {
      const table = renderTable(el, doc, pageNumber, totalPages);
      contentDiv.appendChild(table);
    }
  });

  headerEl.appendChild(contentDiv);
  return headerEl;
}

export function renderFooter(
  footer: any,
  doc: Document,
  currentPageNumber: number,
  totalPages: number,
): HTMLElement {
  // This is now only used for inline footers in the document
  // For page footers, use renderFooterWithPageNumber
  return renderFooterWithPageNumber(footer, currentPageNumber, totalPages, doc);
}

export function renderFooterWithPageNumber(
  footer: Footer,
  pageNumber: number,
  totalPages: number,
  doc: Document,
): HTMLElement {
  const footerEl = doc.createElement("footer");
  footerEl.className = "footer"; // Keep footer class for positioning

  // Check if footer has any actual content
  const hasContent =
    footer.elements &&
    footer.elements.length > 0 &&
    footer.elements.some((el) => {
      if (el.type === "paragraph") {
        return (
          el.runs &&
          el.runs.length > 0 &&
          el.runs.some((run) => run.text && run.text.trim().length > 0)
        );
      }
      return true; // Tables or other elements count as content
    });

  // Only add spacing and border if there's actual content
  if (hasContent) {
    footerEl.style.marginTop = "12pt";
    footerEl.style.paddingTop = "8pt";
    footerEl.style.borderTop = "1px solid #d1d5db";
  }

  footer.elements.forEach((el: any) => {
    if (el.type === "paragraph") {
      // Check if this is a footer with recipient name and page number
      const fullText = el.runs?.map((r: any) => r.text).join("") || "";

      if (fullText.includes("[Recipient") && fullText.includes("Recovery Plan")) {
        // Check if there's actually a tab character in the runs
        const hasTab = el.runs?.some((r: any) => r.text?.includes("\t")) || false;

        if (hasTab) {
          // Create flex container for left-right alignment
          const flexDiv = doc.createElement("div");
          flexDiv.style.display = "flex";
          flexDiv.style.justifyContent = "space-between";
          flexDiv.style.alignItems = "center";
          flexDiv.style.marginBottom = "12pt";

          const leftDiv = doc.createElement("div");
          leftDiv.style.flex = "1";

          const rightDiv = doc.createElement("div");
          rightDiv.style.flexShrink = "0";

          let foundTab = false;
          const runs = el.runs || [];

          for (const run of runs) {
            const text = run.text || "";

            // Check if this run contains a tab
            if (text.includes("\t")) {
              // Split on tab
              const parts = text.split("\t");

              // Add pre-tab content to left
              if (parts[0]) {
                const leftRun = { ...run, text: parts[0] };
                leftDiv.appendChild(renderTextRun(leftRun, doc, pageNumber, totalPages));
              }

              // Add post-tab content to right
              if (parts[1]) {
                const rightRun = { ...run, text: parts[1] };
                rightDiv.appendChild(renderTextRun(rightRun, doc, pageNumber, totalPages));
              }

              foundTab = true;
            } else if (!foundTab) {
              // Before tab, add to left
              leftDiv.appendChild(renderTextRun(run, doc, pageNumber, totalPages));
            } else {
              // After tab, add to right
              rightDiv.appendChild(renderTextRun(run, doc, pageNumber, totalPages));
            }
          }

          flexDiv.appendChild(leftDiv);
          flexDiv.appendChild(rightDiv);
          footerEl.appendChild(flexDiv);
        } else {
          // No tab found, render normally
          footerEl.appendChild(
            renderParagraph(el, doc, pageNumber, totalPages, { inTableCell: false }),
          );
        }
      } else {
        footerEl.appendChild(
          renderParagraph(el, doc, pageNumber, totalPages, { inTableCell: false }),
        );
      }
    } else if (el.type === "table") {
      footerEl.appendChild(renderTable(el, doc, pageNumber, totalPages));
    }
  });

  return footerEl;
}
