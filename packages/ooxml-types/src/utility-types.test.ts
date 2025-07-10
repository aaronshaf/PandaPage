import { describe, test, expect } from "bun:test";
import {
  twipsToPoints,
  pointsToTwips,
  emusToPoints,
  pointsToEmus,
  emusToPixels,
  halfPointsToPoints,
  eighthPointsToPoints,
  parsePercentage,
  hexToRgb,
  toOoxmlAlignment,
  fromOoxmlAlignment,
} from "./utility-types";

describe("Measurement Conversions", () => {
  test("twipsToPoints", () => {
    expect(twipsToPoints(20)).toBe(1);
    expect(twipsToPoints(240)).toBe(12);
    expect(twipsToPoints(360)).toBe(18);
  });

  test("pointsToTwips", () => {
    expect(pointsToTwips(1)).toBe(20);
    expect(pointsToTwips(12)).toBe(240);
    expect(pointsToTwips(18)).toBe(360);
  });

  test("emusToPoints", () => {
    expect(emusToPoints(12700)).toBe(1);
    expect(emusToPoints(25400)).toBe(2);
    expect(emusToPoints(6350)).toBe(0.5);
  });

  test("pointsToEmus", () => {
    expect(pointsToEmus(1)).toBe(12700);
    expect(pointsToEmus(2)).toBe(25400);
    expect(pointsToEmus(0.5)).toBe(6350);
  });

  test("emusToPixels at 96 DPI", () => {
    expect(emusToPixels(914400)).toBe(96); // 1 inch
    expect(emusToPixels(457200)).toBe(48); // 0.5 inch
    expect(Math.round(emusToPixels(1905000))).toBe(200); // ~2.08 inches
  });

  test("halfPointsToPoints", () => {
    expect(halfPointsToPoints(24)).toBe(12);
    expect(halfPointsToPoints("24")).toBe(12);
    expect(halfPointsToPoints(11)).toBe(5.5);
  });

  test("eighthPointsToPoints", () => {
    expect(eighthPointsToPoints(8)).toBe(1);
    expect(eighthPointsToPoints(4)).toBe(0.5);
    expect(eighthPointsToPoints(12)).toBe(1.5);
  });
});

describe("Utility Functions", () => {
  test("parsePercentage", () => {
    expect(parsePercentage("50%")).toBe(50);
    expect(parsePercentage("50")).toBe(50);
    expect(parsePercentage("33.33%")).toBe(33.33);
    expect(parsePercentage("-10%")).toBe(-10);
    expect(parsePercentage("invalid")).toBe(0);
  });

  test("hexToRgb", () => {
    expect(hexToRgb("#FF0000")).toBe("rgb(255, 0, 0)");
    expect(hexToRgb("00FF00")).toBe("rgb(0, 255, 0)");
    expect(hexToRgb("#00F")).toBe("rgb(0, 0, 255)");
    expect(hexToRgb("FFF")).toBe("rgb(255, 255, 255)");
  });

  test("toOoxmlAlignment", () => {
    expect(toOoxmlAlignment("left")).toBe("start");
    expect(toOoxmlAlignment("right")).toBe("end");
    expect(toOoxmlAlignment("justify")).toBe("both");
    expect(toOoxmlAlignment("center")).toBe("center");
  });

  test("fromOoxmlAlignment", () => {
    expect(fromOoxmlAlignment("start")).toBe("left");
    expect(fromOoxmlAlignment("end")).toBe("right");
    expect(fromOoxmlAlignment("both")).toBe("justify");
    expect(fromOoxmlAlignment("center")).toBe("center");
  });
});
