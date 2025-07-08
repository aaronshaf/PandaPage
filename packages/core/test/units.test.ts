import { describe, it, expect } from 'bun:test';
import {
  parseUniversalMeasure,
  twipsToInches,
  twipsToPoints,
  twipsToCentimeters,
  emusToInches,
  emusToPoints,
  emusToCentimeters,
  twipsToEmus,
  emusToTwips,
  pointsToTwips,
  pointsToEmus,
  pointsToInches,
  inchesToTwips,
  inchesToEmus,
  inchesToPoints,
  halfPointsToPoints,
  pointsToHalfPoints,
  twipsToCss,
  emusToCss,
  pointsToCss,
  inchesToCss,
  centimetersToCss,
  parseOnOff,
  parseFontSize,
  validateEmuCoordinate,
  validateTwipsCoordinate,
  PAGE_SIZES,
  DEFAULT_MARGINS,
  TYPOGRAPHY_DEFAULTS,
  TWIPS_PER_INCH,
  TWIPS_PER_POINT,
  EMUS_PER_INCH,
  EMUS_PER_POINT,
  EMUS_PER_TWIP
} from '../src/common/units.js';

describe('Unit Constants', () => {
  it('should have correct OOXML unit constants', () => {
    expect(TWIPS_PER_INCH).toBe(1440);
    expect(TWIPS_PER_POINT).toBe(20);
    expect(EMUS_PER_INCH).toBe(914400);
    expect(EMUS_PER_POINT).toBe(12700);
    expect(EMUS_PER_TWIP).toBe(635);
  });
});

describe('parseUniversalMeasure', () => {
  it('should parse inches to twips', () => {
    expect(parseUniversalMeasure('1in', 'twips')).toBe(1440);
    expect(parseUniversalMeasure('2.5in', 'twips')).toBe(3600);
    expect(parseUniversalMeasure('0.5in', 'twips')).toBe(720);
  });

  it('should parse points to twips', () => {
    expect(parseUniversalMeasure('72pt', 'twips')).toBe(1440);
    expect(parseUniversalMeasure('12pt', 'twips')).toBe(240);
    expect(parseUniversalMeasure('6pt', 'twips')).toBe(120);
  });

  it('should parse picas to twips', () => {
    expect(parseUniversalMeasure('1pc', 'twips')).toBe(240); // 1 pica = 12 points = 240 twips
    expect(parseUniversalMeasure('1pi', 'twips')).toBe(240); // Alternative pica notation
  });

  it('should parse centimeters to twips', () => {
    expect(parseUniversalMeasure('1cm', 'twips')).toBe(567);
    expect(parseUniversalMeasure('2.54cm', 'twips')).toBe(1440); // 1 inch
  });

  it('should parse millimeters to twips', () => {
    expect(parseUniversalMeasure('25.4mm', 'twips')).toBe(1440); // 1 inch
  });

  it('should parse inches to EMUs', () => {
    expect(parseUniversalMeasure('1in', 'emus')).toBe(914400);
    expect(parseUniversalMeasure('0.5in', 'emus')).toBe(457200);
  });

  it('should parse points to EMUs', () => {
    expect(parseUniversalMeasure('72pt', 'emus')).toBe(914400); // 1 inch
    expect(parseUniversalMeasure('1pt', 'emus')).toBe(12700);
  });

  it('should parse points to points', () => {
    expect(parseUniversalMeasure('12pt', 'points')).toBe(12);
    expect(parseUniversalMeasure('1in', 'points')).toBe(72);
  });

  it('should handle raw numbers', () => {
    expect(parseUniversalMeasure(1440, 'twips')).toBe(1440);
    expect(parseUniversalMeasure(720, 'twips')).toBe(720);
  });

  it('should handle invalid formats', () => {
    expect(parseUniversalMeasure('invalid', 'twips')).toBe(0);
    expect(parseUniversalMeasure('123', 'twips')).toBe(123); // Raw number fallback
    expect(parseUniversalMeasure('', 'twips')).toBe(0);
  });

  it('should handle negative values', () => {
    expect(parseUniversalMeasure('-12pt', 'twips')).toBe(-240);
    expect(parseUniversalMeasure('-1in', 'twips')).toBe(-1440);
  });

  it('should handle decimal values', () => {
    expect(parseUniversalMeasure('0.5in', 'twips')).toBe(720);
    expect(parseUniversalMeasure('1.5pt', 'twips')).toBe(30);
  });
});

