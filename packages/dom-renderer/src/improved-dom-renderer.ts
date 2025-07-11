// Enhanced DOM-based renderer with better support for complex formatting
import type {
  ParsedDocument,
  DocumentElement,
  Image,
  Footnote,
  FootnoteReference,
} from "@browser-document-viewer/parser";
import { createLazyImage } from "./image-utils";
import {
  createFootnoteReference,
  createFootnoteSection,
} from "./footnote-utils";
import { addEnhancedStyles } from "./enhanced-styles";
import { renderEnhancedTextRun, renderEnhancedParagraph } from "./text-utils";
import { renderEnhancedTable } from "./table-utils";
import { groupListItems, renderList } from "./list-renderer";

export interface EnhancedDOMRenderOptions {
  document?: Document;
  includeStyles?: boolean;
  pageSize?: "letter" | "a4";
  renderMode?: "view" | "print"; // view mode for screen, print for print preview
  enableDropcaps?: boolean;
  enableAdvancedFormatting?: boolean;
}

export class EnhancedDOMRenderer {
  private doc: Document;
  private currentPageNumber: number = 1;
  private totalPages: number = 1;
  private footnoteMap: Map<string, Footnote> = new Map();
  private options: EnhancedDOMRenderOptions;

  constructor(options: EnhancedDOMRenderOptions = {}) {
    this.options = {
      renderMode: "view",
      enableDropcaps: true,
      enableAdvancedFormatting: true,
      ...options,
    };
    this.doc =
      options.document || (typeof document !== "undefined" ? document : this.createDocument());
  }

  private createDocument(): Document {
    try {
      const { Window } = require("happy-dom");
      const window = new Window();
      return window.document;
    } catch {
      try {
        const { JSDOM } = require("jsdom");
        const dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>");
        return dom.window.document;
      } catch {
        throw new Error(
          "DOM environment not available. Please install happy-dom or jsdom for server-side rendering.",
        );
      }
    }
  }

  private renderEnhancedImage(image: Image): HTMLElement {
    return createLazyImage(image, this.doc);
  }

  private renderFootnoteReference(ref: FootnoteReference): HTMLElement {
    return createFootnoteReference(ref, this.doc, this.footnoteMap);
  }

  private renderFootnoteSection(): HTMLElement | null {
    return createFootnoteSection(this.footnoteMap, this.doc, (element) =>
      this.renderElement(element),
    );
  }

  renderDocument(parsedDoc: ParsedDocument): HTMLElement {
    const container = this.doc.createElement("div");
    container.className = "document-container";

    addEnhancedStyles(this.doc);

    // Collect footnotes
    parsedDoc.elements.forEach((element) => {
      if (element.type === "footnote") {
        this.footnoteMap.set(element.id, element);
      }
    });

    // Group consecutive list items into proper list structures
    const elementsWithLists = groupListItems(parsedDoc.elements);

    // Render elements
    elementsWithLists.forEach((element) => {
      const rendered = this.renderElement(element);
      if (rendered) {
        container.appendChild(rendered);
      }
    });

    // Add footnote section
    const footnoteSection = this.renderFootnoteSection();
    if (footnoteSection) {
      container.appendChild(footnoteSection);
    }

    return container;
  }

  private renderElement(element: DocumentElement): HTMLElement | null {
    switch (element.type) {
      case "paragraph":
        return renderEnhancedParagraph(
          element,
          this.doc,
          {
            enableDropcaps: this.options.enableDropcaps,
            enableAdvancedFormatting: this.options.enableAdvancedFormatting,
          },
          (run) => renderEnhancedTextRun(run, this.doc, this.options.enableAdvancedFormatting),
          (img) => this.renderEnhancedImage(img),
        );

      case "heading":
        const headingLevel = element.level ?? 1;
        const level = Math.min(6, Math.max(1, headingLevel));
        const h = this.doc.createElement(`h${level}`);
        const headingClasses = ["font-bold", "mb-4"];
        if (headingLevel === 1) headingClasses.push("text-4xl");
        else if (headingLevel === 2) headingClasses.push("text-3xl");
        else if (headingLevel === 3) headingClasses.push("text-2xl");
        else if (headingLevel === 4) headingClasses.push("text-xl");
        else if (headingLevel === 5) headingClasses.push("text-lg");
        h.className = headingClasses.join(" ");

        if (element.runs) {
          element.runs.forEach((run) => {
            h.appendChild(
              renderEnhancedTextRun(run, this.doc, this.options.enableAdvancedFormatting),
            );
          });
        }
        return h;

      case "table":
        return renderEnhancedTable(element, this.doc, (para) =>
          renderEnhancedParagraph(
            para,
            this.doc,
            {
              enableDropcaps: this.options.enableDropcaps,
              enableAdvancedFormatting: this.options.enableAdvancedFormatting,
            },
            (run) => renderEnhancedTextRun(run, this.doc, this.options.enableAdvancedFormatting),
            (img) => this.renderEnhancedImage(img),
          ),
        );

      case "image":
        return this.renderEnhancedImage(element);

      case "footnoteReference":
        return this.renderFootnoteReference(element);

      case "footnote":
        // Footnotes are rendered in a separate section
        return null;

      case "bookmark":
        const anchor = this.doc.createElement("a");
        anchor.id = element.name;
        if (element.text) {
          anchor.textContent = element.text;
        }
        return anchor;

      case "pageBreak":
        if (this.options.renderMode === "print") {
          const div = this.doc.createElement("div");
          div.className = "page-break";
          return div;
        }
        return null;

      case "list" as any:
        return renderList(element as any, this.doc, this.currentPageNumber, this.totalPages);

      default:
        return null;
    }
  }

  renderToHTML(parsedDoc: ParsedDocument): string {
    const container = this.renderDocument(parsedDoc);
    return container.outerHTML;
  }
}
