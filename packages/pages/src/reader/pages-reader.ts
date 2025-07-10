import { Effect } from "effect";
import { debug } from "@browser-document-viewer/shared-utils/debug";
import type { PagesDocument, PagesParagraph, PagesRun } from "../types";

// Error types
export class PagesParseError {
  readonly _tag = "PagesParseError";
  constructor(public readonly message: string) {}
}

// Read and parse Apple Pages file
export const readPages = (_buffer: ArrayBuffer): Effect.Effect<PagesDocument, PagesParseError> =>
  Effect.gen(function* () {
    debug.log("Reading Apple Pages file...");

    // TODO: Implement Pages file parsing
    // Apple Pages files are also ZIP archives but with different structure

    return yield* Effect.fail(
      new PagesParseError("Apple Pages support is not yet implemented"),
    );
  });