describe('Unit conversion functions', () => {
  describe('Twips conversions', () => {
    it('should convert twips to inches', () => {
      expect(twipsToInches(1440)).toBe(1);
      expect(twipsToInches(720)).toBe(0.5);
    });

    it('should convert twips to points', () => {
      expect(twipsToPoints(240)).toBe(12);
      expect(twipsToPoints(20)).toBe(1);
    });

    it('should convert twips to centimeters', () => {
      expect(twipsToCentimeters(567)).toBeCloseTo(1, 1);
      expect(twipsToCentimeters(1440)).toBeCloseTo(2.54, 1);
    });
  });

  describe('EMU conversions', () => {
    it('should convert EMUs to inches', () => {
      expect(emusToInches(914400)).toBe(1);
      expect(emusToInches(457200)).toBe(0.5);
    });

    it('should convert EMUs to points', () => {
      expect(emusToPoints(12700)).toBe(1);
      expect(emusToPoints(914400)).toBe(72);
    });

    it('should convert EMUs to centimeters', () => {
      expect(emusToCentimeters(360000)).toBe(1);
      expect(emusToCentimeters(914400)).toBeCloseTo(2.54, 1);
    });
  });

  describe('Cross-unit conversions', () => {
    it('should convert twips to EMUs', () => {
      expect(twipsToEmus(1440)).toBe(914400);
      expect(twipsToEmus(20)).toBe(12700);
    });

    it('should convert EMUs to twips', () => {
      expect(emusToTwips(914400)).toBe(1440);
      expect(emusToTwips(12700)).toBe(20);
    });
  });

  describe('Points conversions', () => {
    it('should convert points to twips', () => {
      expect(pointsToTwips(12)).toBe(240);
      expect(pointsToTwips(1)).toBe(20);
    });

    it('should convert points to EMUs', () => {
      expect(pointsToEmus(1)).toBe(12700);
      expect(pointsToEmus(72)).toBe(914400);
    });
  });

  describe('Inches conversions', () => {
    it('should convert inches to twips', () => {
      expect(inchesToTwips(1)).toBe(1440);
      expect(inchesToTwips(0.5)).toBe(720);
    });

    it('should convert inches to EMUs', () => {
      expect(inchesToEmus(1)).toBe(914400);
      expect(inchesToEmus(0.5)).toBe(457200);
    });
  });

  describe('Font size helpers', () => {
    it('should convert half-points to points', () => {
      expect(halfPointsToPoints(24)).toBe(12);
      expect(halfPointsToPoints(22)).toBe(11);
    });

    it('should convert points to half-points', () => {
      expect(pointsToHalfPoints(12)).toBe(24);
      expect(pointsToHalfPoints(11)).toBe(22);
    });
  });

  describe('CSS output helpers', () => {
    it('should convert twips to CSS', () => {
      expect(twipsToCss(240)).toBe('12pt');
      expect(twipsToCss(20)).toBe('1pt');
    });

    it('should convert EMUs to CSS', () => {
      expect(emusToCss(12700)).toBe('1pt');
      expect(emusToCss(914400)).toBe('72pt');
    });

    it('should convert points to CSS', () => {
      expect(pointsToCss(12)).toBe('12pt');
      expect(pointsToCss(1)).toBe('1pt');
    });

    it('should convert inches to CSS', () => {
      expect(inchesToCss(1)).toBe('1in');
      expect(inchesToCss(0.5)).toBe('0.5in');
    });

    it('should convert centimeters to CSS', () => {
      expect(centimetersToCss(2.54)).toBe('2.54cm');
      expect(centimetersToCss(1)).toBe('1cm');
    });
  });
});

describe('parseOnOff', () => {
  it('should parse true values', () => {
    expect(parseOnOff('true')).toBe(true);
    expect(parseOnOff('1')).toBe(true);
    expect(parseOnOff('on')).toBe(true);
    expect(parseOnOff('TRUE')).toBe(true);
    expect(parseOnOff('ON')).toBe(true);
  });

  it('should parse false values', () => {
    expect(parseOnOff('false')).toBe(false);
    expect(parseOnOff('0')).toBe(false);
    expect(parseOnOff('off')).toBe(false);
    expect(parseOnOff('FALSE')).toBe(false);
    expect(parseOnOff('OFF')).toBe(false);
  });

  it('should handle empty string as true', () => {
    expect(parseOnOff('')).toBe(true);
  });

  it('should handle null/undefined with default', () => {
    expect(parseOnOff(null)).toBe(false);
    expect(parseOnOff(undefined)).toBe(false);
    expect(parseOnOff(null, true)).toBe(true);
    expect(parseOnOff(undefined, true)).toBe(true);
  });

  it('should handle boolean values', () => {
    expect(parseOnOff(true)).toBe(true);
    expect(parseOnOff(false)).toBe(false);
  });

  it('should handle unknown values as true', () => {
    expect(parseOnOff('unknown')).toBe(true);
    expect(parseOnOff('yes')).toBe(true);
    expect(parseOnOff('no')).toBe(true);
  });
});

