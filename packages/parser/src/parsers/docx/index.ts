// DOCX parser main entry point - refactored version
import { Effect } from "effect";
import type {
  ParsedDocument,
  DocumentElement,
  Image,
  Footnote,
  Endnote,
  Header,
  Footer,
} from "../../types/document";
import { DocxParseError, WORD_NAMESPACE } from "./types";

// Re-export for external use
export { DocxParseError } from "./types";
import { parseMetadata } from "./metadata-parser";
import { parseSectionProperties } from "./section-properties";
import { parseParagraph } from "./paragraph-parser";
import { parseTable } from "./table-parser";
import { parseEnhancedTable } from "./enhanced-table-parser";
import { parseHeaderFooter } from "./header-footer-parser";
import { parseFootnotes, parseEndnotes } from "./footnote-parser";
import { parseBookmarks } from "./bookmark-parser";
import { createFieldContext } from "./field-context";
import { convertToDocumentElement } from "./element-converter";
import { extractImageData, createImageElement } from "./image-parser";
import { parseStylesheet, type DocxStylesheet } from "./style-parser";
import { parseTheme, type DocxTheme } from "./theme-parser";
import { parseNumberingXml, type NumberingDefinition } from "./numbering-parser";

/**
 * Parse a DOCX file
 * @param buffer - The DOCX file as an ArrayBuffer
 * @returns Effect containing the parsed document or error
 */
