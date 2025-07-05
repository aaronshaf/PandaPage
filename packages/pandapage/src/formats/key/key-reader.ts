import * as S from "@effect/schema/Schema";
import { Effect } from "effect";
import { debug } from "../../common/debug";

// Error types
export class KeyParseError extends S.TaggedError<KeyParseError>()("KeyParseError") {
  readonly message!: string;
}

// Basic Keynote structure types
export interface KeySlide {
  type: "slide";
  slideNumber: number;
  title?: string;
  content: KeyContent[];
}

export interface KeyContent {
  type: "text" | "title" | "bullet" | "image";
  text?: string;
  level?: number; // For bullets
  src?: string; // For images
}

export interface KeyDocument {
  slides: KeySlide[];
  metadata?: {
    title?: string;
    author?: string;
    slideCount?: number;
  };
}

// Read and parse Keynote file
export const readKey = (buffer: ArrayBuffer): Effect.Effect<KeyDocument, KeyParseError> =>
  Effect.gen(function* () {
    debug.log("Reading Keynote file...");

    // TODO: Implement Keynote file parsing
    // Keynote files use binary IWA format (Protocol Buffers)
    // This is much more complex than XML-based formats

    return yield* Effect.fail(
      new KeyParseError({
        message: "Keynote support is not yet implemented",
      }),
    );
  });
