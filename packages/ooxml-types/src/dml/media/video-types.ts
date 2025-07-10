/**
 * DrawingML Video Media Types
 * Based on dml-main.xsd video definitions
 */

/**
 * Video file reference
 */
export interface CT_DMLVideoFile {
  /** Content type */
  contentType?: string;
  /** Relationship ID */
  "r:link"?: string;
}
