import { Effect } from "effect";
import { debug } from "../../common/debug";
import { type PptxContent, type PptxDocument, type PptxSlide, readPptx } from "./pptx-reader";

// Convert PPTX document to Markdown
export const convertPptxToMarkdown = (document: PptxDocument): string => {
  const lines: string[] = [];

  // Add metadata if available
  if (document.metadata?.title) {
    lines.push(`# ${document.metadata.title}`);
    lines.push("");
  }

  // Convert each slide
  document.slides.forEach((slide, index) => {
    // Add slide separator (except for first slide)
    if (index > 0) {
      lines.push("");
      lines.push("---");
      lines.push("");
    }

    // Convert slide content
    const slideMarkdown = convertSlideToMarkdown(slide);
    lines.push(slideMarkdown);
  });

  // Remove trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines.join("\n");
};

// Convert a single slide to Markdown
const convertSlideToMarkdown = (slide: PptxSlide): string => {
  const lines: string[] = [];

  // Add slide number as comment
  lines.push(`<!-- Slide ${slide.slideNumber} -->`);

  // Process content
  slide.content.forEach((content, index) => {
    const markdown = convertContentToMarkdown(content);
    if (markdown) {
      // Add spacing between content blocks
      if (index > 0 && content.type !== "bullet") {
        lines.push("");
      }
      lines.push(markdown);
    }
  });

  return lines.join("\n");
};

// Convert content block to Markdown
const convertContentToMarkdown = (content: PptxContent): string => {
  switch (content.type) {
    case "title":
      return `## ${content.text || ""}`;

    case "bullet": {
      const indent = "  ".repeat(content.level || 0);
      return `${indent}- ${content.text || ""}`;
    }

    case "text":
      return content.text || "";

    case "image":
      return content.src ? `![Image](${content.src})` : "";

    default:
      return "";
  }
};

// Main function to convert PPTX buffer to Markdown
export const pptxToMarkdown = (
  buffer: ArrayBuffer,
): Effect.Effect<string, import("./pptx-reader").PptxParseError> =>
  Effect.gen(function* () {
    debug.log("Converting PPTX to Markdown...");

    // Read and parse the PPTX file
    const document = yield* readPptx(buffer);

    // Convert to Markdown
    const markdown = convertPptxToMarkdown(document);

    debug.log("Markdown length:", markdown.length);
    debug.log(`Converted ${document.slides.length} slides`);

    return markdown;
  });