export const parseDocx = (buffer: ArrayBuffer): Effect.Effect<ParsedDocument, DocxParseError> =>
  Effect.gen(function* () {
    // Import JSZip
    const JSZip = yield* Effect.tryPromise({
      try: () => import("jszip").then((m) => m.default),
      catch: (error) => new DocxParseError(`Failed to load JSZip library: ${error}`),
    });

    // Load the DOCX file
    const zip = yield* Effect.tryPromise({
      try: () => JSZip.loadAsync(buffer),
      catch: (error) => new DocxParseError(`Failed to load DOCX file: ${error}`),
    });

    // Get document.xml
    const documentXmlFile = zip.file("word/document.xml");
    if (!documentXmlFile) {
      return yield* Effect.fail(new DocxParseError("No document.xml found in DOCX file"));
    }

    const documentXml = yield* Effect.tryPromise({
      try: () => documentXmlFile.async("text"),
      catch: (error) => new DocxParseError(`Failed to read document.xml: ${error}`),
    });

    // Get metadata files (optional, so we catch and ignore errors)
    const corePropsFile = zip.file("docProps/core.xml");
    const corePropsXml = corePropsFile
      ? yield* Effect.tryPromise({
          try: () => corePropsFile.async("text"),
          catch: () => "",
        }).pipe(Effect.orElse(() => Effect.succeed(undefined)))
      : undefined;

    const appPropsFile = zip.file("docProps/app.xml");
    const appPropsXml = appPropsFile
      ? yield* Effect.tryPromise({
          try: () => appPropsFile.async("text"),
          catch: () => "",
        }).pipe(Effect.orElse(() => Effect.succeed(undefined)))
      : undefined;

    // Parse XML (use xmldom in Node.js)
    let doc: Document;
    if (typeof DOMParser === "undefined") {
      const { DOMParser: XMLDOMParser } = yield* Effect.tryPromise({
        try: () => import("@xmldom/xmldom"),
        catch: (error) => new DocxParseError(`Failed to load XML parser: ${error}`),
      });
      const parser = new XMLDOMParser();
      doc = parser.parseFromString(documentXml, "text/xml") as any;
    } else {
      const parser = new DOMParser();
      doc = parser.parseFromString(documentXml, "text/xml");
    }

    // Extract metadata
    const metadata = parseMetadata(corePropsXml, appPropsXml);

    // Parse relationships for headers, footers, and hyperlinks
    const relsFile = zip.file("word/_rels/document.xml.rels");
    let relationshipsMap = new Map<string, string>();
    let imageRelationships = new Map<string, { id: string; target: string; type: string }>();
    const headerFiles = new Map<string, string>(); // Map rId to header file path
    const footerFiles = new Map<string, string>(); // Map rId to footer file path

    if (relsFile) {
      const relsXml = yield* Effect.tryPromise({
        try: () => relsFile.async("text"),
        catch: () => "",
      }).pipe(Effect.orElse(() => Effect.succeed("")));

      if (relsXml) {
        // Parse relationships document
        let relsDoc: Document;
        if (typeof DOMParser === "undefined") {
          const { DOMParser: XMLDOMParser } = yield* Effect.tryPromise({
            try: () => import("@xmldom/xmldom"),
            catch: (error) => new DocxParseError(`Failed to load XML parser: ${error}`),
          });
          const parser = new XMLDOMParser();
          relsDoc = parser.parseFromString(relsXml, "text/xml") as any;
        } else {
          const parser = new DOMParser();
          relsDoc = parser.parseFromString(relsXml, "text/xml");
        }

        const relationships = relsDoc.getElementsByTagName("Relationship");

        // Build relationships map for hyperlinks and process headers/footers
        for (let i = 0; i < relationships.length; i++) {
          const rel = relationships[i];
          if (!rel) continue;
          const id = rel.getAttribute("Id");
          const type = rel.getAttribute("Type");
          const target = rel.getAttribute("Target");

          if (id && type && target) {
            // Store all relationships for potential hyperlink resolution
            relationshipsMap.set(id, target);

            // Store image relationships
            if (type.includes("image")) {
              imageRelationships.set(id, { id, target, type });
            }

            if (type.includes("header")) {
              // Store header file path for later parsing
              headerFiles.set(id, target);
            } else if (type.includes("footer")) {
              // Store footer file path for later parsing
              footerFiles.set(id, target);
            }
          }
        }
      }
    }

    // Parse styles
    let stylesheet: DocxStylesheet | undefined;
    const stylesFile = zip.file("word/styles.xml");
    if (stylesFile) {
      const stylesXml = yield* Effect.tryPromise({
        try: () => stylesFile.async("text"),
        catch: () => "",
      }).pipe(Effect.orElse(() => Effect.succeed("")));

      if (stylesXml) {
        stylesheet = parseStylesheet(stylesXml);
      }
    }

    // Parse theme
    let theme: DocxTheme | undefined;
    const themeFile = zip.file("word/theme/theme1.xml");
    if (themeFile) {
      const themeXml = yield* Effect.tryPromise({
        try: () => themeFile.async("text"),
        catch: () => "",
      }).pipe(Effect.orElse(() => Effect.succeed("")));

      if (themeXml) {
        theme = yield* parseTheme(themeXml).pipe(Effect.orElse(() => Effect.succeed(undefined)));
      }
    }

    // Parse numbering definitions
    let numberingDef: NumberingDefinition | undefined;
    const numberingFile = zip.file("word/numbering.xml");
    if (numberingFile) {
      const numberingXml = yield* Effect.tryPromise({
        try: () => numberingFile.async("text"),
        catch: () => "",
      }).pipe(Effect.orElse(() => Effect.succeed("")));

      if (numberingXml) {
        numberingDef = yield* parseNumberingXml(numberingXml).pipe(
          Effect.orElse(() => Effect.succeed(undefined)),
        );
      }
    }

    // Now parse headers with styles and theme available
    const headerMap = new Map<string, Header>();
    for (const [id, target] of headerFiles) {
      const headerFile = zip.file(`word/${target}`);
      if (headerFile) {
        const headerXml = yield* Effect.tryPromise({
          try: () => headerFile.async("text"),
          catch: () => "",
        }).pipe(Effect.orElse(() => Effect.succeed("")));

        if (headerXml) {
          const header = parseHeaderFooter(
            headerXml,
            "header",
            relationshipsMap,
            stylesheet,
            theme,
          );
          if (header && header.type === "header") {
            headerMap.set(id, header);
          }
        }
      }
    }

    // Now parse footers with styles and theme available
    const footerMap = new Map<string, Footer>();
    for (const [id, target] of footerFiles) {
      const footerFile = zip.file(`word/${target}`);
      if (footerFile) {
        const footerXml = yield* Effect.tryPromise({
          try: () => footerFile.async("text"),
          catch: () => "",
        }).pipe(Effect.orElse(() => Effect.succeed("")));

        if (footerXml) {
          const footer = parseHeaderFooter(
            footerXml,
            "footer",
            relationshipsMap,
            stylesheet,
            theme,
          );
          if (footer && footer.type === "footer") {
            footerMap.set(id, footer);
          }
        }
      }
    }

    // Parse footnotes
    const footnotes: Footnote[] = [];
    const footnotesFile = zip.file("word/footnotes.xml");
    if (footnotesFile) {
      const footnotesXml = yield* Effect.tryPromise({
        try: () => footnotesFile.async("text"),
        catch: () => "",
      }).pipe(Effect.orElse(() => Effect.succeed("")));

      if (footnotesXml) {
        const parsedFootnotes = parseFootnotes(footnotesXml, relationshipsMap, stylesheet, theme);
        footnotes.push(...parsedFootnotes);
      }
    }

    // Parse endnotes
    const endnotes: Endnote[] = [];
    const endnotesFile = zip.file("word/endnotes.xml");
    if (endnotesFile) {
      const endnotesXml = yield* Effect.tryPromise({
        try: () => endnotesFile.async("text"),
        catch: () => "",
      }).pipe(Effect.orElse(() => Effect.succeed("")));

      if (endnotesXml) {
        const parsedEndnotes = parseEndnotes(endnotesXml, relationshipsMap, stylesheet, theme);
        endnotes.push(...parsedEndnotes);
      }
    }

    // Parse all document body elements in order
    const elements: DocumentElement[] = [];

    // Parse section properties to determine header/footer assignments
    const { headers: headerInfo, footers: footerInfo } = parseSectionProperties(
      doc,
      headerMap,
      footerMap,
    );

    const ns = WORD_NAMESPACE;

    // Get the document body
    let bodyNodeList = doc.getElementsByTagNameNS(ns, "body");
    if (bodyNodeList.length === 0) {
      // Fallback: try with namespace prefix
      bodyNodeList = doc.getElementsByTagName("w:body");
    }
    if (bodyNodeList.length === 0) {
      // Add footnotes and endnotes at the end and return
      elements.push(...footnotes);
      elements.push(...endnotes);

      // Create maps for footnotes and endnotes
      const footnotesMap = new Map<string, Footnote>();
      footnotes.forEach((fn) => footnotesMap.set(fn.id, fn));
      const endnotesMap = new Map<string, Endnote>();
      endnotes.forEach((en) => endnotesMap.set(en.id, en));

      return {
        metadata,
        elements,
        headers: headerInfo,
        footers: footerInfo,
        footnotes: footnotesMap,
        endnotes: endnotesMap,
      };
    }

    const body = bodyNodeList[0];
    if (!body) {
      // Add footnotes and endnotes at the end and return
      elements.push(...footnotes);
      elements.push(...endnotes);

      // Create maps for footnotes and endnotes
      const footnotesMap = new Map<string, Footnote>();
      footnotes.forEach((fn) => footnotesMap.set(fn.id, fn));
      const endnotesMap = new Map<string, Endnote>();
      endnotes.forEach((en) => endnotesMap.set(en.id, en));

      return {
        metadata,
        elements,
        headers: headerInfo,
        footers: footerInfo,
        footnotes: footnotesMap,
        endnotes: endnotesMap,
      };
    }

    // Parse bookmarks from the entire document body first
    const bookmarks = parseBookmarks(body, ns);
    elements.push(...bookmarks);

    // Create field context with bookmarks and metadata
    const fieldContext = createFieldContext(bookmarks, metadata);

    // Store paragraphs with pending images for later processing
    const paragraphsWithImages = new Map<number, { paragraph: any; elementIndex: number }>();

    // Parse all direct children of the body in order
    for (let i = 0; i < body.childNodes.length; i++) {
      const child = body.childNodes[i];
      if (!child || child.nodeType !== 1) continue; // Skip non-element nodes

      const element = child as Element;
      const tagName = element.tagName;
      const localName = element.localName || tagName.split(":").pop() || tagName;

      if (localName === "p") {
        // Parse paragraph with relationships for hyperlink resolution
        const paragraph = parseParagraph(
          element,
          relationshipsMap,
          imageRelationships,
          zip,
          stylesheet,
          theme,
          fieldContext,
        );
        if (paragraph) {
          const elementIndex = elements.length;
          // Pass paragraph index and outline level for better heading detection
          const docElement = convertToDocumentElement(
            paragraph,
            undefined,
            elementIndex,
            paragraph.outlineLevel,
            numberingDef,
          );
          elements.push(docElement);

          // Track paragraphs with images for async processing
          if (paragraph.images && paragraph.images.length > 0) {
            paragraphsWithImages.set(elementIndex, { paragraph, elementIndex });
          }
        }
      } else if (localName === "tbl") {
        // Parse table with enhanced support for borders, shading, and cell spanning
        const table = parseEnhancedTable(element, relationshipsMap, theme, stylesheet);
        if (table) {
          elements.push(table);
        }
      } else if (localName === "sectPr") {
        // Section properties - might contain page breaks
        // For now, add a page break
        elements.push({ type: "pageBreak" });
      }
      // Note: Images are typically inside paragraphs as w:drawing elements
      // We'll handle them in the paragraph parsing
    }

    // Process all paragraphs with pending images
    for (const [elementIndex, { paragraph }] of paragraphsWithImages) {
      const processedImages: Image[] = [];

      if (paragraph.images) {
        for (const image of paragraph.images) {
          if ((image as any)._imageRel && (image as any)._drawingInfo) {
            try {
              // Extract image data
              const imageData = yield* extractImageData(zip, (image as any)._imageRel.target);

              // Create proper image element
              const properImage = createImageElement((image as any)._drawingInfo, imageData);
              processedImages.push(properImage);
            } catch (error) {
              console.warn("Failed to extract image:", error);
            }
          }
        }
      }

      // Update the paragraph element with processed images
      if (processedImages.length > 0 && elements[elementIndex]) {
        const element = elements[elementIndex];
        if (element && (element.type === "paragraph" || element.type === "heading")) {
          (element as any).images = processedImages;
        }
      }
    }

    // Add footnotes and endnotes at the end
    elements.push(...footnotes);
    elements.push(...endnotes);

    // Create maps for footnotes and endnotes
    const footnotesMap = new Map<string, Footnote>();
    footnotes.forEach((fn) => footnotesMap.set(fn.id, fn));
    const endnotesMap = new Map<string, Endnote>();
    endnotes.forEach((en) => endnotesMap.set(en.id, en));

    return {
      metadata,
      elements,
      headers: headerInfo,
      footers: footerInfo,
      footnotes: footnotesMap,
      endnotes: endnotesMap,
    };
  });

/**
 * Parse a DOCX document (Promise-based wrapper)
 * @param buffer - The DOCX file as an ArrayBuffer
 * @returns Promise containing the parsed document
 */
export async function parseDocxDocument(buffer: ArrayBuffer): Promise<ParsedDocument> {
  return Effect.runPromise(parseDocx(buffer));
}
