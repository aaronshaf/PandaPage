import { Effect } from "effect";
import { debug } from "../../common/debug";
import {
  parseFieldsFromParagraph,
  paragraphContainsFields,
  type DocxField,
} from "./form-field-parser";
import { parseDocumentXmlWithDom, parseNumberingXmlWithDom } from "./dom-parser";

// Error types
export class DocxParseError {
  readonly _tag = "DocxParseError";
  constructor(public readonly message: string) {}
}

// Basic DOCX structure types
export interface DocxParagraph {
  type: "paragraph";
  style?: string;
  runs: DocxRun[];
  // List properties
  numId?: string;
  ilvl?: number;
  // Field properties
  fields?: DocxField[];
}

export interface DocxRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  hyperlink?: string;
}

export interface DocxDocument {
  paragraphs: DocxParagraph[];
  // Numbering definitions
  numbering?: DocxNumbering;
}

// Numbering types
export interface DocxNumbering {
  // Map of numId to abstractNumId
  instances: Map<string, string>;
  // Map of abstractNumId to format details
  abstractFormats: Map<string, DocxAbstractFormat>;
}

export interface DocxAbstractFormat {
  levels: Map<number, DocxLevelFormat>;
}

export interface DocxLevelFormat {
  numFmt: string; // bullet, decimal, upperLetter, etc.
  lvlText: string; // Format pattern like "•" or "%1."
}

// Read and parse DOCX file
export const readDocx = (buffer: ArrayBuffer): Effect.Effect<DocxDocument, DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Reading DOCX file...");

    try {
      // DOCX files are ZIP archives
      // We need to unzip and parse the document.xml
      const { unzipSync, strFromU8 } = yield* Effect.tryPromise({
        try: () => import("fflate"),
        catch: (error) => new DocxParseError(`Failed to load fflate library: ${error}`),
      });

      // Convert ArrayBuffer to Uint8Array
      const uint8Array = new Uint8Array(buffer);

      // Unzip the DOCX file
      const unzipped = unzipSync(uint8Array);

      // Get the main document content
      // Try standard location first, then fallback to root level for non-standard files
      let documentXml = unzipped["word/document.xml"];
      if (!documentXml) {
        documentXml = unzipped["document.xml"];
      }
      if (!documentXml) {
        return yield* Effect.fail(new DocxParseError("No document.xml found in DOCX file"));
      }

      // Convert to string
      const xmlContent = strFromU8(documentXml);
      debug.log("Document XML length:", xmlContent.length);

      // Try to get numbering definitions
      let numbering: DocxNumbering | undefined;
      let numberingXml = unzipped["word/numbering.xml"];
      if (!numberingXml) {
        numberingXml = unzipped["numbering.xml"];
      }
      if (numberingXml) {
        const numberingContent = strFromU8(numberingXml);
        numbering = yield* parseNumberingXmlWithDom(numberingContent);
      }

      // Parse the XML to extract text using DOM parser instead of regex
      const paragraphs = yield* parseDocumentXmlWithDom(xmlContent);

      return { paragraphs, numbering };
    } catch (error) {
      return yield* Effect.fail(new DocxParseError(`Failed to read DOCX: ${error}`));
    }
  });

// Parse document.xml content using DOM-based parsing
export const parseDocumentXml = (
  xmlContent: string,
): Effect.Effect<DocxParagraph[], DocxParseError> =>
  Effect.gen(function* () {
    // Use DOM-based parser for reliable XML parsing
    return yield* parseDocumentXmlWithDom(xmlContent);
  });

