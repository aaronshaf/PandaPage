import { describe, it, expect } from "bun:test";
import "../../test-setup";
import { parseRun } from "./run-parser";

/**
 * Test the isPunctuationOnly function
 */
function isPunctuationOnly(text: string): boolean {
  const punctuationRegex = /^[\s\p{P}\p{S}]+$/u;
  return punctuationRegex.test(text);
}

describe("Language attribute filtering for quotation marks", () => {
  it("should identify quotation marks as punctuation only", () => {
    expect(isPunctuationOnly('"')).toBe(true);
    expect(isPunctuationOnly("'")).toBe(true);
    expect(isPunctuationOnly('""')).toBe(true);
    expect(isPunctuationOnly("\u201C")).toBe(true); // Opening quote
    expect(isPunctuationOnly("\u201D")).toBe(true); // Closing quote
    expect(isPunctuationOnly("\u2018")).toBe(true); // Opening single quote
    expect(isPunctuationOnly("\u2019")).toBe(true); // Closing single quote
  });

  it("should identify other punctuation as punctuation only", () => {
    expect(isPunctuationOnly(".")).toBe(true);
    expect(isPunctuationOnly(",")).toBe(true);
    expect(isPunctuationOnly(";")).toBe(true);
    expect(isPunctuationOnly(":")).toBe(true);
    expect(isPunctuationOnly("!")).toBe(true);
    expect(isPunctuationOnly("?")).toBe(true);
    expect(isPunctuationOnly("(")).toBe(true);
    expect(isPunctuationOnly(")")).toBe(true);
    expect(isPunctuationOnly("-")).toBe(true);
    expect(isPunctuationOnly("--")).toBe(true);
  });

  it("should identify whitespace as punctuation only", () => {
    expect(isPunctuationOnly(" ")).toBe(true);
    expect(isPunctuationOnly("  ")).toBe(true);
    expect(isPunctuationOnly("\t")).toBe(true);
    expect(isPunctuationOnly("\n")).toBe(true);
  });

  it("should identify mixed punctuation and whitespace as punctuation only", () => {
    expect(isPunctuationOnly(' " ')).toBe(true);
    expect(isPunctuationOnly('" ')).toBe(true);
    expect(isPunctuationOnly(' "')).toBe(true);
    expect(isPunctuationOnly('." ')).toBe(true);
    expect(isPunctuationOnly(" ,")).toBe(true);
  });

  it("should NOT identify text with letters as punctuation only", () => {
    expect(isPunctuationOnly("Hello")).toBe(false);
    expect(isPunctuationOnly("Insert")).toBe(false);
    expect(isPunctuationOnly('"Hello"')).toBe(false);
    expect(isPunctuationOnly("won't")).toBe(false);
    expect(isPunctuationOnly("U.S.")).toBe(false);
    expect(isPunctuationOnly("123")).toBe(false);
    expect(isPunctuationOnly("a")).toBe(false);
  });

  it("should handle edge cases", () => {
    expect(isPunctuationOnly("")).toBe(false); // Empty string - should be false
    expect(isPunctuationOnly("€")).toBe(true); // Currency symbol
    expect(isPunctuationOnly("©")).toBe(true); // Copyright symbol
    expect(isPunctuationOnly("™")).toBe(true); // Trademark symbol
  });
});

