import * as Schema from "@effect/schema/Schema";

// Input types - using Web APIs
export type PdfInput = 
  | File 
  | Blob 
  | ArrayBuffer 
  | ReadableStream<Uint8Array>
  | URL
  | string; // file path or URL

// PDF Metadata Schema
export const PdfMetadata = Schema.Struct({
  title: Schema.optional(Schema.String),
  author: Schema.optional(Schema.String),
  subject: Schema.optional(Schema.String),
  keywords: Schema.optional(Schema.String),
  creator: Schema.optional(Schema.String),
  producer: Schema.optional(Schema.String),
  creationDate: Schema.optional(Schema.Date),
  modificationDate: Schema.optional(Schema.Date),
  pageCount: Schema.Number,
});

export type PdfMetadata = Schema.Schema.Type<typeof PdfMetadata>;

// Markdown output with front matter
export const MarkdownOutput = Schema.Struct({
  frontMatter: PdfMetadata,
  content: Schema.String,
  raw: Schema.String, // full markdown with front matter
});

export type MarkdownOutput = Schema.Schema.Type<typeof MarkdownOutput>;

// Processing options
export const ProcessingOptions = Schema.Struct({
  includeMetadata: Schema.optionalWith(Schema.Boolean, {
    default: () => true
  }),
  extractImages: Schema.optionalWith(Schema.Boolean, {
    default: () => false
  }),
  preserveFormatting: Schema.optionalWith(Schema.Boolean, {
    default: () => true
  }),
});

export type ProcessingOptions = Schema.Schema.Type<typeof ProcessingOptions>;