// Simple paragraph parser helper
export const parseParagraph = (pElement: Element): DocxParagraph => {
  const runs: DocxRun[] = [];
  const runElements = pElement.querySelectorAll("r");

  for (const runElement of runElements) {
    const textElements = runElement.querySelectorAll("t");
    for (const textElement of textElements) {
      // Check for underline with proper attribute analysis
      const underlineElement = runElement.querySelector("u");
      let underline = false;
      if (underlineElement) {
        const val = underlineElement.getAttribute("val");
        const color = underlineElement.getAttribute("color");

        if (val) {
          // If w:val is present, only apply underline if it's not "none" or "0"
          underline = val !== "none" && val !== "0";
        } else if (!color) {
          // If no w:val and no w:color, it's a simple <w:u/> which defaults to single underline
          underline = true;
        }
        // If w:color but no w:val, it's likely for color styling only, not underline
      }

      runs.push({
        text: textElement.textContent || "",
        bold: !!runElement.querySelector("b"),
        italic: !!runElement.querySelector("i"),
        underline,
      });
    }
  }

  // Extract style
  const styleElement = pElement.querySelector("pPr pStyle");
  const style = styleElement?.getAttribute("val") || undefined;

  // Extract numbering properties
  const numPrElement = pElement.querySelector("pPr numPr");
  const numIdElement = numPrElement?.querySelector("numId");
  const ilvlElement = numPrElement?.querySelector("ilvl");

  return {
    type: "paragraph" as const,
    style,
    runs,
    numId: numIdElement?.getAttribute("val") || undefined,
    ilvl: ilvlElement ? parseInt(ilvlElement.getAttribute("val") || "0", 10) : undefined,
  };
};

// Parse numbering.xml content
export const parseNumbering = (numberingRoot: Element): DocxNumbering => {
  const instances = new Map<string, string>();
  const abstractFormats = new Map<string, DocxAbstractFormat>();

  // Parse abstract numbering definitions
  const abstractNumElements = numberingRoot.getElementsByTagName
    ? numberingRoot.getElementsByTagName("w:abstractNum")
    : numberingRoot.querySelectorAll("abstractNum");

  for (const abstractElement of abstractNumElements) {
    const abstractNumId =
      abstractElement.getAttribute("w:abstractNumId") ||
      abstractElement.getAttribute("abstractNumId");
    if (!abstractNumId) continue;

    const levels = new Map<number, DocxLevelFormat>();

    // Parse levels within this abstract format
    const levelElements = abstractElement.getElementsByTagName
      ? abstractElement.getElementsByTagName("w:lvl")
      : abstractElement.querySelectorAll("lvl");

    for (const levelElement of levelElements) {
      const ilvlStr = levelElement.getAttribute("w:ilvl") || levelElement.getAttribute("ilvl");
      if (!ilvlStr) continue;

      const ilvl = parseInt(ilvlStr, 10);

      // Extract numFmt
      const numFmtElement = levelElement.getElementsByTagName
        ? levelElement.getElementsByTagName("w:numFmt")[0]
        : levelElement.querySelector("numFmt");
      const numFmt =
        numFmtElement?.getAttribute("w:val") || numFmtElement?.getAttribute("val") || "bullet";

      // Extract lvlText
      const lvlTextElement = levelElement.getElementsByTagName
        ? levelElement.getElementsByTagName("w:lvlText")[0]
        : levelElement.querySelector("lvlText");
      const lvlText =
        lvlTextElement?.getAttribute("w:val") || lvlTextElement?.getAttribute("val") || "•";

      levels.set(ilvl, { numFmt, lvlText });
    }

    if (levels.size > 0) {
      abstractFormats.set(abstractNumId, { levels });
    }
  }

  // Parse numbering instances
  const numElements = numberingRoot.getElementsByTagName
    ? numberingRoot.getElementsByTagName("w:num")
    : numberingRoot.querySelectorAll("num");

  for (const numElement of numElements) {
    const numId = numElement.getAttribute("w:numId") || numElement.getAttribute("numId");
    if (!numId) continue;

    // Extract abstractNumId reference
    const abstractNumIdElement = numElement.getElementsByTagName
      ? numElement.getElementsByTagName("w:abstractNumId")[0]
      : numElement.querySelector("abstractNumId");
    const abstractNumId =
      abstractNumIdElement?.getAttribute("w:val") || abstractNumIdElement?.getAttribute("val");

    if (abstractNumId) {
      instances.set(numId, abstractNumId);
    }
  }

  debug.log(
    `Parsed ${instances.size} numbering instances and ${abstractFormats.size} abstract formats`,
  );

  return { instances, abstractFormats };
};
