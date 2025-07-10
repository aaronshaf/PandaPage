/**
 * Additional Characteristics Types
 * Based on shared-additionalCharacteristics.xsd
 * Namespace: http://purl.oclc.org/ooxml/officeDocument/characteristics
 */

/**
 * Relation enumeration for characteristics
 */
export type ST_Relation = "ge" | "le" | "gt" | "lt" | "eq";

/**
 * Individual characteristic with name, relation, value, and optional vocabulary
 */
export interface CT_Characteristic {
  /** Required name of the characteristic */
  name: string;
  /** Required relation type */
  relation: ST_Relation;
  /** Required value */
  val: string;
  /** Optional vocabulary URI */
  vocabulary?: string;
}

/**
 * Container for multiple additional characteristics
 */
export interface CT_AdditionalCharacteristics {
  /** Array of characteristic elements */
  characteristic?: CT_Characteristic[];
}
