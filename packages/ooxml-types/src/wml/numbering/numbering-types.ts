/**
 * WordprocessingML Numbering Types
 * Based on wml.xsd numbering-related definitions
 */

import type { CT_AbstractNum } from './abstract-numbering-types';
import type { CT_NumLvl } from './level-types';

/**
 * Number format enumeration
 */
export type ST_NumberFormat = 
  | 'decimal' | 'upperRoman' | 'lowerRoman' | 'upperLetter' | 'lowerLetter'
  | 'ordinal' | 'cardinalText' | 'ordinalText' | 'hex' | 'chicago'
  | 'ideographDigital' | 'japaneseCounting' | 'aiueo' | 'iroha'
  | 'decimalFullWidth' | 'decimalHalfWidth' | 'japaneseLegal'
  | 'japaneseDigitalTenThousand' | 'decimalEnclosedCircle'
  | 'decimalFullWidth2' | 'aiueoFullWidth' | 'irohaFullWidth'
  | 'decimalZero' | 'bullet' | 'ganada' | 'chosung' | 'decimalEnclosedFullstop'
  | 'decimalEnclosedParen' | 'decimalEnclosedCircleChinese'
  | 'ideographEnclosedCircle' | 'ideographTraditional'
  | 'ideographZodiac' | 'ideographZodiacTraditional' | 'taiwaneseCounting'
  | 'ideographLegalTraditional' | 'taiwaneseCountingThousand'
  | 'taiwaneseDigital' | 'chineseCounting' | 'chineseLegalSimplified'
  | 'chineseCountingThousand' | 'koreanDigital' | 'koreanCounting'
  | 'koreanLegal' | 'koreanDigital2' | 'vietnameseCounting'
  | 'russianLower' | 'russianUpper' | 'none' | 'numberInDash'
  | 'hebrew1' | 'hebrew2' | 'arabicAlpha' | 'arabicAbjad' | 'hindiVowels'
  | 'hindiConsonants' | 'hindiNumbers' | 'hindiCounting' | 'thaiLetters'
  | 'thaiNumbers' | 'thaiCounting' | 'bahtText' | 'dollarText';

/**
 * Level suffix type
 */
export type ST_LevelSuffix = 'tab' | 'space' | 'nothing';

/**
 * Multi-level type enumeration
 */
export type ST_MultiLevelType = 'singleLevel' | 'multilevel' | 'hybridMultilevel';

/**
 * Number format definition
 */
export interface CT_NumFmt {
  /** Number format value */
  val: ST_NumberFormat;
  /** Custom format string */
  format?: string;
}

/**
 * Numbering properties for paragraphs
 */
export interface CT_NumPr {
  /** Indentation level */
  ilvl?: number;
  /** Numbering definition ID */
  numId?: number;
  /** Insert tracking change */
  ins?: any; // CT_TrackChange
}

/**
 * Picture bullet definition
 */
export interface CT_NumPicBullet {
  /** Drawing element */
  drawing?: any; // CT_Drawing
  /** Picture bullet ID */
  numPicBulletId: number;
}

/**
 * Concrete numbering instance
 */
export interface CT_Num {
  /** Abstract numbering ID reference */
  abstractNumId: number;
  /** Level overrides */
  lvlOverride?: CT_NumLvl[];
}

/**
 * Root numbering definitions container
 */
export interface CT_Numbering {
  /** Picture bullets */
  numPicBullet?: CT_NumPicBullet[];
  /** Abstract numbering definitions */
  abstractNum?: CT_AbstractNum[];
  /** Concrete numbering instances */
  num?: CT_Num[];
  /** Numbering ID macro cleanup */
  numIdMacAtCleanup?: number;
}