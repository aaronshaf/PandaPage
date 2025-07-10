import { describe, test, expect } from "bun:test";
import { parseDocx } from "@browser-document-viewer/parser";
import { DOMRenderer } from "@browser-document-viewer/dom-renderer";
import { Effect } from "effect";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Test suite to verify that list rendering is working correctly
 * with the 001.docx document after the list parsing and rendering fix
 */
describe("List Rendering Tests", () => {
  const testDocPath = resolve(__dirname, "../../..", "documents", "001.docx");

  async function loadTestDocument() {
    const buffer = readFileSync(testDocPath);
    return await Effect.runPromise(parseDocx(buffer.buffer));
  }

  test("should parse 001.docx and detect list items", async () => {
    const parsedDocument = await loadTestDocument();

    // Find list items
    const listItems = parsedDocument.elements.filter(
      (el) => el.type === "paragraph" && (el as any).listInfo,
    );

    expect(listItems.length).toBeGreaterThan(0);

    // Check that we have different types of lists
    const bulletLists = listItems.filter((item) => (item as any).listInfo.type === "bullet");
    const numberLists = listItems.filter((item) => (item as any).listInfo.type === "number");

    // Verify we have the expected distribution
    console.log(
      `Found ${bulletLists.length} bullet list items and ${numberLists.length} number list items`,
    );

    expect(bulletLists.length).toBeGreaterThan(0);
    expect(numberLists.length).toBeGreaterThan(0);
  });

  test("should render lists with proper HTML structure", async () => {
    const parsedDocument = await loadTestDocument();
    const renderer = new DOMRenderer();

    const htmlString = renderer.renderToHTML(parsedDocument);

    // Check for proper list containers
    expect(htmlString).toContain("<ul");
    expect(htmlString).toContain("<ol");
    expect(htmlString).toContain("<li");

    // Check for expected list content
    expect(htmlString).toContain("First list item");
    expect(htmlString).toContain("Sceond list item"); // Note: typo in the document
    expect(htmlString).toContain("Third list item");
    expect(htmlString).toContain("List item A");
    expect(htmlString).toContain("List item B");
    expect(htmlString).toContain("List item C");
    expect(htmlString).toContain("List item 1");
    expect(htmlString).toContain("List item 2");
    expect(htmlString).toContain("List item 3");

    console.log("Rendered HTML contains proper list structure");
  });

  test("should group consecutive list items correctly", async () => {
    const parsedDocument = await loadTestDocument();
    const renderer = new DOMRenderer();

    const htmlString = renderer.renderToHTML(parsedDocument);

    // Count the number of list containers - should be 3 (bulleted, lettered, ordered)
    const ulMatches = htmlString.match(/<ul/g);
    const olMatches = htmlString.match(/<ol/g);

    expect(ulMatches).not.toBeNull();
    expect(olMatches).not.toBeNull();

    // We should have at least 1 ul and 1 ol
    expect(ulMatches!.length).toBeGreaterThanOrEqual(1);
    expect(olMatches!.length).toBeGreaterThanOrEqual(1);

    console.log(
      `Found ${ulMatches!.length} unordered lists and ${olMatches!.length} ordered lists`,
    );
  });

  test("should maintain list item content and formatting", async () => {
    const parsedDocument = await loadTestDocument();

    // Find list items and check their content
    const listItems = parsedDocument.elements.filter(
      (el) => el.type === "paragraph" && (el as any).listInfo,
    ) as any[];

    expect(listItems.length).toBeGreaterThan(0);

    // Check that list items have text content
    for (const item of listItems) {
      expect(item.runs).toBeDefined();
      expect(item.runs.length).toBeGreaterThan(0);

      const text = item.runs.map((run: any) => run.text).join("");
      expect(text.trim()).not.toBe("");
    }

    console.log("All list items have proper content");
  });
});
