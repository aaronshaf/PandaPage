/**
 * Relationship Types
 * @see ECMA-376 Part 1, §22.8 (Shared Relationship Types)
 * Based on shared-relationshipReference.xsd
 */

/**
 * Relationship identifier.
 * References relationships defined in _rels files.
 * @see ECMA-376 Part 1, §22.8.2.1 ST_RelationshipId
 */
export type ST_RelationshipId = string;

/**
 * Relation type for comparisons.
 * @see ECMA-376 Part 1, §22.9.2.14 ST_Relation
 */
export enum ST_Relation {
  Ge = "ge",
  Le = "le",
  Gt = "gt",
  Lt = "lt",
  Eq = "eq",
}