import { Effect } from "effect";
import { debug } from "../../common/debug";
import { parseXmlString } from "../../common/xml-parser";

// Error types
export class PptxParseError {
  readonly _tag = "PptxParseError";
  constructor(public readonly message: string) {}
}

// Basic PPTX structure types
export interface PptxSlide {
  type: "slide";
  slideNumber: number;
  title?: string;
  content: PptxContent[];
}

export interface PptxContent {
  type: "text" | "title" | "bullet" | "image";
  text?: string;
  level?: number; // For bullets
  src?: string; // For images
}

export interface PptxDocument {
  slides: PptxSlide[];
  metadata?: {
    title?: string;
    author?: string;
    slideCount?: number;
  };
}

// Read and parse PPTX file
export const readPptx = (buffer: ArrayBuffer): Effect.Effect<PptxDocument, PptxParseError> =>
  Effect.gen(function* () {
    debug.log("Reading PPTX file...");

    try {
      // PPTX files are ZIP archives
      const { unzipSync, strFromU8 } = yield* Effect.tryPromise({
        try: () => import("fflate"),
        catch: (error) => new PptxParseError(`Failed to load fflate library: ${error}`),
      });

      // Convert ArrayBuffer to Uint8Array
      const uint8Array = new Uint8Array(buffer);

      // Unzip the PPTX file
      const unzipped = unzipSync(uint8Array);

      // Get list of slides using non-regex approach
      const slideFiles = Object.keys(unzipped)
        .filter((path) => {
          return path.startsWith("ppt/slides/slide") && path.endsWith(".xml");
        })
        .sort((a, b) => {
          // Extract slide number from filename
          const getSlideNumber = (filename: string): number => {
            const parts = filename.split("/");
            const slideFile = parts[parts.length - 1] || "";
            const slidePrefix = "slide";
            const xmlSuffix = ".xml";

            if (slideFile.startsWith(slidePrefix) && slideFile.endsWith(xmlSuffix)) {
              const numberPart = slideFile.slice(slidePrefix.length, -xmlSuffix.length);
              const num = parseInt(numberPart, 10);
              return isNaN(num) ? 0 : num;
            }
            return 0;
          };

          return getSlideNumber(a) - getSlideNumber(b);
        });

      debug.log(`Found ${slideFiles.length} slides`);

      // Parse each slide
      const slides: PptxSlide[] = [];

      for (let i = 0; i < slideFiles.length; i++) {
        const slideFile = slideFiles[i];
        if (!slideFile) continue;

        const slideXml = unzipped[slideFile];
        if (slideXml) {
          const xmlContent = strFromU8(slideXml);
          const slide = yield* parseSlideXml(xmlContent, i + 1);
          slides.push(slide);
        }
      }

      // Try to get presentation metadata
      const metadata: PptxDocument["metadata"] = {};
      const appPropsXml = unzipped["docProps/app.xml"];
      if (appPropsXml) {
        const appPropsContent = strFromU8(appPropsXml);
        const props = yield* parsePresentationProps(appPropsContent);
        Object.assign(metadata, props);
        metadata.slideCount = slides.length;
      }

      return { slides, metadata };
    } catch (error) {
      return yield* Effect.fail(new PptxParseError(`Failed to read PPTX: ${error}`));
    }
  });

// Parse a single slide XML using DOM parsing
const parseSlideXml = (
  xmlContent: string,
  slideNumber: number,
): Effect.Effect<PptxSlide, PptxParseError> =>
  Effect.gen(function* () {
    const content: PptxContent[] = [];
    let title: string | undefined;

    // Add namespace declarations if missing
    let xmlContentWithNs = xmlContent;
    if (!xmlContentWithNs.includes("xmlns:p=")) {
      xmlContentWithNs = xmlContentWithNs.replace(
        /<p:sld([^>]*)>/,
        '<p:sld$1 xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">',
      );
    }

    // Parse XML with DOM parser - handle invalid XML gracefully
    const parseResult = yield* parseXmlString(xmlContentWithNs)
      .pipe(Effect.mapError(() => null))
      .pipe(Effect.catchAll(() => Effect.succeed(null)));

    if (!parseResult) {
      // If XML parsing failed, return slide with empty content
      return {
        type: "slide",
        slideNumber,
        title,
        content,
      };
    }

    const doc = parseResult;

    // Get all shape elements
    const shapes = doc.getElementsByTagName("p:sp");

    for (const shape of shapes) {
      // Check if this is a title shape by looking for placeholder type
      const placeholders = shape.getElementsByTagName("p:ph");
      const isTitle = Array.from(placeholders).some((ph) => {
        const type = ph.getAttribute("type");
        return type === "title" || type === "ctrTitle";
      });

      // Get all paragraphs in this shape
      const paragraphs = shape.getElementsByTagName("a:p");

      for (const paragraph of paragraphs) {
        // Check for bullet properties
        const bulletChars = paragraph.getElementsByTagName("a:buChar");
        const bulletNone = paragraph.getElementsByTagName("a:buNone");
        const hasBullet = bulletChars.length > 0 || bulletNone.length === 0;

        // Extract text from all text runs
        const textElements = paragraph.getElementsByTagName("a:t");
        const paragraphTexts: string[] = [];

        for (const textElement of textElements) {
          const text = textElement.textContent;
          if (text) {
            paragraphTexts.push(text);
          }
        }

        const fullText = paragraphTexts.join("");

        if (fullText.trim()) {
          if (isTitle && !title) {
            title = fullText;
            content.push({
              type: "title",
              text: fullText,
            });
          } else if (hasBullet) {
            content.push({
              type: "bullet",
              text: fullText,
              level: 0, // TODO: Extract actual level from XML
            });
          } else {
            content.push({
              type: "text",
              text: fullText,
            });
          }
        }
      }
    }

    return {
      type: "slide",
      slideNumber,
      title,
      content,
    };
  });

// Parse presentation properties using DOM parsing
const parsePresentationProps = (
  xmlContent: string,
): Effect.Effect<PptxDocument["metadata"], PptxParseError> =>
  Effect.gen(function* () {
    const metadata: PptxDocument["metadata"] = {};

    // Parse XML with DOM parser
    const doc = yield* parseXmlString(xmlContent).pipe(
      Effect.mapError(
        (error) =>
          new PptxParseError(`Failed to parse presentation properties XML: ${error.message}`),
      ),
    );

    // Extract title
    const titleElements = doc.getElementsByTagName("dc:title");
    if (titleElements.length > 0) {
      const titleText = titleElements[0]?.textContent;
      if (titleText !== null && titleText !== undefined) {
        metadata.title = titleText;
      }
    }

    // Extract author
    const authorElements = doc.getElementsByTagName("dc:creator");
    if (authorElements.length > 0) {
      const authorText = authorElements[0]?.textContent;
      if (authorText !== null && authorText !== undefined) {
        metadata.author = authorText;
      }
    }

    return metadata;
  });
