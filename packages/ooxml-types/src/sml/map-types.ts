/**
 * SpreadsheetML XML Mapping Types
 * @see ECMA-376 Part 1, §18.15 (Single Cell Tables)
 */

import type { ST_Xstring } from '../shared/common-types';
import type { CT_ExtensionList } from '../chart-types';

/**
 * Schema.
 * @see ECMA-376 Part 1, §18.15.4 CT_Schema
 */
export interface CT_Schema {
  _schema?: string; // any content
  ID: ST_Xstring;
  Namespace?: ST_Xstring;
  SchemaRef?: ST_Xstring;
  SchemaLanguage?: ST_Xstring;
}

/**
 * Data binding.
 * @see ECMA-376 Part 1, §18.15.1 CT_DataBinding
 */
export interface CT_DataBinding {
  _any?: any; // any attributes
  DataBindingName?: ST_Xstring;
  FileBinding?: boolean;
  ConnectionID?: number; // xsd:unsignedInt
  FileBindingName?: ST_Xstring;
  DataBindingLoadMode?: number; // xsd:unsignedInt
}

/**
 * Map.
 * @see ECMA-376 Part 1, §18.15.2 CT_Map
 */
export interface CT_Map {
  dataBinding?: CT_DataBinding;
  ID: number; // xsd:unsignedInt
  Name: ST_Xstring;
  RootElement: ST_Xstring;
  SchemaID: ST_Xstring;
  ShowImportExportValidationErrors: boolean;
  AutoFit: boolean;
  Append: boolean;
  PreserveSortAFLayout: boolean;
  PreserveFormat: boolean;
}

/**
 * Map info.
 * @see ECMA-376 Part 1, §18.15.3 CT_MapInfo
 */
export interface CT_MapInfo {
  schema: CT_Schema[];
  map: CT_Map[];
  selectionNamespaces: ST_Xstring;
}