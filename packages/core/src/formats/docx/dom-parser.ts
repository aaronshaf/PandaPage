import { Effect } from "effect";
import { debug } from "../../common/debug";
import { parseXmlString } from "../../common/xml-parser";
import {
  parseFieldsFromParagraph,
  paragraphContainsFields,
  type DocxField,
} from "./form-field-parser";
import { loadHyperlinkRelationships } from "./hyperlink-integration";
import type { HyperlinkRelationship } from "./hyperlink-parser";
import {
  parseImageRelationships,
  parseDrawingElement,
  type ImageRelationship,
} from "./image-parser";
import type { DocxParagraph, DocxRun, DocxParseError } from "./docx-reader";

// Get XMLSerializer for both browser and Node.js environments
function getXMLSerializer(): XMLSerializer | null {
  // Browser environment
  if (typeof window !== "undefined" && window.XMLSerializer) {
    return new window.XMLSerializer();
  }

  // Node.js environment - use happy-dom (more lenient than @xmldom/xmldom)
  try {
    const { Window } = require("happy-dom");
    const window = new Window();
    return new window.XMLSerializer();
  } catch (error) {
    // Return null to allow graceful degradation
    console.warn("XMLSerializer not available. Image parsing will be limited.");
    return null;
  }
}

/**
 * Extract run data (text and formatting) from a run element
 */
function extractRunData(
  runElement: Element,
  imageRelationships: Map<string, ImageRelationship>,
): Effect.Effect<DocxRun, DocxParseError> {
  return Effect.gen(function* () {
    // Parse the run content to extract text and special elements in order
    let runText = "";
    let image: any;

    // Process text elements
    const textElements = runElement.getElementsByTagName("w:t");
    for (const textElement of textElements) {
      runText += textElement.textContent || "";
    }

    // Process tab elements
    const tabElements = runElement.getElementsByTagName("w:tab");
    for (const tabElement of tabElements) {
      runText += "\t";
    }

    // Process break elements
    const breakElements = runElement.getElementsByTagName("w:br");
    for (const breakElement of breakElements) {
      const type = breakElement.getAttribute("w:type");
      if (type === "page") {
        // Page break
        runText += "\u000C"; // Form feed character (page break)
      } else {
        // Regular line break
        runText += "\n";
      }
    }

    // Process drawing elements (images)
    const drawingElements = runElement.getElementsByTagName("w:drawing");
    if (drawingElements.length > 0) {
      const drawingElement = drawingElements[0];
      if (drawingElement) {
        const serializer = getXMLSerializer();
        if (serializer) {
          const drawingXml = serializer.serializeToString(drawingElement);
          const parsedImage = yield* parseDrawingElement(drawingXml, imageRelationships);
          if (parsedImage) {
            image = parsedImage;
            // For image runs, we typically don't have text content
            if (!runText.trim()) {
              runText = ""; // Ensure clean text for image-only runs
            }
          }
        }
      }
    }

    // Check for formatting in run properties using getElementsByTagName
    const rPrElements = runElement.getElementsByTagName("w:rPr");
    let bold = false;
    let italic = false;
    let underline = false;
    let color: string | undefined;

    if (rPrElements.length > 0) {
      const rPr = rPrElements[0];
      if (rPr) {
        bold = rPr.getElementsByTagName("w:b").length > 0;
        italic = rPr.getElementsByTagName("w:i").length > 0;

        // Check for underline - need to verify the w:val attribute
        const underlineElements = rPr.getElementsByTagName("w:u");
        if (underlineElements.length > 0) {
          const underlineElement = underlineElements[0];
          if (underlineElement) {
            const val = underlineElement.getAttribute("w:val");
            const colorAttr = underlineElement.getAttribute("w:color");

            if (val) {
              // If w:val is present, only apply underline if it's not "none" or "0"
              underline = val !== "none" && val !== "0";
            } else if (!colorAttr) {
              // If no w:val and no w:color, it's a simple <w:u/> which defaults to single underline
              underline = true;
            }
            // If w:color but no w:val, it's likely for color styling only, not underline
          }
        }

        // Check for text color
        const colorElements = rPr.getElementsByTagName("w:color");
        if (colorElements.length > 0) {
          const colorElement = colorElements[0];
          if (colorElement) {
            const colorVal = colorElement.getAttribute("w:val");
            if (colorVal && colorVal !== "auto") {
              // Basic hex color validation and conversion
              if (/^[0-9A-Fa-f]{6}$/.test(colorVal)) {
                color = `#${colorVal}`;
              }
            }
          }
        }
      }
    }

    return {
      text: runText,
      ...(bold && { bold }),
      ...(italic && { italic }),
      ...(underline && { underline }),
      ...(color && { color }),
      ...(image && { image }),
    };
  });
}

