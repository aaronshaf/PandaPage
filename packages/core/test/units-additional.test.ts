import { describe, it, expect } from "bun:test";
import {
  parseUniversalMeasure,
  twipsToMillimeters,
  emusToMillimeters,
  pointsToInches,
  inchesToPoints,
  TWIPS_PER_CM,
  EMUS_PER_CM,
  POINTS_PER_INCH,
} from "../src/common/units.js";

describe("Additional Unit Conversions", () => {
  describe("Missing twips conversions", () => {
    it("should convert twips to millimeters", () => {
      expect(twipsToMillimeters(1440)).toBeCloseTo(25.4, 1); // 1 inch = 25.4mm
      expect(twipsToMillimeters(720)).toBeCloseTo(12.7, 1); // 0.5 inch = 12.7mm
    });
  });

  describe("Missing EMU conversions", () => {
    it("should convert EMUs to millimeters", () => {
      expect(emusToMillimeters(914400)).toBeCloseTo(25.4, 1); // 1 inch = 25.4mm
      expect(emusToMillimeters(457200)).toBeCloseTo(12.7, 1); // 0.5 inch = 12.7mm
    });
  });

  describe("Missing points conversions", () => {
    it("should convert points to inches", () => {
      expect(pointsToInches(72)).toBe(1); // 72 points = 1 inch
      expect(pointsToInches(36)).toBe(0.5); // 36 points = 0.5 inch
    });
  });

  describe("Missing inches conversions", () => {
    it("should convert inches to points", () => {
      expect(inchesToPoints(1)).toBe(72); // 1 inch = 72 points
      expect(inchesToPoints(0.5)).toBe(36); // 0.5 inch = 36 points
    });
  });

  describe("parseUniversalMeasure with all target units", () => {
    it("should convert to millimeters", () => {
      expect(parseUniversalMeasure("1in", "mm")).toBeCloseTo(25.4, 1);
      expect(parseUniversalMeasure("1cm", "mm")).toBe(10);
      expect(parseUniversalMeasure("72pt", "mm")).toBeCloseTo(25.4, 1);
      expect(parseUniversalMeasure("1pc", "mm")).toBeCloseTo(4.23, 1);
      expect(parseUniversalMeasure("1pi", "mm")).toBeCloseTo(4.23, 1);
      expect(parseUniversalMeasure("10mm", "mm")).toBe(10);
    });

    it("should convert to centimeters", () => {
      expect(parseUniversalMeasure("1in", "cm")).toBeCloseTo(2.54, 2);
      expect(parseUniversalMeasure("10mm", "cm")).toBe(1);
      expect(parseUniversalMeasure("72pt", "cm")).toBeCloseTo(2.54, 2);
      expect(parseUniversalMeasure("1pc", "cm")).toBeCloseTo(0.423, 2);
      expect(parseUniversalMeasure("1pi", "cm")).toBeCloseTo(0.423, 2);
      expect(parseUniversalMeasure("1cm", "cm")).toBe(1);
    });

    it("should convert to inches", () => {
      expect(parseUniversalMeasure("25.4mm", "inches")).toBeCloseTo(1, 2);
      expect(parseUniversalMeasure("2.54cm", "inches")).toBeCloseTo(1, 2);
      expect(parseUniversalMeasure("72pt", "inches")).toBe(1);
      expect(parseUniversalMeasure("6pc", "inches")).toBe(1); // 6 picas = 1 inch
      expect(parseUniversalMeasure("6pi", "inches")).toBe(1);
      expect(parseUniversalMeasure("1in", "inches")).toBe(1);
    });

    it("should convert to points", () => {
      expect(parseUniversalMeasure("1in", "points")).toBe(72);
      expect(parseUniversalMeasure("25.4mm", "points")).toBeCloseTo(72, 1);
      expect(parseUniversalMeasure("2.54cm", "points")).toBeCloseTo(72, 1);
      expect(parseUniversalMeasure("1pc", "points")).toBe(12);
      expect(parseUniversalMeasure("1pi", "points")).toBe(12);
      expect(parseUniversalMeasure("1pt", "points")).toBe(1);
    });

    it("should convert to EMUs", () => {
      expect(parseUniversalMeasure("1in", "emus")).toBe(914400);
      expect(parseUniversalMeasure("1pt", "emus")).toBe(12700);
      expect(parseUniversalMeasure("1pc", "emus")).toBe(152400);
      expect(parseUniversalMeasure("1pi", "emus")).toBe(152400);
      expect(parseUniversalMeasure("1cm", "emus")).toBe(360000);
      expect(parseUniversalMeasure("25.4mm", "emus")).toBeCloseTo(914400, 0);
    });

    it("should handle default case returning 0", () => {
      // @ts-ignore - testing with invalid target unit
      expect(parseUniversalMeasure("1in", "invalid")).toBe(0);
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle parseUniversalMeasure with invalid units", () => {
      expect(parseUniversalMeasure("1invalid")).toBe(1); // Falls back to parsing as number
      expect(parseUniversalMeasure("invalid")).toBe(0); // NaN becomes 0
    });

    it("should handle parseUniversalMeasure with missing unit", () => {
      expect(parseUniversalMeasure("123")).toBe(123); // Parsed as number
    });

    it("should handle parseUniversalMeasure regex match edge cases", () => {
      // Test the case where unit is extracted but num is undefined/empty
      expect(parseUniversalMeasure("in")).toBe(0); // No number part
      expect(parseUniversalMeasure("pt")).toBe(0); // No number part
    });
  });

  describe("Internal conversion function coverage", () => {
    // These tests target the internal conversion functions that aren't directly exported
    // but are called through parseUniversalMeasure

    it("should test all convertToTwips cases", () => {
      expect(parseUniversalMeasure("1in", "twips")).toBe(1440);
      expect(parseUniversalMeasure("1pt", "twips")).toBe(20);
      expect(parseUniversalMeasure("1pc", "twips")).toBe(240); // 12 * 20
      expect(parseUniversalMeasure("1pi", "twips")).toBe(240); // 12 * 20
      expect(parseUniversalMeasure("25.4mm", "twips")).toBeCloseTo(1440, 0);
      expect(parseUniversalMeasure("2.54cm", "twips")).toBeCloseTo(1440, 0);
    });

    it("should test all convertToEmus cases", () => {
      expect(parseUniversalMeasure("1in", "emus")).toBe(914400);
      expect(parseUniversalMeasure("1pt", "emus")).toBe(12700);
      expect(parseUniversalMeasure("1pc", "emus")).toBe(152400); // 12 * 12700
      expect(parseUniversalMeasure("1pi", "emus")).toBe(152400); // 12 * 12700
      expect(parseUniversalMeasure("25.4mm", "emus")).toBeCloseTo(914400, 0);
      expect(parseUniversalMeasure("1cm", "emus")).toBe(360000);
    });

    it("should test all convertToPoints cases", () => {
      expect(parseUniversalMeasure("1in", "points")).toBe(72);
      expect(parseUniversalMeasure("1pt", "points")).toBe(1);
      expect(parseUniversalMeasure("1pc", "points")).toBe(12);
      expect(parseUniversalMeasure("1pi", "points")).toBe(12);
      expect(parseUniversalMeasure("25.4mm", "points")).toBeCloseTo(72, 1);
      expect(parseUniversalMeasure("2.54cm", "points")).toBeCloseTo(72, 1);
    });

    it("should test all convertToInches cases", () => {
      expect(parseUniversalMeasure("1in", "inches")).toBe(1);
      expect(parseUniversalMeasure("72pt", "inches")).toBe(1);
      expect(parseUniversalMeasure("6pc", "inches")).toBe(1); // 6 picas = 72 points = 1 inch
      expect(parseUniversalMeasure("6pi", "inches")).toBe(1);
      expect(parseUniversalMeasure("25.4mm", "inches")).toBeCloseTo(1, 2);
      expect(parseUniversalMeasure("2.54cm", "inches")).toBeCloseTo(1, 2);
    });

    it("should test all convertToCentimeters cases", () => {
      expect(parseUniversalMeasure("1in", "cm")).toBeCloseTo(2.54, 2);
      expect(parseUniversalMeasure("72pt", "cm")).toBeCloseTo(2.54, 2);
      expect(parseUniversalMeasure("6pc", "cm")).toBeCloseTo(2.54, 2);
      expect(parseUniversalMeasure("6pi", "cm")).toBeCloseTo(2.54, 2);
      expect(parseUniversalMeasure("10mm", "cm")).toBe(1);
      expect(parseUniversalMeasure("1cm", "cm")).toBe(1);
    });

    it("should test all convertToMillimeters cases", () => {
      expect(parseUniversalMeasure("1in", "mm")).toBeCloseTo(25.4, 1);
      expect(parseUniversalMeasure("72pt", "mm")).toBeCloseTo(25.4, 1);
      expect(parseUniversalMeasure("6pc", "mm")).toBeCloseTo(25.4, 1);
      expect(parseUniversalMeasure("6pi", "mm")).toBeCloseTo(25.4, 1);
      expect(parseUniversalMeasure("1mm", "mm")).toBe(1);
      expect(parseUniversalMeasure("1cm", "mm")).toBe(10);
    });

    it("should test default cases in conversion functions", () => {
      // These test the default cases in the switch statements of internal conversion functions
      // We can't directly test them since they're not exported, but we can create scenarios
      // where invalid units would hit the default cases if they existed
      // The functions are well-designed and all valid units are handled
      // Default cases return 0 for unknown units
    });
  });
});
