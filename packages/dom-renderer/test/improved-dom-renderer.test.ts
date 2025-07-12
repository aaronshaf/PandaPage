import { describe, it, expect, beforeEach } from "bun:test";
import { EnhancedDOMRenderer } from "../src/improved-dom-renderer";
import type { ParsedDocument } from "@browser-document-viewer/parser";
import { readFileSync } from "fs";
import { join } from "path";
import { parseDocxDocument } from "../../core/src/wrappers";

describe("EnhancedDOMRenderer", () => {
  let renderer: EnhancedDOMRenderer;

  beforeEach(() => {
    renderer = new EnhancedDOMRenderer({
      enableDropcaps: true,
      enableAdvancedFormatting: true,
    });
  });

  it("should render complex formatting with colors and highlights", () => {
    const doc: ParsedDocument = {
      metadata: {},
      elements: [
        {
          type: "paragraph",
          runs: [
            { text: "Normal text, ", bold: false },
            { text: "red text", color: "#FF0000", bold: false },
            { text: ", ", bold: false },
            { text: "green text", color: "#92D050", bold: false },
            { text: ", ", bold: false },
            { text: "blue text", color: "#0070C0", bold: false },
            { text: ", ", bold: false },
            { text: "highlighted", highlightColor: "yellow", bold: false },
          ],
        },
      ],
    };

    const html = renderer.renderToHTML(doc);

    expect(html).toContain('style="color: #FF0000;"');
    expect(html).toContain('style="color: #92D050;"');
    expect(html).toContain('style="color: #0070C0;"');
    expect(html).toContain('style="background-color: #ffff00;"');
  });

  it("should render advanced text effects", () => {
    const doc: ParsedDocument = {
      metadata: {},
      elements: [
        {
          type: "paragraph",
          runs: [
            { text: "Shadow", shadow: true, bold: false },
            { text: " Outline", outline: true, bold: false },
            { text: " Emboss", emboss: true, bold: false },
            { text: " SmallCaps", smallCaps: true, bold: false },
            { text: " ALLCAPS", caps: true, bold: false },
          ],
        },
      ],
    };

    const html = renderer.renderToHTML(doc);

    expect(html).toContain("text-shadow: 1px 1px 2px rgba(0,0,0,0.5)");
    expect(html).toContain("-webkit-text-stroke: 1px currentColor");
    expect(html).toContain("color: transparent"); // For outline effect
    expect(html).toContain("font-variant: small-caps");
    expect(html).toContain("text-transform: uppercase");
  });

  it("should render dropcaps for appropriate paragraphs", () => {
    const doc: ParsedDocument = {
      metadata: {},
      elements: [
        {
          type: "paragraph",
          style: "Normal",
          runs: [
            {
              text: "Drop caps are used to emphasize the leading paragraph at the start of a section. This is a long enough paragraph to trigger dropcap detection.",
              bold: false,
            },
          ],
        },
      ],
    };

    const html = renderer.renderToHTML(doc);

    expect(html).toContain("float: left");
    expect(html).toContain("font-size: 3em");
    expect(html).toContain('<span style="float: left; font-size: 3em; line-height: 0.8; margin: 0px 0.1em 0px 0px; font-weight: bold;">D</span>');
  });

  it("should render enhanced tables with proper styling", () => {
    const doc: ParsedDocument = {
      metadata: {},
      elements: [
        {
          type: "table",
          rows: [
            {
              cells: [
                {
                  paragraphs: [{ type: "paragraph", runs: [{ text: "Header 1", bold: true }] }],
                  isHeader: true,
                },
                {
                  paragraphs: [{ type: "paragraph", runs: [{ text: "Header 2", bold: true }] }],
                  isHeader: true,
                },
              ],
            },
            {
              cells: [
                { paragraphs: [{ type: "paragraph", runs: [{ text: "Cell 1", bold: false }] }] },
                { paragraphs: [{ type: "paragraph", runs: [{ text: "Cell 2", bold: false }] }] },
              ],
            },
          ],
        },
      ],
    };

    const html = renderer.renderToHTML(doc);

    expect(html).toContain("table-fancy");
    expect(html).toContain("<th>");
    expect(html).toContain("<td>");
  });

  it("should render footnotes with proper references and section", () => {
    const doc: ParsedDocument = {
      metadata: {},
      elements: [
        {
          type: "paragraph",
          runs: [{ text: "Text with footnote", bold: false }],
        },
        {
          type: "footnoteReference",
          id: "1",
        },
        {
          type: "footnote",
          id: "1",
          runs: [{ text: "This is the footnote content", bold: false }],
        },
      ],
    };

    const html = renderer.renderToHTML(doc);

    expect(html).toContain("footnote-marker");
    expect(html).toContain("footnote-section");
    expect(html).toContain("Text with footnote");
    expect(html).toContain('href="#footnote-1"');
  });

  it("should handle merged table cells", () => {
    const doc: ParsedDocument = {
      metadata: {},
      elements: [
        {
          type: "table",
          rows: [
            {
              cells: [
                {
                  paragraphs: [{ type: "paragraph", runs: [{ text: "Merged Cell", bold: false }] }],
                  rowspan: 2,
                  colspan: 2,
                },
                { paragraphs: [{ type: "paragraph", runs: [{ text: "Normal", bold: false }] }] },
              ],
            },
            {
              cells: [
                {
                  paragraphs: [
                    { type: "paragraph", runs: [{ text: "Below merged", bold: false }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const html = renderer.renderToHTML(doc);

    // Check if rowspan/colspan attributes are being set correctly
    // The DOM might use 'rowSpan' and 'colSpan' (camelCase) instead of lowercase
    const hasRowspan = html.includes('rowspan="2"') || html.includes('rowSpan="2"');
    const hasColspan = html.includes('colspan="2"') || html.includes('colSpan="2"');

    expect(hasRowspan).toBe(true);
    expect(hasColspan).toBe(true);
    expect(html).toContain("cell-merged");
  });

  it("should render 005.docx with enhanced formatting", async () => {
    const docPath = join(__dirname, "../../../documents/005.docx");
    const fileBuffer = readFileSync(docPath);
    const buffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength,
    );

    const doc = await parseDocxDocument(buffer);
    const html = renderer.renderToHTML(doc);

    // Check for various formatting features
    expect(html).toContain("document-container");
    expect(html).toContain("table-fancy");
    expect(html).toContain('style="color: #');
    expect(html.length).toBeGreaterThan(10000); // Should be substantial

    // Save output for inspection in temp directory
    const { writeFileSync, mkdtempSync } = await import("fs");
    const { tmpdir } = await import("os");
    const tempDir = mkdtempSync(join(tmpdir(), "dom-renderer-test-"));
    const outputPath = join(tempDir, "005-enhanced-dom.html");
    writeFileSync(outputPath, html);
    console.log(`Test output saved to: ${outputPath}`);
  });
});
