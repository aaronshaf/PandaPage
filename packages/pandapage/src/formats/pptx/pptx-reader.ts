import * as S from "@effect/schema/Schema";
import { Effect } from "effect";
import { debug } from "../../common/debug";

// Error types
export class PptxParseError extends S.TaggedError<PptxParseError>()("PptxParseError") {
  readonly message!: string;
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
        catch: (error) =>
          new PptxParseError({
            message: `Failed to load fflate library: ${error}`,
          }),
      });

      // Convert ArrayBuffer to Uint8Array
      const uint8Array = new Uint8Array(buffer);

      // Unzip the PPTX file
      const unzipped = unzipSync(uint8Array);

      // Get list of slides
      const slideFiles = Object.keys(unzipped)
        .filter((path) => path.match(/^ppt\/slides\/slide\d+\.xml$/))
        .sort((a, b) => {
          const numA = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || "0");
          const numB = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] || "0");
          return numA - numB;
        });

      debug.log(`Found ${slideFiles.length} slides`);

      // Parse each slide
      const slides: PptxSlide[] = [];

      for (let i = 0; i < slideFiles.length; i++) {
        const slideFile = slideFiles[i];
        const slideXml = unzipped[slideFile];

        if (slideXml) {
          const xmlContent = strFromU8(slideXml);
          const slide = yield* parseSlideXml(xmlContent, i + 1);
          slides.push(slide);
        }
      }

      // Try to get presentation metadata
      let metadata: PptxDocument["metadata"];
      const appPropsXml = unzipped["docProps/app.xml"];
      if (appPropsXml) {
        const appPropsContent = strFromU8(appPropsXml);
        metadata = yield* parsePresentationProps(appPropsContent);
        metadata.slideCount = slides.length;
      }

      return { slides, metadata };
    } catch (error) {
      return yield* Effect.fail(
        new PptxParseError({
          message: `Failed to read PPTX: ${error}`,
        }),
      );
    }
  });

// Parse a single slide XML
const parseSlideXml = (
  xmlContent: string,
  slideNumber: number,
): Effect.Effect<PptxSlide, PptxParseError> =>
  Effect.gen(function* () {
    const content: PptxContent[] = [];
    let title: string | undefined;

    // Extract text from shapes
    // Match all shape text bodies
    const shapeRegex = /<p:sp[^>]*>(.*?)<\/p:sp>/gs;
    let shapeMatch;

    while ((shapeMatch = shapeRegex.exec(xmlContent)) !== null) {
      const shapeContent = shapeMatch[1];

      // Check if this is a title shape
      const isTitle =
        /<p:ph[^>]*type="title"/.test(shapeContent) ||
        /<p:ph[^>]*type="ctrTitle"/.test(shapeContent);

      // Extract paragraphs from the shape
      const paragraphRegex = /<a:p[^>]*>(.*?)<\/a:p>/gs;
      let paragraphMatch;

      while ((paragraphMatch = paragraphRegex.exec(shapeContent)) !== null) {
        const paragraphContent = paragraphMatch[1];

        // Check for bullet/list properties
        const hasBullet =
          /<a:buChar/.test(paragraphContent) || /<a:buNone/.test(paragraphContent) === false;

        // Extract text runs
        const textRegex = /<a:t[^>]*>([^<]*)<\/a:t>/g;
        let textMatch;
        const paragraphTexts: string[] = [];

        while ((textMatch = textRegex.exec(paragraphContent)) !== null) {
          paragraphTexts.push(textMatch[1]);
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

// Parse presentation properties
const parsePresentationProps = (
  xmlContent: string,
): Effect.Effect<PptxDocument["metadata"], PptxParseError> =>
  Effect.gen(function* () {
    const metadata: PptxDocument["metadata"] = {};

    // Extract title
    const titleMatch = xmlContent.match(/<dc:title>([^<]*)<\/dc:title>/);
    if (titleMatch) {
      metadata.title = titleMatch[1];
    }

    // Extract author
    const authorMatch = xmlContent.match(/<dc:creator>([^<]*)<\/dc:creator>/);
    if (authorMatch) {
      metadata.author = authorMatch[1];
    }

    return metadata;
  });
