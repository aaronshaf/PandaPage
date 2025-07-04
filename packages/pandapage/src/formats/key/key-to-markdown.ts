import { Effect } from "effect";
import { debug } from "../../common/debug";
import { type KeyDocument, readKey } from "./key-reader";

// Convert Keynote document to Markdown
export const convertKeyToMarkdown = (_document: KeyDocument): string => {
  debug.log("Converting Keynote document to Markdown...");

  // TODO: Implement Keynote to Markdown conversion
  // This will be similar to PPTX conversion but adapted for Keynote structure

  return "# Keynote Support\n\nComing soon...";
};

// Main function to convert Keynote buffer to Markdown
export const keyToMarkdown = (
  buffer: ArrayBuffer,
): Effect.Effect<string, import("./key-reader").KeyParseError> =>
  Effect.gen(function* () {
    debug.log("Converting Keynote to Markdown...");

    // Read and parse the Keynote file
    const document = yield* readKey(buffer);

    // Convert to Markdown
    const markdown = convertKeyToMarkdown(document);

    debug.log("Markdown length:", markdown.length);

    return markdown;
  });
