import { Effect } from "effect";
import { debug } from "../../common/debug";
import {
  parseHyperlinkRelationships,
  parseHyperlink,
  type HyperlinkRelationship,
} from "./hyperlink-parser";
import type { DocxRun, DocxParagraph } from "./types";
import { DocxParseError } from "./types";
import { parseXmlString } from "../../common/xml-parser";

/**
 * Enhanced paragraph with hyperlink information
 */
export interface ParagraphWithHyperlinks extends DocxParagraph {
  hyperlinks?: Array<{
    runs: DocxRun[];
    url: string;
    startIndex: number;
    endIndex: number;
  }>;
}

/**
 * Parse hyperlinks in a paragraph and integrate them with runs using DOM parsing
 */
export const parseHyperlinksInParagraph = (
  paragraphXml: string,
  relationships: Map<string, HyperlinkRelationship>,
): Effect.Effect<Array<{ runs: DocxRun[]; url?: string }>, DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Parsing hyperlinks in paragraph with DOM parsing");

    const hyperlinks: Array<{ runs: DocxRun[]; url?: string }> = [];

    // Add namespace declarations if missing
    let xmlContent = paragraphXml;
    if (!xmlContent.includes("xmlns:w=")) {
      xmlContent = xmlContent.replace(
        /<w:p([^>]*)>/,
        '<w:p$1 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
      );
    }

    // Parse XML with DOM parser
    const doc = yield* parseXmlString(xmlContent).pipe(
      Effect.mapError(
        (error) => new DocxParseError(`Failed to parse paragraph XML: ${error.message}`),
      ),
    );

    // Get all hyperlink elements
    const wordNamespaceURI = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    let hyperlinkElements = doc.getElementsByTagNameNS(wordNamespaceURI, "hyperlink");
    if (hyperlinkElements.length === 0) {
      hyperlinkElements = doc.getElementsByTagName("w:hyperlink");
    }

    // Process each hyperlink element
    for (const hyperlinkElement of hyperlinkElements) {
      // Convert element back to XML string for parseHyperlink function
      const hyperlinkXml =
        hyperlinkElement.outerHTML || new XMLSerializer().serializeToString(hyperlinkElement);

      const hyperlink = yield* parseHyperlink(hyperlinkXml, relationships);
      if (hyperlink.runs.length > 0) {
        hyperlinks.push(hyperlink);
      }
    }

    debug.log(`Found ${hyperlinks.length} hyperlinks in paragraph`);
    return hyperlinks;
  });

/**
 * Merge hyperlink runs into paragraph runs using DOM parsing
 */
export const mergeHyperlinksIntoParagraph = (
  paragraph: DocxParagraph,
  paragraphXml: string,
  relationships: Map<string, HyperlinkRelationship>,
): Effect.Effect<DocxParagraph, DocxParseError> =>
  Effect.gen(function* () {
    // If no hyperlinks in the XML, return as-is
    if (!paragraphXml.includes("<w:hyperlink")) {
      return paragraph;
    }

    const hyperlinks = yield* parseHyperlinksInParagraph(paragraphXml, relationships);

    if (hyperlinks.length === 0) {
      return paragraph;
    }

    // Create a new paragraph with enhanced runs
    const enhancedParagraph = { ...paragraph };
    const enhancedRuns: DocxRun[] = [];

    // Add namespace declarations if missing
    let xmlContent = paragraphXml;
    if (!xmlContent.includes("xmlns:w=")) {
      xmlContent = xmlContent.replace(
        /<w:p([^>]*)>/,
        '<w:p$1 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
      );
    }

    // Parse XML with DOM parser
    const doc = yield* parseXmlString(xmlContent).pipe(
      Effect.mapError(
        (error) => new DocxParseError(`Failed to parse paragraph XML: ${error.message}`),
      ),
    );

    // Get all hyperlink elements
    const wordNamespaceURI = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    let hyperlinkElements = doc.getElementsByTagNameNS(wordNamespaceURI, "hyperlink");
    if (hyperlinkElements.length === 0) {
      hyperlinkElements = doc.getElementsByTagName("w:hyperlink");
    }

    // Process the paragraph by walking through all child nodes
    const paragraphElement = doc.documentElement;
    let hyperlinkIndex = 0;

    // Process all direct child nodes of the paragraph
    const processNode = function* (
      node: Node,
    ): Generator<Effect.Effect<DocxRun[], DocxParseError>, void, unknown> {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;

        // Check if this is a hyperlink element
        if (element.tagName === "w:hyperlink" || element.localName === "hyperlink") {
          // Add hyperlink runs with hyperlink property
          if (hyperlinkIndex < hyperlinks.length) {
            const hyperlink = hyperlinks[hyperlinkIndex];
            if (hyperlink) {
              const hyperlinkRuns = hyperlink.runs.map((run) => ({
                ...run,
                hyperlink: hyperlink.url,
              }));
              enhancedRuns.push(...hyperlinkRuns);
              hyperlinkIndex++;
            }
          }
        } else if (element.tagName === "w:r" || element.localName === "r") {
          // This is a regular run element - extract it
          const runXml = element.outerHTML || new XMLSerializer().serializeToString(element);
          yield extractRunsFromXml(runXml);
        } else {
          // Process child nodes recursively
          for (const child of node.childNodes) {
            yield* processNode(child);
          }
        }
      }
    };

    // Process all child nodes of the paragraph
    for (const child of paragraphElement.childNodes) {
      for (const effect of processNode(child)) {
        const partRuns = yield* effect;
        enhancedRuns.push(...partRuns);
      }
    }

    enhancedParagraph.runs = enhancedRuns;
    return enhancedParagraph;
  });

