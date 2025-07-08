import { describe, test, expect, mock } from "bun:test";
import { Effect } from "effect";
import {
  readDocx,
  parseDocumentXml,
  parseNumbering,
  parseParagraph,
  DocxParseError
} from "../src/formats/docx/docx-reader";

describe("docx-reader", () => {
  describe("readDocx error handling", () => {
    test("should handle general read errors", async () => {
      // Create an invalid buffer that will cause unzip to fail
      const buffer = new ArrayBuffer(10);
      const view = new Uint8Array(buffer);
      // Fill with invalid data
      view.fill(0xFF);
      
      const result = await Effect.runPromiseExit(readDocx(buffer));

      expect(result._tag).toBe("Failure");
      if (result._tag === "Failure") {
        const error = result.cause as any;
        expect(error._tag).toBe("Fail");
        const errorValue = error.error;
        expect(errorValue).toBeInstanceOf(DocxParseError);
        expect(errorValue.message).toContain("Failed to read DOCX");
      }
    });

    test("should handle missing document.xml", async () => {
      const fflate = await import("fflate");
      
      // Create a valid zip but without document.xml
      const files: Record<string, Uint8Array> = {
        "word/styles.xml": fflate.strToU8(`<?xml version="1.0"?><styles/>`),
      };
      
      const zipped = fflate.zipSync(files);
      const result = await Effect.runPromiseExit(readDocx(zipped.buffer as ArrayBuffer));

      expect(result._tag).toBe("Failure");
      if (result._tag === "Failure") {
        const error = result.cause as any;
        expect(error._tag).toBe("Fail");
        const errorValue = error.error;
        expect(errorValue).toBeInstanceOf(DocxParseError);
        expect(errorValue.message).toBe("No word/document.xml found in DOCX file");
      }
    });
  });

  describe("parseNumberingXml", () => {
    // This function is private, but we can test it indirectly through readDocx
    // by providing a mock DOCX with numbering.xml content
    test("should parse numbering definitions through readDocx", async () => {
      // We need to import fflate to create a mock DOCX file
      const fflate = await import("fflate");
      
      // Create minimal DOCX structure with numbering
      const files: Record<string, Uint8Array> = {
        "word/document.xml": fflate.strToU8(`<?xml version="1.0"?>
          <w:document>
            <w:body>
              <w:p>
                <w:pPr>
                  <w:numPr>
                    <w:numId w:val="1"/>
                    <w:ilvl w:val="0"/>
                  </w:numPr>
                </w:pPr>
                <w:r><w:t>Numbered item</w:t></w:r>
              </w:p>
            </w:body>
          </w:document>`),
        "word/numbering.xml": fflate.strToU8(`<?xml version="1.0"?>
          <w:numbering>
            <w:abstractNum w:abstractNumId="0">
              <w:lvl w:ilvl="0">
                <w:numFmt w:val="decimal"/>
                <w:lvlText w:val="%1."/>
              </w:lvl>
              <w:lvl w:ilvl="1">
                <w:numFmt w:val="lowerLetter"/>
                <w:lvlText w:val="%2)"/>
              </w:lvl>
            </w:abstractNum>
            <w:abstractNum w:abstractNumId="1">
              <w:numStyleLink w:val="ListNumber"/>
            </w:abstractNum>
            <w:num w:numId="1">
              <w:abstractNumId w:val="0"/>
            </w:num>
          </w:numbering>`)
      };
      
      // Create a zip buffer
      const zipped = fflate.zipSync(files);
      const buffer = zipped.buffer;
      
      const result = await Effect.runPromise(readDocx(buffer as ArrayBuffer));
      
      expect(result.numbering).toBeDefined();
      expect(result.numbering?.instances.size).toBe(1);
      expect(result.numbering?.instances.get("1")).toBe("0");
      expect(result.numbering?.abstractFormats.size).toBeGreaterThanOrEqual(1);
      
      const format = result.numbering?.abstractFormats.get("0");
      expect(format).toBeDefined();
      if (format) {
        expect(format.levels.size).toBe(2);
        expect(format.levels.get(0)).toMatchObject({
          numFmt: "decimal",
          lvlText: "%1."
        });
        expect(format.levels.get(1)).toMatchObject({
          numFmt: "lowerLetter",
          lvlText: "%2)"
        });
      }
    });

    test("should handle style links in numbering", async () => {
      const fflate = await import("fflate");
      
      // Create DOCX with style links
      const files: Record<string, Uint8Array> = {
        "word/document.xml": fflate.strToU8(`<?xml version="1.0"?>
          <w:document>
            <w:body>
              <w:p>
                <w:r><w:t>Test</w:t></w:r>
              </w:p>
            </w:body>
          </w:document>`),
        "word/numbering.xml": fflate.strToU8(`<?xml version="1.0"?>
          <w:numbering>
            <w:abstractNum w:abstractNumId="0">
              <w:lvl w:ilvl="0">
                <w:numFmt w:val="bullet"/>
                <w:lvlText w:val="•"/>
              </w:lvl>
            </w:abstractNum>
            <w:abstractNum w:abstractNumId="1">
              <w:numStyleLink w:val="BulletList"/>
            </w:abstractNum>
            <w:abstractNum w:abstractNumId="2">
              <w:styleLink w:val="BulletList"/>
              <w:lvl w:ilvl="0">
                <w:numFmt w:val="bullet"/>
                <w:lvlText w:val="◦"/>
              </w:lvl>
            </w:abstractNum>
            <w:num w:numId="1">
              <w:abstractNumId w:val="1"/>
            </w:num>
            <w:num w:numId="2">
              <w:abstractNumId w:val="2"/>
            </w:num>
          </w:numbering>`)
      };
      
      const zipped = fflate.zipSync(files);
      const result = await Effect.runPromise(readDocx(zipped.buffer as ArrayBuffer));
      
      expect(result.numbering).toBeDefined();
      expect(result.numbering?.abstractFormats.size).toBeGreaterThanOrEqual(2);
    });

    test("should handle empty numbering elements", async () => {
      const fflate = await import("fflate");
      
      const files: Record<string, Uint8Array> = {
        "word/document.xml": fflate.strToU8(`<?xml version="1.0"?>
          <w:document>
            <w:body>
              <w:p>
                <w:r><w:t>Test</w:t></w:r>
              </w:p>
            </w:body>
          </w:document>`),
        "word/numbering.xml": fflate.strToU8(`<?xml version="1.0"?>
          <w:numbering>
            <w:abstractNum w:abstractNumId="">
              <w:lvl w:ilvl="0">
                <w:numFmt w:val="decimal"/>
              </w:lvl>
            </w:abstractNum>
            <w:num w:numId="">
              <w:abstractNumId w:val=""/>
            </w:num>
            <w:num w:numId="3">
              <w:abstractNumId w:val=""/>
            </w:num>
          </w:numbering>`)
      };
      
      const zipped = fflate.zipSync(files);
      const result = await Effect.runPromise(readDocx(zipped.buffer as ArrayBuffer));
      
      expect(result.numbering).toBeDefined();
      // Should skip entries with empty IDs
      expect(result.numbering?.instances.size).toBe(0);
      expect(result.numbering?.abstractFormats.size).toBe(0);
    });

    test("should handle numbering with missing attributes", async () => {
      const fflate = await import("fflate");
      
      const files: Record<string, Uint8Array> = {
        "word/document.xml": fflate.strToU8(`<?xml version="1.0"?>
          <w:document>
            <w:body>
              <w:p>
                <w:r><w:t>Test</w:t></w:r>
              </w:p>
            </w:body>
          </w:document>`),
        "word/numbering.xml": fflate.strToU8(`<?xml version="1.0"?>
          <w:numbering>
            <w:abstractNum w:abstractNumId="0">
              <w:lvl w:ilvl="0">
                <!-- Missing numFmt, should default to bullet -->
                <w:lvlText w:val="*"/>
              </w:lvl>
              <w:lvl w:ilvl="1">
                <w:numFmt w:val="decimal"/>
                <!-- Missing lvlText, should default to bullet -->
              </w:lvl>
            </w:abstractNum>
            <w:num w:numId="1">
              <w:abstractNumId w:val="0"/>
            </w:num>
          </w:numbering>`)
      };
      
      const zipped = fflate.zipSync(files);
      const result = await Effect.runPromise(readDocx(zipped.buffer as ArrayBuffer));
      
      expect(result.numbering).toBeDefined();
      const format = result.numbering?.abstractFormats.get("0");
      expect(format).toBeDefined();
      expect(format?.levels.get(0)).toMatchObject({
        numFmt: "bullet",
        lvlText: "*"
      });
      expect(format?.levels.get(1)).toMatchObject({
        numFmt: "decimal",
        lvlText: "•"
      });
    });

    test("should handle complex style link resolution", async () => {
      const fflate = await import("fflate");
      
      const files: Record<string, Uint8Array> = {
        "word/document.xml": fflate.strToU8(`<?xml version="1.0"?>
          <w:document>
            <w:body>
              <w:p>
                <w:r><w:t>Test</w:t></w:r>
              </w:p>
            </w:body>
          </w:document>`),
        "word/numbering.xml": fflate.strToU8(`<?xml version="1.0"?>
          <w:numbering>
            <w:abstractNum w:abstractNumId="0">
              <w:styleLink w:val="ListStyle1"/>
              <w:lvl w:ilvl="0">
                <w:numFmt w:val="decimal"/>
                <w:lvlText w:val="%1."/>
              </w:lvl>
            </w:abstractNum>
            <w:abstractNum w:abstractNumId="1">
              <w:numStyleLink w:val="ListStyle1"/>
            </w:abstractNum>
            <w:abstractNum w:abstractNumId="2">
              <w:numStyleLink w:val="NonExistentStyle"/>
            </w:abstractNum>
            <w:num w:numId="1">
              <w:abstractNumId w:val="1"/>
            </w:num>
            <w:num w:numId="2">
              <w:abstractNumId w:val="2"/>
            </w:num>
          </w:numbering>`)
      };
      
      const zipped = fflate.zipSync(files);
      const result = await Effect.runPromise(readDocx(zipped.buffer as ArrayBuffer));
      
      expect(result.numbering).toBeDefined();
      // Abstract 1 should resolve to abstract 0's format
      const format1 = result.numbering?.abstractFormats.get("1");
      const format0 = result.numbering?.abstractFormats.get("0");
      if (format0 && format1) {
        expect(format1).toEqual(format0);
      }
      
      // Abstract 2 should not have a format (unresolved style link)
      const format2 = result.numbering?.abstractFormats.get("2");
      expect(format2).toBeUndefined();
    });

    test("should parse multiple levels correctly", async () => {
      const fflate = await import("fflate");
      
      const files: Record<string, Uint8Array> = {
        "word/document.xml": fflate.strToU8(`<?xml version="1.0"?>
          <w:document>
            <w:body>
              <w:p>
                <w:r><w:t>Test</w:t></w:r>
              </w:p>
            </w:body>
          </w:document>`),
        "word/numbering.xml": fflate.strToU8(`<?xml version="1.0"?>
          <w:numbering>
            <w:abstractNum w:abstractNumId="0">
              <w:lvl w:ilvl="0">
                <w:numFmt w:val="decimal"/>
                <w:lvlText w:val="%1."/>
              </w:lvl>
              <w:lvl w:ilvl="1">
                <w:numFmt w:val="lowerLetter"/>
                <w:lvlText w:val="%2)"/>
              </w:lvl>
              <w:lvl w:ilvl="2">
                <w:numFmt w:val="lowerRoman"/>
                <w:lvlText w:val="%3."/>
              </w:lvl>
            </w:abstractNum>
            <w:num w:numId="1">
              <w:abstractNumId w:val="0"/>
            </w:num>
          </w:numbering>`)
      };
      
      const zipped = fflate.zipSync(files);
      const result = await Effect.runPromise(readDocx(zipped.buffer as ArrayBuffer));
      
      const format = result.numbering?.abstractFormats.get("0");
      expect(format?.levels.size).toBe(3);
      expect(format?.levels.get(2)).toMatchObject({
        numFmt: "lowerRoman",
        lvlText: "%3."
      });
    });
  });

  describe("parseNumbering with DOM elements", () => {
    test("should parse numbering from DOM elements", () => {
      // Create mock DOM elements
      const mockNumberingRoot = {
        querySelectorAll: (selector: string) => {
          if (selector === "abstractNum") {
            return [{
              getAttribute: (attr: string) => attr === "abstractNumId" ? "0" : null,
              querySelectorAll: (lvlSelector: string) => {
                if (lvlSelector === "lvl") {
                  return [{
                    getAttribute: (attr: string) => attr === "ilvl" ? "0" : null,
                    querySelector: (innerSelector: string) => {
                      if (innerSelector === "numFmt") {
                        return { getAttribute: (a: string) => a === "val" ? "decimal" : null };
                      }
                      if (innerSelector === "lvlText") {
                        return { getAttribute: (a: string) => a === "val" ? "%1." : null };
                      }
                      return null;
                    }
                  }];
                }
                return [];
              }
            }];
          }
          if (selector === "num") {
            return [{
              getAttribute: (attr: string) => attr === "numId" ? "1" : null,
              querySelector: (innerSelector: string) => {
                if (innerSelector === "abstractNumId") {
                  return { getAttribute: (a: string) => a === "val" ? "0" : null };
                }
                return null;
              }
            }];
          }
          return [];
        }
      } as any;

      const result = parseNumbering(mockNumberingRoot);
      
      expect(result.instances.size).toBe(1);
      expect(result.instances.get("1")).toBe("0");
      expect(result.abstractFormats.size).toBe(1);
      
      const format = result.abstractFormats.get("0");
      expect(format?.levels.size).toBe(1);
      expect(format?.levels.get(0)).toMatchObject({
        numFmt: "decimal",
        lvlText: "%1."
      });
    });

    test("should handle missing attributes in DOM elements", () => {
      const mockNumberingRoot = {
        querySelectorAll: (selector: string) => {
          if (selector === "abstractNum") {
            return [
              {
                // Missing abstractNumId
                getAttribute: (attr: string) => null,
                querySelectorAll: () => []
              },
              {
                getAttribute: (attr: string) => attr === "abstractNumId" ? "1" : null,
                querySelectorAll: (lvlSelector: string) => {
                  if (lvlSelector === "lvl") {
                    return [{
                      // Missing ilvl
                      getAttribute: (attr: string) => null,
                      querySelector: () => null
                    }];
                  }
                  return [];
                }
              }
            ];
          }
          if (selector === "num") {
            return [
              {
                // Missing numId
                getAttribute: (attr: string) => null,
                querySelector: () => null
              },
              {
                getAttribute: (attr: string) => attr === "numId" ? "2" : null,
                querySelector: (innerSelector: string) => {
                  if (innerSelector === "abstractNumId") {
                    // abstractNumId element exists but has no val attribute
                    return { getAttribute: () => null };
                  }
                  return null;
                }
              }
            ];
          }
          return [];
        }
      } as any;

      const result = parseNumbering(mockNumberingRoot);
      
      // Should skip entries with missing required attributes
      expect(result.instances.size).toBe(0);
      expect(result.abstractFormats.size).toBe(0);
    });
  });

  describe("parseParagraph", () => {
    test("should parse paragraph with multiple runs and formatting", () => {
      const mockParagraph = {
        querySelectorAll: (selector: string) => {
          if (selector === "r") {
            return [
              {
                querySelectorAll: (innerSelector: string) => {
                  if (innerSelector === "t") {
                    return [{ textContent: "Bold text" }];
                  }
                  return [];
                },
                querySelector: (innerSelector: string) => {
                  if (innerSelector === "b") return {};
                  return null;
                }
              },
              {
                querySelectorAll: (innerSelector: string) => {
                  if (innerSelector === "t") {
                    return [{ textContent: "Italic text" }];
                  }
                  return [];
                },
                querySelector: (innerSelector: string) => {
                  if (innerSelector === "i") return {};
                  return null;
                }
              }
            ];
          }
          return [];
        },
        querySelector: (selector: string) => {
          if (selector === "pPr pStyle") {
            return { getAttribute: (attr: string) => attr === "val" ? "Heading1" : null };
          }
          if (selector === "pPr numPr") {
            return {
              querySelector: (innerSelector: string) => {
                if (innerSelector === "numId") {
                  return { getAttribute: (attr: string) => attr === "val" ? "1" : null };
                }
                if (innerSelector === "ilvl") {
                  return { getAttribute: (attr: string) => attr === "val" ? "0" : null };
                }
                return null;
              }
            };
          }
          return null;
        }
      } as any;

      const result = parseParagraph(mockParagraph);
      
      expect(result.type).toBe("paragraph");
      expect(result.style).toBe("Heading1");
      expect(result.numId).toBe("1");
      expect(result.ilvl).toBe(0);
      expect(result.runs).toHaveLength(2);
      expect(result.runs[0]).toMatchObject({
        text: "Bold text",
        bold: true
      });
      expect(result.runs[1]).toMatchObject({
        text: "Italic text",
        italic: true
      });
    });

    test("should handle paragraph with no numbering", () => {
      const mockParagraph = {
        querySelectorAll: (selector: string) => {
          if (selector === "r") {
            return [{
              querySelectorAll: (innerSelector: string) => {
                if (innerSelector === "t") {
                  return [{ textContent: "Plain text" }];
                }
                return [];
              },
              querySelector: () => null
            }];
          }
          return [];
        },
        querySelector: () => null
      } as any;

      const result = parseParagraph(mockParagraph);
      
      expect(result.numId).toBeUndefined();
      expect(result.ilvl).toBeUndefined();
      expect(result.style).toBeUndefined();
    });
  });
});