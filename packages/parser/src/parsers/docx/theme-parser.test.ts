import { describe, it, expect } from "bun:test";
import "../../test-setup";
import { resolveThemeFontAttribute, resolveThemeColor, resolveThemeFont } from "./theme-parser";
import type { DocxTheme } from "./theme-parser";

describe("Theme Font Attribute Resolution", () => {
  const mockTheme: DocxTheme = {
    colors: new Map([
      ["dk1", "#000000"],
      ["lt1", "#FFFFFF"],
      ["accent1", "#4F81BD"],
      ["text1", "#000000"],
      ["background1", "#FFFFFF"]
    ]),
    fonts: {
      major: new Map([
        ["latin", "Ubuntu"],
        ["ea", "SimHei"],
        ["cs", "Arial Unicode MS"]
      ]),
      minor: new Map([
        ["latin", "Ubuntu"],
        ["ea", "SimSun"],
        ["cs", "Arial Unicode MS"]
      ])
    }
  };

  it("should resolve minor font theme attributes", () => {
    expect(resolveThemeFontAttribute("minorHAnsi", mockTheme)).toBe("Ubuntu");
    expect(resolveThemeFontAttribute("minorAscii", mockTheme)).toBe("Ubuntu");
    expect(resolveThemeFontAttribute("minorEastAsia", mockTheme)).toBe("SimSun");
    expect(resolveThemeFontAttribute("minorBidi", mockTheme)).toBe("Arial Unicode MS");
  });

  it("should resolve major font theme attributes", () => {
    expect(resolveThemeFontAttribute("majorHAnsi", mockTheme)).toBe("Ubuntu");
    expect(resolveThemeFontAttribute("majorAscii", mockTheme)).toBe("Ubuntu");
    expect(resolveThemeFontAttribute("majorEastAsia", mockTheme)).toBe("SimHei");
    expect(resolveThemeFontAttribute("majorBidi", mockTheme)).toBe("Arial Unicode MS");
  });

  it("should return undefined for unknown theme attributes", () => {
    expect(resolveThemeFontAttribute("unknownTheme", mockTheme)).toBeUndefined();
    expect(resolveThemeFontAttribute("", mockTheme)).toBeUndefined();
  });

  it("should return undefined when font is not in theme", () => {
    const emptyTheme: DocxTheme = {
      colors: new Map(),
      fonts: {
        major: new Map(),
        minor: new Map()
      }
    };
    
    expect(resolveThemeFontAttribute("minorHAnsi", emptyTheme)).toBeUndefined();
  });
});

describe("Theme Color Resolution", () => {
  const mockTheme: DocxTheme = {
    colors: new Map([
      ["dk1", "#000000"],
      ["lt1", "#FFFFFF"],
      ["accent1", "#4F81BD"],
      ["accent2", "#C0504D"]
    ]),
    fonts: {
      major: new Map(),
      minor: new Map()
    }
  };

  it("should resolve direct color references", () => {
    expect(resolveThemeColor("dk1", mockTheme)).toBe("#000000");
    expect(resolveThemeColor("lt1", mockTheme)).toBe("#FFFFFF");
    expect(resolveThemeColor("accent1", mockTheme)).toBe("#4F81BD");
  });

  it("should resolve mapped color references", () => {
    expect(resolveThemeColor("text1", mockTheme)).toBe("#000000"); // maps to dk1
    expect(resolveThemeColor("background1", mockTheme)).toBe("#FFFFFF"); // maps to lt1
    expect(resolveThemeColor("tx1", mockTheme)).toBe("#000000"); // maps to dk1
    expect(resolveThemeColor("bg1", mockTheme)).toBe("#FFFFFF"); // maps to lt1
  });

  it("should return undefined for unknown colors", () => {
    expect(resolveThemeColor("unknownColor", mockTheme)).toBeUndefined();
    expect(resolveThemeColor("", mockTheme)).toBeUndefined();
  });
});

describe("Theme Font Resolution (Traditional)", () => {
  const mockTheme: DocxTheme = {
    colors: new Map(),
    fonts: {
      major: new Map([
        ["latin", "Ubuntu"],
        ["ea", "SimHei"]
      ]),
      minor: new Map([
        ["latin", "Ubuntu"],
        ["ea", "SimSun"]
      ])
    }
  };

  it("should resolve major theme font references", () => {
    expect(resolveThemeFont("+mj-lt", mockTheme)).toBe("Ubuntu");
    expect(resolveThemeFont("+mj-ea", mockTheme)).toBe("SimHei");
  });

  it("should resolve minor theme font references", () => {
    expect(resolveThemeFont("+mn-lt", mockTheme)).toBe("Ubuntu");
    expect(resolveThemeFont("+mn-ea", mockTheme)).toBe("SimSun");
  });

  it("should return undefined for non-theme font references", () => {
    expect(resolveThemeFont("Times New Roman", mockTheme)).toBeUndefined();
    expect(resolveThemeFont("Arial", mockTheme)).toBeUndefined();
  });

  it("should return undefined for invalid theme references", () => {
    expect(resolveThemeFont("+invalid", mockTheme)).toBeUndefined();
    expect(resolveThemeFont("+mj", mockTheme)).toBeUndefined();
    expect(resolveThemeFont("+unknown-script", mockTheme)).toBeUndefined();
  });

  it("should handle missing theme fonts gracefully", () => {
    expect(resolveThemeFont("+mj-cs", mockTheme)).toBeUndefined(); // cs not in theme
    expect(resolveThemeFont("+mn-cs", mockTheme)).toBeUndefined(); // cs not in theme
  });
});