/**
 * Parse document.xml content using proper DOM parsing instead of regex
 * This replaces the problematic regex-based parsing that fails with nested XML
 */
export const parseDocumentXmlWithDom = (
  xmlContent: string,
  relationshipsXml?: string,
): Effect.Effect<DocxParagraph[], DocxParseError> =>
  Effect.gen(function* () {
    const paragraphs: DocxParagraph[] = [];
    const wordNamespaceURI = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

    // Load hyperlink relationships if provided
    const relationships = yield* loadHyperlinkRelationships(relationshipsXml);

    // Load image relationships if provided
    const imageRelationships = relationshipsXml
      ? yield* parseImageRelationships(relationshipsXml)
      : new Map<string, ImageRelationship>();

    // Parse XML with proper DOM parser using existing utilities
    const doc = yield* parseXmlString(xmlContent).pipe(
      Effect.mapError((error) => ({
        _tag: "DocxParseError" as const,
        message: `XML parsing error: ${error.message}`,
      })),
    );

    // Get all paragraph elements - need to find w:p elements specifically
    // Try getElementsByTagNameNS first, but fall back to getElementsByTagName if needed
    let paragraphElements = doc.getElementsByTagNameNS(wordNamespaceURI, "p");

    // If no elements found with namespace, try without namespace prefix
    if (paragraphElements.length === 0) {
      paragraphElements = doc.getElementsByTagName("w:p");
    }

    // Convert NodeList to Array for easier processing
    const finalParagraphs = Array.from(paragraphElements);

    // Process each paragraph
    for (const pElement of finalParagraphs) {
      // Check if paragraph contains fields (use full paragraph XML for this)
      let fields: DocxField[] | undefined;
      const serializer = getXMLSerializer();
      if (serializer) {
        const paragraphXml = serializer.serializeToString(pElement);
        if (paragraphContainsFields(paragraphXml)) {
          const fieldsResult = yield* parseFieldsFromParagraph(paragraphXml);
          if (fieldsResult.length > 0) {
            fields = fieldsResult;
          }
        }
      }

      // Extract paragraph style using getElementsByTagName
      const pPrElements = pElement.getElementsByTagName("w:pPr");
      let style: string | undefined;
      if (pPrElements.length > 0) {
        const pStyleElements = pPrElements[0]?.getElementsByTagName("w:pStyle");
        if (pStyleElements && pStyleElements.length > 0) {
          style = pStyleElements[0]?.getAttribute("w:val") || undefined;
        }
      }

      // Extract list properties
      let numId: string | undefined;
      let ilvl: number | undefined;
      if (pPrElements.length > 0) {
        const numPrElements = pPrElements[0]?.getElementsByTagName("w:numPr");
        if (numPrElements && numPrElements.length > 0) {
          const numIdElements = numPrElements[0]?.getElementsByTagName("w:numId");
          const ilvlElements = numPrElements[0]?.getElementsByTagName("w:ilvl");

          numId =
            numIdElements && numIdElements.length > 0
              ? numIdElements[0]?.getAttribute("w:val") || undefined
              : undefined;
          ilvl =
            ilvlElements && ilvlElements.length > 0
              ? parseInt(ilvlElements[0]?.getAttribute("w:val") || "0", 10)
              : undefined;
        }
      }

      // Extract runs within the paragraph in document order
      const runs: DocxRun[] = [];

      // Process all child elements in order to maintain document structure
      for (const child of pElement.children) {
        if (child.tagName === "w:hyperlink") {
          // Process hyperlink element
          const rId = child.getAttribute("r:id");
          const anchor = child.getAttribute("w:anchor");

          let hyperlinkUrl: string | undefined;
          if (rId && relationships.has(rId)) {
            hyperlinkUrl = relationships.get(rId)?.target;
          } else if (anchor) {
            hyperlinkUrl = `#${anchor}`;
          }

          // Get runs within the hyperlink
          const hyperlinkRunElements = child.getElementsByTagName("w:r");
          for (const runElement of hyperlinkRunElements) {
            const runData = yield* extractRunData(runElement, imageRelationships);
            if (runData.text || runData.image) {
              runs.push({
                ...runData,
                ...(hyperlinkUrl && { hyperlink: hyperlinkUrl }),
              });
            }
          }
        } else if (child.tagName === "w:r") {
          // Process regular run element
          const runData = yield* extractRunData(child, imageRelationships);
          if (runData.text || runData.image) {
            runs.push(runData);
          }
        }
        // Other elements (w:pPr, etc.) are processed elsewhere
      }

      if (runs.length > 0 || fields) {
        paragraphs.push({
          type: "paragraph",
          style,
          runs,
          ...(numId && { numId }),
          ...(ilvl !== undefined && { ilvl }),
          ...(fields && { fields }),
        });
      }
    }

    debug.log(`Parsed ${paragraphs.length} paragraphs with DOM parser`);
    return paragraphs;
  });

