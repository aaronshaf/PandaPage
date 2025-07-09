/**
 * Shared Types for OOXML
 * Re-exports all shared type modules
 */

// Common types
export * from './common-types';

// Measurement types
export * from './measurement-types';

// Alignment types
export * from './alignment-types';

// Relationship types
export * from './relationship-types';

// Document properties
export * from './document-properties';

// Note: variant-types, bibliography-types, and math-types are exported directly from main index.ts
// to avoid conflicts with other modules that define similar types