import * as S from "@effect/schema/Schema";
import { Effect } from "effect";
import { debug } from "../../common/debug";

// Error types
export class PagesParseError {
  readonly _tag = "PagesParseError";
  constructor(public readonly message: string) {}
}

// Basic Pages structure types (similar to DOCX but for Pages)
export interface PagesParagraph {
  type: "paragraph";
  style?: string;
  runs: PagesRun[];
}

export interface PagesRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface PagesDocument {
  paragraphs: PagesParagraph[];
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
