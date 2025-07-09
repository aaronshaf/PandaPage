/**
 * Custom XML Schema Properties Types
 * Based on shared-customXmlSchemaProperties.xsd
 * Namespace: http://purl.oclc.org/ooxml/schemaLibrary/main
 */

/**
 * Schema definition with URI and location information
 */
export interface CT_Schema {
  /** URI of the schema (defaults to empty string) */
  uri?: string;
  /** Optional manifest location */
  manifestLocation?: string;
  /** Optional schema location */
  schemaLocation?: string;
  /** Optional schema language token */
  schemaLanguage?: string;
}

/**
 * Container for multiple schema definitions
 */
export interface CT_SchemaLibrary {
  /** Array of schema elements */
  schema?: CT_Schema[];
}