/**
 * Parse numbering.xml content using proper DOM parsing instead of regex
 */
export const parseNumberingXmlWithDom = (xmlContent: string): Effect.Effect<any, DocxParseError> =>
  Effect.gen(function* () {
    const instances = new Map<string, string>();
    const abstractFormats = new Map<string, any>();
    const wordNamespaceURI = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

    // Parse XML with proper DOM parser using existing utilities
    const doc = yield* parseXmlString(xmlContent).pipe(
      Effect.mapError((error) => ({
        _tag: "DocxParseError" as const,
        message: `XML parsing error: ${error.message}`,
      })),
    );

    // Parse abstract numbering definitions using getElementsByTagNameNS with fallback
    let abstractNumElements = doc.getElementsByTagNameNS(wordNamespaceURI, "abstractNum");
    if (abstractNumElements.length === 0) {
      abstractNumElements = doc.getElementsByTagName("w:abstractNum");
    }

    for (const abstractElement of abstractNumElements) {
      const abstractNumId = abstractElement.getAttribute("w:abstractNumId");
      if (!abstractNumId) continue;

      const levels = new Map<number, any>();

      // Parse levels within this abstract format
      let levelElements = abstractElement.getElementsByTagNameNS(wordNamespaceURI, "lvl");
      if (levelElements.length === 0) {
        levelElements = abstractElement.getElementsByTagName("w:lvl");
      }

      for (const levelElement of levelElements) {
        const ilvlStr = levelElement.getAttribute("w:ilvl");
        if (!ilvlStr) continue;

        const ilvl = parseInt(ilvlStr, 10);

        // Extract numFmt
        let numFmtElement = levelElement.getElementsByTagNameNS(wordNamespaceURI, "numFmt")[0];
        if (!numFmtElement) {
          numFmtElement = levelElement.getElementsByTagName("w:numFmt")[0];
        }
        const numFmt = numFmtElement?.getAttribute("w:val") || "bullet";

        // Extract lvlText
        let lvlTextElement = levelElement.getElementsByTagNameNS(wordNamespaceURI, "lvlText")[0];
        if (!lvlTextElement) {
          lvlTextElement = levelElement.getElementsByTagName("w:lvlText")[0];
        }
        const lvlText = lvlTextElement?.getAttribute("w:val") || "•";

        levels.set(ilvl, { numFmt, lvlText });
      }

      if (levels.size > 0) {
        abstractFormats.set(abstractNumId, { levels });
      }
    }

    // Parse numbering instances
    let numElements = doc.getElementsByTagNameNS(wordNamespaceURI, "num");
    if (numElements.length === 0) {
      numElements = doc.getElementsByTagName("w:num");
    }

    for (const numElement of numElements) {
      const numId = numElement.getAttribute("w:numId");
      if (!numId) continue;

      // Extract abstractNumId reference
      let abstractNumIdElement = numElement.getElementsByTagNameNS(
        wordNamespaceURI,
        "abstractNumId",
      )[0];
      if (!abstractNumIdElement) {
        abstractNumIdElement = numElement.getElementsByTagName("w:abstractNumId")[0];
      }
      const abstractNumId = abstractNumIdElement?.getAttribute("w:val");

      if (abstractNumId) {
        instances.set(numId, abstractNumId);
      }
    }

    debug.log(
      `Parsed ${instances.size} numbering instances and ${abstractFormats.size} abstract formats with DOM parser`,
    );
    return { instances, abstractFormats };
  });
