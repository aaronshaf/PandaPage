/**
 * Shared Types for OOXML
 * Re-exports all shared type modules
 */

// Common types
export * from "./common-types";

// Measurement types
export * from "./measurement-types";

// Alignment types
export * from "./alignment-types";

// Relationship types
export * from "./relationship-types";

// Document properties
export * from "./document-properties";

// Additional characteristics - rename to avoid conflicts
export type {
  CT_AdditionalCharacteristics as CT_AdditionalCharacteristicsOOXML,
  CT_Characteristic as CT_CharacteristicOOXML,
  ST_Relation as ST_RelationOOXML,
} from "./additional-characteristics-types";

// Custom XML properties - rename to avoid conflicts
export type {
  CT_DatastoreSchemaRef as CT_DatastoreSchemaRefOOXML,
  CT_DatastoreSchemaRefs as CT_DatastoreSchemaRefsOOXML,
  CT_DatastoreItem as CT_DatastoreItemOOXML,
} from "./custom-xml-data-properties-types";

export type {
  CT_Schema as CT_SchemaOOXML,
  CT_SchemaLibrary as CT_SchemaLibraryOOXML,
} from "./custom-xml-schema-properties-types";

// Custom document properties - rename to avoid conflicts
export type {
  CT_Property as CT_CustomProperty,
  CT_Properties as CT_CustomProperties,
  PropertyValue as CustomPropertyValue,
} from "./document-properties-custom-types";

// Note: variant-types, bibliography-types, and math-types are exported directly from main index.ts
// to avoid conflicts with other modules that define similar types
