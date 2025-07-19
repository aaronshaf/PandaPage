import { describe, it, expect } from "bun:test";
import "../../test-setup";
import { parseBookmarks, findBookmarkEnd, extractBookmarkText } from "./bookmark-parser";
import { WORD_NAMESPACE } from "./types";

describe("Bookmark Parser", () => {
  const parser = new DOMParser();

  describe("parseBookmarks", () => {
    it("should parse simple bookmark", () => {
      const xml = `
        <w:document xmlns:w="${WORD_NAMESPACE}">
          <w:body>
            <w:p>
              <w:bookmarkStart w:id="1" w:name="TestBookmark"/>
              <w:r><w:t>Bookmarked text</w:t></w:r>
              <w:bookmarkEnd w:id="1"/>
            </w:p>
          </w:body>
        </w:document>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const body = doc.getElementsByTagNameNS(WORD_NAMESPACE, "body")[0];

      const bookmarks = parseBookmarks(body, WORD_NAMESPACE);

      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0]).toEqual({
        type: "bookmark",
        id: "1",
        name: "TestBookmark",
        text: "Bookmarked text",
      });
    });

    it("should parse multiple bookmarks", () => {
      const xml = `
        <w:document xmlns:w="${WORD_NAMESPACE}">
          <w:body>
            <w:p>
              <w:bookmarkStart w:id="1" w:name="First"/>
              <w:r><w:t>First text</w:t></w:r>
              <w:bookmarkEnd w:id="1"/>
            </w:p>
            <w:p>
              <w:bookmarkStart w:id="2" w:name="Second"/>
              <w:r><w:t>Second text</w:t></w:r>
              <w:bookmarkEnd w:id="2"/>
            </w:p>
          </w:body>
        </w:document>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const body = doc.getElementsByTagNameNS(WORD_NAMESPACE, "body")[0];

      const bookmarks = parseBookmarks(body, WORD_NAMESPACE);

      expect(bookmarks).toHaveLength(2);
      expect(bookmarks[0].name).toBe("First");
      expect(bookmarks[0].text).toBe("First text");
      expect(bookmarks[1].name).toBe("Second");
      expect(bookmarks[1].text).toBe("Second text");
    });

    it("should handle bookmark without end element", () => {
      const xml = `
        <w:document xmlns:w="${WORD_NAMESPACE}">
          <w:body>
            <w:p>
              <w:bookmarkStart w:id="1" w:name="NoEnd"/>
              <w:r><w:t>Some text</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const body = doc.getElementsByTagNameNS(WORD_NAMESPACE, "body")[0];

      const bookmarks = parseBookmarks(body, WORD_NAMESPACE);

      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].name).toBe("NoEnd");
      expect(bookmarks[0].text).toBeUndefined();
    });

    it("should handle empty bookmark", () => {
      const xml = `
        <w:document xmlns:w="${WORD_NAMESPACE}">
          <w:body>
            <w:p>
              <w:bookmarkStart w:id="1" w:name="Empty"/>
              <w:bookmarkEnd w:id="1"/>
            </w:p>
          </w:body>
        </w:document>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const body = doc.getElementsByTagNameNS(WORD_NAMESPACE, "body")[0];

      const bookmarks = parseBookmarks(body, WORD_NAMESPACE);

      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].name).toBe("Empty");
      expect(bookmarks[0].text).toBe("");
    });

    it("should handle bookmark with missing id attribute", () => {
      const xml = `
        <w:document xmlns:w="${WORD_NAMESPACE}">
          <w:body>
            <w:p>
              <w:bookmarkStart w:name="NoId"/>
              <w:bookmarkEnd/>
            </w:p>
          </w:body>
        </w:document>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const body = doc.getElementsByTagNameNS(WORD_NAMESPACE, "body")[0];

      const bookmarks = parseBookmarks(body, WORD_NAMESPACE);

      expect(bookmarks).toHaveLength(0);
    });

    it("should handle bookmark with missing name attribute", () => {
      const xml = `
        <w:document xmlns:w="${WORD_NAMESPACE}">
          <w:body>
            <w:p>
              <w:bookmarkStart w:id="1"/>
              <w:bookmarkEnd w:id="1"/>
            </w:p>
          </w:body>
        </w:document>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const body = doc.getElementsByTagNameNS(WORD_NAMESPACE, "body")[0];

      const bookmarks = parseBookmarks(body, WORD_NAMESPACE);

      expect(bookmarks).toHaveLength(0);
    });

    it("should handle nested bookmarks", () => {
      const xml = `
        <w:document xmlns:w="${WORD_NAMESPACE}">
          <w:body>
            <w:p>
              <w:bookmarkStart w:id="1" w:name="Outer"/>
              <w:r><w:t>Outer start</w:t></w:r>
              <w:bookmarkStart w:id="2" w:name="Inner"/>
              <w:r><w:t> Inner text</w:t></w:r>
              <w:bookmarkEnd w:id="2"/>
              <w:r><w:t> Outer end</w:t></w:r>
              <w:bookmarkEnd w:id="1"/>
            </w:p>
          </w:body>
        </w:document>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const body = doc.getElementsByTagNameNS(WORD_NAMESPACE, "body")[0];

      const bookmarks = parseBookmarks(body, WORD_NAMESPACE);

      expect(bookmarks).toHaveLength(2);
      expect(bookmarks[0].name).toBe("Outer");
      expect(bookmarks[0].text).toBe("Outer start Inner text Outer end");
      expect(bookmarks[1].name).toBe("Inner");
      expect(bookmarks[1].text).toBe("Inner text");
    });
  });

  describe("findBookmarkEnd", () => {
    it("should find matching bookmark end", () => {
      const xml = `
        <w:document xmlns:w="${WORD_NAMESPACE}">
          <w:body>
            <w:p>
              <w:bookmarkStart w:id="1" w:name="Test"/>
              <w:bookmarkEnd w:id="1"/>
            </w:p>
          </w:body>
        </w:document>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const body = doc.getElementsByTagNameNS(WORD_NAMESPACE, "body")[0];

      const bookmarkEnd = findBookmarkEnd(body, "1", WORD_NAMESPACE);

      expect(bookmarkEnd).not.toBeNull();
      expect(bookmarkEnd?.getAttribute("w:id")).toBe("1");
    });

    it("should return null when no matching end found", () => {
      const xml = `
        <w:document xmlns:w="${WORD_NAMESPACE}">
          <w:body>
            <w:p>
              <w:bookmarkStart w:id="1" w:name="Test"/>
              <w:bookmarkEnd w:id="2"/>
            </w:p>
          </w:body>
        </w:document>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const body = doc.getElementsByTagNameNS(WORD_NAMESPACE, "body")[0];

      const bookmarkEnd = findBookmarkEnd(body, "1", WORD_NAMESPACE);

      expect(bookmarkEnd).toBeNull();
    });

    it("should handle multiple bookmark ends", () => {
      const xml = `
        <w:document xmlns:w="${WORD_NAMESPACE}">
          <w:body>
            <w:p>
              <w:bookmarkEnd w:id="2"/>
              <w:bookmarkEnd w:id="3"/>
              <w:bookmarkEnd w:id="1"/>
            </w:p>
          </w:body>
        </w:document>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const body = doc.getElementsByTagNameNS(WORD_NAMESPACE, "body")[0];

      const bookmarkEnd = findBookmarkEnd(body, "3", WORD_NAMESPACE);

      expect(bookmarkEnd).not.toBeNull();
      expect(bookmarkEnd?.getAttribute("w:id")).toBe("3");
    });
  });

  describe("extractBookmarkText", () => {
    it("should extract text between bookmark elements", () => {
      const xml = `
        <w:p xmlns:w="${WORD_NAMESPACE}">
          <w:bookmarkStart w:id="1" w:name="Test"/>
          <w:r><w:t>Hello</w:t></w:r>
          <w:r><w:t> </w:t></w:r>
          <w:r><w:t>World</w:t></w:r>
          <w:bookmarkEnd w:id="1"/>
        </w:p>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const para = doc.documentElement;
      const bookmarkStart = para.getElementsByTagNameNS(WORD_NAMESPACE, "bookmarkStart")[0];
      const bookmarkEnd = para.getElementsByTagNameNS(WORD_NAMESPACE, "bookmarkEnd")[0];

      const text = extractBookmarkText(bookmarkStart, bookmarkEnd);

      expect(text).toBe("Hello World");
    });

    it("should handle empty text between bookmarks", () => {
      const xml = `
        <w:p xmlns:w="${WORD_NAMESPACE}">
          <w:bookmarkStart w:id="1" w:name="Test"/>
          <w:bookmarkEnd w:id="1"/>
        </w:p>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const para = doc.documentElement;
      const bookmarkStart = para.getElementsByTagNameNS(WORD_NAMESPACE, "bookmarkStart")[0];
      const bookmarkEnd = para.getElementsByTagNameNS(WORD_NAMESPACE, "bookmarkEnd")[0];

      const text = extractBookmarkText(bookmarkStart, bookmarkEnd);

      expect(text).toBe("");
    });

    it("should skip non-run elements", () => {
      const xml = `
        <w:p xmlns:w="${WORD_NAMESPACE}">
          <w:bookmarkStart w:id="1" w:name="Test"/>
          <w:r><w:t>Text</w:t></w:r>
          <w:pPr><w:spacing w:after="200"/></w:pPr>
          <w:r><w:t> More</w:t></w:r>
          <w:bookmarkEnd w:id="1"/>
        </w:p>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const para = doc.documentElement;
      const bookmarkStart = para.getElementsByTagNameNS(WORD_NAMESPACE, "bookmarkStart")[0];
      const bookmarkEnd = para.getElementsByTagNameNS(WORD_NAMESPACE, "bookmarkEnd")[0];

      const text = extractBookmarkText(bookmarkStart, bookmarkEnd);

      expect(text).toBe("Text More");
    });

    it("should handle multiple text nodes in a run", () => {
      const xml = `
        <w:p xmlns:w="${WORD_NAMESPACE}">
          <w:bookmarkStart w:id="1" w:name="Test"/>
          <w:r>
            <w:t>First</w:t>
            <w:t> Second</w:t>
            <w:t> Third</w:t>
          </w:r>
          <w:bookmarkEnd w:id="1"/>
        </w:p>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const para = doc.documentElement;
      const bookmarkStart = para.getElementsByTagNameNS(WORD_NAMESPACE, "bookmarkStart")[0];
      const bookmarkEnd = para.getElementsByTagNameNS(WORD_NAMESPACE, "bookmarkEnd")[0];

      const text = extractBookmarkText(bookmarkStart, bookmarkEnd);

      expect(text).toBe("First Second Third");
    });

    it("should handle runs with no text elements", () => {
      const xml = `
        <w:p xmlns:w="${WORD_NAMESPACE}">
          <w:bookmarkStart w:id="1" w:name="Test"/>
          <w:r><w:rPr><w:b/></w:rPr></w:r>
          <w:r><w:t>Actual text</w:t></w:r>
          <w:bookmarkEnd w:id="1"/>
        </w:p>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const para = doc.documentElement;
      const bookmarkStart = para.getElementsByTagNameNS(WORD_NAMESPACE, "bookmarkStart")[0];
      const bookmarkEnd = para.getElementsByTagNameNS(WORD_NAMESPACE, "bookmarkEnd")[0];

      const text = extractBookmarkText(bookmarkStart, bookmarkEnd);

      expect(text).toBe("Actual text");
    });

    it("should trim whitespace from extracted text", () => {
      const xml = `
        <w:p xmlns:w="${WORD_NAMESPACE}">
          <w:bookmarkStart w:id="1" w:name="Test"/>
          <w:r><w:t>  Trimmed  </w:t></w:r>
          <w:bookmarkEnd w:id="1"/>
        </w:p>
      `;
      const doc = parser.parseFromString(xml, "application/xml");
      const para = doc.documentElement;
      const bookmarkStart = para.getElementsByTagNameNS(WORD_NAMESPACE, "bookmarkStart")[0];
      const bookmarkEnd = para.getElementsByTagNameNS(WORD_NAMESPACE, "bookmarkEnd")[0];

      const text = extractBookmarkText(bookmarkStart, bookmarkEnd);

      expect(text).toBe("Trimmed");
    });
  });
});
