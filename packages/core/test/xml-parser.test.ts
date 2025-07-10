import { describe, test, expect, beforeAll } from "bun:test";
import { Effect } from "effect";
import {
  parseXmlString,
  createXmlParser,
  xmlParser,
  getElementByPath,
  getElementsByPath,
  EffectXmlParser,
  XmlParseError,
} from "../src/common/xml-parser";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  const window = new Window();
  (global as any).DOMParser = window.DOMParser;
  (global as any).Document = window.Document;
  (global as any).Element = window.Element;
  (global as any).Node = window.Node;
  (global as any).Attr = window.Attr;
});

describe("XML Parser", () => {
  describe("parseXmlString", () => {
    test("should parse valid XML", async () => {
      const xml = `<root><child>content</child></root>`;
      const doc = await Effect.runPromise(parseXmlString(xml));

      expect(doc).toBeDefined();
      expect(doc.documentElement.tagName).toBe("root");
    });

    test("should handle XML with BOM", async () => {
      const xml = `\uFEFF<root><child>content</child></root>`;
      const doc = await Effect.runPromise(parseXmlString(xml));

      expect(doc).toBeDefined();
      expect(doc.documentElement.tagName).toBe("root");
    });

    test("should handle namespaced XML", async () => {
      const xml = `<w:document xmlns:w="http://example.com"><w:body><w:p>text</w:p></w:body></w:document>`;
      const doc = await Effect.runPromise(parseXmlString(xml));

      expect(doc).toBeDefined();
      expect(doc.documentElement.tagName).toBe("w:document");
    });

    test("should fail on invalid XML", async () => {
      const xml = `<root><child>content</root>`;

      await expect(Effect.runPromise(parseXmlString(xml))).rejects.toThrow();
    });

    test("should fail on empty string", async () => {
      const xml = "";

      await expect(Effect.runPromise(parseXmlString(xml))).rejects.toThrow();
    });

    test("should handle XML with attributes", async () => {
      const xml = `<root attr="value"><child id="123">content</child></root>`;
      const doc = await Effect.runPromise(parseXmlString(xml));

      expect(doc.documentElement.getAttribute("attr")).toBe("value");
    });

    test.skip("should handle XML with CDATA", async () => {
      // Note: happy-dom's DOMParser doesn't support CDATA sections properly
      const xml = `<root><![CDATA[some content]]></root>`;
      const doc = await Effect.runPromise(parseXmlString(xml));

      expect(doc.documentElement.textContent).toBe("some content");
    });

    test("should handle XML with comments", async () => {
      const xml = `<root><!-- comment --><child>content</child></root>`;
      const doc = await Effect.runPromise(parseXmlString(xml));

      expect(doc.documentElement.tagName).toBe("root");
    });

    test("should return XmlParseError for malformed XML", async () => {
      const xml = `<root>`;

      await expect(Effect.runPromise(parseXmlString(xml))).rejects.toThrow("XML parsing");
    });
  });

  describe("EffectXmlParser", () => {
    let parser: EffectXmlParser;
    let doc: Document;
    let root: Element;

    beforeAll(async () => {
      parser = new EffectXmlParser();
      const xml = `
        <root xmlns:w="http://example.com" attr="value">
          <child1 id="1" enabled="true" count="42" hex="FF" float="3.14">Text1</child1>
          <child2 enabled="false" count="0">Text2</child2>
          <w:child3 w:val="namespaced">Text3</w:child3>
          <empty/>
          <parent>
            <nested>Deep</nested>
          </parent>
        </root>
      `;
      doc = await Effect.runPromise(parseXmlString(xml));
      root = doc.documentElement;
    });

    describe("element", () => {
      test("should find element by local name", () => {
        const child1 = parser.element(root, "child1");
        expect(child1).toBeTruthy();
        expect(child1?.tagName).toBe("child1");
      });

      test("should find namespaced element", () => {
        const child3 = parser.element(root, "child3");
        expect(child3).toBeTruthy();
        expect(child3?.tagName).toBe("w:child3");
      });

      test("should return null for non-existent element", () => {
        const notFound = parser.element(root, "nonexistent");
        expect(notFound).toBeNull();
      });

      test("should find first matching element", () => {
        const parent = parser.element(root, "parent");
        const nested = parser.element(parent!, "nested");
        expect(nested?.textContent).toBe("Deep");
      });
    });

    describe("elements", () => {
      test("should find all elements with local name", () => {
        const xml = `<root><item>1</item><item>2</item><item>3</item></root>`;
        const itemDoc = new DOMParser().parseFromString(xml, "application/xml");
        const items = parser.elements(itemDoc.documentElement, "item");

        expect(items).toHaveLength(3);
        expect(items[0]?.textContent).toBe("1");
        expect(items[2]?.textContent).toBe("3");
      });

      test("should find all child elements when no local name", () => {
        const elements = parser.elements(root);
        expect(elements.length).toBeGreaterThan(0);
        expect(elements.some((el) => el.tagName === "child1")).toBe(true);
        expect(elements.some((el) => el.tagName === "empty")).toBe(true);
      });

      test("should return empty array for no matches", () => {
        const elements = parser.elements(root, "nomatch");
        expect(elements).toEqual([]);
      });

      test("should handle namespaced elements", () => {
        const elements = parser.elements(root, "child3");
        expect(elements).toHaveLength(1);
        expect(elements[0]?.tagName).toBe("w:child3");
      });
    });

    describe("attr", () => {
      test("should get attribute value", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.attr(child1, "id")).toBe("1");
        expect(parser.attr(child1, "enabled")).toBe("true");
      });

      test("should get namespaced attribute", () => {
        const child3 = parser.element(root, "child3")!;
        expect(parser.attr(child3, "val")).toBe("namespaced");
      });

      test("should return null for non-existent attribute", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.attr(child1, "missing")).toBeNull();
      });

      test("should handle root attributes", () => {
        expect(parser.attr(root, "attr")).toBe("value");
      });
    });

    describe("attrs", () => {
      test("should get all attributes", () => {
        const child1 = parser.element(root, "child1")!;
        const attrs = parser.attrs(child1);

        expect(attrs.length).toBeGreaterThan(0);
        expect(attrs.some((attr) => attr.name === "id")).toBe(true);
        expect(attrs.some((attr) => attr.name === "enabled")).toBe(true);
      });

      test("should return empty array for element without attributes", () => {
        const empty = parser.element(root, "empty")!;
        const attrs = parser.attrs(empty);

        expect(attrs).toEqual([]);
      });
    });

    describe("intAttr", () => {
      test("should parse integer attribute", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.intAttr(child1, "count")).toBe(42);
      });

      test("should parse zero", () => {
        const child2 = parser.element(root, "child2")!;
        expect(parser.intAttr(child2, "count")).toBe(0);
      });

      test("should return null for non-numeric", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.intAttr(child1, "id")).toBe(1); // "1" parses to 1
        expect(parser.intAttr(child1, "enabled")).toBeNull();
      });

      test("should use default value", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.intAttr(child1, "missing", 99)).toBe(99);
      });

      test("should return null without default", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.intAttr(child1, "missing")).toBeNull();
      });
    });

    describe("floatAttr", () => {
      test("should parse float attribute", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.floatAttr(child1, "float")).toBe(3.14);
      });

      test("should parse integer as float", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.floatAttr(child1, "count")).toBe(42);
      });

      test("should return null for non-numeric", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.floatAttr(child1, "enabled")).toBeNull();
      });

      test("should use default value", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.floatAttr(child1, "missing", 2.5)).toBe(2.5);
      });
    });

    describe("boolAttr", () => {
      test("should parse true values", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.boolAttr(child1, "enabled")).toBe(true);
      });

      test("should parse false values", () => {
        const child2 = parser.element(root, "child2")!;
        expect(parser.boolAttr(child2, "enabled")).toBe(false);
      });

      test("should handle '1' as true", () => {
        const xml = `<el bool="1"/>`;
        const elDoc = new DOMParser().parseFromString(xml, "application/xml");
        expect(parser.boolAttr(elDoc.documentElement, "bool")).toBe(true);
      });

      test("should handle '0' as false", () => {
        const xml = `<el bool="0"/>`;
        const elDoc = new DOMParser().parseFromString(xml, "application/xml");
        expect(parser.boolAttr(elDoc.documentElement, "bool")).toBe(false);
      });

      test("should handle 'on' as true", () => {
        const xml = `<el bool="on"/>`;
        const elDoc = new DOMParser().parseFromString(xml, "application/xml");
        expect(parser.boolAttr(elDoc.documentElement, "bool")).toBe(true);
      });

      test("should use default value", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.boolAttr(child1, "missing", true)).toBe(true);
        expect(parser.boolAttr(child1, "missing", false)).toBe(false);
      });
    });

    describe("hexAttr", () => {
      test("should parse hex attribute", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.hexAttr(child1, "hex")).toBe(255);
      });

      test("should handle hex with prefix", () => {
        const xml = `<el color="0xFF00FF"/>`;
        const elDoc = new DOMParser().parseFromString(xml, "application/xml");
        expect(parser.hexAttr(elDoc.documentElement, "color")).toBe(0xff00ff);
      });

      test("should return null for invalid hex", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.hexAttr(child1, "enabled")).toBeNull();
      });

      test("should use default value", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.hexAttr(child1, "missing", 0xabcd)).toBe(0xabcd);
      });
    });

    describe("elementAttr", () => {
      test("should get attribute from child element", () => {
        expect(parser.elementAttr(root, "child1", "id")).toBe("1");
        expect(parser.elementAttr(root, "child2", "enabled")).toBe("false");
      });

      test("should return null if element not found", () => {
        expect(parser.elementAttr(root, "missing", "attr")).toBeNull();
      });

      test("should return null if attribute not found", () => {
        expect(parser.elementAttr(root, "child1", "missing")).toBeNull();
      });

      test("should handle namespaced elements", () => {
        expect(parser.elementAttr(root, "child3", "val")).toBe("namespaced");
      });
    });

    describe("textContent", () => {
      test("should get text content", () => {
        const child1 = parser.element(root, "child1")!;
        expect(parser.textContent(child1)).toBe("Text1");
      });

      test("should return empty string for empty element", () => {
        const empty = parser.element(root, "empty")!;
        expect(parser.textContent(empty)).toBe("");
      });

      test("should get nested text content", () => {
        const parent = parser.element(root, "parent")!;
        expect(parser.textContent(parent)).toContain("Deep");
      });
    });
  });

  describe("getElementByPath", () => {
    let doc: Document;
    let root: Element;

    beforeAll(async () => {
      const xml = `
        <root>
          <level1>
            <level2>
              <target>Found!</target>
            </level2>
          </level1>
        </root>
      `;
      doc = await Effect.runPromise(parseXmlString(xml));
      root = doc.documentElement;
    });

    test("should find element by path", () => {
      const target = getElementByPath(root, "level1/level2/target");
      expect(target?.textContent).toBe("Found!");
    });

    test("should handle paths starting with /", () => {
      const target = getElementByPath(root, "/level1/level2/target");
      expect(target?.textContent).toBe("Found!");
    });

    test("should handle empty path parts", () => {
      const target = getElementByPath(root, "level1//level2/target");
      expect(target?.textContent).toBe("Found!");
    });

    test("should return null for non-existent path", () => {
      const notFound = getElementByPath(root, "level1/missing/target");
      expect(notFound).toBeNull();
    });

    test("should work with custom parser", () => {
      const customParser = new EffectXmlParser();
      const target = getElementByPath(root, "level1/level2/target", customParser);
      expect(target?.textContent).toBe("Found!");
    });
  });

  describe("getElementsByPath", () => {
    let doc: Document;
    let root: Element;

    beforeAll(async () => {
      const xml = `
        <root>
          <items>
            <item>1</item>
            <item>2</item>
            <item>3</item>
          </items>
          <other>
            <item>4</item>
          </other>
        </root>
      `;
      doc = await Effect.runPromise(parseXmlString(xml));
      root = doc.documentElement;
    });

    test("should find multiple elements by path", () => {
      const items = getElementsByPath(root, "items/item");
      expect(items).toHaveLength(3);
      expect(items[0]?.textContent).toBe("1");
      expect(items[2]?.textContent).toBe("3");
    });

    test("should handle wildcard paths", () => {
      const allItems = getElementsByPath(root, "*/item");
      expect(allItems).toHaveLength(4); // 3 from items, 1 from other
    });

    test("should handle multiple wildcards", () => {
      const xml = `
        <root>
          <a><b><c>1</c></b></a>
          <x><y><c>2</c></y></x>
        </root>
      `;
      const wildDoc = new DOMParser().parseFromString(xml, "application/xml");
      const cs = getElementsByPath(wildDoc.documentElement, "*/*/c");
      expect(cs).toHaveLength(2);
    });

    test("should return empty array for no matches", () => {
      const notFound = getElementsByPath(root, "missing/path");
      expect(notFound).toEqual([]);
    });

    test("should work with custom parser", () => {
      const customParser = new EffectXmlParser();
      const items = getElementsByPath(root, "items/item", customParser);
      expect(items).toHaveLength(3);
    });
  });

  describe("createXmlParser", () => {
    test("should create new parser instance", () => {
      const parser1 = createXmlParser();
      const parser2 = createXmlParser();

      expect(parser1).toBeDefined();
      expect(parser2).toBeDefined();
      expect(parser1).not.toBe(parser2);
    });

    test("should create working parser", async () => {
      const parser = createXmlParser();
      const xml = `<test attr="value">content</test>`;
      const doc = await Effect.runPromise(parseXmlString(xml));

      expect(parser.attr(doc.documentElement, "attr")).toBe("value");
      expect(parser.textContent(doc.documentElement)).toBe("content");
    });
  });

  describe("xmlParser global instance", () => {
    test("should be defined", () => {
      expect(xmlParser).toBeDefined();
    });

    test("should work correctly", async () => {
      const xml = `<test id="123">text</test>`;
      const doc = await Effect.runPromise(parseXmlString(xml));

      expect(xmlParser.attr(doc.documentElement, "id")).toBe("123");
      expect(xmlParser.intAttr(doc.documentElement, "id")).toBe(123);
    });
  });

  describe("XmlParseError", () => {
    test("should have correct structure", () => {
      const error = new XmlParseError("Test error");
      expect(error._tag).toBe("XmlParseError");
      expect(error.message).toBe("Test error");
    });
  });

  describe("Edge cases", () => {
    test("should handle elements with text nodes between", async () => {
      const xml = `
        <root>
          Text before
          <child>Child text</child>
          Text after
        </root>
      `;
      const doc = await Effect.runPromise(parseXmlString(xml));
      const parser = new EffectXmlParser();
      const child = parser.element(doc.documentElement, "child");

      expect(child?.textContent).toBe("Child text");
    });

    test("should handle deeply nested structures", async () => {
      let xml = "<root>";
      for (let i = 0; i < 10; i++) {
        xml += `<level${i}>`;
      }
      xml += "Deep";
      for (let i = 9; i >= 0; i--) {
        xml += `</level${i}>`;
      }
      xml += "</root>";

      const doc = await Effect.runPromise(parseXmlString(xml));
      expect(doc.documentElement.textContent).toBe("Deep");
    });

    test("should handle special characters in content", async () => {
      const xml = `<root>&lt;test&gt; &amp; &quot;quoted&quot;</root>`;
      const doc = await Effect.runPromise(parseXmlString(xml));

      expect(doc.documentElement.textContent).toBe(`<test> & "quoted"`);
    });
  });
});