/**
 * Extract runs from XML fragment (non-hyperlink parts) using DOM parsing
 */
const extractRunsFromXml = (xmlFragment: string): Effect.Effect<DocxRun[], DocxParseError> =>
  Effect.gen(function* () {
    const runs: DocxRun[] = [];

    if (!xmlFragment.trim()) {
      return runs;
    }

    // Add namespace declarations if missing
    let xmlContent = xmlFragment;
    if (!xmlContent.includes("xmlns:w=")) {
      // Wrap fragment in a temporary element with namespace
      xmlContent = `<temp xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">${xmlFragment}</temp>`;
    }

    // Parse XML with DOM parser
    const doc = yield* parseXmlString(xmlContent).pipe(
      Effect.mapError(
        (error) => new DocxParseError(`Failed to parse XML fragment: ${error.message}`),
      ),
    );

    // Get all run elements
    const wordNamespaceURI = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    let runElements = doc.getElementsByTagNameNS(wordNamespaceURI, "r");
    if (runElements.length === 0) {
      runElements = doc.getElementsByTagName("w:r");
    }

    // Process each run element
    for (const runElement of runElements) {
      // Get text elements
      let textElements = runElement.getElementsByTagNameNS(wordNamespaceURI, "t");
      if (textElements.length === 0) {
        textElements = runElement.getElementsByTagName("w:t");
      }

      if (textElements.length > 0) {
        const text = Array.from(textElements)
          .map((el) => el.textContent || "")
          .join("");

        if (text) {
          // Check for formatting elements
          const boldElements = runElement.getElementsByTagName("w:b");
          const italicElements = runElement.getElementsByTagName("w:i");
          const underlineElements = runElement.getElementsByTagName("w:u");

          const bold =
            boldElements.length > 0 &&
            boldElements[0]?.getAttribute("w:val") !== "0" &&
            boldElements[0]?.getAttribute("w:val") !== "false";

          const italic =
            italicElements.length > 0 &&
            italicElements[0]?.getAttribute("w:val") !== "0" &&
            italicElements[0]?.getAttribute("w:val") !== "false";

          let underline = false;
          if (underlineElements.length > 0) {
            const underlineElement = underlineElements[0];
            const val = underlineElement?.getAttribute("w:val");
            // Only underline if w:val is not "none" or "0"
            underline = val !== "none" && val !== "0";
          }

          runs.push({
            text,
            ...(bold && { bold }),
            ...(italic && { italic }),
            ...(underline && { underline }),
          });
        }
      }
    }

    return runs;
  });

/**
 * Load and parse hyperlink relationships from document.xml.rels
 */
export const loadHyperlinkRelationships = (
  relsXml: string | undefined,
): Effect.Effect<Map<string, HyperlinkRelationship>, DocxParseError> =>
  Effect.gen(function* () {
    if (!relsXml) {
      debug.log("No relationships XML provided");
      return new Map();
    }

    return yield* parseHyperlinkRelationships(relsXml);
  });

/**
 * Update DocxRun type to include hyperlink
 */
export interface DocxRunWithHyperlink extends DocxRun {
  hyperlink?: string;
}
