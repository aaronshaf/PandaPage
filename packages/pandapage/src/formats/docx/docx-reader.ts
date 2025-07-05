import * as S from "@effect/schema/Schema";
import { Effect } from "effect";
import { debug } from "../../common/debug";

// Error types
export class DocxParseError extends S.TaggedError<DocxParseError>()("DocxParseError") {
  readonly message!: string;
}

// Basic DOCX structure types
export interface DocxParagraph {
  type: "paragraph";
  style?: string;
  runs: DocxRun[];
  // List properties
  numId?: string;
  ilvl?: number;
}

export interface DocxRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
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
        catch: (error) =>
          new DocxParseError({ message: `Failed to load fflate library: ${error}` }),
      });

      // Convert ArrayBuffer to Uint8Array
      const uint8Array = new Uint8Array(buffer);

      // Unzip the DOCX file
      const unzipped = unzipSync(uint8Array);

      // Get the main document content
      const documentXml = unzipped["word/document.xml"];
      if (!documentXml) {
        return yield* Effect.fail(
          new DocxParseError({ message: "No word/document.xml found in DOCX file" }),
        );
      }

      // Convert to string
      const xmlContent = strFromU8(documentXml);
      debug.log("Document XML length:", xmlContent.length);

      // Try to get numbering definitions
      let numbering: DocxNumbering | undefined;
      const numberingXml = unzipped["word/numbering.xml"];
      if (numberingXml) {
        const numberingContent = strFromU8(numberingXml);
        numbering = yield* parseNumberingXml(numberingContent);
      }

      // Parse the XML to extract text
      const paragraphs = yield* parseDocumentXml(xmlContent);

      return { paragraphs, numbering };
    } catch (error) {
      return yield* Effect.fail(
        new DocxParseError({
          message: `Failed to read DOCX: ${error}`,
        }),
      );
    }
  });

// Parse document.xml content
const parseDocumentXml = (xmlContent: string): Effect.Effect<DocxParagraph[], DocxParseError> =>
  Effect.gen(function* () {
    const paragraphs: DocxParagraph[] = [];

    // Simple regex-based XML parsing for now
    // In production, we'd use a proper XML parser

    // Match all paragraphs
    const paragraphRegex = /<w:p[^>]*>(.*?)<\/w:p>/gs;
    let paragraphMatch;

    while ((paragraphMatch = paragraphRegex.exec(xmlContent)) !== null) {
      const paragraphContent = paragraphMatch[1];

      // Extract paragraph style
      const styleMatch = paragraphContent.match(/<w:pStyle w:val="([^"]+)"/);
      const style = styleMatch ? styleMatch[1] : undefined;

      // Extract list properties
      const numIdMatch = paragraphContent.match(/<w:numId w:val="([^"]+)"/);
      const numId = numIdMatch ? numIdMatch[1] : undefined;

      const ilvlMatch = paragraphContent.match(/<w:ilvl w:val="([^"]+)"/);
      const ilvl = ilvlMatch ? parseInt(ilvlMatch[1], 10) : undefined;

      // Extract runs within the paragraph
      const runs: DocxRun[] = [];
      const runRegex = /<w:r[^>]*>(.*?)<\/w:r>/gs;
      let runMatch;

      while ((runMatch = runRegex.exec(paragraphContent)) !== null) {
        const runContent = runMatch[1];

        // Extract text
        const textMatch = runContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/);
        if (textMatch) {
          const text = textMatch[1];

          // Check for formatting
          const bold = /<w:b\s+w:val="1"/.test(runContent);
          const italic = /<w:i\s+w:val="1"/.test(runContent);
          const underline = /<w:u\s/.test(runContent);

          runs.push({
            text,
            ...(bold && { bold }),
            ...(italic && { italic }),
            ...(underline && { underline }),
          });
        }
      }

      if (runs.length > 0) {
        paragraphs.push({
          type: "paragraph",
          style,
          runs,
          ...(numId && { numId }),
          ...(ilvl !== undefined && { ilvl }),
        });
      }
    }

    debug.log(`Parsed ${paragraphs.length} paragraphs`);

    return paragraphs;
  });

// Parse numbering.xml content
const parseNumberingXml = (xmlContent: string): Effect.Effect<DocxNumbering, DocxParseError> =>
  Effect.gen(function* () {
    const instances = new Map<string, string>();
    const abstractFormats = new Map<string, DocxAbstractFormat>();
    const styleLinks = new Map<string, string>(); // Track style links between abstract formats

    // First pass: Parse abstract numbering definitions and collect style links
    const abstractNumRegex =
      /<w:abstractNum w:abstractNumId="([^"]+)"[^>]*>(.*?)<\/w:abstractNum>/gs;
    let abstractMatch;

    while ((abstractMatch = abstractNumRegex.exec(xmlContent)) !== null) {
      const abstractNumId = abstractMatch[1];
      const abstractContent = abstractMatch[2];

      // Check for style links (numStyleLink or styleLink)
      const numStyleLinkMatch = abstractContent.match(/<w:numStyleLink w:val="([^"]+)"/);
      const styleLinkMatch = abstractContent.match(/<w:styleLink w:val="([^"]+)"/);

      if (numStyleLinkMatch || styleLinkMatch) {
        // This abstract format references another one via style
        styleLinks.set(abstractNumId, numStyleLinkMatch?.[1] || styleLinkMatch?.[1] || "");
      }

      // Parse levels regardless of whether there's a style link
      const levels = new Map<number, DocxLevelFormat>();

      // Parse levels
      const levelRegex = /<w:lvl w:ilvl="([^"]+)"[^>]*>(.*?)<\/w:lvl>/gs;
      let levelMatch;

      while ((levelMatch = levelRegex.exec(abstractContent)) !== null) {
        const ilvl = parseInt(levelMatch[1], 10);
        const levelContent = levelMatch[2];

        // Extract numFmt
        const numFmtMatch = levelContent.match(/<w:numFmt w:val="([^"]+)"/);
        const numFmt = numFmtMatch ? numFmtMatch[1] : "decimal";

        // Extract lvlText
        const lvlTextMatch = levelContent.match(/<w:lvlText w:val="([^"]+)"/);
        const lvlText = lvlTextMatch ? lvlTextMatch[1] : "";

        levels.set(ilvl, { numFmt, lvlText });
      }

      if (levels.size > 0) {
        abstractFormats.set(abstractNumId, { levels });
      }
    }

    // Parse numbering instances
    const numRegex = /<w:num w:numId="([^"]+)"[^>]*>(.*?)<\/w:num>/gs;
    let numMatch;

    while ((numMatch = numRegex.exec(xmlContent)) !== null) {
      const numId = numMatch[1];
      const numContent = numMatch[2];

      // Extract abstractNumId reference
      const abstractNumIdMatch = numContent.match(/<w:abstractNumId w:val="([^"]+)"/);
      if (abstractNumIdMatch) {
        let targetAbstractId = abstractNumIdMatch[1];

        // If this abstract ID has a style link, resolve it
        if (styleLinks.has(targetAbstractId)) {
          // Look for the actual abstract format with levels
          // In the pattern we observed, it's typically the next ID (e.g., 0->1, 2->3, 4->5)
          const nextId = String(parseInt(targetAbstractId) + 1);
          if (abstractFormats.has(nextId)) {
            targetAbstractId = nextId;
          }
        }

        instances.set(numId, targetAbstractId);
      }
    }

    debug.log(
      `Parsed ${instances.size} numbering instances and ${abstractFormats.size} abstract formats`,
    );
    debug.log(`Found ${styleLinks.size} style links`);

    return { instances, abstractFormats };
  });
