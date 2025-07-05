import { Effect } from "effect";
import { debug } from "../../common/debug";
import { type PagesDocument, readPages } from "./pages-reader";

// Convert Apple Pages document to Markdown
export const convertPagesToMarkdown = (document: PagesDocument): string => {
  debug.log("Converting Pages document to Markdown...");

  // TODO: Implement Pages to Markdown conversion
  // This will be similar to DOCX conversion but adapted for Pages structure

  return "# Apple Pages Support\n\nComing soon...";
};

// Main function to convert Pages buffer to Markdown
export const pagesToMarkdown = (
  buffer: ArrayBuffer,
): Effect.Effect<string, import("./pages-reader").PagesParseError> =>
  Effect.gen(function* () {
    debug.log("Converting Apple Pages to Markdown...");

    // Read and parse the Pages file
    const document = yield* readPages(buffer);

    // Convert to Markdown
    const markdown = convertPagesToMarkdown(document);

    debug.log("Markdown length:", markdown.length);

    return markdown;
  });