describe('parseFontSize', () => {
  it('should parse half-points to points', () => {
    expect(parseFontSize('24')).toBe(12);
    expect(parseFontSize('22')).toBe(11);
    expect(parseFontSize('32')).toBe(16);
  });

  it('should parse numeric values', () => {
    expect(parseFontSize(24)).toBe(12);
    expect(parseFontSize(22)).toBe(11);
  });

  it('should handle null/undefined', () => {
    expect(parseFontSize(null)).toBeUndefined();
    expect(parseFontSize(undefined)).toBeUndefined();
  });

  it('should handle invalid values', () => {
    expect(parseFontSize('invalid')).toBeUndefined();
    expect(parseFontSize('')).toBeUndefined();
  });

  it('should handle decimal values', () => {
    expect(parseFontSize('25')).toBe(12.5);
    expect(parseFontSize(25)).toBe(12.5);
  });
});

describe('Coordinate validation', () => {
  it('should validate EMU coordinates', () => {
    expect(validateEmuCoordinate(0)).toBe(0);
    expect(validateEmuCoordinate(914400)).toBe(914400);
    expect(validateEmuCoordinate(-27273042329600)).toBe(-27273042329600);
    expect(validateEmuCoordinate(27273042316900)).toBe(27273042316900);
    
    // Test overflow
    expect(validateEmuCoordinate(27273042329600)).toBe(27273042316900);
    expect(validateEmuCoordinate(-27273042329700)).toBe(-27273042329600);
  });

  it('should validate twips coordinates', () => {
    expect(validateTwipsCoordinate(0)).toBe(0);
    expect(validateTwipsCoordinate(1440)).toBe(1440);
    expect(validateTwipsCoordinate(-27360)).toBe(-27360);
    expect(validateTwipsCoordinate(27360)).toBe(27360);
    
    // Test overflow
    expect(validateTwipsCoordinate(30000)).toBe(27360);
    expect(validateTwipsCoordinate(-30000)).toBe(-27360);
  });
});

describe('Page sizes', () => {
  it('should have correct letter size', () => {
    expect(PAGE_SIZES.letter.twips).toEqual({ width: 12240, height: 15840 });
    expect(PAGE_SIZES.letter.inches).toEqual({ width: 8.5, height: 11 });
    expect(PAGE_SIZES.letter.points).toEqual({ width: 612, height: 792 });
  });

  it('should have correct A4 size', () => {
    expect(PAGE_SIZES.a4.twips).toEqual({ width: 11907, height: 16839 });
    expect(PAGE_SIZES.a4.inches).toEqual({ width: 8.27, height: 11.69 });
    expect(PAGE_SIZES.a4.points).toEqual({ width: 595, height: 842 });
    expect(PAGE_SIZES.a4.mm).toEqual({ width: 210, height: 297 });
  });

  it('should have correct legal size', () => {
    expect(PAGE_SIZES.legal.twips).toEqual({ width: 12240, height: 20160 });
    expect(PAGE_SIZES.legal.inches).toEqual({ width: 8.5, height: 14 });
    expect(PAGE_SIZES.legal.points).toEqual({ width: 612, height: 1008 });
  });
});

describe('Default margins', () => {
  it('should have correct margin values', () => {
    expect(DEFAULT_MARGINS.normal).toBe(1440); // 1 inch
    expect(DEFAULT_MARGINS.narrow).toBe(720);  // 0.5 inch
    expect(DEFAULT_MARGINS.moderate).toBe(1080); // 0.75 inch
    expect(DEFAULT_MARGINS.wide).toBe(2160);   // 1.5 inch
  });
});

describe('Typography defaults', () => {
  it('should have correct typography defaults', () => {
    expect(TYPOGRAPHY_DEFAULTS.fontSize).toBe(22);       // 11pt in half-points
    expect(TYPOGRAPHY_DEFAULTS.lineSpacing).toBe(240);   // Single spacing
    expect(TYPOGRAPHY_DEFAULTS.paragraphSpacing).toBe(200); // 10pt in twips
    expect(TYPOGRAPHY_DEFAULTS.tabStop).toBe(720);      // 0.5 inch
    expect(TYPOGRAPHY_DEFAULTS.characterSpacing).toBe(0); // No extra spacing
  });
});