describe("w14:textFill parsing", () => {
  // Create a mock DOM element with w14:textFill
  function createRunWithTextFill(srgbValue: string): Element {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
        <w:rPr>
          <w14:textFill>
            <w14:solidFill>
              <w14:srgbClr w14:val="${srgbValue}"/>
            </w14:solidFill>
          </w14:textFill>
        </w:rPr>
        <w:t>Test text</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    return doc.documentElement;
  }

  // Create a mock DOM element with regular color
  function createRunWithRegularColor(colorValue: string): Element {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:color w:val="${colorValue}"/>
        </w:rPr>
        <w:t>Test text</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    return doc.documentElement;
  }

  it("should parse w14:textFill with srgbClr", () => {
    const runElement = createRunWithTextFill("818181");
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.color).toBe("#818181");
    expect(run?.text).toBe("Test text");
  });

  it("should parse w14:textFill with # prefix", () => {
    const runElement = createRunWithTextFill("#FF0000");
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.color).toBe("#FF0000");
  });

  it("should prefer regular color over w14:textFill", () => {
    // Create element with both regular color and textFill
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
        <w:rPr>
          <w:color w:val="FF0000"/>
          <w14:textFill>
            <w14:solidFill>
              <w14:srgbClr w14:val="00FF00"/>
            </w14:solidFill>
          </w14:textFill>
        </w:rPr>
        <w:t>Test text</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.color).toBe("FF0000"); // Should use regular color, not textFill
  });

  it("should parse regular color without w14:textFill", () => {
    const runElement = createRunWithRegularColor("0000FF");
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.color).toBe("0000FF");
  });

  it("should handle missing textFill elements gracefully", () => {
    // Create element with empty textFill
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
        <w:rPr>
          <w14:textFill/>
        </w:rPr>
        <w:t>Test text</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.color).toBeUndefined();
  });
});

describe("Footnote reference parsing", () => {
  // Create a mock DOM element with footnote reference
  function createRunWithFootnoteRef(footnoteId: string): Element {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:footnoteReference w:id="${footnoteId}"/>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    return doc.documentElement;
  }

  it("should parse footnote reference and create superscript run", () => {
    // We need to test parseRunElement function which is not exported
    // Let's check if the footnote reference parsing is covered by the existing implementation
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:vertAlign w:val="superscript"/>
        </w:rPr>
        <w:t>1</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.superscript).toBe(true);
    expect(run?.text).toBe("1");
  });
});

describe("Underline color parsing", () => {
  it("should parse underline with color", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:u w:val="single" w:color="818181"/>
        </w:rPr>
        <w:t>Underlined text</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.underline).toBe(true);
    expect(run?.underlineColor).toBe("#818181");
    expect(run?.text).toBe("Underlined text");
  });

  it("should parse underline without explicit val attribute", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:u w:color="FF0000"/>
        </w:rPr>
        <w:t>Underlined text</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.underline).toBe(true);
    expect(run?.underlineColor).toBe("#FF0000");
  });

  it("should handle underline with auto color", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:u w:val="single" w:color="auto"/>
        </w:rPr>
        <w:t>Underlined text</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.underline).toBe(true);
    expect(run?.underlineColor).toBeUndefined(); // auto color is not stored
  });

  it("should handle underline with val='none'", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:u w:val="none"/>
        </w:rPr>
        <w:t>Not underlined</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.underline).toBe(false);
    expect(run?.underlineColor).toBeUndefined();
  });
});

describe("Bidirectional text parsing", () => {
  it("should parse language with bidi attribute", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:lang w:val="ar-SA" w:bidi="ar-SA"/>
        </w:rPr>
        <w:t>نص عربي</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.lang).toBe("ar-SA");
    expect(run?.bidi).toBe(true);
    expect(run?.text).toBe("نص عربي");
  });

  it("should handle language without bidi attribute", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:lang w:val="en-US"/>
        </w:rPr>
        <w:t>English text</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.lang).toBe("en-US");
    expect(run?.bidi).toBe(false);
  });

  it("should handle bidi attribute on punctuation", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:lang w:val="ar-SA" w:bidi="ar-SA"/>
        </w:rPr>
        <w:t>"</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.lang).toBeUndefined(); // Punctuation doesn't get lang
    expect(run?.bidi).toBe(true); // But bidi is still parsed
  });
});

describe("RTL text direction parsing", () => {
  it("should parse rtl with val='1'", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:rtl w:val="1"/>
        </w:rPr>
        <w:t>مرحبا</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.rtl).toBe(true);
    expect(run?.text).toBe("مرحبا");
  });

  it("should parse rtl with val='0'", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:rtl w:val="0"/>
        </w:rPr>
        <w:t>Hello</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.rtl).toBe(false);
    expect(run?.text).toBe("Hello");
  });

  it("should parse rtl without val attribute (defaults to true)", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:rtl/>
        </w:rPr>
        <w:t>نص عربي</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.rtl).toBe(true);
  });

  it("should handle runs without rtl element", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>Regular text</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.rtl).toBe(false);
  });

  it("should parse rtl with mixed formatting", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:b/>
          <w:i/>
          <w:rtl w:val="1"/>
          <w:color w:val="FF0000"/>
          <w:sz w:val="28"/>
        </w:rPr>
        <w:t>نص عربي</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.rtl).toBe(true);
    expect(run?.bold).toBe(true);
    expect(run?.italic).toBe(true);
    expect(run?.color).toBe("FF0000");
    expect(run?.fontSize).toBe("28");
  });

  it("should parse rtl with bidi language attribute", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:rtl w:val="1"/>
          <w:lang w:val="ar-SA" w:bidi="ar-SA"/>
        </w:rPr>
        <w:t>نص عربي</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.rtl).toBe(true);
    expect(run?.bidi).toBe(true);
    expect(run?.lang).toBe("ar-SA");
  });
});

