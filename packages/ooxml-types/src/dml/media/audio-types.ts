/**
 * DrawingML Audio Media Types
 * Based on dml-main.xsd audio definitions
 */

/**
 * Audio file reference
 */
export interface CT_DMLAudioFile {
  /** Content type */
  contentType?: string;
  /** Relationship ID */
  "r:link"?: string;
}

/**
 * Audio CD time
 */
export interface CT_DMLAudioCDTime {
  /** Track number */
  track?: number;
  /** Time in track */
  time?: number;
}

/**
 * Audio CD reference
 */
export interface CT_DMLAudioCD {
  /** Start time */
  st?: CT_DMLAudioCDTime;
  /** End time */
  end?: CT_DMLAudioCDTime;
}

/**
 * QuickTime audio file
 */
export interface CT_DMLQuickTimeFile {
  /** Relationship ID */
  "r:link"?: string;
}
