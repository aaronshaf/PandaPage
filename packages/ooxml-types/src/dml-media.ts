// dml-media.ts - Media-related types extracted from dml-main.ts
import type { ST_RelationshipId, ST_String } from "./shared-types";

/**
 * Office Art Extension
 * Used by media types that support extensions
 */
export interface CT_OfficeArtExtension {
  any?: any[]; // xsd:any
  uri: string; // xsd:token
}

/**
 * Office Art Extension List
 * Used by media types that support extensions
 */
export interface CT_OfficeArtExtensionList {
  ext?: CT_OfficeArtExtension[];
}

/**
 * Audio file reference
 */
export interface CT_AudioFile {
  extLst?: CT_OfficeArtExtensionList;
  link: ST_RelationshipId;
  contentType?: ST_String;
}

/**
 * Video file reference
 */
export interface CT_VideoFile {
  extLst?: CT_OfficeArtExtensionList;
  link: ST_RelationshipId;
  contentType?: ST_String;
}

/**
 * QuickTime file reference
 */
export interface CT_QuickTimeFile {
  extLst?: CT_OfficeArtExtensionList;
  link: ST_RelationshipId;
}

/**
 * Audio CD time reference
 */
export interface CT_AudioCDTime {
  track: number; // xsd:unsignedByte
  time?: number; // xsd:unsignedInt
}

/**
 * Audio CD reference
 */
export interface CT_AudioCD {
  st: CT_AudioCDTime;
  end: CT_AudioCDTime;
  extLst?: CT_OfficeArtExtensionList;
}

/**
 * Embedded WAV audio file
 */
export interface CT_EmbeddedWAVAudioFile {
  embed: ST_RelationshipId;
  name?: ST_String;
}

/**
 * Media element group
 * Union type for all media elements
 */
export type EG_Media =
  | { audioCd: CT_AudioCD }
  | { wavAudioFile: CT_EmbeddedWAVAudioFile }
  | { audioFile: CT_AudioFile }
  | { videoFile: CT_VideoFile }
  | { quickTimeFile: CT_QuickTimeFile };
