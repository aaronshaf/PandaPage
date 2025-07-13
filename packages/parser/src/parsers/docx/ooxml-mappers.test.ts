import { describe, it, expect } from "bun:test";
import "../../test-setup";
import { 
  mapBorderStyle, 
  mapShadingPattern, 
  mapParagraphAlignment, 
  mapEmphasisMark 
} from "./ooxml-mappers";
import { ST_Border, ST_Shd, ST_Jc, ST_Em } from "@browser-document-viewer/ooxml-types";

describe("OOXML Mappers", () => {
  describe("mapBorderStyle", () => {
    it("should map basic border styles", () => {
      expect(mapBorderStyle("nil")).toBe(ST_Border.Nil);
      expect(mapBorderStyle("none")).toBe(ST_Border.None);
      expect(mapBorderStyle("single")).toBe(ST_Border.Single);
      expect(mapBorderStyle("thick")).toBe(ST_Border.Thick);
      expect(mapBorderStyle("double")).toBe(ST_Border.Double);
      expect(mapBorderStyle("dotted")).toBe(ST_Border.Dotted);
      expect(mapBorderStyle("dashed")).toBe(ST_Border.Dashed);
    });

    it("should map complex border styles", () => {
      expect(mapBorderStyle("dotDash")).toBe(ST_Border.DotDash);
      expect(mapBorderStyle("dotDotDash")).toBe(ST_Border.DotDotDash);
      expect(mapBorderStyle("triple")).toBe(ST_Border.Triple);
      expect(mapBorderStyle("wave")).toBe(ST_Border.Wave);
      expect(mapBorderStyle("doubleWave")).toBe(ST_Border.DoubleWave);
    });

    it("should map gap-based border styles", () => {
      expect(mapBorderStyle("thinThickSmallGap")).toBe(ST_Border.ThinThickSmallGap);
      expect(mapBorderStyle("thickThinSmallGap")).toBe(ST_Border.ThickThinSmallGap);
      expect(mapBorderStyle("thinThickThinSmallGap")).toBe(ST_Border.ThinThickThinSmallGap);
      expect(mapBorderStyle("thinThickMediumGap")).toBe(ST_Border.ThinThickMediumGap);
      expect(mapBorderStyle("thickThinMediumGap")).toBe(ST_Border.ThickThinMediumGap);
      expect(mapBorderStyle("thinThickThinMediumGap")).toBe(ST_Border.ThinThickThinMediumGap);
      expect(mapBorderStyle("thinThickLargeGap")).toBe(ST_Border.ThinThickLargeGap);
      expect(mapBorderStyle("thickThinLargeGap")).toBe(ST_Border.ThickThinLargeGap);
      expect(mapBorderStyle("thinThickThinLargeGap")).toBe(ST_Border.ThinThickThinLargeGap);
    });

    it("should map special border styles", () => {
      expect(mapBorderStyle("dashSmallGap")).toBe(ST_Border.DashSmallGap);
      expect(mapBorderStyle("dashDotStroked")).toBe(ST_Border.DashDotStroked);
      expect(mapBorderStyle("threeDEmboss")).toBe(ST_Border.ThreeDEmboss);
      expect(mapBorderStyle("threeDEngrave")).toBe(ST_Border.ThreeDEngrave);
      expect(mapBorderStyle("outset")).toBe(ST_Border.Outset);
      expect(mapBorderStyle("inset")).toBe(ST_Border.Inset);
    });

    it("should return undefined for unknown border styles", () => {
      expect(mapBorderStyle("unknown")).toBeUndefined();
      expect(mapBorderStyle("")).toBeUndefined();
      expect(mapBorderStyle("custom")).toBeUndefined();
    });
  });

  describe("mapShadingPattern", () => {
    it("should map basic shading patterns", () => {
      expect(mapShadingPattern("nil")).toBe(ST_Shd.Nil);
      expect(mapShadingPattern("clear")).toBe(ST_Shd.Clear);
      expect(mapShadingPattern("solid")).toBe(ST_Shd.Solid);
    });

    it("should map stripe patterns", () => {
      expect(mapShadingPattern("horzStripe")).toBe(ST_Shd.HorzStripe);
      expect(mapShadingPattern("vertStripe")).toBe(ST_Shd.VertStripe);
      expect(mapShadingPattern("reverseDiagStripe")).toBe(ST_Shd.ReverseDiagStripe);
      expect(mapShadingPattern("diagStripe")).toBe(ST_Shd.DiagStripe);
    });

    it("should map cross patterns", () => {
      expect(mapShadingPattern("horzCross")).toBe(ST_Shd.HorzCross);
      expect(mapShadingPattern("diagCross")).toBe(ST_Shd.DiagCross);
    });

    it("should map thin patterns", () => {
      expect(mapShadingPattern("thinHorzStripe")).toBe(ST_Shd.ThinHorzStripe);
      expect(mapShadingPattern("thinVertStripe")).toBe(ST_Shd.ThinVertStripe);
      expect(mapShadingPattern("thinReverseDiagStripe")).toBe(ST_Shd.ThinReverseDiagStripe);
      expect(mapShadingPattern("thinDiagStripe")).toBe(ST_Shd.ThinDiagStripe);
      expect(mapShadingPattern("thinHorzCross")).toBe(ST_Shd.ThinHorzCross);
      expect(mapShadingPattern("thinDiagCross")).toBe(ST_Shd.ThinDiagCross);
    });

    it("should map percentage patterns", () => {
      expect(mapShadingPattern("pct5")).toBe(ST_Shd.Pct5);
      expect(mapShadingPattern("pct10")).toBe(ST_Shd.Pct10);
      expect(mapShadingPattern("pct12")).toBe(ST_Shd.Pct12);
      expect(mapShadingPattern("pct15")).toBe(ST_Shd.Pct15);
      expect(mapShadingPattern("pct20")).toBe(ST_Shd.Pct20);
      expect(mapShadingPattern("pct25")).toBe(ST_Shd.Pct25);
      expect(mapShadingPattern("pct30")).toBe(ST_Shd.Pct30);
      expect(mapShadingPattern("pct35")).toBe(ST_Shd.Pct35);
      expect(mapShadingPattern("pct37")).toBe(ST_Shd.Pct37);
      expect(mapShadingPattern("pct40")).toBe(ST_Shd.Pct40);
      expect(mapShadingPattern("pct45")).toBe(ST_Shd.Pct45);
      expect(mapShadingPattern("pct50")).toBe(ST_Shd.Pct50);
      expect(mapShadingPattern("pct55")).toBe(ST_Shd.Pct55);
      expect(mapShadingPattern("pct60")).toBe(ST_Shd.Pct60);
      expect(mapShadingPattern("pct62")).toBe(ST_Shd.Pct62);
      expect(mapShadingPattern("pct65")).toBe(ST_Shd.Pct65);
      expect(mapShadingPattern("pct70")).toBe(ST_Shd.Pct70);
      expect(mapShadingPattern("pct75")).toBe(ST_Shd.Pct75);
      expect(mapShadingPattern("pct80")).toBe(ST_Shd.Pct80);
      expect(mapShadingPattern("pct85")).toBe(ST_Shd.Pct85);
      expect(mapShadingPattern("pct87")).toBe(ST_Shd.Pct87);
      expect(mapShadingPattern("pct90")).toBe(ST_Shd.Pct90);
      expect(mapShadingPattern("pct95")).toBe(ST_Shd.Pct95);
    });

    it("should return undefined for unknown shading patterns", () => {
      expect(mapShadingPattern("unknown")).toBeUndefined();
      expect(mapShadingPattern("")).toBeUndefined();
      expect(mapShadingPattern("pct100")).toBeUndefined();
      expect(mapShadingPattern("custom")).toBeUndefined();
    });
  });

  describe("mapParagraphAlignment", () => {
    it("should map left/start alignment", () => {
      expect(mapParagraphAlignment("left")).toBe(ST_Jc.Start);
      expect(mapParagraphAlignment("start")).toBe(ST_Jc.Start);
    });

    it("should map center alignment", () => {
      expect(mapParagraphAlignment("center")).toBe(ST_Jc.Center);
    });

    it("should map right/end alignment", () => {
      expect(mapParagraphAlignment("right")).toBe(ST_Jc.End);
      expect(mapParagraphAlignment("end")).toBe(ST_Jc.End);
    });

    it("should map justify alignment", () => {
      expect(mapParagraphAlignment("both")).toBe(ST_Jc.Both);
      expect(mapParagraphAlignment("justify")).toBe(ST_Jc.Both);
    });

    it("should map distribute alignment", () => {
      expect(mapParagraphAlignment("distribute")).toBe(ST_Jc.Distribute);
    });

    it("should map kashida alignments", () => {
      expect(mapParagraphAlignment("highKashida")).toBe(ST_Jc.HighKashida);
      expect(mapParagraphAlignment("lowKashida")).toBe(ST_Jc.LowKashida);
      expect(mapParagraphAlignment("mediumKashida")).toBe(ST_Jc.MediumKashida);
    });

    it("should map Thai distribute alignment", () => {
      expect(mapParagraphAlignment("thaiDistribute")).toBe(ST_Jc.ThaiDistribute);
    });

    it("should return undefined for unknown alignments", () => {
      expect(mapParagraphAlignment("unknown")).toBeUndefined();
      expect(mapParagraphAlignment("")).toBeUndefined();
      expect(mapParagraphAlignment("custom")).toBeUndefined();
    });
  });

  describe("mapEmphasisMark", () => {
    it("should map emphasis marks", () => {
      expect(mapEmphasisMark("none")).toBe(ST_Em.None);
      expect(mapEmphasisMark("dot")).toBe(ST_Em.Dot);
      expect(mapEmphasisMark("comma")).toBe(ST_Em.Comma);
      expect(mapEmphasisMark("circle")).toBe(ST_Em.Circle);
      expect(mapEmphasisMark("underDot")).toBe(ST_Em.UnderDot);
    });

    it("should return undefined for unknown emphasis marks", () => {
      expect(mapEmphasisMark("unknown")).toBeUndefined();
      expect(mapEmphasisMark("")).toBeUndefined();
      expect(mapEmphasisMark("custom")).toBeUndefined();
      expect(mapEmphasisMark("overDot")).toBeUndefined();
    });
  });
});