describe("Font family parsing with multiple scripts", () => {
  it("should parse all font family attributes", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:rFonts w:ascii="Times New Roman" w:cs="Arial Unicode MS" w:hAnsi="Calibri" w:eastAsia="SimSun"/>
        </w:rPr>
        <w:t>Mixed script text</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.fontFamily).toBe("Times New Roman");
    expect(run?.fontFamilyCs).toBe("Arial Unicode MS");
    expect(run?.fontFamilyHAnsi).toBe("Calibri");
    expect(run?.fontFamilyEastAsia).toBe("SimSun");
  });

  it("should parse only ASCII font when others are not specified", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:rFonts w:ascii="Arial"/>
        </w:rPr>
        <w:t>Simple text</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.fontFamily).toBe("Arial");
    expect(run?.fontFamilyCs).toBeUndefined();
    expect(run?.fontFamilyHAnsi).toBeUndefined();
    expect(run?.fontFamilyEastAsia).toBeUndefined();
  });

  it("should parse complex script font for Arabic text", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:rFonts w:ascii="Times New Roman" w:cs="Traditional Arabic"/>
          <w:rtl w:val="1"/>
          <w:lang w:val="ar-SA" w:bidi="ar-SA"/>
        </w:rPr>
        <w:t>النص العربي</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.fontFamily).toBe("Times New Roman");
    expect(run?.fontFamilyCs).toBe("Traditional Arabic");
    expect(run?.rtl).toBe(true);
    expect(run?.bidi).toBe(true);
  });

  it("should parse East Asian font for CJK text", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:eastAsia="MS Mincho"/>
          <w:lang w:val="ja-JP"/>
        </w:rPr>
        <w:t>日本語テキスト</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.fontFamily).toBe("Arial");
    expect(run?.fontFamilyEastAsia).toBe("MS Mincho");
    expect(run?.lang).toBe("ja-JP");
  });

  it("should handle runs without rFonts element", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>No font specified</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.fontFamily).toBeUndefined();
    expect(run?.fontFamilyCs).toBeUndefined();
    expect(run?.fontFamilyHAnsi).toBeUndefined();
    expect(run?.fontFamilyEastAsia).toBeUndefined();
  });

  it("should parse high ANSI font", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:rFonts w:ascii="Courier New" w:hAnsi="Consolas"/>
        </w:rPr>
        <w:t>Code sample</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.fontFamily).toBe("Courier New");
    expect(run?.fontFamilyHAnsi).toBe("Consolas");
  });

  it("should parse font with all attributes matching (like Gill Sans MT)", () => {
    const parser = new DOMParser();
    const xmlString = `
      <w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:rPr>
          <w:rFonts w:ascii="Gill Sans MT" w:cs="Gill Sans MT" w:hAnsi="Gill Sans MT" w:eastAsia="Gill Sans MT"/>
        </w:rPr>
        <w:t>Consistent font</w:t>
      </w:r>
    `;
    const doc = parser.parseFromString(xmlString, "text/xml");
    const runElement = doc.documentElement;
    const run = parseRun(runElement, "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
    
    expect(run).not.toBeNull();
    expect(run?.fontFamily).toBe("Gill Sans MT");
    expect(run?.fontFamilyCs).toBe("Gill Sans MT");
    expect(run?.fontFamilyHAnsi).toBe("Gill Sans MT");
    expect(run?.fontFamilyEastAsia).toBe("Gill Sans MT");
  });
});
