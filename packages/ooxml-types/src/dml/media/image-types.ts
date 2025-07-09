/**
 * DrawingML Image Media Types
 * Based on dml-main.xsd image definitions
 */

/**
 * Picture fill stretch properties
 */
export interface CT_DMLStretchInfoProperties {
  /** Fill rectangle */
  fillRect?: CT_DMLRelativeRect;
}

/**
 * Picture fill tile properties
 */
export interface CT_DMLTileInfoProperties {
  /** Tile X offset */
  tx?: number;
  /** Tile Y offset */
  ty?: number;
  /** Tile X scale */
  sx?: number;
  /** Tile Y scale */
  sy?: number;
  /** Tile flip mode */
  flip?: ST_DMLTileFlipMode;
  /** Tile alignment */
  algn?: ST_DMLRectAlignment;
}

/**
 * Relative rectangle
 */
export interface CT_DMLRelativeRect {
  /** Left */
  l?: number;
  /** Top */
  t?: number;
  /** Right */
  r?: number;
  /** Bottom */
  b?: number;
}

/**
 * Tile flip mode
 */
export type ST_DMLTileFlipMode = 'none' | 'x' | 'y' | 'xy';

/**
 * Rectangle alignment
 */
export type ST_DMLRectAlignment = 
  | 'tl' | 'tr' | 'bl' | 'br' | 'ctr' | 'l' | 'r' | 't' | 'b';

/**
 * Blip (Binary Large Image or Picture)
 */
export interface CT_DMLBlip {
  /** Relationship ID */
  'r:embed'?: string;
  /** Link relationship ID */
  'r:link'?: string;
  /** Compression state */
  cstate?: ST_DMLBlipCompression;
  /** Alpha modulation effects */
  alphaMod?: CT_DMLAlphaModulateEffect[];
  /** Alpha modulation fixed */
  alphaModFix?: CT_DMLAlphaModulateFixedEffect[];
  /** Other effects */
  effects?: any[];
  /** Extension list */
  extLst?: any;
}

/**
 * Blip compression
 */
export type ST_DMLBlipCompression = 'email' | 'screen' | 'print' | 'hqprint' | 'none';

/**
 * Alpha modulate effect
 */
export interface CT_DMLAlphaModulateEffect {
  /** Container */
  cont?: CT_DMLEffectContainer;
}

/**
 * Alpha modulate fixed effect
 */
export interface CT_DMLAlphaModulateFixedEffect {
  /** Amount */
  amt?: number;
}

/**
 * Effect container
 */
export interface CT_DMLEffectContainer {
  /** Type */
  type?: ST_DMLEffectContainerType;
  /** Name */
  name?: string;
}

/**
 * Effect container type
 */
export type ST_DMLEffectContainerType = 'sib' | 'tree';