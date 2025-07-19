import { describe, it, expect } from "bun:test";
import { Effect } from "effect";
import "../../test-setup";
import {
  parseNumberingXml,
  getListType,
  getListText,
  getNumberingFormat,
  type NumberingDefinition,
} from "./numbering-parser";
import { WORD_NAMESPACE } from "./types";

describe("Numbering Parser", () => {
  describe("parseNumberingXml", () => {
    it("should parse simple bullet list definition", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:numbering xmlns:w="${WORD_NAMESPACE}">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="bullet"/>
              <w:lvlText w:val="•"/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="0"/>
          </w:num>
        </w:numbering>`;

      const result = await Effect.runPromise(parseNumberingXml(xml));

      expect(result.instances.get("1")).toBe("0");
      expect(result.abstractFormats.get("0")?.levels.get(0)?.numFmt).toBe("bullet");
      expect(result.abstractFormats.get("0")?.levels.get(0)?.lvlText).toBe("•");
    });

    it("should parse numbered list definition", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:numbering xmlns:w="${WORD_NAMESPACE}">
          <w:abstractNum w:abstractNumId="1">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
            <w:lvl w:ilvl="1">
              <w:numFmt w:val="lowerLetter"/>
              <w:lvlText w:val="%2)"/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="2">
            <w:abstractNumId w:val="1"/>
          </w:num>
        </w:numbering>`;

      const result = await Effect.runPromise(parseNumberingXml(xml));

      expect(result.instances.get("2")).toBe("1");
      expect(result.abstractFormats.get("1")?.levels.get(0)?.numFmt).toBe("decimal");
      expect(result.abstractFormats.get("1")?.levels.get(0)?.lvlText).toBe("%1.");
      expect(result.abstractFormats.get("1")?.levels.get(1)?.numFmt).toBe("lowerLetter");
      expect(result.abstractFormats.get("1")?.levels.get(1)?.lvlText).toBe("%2)");
    });

    it("should parse multiple numbering definitions", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:numbering xmlns:w="${WORD_NAMESPACE}">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="bullet"/>
              <w:lvlText w:val="•"/>
            </w:lvl>
          </w:abstractNum>
          <w:abstractNum w:abstractNumId="1">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="0"/>
          </w:num>
          <w:num w:numId="2">
            <w:abstractNumId w:val="1"/>
          </w:num>
        </w:numbering>`;

      const result = await Effect.runPromise(parseNumberingXml(xml));

      expect(result.instances.size).toBe(2);
      expect(result.abstractFormats.size).toBe(2);
      expect(result.instances.get("1")).toBe("0");
      expect(result.instances.get("2")).toBe("1");
    });

    it("should handle style links", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:numbering xmlns:w="${WORD_NAMESPACE}">
          <w:abstractNum w:abstractNumId="0">
            <w:styleLink w:val="ListBullet"/>
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="bullet"/>
              <w:lvlText w:val="•"/>
            </w:lvl>
          </w:abstractNum>
          <w:abstractNum w:abstractNumId="1">
            <w:styleLink w:val="ListBullet"/>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="1"/>
          </w:num>
        </w:numbering>`;

      const result = await Effect.runPromise(parseNumberingXml(xml));

      expect(result.abstractFormats.get("1")?.levels.get(0)?.numFmt).toBe("bullet");
      expect(result.abstractFormats.get("1")?.levels.get(0)?.lvlText).toBe("•");
    });

    it("should handle numStyleLink", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:numbering xmlns:w="${WORD_NAMESPACE}">
          <w:abstractNum w:abstractNumId="0">
            <w:styleLink w:val="ListNumber"/>
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
          </w:abstractNum>
          <w:abstractNum w:abstractNumId="1">
            <w:styleLink w:val="ListNumber"/>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="1"/>
          </w:num>
        </w:numbering>`;

      const result = await Effect.runPromise(parseNumberingXml(xml));

      expect(result.abstractFormats.get("1")?.levels.get(0)?.numFmt).toBe("decimal");
      expect(result.abstractFormats.get("1")?.levels.get(0)?.lvlText).toBe("%1.");
    });

    it("should handle elements without namespaces", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <numbering>
          <abstractNum abstractNumId="0">
            <lvl ilvl="0">
              <numFmt val="bullet"/>
              <lvlText val="•"/>
            </lvl>
          </abstractNum>
          <num numId="1">
            <abstractNumId val="0"/>
          </num>
        </numbering>`;

      const result = await Effect.runPromise(parseNumberingXml(xml));

      expect(result.instances.get("1")).toBe("0");
      expect(result.abstractFormats.get("0")?.levels.get(0)?.numFmt).toBe("bullet");
    });

    it("should handle missing attributes gracefully", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:numbering xmlns:w="${WORD_NAMESPACE}">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:numFmt/>
              <w:lvlText/>
            </w:lvl>
          </w:abstractNum>
          <w:abstractNum>
            <w:lvl>
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="0"/>
          </w:num>
          <w:num>
            <w:abstractNumId w:val="0"/>
          </w:num>
        </w:numbering>`;

      const result = await Effect.runPromise(parseNumberingXml(xml));

      expect(result.instances.get("1")).toBe("0");
      expect(result.abstractFormats.get("0")?.levels.get(0)?.numFmt).toBe("bullet"); // Default
      expect(result.abstractFormats.get("0")?.levels.get(0)?.lvlText).toBe("•"); // Default
    });

    it("should handle empty numbering file", async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:numbering xmlns:w="${WORD_NAMESPACE}">
        </w:numbering>`;

      const result = await Effect.runPromise(parseNumberingXml(xml));

      expect(result.instances.size).toBe(0);
      expect(result.abstractFormats.size).toBe(0);
    });
  });

  describe("getListType", () => {
    const mockNumberingDef: NumberingDefinition = {
      instances: new Map([
        ["1", "0"],
        ["2", "1"],
      ]),
      abstractFormats: new Map([
        ["0", { levels: new Map([[0, { numFmt: "bullet", lvlText: "•" }]]) }],
        ["1", { levels: new Map([[0, { numFmt: "decimal", lvlText: "%1." }]]) }],
      ]),
    };

    it("should return bullet for bullet format", () => {
      expect(getListType("1", 0, mockNumberingDef)).toBe("bullet");
    });

    it("should return number for decimal format", () => {
      expect(getListType("2", 0, mockNumberingDef)).toBe("number");
    });

    it("should return number for unknown numId", () => {
      expect(getListType("999", 0, mockNumberingDef)).toBe("number");
    });

    it("should return number for undefined parameters", () => {
      expect(getListType(undefined, 0, mockNumberingDef)).toBe("number");
      expect(getListType("1", undefined, mockNumberingDef)).toBe("number");
      expect(getListType("1", 0, undefined)).toBe("number");
    });

    it("should return number for missing level", () => {
      expect(getListType("1", 5, mockNumberingDef)).toBe("number");
    });
  });

  describe("getListText", () => {
    const mockNumberingDef: NumberingDefinition = {
      instances: new Map([
        ["1", "0"],
        ["2", "1"],
      ]),
      abstractFormats: new Map([
        ["0", { levels: new Map([[0, { numFmt: "bullet", lvlText: "•" }]]) }],
        ["1", { levels: new Map([[0, { numFmt: "decimal", lvlText: "%1." }]]) }],
      ]),
    };

    it("should return correct list text for bullet", () => {
      expect(getListText("1", 0, mockNumberingDef)).toBe("•");
    });

    it("should return correct list text for numbered", () => {
      expect(getListText("2", 0, mockNumberingDef)).toBe("%1.");
    });

    it("should return undefined for unknown numId", () => {
      expect(getListText("999", 0, mockNumberingDef)).toBeUndefined();
    });

    it("should return undefined for undefined parameters", () => {
      expect(getListText(undefined, 0, mockNumberingDef)).toBeUndefined();
      expect(getListText("1", undefined, mockNumberingDef)).toBeUndefined();
      expect(getListText("1", 0, undefined)).toBeUndefined();
    });
  });

  describe("getNumberingFormat", () => {
    const mockNumberingDef: NumberingDefinition = {
      instances: new Map([
        ["1", "0"],
        ["2", "1"],
      ]),
      abstractFormats: new Map([
        ["0", { levels: new Map([[0, { numFmt: "bullet", lvlText: "•" }]]) }],
        ["1", { levels: new Map([[0, { numFmt: "decimal", lvlText: "%1." }]]) }],
      ]),
    };

    it("should return correct numbering format for bullet", () => {
      expect(getNumberingFormat("1", 0, mockNumberingDef)).toBe("bullet");
    });

    it("should return correct numbering format for decimal", () => {
      expect(getNumberingFormat("2", 0, mockNumberingDef)).toBe("decimal");
    });

    it("should return undefined for unknown numId", () => {
      expect(getNumberingFormat("999", 0, mockNumberingDef)).toBeUndefined();
    });

    it("should return undefined for undefined parameters", () => {
      expect(getNumberingFormat(undefined, 0, mockNumberingDef)).toBeUndefined();
      expect(getNumberingFormat("1", undefined, mockNumberingDef)).toBeUndefined();
      expect(getNumberingFormat("1", 0, undefined)).toBeUndefined();
    });
  });
});
