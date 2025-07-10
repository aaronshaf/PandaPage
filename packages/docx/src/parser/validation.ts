import { Effect } from "effect";
import type { 
  DocxTableBorders, 
  DocxTableProperties, 
  DocxTableRowProperties, 
  DocxTableCellProperties
} from "../types";
import { DocxParseError } from "../reader/docx-reader";

/**
 * Validate table borders with simple validation
 */
export const validateTableBorders = (borders: unknown): Effect.Effect<DocxTableBorders, DocxParseError> =>
  Effect.try({
    try: () => {
      if (!borders || typeof borders !== 'object') {
        return {};
      }
      return borders as DocxTableBorders;
    },
    catch: (error) => new DocxParseError(`Invalid table borders: ${error}`)
  });

/**
 * Validate table properties with simple validation
 */
export const validateTableProperties = (properties: unknown): Effect.Effect<DocxTableProperties, DocxParseError> =>
  Effect.try({
    try: () => {
      if (!properties || typeof properties !== 'object') {
        return {};
      }
      return properties as DocxTableProperties;
    },
    catch: (error) => new DocxParseError(`Invalid table properties: ${error}`)
  });

/**
 * Validate table row properties with simple validation
 */
export const validateTableRowProperties = (properties: unknown): Effect.Effect<DocxTableRowProperties, DocxParseError> =>
  Effect.try({
    try: () => {
      if (!properties || typeof properties !== 'object') {
        return {};
      }
      return properties as DocxTableRowProperties;
    },
    catch: (error) => new DocxParseError(`Invalid table row properties: ${error}`)
  });

/**
 * Validate table cell properties with simple validation
 */
export const validateTableCellProperties = (properties: unknown): Effect.Effect<DocxTableCellProperties, DocxParseError> =>
  Effect.try({
    try: () => {
      if (!properties || typeof properties !== 'object') {
        return {};
      }
      return properties as DocxTableCellProperties;
    },
    catch: (error) => new DocxParseError(`Invalid table cell properties: ${error}`)
  });

/**
 * Safe parsing utility that provides defaults on error
 */
export const parseWithDefaults = <T>(
  data: unknown,
  defaults: T
): Effect.Effect<T, DocxParseError> =>
  Effect.gen(function* () {
    if (!data) {
      return defaults;
    }
    
    try {
      // Simple validation - just return the data if it exists
      return { ...defaults, ...(data as any) };
    } catch (error) {
      console.warn(`Validation failed, using defaults:`, error);
      return yield* Effect.fail(new DocxParseError(`Validation failed: ${error}`));
    }
  });