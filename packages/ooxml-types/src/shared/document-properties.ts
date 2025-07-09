/**
 * Document Properties Types
 * @see ECMA-376 Part 1, §22.2 (Document Properties)
 */

import type { ST_String, ST_Guid } from './common-types';
import type { ST_Relation } from './relationship-types';
import type { VariantValue } from '../variant-types';

/**
 * Characteristic definition.
 * @see ECMA-376 Part 1, §22.2.2.1 CT_Characteristic
 */
export interface CT_Characteristic {
  name: ST_String;
  relation: ST_Relation;
  val: ST_String;
  vocabulary?: ST_String; // xsd:anyURI
}

/**
 * Additional characteristics container.
 * @see ECMA-376 Part 1, §22.2.2.2 CT_AdditionalCharacteristics
 */
export interface CT_AdditionalCharacteristics {
  characteristic?: CT_Characteristic[];
}

/**
 * Datastore schema reference.
 * @see ECMA-376 Part 1, §22.5.2.1 CT_DatastoreSchemaRef
 */
export interface CT_DatastoreSchemaRef {
  uri: ST_String;
}

/**
 * Datastore schema references container.
 * @see ECMA-376 Part 1, §22.5.2.2 CT_DatastoreSchemaRefs
 */
export interface CT_DatastoreSchemaRefs {
  schemaRef?: CT_DatastoreSchemaRef[];
}

/**
 * Datastore item.
 * @see ECMA-376 Part 1, §22.5.2.3 CT_DatastoreItem
 */
export interface CT_DatastoreItem {
  schemaRefs?: CT_DatastoreSchemaRefs;
  itemID: ST_Guid;
}

/**
 * Schema definition.
 * @see ECMA-376 Part 1, §22.5.2.4 CT_Schema
 */
export interface CT_Schema {
  uri?: ST_String;
  manifestLocation?: ST_String;
  schemaLocation?: ST_String;
  schemaLanguage?: ST_String; // xsd:token
}

/**
 * Schema library container.
 * @see ECMA-376 Part 1, §22.5.2.5 CT_SchemaLibrary
 */
export interface CT_SchemaLibrary {
  schema?: CT_Schema[];
}

/**
 * Custom property definition.
 * @see ECMA-376 Part 1, §22.3.2.2 CT_Property
 */
export type CT_Property = VariantValue & {
  fmtid: ST_Guid;
  pid: number; // xsd:int
  name?: ST_String;
  linkTarget?: ST_String;
};

/**
 * Custom properties container.
 * @see ECMA-376 Part 1, §22.3.2.1 CT_Properties
 */
export interface CT_Properties {
  property?: CT_Property[];
}