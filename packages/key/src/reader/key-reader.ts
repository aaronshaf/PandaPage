import { Effect } from "effect";
import { debug } from "@browser-document-viewer/shared-utils/debug";
import type { KeyDocument, KeySlide, KeyContent } from "../types";

// Error types
export class KeyParseError {
  readonly _tag = "KeyParseError";
  constructor(public readonly message: string) {}
}

// Read and parse Keynote file
export const readKey = (_buffer: ArrayBuffer): Effect.Effect<KeyDocument, KeyParseError> =>
  Effect.gen(function* () {
    debug.log("Reading Keynote file...");

    // TODO: Implement Keynote file parsing
    // Keynote files use binary IWA format (Protocol Buffers)
    // This is much more complex than XML-based formats

    return yield* Effect.fail(new KeyParseError("Keynote support is not yet implemented"));
  });
