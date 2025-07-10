/**
 * Custom XML Data Properties Types
 * Based on shared-customXmlDataProperties.xsd
 * Namespace: http://purl.oclc.org/ooxml/officeDocument/customXml
 */

/**
 * Reference to a datastore schema
 */
export interface CT_DatastoreSchemaRef {
  /** Required URI of the schema */
  uri: string;
}

/**
 * Container for multiple schema references
 */
export interface CT_DatastoreSchemaRefs {
  /** Array of schema reference elements */
  schemaRef?: CT_DatastoreSchemaRef[];
}

/**
 * Datastore item with ID and optional schema references
 */
export interface CT_DatastoreItem {
  /** Optional schema references */
  schemaRefs?: CT_DatastoreSchemaRefs;
  /** Required unique identifier (GUID) */
  itemID: string;
}
