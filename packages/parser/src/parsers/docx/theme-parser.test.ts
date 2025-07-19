import { describe, it, expect } from "bun:test";
import { Effect } from "effect";
import "../../test-setup";
import {
  parseTheme,
  resolveThemeColor,
  resolveThemeFont,
  resolveThemeFontAttribute,
  DRAWINGML_NAMESPACE,
  type DocxTheme,
} from "./theme-parser";

describe("Theme Parser", () => {
  describe("parseTheme", () => {
    it("should parse complete theme with colors and fonts", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <a:theme xmlns:a="${DRAWINGML_NAMESPACE}">
          <a:themeElements>
            <a:clrScheme name="Office">
              <a:dk1>
                <a:sysClr val="windowText" lastClr="000000"/>
              </a:dk1>
              <a:lt1>
                <a:sysClr val="window" lastClr="FFFFFF"/>
              </a:lt1>
              <a:dk2>
                <a:srgbClr val="44546A"/>
              </a:dk2>
              <a:lt2>
                <a:srgbClr val="E7E6E6"/>
              </a:lt2>
              <a:accent1>
                <a:srgbClr val="4472C4"/>
              </a:accent1>
              <a:accent2>
                <a:srgbClr val="70AD47"/>
              </a:accent2>
              <a:accent3>
                <a:srgbClr val="FFC000"/>
              </a:accent3>
              <a:accent4>
                <a:srgbClr val="5B9BD5"/>
              </a:accent4>
              <a:accent5>
                <a:srgbClr val="C5504B"/>
              </a:accent5>
              <a:accent6>
                <a:srgbClr val="70AD47"/>
              </a:accent6>
              <a:hlink>
                <a:srgbClr val="0563C1"/>
              </a:hlink>
              <a:folHlink>
                <a:srgbClr val="954F72"/>
              </a:folHlink>
            </a:clrScheme>
            <a:fontScheme name="Office">
              <a:majorFont>
                <a:latin typeface="Calibri Light"/>
                <a:ea typeface=""/>
                <a:cs typeface=""/>
              </a:majorFont>
              <a:minorFont>
                <a:latin typeface="Calibri"/>
                <a:ea typeface=""/>
                <a:cs typeface=""/>
              </a:minorFont>
            </a:fontScheme>
          </a:themeElements>
        </a:theme>`;

      const result = await Effect.runPromise(parseTheme(xml));

      expect(result.colors.get("dk1")).toBe("#000000");
      expect(result.colors.get("lt1")).toBe("#FFFFFF");
      expect(result.colors.get("dk2")).toBe("#44546A");
      expect(result.colors.get("accent1")).toBe("#4472C4");
      expect(result.colors.get("hlink")).toBe("#0563C1");
      expect(result.colors.get("folHlink")).toBe("#954F72");

      expect(result.fonts.major.get("latin")).toBe("Calibri Light");
      expect(result.fonts.minor.get("latin")).toBe("Calibri");
    });

    it("should parse theme with only srgbClr colors", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <a:theme xmlns:a="${DRAWINGML_NAMESPACE}">
          <a:themeElements>
            <a:clrScheme name="Blue">
              <a:dk1>
                <a:srgbClr val="000000"/>
              </a:dk1>
              <a:lt1>
                <a:srgbClr val="FFFFFF"/>
              </a:lt1>
              <a:accent1>
                <a:srgbClr val="0000FF"/>
              </a:accent1>
            </a:clrScheme>
          </a:themeElements>
        </a:theme>`;

      const result = await Effect.runPromise(parseTheme(xml));

      expect(result.colors.get("dk1")).toBe("#000000");
      expect(result.colors.get("lt1")).toBe("#FFFFFF");
      expect(result.colors.get("accent1")).toBe("#0000FF");
    });

    it("should parse theme with extended font scripts", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <a:theme xmlns:a="${DRAWINGML_NAMESPACE}">
          <a:themeElements>
            <a:fontScheme name="Custom">
              <a:majorFont>
                <a:latin typeface="Times New Roman"/>
                <a:ea typeface="SimSun"/>
                <a:cs typeface="Arial Unicode MS"/>
              </a:majorFont>
              <a:minorFont>
                <a:latin typeface="Arial"/>
                <a:ea typeface="SimHei"/>
                <a:cs typeface="Tahoma"/>
              </a:minorFont>
            </a:fontScheme>
          </a:themeElements>
        </a:theme>`;

      const result = await Effect.runPromise(parseTheme(xml));

      expect(result.fonts.major.get("latin")).toBe("Times New Roman");
      expect(result.fonts.major.get("ea")).toBe("SimSun");
      expect(result.fonts.major.get("cs")).toBe("Arial Unicode MS");
      expect(result.fonts.minor.get("latin")).toBe("Arial");
      expect(result.fonts.minor.get("ea")).toBe("SimHei");
      expect(result.fonts.minor.get("cs")).toBe("Tahoma");
    });

    it("should handle theme without color scheme", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <a:theme xmlns:a="${DRAWINGML_NAMESPACE}">
          <a:themeElements>
            <a:fontScheme name="FontsOnly">
              <a:majorFont>
                <a:latin typeface="Calibri"/>
              </a:majorFont>
              <a:minorFont>
                <a:latin typeface="Arial"/>
              </a:minorFont>
            </a:fontScheme>
          </a:themeElements>
        </a:theme>`;

      const result = await Effect.runPromise(parseTheme(xml));

      expect(result.colors.size).toBe(0);
      expect(result.fonts.major.get("latin")).toBe("Calibri");
      expect(result.fonts.minor.get("latin")).toBe("Arial");
    });

    it("should handle theme without font scheme", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <a:theme xmlns:a="${DRAWINGML_NAMESPACE}">
          <a:themeElements>
            <a:clrScheme name="ColorsOnly">
              <a:dk1>
                <a:srgbClr val="000000"/>
              </a:dk1>
              <a:lt1>
                <a:srgbClr val="FFFFFF"/>
              </a:lt1>
            </a:clrScheme>
          </a:themeElements>
        </a:theme>`;

      const result = await Effect.runPromise(parseTheme(xml));

      expect(result.colors.get("dk1")).toBe("#000000");
      expect(result.colors.get("lt1")).toBe("#FFFFFF");
      expect(result.fonts.major.size).toBe(0);
      expect(result.fonts.minor.size).toBe(0);
    });

    it("should handle theme without themeElements", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <a:theme xmlns:a="${DRAWINGML_NAMESPACE}">
        </a:theme>`;

      const result = await Effect.runPromise(parseTheme(xml));

      expect(result.colors.size).toBe(0);
      expect(result.fonts.major.size).toBe(0);
      expect(result.fonts.minor.size).toBe(0);
    });

    it("should handle empty theme", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <a:theme xmlns:a="${DRAWINGML_NAMESPACE}">
          <a:themeElements>
            <a:clrScheme name="Empty">
            </a:clrScheme>
            <a:fontScheme name="Empty">
              <a:majorFont>
              </a:majorFont>
              <a:minorFont>
              </a:minorFont>
            </a:fontScheme>
          </a:themeElements>
        </a:theme>`;

      const result = await Effect.runPromise(parseTheme(xml));

      expect(result.colors.size).toBe(0);
      expect(result.fonts.major.size).toBe(0);
      expect(result.fonts.minor.size).toBe(0);
    });

    it("should handle colors without val attributes", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <a:theme xmlns:a="${DRAWINGML_NAMESPACE}">
          <a:themeElements>
            <a:clrScheme name="Incomplete">
              <a:dk1>
                <a:srgbClr/>
              </a:dk1>
              <a:lt1>
                <a:sysClr val="window"/>
              </a:lt1>
            </a:clrScheme>
          </a:themeElements>
        </a:theme>`;

      const result = await Effect.runPromise(parseTheme(xml));

      expect(result.colors.has("dk1")).toBe(false);
      expect(result.colors.has("lt1")).toBe(false);
    });

    it("should handle fonts without typeface attributes", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <a:theme xmlns:a="${DRAWINGML_NAMESPACE}">
          <a:themeElements>
            <a:fontScheme name="Incomplete">
              <a:majorFont>
                <a:latin/>
                <a:ea typeface="SimSun"/>
              </a:majorFont>
              <a:minorFont>
                <a:latin typeface="Arial"/>
                <a:ea/>
              </a:minorFont>
            </a:fontScheme>
          </a:themeElements>
        </a:theme>`;

      const result = await Effect.runPromise(parseTheme(xml));

      expect(result.fonts.major.has("latin")).toBe(false);
      expect(result.fonts.major.get("ea")).toBe("SimSun");
      expect(result.fonts.minor.get("latin")).toBe("Arial");
      expect(result.fonts.minor.has("ea")).toBe(false);
    });

    it("should handle non-namespaced elements", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <theme>
          <themeElements>
            <clrScheme name="NoNamespace">
              <dk1>
                <srgbClr val="000000"/>
              </dk1>
            </clrScheme>
            <fontScheme name="NoNamespace">
              <majorFont>
                <latin typeface="Arial"/>
              </majorFont>
              <minorFont>
                <latin typeface="Calibri"/>
              </minorFont>
            </fontScheme>
          </themeElements>
        </theme>`;

      const result = await Effect.runPromise(parseTheme(xml));

      expect(result.colors.get("dk1")).toBe("#000000");
      expect(result.fonts.major.get("latin")).toBe("Arial");
      expect(result.fonts.minor.get("latin")).toBe("Calibri");
    });
  });

  describe("resolveThemeColor", () => {
    const mockTheme: DocxTheme = {
      colors: new Map([
        ["dk1", "#000000"],
        ["lt1", "#FFFFFF"],
        ["dk2", "#44546A"],
        ["lt2", "#E7E6E6"],
        ["accent1", "#4472C4"],
        ["accent2", "#70AD47"],
        ["hlink", "#0563C1"],
        ["folHlink", "#954F72"],
      ]),
      fonts: {
        major: new Map(),
        minor: new Map(),
      },
    };

    it("should resolve direct theme color references", () => {
      expect(resolveThemeColor("accent1", mockTheme)).toBe("#4472C4");
      expect(resolveThemeColor("dk1", mockTheme)).toBe("#000000");
      expect(resolveThemeColor("hlink", mockTheme)).toBe("#0563C1");
    });

    it("should resolve mapped text color references", () => {
      expect(resolveThemeColor("text1", mockTheme)).toBe("#000000"); // maps to dk1
      expect(resolveThemeColor("text2", mockTheme)).toBe("#44546A"); // maps to dk2
      expect(resolveThemeColor("background1", mockTheme)).toBe("#FFFFFF"); // maps to lt1
      expect(resolveThemeColor("background2", mockTheme)).toBe("#E7E6E6"); // maps to lt2
    });

    it("should resolve short-form mapped references", () => {
      expect(resolveThemeColor("tx1", mockTheme)).toBe("#000000"); // maps to dk1
      expect(resolveThemeColor("tx2", mockTheme)).toBe("#44546A"); // maps to dk2
      expect(resolveThemeColor("bg1", mockTheme)).toBe("#FFFFFF"); // maps to lt1
      expect(resolveThemeColor("bg2", mockTheme)).toBe("#E7E6E6"); // maps to lt2
    });

    it("should return undefined for unknown color references", () => {
      expect(resolveThemeColor("unknown", mockTheme)).toBeUndefined();
      expect(resolveThemeColor("accent7", mockTheme)).toBeUndefined();
      expect(resolveThemeColor("", mockTheme)).toBeUndefined();
    });
  });

  describe("resolveThemeFont", () => {
    const mockTheme: DocxTheme = {
      colors: new Map(),
      fonts: {
        major: new Map([
          ["latin", "Calibri Light"],
          ["ea", "SimSun"],
          ["cs", "Arial Unicode MS"],
        ]),
        minor: new Map([
          ["latin", "Calibri"],
          ["ea", "SimHei"],
          ["cs", "Tahoma"],
        ]),
      },
    };

    it("should resolve major font references", () => {
      expect(resolveThemeFont("+mj-lt", mockTheme)).toBe("Calibri Light");
      expect(resolveThemeFont("+mj-ea", mockTheme)).toBe("SimSun");
      expect(resolveThemeFont("+mj-cs", mockTheme)).toBe("Arial Unicode MS");
    });

    it("should resolve minor font references", () => {
      expect(resolveThemeFont("+mn-lt", mockTheme)).toBe("Calibri");
      expect(resolveThemeFont("+mn-ea", mockTheme)).toBe("SimHei");
      expect(resolveThemeFont("+mn-cs", mockTheme)).toBe("Tahoma");
    });

    it("should return undefined for non-theme font references", () => {
      expect(resolveThemeFont("Arial", mockTheme)).toBeUndefined();
      expect(resolveThemeFont("mj-lt", mockTheme)).toBeUndefined(); // missing +
      expect(resolveThemeFont("+unknown", mockTheme)).toBeUndefined();
    });

    it("should return undefined for malformed references", () => {
      expect(resolveThemeFont("+", mockTheme)).toBeUndefined();
      expect(resolveThemeFont("+mj", mockTheme)).toBeUndefined(); // missing script
      expect(resolveThemeFont("+mj-", mockTheme)).toBeUndefined(); // empty script
      expect(resolveThemeFont("+invalid-lt", mockTheme)).toBeUndefined(); // invalid type
    });

    it("should return undefined for unknown scripts", () => {
      expect(resolveThemeFont("+mj-unknown", mockTheme)).toBeUndefined();
      expect(resolveThemeFont("+mn-unknown", mockTheme)).toBeUndefined();
    });
  });

  describe("resolveThemeFontAttribute", () => {
    const mockTheme: DocxTheme = {
      colors: new Map(),
      fonts: {
        major: new Map([
          ["latin", "Calibri Light"],
          ["ea", "SimSun"],
          ["cs", "Arial Unicode MS"],
        ]),
        minor: new Map([
          ["latin", "Calibri"],
          ["ea", "SimHei"],
          ["cs", "Tahoma"],
        ]),
      },
    };

    it("should resolve minor font attributes", () => {
      expect(resolveThemeFontAttribute("minorHAnsi", mockTheme)).toBe("Calibri");
      expect(resolveThemeFontAttribute("minorAscii", mockTheme)).toBe("Calibri");
      expect(resolveThemeFontAttribute("minorEastAsia", mockTheme)).toBe("SimHei");
      expect(resolveThemeFontAttribute("minorBidi", mockTheme)).toBe("Tahoma");
    });

    it("should resolve major font attributes", () => {
      expect(resolveThemeFontAttribute("majorHAnsi", mockTheme)).toBe("Calibri Light");
      expect(resolveThemeFontAttribute("majorAscii", mockTheme)).toBe("Calibri Light");
      expect(resolveThemeFontAttribute("majorEastAsia", mockTheme)).toBe("SimSun");
      expect(resolveThemeFontAttribute("majorBidi", mockTheme)).toBe("Arial Unicode MS");
    });

    it("should return undefined for unknown attributes", () => {
      expect(resolveThemeFontAttribute("unknown", mockTheme)).toBeUndefined();
      expect(resolveThemeFontAttribute("minorUnknown", mockTheme)).toBeUndefined();
      expect(resolveThemeFontAttribute("majorUnknown", mockTheme)).toBeUndefined();
      expect(resolveThemeFontAttribute("", mockTheme)).toBeUndefined();
    });

    it("should return undefined when theme font is not available", () => {
      const emptyTheme: DocxTheme = {
        colors: new Map(),
        fonts: {
          major: new Map(),
          minor: new Map(),
        },
      };

      expect(resolveThemeFontAttribute("minorHAnsi", emptyTheme)).toBeUndefined();
      expect(resolveThemeFontAttribute("majorHAnsi", emptyTheme)).toBeUndefined();
    });
  });
});
