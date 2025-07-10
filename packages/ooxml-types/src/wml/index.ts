/**
 * WordprocessingML Types
 * Re-exports all WML modules
 */

// Basic types
export * from './basic-types';
export * from './text-formatting-types';
export * from './border-shading-types';
export * from './field-types';
export * from './tracking-types';

// New structured modules (preferred)
export * from './numbering';
export * from './style';
export * from './table';
export * from './document';

// Legacy top-level types (deprecated - use structured modules instead)
// Export specific enums to avoid conflicts
export { ST_Jc } from './paragraph-types';
export { ST_Em } from './run-types';