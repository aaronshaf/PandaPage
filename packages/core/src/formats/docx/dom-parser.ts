import { Effect } from "effect";
import { debug } from "../../common/debug";
import { parseXmlString } from "../../common/xml-parser";
import {
  parseFieldsFromParagraph,
  paragraphContainsFields,
  type DocxField,
} from "./form-field-parser";
import type { DocxParagraph, DocxRun, DocxParseError } from "./docx-reader";

/**
 * Parse drawing element to extract image information
 */
function parseDrawingFromElement(drawingElement: Element): { relationshipId: string; width?: number; height?: number; name?: string; description?: string } | undefined {
  try {
    // Find the blip element which contains the relationship ID
    let blipElements = drawingElement.getElementsByTagName("a:blip");
    if (blipElements.length === 0) {
      // Try without namespace prefix
      blipElements = drawingElement.getElementsByTagName("blip");
    }
    if (blipElements.length === 0) return undefined;

    const blip = blipElements[0];
    if (!blip) return undefined;
    
    // Get relationship ID
    const relationshipId = blip.getAttribute("r:embed") || blip.getAttribute("embed");
    if (!relationshipId) return undefined;

    // Extract dimensions from extent element
    let width: number | undefined;
    let height: number | undefined;
    let extentElements = drawingElement.getElementsByTagName("wp:extent");
    if (extentElements.length === 0) {
      extentElements = drawingElement.getElementsByTagName("extent");
    }

    if (extentElements.length > 0) {
      const extent = extentElements[0];
      if (extent) {
        const cx = extent.getAttribute("cx");
        const cy = extent.getAttribute("cy");

        // Convert EMUs (English Metric Units) to pixels
        // 1 pixel = 9525 EMUs
        if (cx) width = Math.round(parseInt(cx, 10) / 9525);
        if (cy) height = Math.round(parseInt(cy, 10) / 9525);
      }
    }

    // Extract name and description
    let name: string | undefined;
    let description: string | undefined;
    let docPrElements = drawingElement.getElementsByTagName("wp:docPr");
    if (docPrElements.length === 0) {
      docPrElements = drawingElement.getElementsByTagName("docPr");
    }

    if (docPrElements.length > 0) {
      const docPr = docPrElements[0];
      if (docPr) {
        name = docPr.getAttribute("name") || undefined;
        description = docPr.getAttribute("descr") || undefined;
      }
    }

    return {
      relationshipId,
      width,
      height,
      name,
      description,
    };
  } catch (error) {
    debug.log(`Error parsing drawing element: ${error}`);
    return undefined;
  }
}

/**
 * Parse VML object element to extract legacy image information
 */
function parseVmlObjectFromElement(objectElement: Element): { relationshipId: string; width?: number; height?: number; name?: string; description?: string } | undefined {
  try {
    // Find v:imagedata element which contains the relationship ID for VML objects
    let imagedataElements = objectElement.getElementsByTagName("v:imagedata");
    if (imagedataElements.length === 0) {
      // Try without namespace prefix
      imagedataElements = objectElement.getElementsByTagName("imagedata");
    }
    if (imagedataElements.length === 0) return undefined;

    const imagedata = imagedataElements[0];
    if (!imagedata) return undefined;
    
    // Get relationship ID from VML imagedata
    const relationshipId = imagedata.getAttribute("r:id") || imagedata.getAttribute("id");
    if (!relationshipId) return undefined;

    // VML objects often don't have explicit dimensions in the same way as modern drawings
    // They may have style attributes or other dimension properties
    let width: number | undefined;
    let height: number | undefined;
    
    // Try to extract dimensions from style attribute
    const style = objectElement.getAttribute("style");
    if (style) {
      const widthMatch = style.match(/width:\s*([0-9.]+)pt/);
      const heightMatch = style.match(/height:\s*([0-9.]+)pt/);
      
      if (widthMatch && widthMatch[1]) {
        // Convert points to pixels (1 point = 1.33 pixels approximately)
        width = Math.round(parseFloat(widthMatch[1]) * 1.33);
      }
      if (heightMatch && heightMatch[1]) {
        height = Math.round(parseFloat(heightMatch[1]) * 1.33);
      }
    }

    // Extract title or description from imagedata or object
    let name: string | undefined;
    let description: string | undefined;
    
    name = imagedata.getAttribute("title") || objectElement.getAttribute("title") || undefined;
    description = imagedata.getAttribute("alt") || objectElement.getAttribute("alt") || undefined;

    return {
      relationshipId,
      width,
      height,
      name,
      description,
    };
  } catch (error) {
    debug.log(`Error parsing VML object element: ${error}`);
    return undefined;
  }
}

// Get XMLSerializer for both browser and Node.js environments
function getXMLSerializer(): XMLSerializer {
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
    throw new Error(
      "XMLSerializer not available. Please install happy-dom for Node.js environments.",
    );
  }
}

/**
 * Parse document.xml content using proper DOM parsing instead of regex
 * This replaces the problematic regex-based parsing that fails with nested XML
 */
export const parseDocumentXmlWithDom = (
  xmlContent: string,
): Effect.Effect<DocxParagraph[], DocxParseError> =>
  Effect.gen(function* () {
    const paragraphs: DocxParagraph[] = [];
    const wordNamespaceURI = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

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
      const paragraphXml = getXMLSerializer().serializeToString(pElement);
      let fields: DocxField[] | undefined;
      if (paragraphContainsFields(paragraphXml)) {
        const fieldsResult = yield* parseFieldsFromParagraph(paragraphXml);
        if (fieldsResult.length > 0) {
          fields = fieldsResult;
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

      // Extract runs within the paragraph
      const runs: DocxRun[] = [];
      const runElements = pElement.getElementsByTagName("w:r");

      for (const runElement of runElements) {
        // Parse the run content to extract text and special elements in order
        let runText = "";

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
        let imageInfo: { relationshipId: string; width?: number; height?: number; name?: string; description?: string } | undefined;
        
        for (const drawingElement of drawingElements) {
          imageInfo = parseDrawingFromElement(drawingElement);
          if (imageInfo) break; // Use first valid image
        }
        
        // Process VML object elements (legacy images) if no modern drawing found
        if (!imageInfo) {
          const objectElements = runElement.getElementsByTagName("w:object");
          for (const objectElement of objectElements) {
            imageInfo = parseVmlObjectFromElement(objectElement);
            if (imageInfo) break; // Use first valid VML image
          }
        }

        if (runText || imageInfo) {
          // Check for formatting in run properties using getElementsByTagName
          const rPrElements = runElement.getElementsByTagName("w:rPr");
          let bold = false;
          let italic = false;
          let underline = false;

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
                  const color = underlineElement.getAttribute("w:color");

                  if (val) {
                    // If w:val is present, only apply underline if it's not "none" or "0"
                    underline = val !== "none" && val !== "0";
                  } else if (!color) {
                    // If no w:val and no w:color, it's a simple <w:u/> which defaults to single underline
                    underline = true;
                  }
                  // If w:color but no w:val, it's likely for color styling only, not underline
                }
              }
            }
          }

          runs.push({
            text: runText || "", // Empty text for image-only runs
            ...(bold && { bold }),
            ...(italic && { italic }),
            ...(underline && { underline }),
            ...(imageInfo && { image: imageInfo }),
          });
        }
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
