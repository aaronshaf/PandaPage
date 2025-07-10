// Helper functions to map string values to ooxml-types enums
import { ST_Border, ST_Shd, ST_Jc, ST_Em } from "@browser-document-viewer/ooxml-types";

/**
 * Convert string border style to ST_Border enum value
 */
export function mapBorderStyle(style: string): ST_Border | undefined {
  // The enum values match the string values, so we can cast safely if valid
  switch (style) {
    case "nil":
      return ST_Border.Nil;
    case "none":
      return ST_Border.None;
    case "single":
      return ST_Border.Single;
    case "thick":
      return ST_Border.Thick;
    case "double":
      return ST_Border.Double;
    case "dotted":
      return ST_Border.Dotted;
    case "dashed":
      return ST_Border.Dashed;
    case "dotDash":
      return ST_Border.DotDash;
    case "dotDotDash":
      return ST_Border.DotDotDash;
    case "triple":
      return ST_Border.Triple;
    case "thinThickSmallGap":
      return ST_Border.ThinThickSmallGap;
    case "thickThinSmallGap":
      return ST_Border.ThickThinSmallGap;
    case "thinThickThinSmallGap":
      return ST_Border.ThinThickThinSmallGap;
    case "thinThickMediumGap":
      return ST_Border.ThinThickMediumGap;
    case "thickThinMediumGap":
      return ST_Border.ThickThinMediumGap;
    case "thinThickThinMediumGap":
      return ST_Border.ThinThickThinMediumGap;
    case "thinThickLargeGap":
      return ST_Border.ThinThickLargeGap;
    case "thickThinLargeGap":
      return ST_Border.ThickThinLargeGap;
    case "thinThickThinLargeGap":
      return ST_Border.ThinThickThinLargeGap;
    case "wave":
      return ST_Border.Wave;
    case "doubleWave":
      return ST_Border.DoubleWave;
    case "dashSmallGap":
      return ST_Border.DashSmallGap;
    case "dashDotStroked":
      return ST_Border.DashDotStroked;
    case "threeDEmboss":
      return ST_Border.ThreeDEmboss;
    case "threeDEngrave":
      return ST_Border.ThreeDEngrave;
    case "outset":
      return ST_Border.Outset;
    case "inset":
      return ST_Border.Inset;
    default:
      return undefined;
  }
}

/**
 * Convert string shading pattern to ST_Shd enum value
 */
export function mapShadingPattern(pattern: string): ST_Shd | undefined {
  switch (pattern) {
    case "nil":
      return ST_Shd.Nil;
    case "clear":
      return ST_Shd.Clear;
    case "solid":
      return ST_Shd.Solid;
    case "horzStripe":
      return ST_Shd.HorzStripe;
    case "vertStripe":
      return ST_Shd.VertStripe;
    case "reverseDiagStripe":
      return ST_Shd.ReverseDiagStripe;
    case "diagStripe":
      return ST_Shd.DiagStripe;
    case "horzCross":
      return ST_Shd.HorzCross;
    case "diagCross":
      return ST_Shd.DiagCross;
    case "thinHorzStripe":
      return ST_Shd.ThinHorzStripe;
    case "thinVertStripe":
      return ST_Shd.ThinVertStripe;
    case "thinReverseDiagStripe":
      return ST_Shd.ThinReverseDiagStripe;
    case "thinDiagStripe":
      return ST_Shd.ThinDiagStripe;
    case "thinHorzCross":
      return ST_Shd.ThinHorzCross;
    case "thinDiagCross":
      return ST_Shd.ThinDiagCross;
    case "pct5":
      return ST_Shd.Pct5;
    case "pct10":
      return ST_Shd.Pct10;
    case "pct12":
      return ST_Shd.Pct12;
    case "pct15":
      return ST_Shd.Pct15;
    case "pct20":
      return ST_Shd.Pct20;
    case "pct25":
      return ST_Shd.Pct25;
    case "pct30":
      return ST_Shd.Pct30;
    case "pct35":
      return ST_Shd.Pct35;
    case "pct37":
      return ST_Shd.Pct37;
    case "pct40":
      return ST_Shd.Pct40;
    case "pct45":
      return ST_Shd.Pct45;
    case "pct50":
      return ST_Shd.Pct50;
    case "pct55":
      return ST_Shd.Pct55;
    case "pct60":
      return ST_Shd.Pct60;
    case "pct62":
      return ST_Shd.Pct62;
    case "pct65":
      return ST_Shd.Pct65;
    case "pct70":
      return ST_Shd.Pct70;
    case "pct75":
      return ST_Shd.Pct75;
    case "pct80":
      return ST_Shd.Pct80;
    case "pct85":
      return ST_Shd.Pct85;
    case "pct87":
      return ST_Shd.Pct87;
    case "pct90":
      return ST_Shd.Pct90;
    case "pct95":
      return ST_Shd.Pct95;
    default:
      return undefined;
  }
}

/**
 * Convert string alignment to ST_Jc enum value
 */
export function mapParagraphAlignment(alignment: string): ST_Jc | undefined {
  switch (alignment) {
    case "left":
    case "start":
      return ST_Jc.Start;
    case "center":
      return ST_Jc.Center;
    case "right":
    case "end":
      return ST_Jc.End;
    case "both":
    case "justify":
      return ST_Jc.Both;
    case "distribute":
      return ST_Jc.Distribute;
    case "highKashida":
      return ST_Jc.HighKashida;
    case "lowKashida":
      return ST_Jc.LowKashida;
    case "mediumKashida":
      return ST_Jc.MediumKashida;
    case "thaiDistribute":
      return ST_Jc.ThaiDistribute;
    default:
      return undefined;
  }
}

/**
 * Convert string emphasis mark to ST_Em enum value
 */
export function mapEmphasisMark(emphasis: string): ST_Em | undefined {
  switch (emphasis) {
    case "none":
      return ST_Em.None;
    case "dot":
      return ST_Em.Dot;
    case "comma":
      return ST_Em.Comma;
    case "circle":
      return ST_Em.Circle;
    case "underDot":
      return ST_Em.UnderDot;
    default:
      return undefined;
  }
}
