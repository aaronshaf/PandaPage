import * as S from "@effect/schema/Schema";
import { Effect } from "effect";
import { 
  DocxTableBordersSchema, 
  DocxTablePropertiesSchema, 
  DocxTableRowPropertiesSchema, 
  DocxTableCellPropertiesSchema,
  DocxParseError 
} from "./types";

/**
 * Validate table borders using Effect Schema
 */
export const validateTableBorders = (borders: unknown): Effect.Effect<S.Schema.Type<typeof DocxTableBordersSchema>, DocxParseError> =>
  Effect.gen(function* () {
    try {
      return yield* S.decodeUnknown(DocxTableBordersSchema)(borders);
    } catch (error) {
      return yield* Effect.fail(new DocxParseError(`Invalid table borders: ${error}`));
    }
  });

/**
 * Validate table properties using Effect Schema
 */
export const validateTableProperties = (properties: unknown): Effect.Effect<S.Schema.Type<typeof DocxTablePropertiesSchema>, DocxParseError> =>
  Effect.gen(function* () {
    try {
      return yield* S.decodeUnknown(DocxTablePropertiesSchema)(properties);
    } catch (error) {
      return yield* Effect.fail(new DocxParseError(`Invalid table properties: ${error}`));
    }
  });

/**
 * Validate table row properties using Effect Schema
 */
export const validateTableRowProperties = (properties: unknown): Effect.Effect<S.Schema.Type<typeof DocxTableRowPropertiesSchema>, DocxParseError> =>
  Effect.gen(function* () {
    try {
      return yield* S.decodeUnknown(DocxTableRowPropertiesSchema)(properties);
    } catch (error) {
      return yield* Effect.fail(new DocxParseError(`Invalid table row properties: ${error}`));
    }
  });

/**
 * Validate table cell properties using Effect Schema
 */
export const validateTableCellProperties = (properties: unknown): Effect.Effect<S.Schema.Type<typeof DocxTableCellPropertiesSchema>, DocxParseError> =>
  Effect.gen(function* () {
    try {
      return yield* S.decodeUnknown(DocxTableCellPropertiesSchema)(properties);
    } catch (error) {
      return yield* Effect.fail(new DocxParseError(`Invalid table cell properties: ${error}`));
    }
  });

/**
 * Safe parsing utility that validates and provides defaults
 */
export const parseWithDefaults = <T>(
  schema: S.Schema<T, unknown>,
  data: unknown,
  defaults: T
): Effect.Effect<T, DocxParseError> =>
  Effect.gen(function* () {
    if (!data) {
      return defaults;
    }
    
    try {
      return yield* S.decodeUnknown(schema)(data);
    } catch (error) {
      // Log the error but return defaults to be resilient
      console.warn(`Schema validation failed, using defaults:`, error);
      return defaults;
    }
  });